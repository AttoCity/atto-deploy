/* eslint-disable @typescript-eslint/no-unused-vars */
// deno-lint-ignore-file ban-types no-unused-vars
import { RpcMethod, RpcMethods, RpcProtocol } from './RpcProtocol.ts'
import { RpcWire } from './RpcWire.ts'

export type RpcMethodFunctionDefinition<M extends RpcMethods> = {
  [K in keyof M]: M[K] extends RpcMethod<infer A, infer R>
    ? (...args: A) => Promise<R>
    : M[K] extends RpcMethods
    ? RpcMethodFunctionDefinition<M[K]>
    : never
}

export type ConnectWire<T extends RpcProtocol> = RpcMethodFunctionDefinition<T['server']> & {
  on: RpcMethodFunctionDefinition<T['client']>
}
export type ConnectedWire<P extends RpcProtocol, T extends new (...args: any[]) => RpcWire> = ConnectWire<P> &
  InstanceType<T>

function castPath(path: string | string[]) {
  if (Array.isArray(path)) return path
  return path.split('.')
}

function getPath(target: any, inputPath: string | string[]) {
  const path = castPath(inputPath)
  while (path.length > 0) {
    if (!target) return
    if (typeof target !== 'object') return

    const key = path.shift()!
    if (!Object.prototype.hasOwnProperty.call(target, key)) return
    target = target[key]
  }
  return target
}

function setPath(target: any, inputPath: string | string[], value: any) {
  const path = castPath(inputPath)
  if (!target) throw new Error('Invalid target')
  if (!path.length) throw new Error('Invalid path')

  const last = path.pop()!
  while (path.length > 0) {
    const key = path.shift()!
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      const next = Object.create(null)
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value: next,
        writable: true,
      })
      target = next
    } else {
      const next = target[key]
      if (!next || typeof next !== 'object') throw new Error('Path already exist with unsafe type')
      target = next
    }
  }
  Object.defineProperty(target, last, {
    configurable: true,
    enumerable: true,
    value: value,
    writable: true,
  })
}

export function connectWire<P extends RpcProtocol, T extends new (...args: any[]) => RpcWire>(protocol: P, wire: T) {
  const base = class ConnectedWireBase extends wire {
    protected rpcSocketClose(message?: string, code?: number): void {
      wire.prototype.rpcSocketClose.call(this, message, code)
    }
    protected rpcSocketSend(data: Uint8Array): Promise<void> {
      return wire.prototype.rpcSocketSend.call(this, data)
    }

    public constructor(...args: any[]) {
      super(...args)

      for (const [key, fn] of serverMethods) {
        setPath(this, key, fn.bind(this))
      }
    }

    public async rpcRunMethod(name: string, args: any[]): Promise<any> {
      if (!Object.prototype.hasOwnProperty.call(protocol.flattenClient, name)) {
        console.log(protocol)
        throw new Error(`Method ${name} Not Found`)
      }

      const decoded: any[] = args

      const fn = getPath((this as ConnectedWire<P, T>).on, name)
      if (typeof fn !== 'function') throw new Error('Invalid Method')
      const result = await fn.apply(this, decoded)
      return result
    }
  }
  const klass = base as unknown as {
    new (...args: T extends new (...args: infer R) => any ? R : never): ConnectedWire<P, T>
    prototype: ConnectedWire<P, T>
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  const serverMethods: Array<[string, Function]> = []
  for (const [path, method] of Object.entries(protocol.flattenServer)) {
    const fn = async function connectedRemoteFunction(this: RpcWire, ...args: any[]) {
      return await this.rpcCall(path, args)
    }
    setPath(klass.prototype, path, fn)
    serverMethods.push([path, fn])
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const notImplemented = async function connectedNotImplementedHandler() {
    throw new Error('Method Not Implemented')
  }
  const on = (klass.prototype.on = Object.create(null))
  for (const [path] of Object.entries(protocol.flattenClient)) {
    setPath(on, path, notImplemented)
  }

  return klass
}

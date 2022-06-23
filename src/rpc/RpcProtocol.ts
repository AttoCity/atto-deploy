/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
export const rpcMethodBrand = Symbol.for('@orz/rpc/rpcMethodBrand')

export type RpcMethod<Arguments extends any[], Return extends any> = {
  [rpcMethodBrand]: true
}
export type AnyRpcMethod = RpcMethod<any, any>

export function rpcMethod<Arguments extends any[], Return extends any>(): RpcMethod<Arguments, Return> {
  return { [rpcMethodBrand]: true }
}

export type RpcMethods = {
  [K: string]: AnyRpcMethod | RpcMethods
}

export function isRpcMethod(t: any): t is AnyRpcMethod {
  return t && rpcMethodBrand in t && t[rpcMethodBrand] === true
}

export function getFlattenRpcMethods(methods: RpcMethods, prefix = '') {
  const result: Record<string, AnyRpcMethod> = Object.create(null)
  for (const [key, value] of Object.entries(methods)) {
    const fullKey = `${prefix}${key}`
    if (
      fullKey.startsWith('rpc') ||
      fullKey.startsWith('on.') ||
      fullKey === 'on' ||
      fullKey === 'logger' ||
      !key.match(/^[a-z][a-zA-Z0-9]*$/)
    ) {
      throw new Error(`Invalid RPC method name: ${fullKey}`)
    }

    if (isRpcMethod(value)) {
      result[`${fullKey}`] = value
    } else {
      Object.assign(result, getFlattenRpcMethods(value, `${fullKey}.`))
    }
  }
  return result
}

export function rpcProtocol<T extends RpcProtocolInput>(i: T): T & RpcProtocolMeta {
  return {
    ...i,
    flattenServer: getFlattenRpcMethods(i.server),
    flattenClient: getFlattenRpcMethods(i.client),
  }
}

export type RpcProtocolInput = {
  server: RpcMethods
  client: RpcMethods
}

export type RpcProtocolMeta = {
  flattenServer: Record<string, AnyRpcMethod>
  flattenClient: Record<string, AnyRpcMethod>
}

export type RpcProtocol = RpcProtocolInput & RpcProtocolMeta

import { RpcProtocol } from './RpcProtocol.ts'

export type ReverseProtocol<T extends RpcProtocol> = Omit<T, 'server' | 'client'> & {
  client: T['server']
  server: T['client']
}

export function reverseProtocol<P extends RpcProtocol>(protocol: P): ReverseProtocol<P> {
  return {
    ...protocol,
    server: protocol.client,
    client: protocol.server,
    flattenServer: protocol.flattenClient,
    flattenClient: protocol.flattenServer,
  }
}

import { rpcMethod, rpcProtocol } from '@/rpc/index.ts'

export const transtreamProtocol = rpcProtocol({
  server: {
    start: rpcMethod<[], void>(),
    pull: rpcMethod<[], void>(),
    cancel: rpcMethod<[], void>(),
  },
  client: {
    enqueue: rpcMethod<[ArrayBuffer], void>(),
    close: rpcMethod<[], void>(),
    error: rpcMethod<[string], void>(),
  },
})

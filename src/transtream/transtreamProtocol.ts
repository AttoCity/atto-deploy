import { rpcMethod, rpcProtocol } from 'https://esm.sh/@orz/rpc@2.1.3'

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

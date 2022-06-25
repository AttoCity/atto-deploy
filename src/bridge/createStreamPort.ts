import { TranstreamServer } from '../transtream/index.ts'

export function createStreamPort(stream: ReadableStream<Uint8Array>): MessagePort {
  const ts = new TranstreamServer()
  ts.putStream(stream)
  return ts.remotePort
}

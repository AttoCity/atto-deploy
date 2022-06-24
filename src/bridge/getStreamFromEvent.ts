import { TranstreamClient } from '../transtream/index.ts'

export function getStreamFromEvent(e: MessageEvent, index = 0) {
  const port = e.ports[index]
  if (!port) {
    return null
  }
  const client = new TranstreamClient(port)
  return client.getStream()
}

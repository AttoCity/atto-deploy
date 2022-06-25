import createDefer from '../utils/pDefer.ts'
import { BridgeEvent } from './events.ts'
import { getStreamFromEvent } from './getStreamFromEvent.ts'
import { serializeRequest } from './serialize.ts'
import type { ConnInfo } from '../deps.ts'

export function postRequestToWorker(worker: Worker, request: Request, connInfo: ConnInfo) {
  const responseDefer = createDefer<Response>()

  const responseChannel = new MessageChannel()
  responseChannel.port1.onmessage = (e) => {
    const data = e.data as BridgeEvent
    if (data.event === 'response') {
      const stream = getStreamFromEvent(e)
      const response = new Response(stream, data.response)
      responseDefer.resolve(response)
    } else {
      console.error('unknown message type', data)
    }
  }

  const sr = serializeRequest(request)

  const payload: BridgeEvent = {
    event: 'request',
    request: sr.serializableRequest,
    connInfo,
  }
  worker.postMessage(payload, [responseChannel.port2, ...sr.transfers])

  return {
    responseDefer,
    responseChannel,
  }
}

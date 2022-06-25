import type { Handler, ServeInit } from '../deps.ts'
import { BridgeEvent } from './events.ts'
import { getStreamFromEvent } from './getStreamFromEvent.ts'
import { serializeResponse } from './serialize.ts'

export function serve(handler: Handler, init?: ServeInit) {
  globalThis.addEventListener('message', async (ev) => {
    const e = ev as MessageEvent
    const data = e.data as BridgeEvent
    if (data.event === 'request') {
      const responsePort = e.ports[0]
      if (!responsePort) {
        throw new Error('no response port given')
      }

      const reqBody = getStreamFromEvent(e, 1)
      const request = new Request(e.data.request.url, {
        ...data.request,
        body: reqBody,
      })

      let response: Response
      try {
        response = await handler(request, data.connInfo)
      } catch (e) {
        response = new Response(`${e as string}`, { status: 500 })
      }

      const sr = serializeResponse(response)
      const payload: BridgeEvent = {
        event: 'response',
        response: sr.serializableResponse,
      }

      responsePort.postMessage(payload, sr.transfers)
    } else {
      console.error('unknown message type', data)
    }
  })
}

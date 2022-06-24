/// <reference lib="deno.worker"/>
import { getStreamFromEvent } from './utils/getStreamFromEvent.ts'
import { IPCEvent, SerializableResponse } from './ipc.ts'
import { pick } from './utils/pick.ts'
import { domIterableToArray } from './utils/domIterableToArray.ts'
import { createStreamPort } from './utils/createStreamPort.ts'

async function handler(req: Request): Promise<Response> {
  const text = await req.text()
  const resp = text.split('').reverse().join('')
  return new Response(resp)
}

self.onmessage = async (e) => {
  const data = e.data as IPCEvent
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

    const response = await handler(request)

    const serializableResponse: SerializableResponse = {
      ...pick(response, ['ok', 'redirected', 'status', 'statusText', 'type', 'url']),
      headers: domIterableToArray(response.headers),
    }

    const message: IPCEvent = {
      event: 'response',
      response: serializableResponse,
    }
    responsePort.postMessage(message, response.body ? [createStreamPort(response.body)] : [])
  }
}

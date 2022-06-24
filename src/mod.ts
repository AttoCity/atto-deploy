import { serve } from 'http/server.ts'
import { pick } from './utils/pick.ts'
import { domIterableToArray } from './utils/domIterableToArray.ts'
import { SerializableRequest, IPCEvent } from './ipc.ts'
import { createStreamPort } from './utils/createStreamPort.ts'
import { getStreamFromEvent } from './utils/getStreamFromEvent.ts'
import createDefer, { DeferredPromise } from 'p-defer'

const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
  type: 'module',
  name: 'handler-worker',
})

function postMessageToWorker(message: IPCEvent, transfers: Transferable[] = []) {
  worker.postMessage(message, transfers)
}

async function handler(req: Request): Promise<Response> {
  const responseDefer = createDefer<Response>()

  const responseChannel = new MessageChannel()
  responseChannel.port1.onmessage = (e) => {
    const data = e.data as IPCEvent
    if (data.event === 'response') {
      const stream = getStreamFromEvent(e)
      const response = new Response(stream, data.response)
      responseDefer.resolve(response)
    }
  }

  const serializableRequest: SerializableRequest = {
    ...pick(req, [
      'cache',
      'credentials',
      'destination',
      'integrity',
      'isHistoryNavigation',
      'isReloadNavigation',
      'keepalive',
      'method',
      'mode',
      'redirect',
      'referrer',
      'referrerPolicy',
      'url',
    ]),
    headers: domIterableToArray(req.headers),
  }

  const transfers = req.body === null ? [] : [createStreamPort(req.body)]
  postMessageToWorker(
    {
      event: 'request',
      request: serializableRequest,
    },
    [responseChannel.port2, ...transfers],
  )

  return await responseDefer.promise
}

serve(handler)

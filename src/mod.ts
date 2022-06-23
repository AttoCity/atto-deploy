import { serve } from 'http/server.ts'
import { pick } from './utils/pick.ts'
import { domIterableToArray } from './utils/domIterableToArray.ts'
import { SerializableRequest, IPCEvent } from './ipc.ts'
import { TranstreamClient, TranstreamServer } from './transtream/index.ts'
import { delay } from 'std/async/delay.ts'

const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
  type: 'module',
  name: 'handler-worker',
})

function postMessageToWorker(message: IPCEvent, transfers: Transferable[] = []) {
  worker.postMessage(message, transfers)
}

let requestId = 0
const requestMap = new Map<number, Request>()

async function handler(req: Request): Promise<Response> {
  requestId++
  requestMap.set(requestId, req)
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
      requestId,
    },
    transfers,
  )

  await delay(5000)

  return new Response(`Hello World!`)
}

function createStreamPort(stream: ReadableStream<Uint8Array>): MessagePort {
  const ts = new TranstreamServer()
  ts.putStream(stream)
  return ts.remotePort
}

serve(handler)

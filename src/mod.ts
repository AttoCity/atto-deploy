import { serve, ConnInfo } from 'http/server.ts'
import { postRequestToWorker } from './bridge/postRequestToWorker.ts'

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  const workerUrl = req.headers.get('atto-worker')
  if (!workerUrl) {
    return new Response('no worker url given', { status: 400 })
  }

  console.log(workerUrl)
  const worker = new Worker(workerUrl, {
    type: 'module',
    name: 'handler-worker',
  })

  const { responseDefer } = postRequestToWorker(worker, req, connInfo)
  return await responseDefer.promise
}

serve(handler)

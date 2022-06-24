import { serve, ConnInfo } from 'http/server.ts'
import { postRequestToWorker } from './bridge/postRequestToWorker.ts'

// const testWorker = new URL('./worker.ts', import.meta.url).href

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  const worker = new Worker(req.headers.get('atto-worker')!, {
    type: 'module',
    name: 'handler-worker',
  })

  const { responseDefer } = postRequestToWorker(worker, req, connInfo)
  return await responseDefer.promise
}

serve(handler)

import { serve, ConnInfo } from 'http/server.ts'
import { postRequestToWorker } from './bridge/postRequestToWorker.ts'

const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
  type: 'module',
  name: 'handler-worker',
})

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  const { responseDefer } = postRequestToWorker(worker, req, connInfo)
  return await responseDefer.promise
}

serve(handler)

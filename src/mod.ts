import { postRequestToWorker } from './bridge/postRequestToWorker.ts'
import { getWorkerUrl } from './dnsconfig.ts'
import { LRU } from './deps.ts'
import { serve, ConnInfo } from './deps.ts'

const workers = new LRU<string, Worker>({
  max: 20,
  dispose(_, worker) {
    if (worker) {
      worker.terminate()
    }
  },
  updateAgeOnGet: true,
  maxAge: 5 * 60 * 1000,
})

function getWorker(url: string): Worker {
  const cachedWorker = workers.get(url)
  if (cachedWorker) {
    return cachedWorker
  }

  const worker = new Worker(url, {
    type: 'module',
    deno: {
      permissions: {
        env: false,
        ffi: false,
        read: false,
        write: false,
      },
    },
  })
  workers.set(url, worker)

  worker.onerror = (err) => {
    console.error(err)
    workers.del(url)
  }

  return worker
}

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  try {
    const reqUrl = new URL(req.url)
    const workerUrl = await getWorkerUrl(reqUrl.hostname)
    if (!workerUrl) {
      return new Response('no worker url given', { status: 400 })
    }

    if (
      req.method === 'PURGE' &&
      reqUrl.pathname === '/atto-cgi/purge' &&
      req.headers.get('Atto-Deploy-Purge-Token') === Deno.env.get('DEPLOY_PURGE_TOKEN')
    ) {
      workers.del(workerUrl)
      const reloadProcess = Deno.run({
        cmd: ['deno', 'cache', '--reload', workerUrl],
        stderr: 'piped',
        stdout: 'piped',
        env: {
          ...Deno.env.toObject(),
          NO_COLOR: '1',
        },
      })
      const result = await reloadProcess.stderrOutput()
      return new Response(result, { status: (await reloadProcess.status()).success ? 200 : 500 })
    }

    const worker = getWorker(workerUrl)
    const { responseDefer } = postRequestToWorker(worker, req, connInfo)
    const response = await responseDefer.promise

    return response
  } catch (err) {
    return new Response(`${err as string}`, { status: 500 })
  }
}

serve(handler, {
  port: parseInt(Deno.env.get('PORT') || '8000', 10),
})

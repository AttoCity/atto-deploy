/// <reference lib="deno.worker"/>
import { TranstreamClient, TranstreamServer } from './transtream/index.ts'

async function handler(req: Request): Promise<Response> {
  console.log('handler', req)
  return new Response(`Hello World!`)
}

self.onmessage = async (e) => {
  if (e.ports.length > 0) {
    const [port] = e.ports
    const client = new TranstreamClient(port)
    const stream = client.getStream()
    console.log(await stream.getReader().read())
  }
}

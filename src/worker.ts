/// <reference lib="deno.worker"/>
import { handleRequest } from './bridge/handleRequest.ts'

async function handler(req: Request): Promise<Response> {
  const text = await req.text()
  const resp = text.split('').reverse().join('')
  return new Response(resp)
}

handleRequest(handler)

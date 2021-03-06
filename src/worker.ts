/// <reference lib="deno.worker"/>
import { serve } from '$serve$'

serve(async function handler(req): Promise<Response> {
  const text = await req.text()
  const reversed = text.split('').reverse().join('')
  return new Response(reversed)
})

import { resolveTxt } from './deps.ts'

export async function getWorkerUrl(domain: string): Promise<string | null> {
  const baseDomain = Deno.env.get('DEPLOY_CONFIG_DOMAIN') || '.dcnf.atto.town'
  const queryDomain = `${domain}${baseDomain as string}`
  const result = await new Promise<string[][]>((resolve, reject) => {
    resolveTxt(queryDomain, (err, records) => {
      if (err) {
        reject(err)
      } else {
        resolve(records)
      }
    })
  })
  if (result.length < 1) {
    return null
  }
  return result.sort().map(normalizeQueryResult).join('')
}

function normalizeQueryResult(texts: string[]): string {
  const text = texts.join('')
  const matches = text.match(/\d+\s+(.*)$/)
  if (matches) {
    return matches[1]
  } else {
    return text
  }
}

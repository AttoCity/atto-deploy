import type { ConnInfo } from '../deps.ts'

export type SerializableRequest = Pick<
  Request,
  | 'cache'
  | 'credentials'
  | 'destination'
  | 'integrity'
  | 'isHistoryNavigation'
  | 'isReloadNavigation'
  | 'keepalive'
  | 'method'
  | 'mode'
  | 'redirect'
  | 'referrer'
  | 'referrerPolicy'
  | 'url'
> & {
  headers?: [string, string][]
}

export type SerializableResponse = Pick<Response, 'ok' | 'redirected' | 'status' | 'statusText' | 'type' | 'url'> & {
  headers?: [string, string][]
  // FIXME: trailer is not supported yet
  // trailer?: [string, string][]
}

export type BridgeEvent =
  | {
      event: 'request'
      request: SerializableRequest
      connInfo: ConnInfo
    }
  | {
      event: 'response'
      response: SerializableResponse
    }
  | {
      event: 'abort'
    }

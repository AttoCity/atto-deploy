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
  headers: [string, string][]
}

export type IPCEvent = {
  event: 'request'
  requestId: number
  request: SerializableRequest
}

import { pick } from '../utils/pick.ts'
import { createStreamPort } from './createStreamPort.ts'
import { domIterableToArray } from './domIterableToArray.ts'
import { SerializableRequest, SerializableResponse } from './events.ts'

export function serializeRequest(request: Request) {
  const serializableRequest: SerializableRequest = {
    ...pick(request, [
      'cache',
      'credentials',
      'destination',
      'integrity',
      'isHistoryNavigation',
      'isReloadNavigation',
      'keepalive',
      'method',
      'mode',
      'redirect',
      'referrer',
      'referrerPolicy',
      'url',
    ]),
    headers: domIterableToArray(request.headers),
  }

  const transfers = request.body === null ? [] : [createStreamPort(request.body)]

  return {
    serializableRequest,
    transfers,
  }
}

export function serializeResponse(response: Response) {
  const serializableResponse: SerializableResponse = {
    ...pick(response, ['ok', 'redirected', 'status', 'statusText', 'type', 'url']),
    headers: domIterableToArray(response.headers),
  }

  const transfers = response.body === null ? [] : [createStreamPort(response.body)]

  return {
    serializableResponse,
    transfers,
  }
}

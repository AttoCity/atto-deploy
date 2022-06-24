export interface DeferredPromise<ValueType> {
  /**
  The deferred promise.
  */
  promise: Promise<ValueType>

  /**
  Resolves the promise with a value or the result of another promise.
  @param value - The value to resolve the promise with.
  */
  resolve(value?: ValueType | PromiseLike<ValueType>): void

  /**
  Reject the promise with a provided reason or error.
  @param reason - The reason or error to reject the promise with.
  */
  reject(reason?: unknown): void
}

export default function pDefer<ValueType>() {
  const deferred = {} as DeferredPromise<ValueType>

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  return deferred
}

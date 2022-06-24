export function domIterableToArray<K, V>(iterable: DomIterable<K, V>): [K, V][] {
  const result: [K, V][] = []
  for (const [key, value] of iterable) {
    result.push([key, value])
  }
  return result
}

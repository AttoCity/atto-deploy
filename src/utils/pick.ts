export function pick<T extends Record<string | number, any>, U extends keyof T>(obj: T, props: Array<U>): Pick<T, U> {
  const newObj = {} as Pick<T, U>
  for (const prop of props) {
    if (obj[prop] !== undefined) {
      newObj[prop] = obj[prop]
    }
  }
  return newObj
}

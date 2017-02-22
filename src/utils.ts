export type Iteratee<V, K, O, R> = (value: V, key: K, source: O) => R

/**
 * A specialized version of `forEach` for arrays.
 *
 * From lodash.
 */
function arrayEach<T> (array: T[], iteratee: Iteratee<T, number, T[], any>): T[] {
  let index = -1
  const length = array.length

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break
    }
  }
  return array
}

/**
 * A specialized version of `forEach` for objects.
 */
function objectEach<T> (source: T, iteratee: Iteratee<any, string, T, any>): T {
  for (let key in source) {
    /* istanbul ignore next */
    if (source.hasOwnProperty(key)) {
      if (iteratee(source[key], key, source) === false) {
        break
      }
    }
  }

  return source
}

/**
 * Invokes the iteratee for each item in the array or object.
 */
export function forEach<T> (array: T[], iteratee: Iteratee<T, number, T[], any>): T[]
export function forEach<T> (source: T, iteratee: Iteratee<any, string, T, any>): T
export function forEach (source: any, iteratee: Iteratee<any, any, any, any>): any {
  const func: any = Array.isArray(source) ? arrayEach : objectEach
  return func(source, iteratee)
}

/**
 * Determines if every element in the collection statisfies the predicate.
 * @type {T[]}
 */
export function every<T> (array: T[], predicate: Iteratee<T, number, T[], boolean>): boolean
export function every<T> (source: T, predicate: Iteratee<any, string, T, boolean>): boolean
export function every (source: any, predicate: Iteratee<any, any, any, any>): any {
  let result = true
  forEach(source, (value, key, source) => {
    if (!predicate(value, key, source)) {
      result = false
      return false
    }
  })
  return result
}

import { forEach, every, mapToObject } from '../utils'

describe('utils', () => {
  describe('forEach', () => {
    it('calls the iteratee on arrays', () => {
      const arr = ['a', 'b', 'c']
      const iteratee = jest.fn()
      forEach(arr, iteratee)
      expect(iteratee).toHaveBeenCalledTimes(3)
      expect(iteratee).toBeCalledWith('a', 0, arr)
      expect(iteratee).toBeCalledWith('b', 1, arr)
      expect(iteratee).toBeCalledWith('c', 2, arr)
    })

    it('calls the iteratee on objects', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const iteratee = jest.fn()
      forEach(obj, iteratee)
      expect(iteratee).toHaveBeenCalledTimes(3)
      expect(iteratee).toBeCalledWith(1, 'a', obj)
      expect(iteratee).toBeCalledWith(2, 'b', obj)
      expect(iteratee).toBeCalledWith(3, 'c', obj)
    })

    it('only iterates own props', () => {
      class Test {
        test: string | undefined
        method() {
          /**/
        }
      }

      const instance = new Test()
      instance.test = 'hello'
      const iteratee = jest.fn()
      forEach(instance, iteratee)
      expect(iteratee).toBeCalledTimes(1)
      expect(iteratee).toBeCalledWith('hello', 'test', instance)
    })
  })

  describe('every', function () {
    it('returns true if every element satisfies the predicate', () => {
      const arr = [1, 1, 1]
      expect(every(arr, (x) => x === 1)).toEqual(true)
    })

    it('returns false if some element does not satisfy the predicate', () => {
      const arr = [1, 1, 2]
      expect(every(arr, (x) => x === 1)).toEqual(false)
    })

    it('stops early if it encounters false', () => {
      const arr = [1, 2, 1]
      const predicate = jest.fn((x) => x === 1)
      expect(every(arr, predicate)).toEqual(false)
      expect(predicate).toBeCalledTimes(2)
      expect(predicate).toBeCalledWith(1, 0, arr)
      expect(predicate).toBeCalledWith(2, 1, arr)
    })

    it('works on objects', () => {
      expect(every({ a: 1, b: 2 }, (v) => v === 2)).toEqual(false)
      expect(every({ a: 2, b: 2 }, (v) => v === 2)).toEqual(true)
    })
  })

  describe('mapToObject', () => {
    it('maps a map to an object', () => {
      const map = new Map([
        ['one', 1],
        ['two', 2],
      ])
      const obj = mapToObject(map)

      expect(obj['one']).toEqual(1)
      expect(obj['two']).toEqual(2)
    })
  })
})

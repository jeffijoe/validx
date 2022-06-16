import { forEach, every, mapToObject } from '../src/utils'
import { spy } from 'sinon'
import { expect } from 'chai'

describe('utils', () => {
  describe('forEach', () => {
    it('calls the iteratee on arrays', () => {
      const arr = ['a', 'b', 'c']
      const iteratee = spy()
      forEach(arr, iteratee)
      expect(iteratee.callCount).to.equal(3)
      expect(iteratee).has.been.calledWith('a', 0, arr)
      expect(iteratee).has.been.calledWith('b', 1, arr)
      expect(iteratee).has.been.calledWith('c', 2, arr)
    })

    it('calls the iteratee on objects', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const iteratee = spy()
      forEach(obj, iteratee)
      expect(iteratee.callCount).to.equal(3)
      expect(iteratee).has.been.calledWith(1, 'a', obj)
      expect(iteratee).has.been.calledWith(2, 'b', obj)
      expect(iteratee).has.been.calledWith(3, 'c', obj)
    })

    it('only iterates own props', () => {
      class Test {
        test: string
        method() {}
      }

      const instance = new Test()
      instance.test = 'hello'
      const iteratee = spy()
      forEach(instance, iteratee)
      expect(iteratee).has.been.calledOnce
      expect(iteratee).has.been.calledWith('hello', 'test', instance)
    })
  })

  describe('every', function () {
    it('returns true if every element satisfies the predicate', () => {
      const arr = [1, 1, 1]
      expect(every(arr, (x) => x === 1)).to.equal(true)
    })

    it('returns false if some element does not satisfy the predicate', () => {
      const arr = [1, 1, 2]
      expect(every(arr, (x) => x === 1)).to.equal(false)
    })

    it('stops early if it encounters false', () => {
      const arr = [1, 2, 1]
      const predicate = spy((x) => x === 1)
      expect(every(arr, predicate)).to.equal(false)
      expect(predicate).has.been.calledTwice
      expect(predicate).has.been.calledWith(1, 0, arr)
      expect(predicate).has.been.calledWith(2, 1, arr)
    })

    it('works on objects', () => {
      expect(every({ a: 1, b: 2 }, (v) => v === 2)).to.equal(false)
      expect(every({ a: 2, b: 2 }, (v) => v === 2)).to.equal(true)
    })
  })

  describe('mapToObject', () => {
    it('maps a map to an object', () => {
      const map = new Map([
        ['one', 1],
        ['two', 2],
      ])
      const obj = mapToObject(map)

      expect(obj['one']).to.equal(1)
      expect(obj['two']).to.equal(2)
    })
  })
})

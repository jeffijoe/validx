import 'mocha'
import { ValidationContext, IValidationSchema, required, pattern } from '../src'
import { reaction } from 'mobx'
import { expect } from 'chai'
import { spy } from 'sinon'
import { IValidatorOptions, validationContext } from '../src/validation'

describe('ValidationContext', () => {
  describe('#validate', () => {
    it('runs validations on the input object', () => {
      const v = new ValidationContext()
      const reactionSpy = spy()
      reaction(() => v.errors, (e: any) => {
        expect(Object.keys(e).length).to.equal(2)
        reactionSpy()
      })
      v.validate({
        name: null,
        lol: 'test'
      }, {
        name: [
          required({ msg: 'yo' })
        ],
        lol: [
          required(),
          pattern({ pattern: 'email' })
        ]
      })

      expect(v.errors['name'].length).to.equal(1)
      expect(v.errors['name'][0]).to.equal('yo')
      expect(v.errors['lol'].length).to.equal(1)
      expect(v.errors['lol'][0]).to.match(/email/i)
      expect(reactionSpy.calledOnce).to.equal(true)
    })

    it('accumulates errors', () => {
      const v = new ValidationContext()
      v.validate({
        name: ''
      }, {
        name: [
          required()
        ]
      })
      v.validate({
        email: '',
        name: ''
      }, {
        email: [
          required(),
          pattern({pattern: 'email'})
        ],
        name: [
          required()
        ]
      })

      expect(Object.keys(v.errors).length).to.equal(2)
    })

    it('uses default error message when validator returns false', () => {
      const v = validationContext()
      v.validate({
        name: 'Joe'
      }, {
        name: [
          (v: IValidatorOptions<{ name: string }>) => v.value === 'Jeff'
        ]
      })

      expect(v.errors['name'][0]).to.match(/invalid/i)
    })

    it('has no errors when all is well', () => {
      const c = new ValidationContext()
      c.validate({ name: 'heh' }, {
        name: [
          required()
        ]
      })
      expect(Object.keys(c.errors).length).to.equal(0, 'there should be no errors')
    })
  })

  describe('#reset', () => {
    it('removes all errors', () => {
      const c = new ValidationContext()
      const reactionSpy = spy()
      c.validate({ name: null }, {
        name: [
          required()
        ]
      })
      expect(Object.keys(c.errors).length).to.equal(1, 'there should be 1 error')
      reaction(() => c.errors, (e: any) => {
        expect(Object.keys(e).length).to.equal(0)
        reactionSpy()
      })
      c.reset()
      expect(Object.keys(c.errors).length).to.equal(0, 'there should be no errors after resetting')
      expect(reactionSpy.calledOnce).to.equal(true)
    })
  })

  describe('#isValid', () => {
    it('reacts based on errors', () => {
      const reactionSpy = spy()
      const c = new ValidationContext()
      reaction(() => c.isValid, reactionSpy)
      expect(c.isValid).to.equal(true)
      c.validate({ name: null }, {
        name: [
          required()
        ]
      })
      expect(c.isValid).to.equal(false)
      c.reset()
      expect(c.isValid).to.equal(true)
      expect(reactionSpy.callCount).to.equal(2, 'should have reacted 2 times')
    })
  })
  
  describe('#getErrors', () => {
    it('returns the errors for the given field', () => {
      const c = validationContext()
      c.addErrors({ test: ['Hello', 'World'] })
      expect(c.getErrors('test')).to.deep.equal(['Hello', 'World'])
    })
    
    it('returns an empty array for the given field if there are no errors', () => {
      const c = validationContext()
      expect(c.getErrors('test')).to.deep.equal([])
    })
    
    it('supports bound contexts', () => {
      const c = validationContext({ name: '' }, {
        name: [required()]
      })
      c.reset().validate()
      expect(c.getErrors('name')[0]).to.match(/required/)
    })
  })
  
  describe('#getError', () => {
    it('returns the first error for the given field', () => {
      const c = validationContext()
      c.addErrors({ test: ['Hello', 'World'] })
      expect(c.getError('test')).to.deep.equal('Hello')
    })
    
    it('returns an empty array for the given field if there are no errors', () => {
      const c = validationContext()
      expect(c.getError('test')).to.deep.equal(undefined)
    })
    
    it('supports bound contexts', () => {
      const c = validationContext({ name: '' }, {
        name: [required('hah'), pattern({ pattern: 'email' })]
      })
      c.reset().validate()
      expect(c.getError('name')).to.equal('hah')
    })
  })

  describe('validators', () => {
    describe('regular function', () => {
      it('works', () => {
        type ITest = { name: string; age: number }
        const schema: IValidationSchema<ITest> = {
          name: [
            (opts) => {
              return opts.obj.name === 'Jeff' ? true : 'jeff plz'
            }
          ]
        }
        const c = new ValidationContext().validate<ITest>({
          name: 'Jeff',
          age: 22
        }, schema)
        expect(c.isValid).to.equal(true)
        c.validate({
          name: 'Joe',
          age: 24
        }, schema)
        expect(c.isValid).to.equal(false)
        expect(c.errors['name'][0]).to.equal('jeff plz')
      })
    })
  })

  describe('#addErrors', () => {
    it('adds errors to the context', () => {
      const c = new ValidationContext()
      expect(c.isValid).to.equal(true)
      c.addErrors({
        test: ['yeah']
      })

      expect(c.errors['test'][0]).to.equal('yeah')
      expect(c.isValid).to.equal(false)
    })
  })
})

describe('validationContext(object)', () => {
  describe('when called with no parameter', () => {
    it('returns a regular validation context', () => {
      const v = validationContext()
      v.validate({ name: '' }, {
        name: [required()]
      })
      expect(v.errors['name'].length).to.equal(1)
    })
  })

  describe('when called with an object parameter', () => {
    it('returns a bound validation context', () => {
      const o = { name: '' }
      const v = validationContext(o)
      v.validate({
        name: [required()]
      })
      expect(v.errors['name'].length).to.equal(1)
      v.reset()
      v.validate({
        name: [required()]
      })
      expect(Object.keys(v.errors['name']).length).to.equal(0)
    })
  })

  describe('when called with an object + schema', () => {
    it('returns a bound validation context with a schema', () => {
      const o = {name: ''}
      const v = validationContext(o, {
        name: [required()]
      })
      v.validate()
      expect(v.errors['name'].length).to.equal(1)
      v.reset()
      v.validate()
      expect(Object.keys(v.errors['name']).length).to.equal(0)
    })
  })
})

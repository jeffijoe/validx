import {
  IValidatorOptions,
  validationContext,
  ValidationContext,
  IValidationSchema,
  required,
  pattern,
} from '../'
import { reaction } from 'mobx'

describe('ValidationContext', () => {
  describe('#validate', () => {
    it('runs validations on the input object', () => {
      const v = new ValidationContext()
      const reactionSpy = jest.fn()
      reaction(
        () => v.errors,
        (e: any) => {
          expect(Object.keys(e).length).toEqual(2)
          reactionSpy()
        }
      )
      v.validate(
        {
          name: null,
          lol: 'test',
        },
        {
          name: [required({ msg: 'yo' })],
          lol: [required(), pattern({ pattern: 'email' })],
        }
      )

      expect(v.errors['name'].length).toEqual(1)
      expect(v.errors['name'][0]).toEqual('yo')
      expect(v.errors['lol'].length).toEqual(1)
      expect(v.errors['lol'][0]).toMatch(/email/i)
      expect(reactionSpy).toHaveBeenCalledTimes(1)
    })

    it('accumulates errors', () => {
      const v = new ValidationContext()
      v.validate(
        {
          name: '',
        },
        {
          name: [required()],
        }
      )
      v.validate(
        {
          email: '',
          name: '',
        },
        {
          email: [required(), pattern({ pattern: 'email' })],
          name: [required()],
        }
      )

      expect(Object.keys(v.errors).length).toEqual(2)
    })

    it('uses default error message when validator returns false', () => {
      const v = validationContext()
      v.validate(
        {
          name: 'Joe',
        },
        {
          name: [
            (v: IValidatorOptions<{ name: string }>) => v.value === 'Jeff',
          ],
        }
      )

      expect(v.errors['name'][0]).toMatch(/invalid/i)
    })

    it('has no errors when all is well', () => {
      const c = new ValidationContext()
      c.validate(
        { name: 'heh' },
        {
          name: [required()],
        }
      )
      expect(Object.keys(c.errors).length).toEqual(0)
    })

    it('skips falsy values in schema', () => {
      const c = new ValidationContext()
      c.validate(
        { name: '' },
        {
          name: [undefined as any, null, false, required()],
        }
      )
      expect(Object.keys(c.errors).length).toEqual(1)
    })
  })

  describe('#reset', () => {
    it('removes all errors', () => {
      const c = new ValidationContext()
      const reactionSpy = jest.fn()
      c.validate(
        { name: null },
        {
          name: [required()],
        }
      )
      expect(Object.keys(c.errors).length).toEqual(1)
      reaction(
        () => c.errors,
        (e: any) => {
          expect(Object.keys(e).length).toEqual(0)
          reactionSpy()
        }
      )
      c.reset()
      expect(Object.keys(c.errors).length).toEqual(0)
      expect(reactionSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#isValid', () => {
    it('reacts based on errors', () => {
      const reactionSpy = jest.fn()
      const c = new ValidationContext()
      reaction(() => c.isValid, reactionSpy)
      expect(c.isValid).toEqual(true)
      c.validate(
        { name: null },
        {
          name: [required()],
        }
      )
      expect(c.isValid).toEqual(false)
      c.reset()
      expect(c.isValid).toEqual(true)
      expect(reactionSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('#getErrors', () => {
    it('returns the errors for the given field', () => {
      const c = validationContext()
      c.addErrors({ test: ['Hello', 'World'] })
      expect(c.getErrors('test')).toEqual(['Hello', 'World'])
    })

    it('returns an empty array for the given field if there are no errors', () => {
      const c = validationContext()
      expect(c.getErrors('test')).toEqual([])
    })

    it('supports bound contexts', () => {
      const c = validationContext(
        { name: '' },
        {
          name: [required()],
        }
      )
      c.reset().validate()
      expect(c.getErrors('name')[0]).toMatch(/required/)
    })
  })

  describe('#getError', () => {
    it('returns the first error for the given field', () => {
      const c = validationContext()
      c.addErrors({ test: ['Hello', 'World'] })
      expect(c.getError('test')).toEqual('Hello')
    })

    it('returns an empty array for the given field if there are no errors', () => {
      const c = validationContext()
      expect(c.getError('test')).toBeUndefined()
    })

    it('supports bound contexts', () => {
      const c = validationContext(
        { name: '' },
        {
          name: [required('hah'), pattern({ pattern: 'email' })],
        }
      )
      c.reset().validate()
      expect(c.getError('name')).toEqual('hah')
    })
  })

  describe('#clearErrors', function () {
    it('clears errors for the specified field', () => {
      const c = validationContext()
      c.addErrors({ test: ['Hello'] })
      expect(c.getError('test')).toEqual('Hello')
      c.clearErrors('test')
      expect(c.getError('test')).toBeUndefined()
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
            },
          ],
        }
        const c = new ValidationContext().validate<ITest>(
          {
            name: 'Jeff',
            age: 22,
          },
          schema
        )
        expect(c.isValid).toEqual(true)
        c.validate(
          {
            name: 'Joe',
            age: 24,
          },
          schema
        )
        expect(c.isValid).toEqual(false)
        expect(c.errors['name'][0]).toEqual('jeff plz')
      })
    })
  })

  describe('#addErrors', () => {
    it('adds errors to the context', () => {
      const c = new ValidationContext()
      expect(c.isValid).toEqual(true)
      c.addErrors({
        test: ['yeah'],
      })

      expect(c.errors['test'][0]).toEqual('yeah')
      expect(c.isValid).toEqual(false)
    })
  })
})

describe('validationContext(object)', () => {
  describe('when called with no parameter', () => {
    it('returns a regular validation context', () => {
      const v = validationContext()
      v.validate(
        { name: '' },
        {
          name: [required()],
        }
      )
      expect(v.errors['name'].length).toEqual(1)
    })
  })

  describe('when called with an object parameter', () => {
    it('returns a bound validation context', () => {
      const o = { name: '' }
      const v = validationContext(o)
      v.validate({
        name: [required()],
      })
      expect(v.errors['name'].length).toEqual(1)
      v.reset()
      o.name = 'joe'
      v.validate({
        name: [required()],
      })
      expect(Object.keys(v.errors).length).toEqual(0)
    })
  })

  describe('when called with an object + schema', () => {
    it('returns a bound validation context with a schema', () => {
      const o = { name: '' }
      const v = validationContext(o, {
        name: [required()],
      })
      v.validate()
      expect(v.errors['name'].length).toEqual(1)
      v.reset()
      o.name = 'joe'
      v.validate()
      expect(Object.keys(v.errors).length).toEqual(0)
    })
  })
})

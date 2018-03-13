import 'mocha'
import { ValidationContext, pattern } from '../../src'
import { expect } from 'chai'

describe('patternValidator', () => {
  it('supports simple notation', () => {
    const c = new ValidationContext()
    c.validate(
      { email1: '', email2: '', email3: 'test@test.com' },
      {
        email1: [pattern('email', 'yo')],
        email2: [pattern('email')],
        email3: [pattern('email')]
      }
    )
    expect(c.errors['email1'][0]).to.equal('yo')
    expect(c.errors['email2'][0]).to.equal('This is not a valid email')
    expect(c.errors['email3']).to.equal(undefined)
  })

  it('validates emails', () => {
    const c = new ValidationContext()
    c.validate(
      { email1: '', email2: '', email3: 'test@test.com' },
      {
        email1: [pattern({ pattern: 'email', msg: 'yo' })],
        email2: [pattern({ pattern: 'email' })],
        email3: [pattern({ pattern: 'email' })]
      }
    )
    expect(c.errors['email1'][0]).to.equal('yo')
    expect(c.errors['email2'][0]).to.equal('This is not a valid email')
    expect(c.errors['email3']).to.equal(undefined)
  })

  it('validates urls', () => {
    const c = new ValidationContext()
    c.validate(
      { url1: '', url2: 'haha', url3: 'https://jeffijoe.com' },
      {
        url1: [pattern({ pattern: 'url', msg: 'yo' })],
        url2: [pattern({ pattern: 'url' })],
        url3: [pattern({ pattern: 'url' })]
      }
    )
    expect(c.errors['url1'][0]).to.equal('yo')
    expect(c.errors['url2'][0]).to.equal('This is not a valid url')
    expect(c.errors['url3']).to.equal(undefined)
  })

  it('validates regexp', () => {
    const c = new ValidationContext()
    c.validate(
      { p1: 'abcd', p2: '1234', p3: 'hij' },
      {
        p1: [pattern({ pattern: /\d/, msg: 'yo' })],
        p2: [pattern({ pattern: /[a-z]/ })],
        p3: [pattern({ pattern: /[a-z]/ })]
      }
    )
    expect(c.errors['p1'][0]).to.equal('yo')
    expect(c.errors['p2'][0]).to.match(/invalid/i)
    expect(c.errors['p3']).to.equal(undefined)
  })
})

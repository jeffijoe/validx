import 'mocha'
import { ValidationContext, func } from '../../src'
import { expect } from 'chai'

describe('funcValidator', () => {
  it('works', () => {
    const c = new ValidationContext()
    c.validate<{ name: string, title: string }>({name: '', title: ''}, {
      name: [
        func(() => true, 'Haha')
      ],
      title: [
        func(() => false, 'Lol')
      ]
    })
    expect(c.errors['name']).to.equal(undefined)
    expect(c.errors['title'][0]).to.equal('Lol')
  })

  it('accepts a config object', () => {
    const c = new ValidationContext()
    c.validate<{ name: string, title: string }>({name: '', title: ''}, {
      name: [
        func({ fn: () => false, msg: 'Haha' })
      ],
      title: [
        func({ fn: () => false },  'Lol')
      ]
    })
    expect(c.errors['name'][0]).to.equal('Haha')
    expect(c.errors['title'][0]).to.equal('Lol')
  })

  it('rejects anything else', () => {
    const c = new ValidationContext()
    expect(() => func(undefined as any)).to.throw(TypeError)
    expect(() => func(null as any)).to.throw(TypeError)
  })
})

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
})

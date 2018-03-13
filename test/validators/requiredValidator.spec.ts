import 'mocha'
import { ValidationContext, required } from '../../src'
import { expect } from 'chai'

describe('requiredValidator', () => {
  it('works', () => {
    const c = new ValidationContext()
    c.validate<{ name: string; title: string }>(
      { name: '', title: '' },
      {
        name: [required({ msg: 'yo' })],
        title: [required('Title plz')]
      }
    )
    expect(c.errors['name'][0]).to.equal('yo')
    expect(c.errors['title'][0]).to.equal('Title plz')
  })

  it('can be disabled', () => {
    const c = new ValidationContext()
    c.validate<{ name: string; title: string }>(
      { name: '', title: '' },
      {
        name: [required({ msg: 'yo', required: false })],
        title: [required('Title plz')]
      }
    )
    expect(c.errors['name']).to.equal(undefined)
    expect(c.errors['title'][0]).to.equal('Title plz')
  })
})

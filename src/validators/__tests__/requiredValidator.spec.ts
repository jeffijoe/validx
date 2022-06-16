import 'mocha'
import { ValidationContext, required } from '../..'

describe('requiredValidator', () => {
  it('works', () => {
    const c = new ValidationContext()
    c.validate<{ name: string; title: string }>(
      { name: '', title: '' },
      {
        name: [required({ msg: 'yo' })],
        title: [required('Title plz')],
      }
    )
    expect(c.errors['name'][0]).toEqual('yo')
    expect(c.errors['title'][0]).toEqual('Title plz')
  })

  it('can be disabled', () => {
    const c = new ValidationContext()
    c.validate<{ name: string; title: string }>(
      { name: '', title: '' },
      {
        name: [required({ msg: 'yo', required: false })],
        title: [required('Title plz')],
      }
    )
    expect(c.errors['name']).toBeUndefined()
    expect(c.errors['title'][0]).toEqual('Title plz')
  })
})

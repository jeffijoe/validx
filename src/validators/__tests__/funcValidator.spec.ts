import 'mocha'
import { ValidationContext, func } from '../..'

describe('funcValidator', () => {
  it('works', () => {
    const c = new ValidationContext()
    c.validate<{ name: string; title: string }>(
      { name: '', title: '' },
      {
        name: [func(() => true, 'Haha')],
        title: [func(() => false, 'Lol')],
      }
    )
    expect(c.errors['name']).toBeUndefined()
    expect(c.errors['title'][0]).toEqual('Lol')
  })

  it('accepts a config object', () => {
    const c = new ValidationContext()
    c.validate<{ name: string; title: string }>(
      { name: '', title: '' },
      {
        name: [func({ fn: () => false, msg: 'Haha' })],
        title: [func({ fn: () => false }, 'Lol')],
      }
    )
    expect(c.errors['name'][0]).toEqual('Haha')
    expect(c.errors['title'][0]).toEqual('Lol')
  })

  it('rejects anything else', () => {
    expect(() => func(undefined as any)).toThrowError(TypeError)
    expect(() => func(null as any)).toThrowError(TypeError)
  })
})

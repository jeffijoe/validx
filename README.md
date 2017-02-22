# validx

[![npm](https://img.shields.io/npm/v/validx.svg?maxAge=1000)](https://www.npmjs.com/package/validx)
[![dependency Status](https://img.shields.io/david/jeffijoe/validx.svg?maxAge=1000)](https://david-dm.org/jeffijoe/validx)
[![devDependency Status](https://img.shields.io/david/dev/jeffijoe/validx.svg?maxAge=1000)](https://david-dm.org/jeffijoe/validx)
[![Build Status](https://img.shields.io/travis/jeffijoe/validx.svg?maxAge=1000)](https://travis-ci.org/jeffijoe/validx)
[![Coveralls](https://img.shields.io/coveralls/jeffijoe/validx.svg?maxAge=1000)](https://coveralls.io/github/jeffijoe/validx)
[![npm](https://img.shields.io/npm/dt/validx.svg?maxAge=1000)](https://www.npmjs.com/package/validx)
[![npm](https://img.shields.io/npm/l/validx.svg?maxAge=1000)](https://github.com/jeffijoe/validx/blob/master/LICENSE.md)
[![node](https://img.shields.io/node/v/validx.svg?maxAge=1000)](https://www.npmjs.com/package/validx)

Validation library for [MobX](https://github.com/mobxjs/mobx).

## Install

```
npm install --save validx
```

# Why?

We want to reactively display validation issues in our UI when using MobX. You can use
any (non-DOM) validation library, but then you still need to make it reactive.

**ValidX** is built for [MobX](https://github.com/mobxjs/mobx) and is easy to use, yet
powerful enough to add any validation you'd like.

# Examples

See the [TypeScript example][ts-example] and [Babel example][babel-example] for runnable examples (in Node).

# API documentation

## The `ValidationContext`

The meat of the library is the validation context. To create one, you can either use

```js
import { ValidationContext } from 'validx'
const validation = new ValidationContext()
```

Or use the factory function

```js
import { validationContext } from 'validx'
const validation = validationContext()
```

The properties on the context are reactive (observables/computeds powered by MobX).

### `validate()`

Given an object and a schema, validates the object and returns itself.
`validate()` is a MobX `action`.

Calling it will populate the `errors` property with any validation errors 
found on the object

There are multiple ways to use `validate()`, see [Bound ValidationContext](#bound-validationcontext).

```js
import { validationContext, required, pattern } from 'validx'

const validation = validationContext()

// For good measure, reset the internal state.
validation.reset()

// validate takes 2 parameters:
// - the object to validate
// - the schema.
const schema = {
  // The schema maps to the fields we are validating.
  name: [
    // Each field you wish to validate is an array of validation
    // functions.
    // `required` is just a function returning a validator function.
    required({ msg: 'Name is required' })
  ],
  email: [
    required({ msg: 'Email is required' }),
    // The `pattern` validator can be used to validate
    // emails and other regexps.
    pattern({ pattern: 'email', msg: 'Not a valid email' })
  ]
}

validation.validate({
  name: '',
  email: ''
}, schema)
```


Now that we have validated our object, we can pull the errors
from the context.

```js
console.log(validation.isValid) 
// false

console.log(validation.errors.name)
// ['Name is required']

console.log(validation.errors.email)
// ['Email is required', 'Not a valid email']
```

To validate again, we need to reset the context and then call validate.

```js
validation.reset().validate({
  name: 'Jeff',
  email: 'test'
}, schema)

console.log(validation.isValid) 
// false

console.log(validation.errors.name)
// []

console.log(validation.errors.email)
// ['Not a valid email']
```

Let's see what the errors are like when we
log them after resetting.

```js
validation.reset()
console.log(validation.isValid)
// true
console.log(validation.errors.name)
// undefined

console.log(validation.errors.email)
// undefined
```

They are undefined because we don't know
what fields will be validated yet.

```js
validation.validate({
  name: 'Jeff',
  email: 'test'
}, schema)

console.log(validation.isValid) 
// false

console.log(validation.errors.name)
// []

console.log(validation.errors.email)
// ['Not a valid email']
```

### `reset()`

Resets the internal state of the context. You usually use this before 
starting a new validation. `reset()` is a MobX `action`.

```js
const validation = validationContext()
validation.validate({ name: '' }, {
  name: [required()]
})
console.log(validation.errors.name)
// ['This field is invalid']
validation.reset()
console.log(validation.errors.name)
// undefined
```

**Use case:** sharing a validation context in a class hierarchy.

```js
class Element {
  @observable label = ''
  
  validation = validationContext(this)
  
  @action validate () {
    this.validation.validate({
      label: [required({ msg: 'Label required' })]
    })
  }
}

class TextElement extends Element {
  @observable placeholder = ''
  
  @action validate () {
    // reset before caling super
    this.validation.reset().validate({
      placeholder: [required({ msg: 'Placeholder required' })]
    })
    super.validate()
  }
}

const textElement = new TextElement()
textElement.validate()
console.log(textElement.validation.errors)
// { label: ['Label required'], placeholder: ['Placeholder required'] }

textElement.label = 'First name'
textElement.validate()
console.log(textElement.validation.errors)
// { placeholder: ['Placeholder required'] }
```

## `addErrors()`

If you at some point want to add errors without calling validate, this
is how to do it. `addErrors()` is a MobX `action`.

```js
const obj = {}
const validation = validationContext(obj, {
})

if (usernameIsTaken) {
  validation.addErrors({
    username: ['Username is taken']
  })
}

console.log(validation.errors.username)
// ['Username is taken']
```

## `getErrors()`

Safer way to get errors for a field rather than using `errors.field`,
as this will return an empty array in case there are no errors.

```js
const validation = validationContext()
validation.addErrors({ name: ['Not cool'] })

validation.getErrors('name')
// ['Not cool']

validation.reset()
validation.getErrors('name')
// []
```

## `getError()`

Convenience method for `getErrors('field')[0]`.
Returns `undefined` if the error is not found.

```js
const validation = validationContext()
validation.addErrors({ name: ['Not cool'] })

validation.getError('name')
// 'Not cool'

validation.reset()
validation.getError('name')
// undefined
```

## `errors`

A MobX `computed` map of field -> errors. When `validate` discovers validation errors, it
puts them in here.

If a field has not been validated, or the context has just been reset, there
will be no keys.

```js
const validation = validationContext(obj, {
  name: [required()]
})
console.log(validation.errors)
// {}

validation.validate()
console.log(validation.errors)
// { name: ['This field is invalid'] }
validation.validate()
// { name: ['This field is invalid', 'This field is invalid] }
// that's why you need to remember to `reset()` first!
```

## `isValid`

A MobX `computed` property that determines whether the context
has any errors or not.

```js
const validation = validationContext()
console.log(validation.isValid)
// true
validation.validate({ }, { name: [required()] })
console.log(validation.isValid)
// false
```

## Validators

Validators are just plain functions that take an object
with the rule configuration as a parameter and returns
either true for success, false for failure, or a string
for a failure with a specific message.

```js
const validation = validationContext()
const schema = {
  age: [
    required({ msg: 'Age is required' }),
    (opts) => opts.value >= 13 || 'Must be 13 years or older'
  ]
}

validation.validate({
  age: 8
}, schema)

console.log(validation.errors.age)
// ['Must be 13 years or older']
```

## Bound `ValidationContext`

By passing either 1 or 2 parameters to `validationContext`, you can "pre-bind" it
to an object and a schema.

```js
// Not bound to anything.
const obj = { name: '' }
const validation = validationContext()

validation.validate(obj, {
  name: [required()]
})
```

```js
// Bound to an object
const obj = { name: '' }
const validation = validationContext(obj)

validation.validate({
  name: [required()]
})
```

```js
// Bound to an object and a schema
const obj = { name: '' }
const validation = validationContext(obj, {
  name: [required()]
})

validation.validate()
```

# Changelog

## v0.1.0

- Added `validation.getErrors()`
- Added `validation.getError()`

## v0.0.4

- First official release.

# Author

Jeff Hansen - [@Jeffijoe](https://twitter.com/Jeffijoe)

[ts-example]: /examples/typescript
[babel-example]: /examples/babel

import { validationContext, required, pattern } from '../../../lib'
import { action, autorun } from 'mobx'
import { inspect } from 'util'

// Does not have to be an observable,
// so to demonstrate I'll use a plain object.
const obj = {}

// First parameter is the object to validate, second
// is the validation schema.
const validation = validationContext(obj, {
  name: [required({ msg: 'Name is required' })],
  email: [
    required('Email is required'), // shorthand message parameter for the required validator.
    pattern({ pattern: 'email', msg: 'That is not a valid email' })
  ],
  age: [
    required('Age is required'),
    pattern({
      pattern: /\d/, // regex pattern for numbers
      msg: 'Age must be a number'
    }),
    // And a custom validator.
    opts => {
      // Validators return either true for success, and false (for the default error message)
      // or a string (for a custom error message)
      return opts.value >= 13 || 'You must be over 13 years of age to sign up.'
    }
  ]
})

// Let's set up an autorun that will log whenever
// our validation state changes.
// Keep in mind the first output will say all is well,
// but thats because we didnt start validating yet.
autorun(() => {
  console.log('')
  console.log('')
  console.log('-------- Validation Summary ---------')
  console.log('Bad field count: ', Object.keys(validation.errors).length)
  Object.keys(validation.errors).map(key => {
    // errors[key] is an observable array.
    // using slice to print them nicely in the console.
    console.log(
      `Errors for ${key}: `,
      // Add some color to the console output. :)
      inspect(validation.errors[key].slice(), { colors: true })
    )
  })
  console.log(
    '-- So is it valid?',
    validation.isValid ? 'Yes it is!' : 'Hell naw!'
  )
})

// The context needs to be reset every time we validate
// from scratch. See the docs as to why this is useful.
// Wrap it in an action so we batch the resetting and validating.
const validate = action(() => validation.reset().validate())

// First round
validation.validate()

// Let's add our name.
obj.name = 'Jeff'

// We need to validate again.
validate()

// Add an email, except it's not really an email..
obj.email = 'test'
validate()

// Much better!
obj.email = 'test@test.com'
validate()

// Alright now the age..
obj.age = 'twentytwo'
validate()

// Oh, it has to be a number.
obj.age = 2
validate()

// Woops, forgot a digit.
obj.age = 22
validate()

// And we're good!

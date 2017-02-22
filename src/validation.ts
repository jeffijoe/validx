import { observable, extendObservable, action, computed, ObservableMap, IObservableArray } from 'mobx'
const every = require('lodash/every')
const forEach = require('lodash/forEach')

/**
 * Options passed to validators.
 *
 * @export
 * @interface IValidatorOptions
 * @template T The type of the object being validated.
 * @template R The rule type.
 */
export interface IValidatorOptions<T> {
  field: string
  value: any
  obj: T
}

/**
 * Definition of a validator function.
 *
 * @export
 * @interface IValidator
 * @template T Type of the object being validated.
 * @template R The rule type.
 */
export interface IValidator<T> {
  (opts: IValidatorOptions<T>): boolean | string
}

/**
 * The interface all rules must satisfy.
 *
 * @export
 * @interface IRule
 * @template T
 */
export interface IRule<T> {
  msg?: string
}

/**
 * Maps fields on an object to one or more rules.
 *
 * @export
 * @interface IValidationSchema
 * @template T The object type.
 */
export type IValidationSchema<T> = {
  [P in keyof T]?: Array<IValidator<T>>
}

/**
 * Validation errors are stored as a map of fields to error strings.
 *
 * @export
 * @interface IValidationErrors
 */
export interface IValidationErrors {
  [key: string]: IObservableArray<string>
}

/**
 * The validation context interface.
 *
 * @export
 * @interface IValidationContext
 */
export interface IValidationContext {
  errors: IValidationErrors
  isValid: boolean
  reset (): this
  validate <T>(obj: T, schema: IValidationSchema<T>): this
  addErrors (errors: IValidationErrors | { [key: string]: string[] }): this
  getErrors (field: string): string[]
  getError (field: string): string | undefined
}

/**
 * Validation context with the object already bound to the validate function.
 */
export interface IBoundValidationContext<T> extends IValidationContext {
  validate (schema: IValidationSchema<T>): this
  getErrors (field: keyof T): string[]
  getError (field: keyof T): string | undefined
}

/**
 * Validation context with the object already bound to the validate function.
 */
export interface ISchemaBoundValidationContext<T> extends IBoundValidationContext<T> {
  validate (): this
}

/**
 * Implementation of the validation context.
 *
 * @export
 * @class ValidationContext
 * @implements {IValidationContext}
 */
export class ValidationContext implements IValidationContext {
  /**
   * Initializes a new instance of ValidationContext.
   */
  constructor () {
    this.reset = action.bound(this.reset)
    this.addErrors = action.bound(this.addErrors)
    this.validate = action.bound(this.validate)
    extendObservable(this, {
      errorsMap: observable.map<string[]>(),
      errors: computed(() => {
        return this.errorsMap.toJS()
      }),
      isValid: computed(() => {
        return every(this.errors, (arr: string[]) => arr.length === 0)
      })
    })
  }

  /**
   * Internal map of the errors.
   *
   * @private
   *
   * @memberOf ValidationContext
   */
  private errorsMap: ObservableMap<string[]>

  /**
   * All validation errors are stored here. To clear, call `reset`.
   *
   * @readonly
   * @type {IValidationErrors}
   * @memberOf ValidationContext
   */
  readonly errors: IValidationErrors

  /**
   * Determines if the validation context is in a valid state (no errors)
   *
   * @readonly
   * @type {boolean}
   * @memberOf ValidationContext
   */
  readonly isValid: boolean

  /**
   * Resets the errors.
   *
   * @returns {IValidationContext}
   *
   * @memberOf ValidationContext
   */
  reset (): this {
    this.errorsMap.clear()
    return this
  }

  /**
   * Validates the input object and stores any errors that may have occurred
   * in `errors`.
   *
   * @template T The type of the object being validated.
   * @param {T} obj
   * @param {IValidationSchema<T>} schema
   * @returns {IValidationContext}
   *
   * @memberOf ValidationContext
   */
  validate <T>(obj: T, schema: IValidationSchema<T>): this {
    forEach(schema, (validators: Array<IValidator<T>>, field: string) => {
      const errors = this.ensureErrors(field)
      const value = (obj as any)[field]
      forEach(validators, (validator: IValidator<T>) => {
        const opts: IValidatorOptions<T> = {
          field,
          value,
          obj
        }

        let msg = 'This field is invalid.'
        const result = validator(opts)
        if (result === true) {
          return
        } else if (result !== false) {
          msg = (result as string)
        }

        errors.push(msg)
      })
    })
    this.cleanupErrors()
    return this
  }

  /**
   * Adds errors to the context.
   */
  addErrors (errors: IValidationErrors | { [key: string]: string[] }) {
    forEach(errors, (arr: string[], field: string) => {
      this.ensureErrors(field).push(...arr)
    })
    return this
  }
  
  /**
   * Gets the errors for the given field.
   */
  getErrors (field: string) {
    const errors = this.errors[field]
    if (!errors) {
      return []
    }
    
    return errors.slice()
  }
  
  /**
   * Gets the first error for the given field.
   * If not found, returns undefined.
   */
  getError (field: string) {
    return this.getErrors(field)[0]
  }

  /**
   * Ensures that an entry in the internal error map
   * exists for the specified field.
   *
   * @private
   * @param {string} field
   * @returns
   *
   * @memberOf ValidationContext
   */
  private ensureErrors (field: string) {
    let errors = this.errorsMap.get(field)
    if (!errors) {
      errors = observable([])
      this.errorsMap.set(field, errors)
    }

    return errors
  }

  /**
   * At the end of a validation run, if a field
   * has no errors, it's entry in the error map
   * is removed.
   *
   * @private
   *
   * @memberOf ValidationContext
   */
  private cleanupErrors () {
    const entries = this.errorsMap.entries().filter(([, value]) => value.length === 0)
    entries.forEach(([key]) => this.errorsMap.delete(key))
  }
}

export function validationContext <T>(objectToValidate: T, schema: IValidationSchema<T>): ISchemaBoundValidationContext<T>
export function validationContext <T>(objectToValidate: T): IBoundValidationContext<T>
export function validationContext (): IValidationContext
export function validationContext <T>(
  objectToValidate?: any,
  schema?: IValidationSchema<T>
): IValidationContext | IBoundValidationContext<T> | ISchemaBoundValidationContext<T> {
  const v = new ValidationContext()
  if (objectToValidate !== null && objectToValidate !== undefined) {
    if (schema) {
      v.validate = v.validate.bind(v, objectToValidate, schema)
    } else {
      v.validate = v.validate.bind(v, objectToValidate)
    }
  }
  return v
}

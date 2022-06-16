import { IRule, IValidator } from '../validation'
import * as emailValidator from 'email-validator'
import isUrl = require('is-url')

export type Pattern = 'email' | 'url' | RegExp

/**
 * Rule specifics.
 *
 * @export
 * @interface IPatternRule
 * @extends {IRule<any>}
 */
export interface IPatternRule extends IRule {
  pattern: Pattern
}

const DEFAULT_MESSAGE = 'This field is invalid'

const PatternMessages = {
  email: 'This is not a valid email',
  url: 'This is not a valid url',
}

/**
 * The validator function.
 */
export const pattern = (
  rule: IPatternRule | Pattern,
  msg?: string
): IValidator<any> => {
  const validator: IValidator<any> = (opts) => {
    let valid = false
    const pattern =
      typeof rule === 'string' || rule instanceof RegExp ? rule : rule.pattern
    const message =
      typeof rule === 'string' || rule instanceof RegExp ? msg : rule.msg

    if (pattern === 'email') {
      valid = emailValidator.validate(opts.value)
    } else if (pattern === 'url') {
      valid = isUrl(opts.value)
    } else {
      valid = pattern.test(opts.value)
    }

    return (
      valid ||
      message ||
      (typeof pattern === 'string' && PatternMessages[pattern]) ||
      DEFAULT_MESSAGE
    )
  }

  return validator
}

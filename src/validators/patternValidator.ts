import { IRule, IValidator } from '../validation'
import * as emailValidator from 'email-validator'

/**
 * Rule specifics.
 *
 * @export
 * @interface IPatternRule
 * @extends {IRule<any>}
 */
export interface IPatternRule extends IRule<any> {
  pattern: 'email' | RegExp
}

const DEFAULT_MESSAGE = 'This field is invalid'

const PatternMessages = {
  email: 'This is not a valid email'
}

/**
 * The validator function.
 */
export const pattern = (rule: IPatternRule): IValidator<any> => {
  const validator: IValidator<any> = (opts) => {
    let valid = false
    if (rule.pattern === 'email') {
      valid = emailValidator.validate(opts.value)
    } else {
      valid = (rule.pattern as RegExp).test(opts.value)
    }

    return valid || rule.msg || (typeof rule.pattern === 'string' && PatternMessages[rule.pattern]) || DEFAULT_MESSAGE
  }

  return validator
}

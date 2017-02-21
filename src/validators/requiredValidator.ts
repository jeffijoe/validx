import { IValidator, IRule } from '../validation'

/**
 * Rule options.
 */
export interface IRequiredRule extends IRule<any> {
}

const DEFAULT_MESSAGE = 'This field is required'

/**
 * Validates that the field has a truthy value.
 * The only exception is the number 0.
 *
 * @param rule
 * @returns {(opts:any)=>boolean|string|IRequiredRule}
 */
export const required = (rule?: IRequiredRule | string): IValidator<any> => {
  return (opts) => {
    return opts.value || opts.value === 0 // 0 is the only allowed falsy value.
      ? true
      : (typeof rule === 'string' ? rule : rule && rule.msg) || DEFAULT_MESSAGE
  }
}

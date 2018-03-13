import { IValidator, IRule } from '../validation'

/**
 * Rule options.
 */
export interface IRequiredRule extends IRule {
  required?: boolean
}

const DEFAULT_MESSAGE = 'This field is required'

/**
 * Validates that the field has a truthy value.
 * The only exception is the number 0.
 *
 * @param rule
 * @returns {(opts:any)=>boolean|string}
 */
export const required = (rule?: IRequiredRule | string): IValidator<any> => {
  if (
    typeof rule !== 'string' &&
    rule !== undefined &&
    rule.required === false
  ) {
    return () => true
  }

  return opts => {
    return opts.value || opts.value === 0 // 0 is the only allowed falsy value.
      ? true
      : (typeof rule === 'string' ? rule : rule && rule.msg) || DEFAULT_MESSAGE
  }
}

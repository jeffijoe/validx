import { IValidator, IRule } from '../validation'

/**
 * Rule options.
 */
export interface IFuncRule extends IRule<any> {
  fn: IValidator<any>
}

const DEFAULT_MESSAGE = 'This field is not valid'

/**
 * Simple way to run a function and return an error message.
 *
 * @param rule
 * @returns {(opts:any)=>boolean|string}
 */
export const func = (rule: IFuncRule | IValidator<any>, msg: string = DEFAULT_MESSAGE): IValidator<any> => {
  if (!rule) {
    throw new TypeError('Expected a function or a configuration object, got ' + rule)
  }

  return (opts) => {
    if (typeof rule === 'function') {
      return rule(opts) || msg
    }

    return rule.fn(opts) || rule.msg || msg
  }
}

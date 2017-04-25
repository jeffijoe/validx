import { IValidator, IRule } from '../validation'

/**
 * Rule options.
 */
export interface IFuncRule extends IRule<any> {
}

const DEFAULT_MESSAGE = 'This field is not valid'

/**
 * Simple way to run a function and return an error message.
 *
 * @param rule
 * @returns {(opts:any)=>boolean|string}
 */
export const func = (func: IValidator<any>, msg: string = DEFAULT_MESSAGE): IValidator<any> => {
  return (opts) => {
    return func(opts) || msg
  }
}

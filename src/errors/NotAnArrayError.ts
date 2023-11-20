import { InvalidParamError } from './InvalidParamError';

export class NotAnArrayError extends InvalidParamError {
  constructor(param: string) {
    super(`Parameter '${param}' should be an array.`);
  }
}

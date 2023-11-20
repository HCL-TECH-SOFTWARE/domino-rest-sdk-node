import { SdkError } from './SdkError';

export class MissingParamError extends SdkError {
  constructor(param: string) {
    super(`Parameter '${param}' is required.`);
    this.name = 'MissingParamError';
  }
}

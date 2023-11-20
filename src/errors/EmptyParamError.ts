import { SdkError } from './SdkError';

export class EmptyParamError extends SdkError {
  constructor(param: string) {
    super(`Parameter '${param}' should not be empty.`);
    this.name = 'EmptyParamError';
  }
}

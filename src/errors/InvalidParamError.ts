import { SdkError } from './SdkError';

export class InvalidParamError extends SdkError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParamError';
  }
}

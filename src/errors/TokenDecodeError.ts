import { SdkError } from './SdkError';

export class TokenDecodeError extends SdkError {
  constructor(token: string) {
    super(`Can't decode token '${token}'.`);
    this.name = 'TokenDecodeError';
  }
}

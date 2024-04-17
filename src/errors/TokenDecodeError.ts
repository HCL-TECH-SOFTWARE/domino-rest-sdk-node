/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.ts';

export class TokenDecodeError extends SdkError {
  constructor(token: string) {
    super(`Can't decode token '${token}'.`);
    this.name = 'TokenDecodeError';
  }
}

export default TokenDecodeError;

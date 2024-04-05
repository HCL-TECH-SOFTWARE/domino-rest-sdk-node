/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError';

export class TokenError extends SdkError {
  constructor() {
    super(`Access token empty or expired.`);
    this.name = 'TokenError';
  }
}

export default TokenError;

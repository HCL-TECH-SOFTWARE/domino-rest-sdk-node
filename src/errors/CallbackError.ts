/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.js';

export class CallbackError extends SdkError {
  constructor(message: string) {
    super(`${message}`);
    this.name = 'CallbackError';
  }
}

export default CallbackError;

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError';

export class InvalidParamError extends SdkError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParamError';
  }
}

export default InvalidParamError;

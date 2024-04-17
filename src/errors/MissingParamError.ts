/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.ts';

export class MissingParamError extends SdkError {
  constructor(param: string) {
    super(`Parameter '${param}' is required.`);
    this.name = 'MissingParamError';
  }
}

export default MissingParamError;

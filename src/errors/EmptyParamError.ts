/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError';

export class EmptyParamError extends SdkError {
  constructor(param: string) {
    super(`Parameter '${param}' should not be empty.`);
    this.name = 'EmptyParamError';
  }
}

export default EmptyParamError;

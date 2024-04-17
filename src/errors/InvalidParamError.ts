/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.ts';

export class InvalidParamError extends SdkError {
  constructor(param: string, itShould?: string) {
    const message = `Parameter '${param}' is invalid.${itShould ? ` It should ${itShould}.` : ''}`;
    super(message);
    this.name = 'InvalidParamError';
  }
}

export default InvalidParamError;

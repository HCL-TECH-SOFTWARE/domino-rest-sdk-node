/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.js';

export class InvalidParamError extends SdkError {
  constructor(param: string, itShould?: string) {
    const itShouldMessage = itShould ? `It should ${itShould}.` : '';
    const message = `Parameter '${param}' is invalid. ${itShouldMessage}`;
    super(message);
    this.name = 'InvalidParamError';
  }
}

export default InvalidParamError;

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.js';

export class MissingBearerError extends SdkError {
  constructor() {
    super(`No Bearer Found`);
    this.name = 'MissingBearerError';
  }
}

export default MissingBearerError;

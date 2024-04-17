/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.ts';

export class OperationNotAvailable extends SdkError {
  constructor(operation: string) {
    super(`Operation ID '${operation}' is not available.`);
    this.name = 'OperationNotAvailable';
  }
}

export default OperationNotAvailable;

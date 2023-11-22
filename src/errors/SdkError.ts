/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

export class SdkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SdkError';
  }
}

export default SdkError;

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError';

export class NoResponseBody extends SdkError {
  constructor(operation: string) {
    super(`Operation '${operation}' received no response body.`);
    this.name = 'NoResponseBody';
  }
}

export default NoResponseBody;

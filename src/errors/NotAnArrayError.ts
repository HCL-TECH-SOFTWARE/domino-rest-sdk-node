/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import InvalidParamError from './InvalidParamError';

export class NotAnArrayError extends InvalidParamError {
  constructor(param: string) {
    super(`Parameter '${param}' should be an array.`);
  }
}

export default NotAnArrayError;

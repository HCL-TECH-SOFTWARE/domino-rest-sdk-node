/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { InvalidParamError } from './InvalidParamError.ts';

export class EmptyParamError extends InvalidParamError {
  constructor(param: string) {
    super(param, 'not be empty');
  }
}

export default EmptyParamError;

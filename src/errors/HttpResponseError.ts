/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.js';

export type ErrorResponse = {
  statusCode: number;
  message: string;
  errorId: number;
};

export class HttpResponseError extends SdkError {
  statusCode: number;
  errorId: number;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.statusCode = errorResponse.statusCode;
    this.errorId = errorResponse.errorId;
    this.name = 'HttpResponseError';
  }
}

export default HttpResponseError;

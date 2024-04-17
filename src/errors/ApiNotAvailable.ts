/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import SdkError from './SdkError.js';

export class ApiNotAvailable extends SdkError {
  constructor(api: string) {
    super(`API '${api}' not available on this server.`);
    this.name = 'ApiNotAvailable';
  }
}

export default ApiNotAvailable;

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */
'use strict';

module.exports = {
  require: 'ts-node/register',
  spec: ['test/**/*.spec.ts'],
  loader: 'ts-node/esm',
};

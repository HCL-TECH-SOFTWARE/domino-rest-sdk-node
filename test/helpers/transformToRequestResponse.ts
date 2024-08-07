/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoRequestResponse } from '../../src/index.js';

export const transformToRequestResponse = (incoming: any, status?: number): DominoRequestResponse => {
  const stream = incoming !== null && typeof incoming === 'object' ? JSON.stringify(incoming) : incoming;
  const responseObj = new Response(stream, { status: status ?? 200 });

  return {
    status: responseObj.status,
    headers: responseObj.headers,
    dataStream: responseObj.body,
    expect: 'json'
  };
};

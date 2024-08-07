/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoRequestOptions, DominoRestAccess, DominoRestConnector, HttpResponseError, NoResponseBody, streamToJson } from './index.js';

/**
 * API call helper functions for Domino REST operations.
 */
class DominoRestOperations {

  /**
   * Executes a Domino REST operation.
   * 
   * @param dominoConnector {@code DominoConnector} class
   * @param dominoAccess {@code DominoAccess} class
   * @param operationId ID of operation to execute
   * @param options Parameters to execute operation with
   * @param streamDecoder Function to decode the response stream
   * @returns A generic response T base on the REST reply.
   */
  protected static _executeOperation = <T = any>(
    dominoConnector: DominoRestConnector,
    dominoAccess: DominoRestAccess,
    operationId: string,
    options: DominoRequestOptions,
    streamDecoder: (dataStream: ReadableStream<any>) => Promise<T>,
  ) =>
    new Promise<T>((resolve, reject) => {
      dominoConnector
        .request(dominoAccess, operationId, options)
        .then(async (result) => {
          if (result.dataStream === null) {
            throw new NoResponseBody(operationId);
          }
          if (result.status >= 400) {
            const decodedErrorStream = await streamToJson(result.dataStream);
            throw new HttpResponseError(decodedErrorStream);
          }
          const decodedStream = await streamDecoder(result.dataStream);

          return resolve(decodedStream);
        })
        .catch((error) => reject(error));
    });

}

export default DominoRestOperations;

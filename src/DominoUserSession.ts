/* ========================================================================== *
 * Copyright (C) 2023, 2024 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoUserRestSession } from './RestInterfaces.js';
import {
  DominoRequestOptions,
  DominoRestAccess,
  DominoRestConnector,
  HttpResponseError,
  NoResponseBody,
  streamSplit,
  streamToJson,
  streamTransformToJson,
} from './index.js';

/**
 * Takes in both Domino access and connector, and forms a session wherein a user
 * has access to generic Domino REST API operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoUserSession implements DominoUserRestSession {
  dominoAccess: DominoRestAccess;
  dominoConnector: DominoRestConnector;

  constructor(dominoAccess: DominoRestAccess, dominoConnector: DominoRestConnector) {
    this.dominoAccess = dominoAccess;
    this.dominoConnector = dominoConnector;
  }

  request = (operationId: string, options: DominoRequestOptions) => this.dominoConnector.request(this.dominoAccess, operationId, options);

  requestJsonStream = (operationId: string, options: DominoRequestOptions, subscriber: () => WritableStream<any>) =>
    this.dominoConnector.request(this.dominoAccess, operationId, options).then(async (response) => {
      if (response.dataStream === null) {
        throw new NoResponseBody(operationId);
      }
      if (response.status >= 400) {
        const errorResponse = await streamToJson(response.dataStream);
        throw new HttpResponseError(errorResponse);
      }

      await response.dataStream
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(streamSplit())
        .pipeThrough(streamTransformToJson())
        .pipeTo(subscriber());
    });
}

export default DominoUserSession;

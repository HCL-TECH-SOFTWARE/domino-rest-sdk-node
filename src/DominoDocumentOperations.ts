/* ========================================================================== *
 * Copyright (C) 2023, 2024 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import DominoConnector from './DominoConnector.js';
import DominoDocument from './DominoDocument.js';
import { EmptyParamError, HttpResponseError, InvalidParamError, NoResponseBody, NotAnArrayError } from './errors/index.js';
import { streamToJson, streamToText } from './helpers/StreamHelpers.js';
import { isEmpty } from './helpers/Utilities.js';
import { DocumentBody, DocumentJSON, DominoAccess, DominoRequestOptions } from './index.js';

/**
 * A response for document operations that can return document's status after operation.
 */
export type DocumentStatusResponse = {
  /**
   * Status for success or failure.
   */
  statusText: string;
  /**
   * HTTP status code.
   */
  status: number;
  /**
   * Shows a descriptive message on document's status after the operation.
   */
  message: string;
  /**
   * The UNID of document the operation interacted with.
   */
  unid: string;
};

/**
 * An error response if a document failed to be returned in a bulk get operation.
 */
export type BulkGetErrorResponse = {
  /**
   * HTTP status code.
   */
  status: number;
  /**
   * Shows a descriptive message on document's status after the operation.
   */
  message: string;
  /**
   * Error ID.
   */
  errorId: number;
  /**
   * Error details. Typically shows UNID.
   */
  details: string;
};

/**
 * A response for explaining the query after calling the /query API using 'explain' action.
 */
export type QueryDocumentExplainResponse = {
  /**
   * the explanation for the said query with all the needed information for us to understand the query.
   */
  explainResult: string;
};

/**
 * A response for parsing the query after calling the /query API using 'parse' action
 */
export type QueryDocumentParseResponse = {
  /**
   * the string result for the said query containing the parse result.
   */
  parseResult: string;
};

/**
 * Possible Properties inside a request body of /bulk/update and /query
 */
export type QueryOptions = {
  /**
   * Limits the number of documents to be scanned.
   */
  maxScanDocs?: number;
  /**
   * Limits the number of entries to be scanned.
   */
  maxScanEntries?: number;
  /**
   * Form mode as configured for any of the forms returned by the query.
   */
  mode?: string;
  /**
   * Disable use of views when true.
   */
  noViews?: boolean;
  /**
   * DQL query string.
   */
  query: string;
  /**
   * Key-value pairs of form data to update.
   */
  replaceItems: { [key: string]: any };
  /**
   * Key-value to replace ?<variable_name> in query.
   */
  variables?: { [key: string]: any };
  /**
   * If true, replaces the operation response to array of {@link DominoDocument}
   */
  returnUpdatedDocument?: boolean;
  /**
   * Query timeout in seconds.
   */
  timeoutSecs?: number;
  /**
   * Should views get refreshed after operation execution.
   */
  viewRefresh?: boolean;
  /**
   * Indicates how many documents will the operation skip on the matched documents. Default is 0.
   */
  start?: number;
  /**
   * Indicates how many responses the operation will return. Default is maxInt.
   */
  count?: number;

  /**
   * List of form names to be added to the query. Domino REST API will lookup all potential alias values and add them to the query clause
   */
  forms?: string[];

  /**
   * If form names added to the query, this parameter will indicate whether all form alias should be included in the query clause.
   */
  includeFormAlias?: boolean;
  /**
   * Mark documents as read by the current user when retrieved
   */
  markRead?: boolean;
};

/**
 * Options to use for document operations.
 */
export type DocumentOptions = {
  /**
   * If true, compute with document's form formula before performing operation
   */
  computeWithForm?: boolean;
  /**
   * If true, also return meta data of the document.
   */
  meta?: boolean;
  /**
   * The {@link string} the RichText fields will be returned.
   */
  richTextAs?: string;
  /**
   * Mark the document as read by the current user when the operation completes.
   */
  markRead?: boolean /** TODO: mutually exclusive with markUnread */;
  /**
   * Mark the document as unread by the current user when the operation completes.
   */
  markUnread?: boolean /** TODO: mutually exclusive with markRead */;
  /**
   * Mode to perform the document access in. Defaults to 'default' if missing.
   */
  mode?: string;
  /**
   * UNID of an existing document, to make this a response document.
   */
  parentUnid?: string;
  /**
   * This field records the current revision version of document. It's a 32-character hex-encoded
   * string of date. If DB config 'requireRevisionToUpdate' is enabled, then revision is required
   * when updating the document and only updates document when revision version is right.
   */
  revision?: string;
};

/**
 * Options for get document operation.
 */
export type GetDocumentOptions = Omit<DocumentOptions, 'revision'>;

/**
 * Options for create document operation.
 */
export type CreateDocumentOptions = Pick<DocumentOptions, 'parentUnid' | 'richTextAs'>;

/**
 * Options for update document operation.
 */
export type UpdateDocumentOptions = Omit<DocumentOptions, 'computeWithForm' | 'meta' | 'markRead'>;

/**
 * Options for patch document operation.
 */
export type PatchDocumentOptions = Omit<DocumentOptions, 'computeWithForm' | 'meta' | 'markRead'>;

/**
 * Update documents based on a query, a form mode and a set of fields to be updated.
 */
export type BulkUpdateDocumentsByQueryRequest = Omit<QueryOptions, 'forms' | 'markRead' | 'includeFormAlias'>;

/**
 * Get documents based on a query.
 */
export type GetDocumentsByQueryRequest = Omit<QueryOptions, 'returnUpdatedDocument' | 'replaceItems' | 'count' | 'start'>;

/**
 * Options for bulk get document operation.
 */
export type BulkGetDocumentsOptions = Pick<DocumentOptions, 'meta' | 'richTextAs'>;

/**
 * Options for /query operation.
 */
export type GetDocumentsByQueryOptions = {
  /**
   * How many entries shall be returned, default = Integer.MaxInteger
   */
  count?: number;
  /**
   * The {@link string} the RichText fields will be returned.
   */
  richTextAs?: string;
  /**
   * At which entry should return values start (zero based), default = 0
   */
  start?: number;
};
/**
 * Options for bulk create document operation.
 */
export type BulkCreateDocumentsOptions = Pick<DocumentOptions, 'richTextAs'>;

/**
 * Options for GET `/richtext/{richTextAs}/{unid}` operation.
 */
export type GetRichtextOptions = {
  /**
   * Mode to perform the document access in. Defaults to "default" if missing.
   */
  mode?: string;
  /**
   * Name of the RichText item to retrieve. When omitted "Body" is used as item name.
   */
  item?: string;
};

/**
 * Different methods for query.
 */
export enum QueryActions {
  /**
   * Executes a query string passed in according to set parameters and returns a list of documents.
   */
  EXECUTE = 'execute',
  /**
   * The best way to understand how DQL syntax will be processed.
   */
  EXPLAIN = 'explain',
  /**
   * Useful in getting your DQL queries to have proper syntax. There is no query processing performed. Errors like unmatched parens, quotes, or malformed terms are all caught and returned.
   */
  PARSE = 'parse',
}

/**
 * API call helper functions for document operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoDocumentOperations {
  static getDocument = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unid: string,
    options?: GetDocumentOptions,
  ) =>
    new Promise<DominoDocument>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(unid)) {
        return reject(new EmptyParamError('unid'));
      }
      if (unid.length !== 32) {
        return reject(new InvalidParamError('unid', 'have a length of 32'));
      }

      const params: Map<string, any> = new Map();
      params.set('unid', unid);
      for (const key in options) {
        params.set(key, options[key as keyof GetDocumentOptions]);
      }

      const reqOptions = { dataSource, params };

      this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'getDocument', reqOptions, streamToJson)
        .then((document) => resolve(new DominoDocument(document)))
        .catch((error) => reject(error));
    });

  static createDocument = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    doc: DocumentJSON,
    options?: CreateDocumentOptions,
  ) =>
    new Promise<DominoDocument>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(doc)) {
        return reject(new EmptyParamError('doc'));
      }

      const dominoDoc = new DominoDocument(doc);

      const params: Map<string, any> = new Map();
      for (const key in options) {
        params.set(key, options[key as keyof CreateDocumentOptions]);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify(dominoDoc.toDocJson()),
      };

      this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'createDocument', reqOptions, streamToJson)
        .then((document) => resolve(new DominoDocument(document)))
        .catch((error) => reject(error));
    });

  static updateDocument = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    doc: DominoDocument,
    options?: UpdateDocumentOptions,
  ) =>
    new Promise<DominoDocument>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(doc)) {
        return reject(new EmptyParamError('doc'));
      }
      const unid = doc.getUNID();
      if (isEmpty(unid)) {
        return reject(new EmptyParamError('document unid'));
      } else if ((unid as string).length !== 32) {
        return reject(new InvalidParamError('document unid', 'have a length of 32'));
      }

      const params: Map<string, any> = new Map();
      params.set('unid', unid);
      for (const key in options) {
        params.set(key, options[key as keyof UpdateDocumentOptions]);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify(doc.toDocJson()),
      };

      this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'updateDocument', reqOptions, streamToJson)
        .then((document) => resolve(new DominoDocument(document)))
        .catch((error) => reject(error));
    });

  static patchDocument = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unid: string,
    docJsonPatch: DocumentJSON,
    options?: UpdateDocumentOptions,
  ) =>
    new Promise<DominoDocument>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(unid)) {
        return reject(new EmptyParamError('unid'));
      }
      if (unid.length !== 32) {
        return reject(new InvalidParamError('unid', 'have a length of 32'));
      }
      if (isEmpty(docJsonPatch)) {
        return reject(new EmptyParamError('docJsonPatch'));
      }

      const params: Map<string, any> = new Map();
      params.set('unid', unid);
      for (const key in options) {
        params.set(key, options[key as keyof PatchDocumentOptions]);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify(docJsonPatch),
      };

      this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'patchDocument', reqOptions, streamToJson)
        .then((document) => resolve(new DominoDocument(document)))
        .catch((error) => reject(error));
    });

  static deleteDocument = (dataSource: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector, doc: DominoDocument, mode?: string) =>
    new Promise<DocumentStatusResponse>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(doc)) {
        return reject(new EmptyParamError('doc'));
      }
      const unid = doc.getUNID();
      if (isEmpty(unid)) {
        return reject(new EmptyParamError('document unid'));
      }
      if ((unid as string).length !== 32) {
        return reject(new InvalidParamError('Document unid has an invalid value.'));
      }

      const params: Map<string, any> = new Map();
      params.set('unid', unid);
      if (mode !== undefined) {
        params.set('mode', mode);
      }

      const reqOptions: DominoRequestOptions = { dataSource, params };

      this._executeOperation<DocumentStatusResponse>(dominoConnector, dominoAccess, 'deleteDocument', reqOptions, streamToJson)
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });

  static deleteDocumentByUNID = (dataSource: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector, unid: string, mode?: string) =>
    new Promise<DocumentStatusResponse>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(unid)) {
        return reject(new EmptyParamError('unid'));
      }
      if (unid.length !== 32) {
        return reject(new InvalidParamError('UNID has an invalid value.'));
      }

      const params: Map<string, any> = new Map();
      params.set('unid', unid);
      if (mode !== undefined) {
        params.set('mode', mode);
      }

      const reqOptions: DominoRequestOptions = { dataSource, params };

      this._executeOperation<DocumentStatusResponse>(dominoConnector, dominoAccess, 'deleteDocument', reqOptions, streamToJson)
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });

  static bulkGetDocuments = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unids: string[],
    options?: BulkGetDocumentsOptions,
  ) =>
    new Promise<Array<DominoDocument | BulkGetErrorResponse>>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(unids)) {
        return reject(new EmptyParamError('unids'));
      }
      if (!Array.isArray(unids)) {
        return reject(new NotAnArrayError('unids'));
      }
      for (const unid of unids) {
        if (isEmpty(unid)) {
          return reject(new InvalidParamError('unids', 'have non-empty entries'));
        }
        if (unid.length !== 32) {
          return reject(new InvalidParamError('unids', 'have all entries should have length of 32'));
        }
      }

      const params: Map<string, any> = new Map();
      for (const key in options) {
        params.set(key, options[key as keyof BulkGetDocumentsOptions]);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify({ unids }),
      };

      this._executeOperation<Array<DocumentBody | BulkGetErrorResponse>>(
        dominoConnector,
        dominoAccess,
        'bulkGetDocumentsByUnid',
        reqOptions,
        streamToJson,
      )
        .then((response) =>
          resolve(
            response.map((item) => {
              if ('Form' in item) {
                return new DominoDocument(item);
              }
              return item;
            }),
          ),
        )
        .catch((error) => reject(error));
    });

  static getDocumentsByQuery = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    request: GetDocumentsByQueryRequest,
    qaction: QueryActions,
    options?: GetDocumentsByQueryOptions,
  ) =>
    new Promise<DominoDocument[] | QueryDocumentExplainResponse[] | QueryDocumentParseResponse[]>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(request)) {
        return reject(new EmptyParamError('request'));
      }
      if (isEmpty(request.query)) {
        return reject(new EmptyParamError('request.query'));
      }
      if (isEmpty(qaction)) {
        return reject(new EmptyParamError('qaction'));
      }

      const params: Map<string, any> = new Map();
      for (const key in options) {
        params.set(key, options[key as keyof GetDocumentsByQueryOptions]);
      }
      params.set('action', qaction);

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify(request),
      };

      this._executeOperation<DocumentBody[] | QueryDocumentExplainResponse[] | QueryDocumentParseResponse[]>(
        dominoConnector,
        dominoAccess,
        'query',
        reqOptions,
        streamToJson,
      )
        .then((response) => {
          if (qaction === QueryActions.EXPLAIN) {
            resolve(response as QueryDocumentExplainResponse[]);
          } else if (qaction === QueryActions.PARSE) {
            resolve(response as QueryDocumentParseResponse[]);
          } else {
            resolve(response.map((doc) => new DominoDocument(doc as DocumentBody)));
          }
        })
        .catch((error) => reject(error));
    });

  static bulkCreateDocuments = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    docs: DocumentJSON[],
    richTextAs?: string,
  ) =>
    new Promise<DominoDocument[]>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(docs)) {
        return reject(new EmptyParamError('docs'));
      }
      if (!Array.isArray(docs)) {
        return reject(new NotAnArrayError('docs'));
      }

      const params: Map<string, any> = new Map();
      if (richTextAs !== undefined) {
        params.set('richTextAs', richTextAs);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify({ documents: docs }),
      };

      this._executeOperation<DocumentBody[]>(dominoConnector, dominoAccess, 'bulkCreateDocuments', reqOptions, streamToJson)
        .then((documents) => resolve(documents.map((document) => new DominoDocument(document))))
        .catch((error) => reject(error));
    });

  static bulkUpdateDocumentsByQuery = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    request: BulkUpdateDocumentsByQueryRequest,
    richTextAs?: string,
  ) =>
    new Promise<DominoDocument[] | DocumentStatusResponse[]>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(request)) {
        return reject(new EmptyParamError('request'));
      }
      if (isEmpty(request.query)) {
        return reject(new EmptyParamError('request.query'));
      }
      if (isEmpty(request.replaceItems)) {
        return reject(new EmptyParamError('request.replaceItems'));
      }

      const params: Map<string, any> = new Map();
      if (richTextAs !== undefined) {
        params.set('richTextAs', richTextAs);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify(request),
      };

      this._executeOperation<DocumentBody[] | DocumentStatusResponse[]>(
        dominoConnector,
        dominoAccess,
        'bulkUpdateDocumentsByQuery',
        reqOptions,
        streamToJson,
      )
        .then((response) => {
          if (request.returnUpdatedDocument === true) {
            return resolve(response.map((document) => new DominoDocument(document as DocumentBody)));
          }
          return resolve(response as DocumentStatusResponse[]);
        })
        .catch((error) => reject(error));
    });

  static bulkDeleteDocuments = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    docs: DominoDocument[],
    mode?: string,
  ) =>
    new Promise<DocumentStatusResponse[]>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(docs)) {
        return reject(new EmptyParamError('docs'));
      }
      if (!Array.isArray(docs)) {
        return reject(new NotAnArrayError(`docs`));
      }
      const unids: string[] = [];
      for (const doc of docs) {
        const unid = doc.getUNID();
        if (isEmpty(unid)) {
          return reject(new InvalidParamError('docs', 'have documents with non-empty unid'));
        }
        if ((unid as string).length !== 32) {
          return reject(new InvalidParamError('docs', 'have documents with unid having length of 32'));
        }
        unids.push(unid as string);
      }

      const body: { unids: string[]; mode?: string } = { unids };
      if (mode !== undefined) {
        body.mode = mode;
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params: new Map(),
        body: JSON.stringify(body),
      };

      this._executeOperation<DocumentStatusResponse[]>(dominoConnector, dominoAccess, 'bulkDeleteDocuments', reqOptions, streamToJson)
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });

  static bulkDeleteDocumentsByUNID = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unids: string[],
    mode?: string,
  ) =>
    new Promise<DocumentStatusResponse[]>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(unids)) {
        return reject(new EmptyParamError('unids'));
      }
      if (!Array.isArray(unids)) {
        return reject(new NotAnArrayError('unids'));
      }
      for (const unid of unids) {
        if (isEmpty(unid)) {
          return reject(new InvalidParamError('unids', 'have non-empty entries'));
        }
        if (unid.length !== 32) {
          return reject(new InvalidParamError('unids', 'have all entries should have length of 32'));
        }
      }

      const body: { unids: string[]; mode?: string } = { unids };
      if (mode !== undefined) {
        body.mode = mode;
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params: new Map(),
        body: JSON.stringify(body),
      };

      this._executeOperation<DocumentStatusResponse[]>(dominoConnector, dominoAccess, 'bulkDeleteDocuments', reqOptions, streamToJson)
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });

  static getRichtext = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unid: string,
    richTextAs: string,
    options?: GetRichtextOptions,
  ) =>
    new Promise<string>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(unid)) {
        return reject(new EmptyParamError('unid'));
      }
      if (isEmpty(richTextAs)) {
        return reject(new EmptyParamError('richTextAs'));
      }

      const params: Map<string, any> = new Map();
      for (const key in options) {
        params.set(key, options[key as keyof GetRichtextOptions]);
      }
      params.set('unid', unid);
      params.set('richTextAs', richTextAs);

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
      };

      this._executeOperation<string>(dominoConnector, dominoAccess, 'getRichText', reqOptions, streamToText)
        .then((richtextValue) => resolve(richtextValue))
        .catch((error) => reject(error));
    });

  private static _executeOperation = <T = any>(
    dominoConnector: DominoConnector,
    dominoAccess: DominoAccess,
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

export default DominoDocumentOperations;

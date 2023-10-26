/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DocumentBody, DocumentJSON, DominoAccess, DominoRequestOptions } from '.';
import DominoConnector from './DominoConnector';
import DominoDocument from './DominoDocument';

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
   * The {@link RichTextRepresentation} the RichText fields will be returned.
   */
  richTextAs?: RichTextRepresentation;
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
   * The {@link RichTextRepresentation} the RichText fields will be returned.
   */
  richTextAs?: RichTextRepresentation;
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
 * Different representations for RichText.
 */
export enum RichTextRepresentation {
  /**
   * Return richtext fields as HTML.
   */
  HTML = 'html',
  /**
   * Return richtext fields as mime.
   */
  MIME = 'mime',
  /**
   * Return richtext fields as markdown.
   */
  MARKDOWN = 'markdown',
  /**
   * Return richtext fields as plain text.
   */
  PLAIN = 'plain',
}
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
  private static _executeOperation = async <T = any>(
    dominoConnector: DominoConnector,
    dominoAccess: DominoAccess,
    operationId: string,
    options: DominoRequestOptions,
  ): Promise<T> => {
    const response = await dominoConnector.request<T>(dominoAccess, operationId, options);
    return Promise.resolve(response);
  };

  static getDocument = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unid: string,
    options?: GetDocumentOptions,
  ): Promise<DominoDocument> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (unid.trim().length === 0) {
      return Promise.reject(new Error('UNID must not be empty.'));
    }
    if (unid.length !== 32) {
      return Promise.reject(new Error('UNID has an invalid value.'));
    }

    const params: Map<string, any> = new Map();
    params.set('unid', unid);
    for (const key in options) {
      params.set(key, options[key as keyof GetDocumentOptions]);
    }

    const reqOptions: DominoRequestOptions = {
      dataSource,
      params,
    };
    const docResponse = await this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'getDocument', reqOptions);
    return Promise.resolve(new DominoDocument(docResponse));
  };

  static createDocument = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    doc: DocumentJSON,
    options?: CreateDocumentOptions,
  ): Promise<DominoDocument> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
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

    const docResponse = await this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'createDocument', reqOptions);
    return Promise.resolve(new DominoDocument(docResponse));
  };

  static updateDocument = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    doc: DominoDocument,
    options?: UpdateDocumentOptions,
  ): Promise<DominoDocument> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    const unid = doc.getUNID();
    if (unid === undefined || unid.trim().length === 0) {
      return Promise.reject(new Error('Document UNID must not be empty.'));
    }
    if (unid.length !== 32) {
      return Promise.reject(new Error('Document UNID has an invalid value.'));
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

    const docResponse = await this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'updateDocument', reqOptions);
    return Promise.resolve(new DominoDocument(docResponse));
  };

  static patchDocument = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unid: string,
    docJsonPatch: DocumentJSON,
    options?: UpdateDocumentOptions,
  ): Promise<DominoDocument> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (unid === undefined || unid.trim().length === 0) {
      return Promise.reject(new Error('UNID must not be empty.'));
    }
    if (unid.length !== 32) {
      return Promise.reject(new Error('UNID has an invalid value.'));
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

    const docResponse = await this._executeOperation<DocumentBody>(dominoConnector, dominoAccess, 'patchDocument', reqOptions);
    return Promise.resolve(new DominoDocument(docResponse));
  };

  static deleteDocument = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    doc: DominoDocument,
    mode?: string,
  ): Promise<DocumentStatusResponse> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    const unid = doc.getUNID();
    if (unid === undefined || unid.trim().length === 0) {
      return Promise.reject(new Error('Document UNID should not be empty.'));
    }
    if (unid.length !== 32) {
      return Promise.reject(new Error('Document UNID has an invalid value.'));
    }

    const params: Map<string, any> = new Map();
    params.set('unid', unid);
    if (mode !== undefined) {
      params.set('mode', mode);
    }

    const reqOptions: DominoRequestOptions = { dataSource, params };
    const response = await this._executeOperation<DocumentStatusResponse>(dominoConnector, dominoAccess, 'deleteDocument', reqOptions);
    return Promise.resolve(response);
  };

  static deleteDocumentByUNID = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unid: string,
    mode?: string,
  ): Promise<DocumentStatusResponse> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (unid.trim().length === 0) {
      return Promise.reject(new Error('UNID should not be empty.'));
    }
    if (unid.length !== 32) {
      return Promise.reject(new Error('UNID has an invalid value.'));
    }

    const params: Map<string, any> = new Map();
    params.set('unid', unid);
    if (mode !== undefined) {
      params.set('mode', mode);
    }

    const reqOptions: DominoRequestOptions = {
      dataSource,
      params,
    };
    const response = await this._executeOperation<DocumentStatusResponse>(dominoConnector, dominoAccess, 'deleteDocument', reqOptions);
    return Promise.resolve(response);
  };

  static bulkGetDocuments = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unids: string[],
    options?: BulkGetDocumentsOptions,
  ): Promise<Array<DominoDocument | BulkGetErrorResponse>> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (unids.length === 0) {
      return Promise.reject(new Error('UNIDs array should not be empty.'));
    }
    for (const unid of unids) {
      if (unid.trim().length === 0) {
        return Promise.reject(new Error('One of given UNIDs is empty.'));
      }
      if (unid.length !== 32) {
        return Promise.reject(new Error('One of given UNIDs is invalid.'));
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
    const response = await this._executeOperation<Array<DocumentBody | BulkGetErrorResponse>>(
      dominoConnector,
      dominoAccess,
      'bulkGetDocumentsByUnid',
      reqOptions,
    );
    return Promise.resolve(
      response.map((item) => {
        if ('Form' in item) {
          return new DominoDocument(item);
        }
        return item;
      }),
    );
  };

  static getDocumentsByQuery = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    request: GetDocumentsByQueryRequest,
    qaction: QueryActions,
    options?: GetDocumentsByQueryOptions,
  ): Promise<DominoDocument[] | QueryDocumentExplainResponse[] | QueryDocumentParseResponse[]> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (request.query.trim().length === 0) {
      return Promise.reject(new Error(`'query' inside Request Body should not be empty.`));
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
    const response = await this._executeOperation<DocumentBody[] | QueryDocumentExplainResponse[] | QueryDocumentParseResponse[]>(
      dominoConnector,
      dominoAccess,
      'query',
      reqOptions,
    );
    if (qaction == QueryActions.EXPLAIN) {
      return Promise.resolve(response as QueryDocumentExplainResponse[]);
    } else if (qaction == QueryActions.PARSE) {
      return Promise.resolve(response as QueryDocumentParseResponse[]);
    } else {
      return Promise.resolve(response.map((doc) => new DominoDocument(doc as DocumentBody)));
    }
  };

  static bulkCreateDocuments = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    docs: DocumentJSON[],
    richTextAs?: RichTextRepresentation,
  ): Promise<DominoDocument[]> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (docs.length === 0) {
      return Promise.reject(new Error('Documents array should not be empty.'));
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
    const response = await this._executeOperation<DocumentBody[] | DocumentStatusResponse[]>(
      dominoConnector,
      dominoAccess,
      'bulkCreateDocuments',
      reqOptions,
    );
    return Promise.resolve(response.map((doc) => new DominoDocument(doc as DocumentBody)));
  };

  static bulkUpdateDocumentsByQuery = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    request: BulkUpdateDocumentsByQueryRequest,
    richTextAs?: RichTextRepresentation,
  ): Promise<DominoDocument[] | DocumentStatusResponse[]> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (request.query.trim().length === 0) {
      return Promise.reject(new Error(`'query' inside Request Body should not be empty.`));
    }
    if (request.replaceItems === undefined || Object.keys(request.replaceItems).length === 0) {
      return Promise.reject(new Error('Request replaceItems should not be empty.'));
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
    const response = await this._executeOperation<DocumentBody[] | DocumentStatusResponse[]>(
      dominoConnector,
      dominoAccess,
      'bulkUpdateDocumentsByQuery',
      reqOptions,
    );
    if (request.returnUpdatedDocument === true) {
      return Promise.resolve(response.map((doc) => new DominoDocument(doc as DocumentBody)));
    }
    return Promise.resolve(response as DocumentStatusResponse[]);
  };

  static bulkDeleteDocuments = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    docs: DominoDocument[],
    mode?: string,
  ): Promise<DocumentStatusResponse[]> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (docs.length === 0) {
      return Promise.reject(new Error('Documents array should not be empty.'));
    }
    const unids: string[] = [];
    for (const doc of docs) {
      const unid = doc.getUNID();
      if (unid === undefined || unid.trim().length === 0) {
        return Promise.reject(new Error('One of given documents has empty UNID.'));
      }
      if (unid.length !== 32) {
        return Promise.reject(new Error('One of given documents has invalid UNID.'));
      }
      unids.push(unid);
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

    const response = await this._executeOperation<DocumentStatusResponse[]>(dominoConnector, dominoAccess, 'bulkDeleteDocuments', reqOptions);
    return Promise.resolve(response);
  };

  static bulkDeleteDocumentsByUNID = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    unids: string[],
    mode?: string,
  ): Promise<DocumentStatusResponse[]> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (unids.length === 0) {
      return Promise.reject(new Error('UNIDs array should not be empty.'));
    }
    for (const unid of unids) {
      if (unid.trim().length === 0) {
        return Promise.reject(new Error('One of given UNIDs is empty.'));
      }
      if (unid.length !== 32) {
        return Promise.reject(new Error('One of given UNIDs is invalid.'));
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

    const response = await this._executeOperation<DocumentStatusResponse[]>(dominoConnector, dominoAccess, 'bulkDeleteDocuments', reqOptions);
    return Promise.resolve(response);
  };
}

export default DominoDocumentOperations;

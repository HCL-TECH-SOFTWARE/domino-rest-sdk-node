/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* istanbul ignore file */
/* Interfaces have no testable code - no point including them in coverage reports */
import {
  BulkGetDocumentsOptions,
  BulkGetErrorResponse,
  BulkUpdateDocumentsByQueryRequest,
  CreateDocumentOptions,
  CreateUpdateListResponse,
  DesignOptions,
  DocumentBody,
  DocumentJSON,
  DocumentStatusResponse,
  DominoAccess,
  DominoApiMeta,
  DominoBaseDocument,
  DominoBaseListView,
  DominoBaseListViewEntry,
  DominoBaseScope,
  DominoRequestOptions,
  DominoRestOperation,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  GetDocumentsByQueryRequest,
  GetListPivotViewEntryOptions,
  GetListViewDesignJSON,
  GetListViewEntryOptions,
  GetListViewJSON,
  GetListViewOptions,
  ListViewBody,
  PivotListViewResponse,
  QueryActions,
  QueryDocumentExplainResponse,
  QueryDocumentParseResponse,
  RestCredentials,
  RichTextRepresentation,
  ScopeBody,
  ScopeJSON,
  UpdateDocumentOptions,
} from '.';
import { streamSplit, streamTransformToJson } from './helpers/StreamHelpers';
import DominoConnector, { DominoRequestResponse } from './DominoConnector';
import DominoDocument from './DominoDocument';
import DominoListViewEntry, { ListViewEntryJSON } from './DominoListViewEntry';
import DominoScope from './DominoScope';

/* istanbul ignore file */
/* Interfaces have no testable code - no point including them in coverage reports */

/**
 * DominoRestAccess to provide JWT Access Tokens to the REST menthods. Might use an
 * authentication method like Basic or OAuth.
 */
export interface DominoRestAccess {
  /**
   * Base URL of the Idp: Domino REST API, Active Directory, Keycloak, Octa, etc.
   */
  baseUrl: string;
  /**
   * The JWT token for access.
   */
  token?: string;
  /**
   * Expiry time of JWT token in seconds.
   */
  expiryTime?: number;
  /**
   * Updates current credentials using the given new credentials.
   *
   * @param credentials the new credentials to have.
   * @returns the incoming new credentials.
   *
   * @throws an error if credential type is BASIC, and no username or password is given.
   * @throws an error if credentual type is OAUTH, and no appSecret, appId, or refreshToken is given.
   */
  updateCredentials: (credentials: RestCredentials) => RestCredentials;
  /**
   * Fetches a JWT token from Domino REST API url if there is no current token or current
   * token is expired.
   *
   * @returns a promise the resolves the JWT token for access.
   */
  accessToken: () => Promise<string>;
  /**
   * Get JWT token (if any) expiry.
   *
   * @returns the expiry time of token in seconds or null if there is no expiry time yet.
   */
  expiry: () => number | null;
  /**
   * Get current credentials given scope.
   *
   * @returns the scope of given credentials or null of no scope is given.
   */
  scope: () => string | null;
  /**
   * Creates a clone of current DominoAccess with the given alternate scope.
   *
   * @param alternateScope the alternate scope the clone DominoAccess will have.
   * @returns a clone of current DominoAccess that has the alternate scope.
   */
  clone: (alternateScope: string) => DominoAccess;
}

/**
 * User and session independent information on Domino REST API server.
 */
export interface DominoRestServer {
  /**
   * Base URL of Domino REST API server.
   */
  readonly baseUrl: string;
  /**
   * Gets all available APIs on Domino REST API server. Will fetch from /api endpoint if
   * API map is yet to be loaded.
   *
   * @returns an array of available APIs.
   */
  availableApis: () => Array<string>;
  /**
   * Get a DominoConnector instance of the given API name.
   *
   * @param apiName the API that will be used for the DominoConnector
   * @returns a promise that resolves to DominoConnector of the given API.
   *
   * @throws an error if given API name is not available on the server.
   */
  getDominoConnector: (apiName: string) => Promise<DominoConnector>;
  /**
   * Gets all available operations with its specifications under the given API.
   *
   * @param apiName the API that contains all the operations.
   * @returns a promise that resolves a map with operation ID as keys and the operation's specifications as the value.
   *
   * @throws an error when it failed to load available APIs from Domino REST API server.
   */
  availableOperations: (apiName: string) => Promise<Map<string, any>>;
}

/**
 * Domino REST API scope interface.
 */
export interface DominoRestScope extends DominoBaseScope {
  /**
   * Name that is used in dataSource parameter to access mapped resource.
   */
  apiName: string;
  /**
   * Explanation of the scope.
   */
  description?: string;
  /**
   * Base64 encoded icon (preferably SVG).
   */
  icon?: string;
  /**
   * Alternate text for icon.
   */
  iconName?: string;
  /**
   * Allows to enable/disable API access without removing configuration.
   */
  isActive?: boolean;
  /**
   * Limits, but not extends the access level granted to an API user. Mirrors the
   * MaximumInternetAccess in DB ACLs. Default if not provided is Editor.
   */
  maximumAccessLevel?: string;
  /**
   * Path relative to Domino data directory to NSF database.
   */
  nsfPath: string;
  /**
   * Name (without .json extension) of schema file in NSF REST file resources.
   */
  schemaName: string;
  /**
   * Domino server name that this scope is enabled on. Empty or '*' mean that this scope is enabled
   * on all Domino servers.
   */
  server?: string;
  /**
   * Transform scope properties without the base properties to JSON.
   *
   * @returns JSON representation of scope without its base properties.
   */
  toScopeJson: () => ScopeJSON;
  /**
   * Transform scope properties to JSON.
   *
   * @returns JSON representation of all scope properties.
   */
  toJson: () => Partial<ScopeBody>;
}

/**
 * Domino REST API document interface.
 */
export interface DominoRestDocument extends DominoBaseDocument {
  /**
   * Maps document fields and values where field names are stored as keys with value as the field
   * value.
   */
  fields: Map<string, any>;
  /**
   * Get document UNID if present.
   *
   * @returns the document's UNID if present, else returns undefined.
   */
  getUNID: () => string | undefined;
  /**
   * Set the UNID of document.
   *
   * @param unid the UNID to set
   */
  setUNID: (unid: string) => void;
  /**
   * Get document revision if present.
   *
   * @returns the document's revision if present, else returns undefined.
   */
  getRevision: () => string | undefined;
  /**
   * Get the form value and the document's fields and its values in JSON format.
   *
   * @returns the form value and fields in JSON format.
   */
  toDocJson: () => DocumentJSON;
  /**
   * Get all of documents properties in JSON format.
   *
   * @returns all properties of document in JSON format.
   */
  toJson: () => Partial<DocumentBody>;
}

export interface DominoRestListView extends DominoBaseListView {
  toListViewJson: () => ListViewBody;
}

export interface DominoRestListViewEntry extends DominoBaseListViewEntry {}

/**
 * Interface to perform different Rest API operations.
 */
export interface DominoUserRestSession {
  /**
   * Provides access to Domino REST API server.
   */
  dominoAccess: DominoAccess;
  /**
   * Provides accessible operations and its required parameters.
   */
  dominoConnector: DominoConnector;
  /**
   * Generic request method to use. One can call all Domino REST API operations as long
   * as the operation ID and all the provided options are valid.
   *
   * @param operationId the operation ID according to OpenAPI specification
   * @param options all data that needs to be provided to the Domino Rest connector
   * @returns a promise that resolves to the request's response.
   */
  request: (operationId: string, options: DominoRequestOptions) => Promise<DominoRequestResponse>;
  /**
   * An extension of the {@link request} method. It automatically pipes the response data stream
   * through TextDecoderStream, {@link streamSplit} and {@link streamTransformToJson} respectively
   * before piping it to the given subscriber.
   *
   * @param operationId the operation ID according to OpenAPI specification
   * @param options all data that needs to be provided to the Domino Rest connector
   * @param subscriber a function that receives each JSON from the pipe stream
   * @returns void, the given subscriber will handle how the response is managed.
   *
   * @throws {NoResponseBody} received response data stream is null.
   * @throws {HttpResponseError} received response has error status code.
   */
  requestJsonStream: (operationId: string, options: DominoRequestOptions, subscriber: () => WritableStream<any>) => Promise<void>;
  /**
   * Get a document via its UNID. Additional request options can be provided.
   *
   * @param dataSource the scope name
   * @param unid the UNID of the document to get
   * @param options options for get document operation
   * @returns a promise that resolves to the document fetched.
   *
   * @throws an error if given UNID is empty.
   * @throws an error if given UNID is invalid.
   */
  getDocument: (dataSource: string, unid: string, options?: GetDocumentOptions) => Promise<DominoDocument>;
  /**
   * Create a document with the provided document JSON. Additional request options
   * can be provided.
   *
   * @param dataSource the scope name
   * @param doc JSON containing the document data to be saved
   * @param options options for create document operation
   * @returns a promise that resolves to the document created.
   */
  createDocument: (dataSource: string, doc: DocumentJSON, options?: CreateDocumentOptions) => Promise<DominoDocument>;
  /**
   * Update the given {@link DominoDocument} (performs a PUT operation). Additional request
   * options can be provided.
   *
   * @param dataSource the scope name
   * @param doc {@link DominoDocument} to update
   * @param options options for update document operation
   * @returns a promise that resolves to the updated document.
   *
   * @throws an error if given document has empty UNID.
   * @throws an error if given document has invalid UNID.
   */
  updateDocument: (dataSource: string, doc: DominoDocument, options: UpdateDocumentOptions) => Promise<DominoDocument>;
  /**
   * Update a document pointed by its UNID. Performs a PATCH on the document using the given
   * document body JSON. Additional request options can be provided.
   *
   * @param dataSource the scope name
   * @param unid the document's UNID where the patch will be made
   * @param docJsonPatch JSON that contains what to patch on a document
   * @param options options for update document operation
   * @returns a promise that resolves to the updated document.
   *
   * @throws an error if given UNID is empty.
   * @throws an error if given UNID is invalid.
   */
  patchDocument: (dataSource: string, unid: string, docJsonPatch: DocumentBody, options?: UpdateDocumentOptions) => Promise<DominoDocument>;
  /**
   * Delete the given {@link DominoDocument}. A mode can be provided if the operation
   * needs to be done on other modes (default mode is `default`).
   *
   * @param dataSource the scope name
   * @param doc {@link DominoDocument} to be deleted
   * @param mode the mode to perform the document access in. Defaults to `default` if not given.
   * @returns a promise that resolves to a document status response.
   *
   * @throws an error if given document has empty UNID.
   * @throws an error if given document has invalid UNID.
   */
  deleteDocument: (dataSource: string, doc: DominoDocument, mode?: string) => Promise<DocumentStatusResponse>;
  /**
   * Delete a document pointed by its UNID. A mode can be provided if the operation
   * needs to be done on other modes (default mode is `default`).
   *
   * @param dataSource the scope name
   * @param unid the UNID of the document to be deleted
   * @param mode the mode to perform the document access in. Defaults to `default` if not given
   * @returns a promise that resolves to a document status response.
   *
   * @throws an error if given UNID is empty.
   * @throws an error if given UNID is invalid.
   */
  deleteDocumentByUNID: (dataSource: string, unid: string, mode?: string) => Promise<DocumentStatusResponse>;
  /**
   * Get all documents pointed by the given UNIDs. Additional request options can be given.
   *
   * @param dataSource the scope name
   * @param unids an array of UNIDs of the documents to get
   * @param options options for bulk get documents operation
   * @returns a promise that resolves to an array of documents.
   *
   * @throws an error if given UNIDs array is empty.
   * @throws an error if one of given UNIDs is empty.
   * @throws an error if one of given UNIDs is invalid.
   */
  bulkGetDocuments: (dataSource: string, unids: string[], options?: BulkGetDocumentsOptions) => Promise<Array<DominoDocument | BulkGetErrorResponse>>;
  /**
   * Create documents with the provided document JSONs. Richtext return format can be specified
   * (defaults to `mime` if not given).
   *
   * @param dataSource the scope name
   * @param docs an array of JSON containing document data to be saved
   * @param richTextAs the format which richtext fields will be returned as (defaults to `mime` if not given)
   * @returns a promise that resolves to an array of created documents.
   *
   * @throws an error if given array of document JSON is empty.
   */
  bulkCreateDocuments: (dataSource: string, docs: DocumentJSON[], richTextAs?: RichTextRepresentation) => Promise<DominoDocument[]>;
  /**
   * Bulk update documents via specified request. Richtext return format can be specified
   * (defaults to `mime` if not given).
   *
   * @param dataSource the scope name
   * @param request request body for bulk update documents by query operation
   * @param richTextAs the format which richtext fields will be returned as (defaults to `mime` if not given)
   * @returns a promise that resolves to an array of documents updated or an array of document operation response.
   *
   * @throws an error if `query` in request is empty.
   * @throws an error if `replaceItems` in request has no items.
   */
  bulkUpdateDocumentsByQuery: (
    dataSource: string,
    request: BulkUpdateDocumentsByQueryRequest,
    richTextAs?: RichTextRepresentation,
  ) => Promise<DominoDocument[] | DocumentStatusResponse[]>;
  /**
   * Delete all given {@link DominoDocument} in the given array. A mode can be provided if
   * the operation needs to be done on other modes (default mode is `default`).
   *
   * @param dataSource the scope name
   * @param docs n array of {@link DominoDocument} to be deleted
   * @param mode the mode to perform the document access in. Defaults to `default` if missing
   * @returns a promise that resolves to an array of document status response.
   *
   * @throws an error if given documents array is empty.
   * @throws an error if one of given documents has empty UNID.
   * @throws an error if one of given documents has invalid UNID.
   */
  bulkDeleteDocuments: (dataSource: string, docs: Array<DominoDocument>, mode?: string) => Promise<DocumentStatusResponse[]>;
  /**
   * Delete all documents pointed by the given UNIDs. A mode can be provided if
   * the operation needs to be done on other modes (default mode is `default`).
   *
   * @param dataSource the scope name
   * @param unids an array of UNIDs of the documents to be deleted.
   * @param mode the mode to perform the document access in. Defaults to `default` if missing
   * @returns a promise that resolves to an array of document status response.
   *
   * @throws an error if given UNIDs array is empty.
   * @throws an error if one of given UNIDs is empty.
   * @throws an error if one of given UNIDs is invalid.
   */
  bulkDeleteDocumentsByUNID: (dataSource: string, unids: string[], mode?: string) => Promise<DocumentStatusResponse[]>;
  /**
   * get documents via specified request based on the action provided.
   *
   * @param dataSource the scope name
   * @param request request body for query operation
   * @param action actions to be done on the query. (eg. execute, explain and parse)
   * @param options options for /query operation
   * @returns a promise that resolves to an array of documents when execute, an object containing the explainresult or an object containing the parseResult depending on the action provided.
   *
   * @throws an error if `query` in request is empty.
   * @throws an error if `action` in request is empty.
   */
  getDocumentsByQuery: (
    dataSource: string,
    request: GetDocumentsByQueryRequest,
    action: QueryActions,
    options?: GetDocumentsByQueryOptions,
  ) => Promise<DominoDocument[] | QueryDocumentExplainResponse[] | QueryDocumentParseResponse[]>;
  /**
   * Retrieves rest configuration from the server.
   *
   * @param scopeName the name of scope to be retrieved
   * @returns a promise that resolves to the fetched scope.
   *
   * @throws an error if given scope name is empty.
   */
  getScope: (scopeName: string) => Promise<DominoScope>;
  /**
   * Get all of the scopes on the server.
   *
   * @returns a promise that resolves to an array of domino scopes.
   */
  getScopes: () => Promise<DominoScope[]>;
  /**
   * Delete a scope on the server.
   *
   * @param scopeName the name of scope to be deleted
   * @returns A promise that resolves to the deleted scope.
   *
   * @throws an error if given scope name is empty.
   */
  deleteScope: (scopeName: string) => Promise<DominoScope>;
  /**
   * Create a scope on the server, otherwise, update it if it already exists.
   *
   * @param scope accepts a {@link DominoScope} or a JSON format containing all of the fields needed when creating a Domino REST scope
   * @returns a promise that resolves to the created scope.
   */
  createUpdateScope: (scope: DominoScope | ScopeJSON) => Promise<DominoScope>;
  /**
   * Pulls in view data. Will return view entries unless `options.documents` is `true`, which will return {@link DominoDocument} instead. `options.subscriber` can also be provided, if instead of a response, you want the subscriber function to be called for each array item in the response.
   *
   * @param dataSource the scope name
   * @param listViewName name of the view or folder
   * @param options parameters that we want to use for the endpoint GET `/lists/{name}` in a specific format
   * @returns a promise that resolves to an array of {@link DominoListViewEntry} of entries/data.
   *
   * @throws an error if given scope name is empty.
   * @throws an error if given list name is empty.
   */
  getListViewEntry: (
    dataSource: string,
    listViewName: string,
    options?: GetListViewEntryOptions,
  ) => Promise<ListViewEntryJSON[] | DominoDocument[] | void>;
  /**
   * Processes view data as pivot.
   *
   * @param dataSource the scope name
   * @param listViewName name of the view or folder
   * @param pivotColumn name of the column to provide the data for the pivot aggregator
   * @param options parameters that we want to use for the endpoint GET `/listspivot/{name}` in a specific format
   * @returns A promise that resolves to a {@link PivotListViewResponse}.
   *
   * @throws an error if given scope name is empty.
   * @throws an error if given list name is empty.
   * @throws an error if pivot column is empty.
   */
  getListViewPivotEntry: (
    dataSource: string,
    listViewName: string,
    pivotColumn: string,
    options?: GetListPivotViewEntryOptions,
  ) => Promise<PivotListViewResponse>;
  /**
   * Provide information on available views/folders.
   *
   * @param dataSource the scope name
   * @param options parameters that we want to use for the endpoint GET `/lists` in a specific format
   * @returns A promise that resolves to an array of {@link GetListViewJSON}.
   *
   * @throws an error if given scope name is empty.
   */
  getListViews: (dataSource: string, options?: GetListViewOptions) => Promise<GetListViewJSON[]>;
  /**
   * Create or update Domino design view based on simplified JSON.
   *
   * @param dataSource the scope name
   * @param listView a type {@link ListViewBody} JSON that is the format when creating a design element view.
   * @param designName name of design element
   * @param options parameters that we want to use for the endpoint PUT `/design/views/{designName}` in a specific format
   * @returns A promise that resolves to a type of {@link CreateListResponse}.
   *
   * @throws an error if given scope name is empty.
   * @throws an error if given design name is empty.
   */
  createUpdateListView: (
    dataSource: string,
    listView: ListViewBody,
    designName: string,
    options?: DesignOptions,
  ) => Promise<CreateUpdateListResponse>;
  /**
   * Retrieve individual design element (view) for a database.
   *
   * @param dataSource the scope name
   * @param designName name of design element
   * @param options parameters that we want to use for the endpoint GET `/design/views/{designName}` in a specific format
   * @returns A promise that resolves to a type {@link GetListViewDesignJSON}.
   *
   * @throws an error if given scope name is empty.
   * @throws an error if given design name is empty.
   */
  getListView: (dataSource: string, designName: string, options?: DesignOptions) => Promise<GetListViewDesignJSON>;
}

/**
 * OpenAPI aware connection to the Domino REST API backend. All interactions flow through it.
 */
export interface DominoRestConnector {
  /**
   * URL of Domino REST API server to interact with.
   */
  readonly baseUrl: string;
  /**
   * Metadata by each APIs returned from `/api` endpoint.
   */
  readonly meta: DominoApiMeta;
  /**
   * Sends the specified operation as request to the server.
   *
   * @param operationId operation ID according to OpenAPI specification
   * @param scope specifies what scope/database to interact with
   * @param options contains all parameters for the request
   * @returns a promise that resolves to the response to the request
   *
   * @throws an error if response is not okay.
   */
  request: (dominoAccess: DominoAccess, operationId: string, options: DominoRequestOptions) => Promise<DominoRequestResponse>;
  /**
   * Return information about the given operation ID.
   *
   * @param operationId the operation ID to get
   * @returns JSON information around the given operation ID
   *
   * @throws an error if given operation ID cannot be found.
   */
  getOperation: (operationId: string) => DominoRestOperation;
  /**
   * Get all operations available on the connector.
   *
   * @returns all operations for the connector.
   */
  getOperations: () => Map<string, any>;
  /**
   * Builds a fully qualified URL around the given operation information based on supplied parameters.
   *
   * @param operation JSON information about the operation
   * @param scope target scope name
   * @param params parameters to supply to the URL
   * @returns the URL built.
   */
  getUrl: (operation: DominoRestOperation, scope: string, params: Map<string, string>) => string;
  /**
   * Builds request options around the given operation information (this includes the headers and
   * the request body).
   *
   * @param operation JSON information about the operation
   * @param scope target scope name
   * @param request contains the options to build
   * @returns a promise that resolves to the request options built.
   *
   * @throws an error if a mandatory header parameter is not given.
   * @throws an error if something went wrong on building request options.
   */
  getFetchOptions: (dominoAccess: DominoAccess, operation: DominoRestOperation, request: DominoRequestOptions) => Promise<any>;
}

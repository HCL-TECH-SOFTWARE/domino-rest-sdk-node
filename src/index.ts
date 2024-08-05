/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* istanbul ignore file */
/* index have no testable code - no point including them in coverage reports */

import { CredentialType, DominoAccess, DominoRestAccessJSON, RestCredentials } from './DominoAccess.js';
import DominoBasisSession from './DominoBasisSession.js';
import { DominoRequestOptions, DominoRequestResponse, DominoRestOperation } from './DominoConnector.js';
import { DocumentBody, DocumentJSON, DominoBaseDocument, DominoDocumentMeta } from './DominoDocument.js';
import {
  BulkCreateDocumentsOptions,
  BulkGetDocumentsOptions,
  BulkGetErrorResponse,
  BulkUpdateDocumentsByQueryRequest,
  CreateDocumentOptions,
  DocumentOptions,
  DocumentStatusResponse,
  DominoDocumentOperations,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  GetDocumentsByQueryRequest,
  PatchDocumentOptions,
  QueryActions,
  QueryDocumentExplainResponse,
  QueryDocumentParseResponse,
  UpdateDocumentOptions,
} from './DominoDocumentOperations.js';
import { DesignColumnSimple, DominoBaseListView, ListViewBody, SortType } from './DominoListView.js';
import { DominoBaseListViewEntry, ListType, ListViewEntryBody, ListViewEntryJSON } from './DominoListViewEntry.js';
import {
  CreateUpdateListResponse,
  DesignOptions,
  GetListPivotViewEntryOptions,
  GetListViewDesignJSON,
  GetListViewEntryOptions,
  GetListViewJSON,
  GetListViewOptions,
  ListViewEntryOptions,
  PivotListViewColumnElementResponse,
  PivotListViewColumnResponse,
  PivotListViewResponse,
  SortShort,
  ViewEntryScopes,
} from './DominoListViewOperations.js';
import { AccessLevel, DominoBaseScope, ScopeBody, ScopeJSON } from './DominoScope.js';
import { DominoApiMeta, DominoServer } from './DominoServer.js';
import DominoSetupSession from './DominoSetupSession.js';
import DominoUserSession from './DominoUserSession.js';
import {
  ApiNotAvailable,
  CallbackError,
  EmptyParamError,
  HttpResponseError,
  InvalidParamError,
  MissingBearerError,
  MissingParamError,
  NoResponseBody,
  NotAnArrayError,
  OperationNotAvailable,
  SdkError,
  TokenDecodeError,
  TokenError,
} from './errors/index.js';
import { streamSplit, streamToJson, streamToText, streamTransformToJson } from './helpers/StreamHelpers.js';

export {
  AccessLevel,
  ApiNotAvailable,
  BulkCreateDocumentsOptions,
  BulkGetDocumentsOptions,
  BulkGetErrorResponse,
  BulkUpdateDocumentsByQueryRequest,
  CallbackError,
  CreateDocumentOptions,
  CreateUpdateListResponse,
  CredentialType,
  DesignColumnSimple,
  DesignOptions,
  DocumentBody,
  DocumentJSON,
  DocumentOptions,
  DocumentStatusResponse,
  DominoAccess,
  DominoApiMeta,
  DominoBaseDocument,
  DominoBaseListView,
  DominoBaseListViewEntry,
  DominoBaseScope,
  DominoBasisSession,
  DominoDocumentMeta,
  DominoDocumentOperations,
  DominoRequestOptions,
  DominoRequestResponse,
  DominoRestAccessJSON,
  DominoRestOperation,
  DominoServer,
  DominoSetupSession,
  DominoUserSession,
  EmptyParamError,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  GetDocumentsByQueryRequest,
  GetListPivotViewEntryOptions,
  GetListViewDesignJSON,
  GetListViewEntryOptions,
  GetListViewJSON,
  GetListViewOptions,
  HttpResponseError,
  InvalidParamError,
  ListType,
  ListViewBody,
  ListViewEntryBody,
  ListViewEntryJSON,
  ListViewEntryOptions,
  MissingBearerError,
  MissingParamError,
  NoResponseBody,
  NotAnArrayError,
  OperationNotAvailable,
  PatchDocumentOptions,
  PivotListViewColumnElementResponse,
  PivotListViewColumnResponse,
  PivotListViewResponse,
  QueryActions,
  QueryDocumentExplainResponse,
  QueryDocumentParseResponse,
  RestCredentials,
  ScopeBody,
  ScopeJSON,
  SdkError,
  SortShort,
  SortType,
  TokenDecodeError,
  TokenError,
  UpdateDocumentOptions,
  ViewEntryScopes,
  streamSplit,
  streamToJson,
  streamToText,
  streamTransformToJson,
};

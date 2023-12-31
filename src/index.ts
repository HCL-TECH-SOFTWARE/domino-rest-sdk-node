/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* istanbul ignore file */
/* index have no testable code - no point including them in coverage reports */

import { CredentialType, DominoAccess, DominoRestAccessJSON, RestCredentials } from './DominoAccess';
import DominoBasisSession from './DominoBasisSession';
import { DominoRequestOptions, DominoRequestResponse, DominoRestOperation } from './DominoConnector';
import { DocumentBody, DocumentJSON, DominoBaseDocument, DominoDocumentMeta } from './DominoDocument';
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
  RichTextRepresentation,
  UpdateDocumentOptions,
} from './DominoDocumentOperations';
import { DesignColumnSimple, DominoBaseListView, ListViewBody, SortType } from './DominoListView';
import { DominoBaseListViewEntry, ListType, ListViewEntryBody, ListViewEntryJSON } from './DominoListViewEntry';
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
} from './DominoListViewOperations';
import { AccessLevel, DominoBaseScope, ScopeBody, ScopeJSON } from './DominoScope';
import { DominoApiMeta, DominoServer } from './DominoServer';
import DominoSetupSession from './DominoSetupSession';
import DominoUserSession from './DominoUserSession';
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
} from './errors';
import { streamSplit, streamToJson, streamToText, streamTransformToJson } from './helpers/StreamHelpers';

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
  RichTextRepresentation,
  ScopeBody,
  ScopeJSON,
  SdkError,
  SortShort,
  SortType,
  TokenDecodeError,
  UpdateDocumentOptions,
  ViewEntryScopes,
  streamSplit,
  streamToJson,
  streamToText,
  streamTransformToJson,
};

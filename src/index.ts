/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* istanbul ignore file */
/* index have no testable code - no point including them in coverage reports */

import { CredentialType, DominoAccess, DominoRestAccessJSON, RestCredentials } from './DominoAccess';
import { DominoRequestOptions, DominoRestOperation } from './DominoConnector';
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
  CreateListResponse,
  CreateUpdateDesignOptions,
  GetDesignOptions,
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
import DominoUserSession from './DominoUserSession';

export {
  AccessLevel,
  BulkCreateDocumentsOptions,
  BulkGetDocumentsOptions,
  BulkGetErrorResponse,
  BulkUpdateDocumentsByQueryRequest,
  CreateDocumentOptions,
  CreateListResponse,
  CreateUpdateDesignOptions,
  CredentialType,
  DesignColumnSimple,
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
  DominoDocumentMeta,
  DominoDocumentOperations,
  DominoRequestOptions,
  DominoRestAccessJSON,
  DominoRestOperation,
  DominoServer,
  DominoUserSession,
  GetDesignOptions,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  GetDocumentsByQueryRequest,
  GetListPivotViewEntryOptions,
  GetListViewDesignJSON,
  GetListViewEntryOptions,
  GetListViewJSON,
  GetListViewOptions,
  ListType,
  ListViewBody,
  ListViewEntryBody,
  ListViewEntryJSON,
  ListViewEntryOptions,
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
  SortShort,
  SortType,
  UpdateDocumentOptions,
  ViewEntryScopes,
};

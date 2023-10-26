/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import {
  BulkGetDocumentsOptions,
  BulkGetErrorResponse,
  BulkUpdateDocumentsByQueryRequest,
  CreateDocumentOptions,
  CreateListResponse,
  CreateUpdateDesignOptions,
  DocumentBody,
  DocumentJSON,
  DocumentStatusResponse,
  DominoAccess,
  DominoDocumentOperations,
  DominoRequestOptions,
  GetDesignOptions,
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
  RichTextRepresentation,
  ScopeBody,
  UpdateDocumentOptions,
} from '.';
import DominoConnector from './DominoConnector';
import DominoDocument from './DominoDocument';
import { ListViewEntryJSON } from './DominoListViewEntry';
import DominoListViewOperations from './DominoListViewOperations';
import DominoScope from './DominoScope';
import DominoScopeOperations from './DominoScopeOperations';
import { DominoUserRestSession } from './RestInterfaces';

/**
 * Takes in both Domino access and connector, and forms a session wherein a user
 * has access to different Domino REST API operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoUserSession implements DominoUserRestSession {
  dominoAccess: DominoAccess;
  dominoConnector: DominoConnector;

  constructor(dominoAccess: DominoAccess, dominoConnector: DominoConnector) {
    this.dominoAccess = dominoAccess;
    this.dominoConnector = dominoConnector;
  }

  request = async <T = any>(operationId: string, options: DominoRequestOptions): Promise<T> => {
    const response = await this.dominoConnector.request<T>(this.dominoAccess, operationId, options);
    return Promise.resolve(response);
  };

  getDocument = async (dataSource: string, unid: string, options?: GetDocumentOptions): Promise<DominoDocument> => {
    return await DominoDocumentOperations.getDocument(dataSource, this.dominoAccess, this.dominoConnector, unid, options);
  };

  createDocument = async (dataSource: string, doc: DocumentJSON, options?: CreateDocumentOptions): Promise<DominoDocument> => {
    return await DominoDocumentOperations.createDocument(dataSource, this.dominoAccess, this.dominoConnector, doc, options);
  };

  updateDocument = async (dataSource: string, doc: DominoDocument, options?: UpdateDocumentOptions): Promise<DominoDocument> => {
    return await DominoDocumentOperations.updateDocument(dataSource, this.dominoAccess, this.dominoConnector, doc, options);
  };

  patchDocument = async (dataSource: string, unid: string, docJsonPatch: DocumentBody, options?: UpdateDocumentOptions): Promise<DominoDocument> => {
    return await DominoDocumentOperations.patchDocument(dataSource, this.dominoAccess, this.dominoConnector, unid, docJsonPatch, options);
  };

  deleteDocument = async (dataSource: string, doc: DominoDocument, mode?: string): Promise<DocumentStatusResponse> => {
    return await DominoDocumentOperations.deleteDocument(dataSource, this.dominoAccess, this.dominoConnector, doc, mode);
  };

  deleteDocumentByUNID = async (dataSource: string, unid: string, mode?: string): Promise<DocumentStatusResponse> => {
    return await DominoDocumentOperations.deleteDocumentByUNID(dataSource, this.dominoAccess, this.dominoConnector, unid, mode);
  };

  bulkGetDocuments = async (dataSource: string, unids: string[], options?: BulkGetDocumentsOptions): Promise<Array<DominoDocument | BulkGetErrorResponse>> => {
    return await DominoDocumentOperations.bulkGetDocuments(dataSource, this.dominoAccess, this.dominoConnector, unids, options);
  };

  bulkCreateDocuments = async (dataSource: string, docs: DocumentJSON[], richTextAs?: RichTextRepresentation): Promise<DominoDocument[]> => {
    return await DominoDocumentOperations.bulkCreateDocuments(dataSource, this.dominoAccess, this.dominoConnector, docs, richTextAs);
  };

  bulkUpdateDocumentsByQuery = async (
    dataSource: string,
    request: BulkUpdateDocumentsByQueryRequest,
    richTextAs?: RichTextRepresentation,
  ): Promise<DominoDocument[] | DocumentStatusResponse[]> => {
    return await DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, this.dominoAccess, this.dominoConnector, request, richTextAs);
  };

  bulkDeleteDocuments = async (dataSource: string, docs: Array<DominoDocument>, mode?: string): Promise<DocumentStatusResponse[]> => {
    return await DominoDocumentOperations.bulkDeleteDocuments(dataSource, this.dominoAccess, this.dominoConnector, docs, mode);
  };

  bulkDeleteDocumentsByUNID = async (dataSource: string, unids: string[], mode?: string): Promise<DocumentStatusResponse[]> => {
    return await DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, this.dominoAccess, this.dominoConnector, unids, mode);
  };

  getDocumentsByQuery = async (
    dataSource: string,
    request: GetDocumentsByQueryRequest,
    action: QueryActions,
    options?: GetDocumentsByQueryOptions,
  ): Promise<DominoDocument[] | QueryDocumentExplainResponse[] | QueryDocumentParseResponse[]> => {
    return await DominoDocumentOperations.getDocumentsByQuery(dataSource, this.dominoAccess, this.dominoConnector, request, action, options);
  };

  createUpdateScope = async (scope: DominoScope | ScopeBody): Promise<DominoScope> => {
    return await DominoScopeOperations.createUpdateScope(scope, this.dominoAccess, this.dominoConnector);
  };

  getScope = async (scopeName: string): Promise<DominoScope> => {
    return await DominoScopeOperations.getScope(scopeName, this.dominoAccess, this.dominoConnector);
  };

  getScopes = async (): Promise<DominoScope[]> => {
    return await DominoScopeOperations.getScopes(this.dominoAccess, this.dominoConnector);
  };

  deleteScope = async (scopeName: string): Promise<DominoScope> => {
    return await DominoScopeOperations.deleteScope(scopeName, this.dominoAccess, this.dominoConnector);
  };

  getListViews = async (dataSource: string, options?: GetListViewOptions): Promise<GetListViewJSON[]> => {
    return await DominoListViewOperations.getListViews(dataSource, this.dominoAccess, this.dominoConnector, options);
  };

  getListViewEntry = async (dataSource: string, listViewName: string, options?: GetListViewEntryOptions): Promise<ListViewEntryJSON[] | DominoDocument[] | void> => {
    return await DominoListViewOperations.getListViewEntry(dataSource, this.dominoAccess, this.dominoConnector, listViewName, options);
  };

  getListViewPivotEntry = async (
    dataSource: string,
    listViewName: string,
    pivotColumn: string,
    options?: GetListPivotViewEntryOptions,
  ): Promise<PivotListViewResponse> => {
    return await DominoListViewOperations.getListViewPivotEntry(
      dataSource,
      this.dominoAccess,
      this.dominoConnector,
      listViewName,
      pivotColumn,
      options,
    );
  };

  createUpdateListView = async (
    dataSource: string,
    listView: ListViewBody,
    designName: string,
    options?: CreateUpdateDesignOptions,
  ): Promise<CreateListResponse> => {
    return await DominoListViewOperations.createUpdateListView(dataSource, this.dominoAccess, this.dominoConnector, listView, designName, options);
  };

  getListView = async (dataSource: string, designName: string, options?: GetDesignOptions): Promise<GetListViewDesignJSON> => {
    return await DominoListViewOperations.getListView(dataSource, this.dominoAccess, this.dominoConnector, designName, options);
  };
}

export default DominoUserSession;

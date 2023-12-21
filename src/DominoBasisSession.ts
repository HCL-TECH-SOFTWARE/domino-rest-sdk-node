/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import {
  BulkGetDocumentsOptions,
  BulkUpdateDocumentsByQueryRequest,
  CreateDocumentOptions,
  DesignOptions,
  DocumentBody,
  DocumentJSON,
  DocumentStatusResponse,
  DominoAccess,
  DominoDocumentOperations,
  DominoServer,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  GetDocumentsByQueryRequest,
  GetListPivotViewEntryOptions,
  GetListViewEntryOptions,
  GetListViewOptions,
  ListViewBody,
  QueryActions,
  RichTextRepresentation,
  UpdateDocumentOptions,
} from '.';
import DominoConnector from './DominoConnector';
import DominoDocument from './DominoDocument';
import DominoListViewOperations from './DominoListViewOperations';
import { DominoBasisRestSession } from './RestInterfaces';

/**
 * Takes in both Domino access and connector, and forms a session wherein a user
 * has access to BASIS Domino REST API operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoBasisSession implements DominoBasisRestSession {
  dominoAccess: DominoAccess;
  dominoConnector: DominoConnector;

  /**
   * Static factory method to get DominoBasisSession.
   *
   * @param dominoAccess DominoAccess to use
   * @param dominoServer DominoServer to use
   * @returns DominoBasisSession class
   */
  static getBasisSession = (dominoAccess: DominoAccess, dominoServer: DominoServer) =>
    new Promise<DominoBasisSession>((resolve, reject) => {
      dominoServer
        .getDominoConnector('basis')
        .then((dominoConnector) => resolve(new DominoBasisSession(dominoAccess, dominoConnector)))
        .catch((error) => reject(error));
    });

  constructor(dominoAccess: DominoAccess, dominoConnector: DominoConnector) {
    this.dominoAccess = dominoAccess;
    this.dominoConnector = dominoConnector;
  }

  getDocument = (dataSource: string, unid: string, options?: GetDocumentOptions) =>
    DominoDocumentOperations.getDocument(dataSource, this.dominoAccess, this.dominoConnector, unid, options);

  createDocument = (dataSource: string, doc: DocumentJSON, options?: CreateDocumentOptions) =>
    DominoDocumentOperations.createDocument(dataSource, this.dominoAccess, this.dominoConnector, doc, options);

  updateDocument = (dataSource: string, doc: DominoDocument, options?: UpdateDocumentOptions) =>
    DominoDocumentOperations.updateDocument(dataSource, this.dominoAccess, this.dominoConnector, doc, options);

  patchDocument = (dataSource: string, unid: string, docJsonPatch: DocumentBody, options?: UpdateDocumentOptions) =>
    DominoDocumentOperations.patchDocument(dataSource, this.dominoAccess, this.dominoConnector, unid, docJsonPatch, options);

  deleteDocument = (dataSource: string, doc: DominoDocument, mode?: string) =>
    DominoDocumentOperations.deleteDocument(dataSource, this.dominoAccess, this.dominoConnector, doc, mode);

  deleteDocumentByUNID = (dataSource: string, unid: string, mode?: string): Promise<DocumentStatusResponse> =>
    DominoDocumentOperations.deleteDocumentByUNID(dataSource, this.dominoAccess, this.dominoConnector, unid, mode);

  bulkGetDocuments = (dataSource: string, unids: string[], options?: BulkGetDocumentsOptions) =>
    DominoDocumentOperations.bulkGetDocuments(dataSource, this.dominoAccess, this.dominoConnector, unids, options);

  bulkCreateDocuments = (dataSource: string, docs: DocumentJSON[], richTextAs?: RichTextRepresentation) =>
    DominoDocumentOperations.bulkCreateDocuments(dataSource, this.dominoAccess, this.dominoConnector, docs, richTextAs);

  bulkUpdateDocumentsByQuery = (dataSource: string, request: BulkUpdateDocumentsByQueryRequest, richTextAs?: RichTextRepresentation) =>
    DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, this.dominoAccess, this.dominoConnector, request, richTextAs);

  bulkDeleteDocuments = (dataSource: string, docs: Array<DominoDocument>, mode?: string) =>
    DominoDocumentOperations.bulkDeleteDocuments(dataSource, this.dominoAccess, this.dominoConnector, docs, mode);

  bulkDeleteDocumentsByUNID = (dataSource: string, unids: string[], mode?: string) =>
    DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, this.dominoAccess, this.dominoConnector, unids, mode);

  getDocumentsByQuery = (dataSource: string, request: GetDocumentsByQueryRequest, action: QueryActions, options?: GetDocumentsByQueryOptions) =>
    DominoDocumentOperations.getDocumentsByQuery(dataSource, this.dominoAccess, this.dominoConnector, request, action, options);

  getListViews = (dataSource: string, options?: GetListViewOptions) =>
    DominoListViewOperations.getListViews(dataSource, this.dominoAccess, this.dominoConnector, options);

  getListViewEntry = (dataSource: string, listViewName: string, options?: GetListViewEntryOptions) =>
    DominoListViewOperations.getListViewEntry(dataSource, this.dominoAccess, this.dominoConnector, listViewName, options);

  getListViewPivotEntry = (dataSource: string, listViewName: string, pivotColumn: string, options?: GetListPivotViewEntryOptions) =>
    DominoListViewOperations.getListViewPivotEntry(dataSource, this.dominoAccess, this.dominoConnector, listViewName, pivotColumn, options);

  createUpdateListView = (dataSource: string, listView: ListViewBody, designName: string, options?: DesignOptions) =>
    DominoListViewOperations.createUpdateListView(dataSource, this.dominoAccess, this.dominoConnector, listView, designName, options);

  getListView = (dataSource: string, designName: string, options?: DesignOptions) =>
    DominoListViewOperations.getListView(dataSource, this.dominoAccess, this.dominoConnector, designName, options);
}

export default DominoBasisSession;

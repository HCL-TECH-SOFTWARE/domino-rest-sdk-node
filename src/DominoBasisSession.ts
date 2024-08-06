/* ========================================================================== *
 * Copyright (C) 2023, 2024 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import DominoConnector from './DominoConnector.js';
import DominoDocument from './DominoDocument.js';
import DominoListViewOperations from './DominoListViewOperations.js';
import { DominoBasisRestSession } from './RestInterfaces.js';
import {
  BulkGetDocumentsOptions,
  BulkUpdateDocumentsByQueryRequest,
  CreateDocumentOptions,
  DocumentBody,
  DocumentJSON,
  DocumentStatusResponse,
  DominoDocumentOperations,
  DominoRestAccess,
  DominoServer,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  GetDocumentsByQueryRequest,
  GetListPivotViewEntryOptions,
  GetListViewEntryOptions,
  GetListViewOptions,
  GetRichtextOptions,
  QueryActions,
  UpdateDocumentOptions,
} from './index.js';

/**
 * Takes in both Domino access and connector, and forms a session wherein a user
 * has access to BASIS Domino REST API operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoBasisSession implements DominoBasisRestSession {
  dominoAccess: DominoRestAccess;
  dominoConnector: DominoConnector;

  /**
   * Static factory method to get DominoBasisSession.
   *
   * @param dominoAccess DominoAccess to use
   * @param dominoServer DominoServer to use
   * @returns DominoBasisSession class
   */
  static getBasisSession = (dominoAccess: DominoRestAccess, dominoServer: DominoServer) =>
    new Promise<DominoBasisSession>((resolve, reject) => {
      dominoServer
        .getDominoConnector('basis')
        .then((dominoConnector) => resolve(new DominoBasisSession(dominoAccess, dominoConnector)))
        .catch((error) => reject(error));
    });

  constructor(dominoAccess: DominoRestAccess, dominoConnector: DominoConnector) {
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

  bulkCreateDocuments = (dataSource: string, docs: DocumentJSON[], richTextAs?: string) =>
    DominoDocumentOperations.bulkCreateDocuments(dataSource, this.dominoAccess, this.dominoConnector, docs, richTextAs);

  bulkUpdateDocumentsByQuery = (dataSource: string, request: BulkUpdateDocumentsByQueryRequest, richTextAs?: string) =>
    DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, this.dominoAccess, this.dominoConnector, request, richTextAs);

  bulkDeleteDocuments = (dataSource: string, docs: Array<DominoDocument>, mode?: string) =>
    DominoDocumentOperations.bulkDeleteDocuments(dataSource, this.dominoAccess, this.dominoConnector, docs, mode);

  bulkDeleteDocumentsByUNID = (dataSource: string, unids: string[], mode?: string) =>
    DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, this.dominoAccess, this.dominoConnector, unids, mode);

  getDocumentsByQuery = (dataSource: string, request: GetDocumentsByQueryRequest, action: QueryActions, options?: GetDocumentsByQueryOptions) =>
    DominoDocumentOperations.getDocumentsByQuery(dataSource, this.dominoAccess, this.dominoConnector, request, action, options);

  getRichtext = (dataSource: string, unid: string, richTextAs: string, options?: GetRichtextOptions) =>
    DominoDocumentOperations.getRichtext(dataSource, this.dominoAccess, this.dominoConnector, unid, richTextAs, options);

  getListViews = (dataSource: string, options?: GetListViewOptions) =>
    DominoListViewOperations.getListViews(dataSource, this.dominoAccess, this.dominoConnector, options);

  getListViewEntry = (dataSource: string, listViewName: string, options?: GetListViewEntryOptions) =>
    DominoListViewOperations.getListViewEntry(dataSource, this.dominoAccess, this.dominoConnector, listViewName, options);

  getListViewPivotEntry = (dataSource: string, listViewName: string, pivotColumn: string, options?: GetListPivotViewEntryOptions) =>
    DominoListViewOperations.getListViewPivotEntry(dataSource, this.dominoAccess, this.dominoConnector, listViewName, pivotColumn, options);
}

export default DominoBasisSession;

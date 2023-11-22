/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DesignColumnSimple, DocumentBody, DominoAccess, DominoRequestOptions, ListViewBody, ListViewEntryJSON, RichTextRepresentation } from '.';
import DominoConnector from './DominoConnector';
import DominoDocument from './DominoDocument';
import DominoListView from './DominoListView';
import DominoListViewEntry from './DominoListViewEntry';
import { EmptyParamError, HttpResponseError, NoResponseBody } from './errors';
import { streamToJson } from './helpers/StreamHelpers';
import { isEmpty } from './helpers/Utilities';

export type GetListViewDesignJSON = {
  '@name': string;
  '@alias': string[];
  '@unid': string;
  '@noteid': string;
  '@selectionFormula': string;
} & { [key: string]: DesignColumnSimple | string | string[] };

export type GetListViewJSON = Pick<ListViewBody, 'title' | 'isFolder' | 'unid' | 'alias'>;

export type CreateUpdateListResponse = {
  success: boolean;
  log: string;
};

export type PivotListViewResponse = {
  [key: string]: PivotListViewColumnResponse; // The key is a string (which a column in a view), and the value is a PivotListViewColumnResponse
};

export type PivotListViewColumnResponse = {
  [key: string]: PivotListViewColumnElementResponse; // The key is a string (which a column in a view), and the value is a PivotListViewColumnResponse
};

export type PivotListViewColumnElementResponse = {
  max: string;
  count: number;
  min: string;
  sum?: bigint;
};

export type ListViewEntryOptions = {
  /**
   * Document mode to retrieve the documents with. (Every Form can have multiple modes, each can be different from other modes). Also, Current logged-in user must have access for the specified mode.
   */
  mode?: string;
  /**
   * When set to false, all metadata Json items on the top level of an object get suppressed. Default is true
   */
  meta?: boolean;
  /**
   * A character combination to perform a partial match to identify a starting point. The character combination will be applied to the "column" and "direction" passed in the query string. This cannot be combined with the "keys" parameter, i.e. you cannot filter on keys and startwith within that key.
   */
  startsWith?: string;
  /**
   * Name of the column to provide the data for the pivot aggregator
   */
  pivotColumn: string;
  /**
   * Additional metadata that is not included in the View. This may have a slight performance cost so use only if necessary.
   */
  metaAdditional?: boolean;
  /**
   * Category to restrict view queries to
   */
  category?: string[];
  /**
   * Column for alternative sorting. This requires the list to be designed for indexing on this column
   */
  column?: string;
  /**
   * Determines whether, when documents=true, only distinct documents should be retrieved if they exist multiple times in the list.
   */
  distinctDocuments?: boolean;
  /**
   * Full-text search query to filter the contents of the list
   */
  ftSearchQuery?: string;
  /**
   * How many entries shall be returned, default = 1000
   */
  count?: number;
  /**
   * Retrieve only unread entries. Cannot be combined with documents=true, documentsOnly=true, or methods to select or query documents
   */
  unreadOnly?: boolean;
  /**
   * Select by partial Key. Default is false (key match is exact)
   */
  keyAllowPartial?: boolean;
  /**
   * Shall the query return documents instead of view entries
   */
  documents?: boolean;
  /**
   * Useful for categorized or sorted lists. Limits return values to entries matching the key or keys. Use multiple key parameter items to specify multiple keys in request URL. The keys specified must be in the same order as the sorted columns from left to right. Unsorted columns will be ignored.
   */
  key?: string[];
  /**
   * The direction for alternative sorting. This is ignored unless "column" query parameter is passed as well. This requires the list to be designed for indexing on this column in the desired direction. Defaults to ascending if column is set.
   */
  direction?: SortShort;
  /**
   * What shall the view return:
   * - document entries
   * - category names
   * - all
   */
  scope?: ViewEntryScopes;
  /**
   * The format RichText fields will be returned when retrieving documents instead of view entries. The default if unspecified is mime.
   */
  richTextAs?: RichTextRepresentation;
  /**
   * When retrieving documents instead of view entries, mark them as read by the current user after retrieval
   */
  markRead?: boolean;
  /**
   * When retrieving documents instead of view entries, mark them as unread by the current user after retrieval
   */
  markUnread?: boolean;
  /**
   * At which entry should return values start (zero based), default = 0
   */
  start?: number;
};

/**
 * Options for GET /lists/{name} document operation.
 */
export type GetListViewEntryOptions = Omit<ListViewEntryOptions, 'pivotColumn'>;

/**
 * Options for GET /listspivot/{name} document operation.
 */
export type GetListPivotViewEntryOptions = Pick<
  ListViewEntryOptions,
  'mode' | 'startsWith' | 'column' | 'count' | 'direction' | 'key' | 'scope' | 'start'
>;

/**
 * Options for GET /lists document operation.
 */
export type GetListViewOptions = {
  /**
   * Allows to specify views, folders, all
   */
  type?: string;
  /**
   * When set to true, column information gets returned. Use with caution, slows down the API
   */
  columns?: boolean;
};

/**
 * Options for GET/PUT /design/designName/designName document operation.
 */
export type DesignOptions = {
  raw?: boolean;
  nsfPath?: string;
};

/**
 * Fetch view entries direction for alternative sorting.
 */
export enum SortShort {
  /**
   * Sort entries in ascending order.
   */
  ASC = 'asc',
  /**
   * Sort entries in descending order.
   */
  DESC = 'desc',
}

/**
 * Fetch view entries scope of what the view returns.
 */
export enum ViewEntryScopes {
  /**
   * Return all.
   */
  ALL = 'all',
  /**
   * Return category names.
   */
  CATEGORIES = 'categories',
  /**
   * Return document entries.
   */
  DOCUMENTS = 'documents',
}

/**
 * API call helper functions for lists operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoListViewOperations {
  private static _executeOperation = <T = any>(
    dominoConnector: DominoConnector,
    dominoAccess: DominoAccess,
    operationId: string,
    options: DominoRequestOptions,
    streamDecoder: (dataStream: ReadableStream<any>) => Promise<T>,
  ): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      dominoConnector
        .request(dominoAccess, operationId, options)
        .then(async (result) => {
          if (result.dataStream === null) {
            throw new NoResponseBody(operationId);
          }
          const decodedStream = await streamDecoder(result.dataStream);
          if (result.status >= 400) {
            throw new HttpResponseError(decodedStream as any);
          }

          return resolve(decodedStream);
        })
        .catch((error) => reject(error));
    });

  static getListViewEntry(
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    options?: GetListViewEntryOptions | { document: false },
  ): Promise<ListViewEntryJSON[]>;
  static getListViewEntry(
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    options?: GetListViewEntryOptions | { document: true },
  ): Promise<DominoDocument[]>;
  static getListViewEntry(
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    options?: GetListViewEntryOptions,
  ) {
    return new Promise<ListViewEntryJSON[] | DominoDocument[]>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(listViewName)) {
        return reject(new EmptyParamError('listViewName'));
      }

      const params: Map<string, any> = new Map();
      let returnAsDocument: boolean | undefined = false;
      params.set('name', listViewName);
      for (const key in options) {
        if (key === 'documents') {
          returnAsDocument = options[key];
        }
        params.set(key, options[key as keyof GetListViewEntryOptions]);
      }

      const reqOptions: DominoRequestOptions = { dataSource, params };

      this._executeOperation<void | DocumentBody[] | ListViewEntryJSON[]>(dominoConnector, dominoAccess, 'fetchViewEntries', reqOptions, streamToJson)
        .then((response) => {
          if (returnAsDocument) {
            return resolve((response as DocumentBody[]).map((doc) => new DominoDocument(doc)));
          }
          return resolve((response as ListViewEntryJSON[]).map((viewEntry) => new DominoListViewEntry(viewEntry).toListViewJson()));
        })
        .catch((error) => reject(error));
    });
  }

  static getListViewPivotEntry = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    pivotColumn: string,
    options?: GetListPivotViewEntryOptions,
  ) =>
    new Promise<PivotListViewResponse>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(listViewName)) {
        return reject(new EmptyParamError('listViewName'));
      }
      if (isEmpty(pivotColumn)) {
        return reject(new EmptyParamError('pivotColumn'));
      }

      const params: Map<string, any> = new Map();
      params.set('name', listViewName);
      params.set('pivotColumn', pivotColumn);
      for (const key in options) {
        params.set(key, options[key as keyof GetListPivotViewEntryOptions]);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
      };

      this._executeOperation<PivotListViewResponse>(dominoConnector, dominoAccess, 'pivotViewEntries', reqOptions, streamToJson)
        .then((pivotListViews) => resolve(pivotListViews))
        .catch((error) => reject(error));
    });

  static getListViews = (dataSource: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector, options?: GetListViewOptions) =>
    new Promise<GetListViewJSON[]>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }

      const params: Map<string, any> = new Map();
      for (const key in options) {
        params.set(key, options[key as keyof GetListViewOptions]);
      }

      const reqOptions: DominoRequestOptions = { dataSource, params };

      this._executeOperation<GetListViewJSON[]>(dominoConnector, dominoAccess, 'fetchViews', reqOptions, streamToJson)
        .then((listViews) => resolve(listViews))
        .catch((error) => reject(error));
    });

  static createUpdateListView = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listView: ListViewBody,
    designName: string,
    options?: DesignOptions,
  ) =>
    new Promise<CreateUpdateListResponse>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(listView)) {
        return reject(new EmptyParamError('listView'));
      }
      if (isEmpty(designName)) {
        return reject(new EmptyParamError('designName'));
      }

      const listViewObj = new DominoListView(listView);
      const params: Map<string, any> = new Map();
      params.set('designName', designName);
      params.set('designType', 'views');
      for (const key in options) {
        params.set(key, options[key as keyof DesignOptions]);
      }

      const reqOptions: DominoRequestOptions = {
        dataSource,
        params,
        body: JSON.stringify(listViewObj.toListViewJson()),
      };

      this._executeOperation<CreateUpdateListResponse>(dominoConnector, dominoAccess, 'updateCreateDesign', reqOptions, streamToJson)
        .then((listView) => resolve(listView))
        .catch((error) => reject(error));
    });

  static getListView = (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    designName: string,
    options?: DesignOptions,
  ) =>
    new Promise<GetListViewDesignJSON>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }
      if (isEmpty(designName)) {
        return reject(new EmptyParamError('designName'));
      }

      const params: Map<string, any> = new Map();
      params.set('designName', designName);
      params.set('designType', 'views');
      for (const key in options) {
        params.set(key, options[key as keyof DesignOptions]);
      }

      const reqOptions: DominoRequestOptions = { dataSource, params };

      this._executeOperation<GetListViewDesignJSON>(dominoConnector, dominoAccess, 'getDesign', reqOptions, streamToJson)
        .then((listView) => resolve(listView))
        .catch((error) => reject(error));
    });
}

export default DominoListViewOperations;

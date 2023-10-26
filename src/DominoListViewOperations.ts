/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DesignColumnSimple, DocumentBody, DominoAccess, DominoRequestOptions, ListViewBody, ListViewEntryJSON, RichTextRepresentation } from '.';
import DominoConnector from './DominoConnector';
import DominoDocument from './DominoDocument';
import DominoListView from './DominoListView';
import DominoListViewEntry from './DominoListViewEntry';

export type GetListViewDesignJSON = {
  '@name': string;
  '@alias': string[];
  '@unid': string;
  '@noteid': string;
  '@selectionFormula': string;
} & { [key: string]: DesignColumnSimple | string | string[] };

export type GetListViewJSON = Pick<ListViewBody, 'title' | 'isFolder' | 'unid' | 'alias'>;

export type CreateListResponse = {
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
   * How many entries shall be returned, default = Integer.MaxInteger
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
export type GetListViewEntryOptions = Omit<ListViewEntryOptions, 'pivotColumn'> & {
  /**
   * A function that subscribes to response and reacts to each JSON item received.
   */
  subscriber?: () => WritableStream<ListViewEntryJSON | DocumentBody>;
};

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
 * Options for GET /design/designName/designName document operation.
 */
export type GetDesignOptions = {
  raw?: boolean;
  nsfPath?: string;
};

/**
 * Options for PUT /design/designName/designName document operation.
 */
export type CreateUpdateDesignOptions = GetDesignOptions;

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
  private static _executeOperation = async <T = any>(
    dominoConnector: DominoConnector,
    dominoAccess: DominoAccess,
    operationId: string,
    options: DominoRequestOptions,
  ): Promise<T> => {
    const response = await dominoConnector.request<T>(dominoAccess, operationId, options);
    return Promise.resolve(response);
  };

  static async getListViewEntry(
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    options?: GetListViewEntryOptions | { document?: false; subscriber?: undefined },
  ): Promise<ListViewEntryJSON[]>;
  static async getListViewEntry(
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    options?: GetListViewEntryOptions | { document: true },
  ): Promise<DominoDocument[]>;
  static async getListViewEntry(
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    options?: GetListViewEntryOptions | { subscriber: () => WritableStream<ListViewEntryJSON | DocumentBody> },
  ): Promise<DominoDocument[]>;
  static async getListViewEntry(
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    options?: GetListViewEntryOptions,
  ): Promise<ListViewEntryJSON[] | DominoDocument[] | void> {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (listViewName.trim().length === 0) {
      return Promise.reject(new Error('name must not be empty.'));
    }

    const params: Map<string, any> = new Map();
    let subscriber = null;
    let returnAsDocument: boolean | undefined = false;
    params.set('name', listViewName);

    for (const key in options) {
      if (key === 'subscriber') {
        subscriber = options[key];
      } else {
        if (key === 'documents') {
          returnAsDocument = options[key];
        }
        params.set(key, options[key as keyof GetListViewEntryOptions]);
      }
    }

    const reqOptions: DominoRequestOptions = {
      dataSource,
      params,
      subscriber,
    };

    if (subscriber !== undefined && subscriber !== null) {
      await this._executeOperation<void>(dominoConnector, dominoAccess, 'fetchViewEntries', reqOptions);
      return Promise.resolve();
    } else if (returnAsDocument !== undefined && returnAsDocument) {
      const response = await this._executeOperation<DocumentBody[]>(dominoConnector, dominoAccess, 'fetchViewEntries', reqOptions);
      return Promise.resolve(response.map((doc) => new DominoDocument(doc)));
    }
    const response = await this._executeOperation<ListViewEntryJSON[]>(dominoConnector, dominoAccess, 'fetchViewEntries', reqOptions);
    return Promise.resolve(response.map((viewEntry) => new DominoListViewEntry(viewEntry).toListViewJson()));
  }

  static getListViewPivotEntry = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listViewName: string,
    pivotColumn: string,
    options?: GetListPivotViewEntryOptions,
  ): Promise<PivotListViewResponse> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (listViewName.trim().length === 0) {
      return Promise.reject(new Error('name must not be empty.'));
    }
    if (pivotColumn.trim().length === 0) {
      return Promise.reject(new Error('pivotColumn must not be empty.'));
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
    const response = await this._executeOperation<PivotListViewResponse>(dominoConnector, dominoAccess, 'pivotViewEntries', reqOptions);
    return Promise.resolve(response);
  };

  static getListViews = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    options?: GetListViewOptions,
  ): Promise<GetListViewJSON[]> => {
    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }

    const params: Map<string, any> = new Map();

    for (const key in options) {
      params.set(key, options[key as keyof GetListViewOptions]);
    }

    const reqOptions: DominoRequestOptions = {
      dataSource,
      params,
    };
    const response = await this._executeOperation<GetListViewJSON[]>(dominoConnector, dominoAccess, 'fetchViews', reqOptions);
    return Promise.resolve(response);
  };

  static createUpdateListView = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    listView: ListViewBody,
    designName: string,
    options?: CreateUpdateDesignOptions,
  ): Promise<CreateListResponse> => {
    const listViewObj = new DominoListView(listView);
    const params: Map<string, any> = new Map();

    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (designName.trim().length === 0) {
      return Promise.reject(new Error('designName must not be empty.'));
    }

    params.set('designName', designName);
    params.set('designType', 'views');

    for (const key in options) {
      params.set(key, options[key as keyof CreateUpdateDesignOptions]);
    }

    const reqOptions: DominoRequestOptions = {
      dataSource,
      params,
      body: JSON.stringify(listViewObj.toListViewJson()),
    };

    const response = await this._executeOperation<CreateListResponse>(dominoConnector, dominoAccess, 'updateCreateDesign', reqOptions);
    return Promise.resolve(response);
  };

  static getListView = async (
    dataSource: string,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
    designName: string,
    options?: GetDesignOptions,
  ): Promise<GetListViewDesignJSON> => {
    const params: Map<string, any> = new Map();

    if (dataSource.trim().length === 0) {
      return Promise.reject(new Error('dataSource must not be empty.'));
    }
    if (designName.trim().length === 0) {
      return Promise.reject(new Error('designName must not be empty.'));
    }

    params.set('designName', designName);
    params.set('designType', 'views');

    for (const key in options) {
      params.set(key, options[key as keyof GetDesignOptions]);
    }

    const reqOptions: DominoRequestOptions = {
      dataSource,
      params,
    };

    const response = await this._executeOperation<GetListViewDesignJSON>(dominoConnector, dominoAccess, 'getDesign', reqOptions);
    return Promise.resolve(response);
  };
}

export default DominoListViewOperations;

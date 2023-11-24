/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { ListType } from '.';
import { DominoRestListView } from './RestInterfaces';
import { EmptyParamError, MissingParamError, NotAnArrayError } from './errors';
import { isEmpty } from './helpers/Utilities';

export type DesignColumnSimple = {
  name: string;
  title?: string;
  formula: string;
  separatemultiplevalues?: boolean;
  sort?: SortType;
  position?: number;
};

/**
 * Domino REST API List View base properties.
 */
export type DominoBaseListView = {
  /**
   * Type of view: Can be a folder or a view.
   */
  type?: ListType;
  /**
   * Alias of the view.
   */
  alias?: string[];
  /**
   * Identify if the view is Folder or not.
   */
  isFolder?: boolean;
  /**
   * Title of the View.
   */
  title?: string;
  /**
   * The unique ID of the view
   */
  unid?: string;
  /**
   * The note ID, which is uniquely identifies this view within a particular database.
   */
  noteid?: string;
};

/**
 * Domino REST API list view properties for getting all views .
 */
export type ListViewBody = {
  /**
   * The name of the view.
   */
  name: string;
  /**
   * The formula of getting the view.
   */
  selectionFormula: string;
  /**
   * Columns that comprises the view to which the document fields will be based.
   */
  columns: DesignColumnSimple[];
} & DominoBaseListView;

/**
 * Sort types when creating a column in a view.
 */
export enum SortType {
  /**
   * Arrange data in increasing order.
   */
  Ascending = 'ascending',
  /**
   * Arrange data in decreasing order.
   */
  Descending = 'descending',
  /**
   * Data doesn't follow any specific order or sequence.
   */
  None = 'none',
}

/**
 * An object that is equivalent to a design element `view` in Domino.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoListView implements DominoRestListView {
  name: string;
  selectionFormula: string;
  columns: DesignColumnSimple[];
  type?: ListType;

  readonly '@alias'?: string[];
  readonly '@title'?: string;
  readonly '@unid'?: string;
  readonly '@noteid'?: string;
  readonly isFolder?: boolean;

  constructor(doc: ListViewBody) {
    if (!doc.hasOwnProperty('name')) {
      throw new MissingParamError('name');
    }
    if (isEmpty(doc.name)) {
      throw new EmptyParamError('name');
    }
    if (!doc.hasOwnProperty('selectionFormula')) {
      throw new MissingParamError('selectionFormula');
    }
    if (isEmpty(doc.selectionFormula)) {
      throw new EmptyParamError('selectionFormula');
    }
    if (!doc.hasOwnProperty('columns')) {
      throw new MissingParamError('columns');
    }
    if (isEmpty(doc.columns)) {
      throw new EmptyParamError('columns');
    }
    if (!Array.isArray(doc.columns)) {
      throw new NotAnArrayError('columns');
    }

    this.name = doc.name;
    this.selectionFormula = doc.selectionFormula;
    const arr: DesignColumnSimple[] = [];
    doc.columns.forEach((column) => {
      DominoListView._validateDesignColumnSimple(column);
      arr.push(column);
    });
    this.columns = arr;
    this.type = doc.type;
    this['@alias'] = doc.alias;
    this['@noteid'] = doc.noteid;
    this['@title'] = doc.title;
    this['@unid'] = doc.unid;
    this.isFolder = doc.isFolder;
  }

  toListViewJson = (): ListViewBody => {
    const json: ListViewBody = {
      name: this.name,
      selectionFormula: this.selectionFormula,
      columns: this.columns,
    };

    return json;
  };

  private static _validateDesignColumnSimple = (column: DesignColumnSimple) => {
    if (!column.hasOwnProperty('name')) {
      throw new MissingParamError('columns.name');
    }
    if (!column.hasOwnProperty('formula')) {
      throw new MissingParamError('columns.formula');
    }
  };
}

export default DominoListView;

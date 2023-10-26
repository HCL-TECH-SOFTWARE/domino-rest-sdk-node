/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { ListType } from '.';
import { DominoRestListView } from './RestInterfaces';

export type DesignColumnSimple = {
  name: string;
  title?: string;
  formula: string;
  separateMultipleValues?: boolean;
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
  name: string | undefined;
  selectionFormula: string | undefined;
  columns: DesignColumnSimple[];
  type?: ListType | undefined;

  // setup fields listview when get and request

  // basis fields listview
  readonly '@alias'?: string[] = [];
  readonly isFolder?: boolean;
  readonly '@title'?: string | undefined;
  readonly '@unid'?: string | undefined;
  readonly '@noteid'?: string | undefined;
  constructor(doc: ListViewBody) {
    if (doc.hasOwnProperty('name') && doc.name && doc.name.length > 0) {
      this.name = doc.name;
    } else {
      throw new Error('Domino lists needs name value.');
    }
    if (doc.hasOwnProperty('selectionFormula') && doc.selectionFormula != null && doc.selectionFormula.length > 0) {
      this.selectionFormula = doc.selectionFormula;
    } else {
      throw new Error('Domino lists needs selectionFormula value.');
    }
    if (doc.hasOwnProperty('columns') && doc.columns != null && doc.columns.length > 0 && doc.columns) {
      const arr: DesignColumnSimple[] = [];
      doc.columns.forEach(function (value) {
        DominoListView._validateDesignColumnSimple(value);
        arr.push(value);
      });
      this.columns = arr;
    } else {
      throw new Error('Domino lists needs correct columns value.');
    }
  }

  private static _validateDesignColumnSimple(obj: DesignColumnSimple) {
    if (!obj.name) {
      throw new Error("Required property 'name' is missing");
    }
    if (!obj.formula) {
      throw new Error("Required property 'formula' is missing");
    }
  }

  toListViewJson = (): ListViewBody => {
    const json: ListViewBody = {
      name: '',
      selectionFormula: '',
      columns: [],
    };

    if (
      this.name != undefined &&
      this.name &&
      this.selectionFormula != undefined &&
      this.selectionFormula &&
      this.columns != undefined &&
      this.columns &&
      this.columns.length > 0
    ) {
      (json.name = this.name), (json.selectionFormula = this.selectionFormula);
      json.columns = this.columns;
    } else {
      throw Error(
        'Failed to convert DominoListView Object to ListViewBody because of having a invalid required fields in Domino List View (name, selectionFormula and columns)',
      );
    }
    return json;
  };
}

export default DominoListView;

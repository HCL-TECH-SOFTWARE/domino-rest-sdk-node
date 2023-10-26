/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoRestListViewEntry } from './RestInterfaces';

export type DominoBaseListViewEntry = {
  '@unid': string;
  '@index': string;
  '@noteid': number;
};

export type ListViewEntryBody = { [key: string]: any } & DominoBaseListViewEntry;

/**
 * Domino REST API list view properties for creating a view and displaying /lists/{name}.
 */
export type ListViewEntryJSON = { [key: string]: any } & DominoBaseListViewEntry;

/**
 * A List in the Domino REST API could be backed by a view or a folder.
 */
export enum ListType {
  /**
   * Domino folder.
   */
  FOLDER = 'folder',
  /**
   * Domino view.
   */
  VIEW = 'view',
}

/**
 * An object that is equivalent to a design element `view entry` in Domino.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoListViewEntry implements DominoRestListViewEntry {
  '@unid': string;
  '@index': string;
  '@noteid': number;

  readonly fields: Map<string, any> = new Map<string, any>();
  constructor(doc: ListViewEntryBody) {
    this['@unid'] = doc['@unid'];
    this['@index'] = doc['@index'];
    this['@noteid'] = doc['@noteid'];

    const nonFieldKeys = ['@meta', '@index', '@noteid'];

    for (const key in doc) {
      if (!nonFieldKeys.includes(key)) {
        this.fields.set(key, doc[key]);
      }
    }
  }

  toListViewJson = (): ListViewEntryJSON => {
    const json: ListViewEntryJSON = {
      '@unid': this['@unid'],
      '@index': this['@index'],
      '@noteid': this['@noteid'],
    };
    this.fields.forEach((value, key) => {
      json[key] = value;
    });
    return json;
  };
}

export default DominoListViewEntry;

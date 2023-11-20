/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoRestDocument } from './RestInterfaces';
import { isEmpty } from './Utilities';
import { EmptyParamError } from './errors/EmptyParamError';
import { MissingParamError } from './errors/MissingParamError';

/**
 * Base properties of a document.
 */
export type DominoBaseDocument = {
  /**
   * Document metadata.
   */
  '@meta'?: DominoDocumentMeta;
  /**
   * Form value of document.
   */
  Form: string;
  /**
   * List of warnings (if any) when document operation is done.
   */
  readonly '@warnings'?: string[];
};

/**
 * Domino REST API document body.
 */
export type DocumentBody = { [key: string]: any } & DominoBaseDocument;

/**
 * Domino REST API document properties without some of its base properties.
 */
export type DocumentJSON = {
  /**
   * Form value of the document.
   */
  Form: string;
  /**
   * Generic document field name and its value.
   */
  [key: string]: any;
};

/**
 * Domino document metadata.
 */
export type DominoDocumentMeta = {
  /**
   * The note ID of a document, which is uniquely identifies a document within a particular database.
   */
  noteid?: number;
  /**
   * Universal Id of the document, uniquely identifies a document across all replicas of a database.
   */
  unid?: string;
  /**
   * Date of document creation in ISO format.
   */
  created?: string;
  /**
   * Last update date of a document in ISO format.
   */
  lastmodified?: string;
  /**
   * Last access date of a document in ISO format.
   */
  lastaccessed?: string;
  /**
   * Timestamp for when the document was initially created.
   */
  lastmodifiedinfile?: string;
  /**
   * Timestamp for when the document was initially created.
   */
  addedtofile?: string;
  /**
   * Note class of document.
   */
  noteclass?: string[];
  /**
   * Is the document unread by the current user.
   */
  unread?: boolean;
  /**
   * Could the user who retrieved a document update it.
   */
  editable?: boolean;
  /**
   * This field records the current revision version of document. It's a 32-character hex-encoded
   * string of date. If db config 'requireRevisionToUpdate' is enabled, then revision is required
   * when update document and only update document when revision version is right.
   */
  revision?: string;
  /**
   * Size in byte of a document or json result.
   */
  size?: number;
};

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * Holds Domino document information and utility functions.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoDocument implements DominoRestDocument {
  '@meta'?: DominoDocumentMeta;
  Form: string;
  '@warnings'?: string[];
  fields: Map<string, any> = new Map<string, any>();

  constructor(_doc: DocumentBody) {
    // Make a deep copy of passed object
    const doc = JSON.parse(JSON.stringify(_doc));

    this['@meta'] = doc['@meta'];
    if (!doc.hasOwnProperty('Form')) {
      throw new MissingParamError('Form');
    }
    if (isEmpty(doc.Form)) {
      throw new EmptyParamError('Form');
    }
    this.Form = doc.Form;
    this['@warnings'] = doc['@warnings'];

    const nonFieldKeys = ['@meta', 'Form', '@warnings'];
    for (const key in doc) {
      if (!nonFieldKeys.includes(key)) {
        this.fields.set(key, doc[key]);
      }
    }
  }

  getUNID = (): string | undefined => {
    return this['@meta']?.unid;
  };

  setUNID = (unid: string): void => {
    if (this['@meta'] !== undefined) {
      this['@meta'].unid = unid;
    } else {
      this['@meta'] = { unid };
    }
  };

  getRevision = (): string | undefined => {
    return this['@meta']?.revision;
  };

  toDocJson = (): DocumentJSON => {
    const json: DocumentJSON = {
      Form: this.Form,
    };
    this.fields.forEach((value, key) => {
      json[key] = value;
    });

    return json;
  };

  toJson = (): Partial<DocumentBody> => {
    let json: Writable<Partial<DocumentBody>> = {};
    if (this['@meta'] !== undefined) {
      json['@meta'] = this['@meta'];
    }
    json = {
      ...json,
      Form: this.Form,
    };
    this.fields.forEach((value, key) => {
      json[key] = value;
    });
    if (this['@warnings'] !== undefined) {
      json['@warnings'] = this['@warnings'];
    }

    return json;
  };
}

export default DominoDocument;

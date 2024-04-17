/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import { EmptyParamError, MissingParamError } from '../src/index.ts';
import DominoDocument from '../src/DominoDocument.ts';

describe('DominoDocument', () => {
  const doc1 = JSON.parse(fs.readFileSync('./test/resources/DominoDocument/doc1.json', 'utf-8'));
  const doc2 = JSON.parse(fs.readFileSync('./test/resources/DominoDocument/doc2.json', 'utf-8'));
  const doc3 = JSON.parse(fs.readFileSync('./test/resources/DominoDocument/doc3.json', 'utf-8'));

  describe('constructor', () => {
    it(`should create a 'DominoDocument' object`, () => {
      const dominoDocument = new DominoDocument(doc1);
      expect(dominoDocument).to.instanceOf(DominoDocument);
      expect(dominoDocument['@meta']).to.deep.equal(doc1['@meta']);
      expect(dominoDocument['@warnings']).to.deep.equal(doc1['@warnings']);
      expect(dominoDocument.Form).to.deep.equal(doc1.Form);
      expect(dominoDocument.fields.size).to.equal(3);
    });

    it(`should throw an error if 'Form' is missing`, () => {
      const doc = JSON.parse(JSON.stringify(doc1));
      delete doc.Form;

      expect(() => new DominoDocument(doc)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'Form' is empty`, () => {
      const doc = JSON.parse(JSON.stringify(doc1));
      doc.Form = '';

      expect(() => new DominoDocument(doc)).to.throw(EmptyParamError);
    });
  });

  describe('getUNID', () => {
    it('should return document UNID if it exists', () => {
      const ddoc = new DominoDocument(doc1);
      expect(ddoc.getUNID()).equal(doc1['@meta'].unid);
    });

    it(`should return 'undefined' if document UNID is missing`, () => {
      const ddoc = new DominoDocument(doc2);
      expect(ddoc.getUNID()).to.be.undefined;
    });
  });

  describe('setUNID', () => {
    it('should update document UNID', () => {
      const ddoc1 = new DominoDocument(doc1);
      const newUNID1 = 'new_UNID';
      ddoc1.setUNID(newUNID1);
      expect(ddoc1.getUNID()).equal(newUNID1);

      const ddoc2 = new DominoDocument(doc2);
      const newUNID2 = '3000';
      ddoc2.setUNID(newUNID2);
      expect(ddoc2.getUNID()).equal(newUNID2);
    });
  });

  describe('getRevision', () => {
    it('should return document revision if it exists', () => {
      const ddoc = new DominoDocument(doc1);
      expect(ddoc.getRevision()).equal(doc1['@meta'].revision);
    });

    it(`should return 'undefined' if document revision is missing`, () => {
      const ddoc = new DominoDocument(doc2);
      expect(ddoc.getRevision()).to.be.undefined;
    });
  });

  describe('toDocJson', () => {
    it('should return an object containing only form value and form fields', () => {
      const expected1 = {
        category: doc1.category,
        name: doc1.name,
        age: doc1.age,
        Form: doc1.Form,
      };
      const ddoc1 = new DominoDocument(doc1);
      expect(ddoc1.toDocJson()).to.deep.equal(expected1);

      const expected2 = {
        category: doc2.category,
        website: doc2.website,
        name: doc2.name,
        age: doc2.age,
        Form: doc2.Form,
      };
      const ddoc2 = new DominoDocument(doc2);
      expect(ddoc2.toDocJson()).to.deep.equal(expected2);

      const expected3 = {
        Form: doc3.Form,
      };
      const ddoc3 = new DominoDocument(doc3);
      expect(ddoc3.toDocJson()).to.deep.equal(expected3);
    });
  });

  describe('toJson', () => {
    it('should return an object containing all document data', () => {
      const ddoc1 = new DominoDocument(doc1);
      expect(ddoc1.toJson()).to.deep.equal(doc1);

      const ddoc2 = new DominoDocument(doc2);
      expect(ddoc2.toJson()).to.deep.equal(doc2);

      const ddoc3 = new DominoDocument(doc3);
      expect(ddoc3.toJson()).to.deep.equal(doc3);
    });
  });

  describe('Document fields', () => {
    it('should return an object specified by the given fields type', () => {
      const nonFieldKeys = ['@meta', 'Form', '@warnings'];

      const ddoc1 = new DominoDocument(doc1);
      const fieldsDoc1 = new Map<string, any>();
      for (const key in doc1) {
        if (!nonFieldKeys.includes(key)) {
          fieldsDoc1.set(key, doc1[key as keyof typeof doc1]);
        }
      }
      expect(ddoc1.fields).to.deep.equal(fieldsDoc1);

      const ddoc2 = new DominoDocument(doc2);
      const fieldsDoc2 = new Map<string, any>();
      for (const key in doc2) {
        if (!nonFieldKeys.includes(key)) {
          fieldsDoc2.set(key, doc2[key as keyof typeof doc2]);
        }
      }
      expect(ddoc2.fields).to.deep.equal(fieldsDoc2);

      const ddoc3 = new DominoDocument(doc3);
      const fieldsDoc3 = new Map<string, any>();
      for (const key in doc3) {
        if (!nonFieldKeys.includes(key)) {
          fieldsDoc3.set(key, doc3[key as keyof typeof doc3]);
        }
      }
      expect(ddoc3.fields).to.deep.equal(fieldsDoc3);
    });

    it('should return the value of key specified by the given fields type', () => {
      const ddoc1 = new DominoDocument(doc1);
      expect(ddoc1.fields.get('age')).to.deep.equal(doc1.age);
      expect(ddoc1.fields.get('category')).to.deep.equal(doc1.category);
      expect(ddoc1.fields.get('name')).to.deep.equal(doc1.name);
      expect(ddoc1.fields.get('website')).to.be.undefined;

      const ddoc2 = new DominoDocument(doc2);
      expect(ddoc2.fields.get('age')).to.deep.equal(doc2.age);
      expect(ddoc2.fields.get('category')).to.deep.equal(doc2.category);
      expect(ddoc2.fields.get('name')).to.deep.equal(doc2.name);
      expect(ddoc2.fields.get('website')).to.deep.equal(doc2.website);

      const ddoc3 = new DominoDocument(doc3);
      expect(ddoc3.fields.get('age')).to.be.undefined;
      expect(ddoc3.fields.get('category')).to.be.undefined;
      expect(ddoc3.fields.get('name')).to.be.undefined;
      expect(ddoc3.fields.get('website')).to.be.undefined;
    });

    it('should be updated properly', () => {
      const ddoc = new DominoDocument(doc1);

      const newCategory = ['Problem', 'Debt'];
      ddoc.fields.set('category', newCategory);
      expect(ddoc.fields.get('age')).equal(doc1.age);
      expect(ddoc.fields.get('category')).equal(newCategory);
      expect(ddoc.fields.get('name')).equal(doc1.name);
      expect(ddoc.fields.get('website')).to.be.undefined;

      const updates = {
        age: 45,
        name: 'John Smith',
      };
      ddoc.fields.set('age', updates.age);
      ddoc.fields.set('name', updates.name);
      expect(ddoc.fields.get('age')).equal(updates.age);
      expect(ddoc.fields.get('category')).equal(newCategory);
      expect(ddoc.fields.get('name')).equal(updates.name);
      expect(ddoc.fields.get('website')).to.be.undefined;

      const newWebsite = 'https://help-me.com';
      ddoc.fields.set('website', newWebsite);
      expect(ddoc.fields.get('age')).equal(updates.age);
      expect(ddoc.fields.get('category')).equal(newCategory);
      expect(ddoc.fields.get('name')).equal(updates.name);
      expect(ddoc.fields.get('website')).equal(newWebsite);

      const newCustomer = new Map<string, any>();
      newCustomer.set('age', 50);
      newCustomer.set('name', 'John Nathan');
      newCustomer.set('category', ['Rich', 'Debt-free']);
      newCustomer.set('website', 'https://how-to-money.com');
      ddoc.fields = newCustomer;
      expect(ddoc.fields).to.deep.equal(newCustomer);
    });
  });
});

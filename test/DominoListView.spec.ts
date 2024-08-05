/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import { DesignColumnSimple, EmptyParamError, ListType, ListViewBody, MissingParamError, NotAnArrayError } from '../src/index.js';
import DominoListView from '../src/DominoListView.js';

describe('DominoListView', () => {
  const dlv1 = JSON.parse(fs.readFileSync('./test/resources/DominoListView/dlv1_request.json', 'utf-8'));
  const dlv2NoFormulaCol = JSON.parse(fs.readFileSync('./test/resources/DominoListView/dlv2_incorrectCols_noFormula.json', 'utf-8'));
  const dlv2NoNameCol = JSON.parse(fs.readFileSync('./test/resources/DominoListView/dlv2_incorrectCols_noName.json', 'utf-8'));

  describe('constructor', () => {
    let listViewBody: ListViewBody;

    beforeEach(() => {
      listViewBody = {
        name: dlv1.name,
        selectionFormula: dlv1.selectionFormula,
        columns: dlv1.columns as DesignColumnSimple[],
        alias: ['test', 'test'],
        noteid: '123',
        title: 'mytitle',
        unid: 'NJASCNAJKBCJKB',
        isFolder: false,
        type: ListType.VIEW,
      };
    });

    it(`should create a 'DominoListView' object`, () => {
      const dominoListView = new DominoListView(listViewBody);
      expect(dominoListView).to.instanceOf(DominoListView);
      expect(dominoListView['@alias']).to.deep.equal(listViewBody.alias);
      expect(dominoListView['@noteid']).to.equal(listViewBody.noteid);
      expect(dominoListView['@title']).to.equal(listViewBody.title);
      expect(dominoListView['@unid']).to.equal(listViewBody.unid);
      expect(dominoListView.columns).to.deep.equal(dlv1.columns);
      expect(dominoListView.isFolder).to.equal(listViewBody.isFolder);
      expect(dominoListView.name).to.deep.equal(dlv1.name);
      expect(dominoListView.selectionFormula).to.deep.equal(dlv1.selectionFormula);
      expect(dominoListView.type).to.equal(listViewBody.type);
    });

    it(`should throw an error if 'name' is missing`, () => {
      delete (listViewBody as Partial<DominoListView>).name;
      expect(() => new DominoListView(listViewBody)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'name' is empty`, () => {
      listViewBody.name = '';
      expect(() => new DominoListView(listViewBody)).to.throw(EmptyParamError);
    });

    it(`should throw an error if 'selectionFormula' is missing`, () => {
      delete (listViewBody as Partial<DominoListView>).selectionFormula;
      expect(() => new DominoListView(listViewBody)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'selectionFormula' is empty`, () => {
      listViewBody.selectionFormula = '';
      expect(() => new DominoListView(listViewBody)).to.throw(EmptyParamError);
    });

    it(`should throw an error if 'columns' is missing`, () => {
      delete (listViewBody as Partial<DominoListView>).columns;
      expect(() => new DominoListView(listViewBody)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'columns' is empty`, () => {
      listViewBody.columns = [];
      expect(() => new DominoListView(listViewBody)).to.throw(EmptyParamError);
    });

    it(`should throw an error if 'columns' is not an array`, () => {
      listViewBody.columns = 'columns' as any;
      expect(() => new DominoListView(listViewBody)).to.throw(NotAnArrayError);
    });

    it(`should throw an error when a column 'name' is missing`, () => {
      expect(() => new DominoListView(dlv2NoNameCol as ListViewBody)).to.throw(MissingParamError);
    });

    it(`should throw an error when a column 'formula' is missing`, () => {
      expect(() => new DominoListView(dlv2NoFormulaCol as ListViewBody)).to.throw(MissingParamError);
    });
  });

  describe('toListViewJson', () => {
    it('should return columns if it is in the given view', () => {
      const dominoListView = new DominoListView(dlv1 as ListViewBody);
      expect(dominoListView.toListViewJson()).to.deep.equal(dlv1);
    });
  });
});

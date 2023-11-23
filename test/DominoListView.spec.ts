/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import { DesignColumnSimple, EmptyParamError, ListViewBody, MissingParamError } from '../src';
import DominoListView from '../src/DominoListView';
import dlv1 from './resources/DominoListView/dlv1_request.json';
import dlv2NoFormulaCol from './resources/DominoListView/dlv2_incorrectCols_noFormula.json';
import dlv2NoNameCol from './resources/DominoListView/dlv2_incorrectCols_noName.json';

describe('DominoListView', () => {
  const ddlv1: ListViewBody = {
    name: dlv1.name,
    selectionFormula: dlv1.selectionFormula,
    columns: dlv1.columns as DesignColumnSimple[],
  };
  const ddlv2IncorrectCol: ListViewBody = {
    name: dlv2NoNameCol.name,
    selectionFormula: dlv2NoNameCol.selectionFormula,
    columns: dlv2NoNameCol.columns as DesignColumnSimple[],
  };
  const ddlv2IncorrectCol2: ListViewBody = {
    name: dlv2NoFormulaCol.name,
    selectionFormula: dlv2NoFormulaCol.selectionFormula,
    columns: dlv2NoFormulaCol.columns as DesignColumnSimple[],
  };
  const ddlv2: ListViewBody = {
    name: '',
    selectionFormula: '',
    columns: [],
  };
  const ddlv3: ListViewBody = {
    name: 'newentry',
    selectionFormula: '',
    columns: [],
  };
  const lvObject = new DominoListView(ddlv1);

  describe('structure', () => {
    describe('name', () => {
      it('should return name if it is in the given view', () => {
        expect(lvObject.name).to.deep.equal(ddlv1.name);
      });

      it('should throw error when name is empty', () => {
        expect(() => new DominoListView(ddlv2)).to.throw(EmptyParamError, `Parameter 'name' should not be empty.`);
      });
    });

    describe('selectionFormula', () => {
      it('should return selectionFormula if it is in the given view', () => {
        expect(lvObject.selectionFormula).to.deep.equal(ddlv1.selectionFormula);
      });
      it('should throw error when selectionFormula is empty', () => {
        expect(() => new DominoListView(ddlv3)).to.throw(EmptyParamError, `Parameter 'selectionFormula' should not be empty.`);
      });
    });

    describe('columns', () => {
      it('should return columns if it is in the given view', () => {
        expect(lvObject.columns).to.deep.equal(ddlv1.columns);
      });

      it('should throw error when columns is structured incorrectly (missing name)', () => {
        expect(() => new DominoListView(ddlv2IncorrectCol)).to.throw(MissingParamError, `Parameter 'columns.name' is required.`);
      });

      it('should throw error when columns is structured incorrectly (missing formula)', () => {
        expect(() => new DominoListView(ddlv2IncorrectCol2)).to.throw(MissingParamError, `Parameter 'columns.formula' is required.`);
      });
    });
  });

  describe('toListViewJson', () => {
    const lvObjectToListViewJson = new DominoListView(ddlv1);

    it('should return columns if it is in the given view', () => {
      expect(lvObjectToListViewJson.toListViewJson()).to.deep.equal(dlv1);
    });
  });
});

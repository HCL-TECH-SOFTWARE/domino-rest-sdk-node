/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import DominoListViewEntry from '../src/DominoListViewEntry';
import lve1 from './resources/DominoListViewEntry/lve1.json';

describe('DominoListViewEntry', () => {
  describe('structure', () => {
    describe('name', () => {
      it('should return @unid if it is in the given view entry', () => {
        const firstEntry = new DominoListViewEntry(lve1);
        expect(firstEntry['@unid']).to.deep.equal(lve1['@unid']);
      });
    });
  });

  describe('toListViewJson', () => {
    describe('ListViewEntryJSON', () => {
      it('should return @unid if it is in the given view entry', () => {
        const firstEntry = new DominoListViewEntry(lve1);
        expect(firstEntry.toListViewJson()).to.deep.equal(lve1);
      });
    });
  });
});

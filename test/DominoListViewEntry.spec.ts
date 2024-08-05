/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import DominoListViewEntry from '../src/DominoListViewEntry.js';

describe('DominoListViewEntry', () => {
  const lve1 = JSON.parse(fs.readFileSync('./test/resources/DominoListViewEntry/lve1.json', 'utf-8'));

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

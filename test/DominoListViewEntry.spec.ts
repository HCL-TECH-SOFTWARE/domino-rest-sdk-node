/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import DominoListViewEntry from '../src/DominoListViewEntry';
// import scpErrnoApiName from './resources/DominoScope/scp_err_noApiName.json';
// import scpErrnoSchema from './resources/DominoScope/scp_err_noSchema.json';
// import scpErrnoNsfPath from './resources/DominoScope/scp_err_noNsfPath.json';
import lve1 from './resources/DominoListViewEntry/lve1.json';
// import lve2 from './resources/DominoListViewEntry/lve2_nounid.json';

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
// toListViewJson = (): ListViewEntryJSON => {
//   const json: ListViewEntryJSON = {
//     '@unid': this['@unid'],
//     '@index': this['@index'],
//     '@noteid': this['@noteid'],
//   };
//   this.fields.forEach((value, key) => {
//     json[key] = value;
//   });
//   return json;
// };

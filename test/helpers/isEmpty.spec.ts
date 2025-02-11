/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { isEmpty } from '../../src/helpers/Utilities.js';

use(chaiAsPromised);

describe('Many ways to be empty', () => {
  it('should have empty arrays', () => {
    expect(isEmpty([])).to.be.true;
  });

  it('should have null arrays as empty', () => {
    expect(isEmpty([null, null])).to.be.true;
  });

  it('should report null as empty', () => {
    expect(isEmpty(null)).to.be.true;
  });
});

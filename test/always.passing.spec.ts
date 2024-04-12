/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

// https://github.com/sinonjs/sinon/issues/2590
// Since this test always runs first, we add this here.
fetch;

describe('These tests', () => {
  it('should always pass', () => {
    expect(1).to.equal(1);
  });

  const p: Promise<number> = new Promise<number>((resolve) => {
    setTimeout(() => resolve(42), 100);
  });
  it('also the promise should always pass', (done) => {
    expect(p).to.eventually.be.eql(42).notify(done);
  });

  it('also the promise should always pass on return', () => {
    return expect(p).to.eventually.be.eql(42);
  });

  it('also the promise should always pass on await', async () => {
    let result = await p;
    expect(result).to.be.eql(42);
  });
});

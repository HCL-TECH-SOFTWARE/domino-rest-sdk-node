/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect, use } from 'chai';
import { chaiAsPromised } from 'chai-promised';
import { afterEach } from 'mocha';
import sinon from 'sinon';

use(chaiAsPromised);

const urlToResultMapping = new Map<string, any>();

urlToResultMapping.set('/', {
  body: { color: 'red' },
  params: {
    status: 200,
    headers: {
      'Content-type': 'application/json',
    },
  },
});

urlToResultMapping.set('http://some.url', {
  body: { mood: 'failure' },
  params: {
    status: 500,
    headers: {
      'Content-type': 'application/json',
    },
  },
});

const makeReply = (url: string) => {
  if (urlToResultMapping.has(url)) {
    let { body, params } = urlToResultMapping.get(url);
    return Promise.resolve(mockResponseOK(body, params));
  }
  return Promise.resolve(mockResponseOK({ status: 'fail' }, { status: 404 }));
};

const mockResponseOK = (body: any, params: any) => {
  const result: Response = new Response(JSON.stringify(body), params);
  return result;
};

describe('Sinon might help here', () => {
  let stub: any;
  beforeEach(() => {
    stub = sinon.stub(global, 'fetch');
    stub.callsFake(makeReply);
  });

  afterEach(() => {
    stub.restore();
  });

  it('should return 200', async () => {
    let result = await fetch('/');
    let payload = await result.json();
    expect(result.status).to.equal(200);
    expect(payload).to.have.property('color', 'red');
  });

  it('should return 500', async () => {
    let result = await fetch('http://some.url');
    let payload = await result.json();
    expect(result.status).to.equal(500);
    expect(payload).to.have.property('mood', 'failure');
  });

  it('should return 404', async () => {
    let result = await fetch('something');
    let payload = await result.json();
    expect(result.status).to.equal(404);
    expect(payload).to.have.property('status', 'fail');
  });
});

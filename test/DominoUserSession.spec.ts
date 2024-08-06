/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import DominoConnector from '../src/DominoConnector.js';
import {
  CredentialType,
  DominoAccess,
  DominoApiMeta,
  DominoRequestOptions,
  DominoRequestResponse,
  DominoRestAccess,
  DominoUserSession,
  HttpResponseError,
  NoResponseBody,
} from '../src/index.js';

const fakeCredentials = {
  baseUrl: 'somewhere',
  credentials: {
    scope: '',
    type: CredentialType.BASIC,
    username: 'fakeUsername',
    password: 'fakePassword',
  },
};

describe('DominoUserSession', async () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoConnector;
  let dus: DominoUserSession;
  let baseParameters: Array<any> = [];
  let additionalParameters: Array<any> = [];
  let stub: sinon.SinonStub<any, Promise<any>>;

  beforeEach(async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));

    dc = await DominoConnector.getConnector('http://localhost:8880', {} as DominoApiMeta);
    dus = new DominoUserSession(fakeToken, dc);
    baseParameters = [];
    additionalParameters = [];

    fetchStub.restore();
  });

  afterEach(() => {
    if (stub) {
      expect(stub.callCount).to.be.equal(1);
      expect(stub.getCall(0).args).to.deep.equal([...baseParameters, ...additionalParameters]);
      stub.restore();
    }
  });

  describe('request', () => {
    it('should get called', async () => {
      const dcRequestStub = sinon.stub(dc, 'request');
      dcRequestStub.resolves({ status: 0, headers: new Headers(), dataStream: new ReadableStream(), expect: 'json' });

      const response = await dus.request('operation', { params: new Map() });
      expect(dcRequestStub.calledOnce).to.be.true;
      expect(response).to.exist;
      expect(dcRequestStub.getCall(0).args).to.deep.equal([dus.dominoAccess, 'operation', { params: new Map() }]);

      dcRequestStub.restore();
    });
  });

  describe('requestJsonStream', () => {
    let expected: number;
    const subscriber = () => {
      let actual = 0;

      return new WritableStream({
        write(_chonk) {
          // WE ignore chonk
          actual++;
        },
        close() {
          expect(actual).to.equal(expected);
        },
      });
    };

    let dcRequestStub: sinon.SinonStub<
      [dominoAccess: DominoRestAccess, operationId: string, options: DominoRequestOptions],
      Promise<DominoRequestResponse>
    >;

    beforeEach(async () => {
      dcRequestStub = sinon.stub(dc, 'request');
    });

    afterEach(() => {
      dcRequestStub.restore();
    });

    it('should pass handling of response to the subscriber', async () => {
      const jsonString = `[\n{ "color": "red" },\n{ "color": "yellow" },\n{ "color": "green" }\n]`;
      const dataStream = new Response(jsonString).body;
      dcRequestStub.resolves({ status: 0, headers: new Headers(), dataStream, expect: 'json' });
      expected = 3;

      await dus.requestJsonStream('operation', { params: new Map() }, subscriber);
      expect(dcRequestStub.calledOnce).to.be.true;
      expect(dcRequestStub.getCall(0).args).to.deep.equal([dus.dominoAccess, 'operation', { params: new Map() }]);
    });

    it(`should throw 'NoResponseBody' if response data stream is 'null'`, async () => {
      dcRequestStub.resolves({ status: 0, headers: new Headers(), dataStream: null, expect: 'json' });

      await expect(dus.requestJsonStream('operation', { params: new Map() }, subscriber)).to.be.rejectedWith(NoResponseBody);
    });

    it(`should throw 'HttpResponseError' if response has error status code`, async () => {
      const errorResponse = {
        status: 404,
        message: 'The list Customers is not configured for this database',
        errorId: 0,
      };
      const dataStream = new Response(JSON.stringify(errorResponse), { status: 404, statusText: 'Not Found' }).body;
      dcRequestStub.resolves({ status: 404, headers: new Headers(), dataStream, expect: 'json' });

      await expect(dus.requestJsonStream('operation', { params: new Map() }, subscriber)).to.be.rejectedWith(HttpResponseError);
    });
  });
});

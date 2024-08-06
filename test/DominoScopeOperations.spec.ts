/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import DominoConnector from '../src/DominoConnector.js';
import DominoScope from '../src/DominoScope.js';
import DominoScopeOperations from '../src/DominoScopeOperations.js';
import {
  CredentialType,
  DominoAccess,
  DominoApiMeta,
  DominoRequestOptions,
  DominoRequestResponse,
  DominoRestAccess,
  DominoRestConnector,
  DominoRestScope,
  EmptyParamError,
  HttpResponseError,
  NoResponseBody,
} from '../src/index.js';
import { transformToRequestResponse } from './helpers/transformToRequestResponse.js';

describe('DominoScopeOperations', async () => {
  const scp = JSON.parse(fs.readFileSync('./test/resources/DominoScope/scpJson.json', 'utf-8'));
  const scpResponse = JSON.parse(fs.readFileSync('./test/resources/DominoScope/scp_response.json', 'utf-8'));
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const fakeCredentials = {
    baseUrl: 'somewhere',
    credentials: {
      scope: '',
      type: CredentialType.BASIC,
      username: 'fakeUsername',
      password: 'fakePassword',
    },
  };
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoRestConnector;
  let operationId: string;
  let expectedParams: Map<string, any>;
  let expectedOptions: DominoRequestOptions;
  let dcRequestStub: sinon.SinonStub<
    [dominoAccess: DominoRestAccess, operationId: string, options: DominoRequestOptions],
    Promise<DominoRequestResponse>
  >;

  beforeEach(async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().resolves(new Response(JSON.stringify(baseApi)));

    dc = await DominoConnector.getConnector('http://localhost:8880', {} as DominoApiMeta);
    dcRequestStub = sinon.stub(dc, 'request');
    expectedParams = new Map();
    expectedOptions = { params: expectedParams };

    fetchStub.restore();
  });

  afterEach(() => {
    if (dcRequestStub.called) {
      expect(dcRequestStub.callCount).equal(1);
      expect(dcRequestStub.getCall(0).args[0]).to.deep.equal(fakeToken);
      expect(dcRequestStub.getCall(0).args[1]).to.be.equal(operationId);
      expect(dcRequestStub.getCall(0).args[2]).to.deep.equal(expectedOptions);
    }
    dcRequestStub.restore();
  });

  describe('getScope', () => {
    beforeEach(() => {
      operationId = 'getScopeMapping';
      dcRequestStub.resolves(transformToRequestResponse(scpResponse));
    });

    it('should be able to execute operation', async () => {
      expectedParams.set('scopeName', 'demoapi');

      const response = await DominoScopeOperations.getScope('demoapi', fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });

    it(`should throw an error if 'scopeName' is empty`, async () => {
      await expect(DominoScopeOperations.getScope('', fakeToken, dc)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('scopeName', 'demoapi');

      await expect(DominoScopeOperations.getScope('demoapi', fakeToken, dc)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('getScopes', () => {
    beforeEach(() => {
      operationId = 'fetchScopeMappings';
      dcRequestStub.resolves(transformToRequestResponse([scpResponse, scpResponse, scpResponse]));
    });

    it('should be able to execute operation', async () => {
      const response = await DominoScopeOperations.getScopes(fakeToken, dc);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoScope).to.be.true;
      }
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoScopeOperations.getScopes(fakeToken, dc)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('deleteScope', () => {
    beforeEach(() => {
      operationId = 'deleteScopeMapping';
      dcRequestStub.resolves(transformToRequestResponse(scpResponse));
    });

    it('should be able to execute operation', async () => {
      expectedParams.set('scopeName', 'demoapi');

      const response = await DominoScopeOperations.deleteScope('demoapi', fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });

    it(`should throw an error if 'scopeName' is empty`, async () => {
      await expect(DominoScopeOperations.deleteScope('', fakeToken, dc)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('scopeName', 'demoapi');

      await expect(DominoScopeOperations.deleteScope('demoapi', fakeToken, dc)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('createUpdateScope', () => {
    let scope: DominoRestScope;

    beforeEach(() => {
      operationId = 'createUpdateScopeMapping';
      dcRequestStub.resolves(transformToRequestResponse(scpResponse));
      scope = new DominoScope(scp);
      expectedOptions.body = JSON.stringify(scope.toScopeJson());
    });

    it('should be able to execute operation', async () => {
      const response = await DominoScopeOperations.createUpdateScope(scope, fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });

    it(`should be able to execute operation when given scope is not wrapped around 'DominoScope'`, async () => {
      const response = await DominoScopeOperations.createUpdateScope(scp, fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });

    it(`should throw an error if 'scope' is empty`, async () => {
      await expect(DominoScopeOperations.createUpdateScope(undefined as unknown as DominoScope, fakeToken, dc)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoScopeOperations.createUpdateScope(scope, fakeToken, dc)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('Operation execution', () => {
    beforeEach(() => {
      operationId = 'deleteScopeMapping';
    });

    it(`should throw 'NoResponseBody' if response has null stream`, async () => {
      dcRequestStub.resolves(transformToRequestResponse(null));
      expectedParams.set('scopeName', 'demoapi');

      await expect(DominoScopeOperations.deleteScope('demoapi', fakeToken, dc)).to.be.rejectedWith(NoResponseBody);
    });

    it(`should throw 'HttpResponseError' if response has error status`, async () => {
      dcRequestStub.resolves(transformToRequestResponse({ message: 'Error' }, 400));
      expectedParams.set('scopeName', 'demoapi');

      await expect(DominoScopeOperations.deleteScope('demoapi', fakeToken, dc)).to.be.rejectedWith(HttpResponseError);
    });
  });
});

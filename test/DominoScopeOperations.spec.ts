/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import { CredentialType, DominoAccess, DominoApiMeta, DominoRequestOptions } from '../src';
import DominoConnector from '../src/DominoConnector';
import DominoScope from '../src/DominoScope';
import DominoScopeOperations from '../src/DominoScopeOperations';
import scp from './resources/DominoScope/scpJson.json';
import scpResponse from './resources/DominoScope/scp_response.json';

const fakeCredentials = {
  baseUrl: 'somewhere',
  credentials: {
    scope: '',
    type: CredentialType.BASIC,
    username: 'fakeUsername',
    password: 'fakePassword',
  },
};

describe('DominoScopeOperations', async () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoConnector;
  let operationId: string;
  let expectedParams: Map<string, any>;
  let expectedOptions: DominoRequestOptions;
  let dcRequestStub: sinon.SinonStub<[dominoAccess: DominoAccess, operationId: string, options: DominoRequestOptions], Promise<any>>;

  beforeEach(async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));

    dc = await DominoConnector.getConnector('http://localhost:8880', {} as DominoApiMeta);
    dcRequestStub = sinon.stub(dc, 'request');
    expectedParams = new Map();
    expectedOptions = {
      params: expectedParams,
    };

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
      dcRequestStub.resolves(scpResponse);
    });

    it('should throw an error if given scopeName is empty', async () => {
      await expect(DominoScopeOperations.getScope('', fakeToken, dc)).to.be.rejectedWith('scopeName must not be empty.');
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('scopeName', 'demoapi');

      const response = await DominoScopeOperations.getScope('demoapi', fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });
  });

  describe('getScopes', () => {
    beforeEach(() => {
      operationId = 'fetchScopeMappings';
      dcRequestStub.resolves([scpResponse, scpResponse, scpResponse]);
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoScopeOperations.getScopes(fakeToken, dc);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoScope).to.be.true;
      }
    });
  });

  describe('deleteScope', () => {
    beforeEach(() => {
      operationId = 'deleteScopeMapping';
      dcRequestStub.resolves(scpResponse);
    });

    it('should throw an error if given scopeName is empty', async () => {
      await expect(DominoScopeOperations.deleteScope('', fakeToken, dc)).to.be.rejectedWith('scopeName must not be empty.');
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('scopeName', 'demoapi');

      const response = await DominoScopeOperations.deleteScope('demoapi', fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });
  });

  describe('createUpdateScope', () => {
    let scope: DominoScope;

    beforeEach(() => {
      operationId = 'createUpdateScopeMapping';
      dcRequestStub.resolves(scpResponse);
      scope = new DominoScope(scp);
      expectedOptions.body = JSON.stringify(scope.toScopeJson());
    });

    it('should be able to give correct response and params to request when given scp is JSON', async () => {
      const response = await DominoScopeOperations.createUpdateScope(scp, fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });

    it('should be able to give correct response and params to request when given scp is DominoScope', async () => {
      const response = await DominoScopeOperations.createUpdateScope(scope, fakeToken, dc);
      expect(response).to.exist;
      expect(response instanceof DominoScope).to.be.true;
    });
  });
});

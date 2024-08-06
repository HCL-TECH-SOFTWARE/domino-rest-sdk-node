/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect, use } from 'chai';
import { chaiAsPromised } from 'chai-promised';
import fs from 'fs';
import sinon from 'sinon';
import DominoConnector, { DominoRestOperation } from '../src/DominoConnector.js';
import { CredentialType, DominoAccess, DominoServer, HttpResponseError, MissingParamError, OperationNotAvailable } from '../src/index.js';

use(chaiAsPromised);

describe('DominoConnector', () => {
  const sampleUrl = 'http://localhost:8880';
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));
  const createDocResponse = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/doc_response.json', 'utf-8'));
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

  let fetchStub: sinon.SinonStub<[input: string | URL | Request, init?: RequestInit | undefined], Promise<Response>>;
  let accessTokenStub: sinon.SinonStub<[callback?: (() => Promise<any>) | undefined], Promise<string>>;
  let baseConnector: DominoConnector;

  beforeEach(async () => {
    fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().resolves(new Response(JSON.stringify(apiDefinitions)));
    fetchStub.onSecondCall().resolves(new Response(JSON.stringify(baseApi)));
    const server = await DominoServer.getServer(sampleUrl);
    baseConnector = await server.getDominoConnector('basis');

    accessTokenStub = sinon.stub(fakeToken, 'accessToken');
    accessTokenStub.resolves('THE TOKEN');
  });

  afterEach(() => {
    fetchStub.restore();
    accessTokenStub.restore();
  });

  describe('getConnector', () => {
    beforeEach(() => {
      fetchStub.restore();
      fetchStub = sinon.stub(global, 'fetch');
      fetchStub.resolves(new Response(JSON.stringify(baseApi)));
    });

    it(`should load API then return a 'DominoConnector' object`, async () => {
      const basis = apiDefinitions.basis;
      const dominoConnector = await DominoConnector.getConnector(sampleUrl, basis);
      expect(fetchStub.getCall(0).args[0]).to.be.equal(`${sampleUrl}${basis.mountPath}${basis.fileName}`);
      expect(dominoConnector).to.be.instanceOf(DominoConnector);
      expect(dominoConnector.baseUrl).to.equal(sampleUrl);
      expect(dominoConnector.meta).to.deep.equal(basis);
    });

    it(`should throw 'HttpResponseError' if response has error status code`, async () => {
      const errResponse = {
        status: 404,
        message: 'This is not the URL you seek!',
        errorId: 0,
      };
      fetchStub.resolves(new Response(JSON.stringify(errResponse), { status: 404 }));

      await expect(DominoConnector.getConnector(sampleUrl, apiDefinitions.basis)).to.be.rejectedWith(HttpResponseError);
    });

    it('should throw an error if encountered fetch error', async () => {
      fetchStub.rejects(new Error('Fetch error.'));

      await expect(DominoConnector.getConnector(sampleUrl, apiDefinitions.basis)).to.be.rejectedWith('Fetch error.');
    });
  });

  describe('getUrl', () => {
    it('should return the correct URL for an operation', () => {
      const operation = baseConnector.getOperation('getOdataItem');
      const params: Map<string, string> = new Map();
      params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
      params.set('name', 'customer');
      params.set('$select', 'name,age,hobbies');
      const resultUrl = baseConnector.getUrl(operation, 'demo', params);
      expect(resultUrl).to.be.equal(
        'http://localhost:8880/api/v1/odata/demo/customer/ABCD1234567890BCABCD1234567890BC?%24select=name%2Cage%2Chobbies',
      );
    });

    it('should fail on missing mandatory parameter', () => {
      const operation = baseConnector.getOperation('getOdataItem');
      const params: Map<string, string> = new Map();
      params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
      params.set('name', 'customer');
      expect(() => baseConnector.getUrl(operation, '', params)).to.throw(MissingParamError);
    });
  });

  describe('request', () => {
    beforeEach(() => {
      fetchStub.restore();
      fetchStub = sinon.stub(global, 'fetch');
      fetchStub.resolves(new Response(JSON.stringify(createDocResponse)));
    });

    it('should successfully return a response', async () => {
      const params = new Map();
      params.set('dataSource', 'scope');
      const options = { params };
      const response = await baseConnector.request(fakeToken, 'createDocument', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
    });

    it('should successfully return a response with expect value to be json', async () => {
      const options = {
        dataSource: 'scope',
        params: new Map(),
      };
      const responseRes = new Response(JSON.stringify(createDocResponse));
      responseRes.headers.set('content-type', 'application/json');
      fetchStub.resolves(responseRes);
      const response = await baseConnector.request(fakeToken, 'createDocument', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
      expect(response.expect).to.equal('json');
    });

    it('should successfully return a response with expect value to be chunked', async () => {
      const options = {
        dataSource: 'scope',
        params: new Map(),
      };
      options.params.set('name', 'customers');
      const responseRes = new Response(JSON.stringify(createDocResponse));
      responseRes.headers.set('content-type', 'application/json');
      responseRes.headers.set('transfer-encoding', 'chunked');
      fetchStub.resolves(responseRes);
      const response = await baseConnector.request(fakeToken, 'fetchViewEntries', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
      expect(response.expect).to.equal('chunked');
    });

    it('should successfully return a response with expect value to be binary', async () => {
      const options = {
        dataSource: 'scope',
        params: new Map(),
      };
      options.params.set('name', 'customers');
      const responseRes = new Response(JSON.stringify(createDocResponse));
      responseRes.headers.set('content-type', 'multipart/form-data');
      fetchStub.resolves(responseRes);
      const response = await baseConnector.request(fakeToken, 'fetchViewEntries', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
      expect(response.expect).to.equal('binary');
    });

    it('should successfully return a response with expect value to be binary if content-type is null', async () => {
      const options = {
        dataSource: 'scope',
        params: new Map(),
      };
      options.params.set('name', 'customers');
      const responseRes = new Response(JSON.stringify(createDocResponse));
      responseRes.headers.delete('content-type');
      fetchStub.resolves(responseRes);
      const response = await baseConnector.request(fakeToken, 'fetchViewEntries', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
      expect(response.expect).to.equal('binary');
    });

    it('should successfully return a response with expect value to be binary if content-type is text/plain', async () => {
      const options = {
        dataSource: 'scope',
        params: new Map(),
      };
      options.params.set('name', 'customers');
      const responseRes = new Response(JSON.stringify(createDocResponse));
      responseRes.headers.set('content-type', 'text/plain');
      fetchStub.resolves(responseRes);
      const response = await baseConnector.request(fakeToken, 'fetchViewEntries', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
      expect(response.expect).to.equal('text');
    });

    it('should successfully return a response with expect value to be json if status is not in 200 - 300', async () => {
      const options = {
        dataSource: 'scope',
        params: new Map(),
      };
      const errResponse = {
        status: 404,
        message: 'This is not the URL you seek!',
        errorId: 0,
      };
      options.params.set('name', 'customers');
      const responseRes = new Response(JSON.stringify(errResponse), { status: 404 });
      responseRes.headers.set('content-type', 'application/json');
      fetchStub.resolves(responseRes);
      const response = await baseConnector.request(fakeToken, 'createDocument', options);
      expect(response.expect).to.equal('json');
    });

    it(`should successfully return a response with 'dataSource' in request options`, async () => {
      const options = {
        dataSource: 'scope',
        params: new Map(),
      };
      const response = await baseConnector.request(fakeToken, 'createDocument', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
    });

    it('should successfully return a response on operations that only has path parameters', async () => {
      const params = new Map();
      // These are path parameters
      params.set('dataSource', 'dataSource');
      params.set('unid', 'unid');
      params.set('name', 'name');
      const options = { params };
      const response = await baseConnector.request(fakeToken, 'getOdataItem', options);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
    });

    it('should successfully return a response on operations that has header parameters', async () => {
      const expectedHeader = { requiredHeader: 'hello', Authorization: 'Bearer THE TOKEN' };

      const params = new Map();
      params.set('dataSource', 'scope');
      params.set('requiredHeader', 'hello');
      const options = { params };
      const response = await baseConnector.request(fakeToken, 'createDocumentGet', options);
      expect(fetchStub.getCall(0).args[1]?.headers).to.deep.equal(expectedHeader);
      expect(response).to.haveOwnProperty('status');
      expect(response).to.haveOwnProperty('headers');
      expect(response).to.haveOwnProperty('dataStream');
      expect(response).to.haveOwnProperty('expect');
    });

    it('should throw an error when fetch fails', async () => {
      fetchStub.rejects(new Error('Fetch error.'));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options = { params };
      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.rejectedWith('Fetch error.');
    });

    it('should throw an error when fetch fails', async () => {
      fetchStub.rejects(new Error('Fetch error.'));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options = { params };
      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.rejectedWith('Fetch error.');
    });
  });

  describe('getOperation', () => {
    it('should return the operation if it exists', () => {
      const operation = baseConnector.getOperation('createDocument');
      expect(operation).to.exist;
    });

    it(`should throw 'OperationNotAvailable' if operation cannot be found`, () => {
      expect(() => baseConnector.getOperation('tangoAtMidnight')).to.throw(OperationNotAvailable);
    });
  });

  describe('getOperations', () => {
    it('should return all of the operations', () => {
      const result = baseConnector.getOperations();
      expect(result).not.null;
      expect(result.size).to.equal(71);
      const result2 = baseConnector.getOperations();
      expect(result).to.deep.equal(result2);
    });
  });

  describe('getFetchOptions', () => {
    let operation: DominoRestOperation;
    let request: any;

    beforeEach(async () => {
      operation = await baseConnector.getOperation('createDocumentAttachment');
      request = {
        dataSource: 'dataSource',
        params: new Map(),
        body: { stuff: 'stuff' },
      };
      request.params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
    });

    it('should return correct options for fetch', async () => {
      const result = await baseConnector.getFetchOptions(fakeToken, operation, request);
      expect(result).to.have.property('headers');
      expect(result.headers).to.have.property('Content-Type', 'multipart/form-data');
      expect(result.headers).to.have.property('Authorization', 'Bearer THE TOKEN');
      expect(result.body).to.equal(JSON.stringify(request.body));
    });

    it('should return correct options for fetch with body as string', async () => {
      request.body = 'stuff';
      const result = await baseConnector.getFetchOptions(fakeToken, operation, request);
      expect(result).to.have.property('headers');
      expect(result.headers).to.have.property('Content-Type', 'multipart/form-data');
      expect(result.headers).to.have.property('Authorization', 'Bearer THE TOKEN');
      expect(result.body).to.equal(request.body);
    });

    it('should return correct options for fetch with additional headers', async () => {
      operation = await baseConnector.getOperation('createDocumentGet');
      request.params.set('requiredHeader', 'this should show');
      const result = await baseConnector.getFetchOptions(fakeToken, operation, request);
      expect(result).to.have.property('headers');
      expect(result.headers).to.have.property('Authorization', 'Bearer THE TOKEN');
      expect(result.headers).to.have.property('requiredHeader', 'this should show');
      expect(result.body).to.equal(JSON.stringify(request.body));
    });

    it('should return an error if a required header is missing', async () => {
      operation = await baseConnector.getOperation('createDocumentGet');
      await expect(baseConnector.getFetchOptions(fakeToken, operation, request)).to.be.rejectedWith(MissingParamError);
    });

    it('should return an error if a required header is missing', async () => {
      accessTokenStub.rejects(new Error('Access token error.'));

      await expect(baseConnector.getFetchOptions(fakeToken, operation, request)).to.be.rejectedWith('Access token error.');
    });
  });
});

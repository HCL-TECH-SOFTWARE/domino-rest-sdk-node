/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import sinon from 'sinon';
import { CredentialType, DominoAccess, DominoRequestOptions, DominoServer, MissingParamError } from '../src';
import DominoConnector from '../src/DominoConnector';
import createDocResponse from './resources/DominoDocumentOperations/doc_response.json';

chai.use(chaiAsPromised);

describe('DominoConnector', () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));
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

  let fetchStub: sinon.SinonStub<[input: RequestInfo | URL, init?: RequestInit | undefined], Promise<Response>>;
  let accessTokenStub: sinon.SinonStub<[], Promise<string>>;
  let baseConnector: DominoConnector;

  beforeEach(async () => {
    fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().resolves(new Response(JSON.stringify(apiDefinitions)));
    fetchStub.onSecondCall().resolves(new Response(JSON.stringify(baseApi)));
    const server = await DominoServer.getServer('http://localhost:8880');
    baseConnector = await server.getDominoConnector('basis');

    accessTokenStub = sinon.stub(fakeToken, 'accessToken');
    accessTokenStub.resolves('THE TOKEN');
  });

  afterEach(() => {
    fetchStub.restore();
    accessTokenStub.restore();
  });

  describe('getConnector', () => {
    it('should produce a DominoConnector class', async () => {
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify(baseApi))));
      const connector = await DominoConnector.getConnector('http://localhost:8880', apiDefinitions.basis);
      expect(connector instanceof DominoConnector).to.true;
    });

    it('should reject when error is encountered', async () => {
      fetchStub.rejects('Error');
      await expect(DominoConnector.getConnector('http://localhost:8880', apiDefinitions.basis)).to.be.rejected;
    });
  });

  describe('request', () => {
    beforeEach(() => {
      fetchStub.restore();
      fetchStub = sinon.stub(global, 'fetch');
      fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(createDocResponse))));
    });

    it('should be successful when all are valid', async () => {
      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.not.be.rejected;
    });

    it('should be successful even if dataSource is in options', async () => {
      const options: DominoRequestOptions = {
        dataSource: 'scope',
        params: new Map(),
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.not.be.rejected;
    });

    it('should be successful even if schema already has value', async () => {
      const options: DominoRequestOptions = {
        dataSource: 'scope',
        params: new Map(),
      };

      await baseConnector.getOperation('createDocument');
      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.not.be.rejected;
    });

    it('should be successful when API has no parameters for query needed', async () => {
      const params = new Map();
      // These are path parameters
      params.set('dataSource', 'dataSource');
      params.set('unid', 'unid');
      params.set('name', 'name');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'getOdataItem', options)).to.not.be.rejected;
    });

    it('should properly set headers when header is needed in request', async () => {
      // fetchStub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(createDocResponse))));

      const params = new Map();
      params.set('dataSource', 'scope');
      params.set('requiredHeader', 'hello');
      const options: DominoRequestOptions = { params };

      await expect(baseConnector.request(fakeToken, 'createDocumentGet', options)).to.not.be.rejected;
      const expectedHeader = { requiredHeader: 'hello', Authorization: 'Bearer THE TOKEN' };
      expect(fetchStub.getCall(0).args[1]?.headers).to.deep.equal(expectedHeader);
    });

    it('should be resolved with nothing when response is okay and has no content', async () => {
      const errResponse = new Response();
      fetchStub.onFirstCall().returns(Promise.resolve(errResponse));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.fulfilled;
    });

    it('should be rejected with response body as json when response is not okay and has json content', async () => {
      const errorJson = { message: 'Error in json' };
      const headers = {
        'content-type': 'application/json',
      };
      const errResponse = new Response(JSON.stringify(errorJson), { status: 404, statusText: 'Error encountered :(', headers });
      fetchStub.onFirstCall().returns(Promise.resolve(errResponse));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await baseConnector.request(fakeToken, 'createDocument', options).catch((err) => {
        expect(err).to.deep.equal(errorJson);
      });
    });

    it('should be rejected when fetch options found a required header that is not given in request option params', async () => {
      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocumentGet', options)).to.be.rejectedWith(
        MissingParamError,
        `Parameter 'requiredHeader' is required.`,
      );
    });
  });

  describe('getOperations', () => {
    it('should return all of the operations on the connector', async () => {
      const result = await baseConnector.getOperations();
      expect(result).not.null;
      expect(result.size).to.equal(58);
      const result2 = await baseConnector.getOperations();
      expect(result).to.deep.equal(result2);
    });
  });

  it('should return the createDocument method', async () => {
    const operation = await baseConnector.getOperation('createDocument');
    expect(operation).to.exist;
    expect(fetchStub.args.length).to.equal(2);
  });

  it('should not have a method tangoAtMidnight', () => {
    expect(() => baseConnector.getOperation('tangoAtMidnight')).to.throw(`Operation ID 'tangoAtMidnight' is not available`);
  });

  it('should return the correct URL for the getOdataItem method', async () => {
    const operation = await baseConnector.getOperation('getOdataItem');
    const params: Map<string, string> = new Map();
    params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
    params.set('name', 'customer');
    params.set('$select', 'name,age,hobbies');

    const resultUrl = await baseConnector.getUrl(operation, 'demo', params);
    expect(resultUrl).to.be.equal('http://localhost:8880/api/v1/odata/demo/customer/ABCD1234567890BCABCD1234567890BC?%24select=name%2Cage%2Chobbies');
  });

  it('should fail on missing dataSource', async () => {
    const operation = await baseConnector.getOperation('getOdataItem');
    const params: Map<string, string> = new Map();
    params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
    params.set('name', 'customer');
    return expect(() => baseConnector.getUrl(operation, '', params)).to.throw(MissingParamError, `Parameter \'dataSource\' is required.`);
  });

  it('should return correct FetchOptions', async () => {
    const operation = await baseConnector.getOperation('createDocumentAttachment');
    const params: Map<string, string> = new Map();
    const request: DominoRequestOptions = {
      dataSource: 'dataSource',
      params: params,
      body: 'Stuff in the body',
    };
    params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
    const result = await baseConnector.getFetchOptions(fakeToken, operation, request);
    expect(result).to.have.property('headers');
    expect(result.headers).to.have.property('Content-Type', 'multipart/form-data');
    expect(result.headers).to.have.property('Authorization', 'Bearer THE TOKEN');
  });
});

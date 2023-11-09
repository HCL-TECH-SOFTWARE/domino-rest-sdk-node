/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import sinon from 'sinon';
import { CredentialType, DominoAccess, DominoRequestOptions, DominoServer } from '../src';
import DominoConnector from '../src/DominoConnector';
import createDocResponse from './resources/DominoDocumentOperations/doc_response.json';

chai.use(chaiAsPromised);

const fakeCredentials = {
  baseUrl: 'somewhere',
  credentials: {
    scope: '',
    type: CredentialType.BASIC,
    userName: 'fakeUsername',
    passWord: 'fakePassword',
  },
};
const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
const apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));

describe('The DominoConnector is the interface to one API', () => {
  let fetchStub: sinon.SinonStub<[input: RequestInfo | URL, init?: RequestInit | undefined], Promise<Response>>;
  let accessTokenStub: sinon.SinonStub<[], Promise<string>>;
  let baseConnector: DominoConnector;
  const fakeToken = new DominoAccess(fakeCredentials);

  beforeEach(async () => {
    fetchStub = sinon.stub(global, 'fetch');
    fetchStub
      .onFirstCall()
      .returns(Promise.resolve(new Response(JSON.stringify(apiDefinitions))))
      .returns(Promise.resolve(new Response(JSON.stringify(baseApi))));
    let server = new DominoServer('http://localhost:8880');
    baseConnector = await server.getDominoConnector('basis');

    accessTokenStub = sinon.stub(fakeToken, 'accessToken');
    accessTokenStub.resolves('THE TOKEN');
  });

  afterEach(() => {
    fetchStub.restore();
    accessTokenStub.restore();
  });

  describe('_apiLoader', () => {
    it('should throw an error if something fails', () => {
      fetchStub.rejects('Error message');
      return expect(baseConnector.getOperation('createDocument')).to.eventually.rejectedWith('Error message');
    });

    it('should throw an error if something fails', () => {
      fetchStub.rejects('Error message');
      return expect(baseConnector.getOperations()).to.eventually.rejectedWith('Error message');
    });
  });

  describe('request', () => {
    beforeEach(() => {
      fetchStub.restore();
      fetchStub = sinon.stub(global, 'fetch');
      fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));
    });

    it('should be successful when all are valid', async () => {
      fetchStub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(createDocResponse))));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.not.be.rejected;
    });

    it('should be successful even if dataSource is in options', async () => {
      fetchStub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(createDocResponse))));

      const options: DominoRequestOptions = {
        dataSource: 'scope',
        params: new Map(),
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.not.be.rejected;
    });

    it('should be successful even if schema already has value', async () => {
      fetchStub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(createDocResponse))));

      const options: DominoRequestOptions = {
        dataSource: 'scope',
        params: new Map(),
      };

      await baseConnector.getOperation('createDocument');
      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.not.be.rejected;
    });

    it('should be successful when API has no parameters for query needed', async () => {
      fetchStub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(createDocResponse))));

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
      fetchStub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(createDocResponse))));

      const params = new Map();
      params.set('dataSource', 'scope');
      params.set('requiredHeader', 'hello');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocumentGet', options)).to.be.not.be.rejected;
      const expectedHeader = { requiredHeader: 'hello', Authorization: 'Bearer THE TOKEN' };
      expect(fetchStub.getCall(1).args[1]?.headers).to.deep.equal(expectedHeader);
    });

    it('should be resolved with nothing when response is okay and has no content', async () => {
      const errResponse = new Response();
      fetchStub.onSecondCall().returns(Promise.resolve(errResponse));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.fulfilled;
    });

    it('should be rejected with response status text when response is not okay and has no content', async () => {
      const errResponse = new Response(null, { status: 404, statusText: 'Error encountered :(' });
      fetchStub.onSecondCall().returns(Promise.resolve(errResponse));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.rejectedWith('Error encountered :(');
    });

    it('should be rejected with response body as text when response is not okay and has text content', async () => {
      const headers = {
        'content-type': 'application/text',
      };
      const errResponse = new Response('Error', { status: 404, statusText: 'Error encountered :(', headers });
      fetchStub.onSecondCall().returns(Promise.resolve(errResponse));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.rejectedWith('Error');
    });

    it('should be rejected with response body as json when response is not okay and has json content', async () => {
      const errorJson = { message: 'Error in json' };
      const headers = {
        'content-type': 'application/json',
      };
      const errResponse = new Response(JSON.stringify(errorJson), { status: 404, statusText: 'Error encountered :(', headers });
      fetchStub.onSecondCall().returns(Promise.resolve(errResponse));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await baseConnector.request(fakeToken, 'createDocument', options).catch((err) => {
        expect(err).to.deep.equal(errorJson);
      });
    });

    it('should be resolved when response is okay and has callback', async () => {
      const stream = `[\n{"msg":"hello"},\n{"msg":"hi!"}\n]\n`;
      const headers = {
        'content-type': 'application/json',
      };
      const response = new Response(stream, { status: 200, statusText: 'Success!', headers });
      fetchStub.onSecondCall().returns(Promise.resolve(response));

      const expectedChunks = [{ msg: 'hello' }, { msg: 'hi!' }];
      const subscriber = () => {
        let chunkCount = 0;
        return new WritableStream({
          write(chunk) {
            expect(chunk).to.deep.equal(expectedChunks[chunkCount++]);
          },
        });
      };

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
        subscriber,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.fulfilled;
    });

    it('should be resolved even if stream is incomplete when response is okay and has callback', async () => {
      const stream = `[\n{"msg":"hello"},\n{"msg":"hi!"},\n{"msg":"`;
      const headers = {
        'content-type': 'application/json',
      };
      const response = new Response(stream, { status: 200, statusText: 'Success!', headers });
      fetchStub.onSecondCall().returns(Promise.resolve(response));

      const expectedChunks = [{ msg: 'hello' }, { msg: 'hi!' }];
      const subscriber = () => {
        let chunkCount = 0;
        return new WritableStream({
          write(chunk) {
            console.log(chunk);
            console.log(expectedChunks[chunkCount]);
            expect(chunk).to.deep.equal(expectedChunks[chunkCount++]);
          },
        });
      };

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
        subscriber,
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.fulfilled;
    });

    it('should be rejected when response is okay and has callback but response body is null', async () => {
      const headers = {
        'content-type': 'application/json',
      };
      const response = new Response(null, { status: 200, statusText: 'Success!', headers });
      fetchStub.onSecondCall().returns(Promise.resolve(response));

      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
        subscriber: () => new WritableStream(),
      };

      await expect(baseConnector.request(fakeToken, 'createDocument', options)).to.be.rejectedWith('Response body is null.');
    });

    it('should be rejected when DominoAccess fails to get accessToken', async () => {
      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      const failingAccess = fakeToken;
      failingAccess.accessToken = () => Promise.reject(new Error('Oh no! I failed.'));
      await expect(baseConnector.request(failingAccess, 'createDocument', options)).to.be.rejectedWith('Oh no! I failed.');
    });

    it('should be rejected when fetch options found a required header that is not given in request option params', async () => {
      const params = new Map();
      params.set('dataSource', 'scope');
      const options: DominoRequestOptions = {
        params,
      };

      await expect(baseConnector.request(fakeToken, 'createDocumentGet', options)).to.be.rejectedWith('Parameter requiredHeader is mandatory!');
    });
  });

  it('should return the createDocument method', async () => {
    let operation = await baseConnector.getOperation('createDocument');
    expect(operation).to.exist;
    expect(fetchStub.args.length).to.equal(2);
  });

  it('should not have a method tangoAtMidnight', (done) => {
    let operation = baseConnector.getOperation('tangoAtMidnight');
    expect(operation).to.eventually.be.rejectedWith('OperationId tangoAtMidnight is not available').notify(done);
  });

  it('should return the correct URL for the getOdataItem method', async () => {
    let operation = await baseConnector.getOperation('getOdataItem');
    let params: Map<string, string> = new Map();
    params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
    params.set('name', 'customer');
    params.set('$select', 'name,age,hobbies');

    let resultUrl = await baseConnector.getUrl(operation, 'demo', params);
    expect(resultUrl).to.be.equal('http://localhost:8880/api/v1/odata/demo/customer/ABCD1234567890BCABCD1234567890BC?%24select=name%2Cage%2Chobbies');
  });

  it('should fail on missing dataSource', async () => {
    let operation = await baseConnector.getOperation('getOdataItem');
    let params: Map<string, string> = new Map();
    params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
    params.set('name', 'customer');
    let resultUrl = baseConnector.getUrl(operation, '', params);
    return expect(resultUrl).to.eventually.rejectedWith('Parameter dataSource is mandatory!');
  });

  it('should return correct FetchOptions', async () => {
    let operation = await baseConnector.getOperation('createDocumentAttachment');
    let params: Map<string, string> = new Map();
    let request: DominoRequestOptions = {
      dataSource: 'dataSource',
      params: params,
      body: 'Stuff in the body',
    };
    params.set('unid', 'ABCD1234567890BCABCD1234567890BC');
    let result = await baseConnector.getFetchOptions(fakeToken, operation, request);
    expect(result).to.have.property('headers');
    expect(result.headers).to.have.property('Content-Type', 'multipart/form-data');
    expect(result.headers).to.have.property('Authorization', 'Bearer THE TOKEN');
  });

  it('should return all of the operations on basis', async () => {
    let result = await baseConnector.getOperations();
    expect(result).to.not.equal(null);
    expect(result.size).to.equal(58);
    let result2 = await baseConnector.getOperations();
    expect(result).to.deep.equal(result2);
  });
});

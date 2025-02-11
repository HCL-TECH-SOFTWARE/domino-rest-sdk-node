/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import sinon from 'sinon';
import DominoConnector from '../src/DominoConnector.js';
import { ApiNotAvailable, DominoRestServer, DominoServer, HttpResponseError } from '../src/index.js';

use(chaiAsPromised);

describe('DominoServer', () => {
  const basisApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));
  const sampleUrl = 'http://localhost:8880';

  let fetchStub: sinon.SinonStub<[input: string | URL | Request, init?: RequestInit | undefined], Promise<Response>>;

  beforeEach(() => {
    fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().resolves(new Response(JSON.stringify(apiDefinitions)));
  });

  afterEach(() => {
    fetchStub.restore();
  });

  describe('getServer', () => {
    it(`should properly load APIs then return a 'DominoServer' object`, async () => {
      const dominoServer = await DominoServer.getServer(sampleUrl);
      expect(fetchStub.getCall(0).args[0]).to.equal(`${sampleUrl}/api`);
      expect(dominoServer).to.be.instanceOf(DominoServer);
      expect(dominoServer.baseUrl).to.equal(sampleUrl);
    });

    it(`should throw an error if loading APIs fail`, async () => {
      fetchStub.onFirstCall().rejects(new Error('Fetch error.'));

      await expect(DominoServer.getServer(sampleUrl)).to.be.rejectedWith('Fetch error.');
    });
  });

  describe('availableApis', () => {
    it('should return correct list of API definitions', async () => {
      const server = await DominoServer.getServer(sampleUrl);
      const apis = server.availableApis();
      expect(apis.length).to.equal(Object.keys(apiDefinitions).length);
      expect(apis).to.deep.equal(Object.keys(apiDefinitions));
    });
  });

  describe('getDominoConnector', () => {
    let dominoServer: DominoRestServer;

    beforeEach(async () => {
      fetchStub.onSecondCall().resolves(new Response(JSON.stringify(basisApi)));
      dominoServer = await DominoServer.getServer(sampleUrl);
    });

    it(`should return a 'DominoConnector' object`, async () => {
      const baseConnector = await dominoServer.getDominoConnector('basis');
      expect(baseConnector).to.be.instanceOf(DominoConnector);
      expect(baseConnector.baseUrl).to.equal(sampleUrl);
      expect(baseConnector.meta).to.deep.equal(dominoServer.apiMap.get('basis'));
    });

    it(`should return the same 'DominoConnector' if called again with the same API`, async () => {
      const baseConnector1 = await dominoServer.getDominoConnector('basis');
      const baseConnector2 = await dominoServer.getDominoConnector('basis');
      expect(fetchStub.callCount).to.equal(2);
      expect(baseConnector1).to.deep.equal(baseConnector2);
    });

    it('should throw an error if an error is encountered when getting connector from factory method', async () => {
      const errorResponse = {
        status: 404,
        message: 'This is not the URL you seek!',
        errorId: 0,
      };
      fetchStub.onSecondCall().resolves(new Response(JSON.stringify(errorResponse), { status: 404, statusText: 'Not Found' }));

      await expect(dominoServer.getDominoConnector('basis')).to.be.rejectedWith(HttpResponseError);
    });

    it('should throw an error if API is not in the API definitions list', async () => {
      await expect(dominoServer.getDominoConnector('shadow')).to.be.rejectedWith(ApiNotAvailable);
    });
  });

  describe('availableOperations', () => {
    const basisApiOperations = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));

    let dominoServer: DominoRestServer;

    beforeEach(async () => {
      fetchStub.onSecondCall().resolves(new Response(JSON.stringify(basisApi)));
      fetchStub.onThirdCall().resolves(new Response(JSON.stringify(basisApiOperations)));
      dominoServer = await DominoServer.getServer(sampleUrl);
    });

    it('should return all available operations from API', async () => {
      const operations = await dominoServer.availableOperations('basis');
      const dominoConnector = await dominoServer.getDominoConnector('basis');
      expect(operations.size).to.deep.equal(dominoConnector.schema.size);
      expect(operations).to.deep.equal(dominoConnector.schema);
    });

    it(`should throw an error when factory method for getting a connector fails`, async () => {
      const errorResponse = {
        status: 404,
        message: 'This is not the URL you seek!',
        errorId: 0,
      };
      fetchStub.onSecondCall().resolves(new Response(JSON.stringify(errorResponse), { status: 404, statusText: 'Not Found' }));

      await expect(dominoServer.availableOperations('basis')).to.be.rejectedWith(HttpResponseError);
    });

    it(`should throw an error when given API is not in the API definitions list`, async () => {
      await expect(dominoServer.availableOperations('shadow')).to.be.rejectedWith(ApiNotAvailable);
    });
  });
});

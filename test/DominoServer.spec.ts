/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import sinon from 'sinon';
import { DominoServer } from '../src';
import DominoConnector from '../src/DominoConnector';

chai.use(chaiAsPromised);

describe('Domino server with API definitions', () => {
  let stub: sinon.SinonStub<[input: RequestInfo | URL, init?: RequestInit | undefined], Promise<Response>>;
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));

  beforeEach(() => {
    stub = sinon.stub(global, 'fetch');
    stub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(apiDefinitions))));
  });

  afterEach(() => {
    stub.restore();
  });

  describe('Loading available APIs', () => {
    it('should return 5 keys', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      const apis = server.availableApis();
      expect(apis.length).to.equal(5);
      expect(stub.args[0][0]).to.have.string('http://localhost:8880/api');
    });

    it('should call out only once', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      const apis = server.availableApis();
      const apis2 = server.availableApis();
      expect(apis).to.eql(apis2);
      expect(stub.args.length).to.equal(1);
    });

    it('should have the same APIs on multiple calls', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      const apis = server.availableApis();
      const apis2 = server.availableApis();
      expect(apis).to.eql(apis2);
      expect(stub.args.length).to.equal(1);
    });
  });

  describe('Returning Domino Rest connector', () => {
    beforeEach(() => {
      stub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));
    });

    it('should return a DominoConnector', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      const baseConnector = await server.getDominoConnector('basis');
      expect(baseConnector).to.be.an.instanceOf(DominoConnector);
    });

    it('should return a DominoConnector using connector no reload needed', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      const baseConnector = await server.getDominoConnector('basis');
      const anotherConnector = await server.getDominoConnector('basis');
      expect(anotherConnector).to.be.an.instanceOf(DominoConnector);
      expect(anotherConnector).to.be.equal(baseConnector);
    });

    it('should not have an api "tango"', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      await expect(server.getDominoConnector('tango')).to.eventually.be.rejectedWith(`API 'tango' not available on this server`);
    });
  });

  describe('Loading available operations on a Server using an apiName of a Connector', () => {
    const operationDefinitions = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));

    beforeEach(() => {
      stub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(operationDefinitions))));
    });

    it('should return 58 keys', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      const ops = await server.availableOperations('basis');
      expect(ops.size).to.equal(58);
    });

    it('should throw an eror when operationsLoader fails', async () => {
      const server = await DominoServer.getServer('http://localhost:8880');
      stub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(apiDefinitions))));

      try {
        await server.availableOperations('tango');
        expect.fail('Expected an error to be thrown');
      } catch (error: any) {
        // Use 'any' as a last resort
        expect((error as Error).message).to.equal(`API 'tango' not available on this server`);
      } finally {
        stub.restore();
      }
    });
  });
});

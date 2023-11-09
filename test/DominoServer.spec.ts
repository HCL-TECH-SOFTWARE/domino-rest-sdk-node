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
  describe('Loading avaialble APIs', () => {
    let stub: any;
    let apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));

    beforeEach(() => {
      stub = sinon.stub(global, 'fetch');
      stub.returns(Promise.resolve(new Response(JSON.stringify(apiDefinitions))));
    });

    afterEach(() => {
      stub.restore();
    });

    it('should return 5 keys', async () => {
      let server = new DominoServer('http://localhost:8880');
      let apis = await server.availableApis();
      expect(apis.length).to.equal(5);
      expect(stub.args[0][0]).to.have.string('http://localhost:8880/api');
    });
    it('should call out only once', async () => {
      let server = new DominoServer('http://localhost:8880');
      let apis = await server.availableApis();
      let apis2 = await server.availableApis();
      expect(apis).to.eql(apis2);
      expect(stub.args.length).to.equal(1);
    });
    it('should throw an eror when apiLoader fails', async () => {
      let server = new DominoServer('http://localhost:8880');
      let apis = await server.availableApis();
      let apis2 = await server.availableApis();
      expect(apis).to.eql(apis2);
      expect(stub.args.length).to.equal(1);
    });
    it('should throw an eror when apiLoader fails', async () => {
      let server = new DominoServer('http://localhost:3000');
      stub.resolves({
        ok: false,
      });
      try {
        await server.availableApis();
        expect.fail('Expected an error to be thrown');
      } catch (error: any) {
        // Use 'any' as a last resort
        expect((error as Error).message).to.equal('_apiLoader failed');
      } finally {
        stub.restore();
      }
    });
  });

  describe('Returning Domino Rest connector', () => {
    let stub: any;
    let apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));

    beforeEach(() => {
      stub = sinon.stub(global, 'fetch');
      stub
        .onFirstCall()
        .returns(Promise.resolve(new Response(JSON.stringify(apiDefinitions))))
        .throws(new Error('One call too far'));
    });

    afterEach(() => {
      stub.restore();
    });

    it('should return a DominoConnector', async () => {
      let server = new DominoServer('http://localhost:8880');
      let baseConnector: DominoConnector = await server.getDominoConnector('basis');
      expect(baseConnector).to.be.an.instanceOf(DominoConnector);
      expect(stub.args.length).to.equal(1);
    });

    it('should return a DominoConnector using connector no reload needed', async () => {
      let server = new DominoServer('http://localhost:8880');
      let baseConnector: DominoConnector = await server.getDominoConnector('basis');
      let anotherConnector: DominoConnector = await server.getDominoConnector('basis');
      expect(anotherConnector).to.be.an.instanceOf(DominoConnector);
      expect(anotherConnector).to.be.equal(baseConnector);
    });

    it('should not have an api "tango"', (done) => {
      let server = new DominoServer('http://localhost:8880');
      let baseConnector = server.getDominoConnector('tango');
      expect(baseConnector).to.eventually.rejectedWith('API tango not available on this server').notify(done);
    });
  });

  describe('Loading available operations on a Server using an apiName of a Connector', () => {
    let stub: sinon.SinonStub<[input: RequestInfo | URL, init?: RequestInit | undefined], Promise<Response>>;
    let apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));
    let operationDefinitions =  JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));

    beforeEach(() => {
      stub = sinon.stub(global, 'fetch');
      stub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(apiDefinitions))));
      stub.onSecondCall().returns(Promise.resolve(new Response(JSON.stringify(operationDefinitions))));
    });

    afterEach(() => {
      stub.restore();
    });

    it('should return 58 keys', async () => {
      let server = new DominoServer('http://localhost:8880');
      let ops = await server.availableOperations('basis');
      expect(ops.size).to.equal(58);
    });

    
    it('should throw an eror when operationsLoader fails', async () => {
      let server = new DominoServer('http://localhost:8880');
      stub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(apiDefinitions))));
      // stub.onSecondCall().returns(Promise.reject("Retrieving DominoConnector Failed."));
      try {
        await server.availableOperations("tango");
        expect.fail('Expected an error to be thrown');
      } catch (error: any) {
        // Use 'any' as a last resort
        expect((error as Error).message).to.equal('API tango not available on this server');
      } finally {
        stub.restore();
      }
    });
  });
});

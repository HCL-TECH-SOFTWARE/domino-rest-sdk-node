/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';
import { RequestInfo } from 'undici-types';
import {
  CredentialType,
  DominoAccess,
  DominoRestAccessJSON,
  EmptyParamError,
  HttpResponseError,
  MissingParamError,
  CallbackError,
  MissingBearerError,
  RestCredentials,
} from '../src';
import { getSampleJWT } from '../src/JwtHelper';

chai.use(chaiAsPromised);

describe('DominoAccess', () => {
  const sampleJWT = getSampleJWT('John Doe');

  let simpleAccess: DominoRestAccessJSON;
  let fetchStub: sinon.SinonStub<[input: RequestInfo, init?: RequestInit | undefined], Promise<Response>>;

  beforeEach(() => {
    simpleAccess = {
      baseUrl: 'https://frascati.projectkeep.local:8880',
      credentials: {
        scope: '$DATA',
        type: CredentialType.BASIC,
        username: 'testuser',
        password: 'testpassword',
      },
    };
  });

  describe('constructor', () => {
    it(`should throw an error if 'baseUrl' is missing`, () => {
      delete (simpleAccess as any).baseUrl;
      expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'baseUrl' is empty`, () => {
      simpleAccess.baseUrl = '';
      expect(() => new DominoAccess(simpleAccess)).to.throw(EmptyParamError);
    });

    it(`should throw an error if 'credentials' is missing`, () => {
      delete (simpleAccess as any).credentials;
      expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'credentials.type' is missing`, () => {
      delete simpleAccess.credentials.type;
      expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError);
    });

    describe(`credentials are 'oauth' type`, () => {
      beforeEach(() => {
        simpleAccess.credentials = {
          scope: '$DATA',
          type: CredentialType.OAUTH,
          appId: '123',
          appSecret: '123',
          refreshToken: '123',
        };
      });

      it(`should create a 'DominoAccess' object`, () => {
        const dominoAccess = new DominoAccess(simpleAccess);
        expect(dominoAccess).to.instanceOf(DominoAccess);
        expect(dominoAccess.baseUrl).to.equal(simpleAccess.baseUrl);
        expect(dominoAccess.credentials).to.deep.equal(simpleAccess.credentials);
      });

      it(`should throw an error if 'credentials.appSecret' is missing`, () => {
        delete simpleAccess.credentials.appSecret;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError);
      });

      it(`should throw an error if 'credentials.appId' is missing`, () => {
        delete simpleAccess.credentials.appId;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError);
      });

      it(`should throw an error if 'credentials.refreshToken' is missing`, () => {
        delete simpleAccess.credentials.refreshToken;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError);
      });
    });

    describe(`credentials are 'basic' type`, () => {
      it(`should create a 'DominoAccess' object`, () => {
        const dominoAccess = new DominoAccess(simpleAccess);
        expect(dominoAccess).to.instanceOf(DominoAccess);
        expect(dominoAccess.baseUrl).to.equal(simpleAccess.baseUrl);
        expect(dominoAccess.credentials).to.deep.equal(simpleAccess.credentials);
      });

      it(`should throw an error if 'credentials.username' is missing`, () => {
        delete simpleAccess.credentials.username;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'credentials.username' is required.`);
      });

      it(`should throw an error if 'credentials.password' is missing`, () => {
        delete simpleAccess.credentials.password;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'credentials.password' is required.`);
      });
    });
  });

  describe('updateCredentials', () => {
    let dominoAccessToUpdate: DominoAccess;
    let incomingCredentials: RestCredentials;

    beforeEach(() => {
      dominoAccessToUpdate = new DominoAccess(simpleAccess);
      incomingCredentials = {
        scope: '$DATA,$SETUP',
        type: CredentialType.BASIC,
        username: 'newuser',
        password: 'newpassword',
      };
    });

    it(`should throw an error if incoming 'type' is missing`, () => {
      delete incomingCredentials.type;
      expect(() => dominoAccessToUpdate.updateCredentials(incomingCredentials)).to.throw(MissingParamError, `Parameter 'type' is required.`);
    });

    describe(`incoming credentials are 'oauth' type`, () => {
      beforeEach(() => {
        incomingCredentials = {
          scope: '$DATA,$SETUP',
          type: CredentialType.OAUTH,
          appId: 'ABC',
          appSecret: 'ABC',
          refreshToken: 'ABC',
        };
      });

      it(`should successfully update the credentials`, () => {
        dominoAccessToUpdate.updateCredentials(incomingCredentials);
        expect(dominoAccessToUpdate.credentials).to.deep.equal(incomingCredentials);
      });

      it(`should throw an error if incoming 'appSecret' is missing`, () => {
        delete incomingCredentials.appSecret;
        expect(() => dominoAccessToUpdate.updateCredentials(incomingCredentials)).to.throw(MissingParamError, `Parameter 'appSecret' is required.`);
      });

      it(`should throw an error if incoming 'appId' is missing`, () => {
        delete incomingCredentials.appId;
        expect(() => dominoAccessToUpdate.updateCredentials(incomingCredentials)).to.throw(MissingParamError, `Parameter 'appId' is required.`);
      });

      it(`should throw an error if incoming 'refreshToken' is missing`, () => {
        delete incomingCredentials.refreshToken;
        expect(() => dominoAccessToUpdate.updateCredentials(incomingCredentials)).to.throw(
          MissingParamError,
          `Parameter 'refreshToken' is required.`,
        );
      });
    });

    describe(`credentials are 'basic' type`, () => {
      it(`should successfully update the credentials`, () => {
        dominoAccessToUpdate.updateCredentials(incomingCredentials);
        expect(dominoAccessToUpdate.credentials).to.deep.equal(incomingCredentials);
      });

      it(`should throw an error if incoming 'username' is missing`, () => {
        delete incomingCredentials.username;
        expect(() => dominoAccessToUpdate.updateCredentials(incomingCredentials)).to.throw(MissingParamError, `Parameter 'username' is required.`);
      });

      it(`should throw an error if incoming 'password' is missing`, () => {
        delete incomingCredentials.password;
        expect(() => dominoAccessToUpdate.updateCredentials(incomingCredentials)).to.throw(MissingParamError, `Parameter 'password' is required.`);
      });
    });
  });

  describe('accessToken', () => {
    let dominoAccess: DominoAccess;

    describe(`credentials type is 'basic'`, () => {
      beforeEach(() => {
        dominoAccess = new DominoAccess(simpleAccess);
        fetchStub = sinon.stub(global, 'fetch');
        fetchStub.resolves(new Response(JSON.stringify(sampleJWT)));
      });

      afterEach(() => {
        fetchStub.restore();
      });

      it('should call fetch with correct parameters then return the access token', async () => {
        const accessToken = await dominoAccess.accessToken();
        const expectedOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: dominoAccess.credentials.username,
            password: dominoAccess.credentials.password,
            scope: dominoAccess.credentials.scope,
          }),
        };

        expect(fetchStub.getCall(0).args[0]).to.equal(`${dominoAccess.baseUrl}/api/v1/auth`);
        expect(fetchStub.getCall(0).args[1]).to.deep.equal(expectedOptions);
        expect(accessToken).to.be.equal(sampleJWT.bearer);
      });

      it('should call the callback function if given in the parameter then return the access token', async () => {
        // Mock callback function
        const mockCallback = sinon.stub();
        mockCallback.resolves(sampleJWT);

        const result = await dominoAccess.accessToken(mockCallback);
        expect(result).to.equal(sampleJWT.bearer);
        expect(mockCallback.calledOnce).to.be.true;
      });

      it(`should throw 'MissingBearerError'`, async () => {
        const mockCallback = sinon.stub();
        const testFail = getSampleJWT('John Doe');
        mockCallback.resolves(testFail);
        testFail.bearer = '';

        await expect(dominoAccess.accessToken(mockCallback)).to.be.rejectedWith(MissingBearerError);
      });

      it('should be rejected if callback fails', async () => {
        // Mock callback function
        const mockCallback = sinon.stub();
        mockCallback.rejects(new CallbackError('sample error thrown in catch'));
        await expect(dominoAccess.accessToken(mockCallback)).to.be.rejectedWith('Callback Error: sample error thrown in catch');
      });

      it(`should not have 'scope' in fetch options body if 'scope' is empty`, async () => {
        dominoAccess.credentials.scope = '';
        await dominoAccess.accessToken();
        const expectedOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: dominoAccess.credentials.username,
            password: dominoAccess.credentials.password,
          }),
        };

        expect(fetchStub.getCall(0).args[1]).to.deep.equal(expectedOptions);
      });

      it('should reuse access token if it exists and not yet expired', async () => {
        // Initialize access token
        await dominoAccess.accessToken();
        // Retry to fetch access token
        await dominoAccess.accessToken();

        // fetch should only be called once
        expect(fetchStub.getCalls().length).to.equal(1);
      });

      it('should fetch again for an access token if access token is expired', async () => {
        const decodeStub = sinon.stub(jwt, 'decode');
        decodeStub.returns({ exp: 1694529248 });
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify(sampleJWT)));

        // Initialize access token
        await dominoAccess.accessToken();
        // Retry to fetch access token
        await dominoAccess.accessToken();

        // fetch should only be called once
        expect(fetchStub.getCalls().length).to.equal(2);
        decodeStub.restore();
      });

      it('should throw an error if fetch response has an error status code', async () => {
        const errorResponse = {
          status: 401,
          message: 'Invalid credentials or account locked',
          errorId: 1008,
        };
        fetchStub.resolves(new Response(JSON.stringify(errorResponse), { status: 401, statusText: 'Unauthorized' }));

        await expect(dominoAccess.accessToken()).to.be.rejectedWith(HttpResponseError, errorResponse.message);
      });

      it('should throw an error if fetch fails', async () => {
        fetchStub.rejects(new Error('Fetch error.'));

        await expect(dominoAccess.accessToken()).to.be.rejectedWith('Fetch error.');
      });
    });

    describe(`credentials type is 'oauth'`, () => {
      beforeEach(() => {
        simpleAccess.credentials = {
          scope: '$DATA',
          type: CredentialType.OAUTH,
          appId: '123',
          appSecret: '123',
          refreshToken: '123',
        };
        dominoAccess = new DominoAccess(simpleAccess);
        fetchStub = sinon.stub(global, 'fetch');
        fetchStub.resolves(new Response(JSON.stringify(sampleJWT)));
      });

      afterEach(() => {
        fetchStub.restore();
      });

      it('should call fetch with correct parameters then return the access token', async () => {
        const accessToken = await dominoAccess.accessToken();
        const data = new URLSearchParams();
        data.append('grant_type', 'refresh_token');
        data.append('refresh_token', dominoAccess.credentials.refreshToken as string);
        data.append('scope', dominoAccess.credentials.scope as string);
        data.append('client_id', dominoAccess.credentials.appId as string);
        data.append('client_secret', dominoAccess.credentials.appSecret as string);
        const expectedOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: data,
        };

        expect(fetchStub.getCall(0).args[0]).to.equal(`${dominoAccess.baseUrl}/oauth/token`);
        expect(fetchStub.getCall(0).args[1]).to.deep.equal(expectedOptions);
        expect(accessToken).to.be.equal(sampleJWT.bearer);
      });

      it('should reuse access token if it exists and not yet expired', async () => {
        // Initialize access token
        await dominoAccess.accessToken();
        // Retry to fetch access token
        await dominoAccess.accessToken();

        // fetch should only be called once
        expect(fetchStub.getCalls().length).to.equal(1);
      });

      it('should fetch again for an access token if access token is expired', async () => {
        const decodeStub = sinon.stub(jwt, 'decode');
        decodeStub.returns({ exp: 1694529248 });
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify(sampleJWT)));

        // Initialize access token
        await dominoAccess.accessToken();
        // Retry to fetch access token
        await dominoAccess.accessToken();

        // fetch should only be called once
        expect(fetchStub.getCalls().length).to.equal(2);
        decodeStub.restore();
      });

      it('should throw an error if fetch response has an error status code', async () => {
        const errorResponse = {
          status: 401,
          message: 'Invalid credentials or account locked',
          errorId: 1008,
        };
        fetchStub.resolves(new Response(JSON.stringify(errorResponse), { status: 401, statusText: 'Unauthorized' }));

        await expect(dominoAccess.accessToken()).to.be.rejectedWith(HttpResponseError, errorResponse.message);
      });

      it('should throw an error if fetch fails', async () => {
        fetchStub.rejects(new Error('Fetch error.'));

        await expect(dominoAccess.accessToken()).to.be.rejectedWith('Fetch error.');
      });
    });
  });

  describe('scope', () => {
    let dominoAccess: DominoAccess;

    beforeEach(() => {
      dominoAccess = new DominoAccess(simpleAccess);
    });

    it('should return access scope', () => {
      expect(dominoAccess.scope()).to.equal(simpleAccess.credentials.scope);
    });

    it('should return null if scope is undefined', () => {
      dominoAccess.credentials.scope = undefined;
      expect(dominoAccess.scope()).to.be.null;
    });
  });

  describe('expiry', () => {
    let dominoAccess: DominoAccess;

    beforeEach(() => {
      dominoAccess = new DominoAccess(simpleAccess);
      fetchStub = sinon.stub(global, 'fetch');
      fetchStub.resolves(new Response(JSON.stringify(sampleJWT)));
    });

    afterEach(() => {
      fetchStub.restore();
    });

    it('should return expiry time in seconds if access token is already fetched', async () => {
      await dominoAccess.accessToken();
      expect(dominoAccess.expiry()).to.equal(dominoAccess.expiryTime);
    });

    it('should return null if expiry time is yet to be set', () => {
      expect(dominoAccess.expiry()).to.be.null;
    });
  });

  describe('clone', () => {
    it(`should create a new 'DominoAccess' with the new scope`, () => {
      const newScope = 'newScope';
      const dominoAccess = new DominoAccess(simpleAccess);
      const clone = dominoAccess.clone(newScope);
      expect(clone.scope()).to.equal(newScope);
    });
  });
});

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import chai, { expect } from 'chai';
import jwt from 'jsonwebtoken';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { CredentialType, DominoAccess, DominoRestAccessJSON, EmptyParamError, HttpResponseError, MissingParamError, RestCredentials } from '../src';
import { getSampleJWT } from '../src/JwtHelper';

chai.use(chaiAsPromised);

describe('DominoAccess for Access Tokens', () => {
  const sampleJWT = getSampleJWT('John Doe');

  let simpleAccess: DominoRestAccessJSON = {
    baseUrl: 'https://frascati.projectkeep.local:8880',
    credentials: {
      scope: '$DATA',
      type: CredentialType.BASIC,
      username: 'testuser',
      password: 'testpassword',
    },
  };

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
      expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'baseUrl' is required.`);
    });

    it(`should throw an error if given 'baseUrl' is empty`, () => {
      simpleAccess.baseUrl = '';
      expect(() => new DominoAccess(simpleAccess)).to.throw(EmptyParamError, `Parameter 'baseUrl' should not be empty.`);
    });

    it(`should throw an error if 'credentials' is missing`, () => {
      delete (simpleAccess as any).credentials;
      expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'credentials' is required.`);
    });

    it(`should throw an error if 'credentials.type' is missing`, () => {
      delete simpleAccess.credentials.type;
      expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'credentials.type' is required.`);
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

      it(`should successfully create a 'DominoAccess' object`, () => {
        const dominoAccess = new DominoAccess(simpleAccess);
        expect(dominoAccess).to.instanceOf(DominoAccess);
        expect(dominoAccess.baseUrl).to.equal(simpleAccess.baseUrl);
        expect(dominoAccess.credentials).to.deep.equal(simpleAccess.credentials);
      });

      it(`should throw an error if 'credentials.appSecret' is missing`, () => {
        delete simpleAccess.credentials.appSecret;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'credentials.appSecret' is required.`);
      });

      it(`should throw an error if 'credentials.appId' is missing`, () => {
        delete simpleAccess.credentials.appId;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'credentials.appId' is required.`);
      });

      it(`should throw an error if 'credentials.refreshToken' is missing`, () => {
        delete simpleAccess.credentials.refreshToken;
        expect(() => new DominoAccess(simpleAccess)).to.throw(MissingParamError, `Parameter 'credentials.refreshToken' is required.`);
      });
    });

    describe(`credentials are 'basic' type`, () => {
      it(`should successfully create a 'DominoAccess' object`, () => {
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
    describe(`credentials type is 'basic'`, () => {
      let dominoAccess: DominoAccess;
      let fetchStub: sinon.SinonStub<[input: RequestInfo | URL, init?: RequestInit | undefined], Promise<Response>>;

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
    });
  });

  describe('DominoAccess structure', () => {
    it('should retain baseURL on cloning', () => {
      const idp = new DominoAccess(simpleAccess);
      const clone = idp.clone('newScope');
      expect(clone).to.have.property('baseUrl', simpleAccess.baseUrl);
    });

    it('should update scope on cloning', async () => {
      const updatedScope = 'some scope here';
      const idp = new DominoAccess(simpleAccess);
      const clone = await idp.clone(updatedScope);
      expect(clone.scope()).to.equal(updatedScope);
    });

    it('should fail expired when no token is present', () => {
      const idp = new DominoAccess(simpleAccess);
      expect(() => idp.expiry()).to.throw('No token with expiry time found.');
    });
  });

  describe('Retrieving AccessToken using Basic', () => {
    simpleAccess.credentials = {
      scope: '$DATA',
      type: CredentialType.BASIC,
      username: 'John Doe',
      password: 'password',
    };
    const domAccess = new DominoAccess(simpleAccess);
    let stub: any;
    beforeEach(() => {
      stub = sinon.stub(global, 'fetch');
      stub.returns(Promise.resolve(new Response(JSON.stringify(sampleJWT))));
    });

    afterEach(() => {
      stub.restore();
    });

    it('should have called the right URL', async () => {
      const accessToken = await domAccess.accessToken();
      const exp = domAccess.expiry();
      expect(exp).not.null;
      expect((exp as number) * 1000).is.above(Number(new Date()));
      expect(accessToken).to.be.equal(sampleJWT.bearer);
      expect(stub.args[0][0]).to.have.string('/api/v1/auth');
    });

    it('should return the same token while it is valid', async () => {
      const accessToken = await domAccess.accessToken();
      const accessToken2 = await domAccess.accessToken();
      expect(accessToken).to.be.equal(accessToken2);
    });
  });

  describe('Retrieving AccessToken using OAUTH', () => {
    simpleAccess.credentials = {
      scope: '$DATA',
      type: CredentialType.OAUTH,
      refreshToken: 'Token',
      appId: 'appId',
      appSecret: 'secret',
    };
    const domAccess = new DominoAccess(simpleAccess);
    let stub: any;
    beforeEach(() => {
      stub = sinon.stub(global, 'fetch');
      stub.returns(Promise.resolve(new Response(JSON.stringify(sampleJWT))));
    });

    afterEach(() => {
      stub.restore();
    });

    it('should have called the OAuth token URL', async () => {
      const accessToken = await domAccess.accessToken();
      const exp = domAccess.expiry();
      expect(exp).not.null;
      expect((exp as number) * 1000).is.above(Number(new Date()));
      expect(accessToken).to.be.equal(sampleJWT.bearer);
      expect(stub.args[0][0]).to.have.string('/oauth/token');
    });
  });

  describe('Error retrieving access token', () => {
    const errorResponse = {
      status: 401,
      message: 'Invalid credentials or account locked',
      errorId: 1008,
    };

    let stub: sinon.SinonStub<[input: RequestInfo | URL, init?: RequestInit | undefined], Promise<Response>>;

    beforeEach(() => {
      stub = sinon.stub(global, 'fetch');
      const response = new Response(JSON.stringify(errorResponse), { status: 401, statusText: 'Unauthorized' });
      stub.resolves(response);
    });

    afterEach(() => {
      stub.restore();
    });

    it('should throw the JSON response when fetch response is not okay', async () => {
      simpleAccess.credentials = {
        scope: '$DATA',
        type: CredentialType.BASIC,
        username: 'John Doe',
        password: 'password',
      };

      const domAccess = new DominoAccess(simpleAccess);
      await expect(domAccess.accessToken()).to.be.rejectedWith('Invalid credentials or account locked');
    });
  });

  /* This is not particularly useful, just an exercise in manually mocking */
  describe('Mocking fetch', () => {
    let saveFetch: any;
    before(() => {
      saveFetch = global.fetch;
      global.fetch = (input: RequestInfo | URL): Promise<Response> => {
        let params = {
          status: 200,
          headers: {
            'Content-type': 'application/json',
          },
        };
        let result = new Response(JSON.stringify(sampleJWT), params);
        return Promise.resolve(result);
      };
    });
    after(() => {
      global.fetch = saveFetch;
    });

    it('should mock fetch', async () => {
      const where: string = simpleAccess.baseUrl || '';
      const result = await fetch(where);
      const jsonResult = await result.json();
      expect(jsonResult).to.eql(sampleJWT);
    });
  });
});

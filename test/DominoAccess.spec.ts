/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { CredentialType, DominoAccess, DominoRestAccessJSON, RestCredentials } from '../src';
import { getSampleJWT } from '../src/JwtHelper';

chai.use(chaiAsPromised);

describe('DominoAccess for Access Tokens', () => {
  const sampleJWT = getSampleJWT('John Doe');

  let simpleAccess: DominoRestAccessJSON = {
    baseUrl: 'https://frascati.projectkeep.local:8880',
    credentials: {
      scope: '$DATA',
      type: CredentialType.BASIC,
      userName: 'testuser',
      passWord: 'testpassword',
    },
  };

  beforeEach(() => {
    simpleAccess = {
      baseUrl: 'https://frascati.projectkeep.local:8880',
      credentials: {
        scope: '$DATA',
        type: CredentialType.BASIC,
        userName: 'testuser',
        passWord: 'testpassword',
      },
    };
  });

  describe('DominoAccess structure', () => {
    it('should throw an error if given base URL is empty on initialization', () => {
      simpleAccess.baseUrl = '';
      expect(() => new DominoAccess(simpleAccess)).to.throw('Base URL should not be empty.');
    });

    it('should insist on all basic credentials on initialization', () => {
      simpleAccess.credentials = {
        scope: '$DATA',
        type: CredentialType.BASIC,
      };
      expect(() => new DominoAccess(simpleAccess)).to.throw('BASIC auth needs userName and password.');
    });

    it('should insist on all oauth credentials on initialization', () => {
      simpleAccess.credentials = {
        scope: '$DATA',
        type: CredentialType.OAUTH,
      };
      expect(() => new DominoAccess(simpleAccess)).to.throw('OAuth needs appSecret, appId and refreshToken.');
    });

    it('should preserve the base url', () => {
      const idp = new DominoAccess(simpleAccess);
      expect(idp.baseUrl).equal(simpleAccess.baseUrl);
    });

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

    it('should return credentials unharmed', () => {
      const expected: RestCredentials = {
        scope: 'Ice cream',
        type: CredentialType.BASIC,
        userName: 'John',
        passWord: 'secret',
      };
      const idp = new DominoAccess(simpleAccess);
      const actual = idp.updateCredentials(expected);
      expect(actual).to.deep.equal(expected);
    });

    it('should insist on all basic credentials when updating credentials.', () => {
      const expected: RestCredentials = {
        scope: 'Ice cream',
        type: CredentialType.BASIC,
        userName: 'John',
      };
      const idp = new DominoAccess(simpleAccess);
      expect(() => idp.updateCredentials(expected)).to.throw('BASIC auth needs userName and password.');
    });

    it('should insist on all OAUTH credentials when updating credentials', () => {
      const expected: RestCredentials = {
        scope: 'Ice cream',
        type: CredentialType.OAUTH,
      };
      const idp = new DominoAccess(simpleAccess);
      expect(() => idp.updateCredentials(expected)).to.throw('OAuth needs appSecret, appId and refreshToken.');
    });

    it('should insist on all OAUTH credentials with fields that are empty strings', () => {
      const expected: RestCredentials = {
        scope: 'Ice cream',
        type: CredentialType.OAUTH,
        refreshToken: 'Token',
        appId: '',
        appSecret: '',
      };
      const idp = new DominoAccess(simpleAccess);
      expect(() => idp.updateCredentials(expected)).to.throw('OAuth needs appSecret, appId and refreshToken.');
    });

    it('should pass when all fields are provided', async () => {
      const incomingCredentials = {
        scope: 'Ice cream',
        type: CredentialType.OAUTH,
        refreshToken: 'Token',
        appId: 'value1',
        appSecret: 'valuesecret',
      };

      try {
        const idp = new DominoAccess(simpleAccess);
        const actual = idp.updateCredentials(incomingCredentials);
        expect(actual).to.be.undefined;
      } catch (error: any) {
        expect(error as Error);
      }
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
      userName: 'John Doe',
      passWord: 'password',
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
      const exp = await domAccess.expiry();
      expect(exp * 1000).is.above(Number(new Date()));
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
      const exp = await domAccess.expiry();
      expect(exp * 1000).is.above(Number(new Date()));
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

    it('should throw the response status text when fetch response is not okay', async () => {
      simpleAccess.credentials = {
        scope: '$DATA',
        type: CredentialType.BASIC,
        userName: 'John Doe',
        passWord: 'password',
      };
      const response = new Response(undefined, { status: 401, statusText: 'Unauthorized' });
      stub.resolves(response);

      const domAccess = new DominoAccess(simpleAccess);
      await expect(domAccess.accessToken()).to.be.rejectedWith('Unauthorized');
    });

    it('should throw the JSON response when fetch response is not okay', async () => {
      simpleAccess.credentials = {
        scope: '$DATA',
        type: CredentialType.BASIC,
        userName: 'John Doe',
        passWord: 'password',
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

/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';
import { TokenDecodeError } from '../src';
import { getExpiry, getOauthSampleJWT, getSampleJWT, isJwtExpired } from '../src/JwtHelper';
import template from '../src/resources/jwtTemplate.json';

describe('JwtHelper', () => {
  let decodeStub: sinon.SinonStub<[token: string, options?: jwt.DecodeOptions | undefined], string | jwt.JwtPayload | null>;
  let fakeClock: sinon.SinonFakeTimers;

  afterEach(() => {
    if (decodeStub !== undefined) {
      decodeStub.restore();
    }
    if (fakeClock !== undefined) {
      fakeClock.restore();
    }
  });

  describe('getSampleJWT', () => {
    it('should be able to generate local JWT', () => {
      const name = 'John Doe';
      const expected = {
        sub: name,
        CN: name,
        ...template,
      };
      const actual = getSampleJWT(name);

      expect(actual).to.have.property('bearer');
      expect(actual.sub).to.equal(expected.sub);
      expect(actual.CN).to.equal(expected.CN);
      expect(actual).to.have.property('iss');
      expect(actual).to.have.property('scope');
      expect(actual).to.have.property('aud');
      expect(actual).to.have.property('expSeconds');
      expect(actual).to.have.property('iat');
      expect(actual).to.have.property('exp');
    });
  });

  describe('getOauthSampleJWT', () => {
    it('should be able to generate local JWT in OAuth response format', () => {
      const name = 'John Doe';
      const expected = {
        token_type: 'bearer',
        expires_in: 3000,
      };
      const actual = getOauthSampleJWT(name);

      expect(actual.token_type).to.equal(expected.token_type);
      expect(actual.expires_in).to.equal(expected.expires_in);
      expect(actual).to.have.property('access_token');
    });
  });

  describe('getExpiry', () => {
    it('should throw an error if decoded token is null', () => {
      expect(() => getExpiry('eyJ08Ka_ELlPkypaskP_SwwNA')).to.throw("Can't decode token 'eyJ08Ka_ELlPkypaskP_SwwNA'");
    });

    it("should default to 0 if 'exp' cannot be found on token", () => {
      decodeStub = sinon.stub(jwt, 'decode');
      decodeStub.returns({});

      const actual = getExpiry('');
      expect(typeof actual).to.be.equal('number');
      expect(actual).to.be.equal(0);
    });

    it('should be able to return token expiry', () => {
      const actual = getExpiry(
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImpaYVpwVmN6bEw5aUVIQzBuek42N2lXR0JTUm9udEUydmdVbFRqMGZhRGMifQ.eyJpc3MiOiJDTj1mcmFzY2F0aS5wcm9qZWN0a2VlcC5pby9PPVByb2plY3RLZWVwL0Y9RnJhc2NhdGlEZW1vIiwic3ViIjoiQ049RG9jdG9yIE5vdGVzL089UHJvamVjdEtlZXAiLCJpYXQiOjE2OTQ1MjIwNDgsImV4cCI6MTY5NDUyOTI0OCwiYXVkIjoiRG9taW5vIiwiQ04iOiJDTj1Eb2N0b3IgTm90ZXMvTz1Qcm9qZWN0S2VlcCIsInNjb3BlIjoiTUFJTCAkREFUQSAkREVDUllQVCAkU0VUVVAgRG9taW5vLnVzZXIuYWxsIiwiZW1haWwiOiJkb2N0b3Iubm90ZXNAcHJvamVjdGtlZXAuaW8ifQ.gfVXnH7cy0XPLDsUyOV2Xsl5MyvSYm_4k9NfqkiGpJIAltI1oOF0UDgJ7u0XSQfc5i0jhD2uMUcOo9zz1VZ54Q7rs__jJ9_2Fq6k2ooS4IRnQisjJmzGF3ebLh4nzEQfUjs8Lztg1BnlLMn3RSVS2pNjGcS-037WThiG6BQtGiyJfK_mfWugs5GZy9_AKAkgziHOQz-rH22pRg-DoBkv_v8sY7ap-ian9W74zNvUx1PFdnsIIBFVxwNpvfH4GMTWDVDOeMcgm2m_nBmMDp8mA6EqiVNq_Ex9ed4-DOrKHv4xX1gOyl3cOhHUxghK5S_Ly8Ka_ELlPkypaskP_SwwNA',
      );
      expect(typeof actual).to.be.equal('number');
      expect(actual).to.be.greaterThan(0);
    });

    it('should throw an error if token cannot be decoded', () => {
      expect(() => getExpiry('asdacascsa')).to.throw(TokenDecodeError, `Can't decode token 'asdacascsa'.`);
    });
  });

  describe('isJwtExpired', () => {
    it('should throw an error if decoded token is null', () => {
      expect(() => isJwtExpired('eyJ08Ka_ELlPkypaskP_SwwNA')).to.throw("Can't decode token 'eyJ08Ka_ELlPkypaskP_SwwNA'");
    });

    it("should always be true if 'exp' cannot be found on token", () => {
      decodeStub = sinon.stub(jwt, 'decode');
      decodeStub.returns({});

      const actual = isJwtExpired('');
      expect(typeof actual).to.be.equal('boolean');
      expect(actual).to.be.equal(true);
    });

    it('should return false if expiry time is greater than current time', () => {
      decodeStub = sinon.stub(jwt, 'decode');
      fakeClock = sinon.useFakeTimers({
        now: new Date(2019, 1, 1, 0, 0),
        shouldAdvanceTime: true,
        toFake: ['Date'],
      });
      decodeStub.returns({ exp: 1694529248 });

      const actual = isJwtExpired('');
      expect(typeof actual).to.be.equal('boolean');
      expect(actual).to.be.equal(false);
    });

    it('should return true if expiry time is less than current time', () => {
      decodeStub = sinon.stub(jwt, 'decode');
      fakeClock = sinon.useFakeTimers({
        now: new Date(3000, 1, 1, 0, 0),
        shouldAdvanceTime: true,
        toFake: ['Date'],
      });
      decodeStub.returns({ exp: 1694529248 });

      const actual = isJwtExpired('');
      expect(typeof actual).to.be.equal('boolean');
      expect(actual).to.be.equal(true);
    });

    it('should throw an error if token cannot be decoded', () => {
      expect(() => isJwtExpired('asdacascsa')).to.throw(TokenDecodeError, `Can't decode token 'asdacascsa'.`);
    });
  });
});

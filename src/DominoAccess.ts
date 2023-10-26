/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { getExpiry, isJwtExpired } from './JwtHelper';
import { DominoRestAccess } from './RestInterfaces';

/**
 * Credentials needed to access Domino REST API server. Required properties changes depending
 * on type. If type is basic then username and password is needed, otherwise, if type is
 * oauth, then application ID, application secret and refresh token is required.
 */
export type RestCredentials = {
  /**
   * The scope/s you want access to separated by spaces.
   */
  scope: string;
  /**
   * The type of credentials given. Can be 'basic' or 'oauth'.
   */
  type: CredentialType;
  /**
   * Required for basic credentials. The username of user.
   */
  userName?: string;
  /**
   * Required for basic credentials. The password of user.
   */
  passWord?: string;
  /**
   * Required for oauth credentials. The refresh token.
   */
  refreshToken?: string;
  /**
   * Required for oauth credentials. The application ID.
   */
  appId?: string;
  /**
   * Required for oauth credentials. The application secret.
   */
  appSecret?: string;
};

/**
 * JSON passed through {@link DominoAccess} constructor.
 */
export type DominoRestAccessJSON = {
  /**
   * Base URL of Domino REST API server.
   */
  baseUrl: string;
  /**
   * Credentials to access the given Domino REST API server URL.
   */
  credentials: RestCredentials;
};

/**
 * List of credential types available.
 */
export enum CredentialType {
  /**
   * Basic credentials. Needs username and password.
   */
  BASIC = 'basic',
  /**
   * OAuth credentials. Needs application ID, application secret and refresh token.
   */
  OAUTH = 'oauth',
}

/**
 * Helper class to obtain a valid Access and eventually Refresh Token from
 * A Domino REST API based backend. requires https
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoAccess implements DominoRestAccess {
  baseUrl: string;
  credentials: RestCredentials;
  expiryTime?: number;
  token?: string;

  constructor(params: DominoRestAccessJSON) {
    if (params.baseUrl.trim().length === 0) {
      throw new Error('Base URL should not be empty.');
    }
    if (params.credentials.type == CredentialType.BASIC) {
      if (!params.credentials.userName || !params.credentials.passWord) {
        throw new Error('BASIC auth needs userName and password.');
      }
    } else {
      // Type is OAuth
      if (!params.credentials.appSecret || !params.credentials.appId || !params.credentials.refreshToken) {
        throw new Error('OAuth needs appSecret, appId and refreshToken.');
      }
    }

    this.baseUrl = params.baseUrl;
    this.credentials = params.credentials;
  }

  scope(): string {
    return this.credentials.scope;
  }

  updateCredentials(incomingCredentials: RestCredentials): RestCredentials {
    // Check if credentials make sense
    if (incomingCredentials.type == CredentialType.BASIC) {
      if (!incomingCredentials.userName || !incomingCredentials.passWord) {
        throw new Error('BASIC auth needs userName and password.');
      }
    } else {
      // Type is OAuth
      if (!incomingCredentials.appSecret || !incomingCredentials.appId || !incomingCredentials.refreshToken) {
        throw new Error('OAuth needs appSecret, appId and refreshToken.');
      }
    }
    // username / password or IdP information
    this.credentials = incomingCredentials;
    return this.credentials;
  }

  async accessToken(): Promise<string> {
    // check for a valid token and return that one instead of asking again
    if (this.token && !isJwtExpired(this.token)) {
      return Promise.resolve(this.token);
    }

    let fullURL = this.baseUrl;
    let options: any = {
      method: 'POST',
      headers: {},
    };

    if (this.credentials.type == CredentialType.BASIC) {
      fullURL += '/api/v1/auth';
      let data = {
        username: this.credentials.userName,
        password: this.credentials.passWord,
        scope: this.scope,
      };
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    } else {
      // OAUTH refresh token flow
      fullURL += '/oauth/token';
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      let data = new URLSearchParams();
      data.append('grant_type', 'refresh_token');
      data.append('refresh_token', this.credentials.refreshToken as string);
      data.append('scope', this.credentials.scope);
      data.append('client_id', this.credentials.appId as string);
      data.append('client_secret', this.credentials.appSecret as string);
      options.body = data;
    }

    const response = await fetch(fullURL, options);
    if (!response.ok && response.headers.get('content-type') === null) {
      return Promise.reject(new Error(response.statusText));
    }
    const json = await response.json();
    if (!response.ok) {
      return Promise.reject(json);
    }
    this.token = json.bearer;
    this.expiryTime = getExpiry(json.bearer);
    return Promise.resolve(json.bearer);
  }

  expiry(): number {
    if (!this.expiryTime) {
      throw new Error('No token with expiry time found.');
    }
    return this.expiryTime;
  }

  /**
   * Creates a clone of current DominoAccess with the given alternate scope.
   *
   * @param alternateScope the alternate scope the clone DominoAccess will have.
   * @returns a clone of current DominoAccess that has the alternate scope.
   */
  clone(alternateScope: string): DominoAccess {
    let result = new DominoAccess(this);
    result.credentials.scope = alternateScope;
    return result;
  }
}

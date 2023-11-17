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
  username?: string;
  /**
   * Required for basic credentials. The password of user.
   */
  password?: string;
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
      if (!params.credentials.username || !params.credentials.password) {
        throw new Error('BASIC auth needs userName and password.');
      }
    } else {
      // Credentials type is OAuth
      if (!params.credentials.appSecret || !params.credentials.appId || !params.credentials.refreshToken) {
        throw new Error('OAuth needs appSecret, appId and refreshToken.');
      }
    }

    this.baseUrl = params.baseUrl;
    this.credentials = params.credentials;
  }

  scope = (): string => {
    return this.credentials.scope;
  };

  updateCredentials = (incomingCredentials: RestCredentials): RestCredentials => {
    // Check if credentials make sense
    if (incomingCredentials.type == CredentialType.BASIC) {
      if (!incomingCredentials.username || !incomingCredentials.password) {
        throw new Error('BASIC auth needs username and password.');
      }
    } else {
      // Type is OAuth
      if (!incomingCredentials.appSecret || !incomingCredentials.appId || !incomingCredentials.refreshToken) {
        throw new Error('OAuth needs appSecret, appId and refreshToken.');
      }
    }

    // Username/password or IdP information
    this.credentials = incomingCredentials;
    return this.credentials;
  };

  private _buildAccessTokenOptions = (url: URL) => {
    const options: RequestInit = {
      method: 'POST',
      headers: {},
    };

    if (this.credentials.type === CredentialType.BASIC) {
      url.pathname = '/api/v1/auth';
      const data = {
        username: this.credentials.username,
        password: this.credentials.password,
        scope: this.scope,
      };
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    } else {
      // OAUTH refresh token flow
      url.pathname = '/oauth/token';
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      const data = new URLSearchParams();
      data.append('grant_type', 'refresh_token');
      data.append('refresh_token', this.credentials.refreshToken ? this.credentials.refreshToken : '');
      data.append('scope', this.credentials.scope);
      data.append('client_id', this.credentials.appId ? this.credentials.appId : '');
      data.append('client_secret', this.credentials.appSecret ? this.credentials.appSecret : '');
      options.body = data;
    }

    return options;
  };

  accessToken = () =>
    new Promise<string>((resolve, reject) => {
      // Check for a valid token and return that one instead of asking again
      if (this.token && !isJwtExpired(this.token)) {
        resolve(this.token);
      }

      const url = new URL(this.baseUrl);
      const options = this._buildAccessTokenOptions(url);

      fetch(url.toString(), options)
        .then((response) => response.json())
        .then((access) => {
          this.token = access.bearer;
          this.expiryTime = getExpiry(access.bearer);
          resolve(access.bearer);
        })
        .catch((error) => reject(error));
    });

  expiry = (): number => {
    if (!this.expiryTime) {
      throw new Error('No token with expiry time found.');
    }
    return this.expiryTime;
  };

  clone = (alternateScope: string): DominoAccess => {
    const result = new DominoAccess(this);
    result.credentials.scope = alternateScope;
    return result;
  };
}

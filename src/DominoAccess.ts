/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { getExpiry, isJwtExpired } from './JwtHelper';
import { DominoRestAccess } from './RestInterfaces';
import { isEmpty } from './Utilities';
import { EmptyParamError } from './errors/EmptyParamError';
import { HttpResponseError } from './errors/HttpResponseError';
import { MissingParamError } from './errors/MissingParamError';

/**
 * Credentials needed to access Domino REST API server. Required properties changes depending
 * on type. If type is basic then username and password is needed, otherwise, if type is
 * oauth, then application ID, application secret and refresh token is required.
 */
export type RestCredentials = {
  /**
   * The scope/s you want access to separated by spaces.
   */
  scope?: string;
  /**
   * The type of credentials given. Can be 'basic' or 'oauth'. Defaults to 'basic' if not given.
   */
  type?: CredentialType;
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
    if (!params.hasOwnProperty('baseUrl')) {
      throw new MissingParamError('baseUrl');
    }
    if (isEmpty(params.baseUrl)) {
      throw new EmptyParamError('baseUrl');
    }
    if (!params.hasOwnProperty('credentials')) {
      throw new MissingParamError('credentials');
    }
    if (!params.credentials.hasOwnProperty('type')) {
      throw new MissingParamError('credentials.type');
    }
    if (params.credentials.type === CredentialType.OAUTH) {
      // Credentials type is OAuth
      if (!params.credentials.hasOwnProperty('appSecret')) {
        throw new MissingParamError('credentials.appSecret');
      }
      if (!params.credentials.hasOwnProperty('appId')) {
        throw new MissingParamError('credentials.appId');
      }
      if (!params.credentials.hasOwnProperty('refreshToken')) {
        throw new MissingParamError('credentials.refreshToken');
      }
    } else {
      // Default is basic credentials
      if (!params.credentials.hasOwnProperty('username')) {
        throw new MissingParamError('credentials.username');
      }
      if (!params.credentials.hasOwnProperty('password')) {
        throw new MissingParamError('credentials.password');
      }
    }

    this.baseUrl = params.baseUrl;
    this.credentials = params.credentials;
  }

  scope = (): string | null => {
    return this.credentials.scope ? this.credentials.scope : null;
  };

  updateCredentials = (incomingCredentials: RestCredentials): RestCredentials => {
    // Check if credentials make sense
    if (incomingCredentials.type === CredentialType.OAUTH) {
      // Credentials type is OAuth
      if (!incomingCredentials.hasOwnProperty('appSecret')) {
        throw new MissingParamError('appSecret');
      }
      if (!incomingCredentials.hasOwnProperty('appId')) {
        throw new MissingParamError('appId');
      }
      if (!incomingCredentials.hasOwnProperty('refreshToken')) {
        throw new MissingParamError('refreshToken');
      }
    } else {
      // Default is basic credentials
      if (!incomingCredentials.hasOwnProperty('username')) {
        throw new MissingParamError('username');
      }
      if (!incomingCredentials.hasOwnProperty('password')) {
        throw new MissingParamError('password');
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
      const data: { username?: string; password?: string; scope?: string } = {
        username: this.credentials.username,
        password: this.credentials.password,
      };
      if (this.credentials.scope !== undefined && this.credentials.scope !== null) {
        data.scope = this.credentials.scope;
      }
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
      data.append('refresh_token', this.credentials.refreshToken as string);
      data.append('scope', this.credentials.scope as string);
      data.append('client_id', this.credentials.appId as string);
      data.append('client_secret', this.credentials.appSecret as string);
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

      return fetch(url.toString(), options)
        .then(async (response) => {
          const json = await response.json();
          if (!response.ok) {
            throw new HttpResponseError(json);
          }
          return json;
        })
        .then((access) => {
          this.token = access.bearer;
          this.expiryTime = getExpiry(access.bearer);
          return resolve(access.bearer);
        })
        .catch((error) => reject(error));
    });

  expiry = (): number | null => {
    return this.expiryTime ? this.expiryTime : null;
  };

  clone = (alternateScope: string): DominoAccess => {
    const result = new DominoAccess(this);
    result.credentials.scope = alternateScope;
    return result;
  };
}

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { getExpiry, isJwtExpired } from './JwtHelper';
import { DominoRestAccess } from './RestInterfaces';
import { EmptyParamError, HttpResponseError, MissingParamError, MissingBearerError, CallbackError } from './errors';
import { isEmpty } from './helpers/Utilities';

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

type AccessTokenReturn = {
  bearer: string;
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
    DominoAccess._checkCredentials(params);

    this.baseUrl = params.baseUrl;
    this.credentials = params.credentials;
  }

  updateCredentials = (incomingCredentials: RestCredentials): RestCredentials => {
    if (!incomingCredentials.hasOwnProperty('type')) {
      throw new MissingParamError('type');
    }
    DominoAccess._checkCredentials(incomingCredentials);

    // Username/password or IdP information
    this.credentials = incomingCredentials;
    return this.credentials;
  };

  accessToken = (callback?: () => Promise<AccessTokenReturn>) =>
    new Promise<string>((resolve, reject) => {
      // Check for a valid token and return that one instead of asking again
      if (this.token && !isJwtExpired(this.token)) {
        return resolve(this.token);
      }
      if (!isEmpty(callback)) {
        (callback as () => Promise<AccessTokenReturn>)()
          .then((access: AccessTokenReturn) => {
            if (isEmpty(access.bearer)) {
              throw new MissingBearerError();
            }
            const bearer = String(access.bearer);
            this.token = bearer;
            this.expiryTime = getExpiry(bearer);
            return resolve(bearer);
          })
          .catch((error: string) => reject(new CallbackError(error)));
      } else {
        const url = new URL(this.baseUrl);
        const options = DominoAccess._buildAccessTokenOptions(url, this.credentials);

        fetch(url.toString(), options)
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
      }
    });

  scope = (): string | null => {
    return this.credentials.scope ? this.credentials.scope : null;
  };

  expiry = (): number | null => {
    return this.expiryTime ? this.expiryTime : null;
  };

  clone = (alternateScope: string): DominoAccess => {
    const result = new DominoAccess(this);
    result.credentials.scope = alternateScope;
    return result;
  };

  private static _checkCredentials = (obj: any) => {
    let credentials = obj;
    let prependParamError = '';
    if (obj.hasOwnProperty('credentials')) {
      credentials = obj.credentials;
      prependParamError = 'credentials.';
    }

    if (credentials.type === CredentialType.OAUTH) {
      // Credentials type is OAuth
      if (!credentials.hasOwnProperty('appSecret')) {
        throw new MissingParamError(`${prependParamError}appSecret`);
      }
      if (!credentials.hasOwnProperty('appId')) {
        throw new MissingParamError(`${prependParamError}appId`);
      }
      if (!credentials.hasOwnProperty('refreshToken')) {
        throw new MissingParamError(`${prependParamError}refreshToken`);
      }
    } else {
      // Default is basic credentials
      if (!credentials.hasOwnProperty('username')) {
        throw new MissingParamError(`${prependParamError}username`);
      }
      if (!credentials.hasOwnProperty('password')) {
        throw new MissingParamError(`${prependParamError}password`);
      }
    }
  };

  private static _buildAccessTokenOptions = (url: URL, credentials: RestCredentials) => {
    const options: RequestInit = {
      method: 'POST',
      headers: {},
    };

    if (credentials.type === CredentialType.BASIC) {
      url.pathname = '/api/v1/auth';
      const data: { username?: string; password?: string; scope?: string } = {
        username: credentials.username,
        password: credentials.password,
      };
      if (!isEmpty(credentials.scope)) {
        data.scope = credentials.scope;
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
      data.append('refresh_token', credentials.refreshToken as string);
      data.append('scope', credentials.scope as string);
      data.append('client_id', credentials.appId as string);
      data.append('client_secret', credentials.appSecret as string);
      options.body = data;
    }

    return options;
  };
}

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoBaseDocument, DominoDocumentMeta } from './index.ts';
import { DominoRestScope } from './RestInterfaces.ts';
import { EmptyParamError, MissingParamError } from './errors/index.ts';
import { isEmpty } from './helpers/Utilities.ts';

/**
 * Domino REST API scope base properties.
 */
export type DominoBaseScope = {
  /**
   * Always has value KeepDatabase for scopes.
   */
  name?: string;
  /**
   * Always has value KeepDatabase for scopes.
   */
  Form?: string;
  /**
   * Always has value KeepDatabase for scopes.
   */
  Type?: string;
  /**
   * The user who update the doc.
   */
  $UpdatedBy?: string[];
  /**
   * Last updated date in ISO format.
   */
  $Revisions?: string;
} & Omit<DominoBaseDocument, '@warnings' | 'Form'>;

/**
 * Domino REST API scope body.
 */
export type ScopeBody = {
  /**
   * Name that is used in dataSource parameter to access mapped resource.
   */
  apiName: string;
  /**
   * Explanation of the scope.
   */
  description?: string;
  /**
   * Base64 encoded icon (preferably SVG).
   */
  icon?: string;
  /**
   * Alternate text for icon.
   */
  iconName?: string;
  /**
   * Allows to enable/disable API access without removing configuration.
   */
  isActive?: boolean;
  /**
   * Limits, but not extends the access level granted to an API user. Mirrors the
   * MaximumInternetAccess in DB ACLs. Default if not provided is Editor.
   */
  maximumAccessLevel?: string;
  /**
   * Path relative to Domino data directory to NSF database.
   */
  nsfPath: string;
  /**
   * Name (without .json extension) of schema file in NSF REST file resources.
   */
  schemaName: string;
  /**
   * Domino server name that this scope is enabled on. Empty or '*' mean that this scope is enabled
   * on all Domino servers.
   */
  server?: string;
} & DominoBaseScope;

/**
 * Domino REST API scope properties without base properties.
 */
export type ScopeJSON = Omit<ScopeBody, '@meta' | 'Form' | 'Type' | '$UpdatedBy' | '$Revisions'>;

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * Access levels available on Domino REST API.
 */
export enum AccessLevel {
  /**
   * Have full control over a database or application. They can create, edit, delete, and manage
   * documents, design elements, and security settings.
   */
  Manager = 'Manager',
  /**
   * Can modify and create design elements within a database, such as forms, views, and agents,
   * but they have limited access to data documents.
   */
  Designer = 'Designer',
  /**
   * Can create, edit, and delete data documents within a database but do not have access to
   * design elements or security settings.
   */
  Editor = 'Editor',
  /**
   * Can create and edit data documents, but they cannot delete them. They also do not have access
   * to design elements or security settings.
   */
  Author = 'Author',
  /**
   * Can view data documents but cannot make any changes. They do not have access to design elements
   * or security settings.
   */
  Reader = 'Reader',
  /**
   * Can create new data documents but cannot edit or delete existing ones. This access level is
   * often used for allowing users to submit information but not modify it once submitted.
   */
  Depositor = 'Depositor',
  /**
   * Has no access, with the exception of options to Read public documents and Write public documents.
   */
  NoAccess = 'NoAccess',
}

/**
 * Holds Domino REST API scope information and utility functions.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoScope implements DominoRestScope {
  apiName: string;
  description?: string = '';
  icon?: string =
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwb2x5Z29uIHN0eWxlPSJmaWxsOiM0Mzk4RDE7IiBwb2ludHM9IjQ2OS4zMzMsMzI0LjI2NyA0Mi42NjcsMzI0LjI2NyA0Mi42NjcsNTkuNzMzIDIzMC40LDU5LjczMyAyMzAuNCwyNS42IDQ2OS4zMzMsMjUuNiAiLz4NCjxyZWN0IHg9IjQyLjY2NyIgeT0iMTI4IiBzdHlsZT0iZmlsbDojREU0QzNDOyIgd2lkdGg9IjQyNi42NjciIGhlaWdodD0iMTQ1LjA2NyIvPg0KPHJlY3QgeD0iNTkuNzMzIiB5PSIyNS42IiBzdHlsZT0iZmlsbDojRkRCNjJGOyIgd2lkdGg9IjUxLjIiIGhlaWdodD0iMzQuMTMzIiAvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzQzOThEMTsiIGQ9Ik04LjUzMywxNjIuMTMzYzAsOS40MjksNy42MzcsMTcuMDY3LDE3LjA2NywxNy4wNjdoMTcuMDY3di0zNC4xMzNIMjUuNiBDMTYuMTcxLDE0NS4wNjcsOC41MzMsMTUyLjcwNCw4LjUzMywxNjIuMTMzeiIgLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiM0Mzk4RDE7IiBkPSJNNDg2LjQsMTQ1LjA2N2gtMTcuMDY3VjE3OS4ySDQ4Ni40YzkuNDI5LDAsMTcuMDY3LTcuNjM3LDE3LjA2Ny0xNy4wNjcgQzUwMy40NjcsMTUyLjcwNCw0OTUuODI5LDE0NS4wNjcsNDg2LjQsMTQ1LjA2N3oiIC8+DQo8cmVjdCB4PSIzODQiIHk9IjU5LjczMyIgc3R5bGU9ImZpbGw6Izg3Q0VEOTsiIHdpZHRoPSI1MS4yIiBoZWlnaHQ9IjM0LjEzMyIvPg0KPGNpcmNsZSBzdHlsZT0iZmlsbDojRTVFNUU1OyIgY3g9IjExOS40NjciIGN5PSIxMjgiIHI9IjE3LjA2NyIvPg0KPHJlY3QgeD0iMTQ1LjA2NyIgeT0iMjUuNiIgc3R5bGU9ImZpbGw6I0ZEQjYyRjsiIHdpZHRoPSI1MS4yIiBoZWlnaHQ9IjM0LjEzMyIvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzQzOThEMTsiIGQ9Ik00MDkuNiwxODAuNzd2LTE4LjYzN2MwLTQuNzEtMy44MjMtOC41MzMtOC41MzMtOC41MzNzLTguNTMzLDMuODIzLTguNTMzLDguNTMzdjE4LjYzNyBjLTEzLjMyOSw0LjcxLTIwLjMxOCwxOS4zMzctMTUuNTk5LDMyLjY2NmM0LjcxLDEzLjMyOSwxOS4zMzcsMjAuMzE4LDMyLjY2NiwxNS41OTljMTMuMzI5LTQuNzE5LDIwLjMxOC0xOS4zMzcsMTUuNTk5LTMyLjY2NiBDNDIyLjYyMiwxODkuMDgyLDQxNi44ODcsMTgzLjM0Nyw0MDkuNiwxODAuNzd6IE00MDEuMDY3LDIxMy4zMzNjLTQuNzEsMC04LjUzMy0zLjgyMy04LjUzMy04LjUzM2MwLTQuNzEsMy44MjMtOC41MzMsOC41MzMtOC41MzMgczguNTMzLDMuODIzLDguNTMzLDguNTMzQzQwOS42LDIwOS41MSw0MDUuNzc3LDIxMy4zMzMsNDAxLjA2NywyMTMuMzMzeiIvPg0KPHJlY3QgeD0iMTYyLjEzMyIgeT0iODUuMzMzIiBzdHlsZT0iZmlsbDojODdDRUQ5OyIgd2lkdGg9IjI1LjYiIGhlaWdodD0iMTcuMDY3Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojQ0ZDRkNGOyIgZD0iTTQwMS4wNjcsNDg2LjRIMzQuMTMzQzE1LjI4Myw0ODYuNCwwLDQ3MS4xMTcsMCw0NTIuMjY3VjE2Mi4xMzNjMC00LjcxLDMuODIzLTguNTMzLDguNTMzLTguNTMzIHM4LjUzMywzLjgyMyw4LjUzMyw4LjUzM3YyOTAuMTMzYzAsOS40MjksNy42MzcsMTcuMDY3LDE3LjA2NywxNy4wNjdoMzY2LjkzM2M5LjQyOSwwLDE3LjA2Ny03LjYzNywxNy4wNjctMTcuMDY3IHMtNy42MzctMTcuMDY3LTE3LjA2Ny0xNy4wNjdoLTIwNC44Yy0xOC44NSwwLTM0LjEzMy0xNS4yODMtMzQuMTMzLTM0LjEzM3MxNS4yODMtMzQuMTMzLDM0LjEzMy0zNC4xMzNoMjgxLjYgYzkuNDI5LDAsMTcuMDY3LTcuNjM3LDE3LjA2Ny0xNy4wNjdWMTYyLjEzM2MwLTQuNzEsMy44MjMtOC41MzMsOC41MzMtOC41MzNjNC43MSwwLDguNTMzLDMuODIzLDguNTMzLDguNTMzdjE4Ny43MzMgYzAsMTguODUtMTUuMjgzLDM0LjEzMy0zNC4xMzMsMzQuMTMzaC0yODEuNmMtOS40MjksMC0xNy4wNjcsNy42MzctMTcuMDY3LDE3LjA2N2MwLDkuNDI5LDcuNjM3LDE3LjA2NywxNy4wNjcsMTcuMDY3aDIwNC44IGMxOC44NSwwLDM0LjEzMywxNS4yODMsMzQuMTMzLDM0LjEzM1M0MTkuOTE3LDQ4Ni40LDQwMS4wNjcsNDg2LjR6Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojNDM5OEQxOyIgZD0iTTE1My42LDE3MC42NjdjLTE0LjE0LDAtMjUuNiwxMS40Ni0yNS42LDI1LjZzMTEuNDYsMjUuNiwyNS42LDI1LjZoMjUuNnYtNTEuMkgxNTMuNnoiLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6I0U1RTVFNTsiIGN4PSIyNTYiIGN5PSIxOTYuMjY3IiByPSI5My44NjciLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6Izg3Q0VEOTsiIGN4PSIyNTYiIGN5PSIxOTYuMjY3IiByPSI1OS43MzMiLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiM3MUM0RDE7IiBkPSJNMjgzLjQyNiwxNDMuMjQxbC04MC40NTIsODAuNDUyYzE1LjEwNCwyOS4zMjksNTEuMTIzLDQwLjg2Niw4MC40NTIsMjUuNzYyIHM0MC44NjYtNTEuMTIzLDI1Ljc2Mi04MC40NTJDMzAzLjQ4OCwxNTcuOTQzLDI5NC40ODUsMTQ4LjkzMiwyODMuNDI2LDE0My4yNDF6Ii8+DQo8L3N2Zz4NCg==';
  iconName?: string = 'beach';
  isActive?: boolean = true;
  maximumAccessLevel?: string = AccessLevel.Editor;
  nsfPath: string;
  schemaName: string;
  server?: string = '*';

  readonly '@meta'?: DominoDocumentMeta;
  readonly Form?: string;
  readonly Type?: string;
  readonly $UpdatedBy?: string[];
  readonly $Revisions?: string;

  constructor(doc: ScopeBody) {
    if (!doc.hasOwnProperty('apiName')) {
      throw new MissingParamError('apiName');
    }
    if (isEmpty(doc.apiName)) {
      throw new EmptyParamError('apiName');
    }
    if (!doc.hasOwnProperty('schemaName')) {
      throw new MissingParamError('schemaName');
    }
    if (isEmpty(doc.schemaName)) {
      throw new EmptyParamError('schemaName');
    }
    if (!doc.hasOwnProperty('nsfPath')) {
      throw new MissingParamError('nsfPath');
    }
    if (isEmpty(doc.nsfPath)) {
      throw new EmptyParamError('nsfPath');
    }

    this.apiName = doc.apiName;
    this.schemaName = doc.schemaName;
    this.nsfPath = doc.nsfPath;
    this.description = doc.description ?? '';
    this.iconName = doc.iconName ?? 'beach';
    this.isActive = doc.isActive ?? true;
    this.maximumAccessLevel = doc.maximumAccessLevel ?? AccessLevel.Editor;
    this.server = doc.server ?? '*';
    this.icon = doc.icon;
    this['@meta'] = doc['@meta'];
    this.Form = doc.Form;
    this.Type = doc.Type;
    this['$UpdatedBy'] = doc['$UpdatedBy'];
    this['$Revisions'] = doc['$Revisions'];
  }

  toScopeJson = (): ScopeJSON => {
    const json: ScopeJSON = {
      apiName: this.apiName,
      description: this.description,
      icon: this.icon,
      iconName: this.iconName,
      isActive: this.isActive,
      maximumAccessLevel: this.maximumAccessLevel,
      nsfPath: this.nsfPath,
      schemaName: this.schemaName,
      server: this.server,
    };
    return json;
  };

  toJson = (): Partial<ScopeBody> => {
    let json: Writable<Partial<ScopeBody>> = {};

    if (this['@meta'] !== undefined) {
      json['@meta'] = this['@meta'];
    }
    json = {
      ...json,
      apiName: this.apiName,
      description: this.description,
      icon: this.icon,
      iconName: this.iconName,
      isActive: this.isActive,
      maximumAccessLevel: this.maximumAccessLevel,
      nsfPath: this.nsfPath,
      schemaName: this.schemaName,
      server: this.server,
    };
    if (this.Form !== undefined) {
      json.Form = this.Form;
    }
    if (this.Type !== undefined) {
      json.Type = this.Type;
    }
    if (this.$UpdatedBy !== undefined) {
      json.$UpdatedBy = this.$UpdatedBy;
    }
    if (this.$Revisions !== undefined) {
      json.$Revisions = this.$Revisions;
    }

    return json;
  };
}

export default DominoScope;

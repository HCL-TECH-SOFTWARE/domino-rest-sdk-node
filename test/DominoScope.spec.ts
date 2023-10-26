/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import { AccessLevel } from '../src';
import DominoScope from '../src/DominoScope';
import scp1 from './resources/DominoScope/scp1.json';
import scp2 from './resources/DominoScope/scp2.json';
import scp3 from './resources/DominoScope/scp3.json';
import scpErrnoApiName from './resources/DominoScope/scp_err_noApiName.json';
import scpErrnoNsfPath from './resources/DominoScope/scp_err_noNsfPath.json';
import scpErrnoSchema from './resources/DominoScope/scp_err_noSchema.json';

describe('DominoScope', () => {
  describe('structure', () => {
    describe('@meta', () => {
      it('should return @meta if it is in the given document', () => {
        const sscp = new DominoScope(scp1);
        expect(sscp['@meta']).to.deep.equal(scp1['@meta']);
      });

      it('should be undefined if @meta is not in the given document', () => {
        const sscp = new DominoScope(scp2);
        expect(sscp['@meta']).to.be.undefined;
      });
      it('should be editor if maximumAccessLevel is not in the given document', () => {
        const sscp = new DominoScope(scp2);
        expect(sscp.maximumAccessLevel).equal(AccessLevel.Editor);
      });
    });

    describe('apiName', () => {
      it('should return error when there is no apiName value', () => {
        expect(() => new DominoScope(scpErrnoApiName)).to.throw('Domino scope needs apiName value.');
      });
      it('should return document apiName value', () => {
        const sscp = new DominoScope(scp1);
        expect(sscp.apiName).equal(scp1.apiName);
      });

      it('should update apiName', () => {
        const sscp1 = new DominoScope(scp1);
        const newApiName = 'new_api_name';
        sscp1.apiName = newApiName;
        expect(sscp1.apiName).equal(newApiName);

        const sscp2 = new DominoScope(scp2);
        const newApiName2 = 'Pandora';
        sscp2.apiName = newApiName2;
        expect(sscp2.apiName).equal(newApiName2);
      });
    });

    describe('schemaName', () => {
      it('should return error when there is no schemaName value', () => {
        expect(() => new DominoScope(scpErrnoSchema)).to.throw('Domino scope needs schemaName value.');
      });
      it('should return document schemaName value', () => {
        const sscp = new DominoScope(scp1);
        expect(sscp.schemaName).equal(scp1.schemaName);
      });
      it('should update schemaName', () => {
        const sscp1 = new DominoScope(scp1);
        const newSchema = 'new_schema_name';
        sscp1.schemaName = newSchema;
        expect(sscp1.schemaName).equal(newSchema);

        const sscp2 = new DominoScope(scp2);
        const newchema2 = 'Hercules';
        sscp2.schemaName = newchema2;
        expect(sscp2.schemaName).equal(newchema2);
      });
    });

    describe('nsfPath', () => {
      it('should return error when there is no nsfPath value', () => {
        expect(() => new DominoScope(scpErrnoNsfPath)).to.throw('Domino scope needs nsfPath value.');
      });

      it('should return document nsfPath value', () => {
        const sscp = new DominoScope(scp1);
        expect(sscp.nsfPath).equal(scp1.nsfPath);
      });

      it('should update nsfPath', () => {
        const sscp1 = new DominoScope(scp1);
        const newNsfPath = 'new_nsfPath';
        sscp1.nsfPath = newNsfPath;
        expect(sscp1.nsfPath).equal(newNsfPath);

        const sscp2 = new DominoScope(scp2);
        const newNsfPath2 = 'new_nsfPath2';
        sscp2.nsfPath = newNsfPath2;
        expect(sscp2.nsfPath).equal(newNsfPath2);
      });
    });

    describe('toScopeJson', () => {
      it('should return an object containing only scope body', () => {
        const expected1 = {
          apiName: 'demoapi',
          schemaName: 'demoapi',
          nsfPath: 'Demo.nsf',
          maximumAccessLevel: 'Manager',
          server: '*',
          isActive: true,
          description: 'The famous demo database',
          icon: 'Base64 stuff, preferably SVG',
          iconName: 'beach',
        };
        const sscp1 = new DominoScope(scp1);
        expect(sscp1.toScopeJson()).to.deep.equal(expected1);

        const expected2 = {
          apiName: 'demoapi',
          schemaName: 'demoapi',
          nsfPath: 'Demo.nsf',
          maximumAccessLevel: AccessLevel.Editor,
          server: 'frascati.projectkeep.io',
          isActive: true,
          description: 'The famous demo database',
          icon: 'Base64 stuff, preferably SVG',
          iconName: 'beach',
        };
        const sscp2 = new DominoScope(scp2);
        expect(sscp2.toScopeJson()).to.deep.equal(expected2);

        const expected3 = {
          apiName: 'demoapi',
          icon: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwb2x5Z29uIHN0eWxlPSJmaWxsOiM0Mzk4RDE7IiBwb2ludHM9IjQ2OS4zMzMsMzI0LjI2NyA0Mi42NjcsMzI0LjI2NyA0Mi42NjcsNTkuNzMzIDIzMC40LDU5LjczMyAyMzAuNCwyNS42IDQ2OS4zMzMsMjUuNiAiLz4NCjxyZWN0IHg9IjQyLjY2NyIgeT0iMTI4IiBzdHlsZT0iZmlsbDojREU0QzNDOyIgd2lkdGg9IjQyNi42NjciIGhlaWdodD0iMTQ1LjA2NyIvPg0KPHJlY3QgeD0iNTkuNzMzIiB5PSIyNS42IiBzdHlsZT0iZmlsbDojRkRCNjJGOyIgd2lkdGg9IjUxLjIiIGhlaWdodD0iMzQuMTMzIiAvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzQzOThEMTsiIGQ9Ik04LjUzMywxNjIuMTMzYzAsOS40MjksNy42MzcsMTcuMDY3LDE3LjA2NywxNy4wNjdoMTcuMDY3di0zNC4xMzNIMjUuNiBDMTYuMTcxLDE0NS4wNjcsOC41MzMsMTUyLjcwNCw4LjUzMywxNjIuMTMzeiIgLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiM0Mzk4RDE7IiBkPSJNNDg2LjQsMTQ1LjA2N2gtMTcuMDY3VjE3OS4ySDQ4Ni40YzkuNDI5LDAsMTcuMDY3LTcuNjM3LDE3LjA2Ny0xNy4wNjcgQzUwMy40NjcsMTUyLjcwNCw0OTUuODI5LDE0NS4wNjcsNDg2LjQsMTQ1LjA2N3oiIC8+DQo8cmVjdCB4PSIzODQiIHk9IjU5LjczMyIgc3R5bGU9ImZpbGw6Izg3Q0VEOTsiIHdpZHRoPSI1MS4yIiBoZWlnaHQ9IjM0LjEzMyIvPg0KPGNpcmNsZSBzdHlsZT0iZmlsbDojRTVFNUU1OyIgY3g9IjExOS40NjciIGN5PSIxMjgiIHI9IjE3LjA2NyIvPg0KPHJlY3QgeD0iMTQ1LjA2NyIgeT0iMjUuNiIgc3R5bGU9ImZpbGw6I0ZEQjYyRjsiIHdpZHRoPSI1MS4yIiBoZWlnaHQ9IjM0LjEzMyIvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzQzOThEMTsiIGQ9Ik00MDkuNiwxODAuNzd2LTE4LjYzN2MwLTQuNzEtMy44MjMtOC41MzMtOC41MzMtOC41MzNzLTguNTMzLDMuODIzLTguNTMzLDguNTMzdjE4LjYzNyBjLTEzLjMyOSw0LjcxLTIwLjMxOCwxOS4zMzctMTUuNTk5LDMyLjY2NmM0LjcxLDEzLjMyOSwxOS4zMzcsMjAuMzE4LDMyLjY2NiwxNS41OTljMTMuMzI5LTQuNzE5LDIwLjMxOC0xOS4zMzcsMTUuNTk5LTMyLjY2NiBDNDIyLjYyMiwxODkuMDgyLDQxNi44ODcsMTgzLjM0Nyw0MDkuNiwxODAuNzd6IE00MDEuMDY3LDIxMy4zMzNjLTQuNzEsMC04LjUzMy0zLjgyMy04LjUzMy04LjUzM2MwLTQuNzEsMy44MjMtOC41MzMsOC41MzMtOC41MzMgczguNTMzLDMuODIzLDguNTMzLDguNTMzQzQwOS42LDIwOS41MSw0MDUuNzc3LDIxMy4zMzMsNDAxLjA2NywyMTMuMzMzeiIvPg0KPHJlY3QgeD0iMTYyLjEzMyIgeT0iODUuMzMzIiBzdHlsZT0iZmlsbDojODdDRUQ5OyIgd2lkdGg9IjI1LjYiIGhlaWdodD0iMTcuMDY3Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojQ0ZDRkNGOyIgZD0iTTQwMS4wNjcsNDg2LjRIMzQuMTMzQzE1LjI4Myw0ODYuNCwwLDQ3MS4xMTcsMCw0NTIuMjY3VjE2Mi4xMzNjMC00LjcxLDMuODIzLTguNTMzLDguNTMzLTguNTMzIHM4LjUzMywzLjgyMyw4LjUzMyw4LjUzM3YyOTAuMTMzYzAsOS40MjksNy42MzcsMTcuMDY3LDE3LjA2NywxNy4wNjdoMzY2LjkzM2M5LjQyOSwwLDE3LjA2Ny03LjYzNywxNy4wNjctMTcuMDY3IHMtNy42MzctMTcuMDY3LTE3LjA2Ny0xNy4wNjdoLTIwNC44Yy0xOC44NSwwLTM0LjEzMy0xNS4yODMtMzQuMTMzLTM0LjEzM3MxNS4yODMtMzQuMTMzLDM0LjEzMy0zNC4xMzNoMjgxLjYgYzkuNDI5LDAsMTcuMDY3LTcuNjM3LDE3LjA2Ny0xNy4wNjdWMTYyLjEzM2MwLTQuNzEsMy44MjMtOC41MzMsOC41MzMtOC41MzNjNC43MSwwLDguNTMzLDMuODIzLDguNTMzLDguNTMzdjE4Ny43MzMgYzAsMTguODUtMTUuMjgzLDM0LjEzMy0zNC4xMzMsMzQuMTMzaC0yODEuNmMtOS40MjksMC0xNy4wNjcsNy42MzctMTcuMDY3LDE3LjA2N2MwLDkuNDI5LDcuNjM3LDE3LjA2NywxNy4wNjcsMTcuMDY3aDIwNC44IGMxOC44NSwwLDM0LjEzMywxNS4yODMsMzQuMTMzLDM0LjEzM1M0MTkuOTE3LDQ4Ni40LDQwMS4wNjcsNDg2LjR6Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojNDM5OEQxOyIgZD0iTTE1My42LDE3MC42NjdjLTE0LjE0LDAtMjUuNiwxMS40Ni0yNS42LDI1LjZzMTEuNDYsMjUuNiwyNS42LDI1LjZoMjUuNnYtNTEuMkgxNTMuNnoiLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6I0U1RTVFNTsiIGN4PSIyNTYiIGN5PSIxOTYuMjY3IiByPSI5My44NjciLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6Izg3Q0VEOTsiIGN4PSIyNTYiIGN5PSIxOTYuMjY3IiByPSI1OS43MzMiLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiM3MUM0RDE7IiBkPSJNMjgzLjQyNiwxNDMuMjQxbC04MC40NTIsODAuNDUyYzE1LjEwNCwyOS4zMjksNTEuMTIzLDQwLjg2Niw4MC40NTIsMjUuNzYyIHM0MC44NjYtNTEuMTIzLDI1Ljc2Mi04MC40NTJDMzAzLjQ4OCwxNTcuOTQzLDI5NC40ODUsMTQ4LjkzMiwyODMuNDI2LDE0My4yNDF6Ii8+DQo8L3N2Zz4NCg==',
          iconName: 'beach',
          schemaName: 'demoapi',
          description: '',
          nsfPath: 'Demo.nsf',
          maximumAccessLevel: AccessLevel.Editor,
          isActive: true,
          server: '*',
        };
        const sscp3 = new DominoScope(scp3);
        expect(sscp3.toScopeJson()).to.deep.equal(expected3);
      });
    });

    describe('toJson', () => {
      it('should return an object containing all scope data', () => {
        const sscp1 = new DominoScope(scp1);
        expect(sscp1.toJson()).to.deep.equal(scp1);

        const expected2 = {
          apiName: 'demoapi',
          schemaName: 'demoapi',
          nsfPath: 'Demo.nsf',
          maximumAccessLevel: AccessLevel.Editor,
          server: 'frascati.projectkeep.io',
          isActive: true,
          description: 'The famous demo database',
          icon: 'Base64 stuff, preferably SVG',
          iconName: 'beach',
        };

        const sscp2 = new DominoScope(scp2);
        expect(sscp2.toJson()).to.deep.equal(expected2);

        const expected3 = {
          ['@meta']: {
            noteid: 2394,
            unid: '0EF6DDD8A53754C800258A1B00653B42',
            created: '2023-08-30T18:25:43.06Z',
            lastmodified: '2023-08-30T18:25:43.08Z',
            lastaccessed: '2023-08-30T18:25:43.08Z',
            lastmodifiedinfile: '2023-08-30T18:25:43.09Z',
            addedtofile: '2023-08-30T18:25:43.08Z',
            noteclass: ['DATA', 'DOCUMENT'],
            unread: true,
            editable: true,
            revision: '0000000100653B4400258A1B',
          },
          apiName: 'demoapi',
          description: '',
          icon: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwb2x5Z29uIHN0eWxlPSJmaWxsOiM0Mzk4RDE7IiBwb2ludHM9IjQ2OS4zMzMsMzI0LjI2NyA0Mi42NjcsMzI0LjI2NyA0Mi42NjcsNTkuNzMzIDIzMC40LDU5LjczMyAyMzAuNCwyNS42IDQ2OS4zMzMsMjUuNiAiLz4NCjxyZWN0IHg9IjQyLjY2NyIgeT0iMTI4IiBzdHlsZT0iZmlsbDojREU0QzNDOyIgd2lkdGg9IjQyNi42NjciIGhlaWdodD0iMTQ1LjA2NyIvPg0KPHJlY3QgeD0iNTkuNzMzIiB5PSIyNS42IiBzdHlsZT0iZmlsbDojRkRCNjJGOyIgd2lkdGg9IjUxLjIiIGhlaWdodD0iMzQuMTMzIiAvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzQzOThEMTsiIGQ9Ik04LjUzMywxNjIuMTMzYzAsOS40MjksNy42MzcsMTcuMDY3LDE3LjA2NywxNy4wNjdoMTcuMDY3di0zNC4xMzNIMjUuNiBDMTYuMTcxLDE0NS4wNjcsOC41MzMsMTUyLjcwNCw4LjUzMywxNjIuMTMzeiIgLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiM0Mzk4RDE7IiBkPSJNNDg2LjQsMTQ1LjA2N2gtMTcuMDY3VjE3OS4ySDQ4Ni40YzkuNDI5LDAsMTcuMDY3LTcuNjM3LDE3LjA2Ny0xNy4wNjcgQzUwMy40NjcsMTUyLjcwNCw0OTUuODI5LDE0NS4wNjcsNDg2LjQsMTQ1LjA2N3oiIC8+DQo8cmVjdCB4PSIzODQiIHk9IjU5LjczMyIgc3R5bGU9ImZpbGw6Izg3Q0VEOTsiIHdpZHRoPSI1MS4yIiBoZWlnaHQ9IjM0LjEzMyIvPg0KPGNpcmNsZSBzdHlsZT0iZmlsbDojRTVFNUU1OyIgY3g9IjExOS40NjciIGN5PSIxMjgiIHI9IjE3LjA2NyIvPg0KPHJlY3QgeD0iMTQ1LjA2NyIgeT0iMjUuNiIgc3R5bGU9ImZpbGw6I0ZEQjYyRjsiIHdpZHRoPSI1MS4yIiBoZWlnaHQ9IjM0LjEzMyIvPg0KPHBhdGggc3R5bGU9ImZpbGw6IzQzOThEMTsiIGQ9Ik00MDkuNiwxODAuNzd2LTE4LjYzN2MwLTQuNzEtMy44MjMtOC41MzMtOC41MzMtOC41MzNzLTguNTMzLDMuODIzLTguNTMzLDguNTMzdjE4LjYzNyBjLTEzLjMyOSw0LjcxLTIwLjMxOCwxOS4zMzctMTUuNTk5LDMyLjY2NmM0LjcxLDEzLjMyOSwxOS4zMzcsMjAuMzE4LDMyLjY2NiwxNS41OTljMTMuMzI5LTQuNzE5LDIwLjMxOC0xOS4zMzcsMTUuNTk5LTMyLjY2NiBDNDIyLjYyMiwxODkuMDgyLDQxNi44ODcsMTgzLjM0Nyw0MDkuNiwxODAuNzd6IE00MDEuMDY3LDIxMy4zMzNjLTQuNzEsMC04LjUzMy0zLjgyMy04LjUzMy04LjUzM2MwLTQuNzEsMy44MjMtOC41MzMsOC41MzMtOC41MzMgczguNTMzLDMuODIzLDguNTMzLDguNTMzQzQwOS42LDIwOS41MSw0MDUuNzc3LDIxMy4zMzMsNDAxLjA2NywyMTMuMzMzeiIvPg0KPHJlY3QgeD0iMTYyLjEzMyIgeT0iODUuMzMzIiBzdHlsZT0iZmlsbDojODdDRUQ5OyIgd2lkdGg9IjI1LjYiIGhlaWdodD0iMTcuMDY3Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojQ0ZDRkNGOyIgZD0iTTQwMS4wNjcsNDg2LjRIMzQuMTMzQzE1LjI4Myw0ODYuNCwwLDQ3MS4xMTcsMCw0NTIuMjY3VjE2Mi4xMzNjMC00LjcxLDMuODIzLTguNTMzLDguNTMzLTguNTMzIHM4LjUzMywzLjgyMyw4LjUzMyw4LjUzM3YyOTAuMTMzYzAsOS40MjksNy42MzcsMTcuMDY3LDE3LjA2NywxNy4wNjdoMzY2LjkzM2M5LjQyOSwwLDE3LjA2Ny03LjYzNywxNy4wNjctMTcuMDY3IHMtNy42MzctMTcuMDY3LTE3LjA2Ny0xNy4wNjdoLTIwNC44Yy0xOC44NSwwLTM0LjEzMy0xNS4yODMtMzQuMTMzLTM0LjEzM3MxNS4yODMtMzQuMTMzLDM0LjEzMy0zNC4xMzNoMjgxLjYgYzkuNDI5LDAsMTcuMDY3LTcuNjM3LDE3LjA2Ny0xNy4wNjdWMTYyLjEzM2MwLTQuNzEsMy44MjMtOC41MzMsOC41MzMtOC41MzNjNC43MSwwLDguNTMzLDMuODIzLDguNTMzLDguNTMzdjE4Ny43MzMgYzAsMTguODUtMTUuMjgzLDM0LjEzMy0zNC4xMzMsMzQuMTMzaC0yODEuNmMtOS40MjksMC0xNy4wNjcsNy42MzctMTcuMDY3LDE3LjA2N2MwLDkuNDI5LDcuNjM3LDE3LjA2NywxNy4wNjcsMTcuMDY3aDIwNC44IGMxOC44NSwwLDM0LjEzMywxNS4yODMsMzQuMTMzLDM0LjEzM1M0MTkuOTE3LDQ4Ni40LDQwMS4wNjcsNDg2LjR6Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojNDM5OEQxOyIgZD0iTTE1My42LDE3MC42NjdjLTE0LjE0LDAtMjUuNiwxMS40Ni0yNS42LDI1LjZzMTEuNDYsMjUuNiwyNS42LDI1LjZoMjUuNnYtNTEuMkgxNTMuNnoiLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6I0U1RTVFNTsiIGN4PSIyNTYiIGN5PSIxOTYuMjY3IiByPSI5My44NjciLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6Izg3Q0VEOTsiIGN4PSIyNTYiIGN5PSIxOTYuMjY3IiByPSI1OS43MzMiLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiM3MUM0RDE7IiBkPSJNMjgzLjQyNiwxNDMuMjQxbC04MC40NTIsODAuNDUyYzE1LjEwNCwyOS4zMjksNTEuMTIzLDQwLjg2Niw4MC40NTIsMjUuNzYyIHM0MC44NjYtNTEuMTIzLDI1Ljc2Mi04MC40NTJDMzAzLjQ4OCwxNTcuOTQzLDI5NC40ODUsMTQ4LjkzMiwyODMuNDI2LDE0My4yNDF6Ii8+DQo8L3N2Zz4NCg==',
          iconName: 'beach',
          schemaName: 'demoapi',
          nsfPath: 'Demo.nsf',
          maximumAccessLevel: AccessLevel.Editor,
          Form: 'KeepDatabase',
          Type: 'KeepDatabase',
          server: '*',
          isActive: true,
          $UpdatedBy: ['CN=E2E Admin/O=KeepE2E'],
          $Revisions: '2023-03-31T11:37:50.45Z',
        };

        const sscp3 = new DominoScope(scp3);
        expect(sscp3.toJson()).to.deep.equal(expected3);
      });
    });
  });
});

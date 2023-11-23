/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import { AccessLevel, EmptyParamError } from '../src';
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
        expect(() => new DominoScope(scpErrnoApiName)).to.throw(EmptyParamError);
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
        expect(() => new DominoScope(scpErrnoSchema)).to.throw(EmptyParamError);
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
        expect(() => new DominoScope(scpErrnoNsfPath)).to.throw(EmptyParamError);
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
          maximumAccessLevel: AccessLevel.Manager,
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
          icon: undefined,
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
          icon: undefined,
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

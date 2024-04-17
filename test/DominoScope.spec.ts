/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import { AccessLevel, EmptyParamError, MissingParamError } from '../src/index.js';
import DominoScope from '../src/DominoScope.js';

describe('DominoScope', () => {
  const scp1 = JSON.parse(fs.readFileSync('./test/resources/DominoScope/scp1.json', 'utf-8'));
  const scp2 = JSON.parse(fs.readFileSync('./test/resources/DominoScope/scp2.json', 'utf-8'));
  const scp3 = JSON.parse(fs.readFileSync('./test/resources/DominoScope/scp3.json', 'utf-8'));

  describe('constructor', () => {
    let scope: any;

    beforeEach(() => {
      scope = JSON.parse(JSON.stringify(scp1));
    });

    it(`should create a 'DominoScope' object`, () => {
      const dominoScope = new DominoScope(scope);
      expect(dominoScope).to.instanceOf(DominoScope);
      expect(dominoScope.$Revisions).to.be.undefined;
      expect(dominoScope.$UpdatedBy).to.deep.equal(scp1.$UpdatedBy);
      expect(dominoScope['@meta']).to.deep.equal(scp1['@meta']);
      expect(dominoScope.Form).to.equal(scp1.Form);
      expect(dominoScope.Type).to.equal(scp1.Type);
      expect(dominoScope.apiName).to.equal(scp1.apiName);
      expect(dominoScope.description).to.equal(scp1.description);
      expect(dominoScope.icon).to.equal(scp1.icon);
      expect(dominoScope.iconName).to.equal(scp1.iconName);
      expect(dominoScope.isActive).to.equal(scp1.isActive);
      expect(dominoScope.maximumAccessLevel).to.equal(scp1.maximumAccessLevel);
      expect(dominoScope.nsfPath).to.equal(scp1.nsfPath);
      expect(dominoScope.schemaName).to.equal(scp1.schemaName);
      expect(dominoScope.server).to.equal(scp1.server);
    });

    it(`should handle default values for parameters that can be 'undefined'`, () => {
      delete scope.description;
      delete scope.iconName;
      delete scope.isActive;
      delete scope.maximumAccessLevel;
      delete scope.server;
      const dominoScope = new DominoScope(scope);
      expect(dominoScope.description).to.equal('');
      expect(dominoScope.iconName).to.equal('beach');
      expect(dominoScope.isActive).to.be.true;
      expect(dominoScope.maximumAccessLevel).to.equal(AccessLevel.Editor);
      expect(dominoScope.server).to.equal('*');
    });

    it(`should throw an error if 'apiName' is missing`, () => {
      delete scope.apiName;
      expect(() => new DominoScope(scope)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'apiName' is empty`, () => {
      scope.apiName = '';
      expect(() => new DominoScope(scope)).to.throw(EmptyParamError);
    });

    it(`should throw an error if 'schemaName' is missing`, () => {
      delete scope.schemaName;
      expect(() => new DominoScope(scope)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'schemaName' is empty`, () => {
      scope.schemaName = '';
      expect(() => new DominoScope(scope)).to.throw(EmptyParamError);
    });

    it(`should throw an error if 'nsfPath' is missing`, () => {
      delete scope.nsfPath;
      expect(() => new DominoScope(scope)).to.throw(MissingParamError);
    });

    it(`should throw an error if 'nsfPath' is empty`, () => {
      scope.nsfPath = '';
      expect(() => new DominoScope(scope)).to.throw(EmptyParamError);
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

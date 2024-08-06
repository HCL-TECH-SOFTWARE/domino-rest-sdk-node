/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import DominoConnector from '../src/DominoConnector.js';
import DominoListViewOperations from '../src/DominoListViewOperations.js';
import DominoScopeOperations from '../src/DominoScopeOperations.js';
import {
  CredentialType,
  DominoAccess,
  DominoApiMeta,
  DominoRestConnector,
  DominoRestServer,
  DominoServer,
  DominoSetupSession,
  SortType,
} from '../src/index.js';

const fakeCredentials = {
  baseUrl: 'somewhere',
  credentials: {
    scope: '',
    type: CredentialType.BASIC,
    username: 'fakeUsername',
    password: 'fakePassword',
  },
};

describe('DominoSetupSession', async () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoRestConnector;
  let dss: DominoSetupSession;
  let baseParameters: Array<any> = [];
  let additionalParameters: Array<any> = [];
  let stub: sinon.SinonStub<any, Promise<any>>;

  beforeEach(async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));

    dc = await DominoConnector.getConnector('http://localhost:8880', {} as DominoApiMeta);
    dss = new DominoSetupSession(fakeToken, dc);
    baseParameters = [];
    additionalParameters = [];

    fetchStub.restore();
  });

  afterEach(() => {
    if (stub) {
      expect(stub.callCount).to.be.equal(1);
      expect(stub.getCall(0).args).to.deep.equal([...baseParameters, ...additionalParameters]);
      stub.restore();
    }
  });

  describe('getSetupSession', () => {
    const apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));

    let dominoServer: DominoRestServer;
    let dominoServerStub: sinon.SinonStub<[apiName: string], Promise<DominoRestConnector>>;

    beforeEach(async () => {
      const fetchStub = sinon.stub(global, 'fetch');
      fetchStub.onFirstCall().resolves(new Response(JSON.stringify(apiDefinitions)));
      dominoServer = await DominoServer.getServer('http://localhost:8880');
      dominoServerStub = sinon.stub(dominoServer, 'getDominoConnector');
      dominoServerStub.resolves(dc);
      fetchStub.restore();
    });

    afterEach(() => {
      dominoServerStub.restore();
    });

    it(`should return a 'DominoSetupSession' object`, async () => {
      const dominoSetupSession = await DominoSetupSession.getSetupSession(fakeToken, dominoServer);
      expect(dominoServerStub.args[0][0]).to.equal('setup');
      expect(dominoSetupSession).to.be.instanceOf(DominoSetupSession);
    });

    it(`should throw an error if something fails when fetching 'DominoConnector'`, async () => {
      dominoServerStub.rejects(new Error(`Error retrieving 'DominoConnector'.`));
      await expect(DominoSetupSession.getSetupSession(fakeToken, dominoServer)).to.be.rejectedWith(`Error retrieving 'DominoConnector'.`);
    });
  });

  describe('Calls DominoScopeOperations methods', () => {
    const scopeName = 'myScope';
    const scopeJson = {
      apiName: 'demoapi',
      createSchema: false,
      description: 'The famous demo database!!!!',
      icon: 'Base64 stuff, preferably SVG',
      iconName: 'beach',
      isActive: true,
      maximumAccessLevel: 'Manager',
      nsfPath: 'Demo.nsf',
      schemaName: 'demoapi',
      server: '*',
    };

    afterEach(() => {
      additionalParameters = [...additionalParameters, fakeToken, dc];
    });

    describe('createUpdateScope', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoScopeOperations, 'createUpdateScope');
      });

      it('should get called', async () => {
        additionalParameters = [scopeJson];

        await dss.createUpdateScope(scopeJson);
      });
    });

    describe('getScope', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoScopeOperations, 'getScope');
      });

      it('should get called', async () => {
        additionalParameters = [scopeName];

        await dss.getScope(scopeName);
      });
    });

    describe('getScopes', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoScopeOperations, 'getScopes');
      });

      it('should get called', async () => {
        await dss.getScopes();
      });
    });

    describe('deleteScope', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoScopeOperations, 'deleteScope');
      });

      it('should get called', async () => {
        additionalParameters = [scopeName];

        await dss.deleteScope(scopeName);
      });
    });
  });

  describe('Calls DominoListViewOperations methods', () => {
    const dataSource = 'myScope';
    const listViewName = 'NewEntryView';
    const listViewJsonData = {
      columns: [
        {
          formula: 'email',
          name: 'email',
          separatemultiplevalues: false,
          sort: SortType.Ascending,
          title: 'email',
        },
        {
          formula: 'name',
          name: 'name',
          separatemultiplevalues: false,
          sort: SortType.Ascending,
          title: 'name',
        },
      ],
      name: 'newentries',
      selectionFormula: 'Form = "NewEntry"',
    };

    beforeEach(() => {
      baseParameters = [dataSource, fakeToken, dc];
    });

    describe('createUpdateListView', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'createUpdateListView');
      });

      it('should get called', async () => {
        additionalParameters = [listViewJsonData, listViewName, undefined];

        await dss.createUpdateListView(dataSource, listViewJsonData, listViewName);
      });
    });

    describe('getListView', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListView');
      });

      it('should get called', async () => {
        additionalParameters = [listViewName, undefined];
        await dss.getListView(dataSource, listViewName);
      });
    });
  });
});

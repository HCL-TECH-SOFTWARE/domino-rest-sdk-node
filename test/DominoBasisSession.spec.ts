/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import DominoConnector from '../src/DominoConnector.js';
import DominoDocument from '../src/DominoDocument.js';
import DominoListViewOperations from '../src/DominoListViewOperations.js';
import {
  CredentialType,
  DominoAccess,
  DominoApiMeta,
  DominoBasisSession,
  DominoDocumentOperations,
  DominoServer,
  QueryActions,
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

describe('DominoBasisSession', async () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoConnector;
  let dbs: DominoBasisSession;
  let baseParameters: Array<any> = [];
  let additionalParameters: Array<any> = [];
  let stub: sinon.SinonStub<any, Promise<any>>;

  beforeEach(async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));

    dc = await DominoConnector.getConnector('http://localhost:8880', {} as DominoApiMeta);
    dbs = new DominoBasisSession(fakeToken, dc);
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

  describe('getBasisSession', () => {
    const apiDefinitions = JSON.parse(fs.readFileSync('./test/resources/apidefinitions.json', 'utf-8'));

    let dominoServer: DominoServer;
    let dominoServerStub: sinon.SinonStub<[apiName: string], Promise<DominoConnector>>;

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

    it(`should return a 'DominoBasisSession' object`, async () => {
      const dominoBasisSession = await DominoBasisSession.getBasisSession(fakeToken, dominoServer);
      expect(dominoServerStub.args[0][0]).to.equal('basis');
      expect(dominoBasisSession).to.be.instanceOf(DominoBasisSession);
    });

    it(`should throw an error if something fails when fetching 'DominoConnector'`, async () => {
      dominoServerStub.rejects(new Error(`Error retrieving 'DominoConnector'.`));
      await expect(DominoBasisSession.getBasisSession(fakeToken, dominoServer)).to.be.rejectedWith(`Error retrieving 'DominoConnector'.`);
    });
  });

  describe('Calls DominoDocumentOperations methods', () => {
    const dataSource = 'myScope';
    const unid = 'myUNID';
    const unids = [unid, unid, unid];
    const mode = 'myMode';
    const docJson = {
      name: 'Pol',
      Form: 'customers',
    };
    const doc = new DominoDocument(docJson);
    const docs = [doc, doc, doc];

    beforeEach(() => {
      baseParameters = [dataSource, fakeToken, dc];
    });

    describe('getDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'getDocument');
      });

      it('should get called', async () => {
        additionalParameters = [unid, undefined];

        await dbs.getDocument(dataSource, unid);
      });

      it('should get called with options', async () => {
        const options = {
          computeWithForm: true,
          meta: false,
        };
        additionalParameters = [unid, options];

        await dbs.getDocument(dataSource, unid, options);
      });
    });

    describe('createDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'createDocument');
      });

      it('should get called', async () => {
        additionalParameters = [docJson, undefined];

        await dbs.createDocument(dataSource, docJson);
      });

      it('should get called with options', async () => {
        const options = {
          parentUnid: 'UNID_00',
        };
        additionalParameters = [docJson, options];

        await dbs.createDocument(dataSource, docJson, options);
      });
    });

    describe('updateDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'updateDocument');
      });

      it('should get called', async () => {
        additionalParameters = [doc, undefined];

        await dbs.updateDocument(dataSource, doc);
      });

      it('should get called with options', async () => {
        const options = {
          computeWithForm: true,
          mode: 'myMode',
        };
        additionalParameters = [doc, options];

        await dbs.updateDocument(dataSource, doc, options);
      });
    });

    describe('patchDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'patchDocument');
      });

      it('should get called', async () => {
        additionalParameters = [unid, docJson, undefined];

        await dbs.patchDocument(dataSource, unid, docJson);
      });

      it('should get called with options', async () => {
        const options = {
          computeWithForm: true,
          mode: 'myMode',
        };
        additionalParameters = [unid, docJson, options];

        await dbs.patchDocument(dataSource, unid, docJson, options);
      });
    });

    describe('deleteDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'deleteDocument');
      });

      it('should get called', async () => {
        additionalParameters = [doc, undefined];

        await dbs.deleteDocument(dataSource, doc);
      });

      it('should get called with mode', async () => {
        additionalParameters = [doc, mode];

        await dbs.deleteDocument(dataSource, doc, mode);
      });
    });

    describe('deleteDocumentByUNID', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'deleteDocumentByUNID');
      });

      it('should get called', async () => {
        additionalParameters = [unid, undefined];

        await dbs.deleteDocumentByUNID(dataSource, unid);
      });

      it('should get called with mode', async () => {
        additionalParameters = [unid, mode];

        await dbs.deleteDocumentByUNID(dataSource, unid, mode);
      });
    });

    describe('bulkGetDocuments', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkGetDocuments');
      });

      it('should get called', async () => {
        additionalParameters = [unids, undefined];

        await dbs.bulkGetDocuments(dataSource, unids);
      });

      it('should get called with options', async () => {
        const options = {
          meta: false,
        };
        additionalParameters = [unids, options];

        await dbs.bulkGetDocuments(dataSource, unids, options);
      });
    });

    describe('bulkCreateDocuments', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkCreateDocuments');
      });

      it('should get called', async () => {
        additionalParameters = [docs, undefined];

        await dbs.bulkCreateDocuments(dataSource, docs);
      });

      it('should get called with richTextAs', async () => {
        const richTextAs = "html";
        additionalParameters = [docs, richTextAs];

        await dbs.bulkCreateDocuments(dataSource, docs, richTextAs);
      });
    });

    describe('bulkUpdateDocumentsByQuery', () => {
      const request = {
        query: "form = 'Customer' and name = 'Alien'",
        replaceItems: {
          category: ['Friendly'],
        },
      };

      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkUpdateDocumentsByQuery');
      });

      it('should get called', async () => {
        additionalParameters = [request, undefined];

        await dbs.bulkUpdateDocumentsByQuery(dataSource, request);
      });

      it('should get called with richTextAs', async () => {
        const richTextAs = "html";
        additionalParameters = [request, richTextAs];

        await dbs.bulkUpdateDocumentsByQuery(dataSource, request, richTextAs);
      });
    });

    describe('getDocumentsByQuery', () => {
      const request = {
        query: "form = 'Customer' and name = 'Alien'",
      };

      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'getDocumentsByQuery');
      });

      it('should get called', async () => {
        additionalParameters = [request, QueryActions.EXECUTE, undefined];

        await dbs.getDocumentsByQuery(dataSource, request, QueryActions.EXECUTE);
      });
    });

    describe('bulkDeleteDocuments', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkDeleteDocuments');
      });

      it('should get called', async () => {
        additionalParameters = [docs, undefined];

        await dbs.bulkDeleteDocuments(dataSource, docs);
      });

      it('should get called with mode', async () => {
        additionalParameters = [docs, mode];

        await dbs.bulkDeleteDocuments(dataSource, docs, mode);
      });
    });

    describe('bulkDeleteDocumentsByUNID', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkDeleteDocumentsByUNID');
      });

      it('should get called', async () => {
        additionalParameters = [unids, undefined];

        await dbs.bulkDeleteDocumentsByUNID(dataSource, unids);
      });

      it('should get called with mode', async () => {
        additionalParameters = [unids, mode];

        await dbs.bulkDeleteDocumentsByUNID(dataSource, unids, mode);
      });
    });
  });

  describe('Calls DominoListViewOperations methods', () => {
    const dataSource = 'myScope';
    const listViewName = 'NewEntryView';

    beforeEach(() => {
      baseParameters = [dataSource, fakeToken, dc];
    });

    describe('getListViews', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListViews');
      });

      it('should get called', async () => {
        additionalParameters = [undefined];
        await dbs.getListViews(dataSource);
      });
    });

    describe('getListViewEntry', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListViewEntry');
      });

      it('should get called', async () => {
        additionalParameters = [listViewName, undefined];
        await dbs.getListViewEntry(dataSource, listViewName);
      });
    });

    describe('getListViewPivotEntry', () => {
      const pivotColumn = 'Color';
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListViewPivotEntry');
      });

      it('should get called', async () => {
        additionalParameters = [listViewName, pivotColumn, undefined];
        await dbs.getListViewPivotEntry(dataSource, listViewName, pivotColumn);
      });
    });
  });
});

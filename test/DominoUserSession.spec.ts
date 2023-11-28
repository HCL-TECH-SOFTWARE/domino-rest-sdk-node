/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import {
  CredentialType,
  DominoAccess,
  DominoApiMeta,
  DominoDocumentOperations,
  DominoUserSession,
  QueryActions,
  RichTextRepresentation,
  SortType,
} from '../src';
import DominoConnector from '../src/DominoConnector';
import DominoDocument from '../src/DominoDocument';
import DominoListViewOperations from '../src/DominoListViewOperations';
import DominoScopeOperations from '../src/DominoScopeOperations';

const fakeCredentials = {
  baseUrl: 'somewhere',
  credentials: {
    scope: '',
    type: CredentialType.BASIC,
    username: 'fakeUsername',
    password: 'fakePassword',
  },
};

describe('DominoUserSession', async () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoConnector;
  let dus: DominoUserSession;
  let baseParameters: Array<any> = [];
  let additionalParameters: Array<any> = [];
  let stub: sinon.SinonStub<any, Promise<any>>;

  it('should call DominoConnector request', async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));

    dc = await DominoConnector.getConnector('http://localhost:8880', {} as DominoApiMeta);
    const dcRequestStub = sinon.stub(dc, 'request');
    dcRequestStub.resolves({ status: 0, headers: new Headers(), dataStream: new ReadableStream() });
    dus = new DominoUserSession(fakeToken, dc);

    const response = await dus.request('operation', { params: new Map() });
    expect(dcRequestStub.callCount).equal(1);
    expect(response).to.exist;
    expect(dcRequestStub.getCall(0).args).to.deep.equal([dus.dominoAccess, 'operation', { params: new Map() }]);

    fetchStub.restore();
  });

  beforeEach(() => {
    baseParameters = [];
    additionalParameters = [];
  });

  afterEach(() => {
    if (stub) {
      expect(stub.callCount).to.be.equal(1);
      expect(stub.getCall(0).args).to.deep.equal([...baseParameters, ...additionalParameters]);
      stub.restore();
    }
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

        await dus.getDocument(dataSource, unid);
      });

      it('should get called with options', async () => {
        const options = {
          computeWithForm: true,
          meta: false,
        };
        additionalParameters = [unid, options];

        await dus.getDocument(dataSource, unid, options);
      });
    });

    describe('createDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'createDocument');
      });

      it('should get called', async () => {
        additionalParameters = [docJson, undefined];

        await dus.createDocument(dataSource, docJson);
      });

      it('should get called with options', async () => {
        const options = {
          parentUnid: 'UNID_00',
        };
        additionalParameters = [docJson, options];

        await dus.createDocument(dataSource, docJson, options);
      });
    });

    describe('updateDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'updateDocument');
      });

      it('should get called', async () => {
        additionalParameters = [doc, undefined];

        await dus.updateDocument(dataSource, doc);
      });

      it('should get called with options', async () => {
        const options = {
          computeWithForm: true,
          mode: 'myMode',
        };
        additionalParameters = [doc, options];

        await dus.updateDocument(dataSource, doc, options);
      });
    });

    describe('patchDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'patchDocument');
      });

      it('should get called', async () => {
        additionalParameters = [unid, docJson, undefined];

        await dus.patchDocument(dataSource, unid, docJson);
      });

      it('should get called with options', async () => {
        const options = {
          computeWithForm: true,
          mode: 'myMode',
        };
        additionalParameters = [unid, docJson, options];

        await dus.patchDocument(dataSource, unid, docJson, options);
      });
    });

    describe('deleteDocument', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'deleteDocument');
      });

      it('should get called', async () => {
        additionalParameters = [doc, undefined];

        await dus.deleteDocument(dataSource, doc);
      });

      it('should get called with mode', async () => {
        additionalParameters = [doc, mode];

        await dus.deleteDocument(dataSource, doc, mode);
      });
    });

    describe('deleteDocumentByUNID', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'deleteDocumentByUNID');
      });

      it('should get called', async () => {
        additionalParameters = [unid, undefined];

        await dus.deleteDocumentByUNID(dataSource, unid);
      });

      it('should get called with mode', async () => {
        additionalParameters = [unid, mode];

        await dus.deleteDocumentByUNID(dataSource, unid, mode);
      });
    });

    describe('bulkGetDocuments', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkGetDocuments');
      });

      it('should get called', async () => {
        additionalParameters = [unids, undefined];

        await dus.bulkGetDocuments(dataSource, unids);
      });

      it('should get called with options', async () => {
        const options = {
          meta: false,
        };
        additionalParameters = [unids, options];

        await dus.bulkGetDocuments(dataSource, unids, options);
      });
    });

    describe('bulkCreateDocuments', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkCreateDocuments');
      });

      it('should get called', async () => {
        additionalParameters = [docs, undefined];

        await dus.bulkCreateDocuments(dataSource, docs);
      });

      it('should get called with richTextAs', async () => {
        const richTextAs = RichTextRepresentation.HTML;
        additionalParameters = [docs, richTextAs];

        await dus.bulkCreateDocuments(dataSource, docs, richTextAs);
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

        await dus.bulkUpdateDocumentsByQuery(dataSource, request);
      });

      it('should get called with richTextAs', async () => {
        const richTextAs = RichTextRepresentation.HTML;
        additionalParameters = [request, richTextAs];

        await dus.bulkUpdateDocumentsByQuery(dataSource, request, richTextAs);
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

        await dus.getDocumentsByQuery(dataSource, request, QueryActions.EXECUTE);
      });
    });

    describe('bulkDeleteDocuments', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkDeleteDocuments');
      });

      it('should get called', async () => {
        additionalParameters = [docs, undefined];

        await dus.bulkDeleteDocuments(dataSource, docs);
      });

      it('should get called with mode', async () => {
        additionalParameters = [docs, mode];

        await dus.bulkDeleteDocuments(dataSource, docs, mode);
      });
    });

    describe('bulkDeleteDocumentsByUNID', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoDocumentOperations, 'bulkDeleteDocumentsByUNID');
      });

      it('should get called', async () => {
        additionalParameters = [unids, undefined];

        await dus.bulkDeleteDocumentsByUNID(dataSource, unids);
      });

      it('should get called with mode', async () => {
        additionalParameters = [unids, mode];

        await dus.bulkDeleteDocumentsByUNID(dataSource, unids, mode);
      });
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

        await dus.createUpdateScope(scopeJson);
      });
    });

    describe('getScope', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoScopeOperations, 'getScope');
      });

      it('should get called', async () => {
        additionalParameters = [scopeName];

        await dus.getScope(scopeName);
      });
    });

    describe('getScopes', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoScopeOperations, 'getScopes');
      });

      it('should get called', async () => {
        await dus.getScopes();
      });
    });

    describe('deleteScope', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoScopeOperations, 'deleteScope');
      });

      it('should get called', async () => {
        additionalParameters = [scopeName];

        await dus.deleteScope(scopeName);
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

        await dus.createUpdateListView(dataSource, listViewJsonData, listViewName);
      });
    });

    describe('getListViews', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListViews');
      });

      it('should get called', async () => {
        additionalParameters = [undefined];
        await dus.getListViews(dataSource);
      });
    });

    describe('getListViewEntry', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListViewEntry');
      });

      it('should get called', async () => {
        additionalParameters = [listViewName, undefined];
        await dus.getListViewEntry(dataSource, listViewName);
      });
    });

    describe('getListViewPivotEntry', () => {
      const pivotColumn = 'Color';
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListViewPivotEntry');
      });

      it('should get called', async () => {
        additionalParameters = [listViewName, pivotColumn, undefined];
        await dus.getListViewPivotEntry(dataSource, listViewName, pivotColumn);
      });
    });

    describe('getListView', () => {
      beforeEach(() => {
        stub = sinon.stub(DominoListViewOperations, 'getListView');
      });

      it('should get called', async () => {
        additionalParameters = [listViewName, undefined];
        await dus.getListView(dataSource, listViewName);
      });
    });
  });
});

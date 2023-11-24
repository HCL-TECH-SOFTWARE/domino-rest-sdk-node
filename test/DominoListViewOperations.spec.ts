import { transformToRequestResponse } from './helpers/transformToRequestResponse';
/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import {
  CredentialType,
  DesignOptions,
  DominoAccess,
  DominoApiMeta,
  DominoRequestOptions,
  EmptyParamError,
  GetListPivotViewEntryOptions,
  GetListViewEntryOptions,
  GetListViewOptions,
  HttpResponseError,
  ListViewBody,
  NoResponseBody,
  SortType,
} from '../src';
import DominoConnector, { DominoRequestResponse } from '../src/DominoConnector';
import DominoDocument from '../src/DominoDocument';
import DominoListView from '../src/DominoListView';
import DominoListViewOperations from '../src/DominoListViewOperations';
import docResponse from './resources/DominoDocumentOperations/doc_response.json';
import create_dlv1_response from './resources/DominoListView/create_dlv1_response.json';
import dlv1_response from './resources/DominoListView/dlv1_response.json';
import lv1_response from './resources/DominoListView/lv1_response.json';
import lve1_response from './resources/DominoListView/lve1_response.json';
import lvpe1_response from './resources/DominoListView/lvpe1_response.json';

describe('DominoListViewOperations', async () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const dataSource = 'demoapi';
  const listViewName = 'Customers';
  const fakeCredentials = {
    baseUrl: 'somewhere',
    credentials: {
      scope: '',
      type: CredentialType.BASIC,
      username: 'fakeUsername',
      password: 'fakePassword',
    },
  };
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoConnector;
  let operationId: string;
  let expectedParams: Map<string, any>;
  let expectedOptions: DominoRequestOptions;
  let dcRequestStub: sinon.SinonStub<
    [dominoAccess: DominoAccess, operationId: string, options: DominoRequestOptions],
    Promise<DominoRequestResponse>
  >;

  beforeEach(async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().resolves(new Response(JSON.stringify(baseApi)));

    dc = await DominoConnector.getConnector('http://localhost:8880', {} as DominoApiMeta);
    dcRequestStub = sinon.stub(dc, 'request');
    expectedParams = new Map();
    expectedOptions = {
      dataSource,
      params: expectedParams,
    };

    fetchStub.restore();
  });

  afterEach(() => {
    if (dcRequestStub.called) {
      expect(dcRequestStub.callCount).equal(1);
      expect(dcRequestStub.getCall(0).args[0]).to.deep.equal(fakeToken);
      expect(dcRequestStub.getCall(0).args[1]).to.be.equal(operationId);
      expect(dcRequestStub.getCall(0).args[2]).to.deep.equal(expectedOptions);
    }
    dcRequestStub.restore();
  });

  describe('getListViewEntry', () => {
    beforeEach(() => {
      operationId = 'fetchViewEntries';
      dcRequestStub.resolves(transformToRequestResponse(lve1_response));
    });

    it('should be able to execute operation', async () => {
      expectedParams.set('name', listViewName);

      const response = await DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, listViewName);
      expect(response).to.exist;
      expect(response.length).to.equal(50);
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('name', listViewName);
      expectedParams.set('mode', 'default');
      expectedParams.set('meta', true);
      expectedParams.set('startsWith', 'startWithThis');
      expectedParams.set('metaAdditional', true);
      expectedParams.set('category', ['sampleCategorizedColumn']);
      expectedParams.set('start', 1);

      const options: GetListViewEntryOptions = {
        mode: 'default',
        meta: true,
        startsWith: 'startWithThis',
        metaAdditional: true,
        category: ['sampleCategorizedColumn'],
        start: 1,
      };
      const response = await DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, listViewName, options);
      expect(response).to.exist;
      expect(response.length).to.equal(50);
    });

    it(`should be able to return 'DominoDocument' if 'documents' in options is 'true'`, async () => {
      dcRequestStub.resolves(transformToRequestResponse([docResponse, docResponse, docResponse, docResponse, docResponse]));
      expectedParams.set('name', listViewName);
      expectedParams.set('documents', true);

      const options = {
        documents: true,
      };
      const response = await DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, listViewName, options);
      expect(response).to.exist;
      expect(response.length).to.equal(5);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoListViewOperations.getListViewEntry('', fakeToken, dc, listViewName)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'listViewName' is empty`, async () => {
      await expect(DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, '')).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('name', listViewName);

      await expect(DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, listViewName)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('getListViewPivotEntry', () => {
    const pivotColumn = 'Color';

    beforeEach(() => {
      operationId = 'pivotViewEntries';
      dcRequestStub.resolves(transformToRequestResponse(lvpe1_response));
    });

    it('should be able to execute operation', async () => {
      expectedParams.set('name', listViewName);
      expectedParams.set('pivotColumn', pivotColumn);

      const response = await DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, listViewName, pivotColumn);
      expect(response).to.exist;
      expect(Object.keys(response).length).to.equal(28);
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('name', listViewName);
      expectedParams.set('pivotColumn', pivotColumn);
      expectedParams.set('mode', 'default');
      expectedParams.set('startsWith', 'startWithThis');
      expectedParams.set('start', 1);

      const options: GetListPivotViewEntryOptions = {
        mode: 'default',
        startsWith: 'startWithThis',
        start: 1,
      };
      const response = await DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, listViewName, pivotColumn, options);
      expect(response).to.exist;
      // TO DO Need to check this based on the parameters
      expect(Object.keys(response).length).to.equal(28);
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoListViewOperations.getListViewPivotEntry('', fakeToken, dc, listViewName, pivotColumn)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'listViewName' is empty`, async () => {
      await expect(DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, '', pivotColumn)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'pivotColumn' is empty`, async () => {
      await expect(DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, listViewName, '')).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('name', listViewName);
      expectedParams.set('pivotColumn', pivotColumn);

      await expect(DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, listViewName, pivotColumn)).to.be.rejectedWith(
        'Execute operation error.',
      );
    });
  });

  describe('getListViews', () => {
    beforeEach(() => {
      operationId = 'fetchViews';
      dcRequestStub.resolves(transformToRequestResponse(lv1_response));
    });

    it('should be able to execute operation', async () => {
      const response = await DominoListViewOperations.getListViews(dataSource, fakeToken, dc);
      expect(response).to.exist;
      expect(response.length).to.be.equal(7);
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('type', 'all');
      expectedParams.set('columns', true);

      const options: GetListViewOptions = {
        type: 'all',
        columns: true,
      };
      const response = await DominoListViewOperations.getListViews(dataSource, fakeToken, dc, options);
      expect(response).to.exist;
      expect(response.length).to.be.equal(7);
    });

    it(`should throw an error if given 'dataSource' is empty`, async () => {
      await expect(DominoListViewOperations.getListViews('', fakeToken, dc)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoListViewOperations.getListViews(dataSource, fakeToken, dc)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('createUpdateListView', () => {
    const listViewObject = {
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
    const lv1 = new DominoListView(listViewObject);

    beforeEach(() => {
      operationId = 'updateCreateDesign';
      dcRequestStub.resolves(transformToRequestResponse(create_dlv1_response));
      expectedOptions.body = JSON.stringify(lv1.toListViewJson());
    });

    it('should be able to execute operation', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');

      const response = await DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, listViewObject, listViewName);
      expect(response).to.exist;
      expect(response.success).to.true;
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');
      expectedParams.set('raw', true);
      expectedParams.set('nsfPath', 'Demo.nsf');

      const options: DesignOptions = {
        raw: true,
        // TODO: Might be deprecated. Need to test if nsfPath and dataSource are given together maybe on 1.0.9.
        nsfPath: 'Demo.nsf',
      };
      const response = await DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, listViewObject, listViewName, options);
      expect(response).to.exist;
      expect(response.success).to.true;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoListViewOperations.createUpdateListView('', fakeToken, dc, listViewObject, listViewName)).to.be.rejectedWith(
        EmptyParamError,
      );
    });

    it(`should throw an error if 'listView' is empty`, async () => {
      await expect(DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, {} as ListViewBody, listViewName)).to.be.rejectedWith(
        EmptyParamError,
      );
    });

    it(`should throw an error if 'designName' is empty`, async () => {
      await expect(DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, listViewObject, '')).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');

      await expect(DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, listViewObject, listViewName)).to.be.rejectedWith(
        'Execute operation error.',
      );
    });
  });

  describe('getListView', () => {
    beforeEach(() => {
      operationId = 'getDesign';
      dcRequestStub.resolves(transformToRequestResponse(dlv1_response));
    });

    it('should be able to execute operation', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');

      const response = await DominoListViewOperations.getListView(dataSource, fakeToken, dc, listViewName);
      expect(response).to.exist;
      expect(response['@unid']).to.exist;
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');
      expectedParams.set('raw', true);
      expectedParams.set('nsfPath', 'Demo.nsf');

      const options: DesignOptions = {
        raw: true,
        // might be deprecated TO DO Need to test if nsfPath and dataSource are given together maybe on 1.0.9
        nsfPath: 'Demo.nsf',
      };
      const response = await DominoListViewOperations.getListView(dataSource, fakeToken, dc, listViewName, options);
      expect(response).to.exist;
      expect(response['@unid']).to.exist;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoListViewOperations.getListView('', fakeToken, dc, listViewName)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'designName' is empty`, async () => {
      await expect(DominoListViewOperations.getListView(dataSource, fakeToken, dc, '')).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');

      await expect(DominoListViewOperations.getListView(dataSource, fakeToken, dc, listViewName)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('Operation execution', () => {
    beforeEach(() => {
      operationId = 'fetchViews';
    });

    it(`should throw 'NoResponseBody' if response has null stream`, async () => {
      dcRequestStub.resolves(transformToRequestResponse(null));

      await expect(DominoListViewOperations.getListViews(dataSource, fakeToken, dc)).to.be.rejectedWith(NoResponseBody);
    });

    it(`should throw 'HttpResponseError' if response has error status`, async () => {
      dcRequestStub.resolves(transformToRequestResponse({ message: 'Error' }, 400));

      await expect(DominoListViewOperations.getListViews(dataSource, fakeToken, dc)).to.be.rejectedWith(HttpResponseError);
    });
  });
});

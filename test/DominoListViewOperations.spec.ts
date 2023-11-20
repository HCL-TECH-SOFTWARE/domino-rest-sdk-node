/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import {
  CreateUpdateDesignOptions,
  CredentialType,
  DominoAccess,
  DominoApiMeta,
  DominoRequestOptions,
  GetDesignOptions,
  GetListPivotViewEntryOptions,
  GetListViewEntryOptions,
  GetListViewOptions,
  SortType,
} from '../src';
import DominoConnector from '../src/DominoConnector';
import DominoDocument from '../src/DominoDocument';
import DominoListView from '../src/DominoListView';
import DominoListViewOperations from '../src/DominoListViewOperations';
import create_dlv1_response from './resources/DominoListView/create_dlv1_response.json';
import docResponse from './resources/DominoDocumentOperations/doc_response.json';
import dlv1_response from './resources/DominoListView/dlv1_response.json';
import lv1_response from './resources/DominoListView/lv1_response.json';
import lve1_response from './resources/DominoListView/lve1_response.json';
import lvpe1_response from './resources/DominoListView/lvpe1_response.json';

const fakeCredentials = {
  baseUrl: 'somewhere',
  credentials: {
    scope: '',
    type: CredentialType.BASIC,
    username: 'fakeUsername',
    password: 'fakePassword',
  },
};

describe('DominoListViewOperations', async () => {
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const dataSource = 'demoapi';
  const listViewName = 'Customers';
  const fakeToken = new DominoAccess(fakeCredentials);

  let dc: DominoConnector;
  let operationId: string;
  let expectedParams: Map<string, any>;
  let expectedOptions: DominoRequestOptions;
  let dcRequestStub: sinon.SinonStub<[dominoAccess: DominoAccess, operationId: string, options: DominoRequestOptions], Promise<any>>;

  beforeEach(async () => {
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.onFirstCall().returns(Promise.resolve(new Response(JSON.stringify(baseApi))));

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

  describe('getListViews', () => {
    beforeEach(() => {
      operationId = 'fetchViews';
      dcRequestStub.resolves(lv1_response);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoListViewOperations.getListViews('', fakeToken, dc)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoListViewOperations.getListViews(dataSource, fakeToken, dc);
      expect(response).to.exist;
      expect(response.length).to.be.equal(7);
    });

    it('should be able to give correct response and params to request given the appropriate options (GetListViewOpions)', async () => {
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
  });

  describe('getListView', () => {
    beforeEach(() => {
      operationId = 'getDesign';
      dcRequestStub.resolves(dlv1_response);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoListViewOperations.getListView('', fakeToken, dc, listViewName)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given designName is empty', async () => {
      await expect(DominoListViewOperations.getListView(dataSource, fakeToken, dc, '')).to.be.rejectedWith('designName must not be empty.');
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');
      const response = await DominoListViewOperations.getListView(dataSource, fakeToken, dc, listViewName);
      expect(response).to.exist;
      expect(response['@unid']).to.exist;
    });

    it('should be able to give correct response and params to request given the appropriate options (DesignOptions)', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');
      expectedParams.set('raw', true);
      expectedParams.set('nsfPath', 'Demo.nsf');
      const options: GetDesignOptions = {
        raw: true,
        // might be deprecated TO DO Need to test if nsfPath and dataSource are given together maybe on 1.0.9
        nsfPath: 'Demo.nsf',
      };
      const response = await DominoListViewOperations.getListView(dataSource, fakeToken, dc, listViewName, options);
      expect(response).to.exist;
      expect(response['@unid']).to.exist;
    });
  });

  describe('getListViewEntry', () => {
    beforeEach(() => {
      operationId = 'fetchViewEntries';
      expectedOptions.subscriber = null;
      dcRequestStub.resolves(lve1_response);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoListViewOperations.getListViewEntry('', fakeToken, dc, listViewName)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given listViewName is empty', async () => {
      await expect(DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, '')).to.be.rejectedWith('name must not be empty.');
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('name', listViewName);
      const response = await DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, listViewName);
      expect(response).to.exist;
      expect(response.length).to.equal(50);
    });

    it('should be able to give correct response and params to request with options', async () => {
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

    it('should be able to give correct response and params to request with subscriber', async () => {
      const subscriber = () => new WritableStream();
      expectedParams.set('name', listViewName);
      expectedOptions.subscriber = subscriber;
      const options = {
        subscriber,
      };
      const response = await DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, listViewName, options);
      expect(response).to.be.undefined;
    });

    it('should be able to give correct response and params to request with subscriber and other options', async () => {
      const subscriber = () => new WritableStream();
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
        subscriber,
      };
      expectedOptions.subscriber = subscriber;
      const response = await DominoListViewOperations.getListViewEntry(dataSource, fakeToken, dc, listViewName, options);
      expect(response).to.be.undefined;
    });

    it('should return an array of DominoDocuments if options.documents is true and no callback is given', async () => {
      dcRequestStub.resolves([docResponse, docResponse, docResponse, docResponse, docResponse]);
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
  });

  describe('getListViewPivotEntry', () => {
    const pivotColumn = 'Color';
    beforeEach(() => {
      operationId = 'pivotViewEntries';
      dcRequestStub.resolves(lvpe1_response);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoListViewOperations.getListViewPivotEntry('', fakeToken, dc, listViewName, pivotColumn)).to.be.rejectedWith(
        'dataSource must not be empty.',
      );
    });

    it('should throw an error if given listViewName is empty', async () => {
      await expect(DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, '', pivotColumn)).to.be.rejectedWith(
        'name must not be empty.',
      );
    });

    it('should throw an error if given pivotColumn is empty', async () => {
      await expect(DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, listViewName, '')).to.be.rejectedWith(
        'pivotColumn must not be empty.',
      );
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('name', listViewName);
      expectedParams.set('pivotColumn', pivotColumn);
      const response = await DominoListViewOperations.getListViewPivotEntry(dataSource, fakeToken, dc, listViewName, pivotColumn);
      expect(response).to.exist;
      expect(Object.keys(response).length).to.equal(28);
    });

    it('should be able to give correct response and params to request', async () => {
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
  });

  describe('createUpdateListView', () => {
    let lv1: DominoListView;

    let listViewObject = {
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
    lv1 = new DominoListView(listViewObject);

    beforeEach(() => {
      operationId = 'updateCreateDesign';
      dcRequestStub.resolves(create_dlv1_response);
      expectedOptions.body = JSON.stringify(lv1.toListViewJson());
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoListViewOperations.createUpdateListView('', fakeToken, dc, listViewObject, listViewName)).to.be.rejectedWith(
        'dataSource must not be empty.',
      );
    });

    it('should throw an error if given designName is empty', async () => {
      await expect(DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, listViewObject, '')).to.be.rejectedWith(
        'designName must not be empty.',
      );
    });

    it('should be able to give correct response and params to request given the appropriate options (CreateUpdateDesignOptions)', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');
      expectedParams.set('raw', true);
      expectedParams.set('nsfPath', 'Demo.nsf');
      const options: CreateUpdateDesignOptions = {
        raw: true,
        // might be deprecated TO DO Need to test if nsfPath and dataSource are given together maybe on 1.0.9
        nsfPath: 'Demo.nsf',
      };
      const response = await DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, listViewObject, listViewName, options);
      expect(response).to.exist;
      expect(response.success).to.true;
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('designName', listViewName);
      expectedParams.set('designType', 'views');
      const response = await DominoListViewOperations.createUpdateListView(dataSource, fakeToken, dc, listViewObject, listViewName);
      expect(response).to.exist;
      expect(response.success).to.true;
    });
  });
});

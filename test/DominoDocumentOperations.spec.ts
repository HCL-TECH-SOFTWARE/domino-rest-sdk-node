/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import sinon from 'sinon';
import { GetDocumentsByQueryRequest } from '../dist/DominoDocumentOperations';
import {
  BulkGetDocumentsOptions,
  BulkUpdateDocumentsByQueryRequest,
  CreateDocumentOptions,
  CredentialType,
  DocumentJSON,
  DominoAccess,
  DominoApiMeta,
  DominoDocumentOperations,
  DominoRequestOptions,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  QueryActions,
  RichTextRepresentation,
  UpdateDocumentOptions,
} from '../src';
import DominoConnector from '../src/DominoConnector';
import DominoDocument from '../src/DominoDocument';
import doc from './resources/DominoDocumentOperations/doc.json';
import docPatchReq from './resources/DominoDocumentOperations/doc_patch_request.json';
import docPatchResponse from './resources/DominoDocumentOperations/doc_patch_response.json';
import docResponse from './resources/DominoDocumentOperations/doc_response.json';
import docUpdateResponse from './resources/DominoDocumentOperations/doc_update_response.json';
import operationStatusResponse from './resources/DominoDocumentOperations/operation_status_response.json';
import queryExecuteResponse from './resources/DominoDocumentOperations/query_operation_execute_response.json';
import queryExplainResponse from './resources/DominoDocumentOperations/query_operation_explain_response.json';
import queryParseResponse from './resources/DominoDocumentOperations/query_operation_parse_response.json';

const fakeCredentials = {
  baseUrl: 'somewhere',
  credentials: {
    scope: '',
    type: CredentialType.BASIC,
    userName: 'fakeUsername',
    passWord: 'fakePassword',
  },
};

describe('DominoDocumentOperations', () => {
  const dc = new DominoConnector('', {} as DominoApiMeta);
  const dataSource = 'dataSource';
  const fakeToken = new DominoAccess(fakeCredentials);

  let operationId: string;
  let expectedParams: Map<string, any>;
  let expectedOptions: DominoRequestOptions;
  let dcRequestStub: sinon.SinonStub<[dominoAccess: DominoAccess, operationId: string, options: DominoRequestOptions], Promise<any>>;

  beforeEach(() => {
    dcRequestStub = sinon.stub(dc, 'request');
    expectedParams = new Map();
    expectedOptions = {
      dataSource,
      params: expectedParams,
    };
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

  describe('getDocument', () => {
    beforeEach(() => {
      operationId = 'getDocument';
      dcRequestStub.resolves(docResponse);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.getDocument('', fakeToken, dc, '')).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given UNID is empty', async () => {
      await expect(DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '')).to.be.rejectedWith('UNID must not be empty.');
    });

    it('should throw an error if given UNID is invalid', async () => {
      await expect(DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, 'UNID')).to.be.rejectedWith('UNID has an invalid value.');
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('unid', '28FB14A0F6BB9A3A00258A1D004C6F9C');

      const response = await DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '28FB14A0F6BB9A3A00258A1D004C6F9C');
      expect(response instanceof DominoDocument).to.be.true;
    });

    it('should be able to give correct response and params to request when given options', async () => {
      expectedParams.set('unid', '28FB14A0F6BB9A3A00258A1D004C6F9C');
      expectedParams.set('computeWithForm', true);
      expectedParams.set('mode', 'mode');
      expectedParams.set('parentUnid', 'parentUnid');

      const options: GetDocumentOptions = {
        computeWithForm: true,
        mode: 'mode',
        parentUnid: 'parentUnid',
      };
      const response = await DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '28FB14A0F6BB9A3A00258A1D004C6F9C', options);
      expect(response).to.exist;
      expect(response instanceof DominoDocument).to.be.true;
    });
  });

  describe('createDocument', () => {
    let ddoc1: DominoDocument;

    beforeEach(() => {
      operationId = 'createDocument';
      dcRequestStub.resolves(docResponse);
      ddoc1 = new DominoDocument(doc);
      expectedOptions.body = JSON.stringify(ddoc1.toDocJson());
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.createDocument('', fakeToken, dc, doc)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.createDocument(dataSource, fakeToken, dc, doc);
      expect(response).to.exist;
      expect(response instanceof DominoDocument).to.be.true;
    });

    it('should be able to give correct response and params to request when given options', async () => {
      expectedParams.set('parentUnid', 'parent');
      expectedParams.set('richTextAs', 'html');

      const options: CreateDocumentOptions = { parentUnid: 'parent', richTextAs: RichTextRepresentation.HTML };
      const response = await DominoDocumentOperations.createDocument(dataSource, fakeToken, dc, doc, options);
      expect(response).to.exist;
      expect(response instanceof DominoDocument).to.be.true;
    });
  });

  describe('updateDocument', () => {
    let ddoc1: DominoDocument;

    beforeEach(() => {
      operationId = 'updateDocument';
      dcRequestStub.resolves(docUpdateResponse);
      ddoc1 = new DominoDocument(docResponse);
      expectedOptions.body = JSON.stringify(ddoc1.toDocJson());
      expectedParams.set('unid', ddoc1.getUNID());
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.updateDocument('', fakeToken, dc, ddoc1)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given document has empty UNID', async () => {
      ddoc1.setUNID('');

      await expect(DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith('UNID must not be empty.');
    });

    it('should throw an error if given document has invalid UNID', async () => {
      ddoc1.setUNID('UNID');

      await expect(DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith('UNID has an invalid value.');
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1);
      expect(response).to.exist;
      expect(response instanceof DominoDocument).to.be.true;
    });

    it('should be able to give correct response and params to request when given options', async () => {
      expectedParams.set('parentUnid', 'parent');
      expectedParams.set('richTextAs', 'html');

      const options: UpdateDocumentOptions = { richTextAs: RichTextRepresentation.HTML, parentUnid: 'parent' };
      const response = await DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1, options);
      expect(response).to.exist;
      expect(response instanceof DominoDocument).to.be.true;
    });
  });

  describe('patchDocument', () => {
    const patchUnid = '48CAD0599A85856D00258A04004CACFA';

    beforeEach(() => {
      operationId = 'patchDocument';
      dcRequestStub.resolves(docPatchResponse);
      expectedOptions.body = JSON.stringify(docPatchReq);
      expectedParams.set('unid', patchUnid);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.patchDocument('', fakeToken, dc, '', docPatchReq)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given UNID is empty', async () => {
      await expect(DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, '', docPatchReq)).to.be.rejectedWith('UNID must not be empty.');
    });

    it('should throw an error if given document has invalid UNID', async () => {
      await expect(DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, 'UNID', docPatchReq)).to.be.rejectedWith(
        'UNID has an invalid value.',
      );
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, patchUnid, docPatchReq);
      expect(response).to.exist;
      expect(response instanceof DominoDocument).to.be.true;
    });

    it('should be able to give correct response and params to request when given options', async () => {
      expectedParams.set('parentUnid', 'parent');
      expectedParams.set('richTextAs', 'html');

      const options: CreateDocumentOptions = { parentUnid: 'parent', richTextAs: RichTextRepresentation.HTML };
      const response = await DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, patchUnid, docPatchReq, options);
      expect(response).to.exist;
      expect(response instanceof DominoDocument).to.be.true;
    });
  });

  describe('deleteDocument', () => {
    let ddoc1: DominoDocument;

    beforeEach(() => {
      operationId = 'deleteDocument';
      dcRequestStub.resolves(operationStatusResponse);
      ddoc1 = new DominoDocument(docResponse);
      expectedParams.set('unid', ddoc1.getUNID());
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.deleteDocument('', fakeToken, dc, ddoc1)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given document has no UNID', async () => {
      ddoc1.setUNID('');

      await expect(DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith(
        'Document UNID should not be empty.',
      );
    });

    it('should throw an error if given document has invalid UNID', async () => {
      ddoc1.setUNID('UNID');

      await expect(DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith(
        'Document UNID has an invalid value.',
      );
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1);
      expect(response).to.exist;
    });

    it('should be able to give correct response and params to request when given mode', async () => {
      expectedParams.set('mode', 'myMode');

      const response = await DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1, 'myMode');
      expect(response).to.exist;
    });
  });

  describe('deleteDocumentByUNID', () => {
    const unid = '28FB14A0F6BB9A3A00258A1D004C6F9D';

    beforeEach(() => {
      operationId = 'deleteDocument';
      dcRequestStub.resolves(operationStatusResponse);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.deleteDocumentByUNID('', fakeToken, dc, unid)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given UNID is empty', async () => {
      await expect(DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, '')).to.be.rejectedWith('UNID should not be empty.');
    });

    it('should throw an error if given UNID is invalid', async () => {
      await expect(DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, 'UNID')).to.be.rejectedWith('UNID has an invalid value.');
    });

    it('should be able to give correct response and params to request', async () => {
      expectedParams.set('unid', unid);

      const response = await DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, unid);
      expect(response).to.exist;
    });

    it('should be able to give correct response and params to request when given mode', async () => {
      expectedParams.set('unid', unid);
      expectedParams.set('mode', 'myMode');

      const response = await DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, unid, 'myMode');
      expect(response).to.exist;
    });
  });

  describe('bulkGetDocuments', () => {
    const unids = ['28FB14A0F6BB9A3A00258A1D004C6F9D', '28FB14A0F6BB9A3A00258A1D004C6F9E', '28FB14A0F6BB9A3A00258A1D004C6F9F'];
    const bulkGetErrorResponse = {
      status: 404,
      message: 'No document you can access found for F9D1F6348963AB6000258A0D006015AB',
      errorId: 1029,
      details: 'F9D1F6348963AB6000258A0D006015AB',
    };

    beforeEach(() => {
      operationId = 'bulkGetDocumentsByUnid';
      dcRequestStub.resolves([docResponse, bulkGetErrorResponse, docResponse]);
      expectedOptions.body = JSON.stringify({ unids });
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.bulkGetDocuments('', fakeToken, dc, unids)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given UNIDs array is empty', async () => {
      await expect(DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, [])).to.be.rejectedWith('UNIDs array should not be empty.');
    });

    it('should throw an error if one of given UNIDs is empty', async () => {
      await expect(
        DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, [
          '28FB14A0F6BB9A3A00258A1D004C6F9D',
          '',
          '28FB14A0F6BB9A3A00258A1D004C6F9E',
          '28FB14A0F6BB9A3A00258A1D004C6F9F',
        ]),
      ).to.be.rejectedWith('One of given UNIDs is empty.');
    });

    it('should throw an error if one of given UNIDs is invalid', async () => {
      await expect(
        DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, [
          '28FB14A0F6BB9A3A00258A1D004C6F9D',
          'UNID',
          '28FB14A0F6BB9A3A00258A1D004C6F9E',
          '28FB14A0F6BB9A3A00258A1D004C6F9F',
        ]),
      ).to.be.rejectedWith('One of given UNIDs is invalid.');
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, unids);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const item of response) {
        if ('Form' in item) {
          expect(item instanceof DominoDocument).to.be.true;
        } else {
          expect(Object.keys(item)).to.deep.equal(Object.keys(bulkGetErrorResponse));
        }
      }
    });

    it('should be able to give correct response and params to request when given options', async () => {
      expectedParams.set('meta', true);
      expectedParams.set('richTextAs', 'html');

      const options: BulkGetDocumentsOptions = {
        meta: true,
        richTextAs: RichTextRepresentation.HTML,
      };

      const response = await DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, unids, options);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const item of response) {
        if ('Form' in item) {
          expect(item instanceof DominoDocument).to.be.true;
        } else {
          expect(Object.keys(item)).to.deep.equal(Object.keys(bulkGetErrorResponse));
        }
      }
    });
  });

  describe('bulkCreateDocuments', () => {
    let docs: DocumentJSON[];

    beforeEach(() => {
      operationId = 'bulkCreateDocuments';
      dcRequestStub.resolves([docResponse, docResponse, docResponse]);
      docs = [
        {
          Color: 'Purple',
          Form: 'TestForm',
          Pet: 'Bandicoot, long-nosed',
          email: 'kaaronsohnf5@goo.ne.jp',
          first_name: 'Kristoffer',
          gender: 'Male',
          last_name: 'Aaronsohn',
        },
        {
          Color: 'Purple',
          Form: 'TestForm',
          Pet: 'Bandicoot, long-nosed',
          email: 'kaaronsohnf5@goo.ne.jp',
          first_name: 'Kristoffer',
          gender: 'Male',
          last_name: 'Aaronsohn',
        },
        {
          Color: 'Purple',
          Form: 'TestForm',
          Pet: 'Bandicoot, long-nosed',
          email: 'kaaronsohnf5@goo.ne.jp',
          first_name: 'Kristoffer',
          gender: 'Male',
          last_name: 'Aaronsohn',
        },
        {
          Color: 'Purple',
          Form: 'TestForm',
          Pet: 'Bandicoot, long-nosed',
          email: 'kaaronsohnf5@goo.ne.jp',
          first_name: 'Kristoffer',
          gender: 'Male',
          last_name: 'Aaronsohn',
        },
        {
          Color: 'Purple',
          Form: 'TestForm',
          Pet: 'Bandicoot, long-nosed',
          email: 'kaaronsohnf5@goo.ne.jp',
          first_name: 'Kristoffer',
          gender: 'Male',
          last_name: 'Aaronsohn',
        },
      ];
      expectedOptions.body = JSON.stringify({ documents: docs });
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.bulkCreateDocuments('', fakeToken, dc, docs)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given docs array is empty', async () => {
      docs = [];
      await expect(DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, docs)).to.be.rejectedWith(
        'Documents array should not be empty.',
      );
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, docs);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });

    it('should be able to give correct response and params to request when given richTextAs', async () => {
      expectedParams.set('richTextAs', 'html');

      const response = await DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, docs, RichTextRepresentation.HTML);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });
  });

  describe('bulkUpdateDocumentsByQuery', () => {
    let request: BulkUpdateDocumentsByQueryRequest;

    beforeEach(() => {
      operationId = 'bulkUpdateDocumentsByQuery';
      dcRequestStub.resolves([operationStatusResponse, operationStatusResponse, operationStatusResponse]);
      request = {
        query: "form = 'Customer' and name = 'Alien'",
        replaceItems: { key: 'new' },
      };
      expectedOptions.body = JSON.stringify(request);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery('', fakeToken, dc, request)).to.be.rejectedWith(
        'dataSource must not be empty.',
      );
    });

    it('should throw an error if request query is empty', async () => {
      request.query = '';

      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request)).to.be.rejectedWith(
        `'query' inside Request Body should not be empty.`,
      );
    });

    it('should throw an error if request replaceItems has no items', async () => {
      request.replaceItems = {};

      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request)).to.be.rejectedWith(
        'Request replaceItems should not be empty.',
      );
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it('should be able to give correct response and params to request when given richTextAs', async () => {
      expectedParams.set('richTextAs', 'html');

      const response = await DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request, RichTextRepresentation.HTML);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it('should be able to return an instance of domino documents on response if request returnUpdatedDocument is true', async () => {
      dcRequestStub.resolves([docResponse, docResponse]);
      request.returnUpdatedDocument = true;
      expectedOptions.body = JSON.stringify(request);

      const response = await DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request);
      expect(response).to.exist;
      expect(response.length).to.be.equal(2);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });
  });

  describe('getDocumentsByQuery', () => {
    let request: GetDocumentsByQueryRequest;
    let qaction = QueryActions.EXECUTE;

    beforeEach(() => {
      operationId = 'query';
      dcRequestStub.resolves(queryExecuteResponse);
      request = {
        query: "form = 'Customer' and name = 'Alien'",
      };
      expectedOptions.body = JSON.stringify(request);
      expectedParams.set('action', QueryActions.EXECUTE);
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.getDocumentsByQuery('', fakeToken, dc, request, qaction)).to.be.rejectedWith(
        'dataSource must not be empty.',
      );
    });

    it('should throw an error if request query is empty', async () => {
      request.query = '';
      await expect(DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, qaction)).to.be.rejectedWith(
        `'query' inside Request Body should not be empty.`,
      );
    });

    it('should be able to give correct response and params to request', async () => {
      const options: GetDocumentsByQueryOptions = {
        richTextAs: RichTextRepresentation.HTML,
        count: 3,
        start: 3,
      };
      expectedParams.set('count', 3);
      expectedParams.set('start', 3);
      expectedParams.set('richTextAs', 'html');
      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, qaction, options);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it('should be able to give correct response when action is explain', async () => {
      dcRequestStub.resolves(queryExplainResponse);
      expectedParams.set('action', QueryActions.EXPLAIN);
      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, QueryActions.EXPLAIN);
      expect(response).to.exist;
    });

    it('should be able to give correct response when action is parse', async () => {
      dcRequestStub.resolves(queryParseResponse);
      expectedParams.set('action', QueryActions.PARSE);
      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, QueryActions.PARSE);
      expect(response).to.exist;
    });

    it('should be able to return an instance of domino documents on response after execute', async () => {
      dcRequestStub.resolves(queryExecuteResponse);
      expectedOptions.body = JSON.stringify(request);

      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, qaction);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });
  });

  describe('bulkDeleteDocuments', () => {
    let unids: string[];
    let docs: DominoDocument[];

    beforeEach(() => {
      operationId = 'bulkDeleteDocuments';
      dcRequestStub.resolves([operationStatusResponse, operationStatusResponse, operationStatusResponse]);
      docs = [new DominoDocument(docResponse), new DominoDocument(docResponse), new DominoDocument(docResponse)];
      unids = [];
      for (const doc of docs) {
        const unid = doc.getUNID();
        expect(unid).to.not.be.undefined;
        unids.push(unid ? unid : '');
      }
      expectedOptions.body = JSON.stringify({ unids });
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocuments('', fakeToken, dc, docs)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given documents array is empty', async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, [])).to.be.rejectedWith(
        'Documents array should not be empty.',
      );
    });

    it('should throw an error if one of given documents has empty UNID', async () => {
      docs[1].setUNID('');

      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs)).to.be.rejectedWith(
        'One of given documents has empty UNID.',
      );
    });

    it('should throw an error if one of given documents has invalid UNID', async () => {
      docs[2].setUNID('UNID');

      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs)).to.be.rejectedWith(
        'One of given documents has invalid UNID.',
      );
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it('should be able to give correct response and params to request when given mode', async () => {
      expectedOptions.body = JSON.stringify({ unids, mode: 'myMode' });

      const response = await DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs, 'myMode');
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });
  });

  describe('bulkDeleteDocumentsByUNID', () => {
    let unids: string[];

    beforeEach(() => {
      operationId = 'bulkDeleteDocuments';
      dcRequestStub.resolves(operationStatusResponse);
      unids = ['28FB14A0F6BB9A3A00258A1D004C6F9D', '28FB14A0F6BB9A3A00258A1D004C6F9E', '28FB14A0F6BB9A3A00258A1D004C6F9F'];
      expectedOptions.body = JSON.stringify({ unids });
    });

    it('should throw an error if given dataSource is empty', async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID('', fakeToken, dc, unids)).to.be.rejectedWith('dataSource must not be empty.');
    });

    it('should throw an error if given UNIDs array is empty', async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, [])).to.be.rejectedWith(
        'UNIDs array should not be empty.',
      );
    });

    it('should throw an error if one of given UNIDs is empty', async () => {
      unids[1] = '';

      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids)).to.be.rejectedWith(
        'One of given UNIDs is empty.',
      );
    });

    it('should throw an error if one of given UNIDs is invalid', async () => {
      unids[2] = 'UNID';

      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids)).to.be.rejectedWith(
        'One of given UNIDs is invalid.',
      );
    });

    it('should be able to give correct response and params to request', async () => {
      const response = await DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids);
      expect(response).to.exist;
    });

    it('should be able to give correct response and params to request when given mode', async () => {
      expectedOptions.body = JSON.stringify({ unids, mode: 'delete' });

      const response = await DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids, 'delete');
      expect(response).to.exist;
    });
  });
});

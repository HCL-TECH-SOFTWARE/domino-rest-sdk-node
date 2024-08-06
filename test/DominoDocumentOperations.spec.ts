/* ========================================================================== *
 * Copyright (C) 2023, 2024 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import DominoConnector, { DominoRequestResponse } from '../src/DominoConnector.js';
import DominoDocument from '../src/DominoDocument.js';
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
  DominoRestAccess,
  EmptyParamError,
  GetDocumentOptions,
  GetDocumentsByQueryOptions,
  GetDocumentsByQueryRequest,
  HttpResponseError,
  InvalidParamError,
  NoResponseBody,
  NotAnArrayError,
  QueryActions,
  UpdateDocumentOptions,
} from '../src/index.js';
import { transformToRequestResponse } from './helpers/transformToRequestResponse.js';

describe('DominoDocumentOperations', async () => {
  const doc = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/doc.json', 'utf-8'));
  const docPatchReq = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/doc_patch_request.json', 'utf-8'));
  const docPatchResponse = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/doc_patch_response.json', 'utf-8'));
  const docResponse = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/doc_response.json', 'utf-8'));
  const docUpdateResponse = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/doc_update_response.json', 'utf-8'));
  const operationStatusResponse = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/operation_status_response.json', 'utf-8'));
  const queryExecuteResponse = JSON.parse(
    fs.readFileSync('./test/resources/DominoDocumentOperations/query_operation_execute_response.json', 'utf-8'),
  );
  const queryExplainResponse = JSON.parse(
    fs.readFileSync('./test/resources/DominoDocumentOperations/query_operation_explain_response.json', 'utf-8'),
  );
  const queryParseResponse = JSON.parse(fs.readFileSync('./test/resources/DominoDocumentOperations/query_operation_parse_response.json', 'utf-8'));
  const baseApi = JSON.parse(fs.readFileSync('./test/resources/openapi.basis.json', 'utf-8'));
  const dataSource = 'dataSource';
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
    [dominoAccess: DominoRestAccess, operationId: string, options: DominoRequestOptions],
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

  describe('getDocument', () => {
    beforeEach(() => {
      operationId = 'getDocument';
      dcRequestStub.resolves(transformToRequestResponse(docResponse));
    });

    it(`should be able to execute operation`, async () => {
      expectedParams.set('unid', '28FB14A0F6BB9A3A00258A1D004C6F9C');

      const response = await DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '28FB14A0F6BB9A3A00258A1D004C6F9C');
      expect(response instanceof DominoDocument).to.be.true;
    });

    it(`should be able to execute operation with options`, async () => {
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
      expect(response instanceof DominoDocument).to.be.true;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.getDocument('', fakeToken, dc, '')).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unid' is empty`, async () => {
      await expect(DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '')).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unid' is invalid`, async () => {
      await expect(DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, 'UNID')).to.be.rejectedWith(InvalidParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('unid', '28FB14A0F6BB9A3A00258A1D004C6F9C');

      await expect(DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '28FB14A0F6BB9A3A00258A1D004C6F9C')).to.be.rejectedWith(
        'Execute operation error.',
      );
    });
  });

  describe('createDocument', () => {
    let ddoc1: DominoDocument;

    beforeEach(() => {
      operationId = 'createDocument';
      dcRequestStub.resolves(transformToRequestResponse(docResponse));
      ddoc1 = new DominoDocument(doc);
      expectedOptions.body = JSON.stringify(ddoc1.toDocJson());
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.createDocument(dataSource, fakeToken, dc, doc);
      expect(response instanceof DominoDocument).to.be.true;
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('parentUnid', 'parent');
      expectedParams.set('richTextAs', 'html');

      const options: CreateDocumentOptions = { parentUnid: 'parent', richTextAs: 'html' };
      const response = await DominoDocumentOperations.createDocument(dataSource, fakeToken, dc, doc, options);
      expect(response instanceof DominoDocument).to.be.true;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.createDocument('', fakeToken, dc, doc)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'doc' is empty`, async () => {
      await expect(DominoDocumentOperations.createDocument(dataSource, fakeToken, dc, undefined as any)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.createDocument(dataSource, fakeToken, dc, doc)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('updateDocument', () => {
    let ddoc1: DominoDocument;

    beforeEach(() => {
      operationId = 'updateDocument';
      dcRequestStub.resolves(transformToRequestResponse(docUpdateResponse));
      ddoc1 = new DominoDocument(docResponse);
      expectedOptions.body = JSON.stringify(ddoc1.toDocJson());
      expectedParams.set('unid', ddoc1.getUNID());
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1);
      expect(response instanceof DominoDocument).to.be.true;
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('parentUnid', 'parent');
      expectedParams.set('richTextAs', 'html');

      const options: UpdateDocumentOptions = { richTextAs: 'html', parentUnid: 'parent' };
      const response = await DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1, options);
      expect(response instanceof DominoDocument).to.be.true;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.updateDocument('', fakeToken, dc, ddoc1)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'doc' is empty`, async () => {
      await expect(DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, undefined as any)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'document unid' is empty`, async () => {
      ddoc1.setUNID('');
      await expect(DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'document unid' is invalid`, async () => {
      ddoc1.setUNID('UNID');
      await expect(DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith(InvalidParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.updateDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('patchDocument', () => {
    const patchUnid = '48CAD0599A85856D00258A04004CACFA';

    beforeEach(() => {
      operationId = 'patchDocument';
      dcRequestStub.resolves(transformToRequestResponse(docPatchResponse));
      expectedOptions.body = JSON.stringify(docPatchReq);
      expectedParams.set('unid', patchUnid);
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, patchUnid, docPatchReq);
      expect(response instanceof DominoDocument).to.be.true;
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('parentUnid', 'parent');
      expectedParams.set('richTextAs', 'html');

      const options: CreateDocumentOptions = { parentUnid: 'parent', richTextAs: 'html' };
      const response = await DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, patchUnid, docPatchReq, options);
      expect(response instanceof DominoDocument).to.be.true;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.patchDocument('', fakeToken, dc, '', docPatchReq)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unid' is empty`, async () => {
      await expect(DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, '', docPatchReq)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unid' is invalid`, async () => {
      await expect(DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, 'UNID', docPatchReq)).to.be.rejectedWith(InvalidParamError);
    });

    it(`should throw an error if 'docJsonPatch' is empty`, async () => {
      await expect(DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, patchUnid, {} as any)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.patchDocument(dataSource, fakeToken, dc, patchUnid, docPatchReq)).to.be.rejectedWith(
        'Execute operation error.',
      );
    });
  });

  describe('deleteDocument', () => {
    let ddoc1: DominoDocument;

    beforeEach(() => {
      operationId = 'deleteDocument';
      dcRequestStub.resolves(transformToRequestResponse(operationStatusResponse));
      ddoc1 = new DominoDocument(docResponse);
      expectedParams.set('unid', ddoc1.getUNID());
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1);
      expect(response).to.exist;
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('mode', 'myMode');

      const response = await DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1, 'myMode');
      expect(response).to.exist;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.deleteDocument('', fakeToken, dc, ddoc1)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'doc' is empty`, async () => {
      await expect(DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, undefined as any)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if given document has no UNID', async () => {
      ddoc1.setUNID('');
      await expect(DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if given document has invalid UNID', async () => {
      ddoc1.setUNID('UNID');
      await expect(DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith(InvalidParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.deleteDocument(dataSource, fakeToken, dc, ddoc1)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('deleteDocumentByUNID', () => {
    const unid = '28FB14A0F6BB9A3A00258A1D004C6F9D';

    beforeEach(() => {
      operationId = 'deleteDocument';
      dcRequestStub.resolves(transformToRequestResponse(operationStatusResponse));
    });

    it('should be able to execute operation', async () => {
      expectedParams.set('unid', unid);

      const response = await DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, unid);
      expect(response).to.exist;
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('unid', unid);
      expectedParams.set('mode', 'myMode');

      const response = await DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, unid, 'myMode');
      expect(response).to.exist;
    });

    it(`should throw an error if dataSource is empty`, async () => {
      await expect(DominoDocumentOperations.deleteDocumentByUNID('', fakeToken, dc, unid)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unid' is empty`, async () => {
      await expect(DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, '')).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unid' is invalid`, async () => {
      await expect(DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, 'UNID')).to.be.rejectedWith(InvalidParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedParams.set('unid', unid);

      await expect(DominoDocumentOperations.deleteDocumentByUNID(dataSource, fakeToken, dc, unid)).to.be.rejectedWith('Execute operation error.');
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
      dcRequestStub.resolves(transformToRequestResponse([docResponse, bulkGetErrorResponse, docResponse]));
      expectedOptions.body = JSON.stringify({ unids });
    });

    it('should be able to execute operation', async () => {
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

    it('should be able to execute operation with options', async () => {
      expectedParams.set('meta', true);
      expectedParams.set('richTextAs', 'html');

      const options: BulkGetDocumentsOptions = {
        meta: true,
        richTextAs: 'html',
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

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkGetDocuments('', fakeToken, dc, unids)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unids' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, [])).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unids' is not an array`, async () => {
      await expect(DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, 'unids' as any)).to.be.rejectedWith(NotAnArrayError);
    });

    it(`should throw an error if one of 'unids' entries is empty`, async () => {
      await expect(
        DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, [
          '28FB14A0F6BB9A3A00258A1D004C6F9D',
          '',
          '28FB14A0F6BB9A3A00258A1D004C6F9E',
          '28FB14A0F6BB9A3A00258A1D004C6F9F',
        ]),
      ).to.be.rejectedWith(InvalidParamError);
    });

    it(`should throw an error if one of 'unids' entries is invalid`, async () => {
      await expect(
        DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, [
          '28FB14A0F6BB9A3A00258A1D004C6F9D',
          'UNID',
          '28FB14A0F6BB9A3A00258A1D004C6F9E',
          '28FB14A0F6BB9A3A00258A1D004C6F9F',
        ]),
      ).to.be.rejectedWith(InvalidParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.bulkGetDocuments(dataSource, fakeToken, dc, unids)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('getDocumentsByQuery', () => {
    let request: GetDocumentsByQueryRequest;
    let qaction = QueryActions.EXECUTE;

    beforeEach(() => {
      operationId = 'query';
      dcRequestStub.resolves(transformToRequestResponse(queryExecuteResponse));
      request = {
        query: "form = 'Customer' and name = 'Alien'",
      };
      expectedOptions.body = JSON.stringify(request);
      expectedParams.set('action', QueryActions.EXECUTE);
    });

    it('should be able to execute operation when action is explain', async () => {
      dcRequestStub.resolves(transformToRequestResponse(queryExplainResponse));
      expectedParams.set('action', QueryActions.EXPLAIN);

      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, QueryActions.EXPLAIN);
      expect(response).to.exist;
    });

    it('should be able to execute operation when action is parse', async () => {
      dcRequestStub.resolves(transformToRequestResponse(queryParseResponse));
      expectedParams.set('action', QueryActions.PARSE);

      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, QueryActions.PARSE);
      expect(response).to.exist;
    });

    it('should be able to execute operation when action is execute', async () => {
      dcRequestStub.resolves(transformToRequestResponse(queryExecuteResponse));
      expectedOptions.body = JSON.stringify(request);

      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, qaction);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('count', 3);
      expectedParams.set('start', 3);
      expectedParams.set('richTextAs', 'html');

      const options: GetDocumentsByQueryOptions = {
        richTextAs: 'html',
        count: 3,
        start: 3,
      };
      const response = await DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, qaction, options);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.getDocumentsByQuery('', fakeToken, dc, request, qaction)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'request' is empty`, async () => {
      await expect(DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, {} as any, qaction)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if `request.query` is empty', async () => {
      request.query = '';
      await expect(DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, qaction)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'qaction' is empty`, async () => {
      await expect(DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, undefined as any)).to.be.rejectedWith(
        EmptyParamError,
      );
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));
      expectedOptions.body = JSON.stringify(request);

      await expect(DominoDocumentOperations.getDocumentsByQuery(dataSource, fakeToken, dc, request, qaction)).to.be.rejectedWith(
        'Execute operation error.',
      );
    });
  });

  describe('bulkCreateDocuments', () => {
    let docs: DocumentJSON[];

    beforeEach(() => {
      operationId = 'bulkCreateDocuments';
      dcRequestStub.resolves(transformToRequestResponse([docResponse, docResponse, docResponse]));
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

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, docs);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('richTextAs', 'html');

      const response = await DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, docs, 'html');
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkCreateDocuments('', fakeToken, dc, docs)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'docs' array is empty`, async () => {
      await expect(DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, [])).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'docs' is not an array`, async () => {
      await expect(DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, 'docs' as any)).to.be.rejectedWith(NotAnArrayError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.bulkCreateDocuments(dataSource, fakeToken, dc, docs)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('bulkUpdateDocumentsByQuery', () => {
    let request: BulkUpdateDocumentsByQueryRequest;

    beforeEach(() => {
      operationId = 'bulkUpdateDocumentsByQuery';
      dcRequestStub.resolves(transformToRequestResponse([operationStatusResponse, operationStatusResponse, operationStatusResponse]));
      request = {
        query: "form = 'Customer' and name = 'Alien'",
        replaceItems: { key: 'new' },
      };
      expectedOptions.body = JSON.stringify(request);
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it('should be able to execute operation with options', async () => {
      expectedParams.set('richTextAs', 'html');

      const response = await DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request, 'html');
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it(`should be able to return 'DominoDocument' object if 'request.returnUpdatedDocument' is 'true'`, async () => {
      dcRequestStub.resolves(transformToRequestResponse([docResponse, docResponse]));
      request.returnUpdatedDocument = true;
      expectedOptions.body = JSON.stringify(request);

      const response = await DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request);
      expect(response).to.exist;
      expect(response.length).to.be.equal(2);
      for (const doc of response) {
        expect(doc instanceof DominoDocument).to.be.true;
      }
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery('', fakeToken, dc, request)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'request' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, {} as any)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'request.query' is empty`, async () => {
      request.query = '';
      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'request.replaceItems' is empty`, async () => {
      request.replaceItems = {};
      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request)).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.bulkUpdateDocumentsByQuery(dataSource, fakeToken, dc, request)).to.be.rejectedWith(
        'Execute operation error.',
      );
    });
  });

  describe('bulkDeleteDocuments', () => {
    let unids: string[];
    let docs: DominoDocument[];

    beforeEach(() => {
      operationId = 'bulkDeleteDocuments';
      dcRequestStub.resolves(transformToRequestResponse([operationStatusResponse, operationStatusResponse, operationStatusResponse]));
      docs = [new DominoDocument(docResponse), new DominoDocument(docResponse), new DominoDocument(docResponse)];
      unids = [];
      for (const doc of docs) {
        const unid = doc.getUNID();
        expect(unid).to.not.be.undefined;
        unids.push(unid || '');
      }
      expectedOptions.body = JSON.stringify({ unids });
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs);
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it('should be able to execute operation with options', async () => {
      expectedOptions.body = JSON.stringify({ unids, mode: 'myMode' });

      const response = await DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs, 'myMode');
      expect(response).to.exist;
      expect(response.length).to.be.equal(3);
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocuments('', fakeToken, dc, docs)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'docs' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, [])).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'docs' is not an array`, async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, 'docs' as any)).to.be.rejectedWith(NotAnArrayError);
    });

    it(`should throw an error if one of 'docs' has empty unid`, async () => {
      docs[1].setUNID('');
      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs)).to.be.rejectedWith(InvalidParamError);
    });

    it(`should throw an error if one of 'docs' has invalid unid`, async () => {
      docs[2].setUNID('UNID');
      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs)).to.be.rejectedWith(InvalidParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.bulkDeleteDocuments(dataSource, fakeToken, dc, docs)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('bulkDeleteDocumentsByUNID', () => {
    let unids: string[];

    beforeEach(() => {
      operationId = 'bulkDeleteDocuments';
      dcRequestStub.resolves(transformToRequestResponse(operationStatusResponse));
      unids = ['28FB14A0F6BB9A3A00258A1D004C6F9D', '28FB14A0F6BB9A3A00258A1D004C6F9E', '28FB14A0F6BB9A3A00258A1D004C6F9F'];
      expectedOptions.body = JSON.stringify({ unids });
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids);
      expect(response).to.exist;
    });

    it('should be able to execute operation with options', async () => {
      expectedOptions.body = JSON.stringify({ unids, mode: 'delete' });

      const response = await DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids, 'delete');
      expect(response).to.exist;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID('', fakeToken, dc, unids)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unids' is empty`, async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, [])).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unids' is not an array`, async () => {
      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, 'unids' as any)).to.be.rejectedWith(NotAnArrayError);
    });

    it(`should throw an error if one of 'unids' is empty`, async () => {
      unids[1] = '';
      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids)).to.be.rejectedWith(InvalidParamError);
    });

    it(`should throw an error if one of 'unids' is invalid`, async () => {
      unids[2] = 'UNID';
      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids)).to.be.rejectedWith(InvalidParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.bulkDeleteDocumentsByUNID(dataSource, fakeToken, dc, unids)).to.be.rejectedWith(
        'Execute operation error.',
      );
    });
  });

  describe('getRichtext', () => {
    const unid = '28FB14A0F6BB9A3A00258A1D004C6F9D';
    const richTextAs = 'html';

    beforeEach(() => {
      operationId = 'getRichText';
      dcRequestStub.resolves(transformToRequestResponse('<h1>Hello world!</h1>'));
      expectedParams.set('unid', unid);
      expectedParams.set('richTextAs', richTextAs);
    });

    it('should be able to execute operation', async () => {
      const response = await DominoDocumentOperations.getRichtext(dataSource, fakeToken, dc, unid, richTextAs);
      expect(response).to.exist;
    });

    it('should be able to execute operation with options', async () => {
      const options = { mode: 'delete', item: 'status' };
      expectedParams.set('mode', options.mode);
      expectedParams.set('item', options.item);

      const response = await DominoDocumentOperations.getRichtext(dataSource, fakeToken, dc, unid, richTextAs, options);
      expect(response).to.exist;
    });

    it(`should throw an error if 'dataSource' is empty`, async () => {
      await expect(DominoDocumentOperations.getRichtext('', fakeToken, dc, unid, richTextAs)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'unid' is empty`, async () => {
      await expect(DominoDocumentOperations.getRichtext(dataSource, fakeToken, dc, '', richTextAs)).to.be.rejectedWith(EmptyParamError);
    });

    it(`should throw an error if 'richTextAs' is empty`, async () => {
      await expect(DominoDocumentOperations.getRichtext(dataSource, fakeToken, dc, unid, '')).to.be.rejectedWith(EmptyParamError);
    });

    it('should throw an error if execute operation fails', async () => {
      dcRequestStub.rejects(new Error('Execute operation error.'));

      await expect(DominoDocumentOperations.getRichtext(dataSource, fakeToken, dc, unid, richTextAs)).to.be.rejectedWith('Execute operation error.');
    });
  });

  describe('Operation execution', () => {
    beforeEach(() => {
      operationId = 'getDocument';
    });

    it(`should throw 'NoResponseBody' if response has null stream`, async () => {
      dcRequestStub.resolves(transformToRequestResponse(null));
      expectedParams.set('unid', '28FB14A0F6BB9A3A00258A1D004C6F9C');

      await expect(DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '28FB14A0F6BB9A3A00258A1D004C6F9C')).to.be.rejectedWith(
        NoResponseBody,
      );
    });

    it(`should throw 'HttpResponseError' if response has error status`, async () => {
      dcRequestStub.resolves(transformToRequestResponse({ message: 'Error' }, 400));
      expectedParams.set('unid', '28FB14A0F6BB9A3A00258A1D004C6F9C');

      await expect(DominoDocumentOperations.getDocument(dataSource, fakeToken, dc, '28FB14A0F6BB9A3A00258A1D004C6F9C')).to.be.rejectedWith(
        HttpResponseError,
      );
    });
  });
});

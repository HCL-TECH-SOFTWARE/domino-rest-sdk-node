import { DominoRequestResponse } from '../../src';

export const transformToRequestResponse = (incoming: string | object, status?: number): DominoRequestResponse => {
  const stream = typeof incoming === 'string' ? incoming : JSON.stringify(incoming);
  const responseObj = new Response(stream, { status: status ?? 200 });

  return {
    status: responseObj.status,
    headers: responseObj.headers,
    dataStream: responseObj.body,
  };
};

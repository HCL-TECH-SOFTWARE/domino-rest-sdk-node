import { DominoRequestResponse } from '../../src';

export const transformToRequestResponse = (incoming: any, status?: number): DominoRequestResponse => {
  const stream = incoming !== null && typeof incoming === 'object' ? JSON.stringify(incoming) : incoming;
  const responseObj = new Response(stream, { status: status ?? 200 });

  return {
    status: responseObj.status,
    headers: responseObj.headers,
    dataStream: responseObj.body,
    expect: 'json'
  };
};

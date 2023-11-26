/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { streamSplit, streamToJson, streamToText, streamTransformToJson } from '../../src';

chai.use(chaiAsPromised);

describe('Stream conversion test', () => {
  const jsonObj = { color: 'red', shape: 'round' };

  const countCalls = (expected: number) => {
    let actual = 0;

    return new WritableStream({
      write(_chonk) {
        // WE ignore chonk
        actual++;
      },
      close() {
        expect(actual).equal(expected);
      },
    });
  };

  const isExpected = (expected: any) => {
    return new WritableStream({
      write(actual: any) {
        expect(actual).to.equal(expected);
      },
    });
  };

  it('should return the JSON from the Stream', (done) => {
    const jsonObj = { color: 'red', shape: 'round' };
    const readable = new Response(JSON.stringify(jsonObj)).body;
    const result = streamToJson(readable as ReadableStream<any>);
    expect(result).to.eventually.haveOwnProperty('color', 'red').notify(done);
  });

  it('should return the JSON from the Stream with await', async () => {
    const readable = new Response(JSON.stringify(jsonObj)).body;
    const result = await streamToJson(readable as ReadableStream<any>);
    expect(result).to.haveOwnProperty('color', 'red');
  });

  it('should return the String from the Stream', (done) => {
    const hello = 'Hello World';
    const readable = new Response(hello).body;
    const result = streamToText(readable as ReadableStream<any>);
    expect(result).to.eventually.eql(hello).notify(done);
  });

  it('should split the stream into 3 parts', async () => {
    const source = 'Three,little,piglets';
    const readable = new Response(source).body;
    const destination = countCalls(3);
    await readable?.pipeThrough(new TextDecoderStream()).pipeThrough(streamSplit(',')).pipeTo(destination);
    destination.close();
  });

  it('should split the stream into 2 parts with newline', async () => {
    const source = 'Three\npiglets';
    const readable = new Response(source).body;
    const destination = countCalls(2);
    await readable?.pipeThrough(new TextDecoderStream()).pipeThrough(streamSplit()).pipeTo(destination);
    destination.close();
  });

  it('should have nothing left in buffer if there is nothing', async () => {
    const source = '';
    const readable = new Response(source).body;
    const destination = countCalls(0);
    await readable?.pipeThrough(new TextDecoderStream()).pipeThrough(streamSplit()).pipeTo(destination);
    destination.close();
  });

  it('should produce JSON from chunk', () => {
    const source = JSON.stringify(jsonObj);
    const readable = new Response(source).body;
    readable?.pipeThrough(new TextDecoderStream()).pipeThrough(streamTransformToJson()).pipeTo(isExpected(jsonObj));
  });

  it('should produce JSON from chunk with comma', () => {
    const source = JSON.stringify(jsonObj) + ',';
    const readable = new Response(source).body;
    readable?.pipeThrough(new TextDecoderStream()).pipeThrough(streamTransformToJson()).pipeTo(isExpected(jsonObj));
  });

  it(`should skip chunk that does not end with '}' or ','`, () => {
    const source = '123';
    const readable = new Response(source).body;
    readable?.pipeThrough(new TextDecoderStream()).pipeThrough(streamTransformToJson()).pipeTo(isExpected(jsonObj));
  });
});

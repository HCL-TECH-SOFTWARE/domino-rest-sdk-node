/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

export const streamToJson = <T = any>(dataStream: ReadableStream<any>): Promise<T> => new Response(dataStream).json();

export const streamToText = (dataStream: ReadableStream<any>): Promise<string> => new Response(dataStream).text();

export const streamSplit = (splitter?: string) => {
  const splitOn = splitter ?? '\n';
  let buffer = '';
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;
      const parts = buffer.split(splitOn);
      parts.slice(0, -1).forEach((part) => controller.enqueue(part));
      buffer = parts[parts.length - 1];
    },
    flush(controller) {
      if (buffer) {
        controller.enqueue(buffer);
      }
    },
  });
};

export const streamTransformToJson = () => {
  return new TransformStream({
    transform(chunk, controller) {
      if (chunk.endsWith(',')) {
        controller.enqueue(JSON.parse(chunk.slice(0, -1)));
      } else if (chunk.endsWith('}')) {
        controller.enqueue(JSON.parse(chunk));
      }
    },
  });
};

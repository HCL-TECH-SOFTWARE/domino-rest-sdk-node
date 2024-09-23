/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Parses a local OpenAPI schema file. */

import schema from './resources/openapi.basis.json' assert { type: 'json' };

const paths = schema.paths;
const operations = new Map();
for (let p in paths) {
  console.log(p);
  let path = paths[p];
  for (let m in path) {
    if (path[m].operationId) {
      console.log(`    ${m}:${path[m].operationId}`);
      let params = new Map();
      let pathParams = path.parameters;
      if (pathParams) {
        for (let pp of pathParams) {
          params.set(pp.name, pp);
        }
      }
      let opsParam = path[m].parameters;
      if (opsParam) {
        for (let op of opsParam) {
          params.set(op.name, op);
        }
      }
      let operation = {};
      operation.url = p;
      operation.params = params;
      operations.set(path[m].operationId, operation);
    }
  }
}
console.log(operations);

/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Create a clone of a Domino access. This is useful when you want to change the
 * scope, but with the same credentials. */

const { DominoAccess } = require('@hcl-software/domino-rest-sdk-node');
const { getCredentials } = require('../resources/credentials');

const dominoAccess = new DominoAccess(getCredentials());
const newDominoAccess = dominoAccess.clone('my_new_scope');

// Should contain a scope value with the specified new scope.
console.log(newDominoAccess.credentials);

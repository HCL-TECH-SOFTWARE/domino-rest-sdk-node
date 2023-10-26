/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Patching a document example. */

const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

const start = async () => {
  const formData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  const dus = await getDominoUserSessionBasis();

  // create a document to be updated using PATCH
  const responseDominoDoc = await dus.createDocument('customersdb', formData).catch((err) => console.log(err.message));
  if (responseDominoDoc === undefined) {
    console.log('Failed to create document to patch.');
    return;
  }

  const patchJson = {
    category: ['Genius', 'Billionaire', 'PatchJob'],
  };

  // you have the option to use the options variable which contains all of the parameters or the PATCH /document API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
    revision: responseDominoDoc.getRevision(),
  };

  // call patchDocument method
  await dus
    .patchDocument('customersdb', responseDominoDoc.getUNID(), patchJson, options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();

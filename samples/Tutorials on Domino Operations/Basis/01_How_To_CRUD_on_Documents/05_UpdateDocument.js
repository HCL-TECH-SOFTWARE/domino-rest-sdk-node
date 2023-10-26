/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Updating a document example. */

const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

const start = async () => {
  const formData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  const dus = await getDominoUserSessionBasis();

  // create a document to be updated
  const responseDominoDoc = await dus.createDocument('customersdb', formData).catch((err) => console.log(err.message));
  if (responseDominoDoc === undefined) {
    console.log('Failed to create document to update.');
    return;
  }

  const updateformData = {
    category: ['Captain', 'Patriot'],
    name: 'James Rhodes',
  };
  for (const [key, value] of Object.entries(updateformData)) {
    responseDominoDoc.fields.set(key, value);
  }

  // you have the option to use the options variable which contains all of the parameters or the PUT /document API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
    revision: responseDominoDoc.getRevision(),
  };

  await dus
    .updateDocument('customersdb', responseDominoDoc, options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();

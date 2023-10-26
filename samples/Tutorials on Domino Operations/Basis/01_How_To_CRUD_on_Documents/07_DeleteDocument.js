/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Deleting a document example. */

const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

const start = async () => {
  const formData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  const dus = await getDominoUserSessionBasis();

  const myDoc = await dus.createDocument('customersdb', formData).catch((err) => console.log(err.message));
  if (myDoc === undefined) {
    console.log('Failed to create document to delete.');
    return;
  }

  // you have the option to use the options variable which contains all of the parameters or the DELETE /document API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
  };

  await dus
    .deleteDocument('customersdb', myDoc, 'delete', options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));

  // Using default mode will not find any documents because of delete @formula on default mode.
  // await dus
  //   .deleteDocument('customersdb', myDoc)
  //   .then((response) => console.log(response))
  //   .catch((err) => console.log(err.message));
};

start();

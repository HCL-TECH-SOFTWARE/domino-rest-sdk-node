/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Deleting a document by UNID example. */

const { getDominoBasisSession } = require('../../../_DominoSession');

const start = async () => {
  const formData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  const dbs = await getDominoBasisSession();

  const myDoc = await dbs.createDocument('customersdb', formData).catch((err) => console.log(err.message));
  if (myDoc === undefined) {
    console.log('Failed to create document to delete.');
    return;
  }

  let unid;
  if (myDoc.getUNID()) {
    unid = myDoc.getUNID();
  } else {
    console.log('WHAT!? No UNID? :3');
    return;
  }

  // you have the option to use the options variable which contains all of the parameters or the DELETE /document API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
  };

  await dbs
    .deleteDocumentByUNID('customersdb', unid, 'delete', options)
    .then((response) => console.log(JSON.stringify(response, null, 2)))
    .catch((err) => console.log(err.message));

  // Using default mode will not find any documents because of delete @formula on default mode.
  // await dbs
  //   .deleteDocumentByUNID('customersdb', unid)
  //   .then((response) => console.log(JSON.stringify(response, null, 2)))
  //   .catch((err) => console.log(err.message));
};

start();

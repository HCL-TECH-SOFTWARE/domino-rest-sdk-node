/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Deleting bulk documents by UNID example. */

import { getDominoBasisSession } from "../../../_DominoSession.js";

const start = async () => {
  const docs = [
    {
      category: ['Captain', 'American Boy', 'Shield', 'Stars and Stripes'],
      name: 'Steve Rogers',
      Form: 'Customer',
    },
    {
      category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
      name: 'Tony Stark',
      Form: 'Customer',
    },
    {
      category: ['Scientist', 'Green'],
      name: 'Bruce Banner',
      Form: 'Customer',
    },
  ];

  const dbs = await getDominoBasisSession();

  const bulkDocs = await dbs.bulkCreateDocuments('customersdb', docs).catch((err) => console.log(err.message));
  if (bulkDocs === undefined) {
    console.log('Failed to create documents to delete.');
    return;
  }

  const morituri = [];
  for (const doc of bulkDocs) {
    morituri.push(doc.getUNID());
  }
  // Add a non-existing document to UNID array.
  // morituri.push('99C7389EE042656200258A0D00698811');

  await dbs
    .bulkDeleteDocumentsByUNID('customersdb', morituri, 'delete')
    .then((response) => {
      const output = [];
      for (const res of response) {
        output.push(res);
      }
      console.log(JSON.stringify(output, null, 2));
    })
    .catch((err) => console.log(err.message));

  // Using default mode will not find any documents because of delete @formula on default mode.
  // await dbs
  //   .bulkDeleteDocumentsByUNID('customersdb', moritori)
  //   .then((response) => {
  //     const output = [];
  //     for (const res of response) {
  //       output.push(res);
  //     }
  //     console.log(JSON.stringify(output, null, 2));
  //   })
  //   .catch((err) => console.log(err.message));
};

start();

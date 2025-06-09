/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Deleting bulk documents example. */

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

  await dbs
    .bulkDeleteDocuments('customersdb', bulkDocs, 'delete')
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
  //   .bulkDeleteDocuments('customersdb', bulkDocs)
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

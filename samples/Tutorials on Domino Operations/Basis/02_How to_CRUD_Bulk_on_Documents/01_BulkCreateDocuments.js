/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creating bulk documents example. */

const { getDominoBasisSession } = require('../../../_DominoSession');

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

  await dbs
    .bulkCreateDocuments('customersdb', docs)
    .then((response) => {
      const docs = [];
      for (const doc of response) {
        docs.push(doc.toJson());
      }
      console.log(JSON.stringify(docs, null, 2));
    })
    .catch((err) => console.log(err.message));
};

start();

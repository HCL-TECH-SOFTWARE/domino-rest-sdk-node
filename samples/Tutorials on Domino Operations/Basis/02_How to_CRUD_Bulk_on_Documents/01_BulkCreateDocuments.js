/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creating bulk documents example. */

const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

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

  const dus = await getDominoUserSessionBasis();

  await dus
    .bulkCreateDocuments('customersdb', docs)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();

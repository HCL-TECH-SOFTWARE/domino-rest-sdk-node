/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Deleting bulk documents by UNID example. */

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

  const bulkDocs = await dus.bulkCreateDocuments('customersdb', docs).catch((err) => console.log(err.message));
  if (bulkDocs === undefined) {
    console.log('Failed to create documents to delete.');
    return;
  }

  const moritori = [];
  for (const doc of bulkDocs) {
    moritori.push(doc.getUNID());
  }
  // Add a non-existing document to UNID array.
  // moritori.push('99C7389EE042656200258A0D00698811');

  await dus
    .bulkDeleteDocumentsByUNID('customersdb', moritori, 'delete')
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));

  // Using default mode will not find any documents because of delete @formula on default mode.
  // await dus
  //   .bulkDeleteDocumentsByUNID('customersdb', moritori)
  //   .then((response) => console.log(response))
  //   .catch((err) => console.log(err.message));
};

start();

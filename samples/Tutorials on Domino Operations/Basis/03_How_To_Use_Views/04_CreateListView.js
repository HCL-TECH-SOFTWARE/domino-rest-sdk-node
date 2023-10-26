/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creating list view example */

const { getDominoUserSessionSetup } = require('../../../_DominoUserSession');
const start = async () => {
  const dus = await getDominoUserSessionSetup();
  const listViewData = {
    columns: [
      {
        formula: 'email',
        name: 'email',
        separatemultiplevalues: false,
        sort: 'ascending',
        title: 'email',
      },
      {
        formula: 'name',
        name: 'name',
        separatemultiplevalues: false,
        sort: 'ascending',
        title: 'name',
      },
    ],
    name: 'newentries',
    selectionFormula: 'Form = "NewEntry"',
  };

  // you have the option to use the options variable which contains all of the parameters or the PUT /design/{designType}/{designName} API (example: raw), refer to the swagger of Domino REST API for more info.
  const options = {
    // raw: false,
  };
  await dus
    .createUpdateListView('customersdb', listViewData, 'designName', options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();

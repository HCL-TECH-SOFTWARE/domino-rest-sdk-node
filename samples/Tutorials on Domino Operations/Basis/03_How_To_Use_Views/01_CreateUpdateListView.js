/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creating list view example */

import { getDominoSetupSession } from "../../../_DominoSession.js";

const start = async () => {
  const dss = await getDominoSetupSession();
  const listViewData = {
    columns: [
      {
        formula: 'category',
        name: 'category',
        separatemultiplevalues: true,
        sort: 'ascending',
        title: 'category',
      },
      {
        formula: 'name',
        name: 'name',
        separatemultiplevalues: false,
        sort: 'ascending',
        title: 'name',
      },
    ],
    name: 'Customers',
    selectionFormula: 'Form = "Customer"',
  };

  // you have the option to use the options variable which contains all of the parameters or the PUT /design/{designType}/{designName} API (example: raw), refer to the swagger of Domino REST API for more info.
  const options = {
    // raw: false,
  };

  await dss
    .createUpdateListView('customersdb', listViewData, 'designName', options)
    .then((response) => console.log(JSON.stringify(response, null, 2)))
    .catch((err) => console.log(err.message));
};

start();

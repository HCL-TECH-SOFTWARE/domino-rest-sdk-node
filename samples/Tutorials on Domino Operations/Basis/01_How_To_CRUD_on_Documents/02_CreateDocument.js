/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creating a document example. */

import { getDominoBasisSession } from "../../../_DominoSession.js";

const start = async () => {
  // We declare the form data we want to save.
  const formData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  // We retrieve the Domino user session.
  const dbs = await getDominoBasisSession();

  // We now call our Domino user session and use its createDocument method.
  // We always provide the scope name as the first parameter.
  await dbs
    .createDocument('customersdb', formData)
    .then((response) => console.log(JSON.stringify(response.toJson(), null, 2)))
    .catch((err) => console.log(err.message));
};

start();

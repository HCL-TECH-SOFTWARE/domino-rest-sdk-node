/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting a richtext field from a document example. */

import { getDominoBasisSession } from "../../../_DominoSession.js";

const start = async () => {
  // you have the option to use the options variable which contains all of the
  // parameters or the GET /richtext/{richTextAs}/{unid} API.
  const options = {
    // mode: 'read',
    item: 'status'
  };

  const dbs = await getDominoBasisSession();

  await dbs
    .getRichtext('customersdb', '44515902D4742CA700258B700066A3F3', 'html', options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();

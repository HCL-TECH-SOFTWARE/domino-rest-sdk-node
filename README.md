# Domino REST API Node.js SDK

Domino REST API Node.js SDK is a library that can help Node.js developers to build applications that uses Domino REST API. Domino REST API Node.js SDK also supports TypeScript.

(C) 2023 HCL America Inc. Apache-2.0 license [https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)

[![npm](https://nodei.co/npm/@hcl-software/domino-rest-sdk-node.png)](https://www.npmjs.com/package/@hcl-software/domino-rest-sdk-node)

## 📔 Documentation

- [Domino REST API documentation](https://opensource.hcltechsw.com/Domino-rest-api/index.html)
- [Using Domino REST API Node.js SDK examples](/samples/)

## ⬇️ Installation

First, have a running Domino REST API server, and next, install [Node.js](https://nodejs.org/en). Make sure the version is `>18.0.0` as Domino REST API Node.js uses the native `fetch` method available on that version. Then run:

```sh
npm install @hcl-software/domino-rest-sdk-node
```

## ⭐ Highlights

- Supports both JavaScript and TypeScript.
- Has built-in methods for the following Domino REST API calls:
  - **Basis**:
    - `/document`
    - `/document/{unid}`
    - `/bulk/create`
    - `/bulk/{unid}`
    - `/bulk/update`
    - `/bulk/delete`
    - `/query`
    - `/lists`
    - `/lists/{name}`
    - `/listspivot/{name}`
  - **Setup**:
    - `/design/{designType}/{designName}`
    - `/admin/scope`
    - `/admin/scopes`

## 📦 Importing

You can import the whole SDK via:

```javascript
// Using Node.js `require()`
const drapiSdk = require('@hcl-software/domino-rest-sdk-node');

// Using ES6 imports
import drapiSdk from '@hcl-software/domino-rest-sdk-node';
```

Or, you can import only the modules that you need, like:

```javascript
// Using Node.js `require()`
const { DominoAccess } = require('@hcl-software/domino-rest-sdk-node');

// Using ES6 imports
import { DominoAccess } from '@hcl-software/domino-rest-sdk-node';
```

## 🔬 Overview

![Domino REST API Node SDK Model](/docs/sdk-model.png)

Domino REST API Node SDK has four moving parts:

- `DominoAccess`
- `DominoServer`
- `DominoConnector`
- `DominoUserSession`

### ℹ️ DominoAccess

`DominoAccess` is a class that facilitates your access to the Domino REST API server. It takes in a `baseUrl`, which is your Idp provider, as well as your credentials, such as your `username`, `password`, `scope` and `type` (the authentication type: `basic` or `oauth`).

### ℹ️ DominoServer

`DominoServer` is a class that gets information on what APIs are available on your current server. It takes in a url to your Domino REST API server as a parameter. This class produces a `DominoConnector` class base on your chosen API.

### ℹ️ DominoConnector

`DominoConnector` is the class that does the actual communication between the Domino REST API Node SDK and your Domino REST API server.

### ℹ️ DominoUserSession

`DominoUserSession` is a class that contains all the operation you can perform on your Domino REST API server. It includes built-in methods, and a generic request method if you want to execute an operation on your own.

### 🎮 Running a Domino REST API operation using the SDK

Here is an example of how to use the four moving parts mentioned above in order to execute one Domino REST API Node SDK.

```javascript
import drapiSdk from '@hcl-software/domino-rest-sdk-node';

const start = async () => {
  const credentials = {
    baseUrl: 'http://localhost:8880',
    credentials: {
      scope: '$DATA',
      type: 'basic',
      username: 'username',
      password: 'password',
    },
  };
  // Create DominoAccess
  const dominoAccess = new drapiSdk.DominoAccess(credentials);
  // Create DominoServer
  const dominoServer = await drapiSdk.DominoServer.getServer('http://localhost:8880');
  // Get DominoConnector for basis operations from DominoServer
  const dominoConnectorForBasis = await dominoServer.getDominoConnector('basis');
  // Create DominoUserSession
  const dominoUserSession = new drapiSdk.DominoUserSession(dominoAccess, dominoConnectorForBasis);

  // Create a Domino document
  await dominoUserSession.createDocument(...)
    .then((document) => console.log(document))
    .catch((error) => console.log(error));
}

start();
```

For other examples, please go to our [examples](/samples/Tutorials%20on%20Domino%20Operations/).

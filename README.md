# Domino REST API Node.js SDK

Domino REST API Node.js SDK is a library that can help Node.js developers to build applications that uses Domino REST API. Domino REST API Node.js SDK also supports TypeScript.

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
const sdk = require('@hcl-software/domino-rest-sdk-node');

// Using ES6 imports
import sdk from '@hcl-software/domino-rest-sdk-node';
```

Or, you can import only the modules that you need, like:

```javascript
// Using Node.js `require()`
const { DominoAccess } = require('@hcl-software/domino-rest-sdk-node');

// Using ES6 imports
import { DominoAccess } from '@hcl-software/domino-rest-sdk-node';
```

## 🔬 Overview

In order to run a Domino REST API operations using the SDK, we should first setup two classes, namely `DominoAccess` and `DominoServer`.

### 👤 Creating DominoAccess

`DominoAccess` is a class that facilitates your access to the Domino REST API server.

In order to instantiate a `DominoAccess`, we need to create a `credentials` variable with a JSON value with the following format:

```javascript
const credentials = {
  "baseUrl": "Domino REST API server URL or other Idp's URL",
  "credentials": {
    "scope": "$DATA",
    "type": "basic",
    "userName": "username",
    "passWord": "password"
  }
}
```

You can also change the credentials `type` to `oauth`, but that requires a different format.

With our `credentials` ready, we can now declare a `DominoAccess`, like:

```javascript
const dominoAccess = new DominoAccess(credentials);
dominoAccess.accessToken()
  .then((response) => console.log(response))
  .catch((error) => console.log(error));
```

Running the code above should print the access token if nothing went wrong.

### ℹ️ Creating DominoServer

`DominoServer` is a class that is aware of the available APIs of the Domino REST API server and maps each of it to its own `DominoConnector`.

To create a `DominoServer`, you need to provide it with the URL of the Domino REST API server. Make sure that it is the same URL that your `DominoAccess` uses.

```javascript
const dominoServer = new DominoServer('Domino REST API server URL');
```

### 🎮 Running a Domino REST API operation using the SDK

Finally, in order to call Domino REST API operations using the SDK, we use both `DominoAccess` and `DominoServer` we created earlier to form a `DominoUserSession`, which is a class that provides the operations that we want to call.

First, we extract a `DominoConnector` from `DominoServer`. `DominoConnector` is a class that forms and executes the request via `fetch` to the Domino REST API server. To extract it, you need to do:

```javascript
const dominoConnectorForBasis = await dominoServer.getDominoConnector('basis');
```

The code above extracts a `DominoConnector` for the `basis` APIs. `basis` here tells `DominoServer` to map all the operations under `basis` to the `DominoConnector`. This means that only the operations under `basis` will be available.

With that set up, we can now create the `DominoUserSession`, like:

```javascript
const dominoUserSession = new DominoUserSession(dominoAccess, dominoConnectorForBasis);
```

We can now call `dominoUserSession` every time we want to execute an operation. Please take note that only operations available on `basis` will be callable with this `DominoUserSession`. If you want to perform operations on different APIs, let's say `setup`, you need to do the following:

```javascript
const dominoConnectorForSetup = await dominoServer.getDominoConnector('setup');
const dominoUserSessionForSetup = new DominoUserSession(dominoAccess, dominoConnectorForSetup);
```

Since our `DominoUserSession` is now ready, we are now able to perform a Domino REST API operation via:

```javascript
// Create a Domino document
dominoUserSession.createDocument(...)
  .then((document) => console.log(document))
  .catch((error) => console.log(error));
```

For specifics, please go to our [tutorial section for the different operations](/samples/Tutorials%20on%20Domino%20Operations/).

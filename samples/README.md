# Domino REST API Node.js SDK examples

Code examples for using the Domino REST API Node.js SDK.

## 🚀 Quickstart

### 🌱 Setup Samples Environment

For the samples to properly work, a proper environment should be configured first. d

The steps are as follows:

1. Import [customers.nsf](/samples/resources/customers.nsf) to your Domino data directory. This will add a schema named `customers` to your Domino REST API server.
2. Follow the flow on [tutorial on domino operations](/samples/Tutorials%20on%20Domino%20Operations/). The first JavaScript file [create scope](/samples/Tutorials%20on%20Domino%20Operations/Basis/01_How_To_CRUD_on_Documents/00_CreateScope.js) will create a database scope called `customersdb` which will be the `dataSource` to all of our sample API implementations on our SDK.
3. Inside the [tutorial on domino operations](/samples/Tutorials%20on%20Domino%20Operations/) folder will be separated in to two; `Basis` and `Setup`. The two will use a Domino User Session based on the API we want to use.

### 🗒️ Setup credentials for running samples

The samples need your credentials to access your Domino REST API server. To set this up, we have two methods.

#### 📃 Using credentials.json

First is creating a a `credentials.json` in root with the following format:

```json
{
  "baseUrl": "{{Rest API or other Idp's URL}}",
  "credentials": {
    "scope": "$DATA,$SETUP",
    "type": "basic",
    "username": "{{Username}}",
    "password": "{{Password}}"
  }
}
```

#### 📄 Using .env

Another method is to use .env, which VS code reads if you run a sample using the VS Code built in **Run and debug**.

```env
BASE_URL={{Rest API or other Idp's URL}}
USERNAME={{Username}}
PASSWORD={{Password}}
SCOPE=$DATA,$SETUP
TYPE=basic
```

### 🔴 Running an example

1. The examples relies on the transpiled JavaScript files generated in the `dist` by TypeScript. In order to have that, we must first build it using: `npm run build`
2. Now, everything is set! All that's left is to try and run one of the examples. This can be done using by clicking `run` or `debug` in VS Code's built in debugger, or by typing in the terminal: `node <path to target js file>`

## 👀 Generic implementation (without helper functions)

We also have an example on how to use the SDK without using the helper functions we used on the Tutorials. You can review the example on:

- [create a document from scratch](/samples/Tutorials%20on%20Domino%20Operations/create_a_document_from_scratch.js)
- [create a generic request](/samples/Tutorials%20on%20Domino%20Operations/create_a_generic_request.js)

## 🔭 References

For more information, please go to our official [Domino REST API documentation](https://opensource.hcltechsw.com/Domino-rest-api/index.html).

# Domino REST API Node.js SDK unit tests

## 📝 Create a keypair for test runs

We use a sample cert for running some of the tests.
These certs are not stored in the repository, you have
to create them:

```shell
mkdir -p .testcerts
cd .testcerts
ssh-keygen -t rsa -b 4096 -m PEM -f private.key
openssl rsa -in private.key -pubout -outform PEM -out public.key.pub
cd ..
```

## ⏺️ Running the tests

You can run the tests via:

```sh
npm run test
```

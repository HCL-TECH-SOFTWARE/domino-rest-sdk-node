const credentialsJson = require('../../credentials.json');

exports.getCredentials = () => {
  let credentialsToUse;
  if (process.env.BASE_URL && process.env.USERNAME && process.env.PASSWORD) {
    credentialsToUse = {
      baseUrl: process.env.BASE_URL,
      credentials: {
        scope: process.env.SCOPE,
        type: process.env.TYPE,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
      },
    };
  } else if (credentialsJson !== undefined) {
    credentialsToUse = credentialsJson;
  } else {
    console.log('No .env file or credentials.json provided.');
  }
  return credentialsToUse;
};

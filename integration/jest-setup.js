const { webcrypto } = require('node:crypto');

global.crypto = webcrypto;


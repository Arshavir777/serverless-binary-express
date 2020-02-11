const awsServerlessExpress = require('aws-serverless-express');
const app = require('./src/app');
const binaryMimeTypes = [
  'image/gif',
  'text/css',
  'text/html',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

module.exports.express = (event, context) => awsServerlessExpress.proxy(server, event, context);

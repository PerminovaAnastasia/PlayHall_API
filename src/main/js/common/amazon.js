'use strict';

const AWS = require('aws-sdk');
const config = require('config');
const daoCommon = require('./dao');

AWS.config.update(config.get("dynamoDb"));
daoCommon.setCredentials(config.get("dynamoDb"));

module.exports = {
  //docClient: new AWS.DynamoDB.DocumentClient(),
  logoS3: new AWS.S3({
    params: {
      Bucket:
        config.get("bucketLogo")
    }
  }),
  daoCommon: daoCommon
};
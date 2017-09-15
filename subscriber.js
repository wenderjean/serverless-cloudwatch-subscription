'use strict';

const AWS = require('aws-sdk');
const CloudWatchLogs = new AWS.CloudWatchLogs();
const FN = process.env.SEND_LOGS_TO_ES;
const FN_NAME = FN.split(':').reverse()[0];

const subscribe = (logGroupName) => {
  const options = {
    destinationArn: FN,
    logGroupName,
    filterName: 'loggs',
    filterPattern: ''
  };

  return new Promise((resolve, reject) => {
    CloudWatchLogs.putSubscriptionFilter(options, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

module.exports.handler = (event, context, callback) => {
  const log = event.detail.requestParameters.logGroupName;

  if (log === `/aws/lambda/${FN_NAME}`) {
    callback(null, 'IGNORE ITSELF');
  } else {
    subscribe(log);
    callback(null, 'SUCCESS');
  }
};

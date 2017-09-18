const { merge, reduce } = require('lodash/fp');

const getName = (logGroup) => logGroup.split('/').reverse()[0];

const getVersion = (logStream) => {
  let start = logStream.indexOf('[');
  let end = logStream.indexOf(']');
  return logStream.substring(start + 1, end);
};

const sys = (logGroup, logStream, timestamp, event) => {
  const requestId = event.substr(event.indexOf('RequestId: ') + 11, 36);
  const log = {
    type: 'sys',
    requestId,
    '@timestamp': new Date(timestamp),
    name: getName(logGroup),
    version: getVersion(logStream)
  };
  const extra = {};

  event.split('\t').forEach((info) => {
    if (info.indexOf('RequestId') == -1 && info.indexOf(':') > 0) {
      const [key, value] = info.split(':');
      extra[key.trim().replace(/\s/g, '_').toLowerCase()] = value.trim();
    }
  });

  return merge(log, extra);
};

const log = (event) => {
  const [timestamp, requestId, error] = event.split('\t', 3);
  if (timestamp && requestId && error && !isNaN(Date.parse(timestamp))) {
    return {
      type: 'log',
      requestId,
      '@timestamp': timestamp,
      message: error
    };
  }
};

module.exports = { sys, log };

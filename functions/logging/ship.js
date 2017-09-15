'use strict';

const { get, map } = require('lodash/fp');
const uuid = require('uuid');
const zlib = require('zlib');

const Elasticsearch = require('elasticsearch').Client({
  host: process.env.ELASTICSEARCH_URL
});

const wait = (promises) => Promise.all(promises);

const unzip = (phrase) => {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(phrase, 'base64');
    zlib.unzip(buffer, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer.toString());
    });
  });
};

const ship = (body) => {
  return Elasticsearch.create({
    index: 'platform',
    type: 'logging',
    id: uuid.v1(),
    body
  });
};

const handler = (event, context, callback) => {
  return Promise.resolve(event)
  .then(get('Records'))
  .then(map('kinesis.data'))
  .then(map(unzip))
  .then(wait)
  .then(map(ship))
  .then(wait)
  .then(() => callback(null))
  .catch((err) => callback(err));
};

module.exports = { handler };

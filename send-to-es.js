'use strict';

const Elasticsearch = require('elasticsearch');
const Zlib = require('zlib');
const Uuid = require('uuid');

const Client = Elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL
});

const unzip = (payload) => {
	return new Promise((resolve, reject) => {
		Zlib.gunzip(payload, (err, result) => {
			if (err) {
				reject(err);
			}
			resolve(result.toString('utf8'));
		});
	});
};

const send = ({ index, type }) => (body) => {
  return Client.create({ index, type, id: Uuid.v1(), body });
};

const handler = (event, context, callback) => {
	const payload = new Buffer(event.awslogs.data, 'base64');
	const ship = send({ index: 'platform', type: 'logging' });

	return Promise.resolve(payload)
		.then(unzip)
		.then(JSON.parse)
		.then((events) => {
  		return events.logEvents.map(ship);
  	})
  	.then((promises) => Promise.all(promises))
  	.then(() => callback(null, 'SENT'))
  	.catch((err) => callback(err));
};

module.exports = { handler };
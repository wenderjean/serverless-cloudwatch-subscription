'use strict';

module.exports.handler = (event, context, callback) => {
  console.log('ERROR', new Error('#abc'));
  callback(new Error('TESTE WENDER'));
};
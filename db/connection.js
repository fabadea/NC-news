const knex = require('knex');
const config = require('../knexfile');

const ENV = process.env.NODE_ENV || 'test';

module.exports = knex(config[ENV]);

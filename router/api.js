const api = require('express').Router();
const topicRouter = require('./topicRoute');

api.use('/topics', topicRouter);

module.exports = api;

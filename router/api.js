const api = require('express').Router();
const topicsRouter = require('./topicsRoute');
const articlesRouter = require('./articlesRoute');
const commentsRouter = require('./articlesRoute');
const usersRouter = require('./usersRoute');
const { getEndpoint } = require('../controllers/apiEndpoints');

api.route('/').get(getEndpoint);
api.use('/topics', topicsRouter);
api.use('/articles', articlesRouter);
api.use('/comments', commentsRouter);
api.use('/users', usersRouter);

module.exports = api;

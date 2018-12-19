const topicsRouter = require('express').Router();
const {
  getAllTopics,
  postTopic,
  getArticlesByTopic,
  postArticleByTopic,
} = require('../controllers/topics');
const { handle405 } = require('../errors/errorhandlers');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postTopic)
  .all(handle405);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postArticleByTopic)
  .all(handle405);

module.exports = topicsRouter;

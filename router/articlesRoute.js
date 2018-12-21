const articlesRouter = require('express').Router();

const {
  getAllArticles,
  getArticleByArticle_id,
  patchArticleWithVotes,
  deleteArticleByArticle_id,
} = require('../controllers/articles');
const {
  getCommentsByArticle_id,
  postCommentByArticle_id,
  patchCommentWithVotes,
  deleteCommentByArticle_id,
} = require('../controllers/comments');
const { handle405 } = require('../errors/errorhandlers');

articlesRouter
  .route('/')
  .get(getAllArticles)
  .all(handle405);

articlesRouter
  .route('/:article_id')
  .get(getArticleByArticle_id)
  .patch(patchArticleWithVotes)
  .delete(deleteArticleByArticle_id)
  .all(handle405);

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticle_id)
  .all(handle405);

articlesRouter
  .route('/:article_id/comments/:comment_id')
  .post(postCommentByArticle_id)
  .patch(patchCommentWithVotes)
  .delete(deleteCommentByArticle_id)
  .all(handle405);

module.exports = articlesRouter;

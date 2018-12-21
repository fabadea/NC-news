const connection = require('../db/connection');

exports.getCommentsByArticle_id = (req, res, next) => {
  const { article_id } = req.params;
  const {
    limit = 10,
    sort_by = 'created_at',
    sort_ascending = 'false',
    p = 1,
  } = req.query;
  if (Math.sign(limit) !== 1 || Math.sign(p) !== 1) {
    return next({
      code: '22P02',
    });
  }
  return connection
    .select(
      'comment_id',
      'comments.votes',
      'comments.created_at',
      'articles.username AS author',
      'comments.body',
    )
    .from('comments')
    .rightJoin('articles', 'articles.article_id', '=', 'comments.article_id')
    .where('articles.article_id', '=', `${article_id}`)
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? 'asc' : 'desc')
    .offset((p - 1) * limit)
    .then((comments) => {
      if (comments[0].comment_id === null) {
        return Promise.reject({
          status: 404,
          message: 'Page not found',
        });
      }
      return res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticle_id = (req, res, next) => {
  const { article_id } = req.params;
  const commentToAdd = { ...req.body, article_id };
  return connection('comments')
    .insert(commentToAdd)
    .returning('*')
    .then(comment => res.status(201).send({ comment }))
    .catch(next);
};

exports.patchCommentWithVotes = (req, res, next) => {
  const { article_id, comment_id } = req.params;
  if (typeof req.body.inc_votes === 'string') return next({ code: '22P02' });
  const inc_votes = req.body.inc_votes === undefined ? 0 : req.body.inc_votes;
  return connection('comments')
    .select('*')
    .where('article_id', article_id)
    .where('comment_id', comment_id)
    .modify((comQuery) => {
      if (inc_votes >= 0) comQuery.increment('votes', inc_votes);
      else comQuery.decrement('votes', inc_votes);
    })
    .returning('*')
    .then((comment) => {
      if (comment.length === 0) return Promise.reject({ status: 404, message: 'Page not found' });
      [comment] = comment;
      return res.status(200).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentByArticle_id = (req, res, next) => {
  const { article_id, comment_id } = req.params;
  return connection('comments')
    .select('*')
    .where('article_id', article_id)
    .where('comment_id', comment_id)
    .del()
    .returning('*')
    .then((comment) => {
      if (comment.length === 0) return Promise.reject({ status: 404, message: 'Page not found' });
      return res.status(204).send({});
    })
    .catch(next);
};

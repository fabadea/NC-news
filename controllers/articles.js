const connection = require('../db/connection');

exports.getAllArticles = (req, res, next) => {
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
  return connection()
    .select(
      'articles.username as author',
      'title',
      'articles.article_id',
      'articles.body',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .from('articles')
    .leftJoin('comments', 'articles.article_id', '=', 'comments.article_id')
    .count('comments as comment_count')
    .groupBy('articles.article_id', 'articles.username')
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? 'asc' : 'desc')
    .offset((p - 1) * limit)
    .then((articles) => {
      if (articles.length === 0) return Promise.reject({ status: 404, msg: 'Page not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleByArticle_id = (req, res, next) => {
  const { article_id } = req.params;
  return connection('articles')
    .select(
      'articles.article_id',
      'articles.username as author',
      'title',
      'articles.votes',
      'articles.body',
      'articles.created_at',
      'topic',
    )
    .leftJoin('comments', 'articles.article_id', '=', 'comments.article_id')
    .count('comments as comment_count')
    .where('articles.article_id', '=', `${article_id}`)
    .groupBy('articles.article_id', 'articles.username')
    .then((article) => {
      if (article.length === 0) {
        return next({ status: 404, msg: 'Page not found' });
      }
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleWithVotes = (req, res, next) => {
  if (typeof req.body.inc_votes === 'string') return next({ code: '22P02' });
  const inc_votes = req.body.inc_votes === undefined ? 0 : req.body.inc_votes;
  const { article_id } = req.params;
  return connection('articles')
    .select('*')
    .where('article_id', article_id)
    .modify((articleQuery) => {
      if (inc_votes >= 0) articleQuery.increment('votes', inc_votes);
      else articleQuery.decrement('votes', Math.abs(inc_votes));
    })
    .returning('*')
    .then((article) => {
      if (article.length === 0) return Promise.reject({ status: 404, message: 'Page not found' });
      [article] = article;
      return res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteArticleByArticle_id = (req, res, next) => {
  const { article_id } = req.params;
  connection('articles')
    .select('*')
    .where('articles.article_id', '=', `${article_id}`)
    .del()
    .returning('*')
    .then((article) => {
      if (article.length === 0) {
        return Promise.reject({
          status: 404,
          message: 'Page not found',
        });
      }
      return res.status(204).send({});
    })
    .catch(next);
};

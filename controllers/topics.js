const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection('topics')
    .select('*')
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then(([postedTopic]) => res.status(201).send({ postedTopic }))
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
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
      'articles.article_id',
      'title',
      'articles.votes',
      'articles.created_at',
      'topic',
      'articles.username as author',
    )
    .from('comments')
    .rightJoin('articles', 'articles.article_id', '=', 'comments.article_id')
    .where('articles.topic', topic)
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

exports.postArticleByTopic = function (req, res, next) {
  const { topic } = req.params;
  const articleToAdd = { ...req.body, topic };
  return connection('articles')
    .insert(articleToAdd)
    .returning('*')
    .then(article => res.status(201).send({ article }))
    .catch(next);
};

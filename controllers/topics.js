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
  const {
    limit = 10,
    sort_by = 'created_at',
    sort_ascending = 'false',
    p = 1,
  } = req.query;
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
    .where('articles.topic', req.params.topic)
    .count('comments as comment_count')
    .groupBy('articles.article_id', 'articles.username')
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? 'asc' : 'desc')
    .offset((p - 1) * limit)
    .then((articles) => {
      if (/[^\d]/g.test(limit) || /[^\d]/g.test(p)) {
        return next({
          status: 400,
        });
      }
      if (articles.length === 0) {
        return next({ status: 404, message: 'Page not found' });
      }
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.postArticleByTopic = function (req, res, next) {
  const { topic } = req.params;
  const { title, username, body } = req.body;
  return connection('articles')
    .insert({
      title,
      topic,
      body,
      username,
      created_at: new Date(),
    })
    .returning('*')
    .then(article => res.status(201).send(article))
    .catch(next);
};

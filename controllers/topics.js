const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection('topics')
    .select('*')
    .then((topics) => {
      res.status(200).json(topics);
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then(([addedTopic]) => {
      res.status(201).json(addedTopic);
    })
    .catch(next);
};


exports.getArticlesByTopic = (req, res, next) => {
  const { limit = 10, sort_by = "articles.created_at", sort_ascending = "true", p = 0 } = req.query;
  /*
  SELECT articles.article_id, title, articles.votes, articles.created_at, users.username AS author, comment_id FROM articles
  JOIN topics ON articles.topic = topics.slug
  LEFT JOIN users ON articles.username = users.username
  JOIN comments ON articles.article_id = comments.article_id
  WHERE slug = 'mitch';
  */
  return connection("articles")
    .select("articles.article_id", "title", "articles.votes", "articles.created_at", "topic", "users.username as author")
    .join("topics", "articles.topic", "topics.slug")
    .leftJoin("users", "articles.username", "=", "users.username")
    .where("articles.topic", req.params.topic)
    .leftJoin("comments", "articles.article_id", "=", "comments.article_id")
    .count("comments as comment_count")
    .groupBy("articles.article_id", "users.username")
    .limit(limit)
    .orderBy(sort_by, sort_ascending ? "asc" : "desc")
    .offset(p * limit)
    .then(articles => {
      return res.status(200).send({ articles });
    })
    .catch(next);
};


exports.postArticleByTopic = (req, res, next) => {
  req.body.topic = req.params.topic;
  connection
    .insert(req.body)
    .returning("*")
    .into("articles")
    .then(article => {
      res.status(201).send({ article: article[0] });
    })
    .catch(next);
};
const { topicData, userData } = require('../db/data');
const { formatArticlesData, formatCommentsData } = require('../db/utils/index');

exports.seed = function (knex, Promise) {
  return Promise.all([
    knex('topics').del(),
    knex('users').del(),
    knex('articles').del(),
    knex('comments').del(),
  ])
    .then(() => knex('topics').insert(topicData))
    .then(() => knex('users').insert(userData))
    .then(() => {
      const updatedArticleData = formatArticlesData();
      return knex('articles')
        .returning(['article_id', 'title'])
        .insert(updatedArticleData);
    })
    .then((articles_table) => {
      const updatedCommentsData = formatCommentsData(articles_table);
      return knex('comments').insert(updatedCommentsData);
    });
};

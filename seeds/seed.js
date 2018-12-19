const {
  userData,
  topicData,
  articleData,
  commentData,
} = require('../db/data/index');
const {
  artDateFormat,
  makeUserLookup,
  makeArticleLookup,
  formatArticles,
} = require('../db/utils/index');

exports.seed = function (knex, Promise) {
  return Promise.all([
    knex('comments').del(),
    knex('articles').del(),
    knex('users').del(),
    knex('topics').del(),
  ])
    .then(() => knex('topics')
      .insert(topicData)
      .returning('*'))
    .then(() => knex('users')
      .insert(userData)
      .returning('*'))
    .then((users) => {
      const userLookup = makeUserLookup(users);
      const dataFormatted = artDateFormat(articleData, userLookup);
      return Promise.all([
        knex('articles')
          .insert(dataFormatted)
          .returning('*'),
        userLookup,
      ]);
    })
    .then((articlesRows) => {
      const [articles, users] = articlesRows;
      const articleLookup = makeArticleLookup(articles);
      const formattedArtis = formatArticles(commentData, articleLookup, users);
      return knex('comments').insert(formattedArtis);
    });
};

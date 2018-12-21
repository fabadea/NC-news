const { articleData, commentData } = require('../data');

exports.formatArticlesData = function () {
  return articleData.map(({ created_at, created_by, ...restObj }) => ({
    created_at: new Date(created_at),
    username: created_by,
    ...restObj,
  }));
};

exports.formatCommentsData = function (articles_table) {
  return commentData.map(
    ({
      belongs_to, created_by, created_at, ...restObj
    }) => {
      const matchedArticle = articles_table.filter(
        article => article.title === belongs_to,
      );
      return {
        article_id: matchedArticle[0].article_id,
        created_at: new Date(created_at),
        username: created_by,
        ...restObj,
      };
    },
  );
};

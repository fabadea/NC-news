exports.artDateFormat = (articleData, lookupObj) => articleData.map((article) => {
  const usefulArt = {};
  usefulArt.title = article.title;
  usefulArt.topic = article.topic;
  usefulArt.body = article.body;
  usefulArt.votes = article.votes;
  usefulArt.created_at = new Date(article.created_at);
  usefulArt.username = lookupObj[article.username];
  return usefulArt;
});

exports.makeUserLookup = userData => userData.reduce((acc, user) => {
  const key = user.username;
  acc[key] = user.username;
  return acc;
}, {});

exports.makeArticleLookup = articleData => articleData.reduce((acc, article) => {
  acc[article.title] = article.article_id;
  return acc;
}, {});

exports.formatArticles = (commentData, articleLookup, userLookup) => commentData.map((comment) => {
  const usefulCom = {};
  usefulCom.username = userLookup[comment.username];
  usefulCom.article_id = articleLookup[comment.belongs_to];
  usefulCom.created_at = new Date(comment.created_at);
  usefulCom.votes = comment.votes;
  usefulCom.body = comment.body;
  return usefulCom;
});

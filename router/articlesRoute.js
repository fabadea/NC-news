const articlesRouter = require("express").Router();
const { getAllArticles } = require("../controllers/topics");
const { handle405 } = require("../errors/errorhandlers");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .all(handle405);

module.exports = articlesRouter;

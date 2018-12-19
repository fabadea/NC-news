const router = require('express').Router();
const {
  getAllTopics,
  postTopic,
  getArticlesByTopic,
  postArticleByTopic
} = require("../controllers/topics");

router.route('/').get(getAllTopics);
router.route('/').post(postTopic);
router
  .route("/:topic/articles")
  .get(getArticlesByTopic)
  .post(postArticleByTopic);

module.exports = router;

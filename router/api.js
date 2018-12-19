const api = require("express").Router();
const topicsRouter = require("./topicsRoute");
const articlesRouter = require("./articlesRoute");

api.use("/topics", topicsRouter);
api.use("/topics", articlesRouter);

module.exports = api;

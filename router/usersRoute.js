const usersRouter = require('express').Router();
const { getAllUsers, getUserByUsername } = require('../controllers/users');
const { handle405 } = require('../errors/errorhandlers');

usersRouter
  .route('/')
  .get(getAllUsers)
  .all(handle405);

usersRouter
  .route('/:username')
  .get(getUserByUsername)
  .all(handle405);

module.exports = usersRouter;

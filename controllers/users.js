const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  connection('users')
    .select('*')
    .then(users => res.status(200).send({ users }))
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  // if (typeof +req.params.username !== "string") return next({ code: "22P02" });
  connection('users')
    .select()
    .where('username', '=', username)
    .then(user => res.status(200).send({ user }));
};

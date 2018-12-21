exports.handle404 = (err, req, res, next) => {
  if (err.status === 404) res.status(404).send({ msg: 'Page not found' });
  if (err.code === '23503' && err.constraint === 'articles_topic_foreign') res.status(404).send({ message: 'Topic does not exist' });
  else next(err);
};

exports.handle400 = (err, req, res, next) => {
  const codes = {
    42703: 'Bad request, invalid format',
    '22P02': 'Bad request, invalid data type',
  };
  if (codes[err.code]) res.status(400).send({ msg: codes[err.code] });
  else next(err);
};

exports.handle405 = (req, res, next) => res.status(405).send({
  msg: 'Method not allowed, you should be more specific with path/endpoint',
});

exports.handle422 = (err, req, res, next) => {
  const codes = {
    23503: 'violates foreign key constraint',
    23505: 'This key already exists',
  };
  if (codes[err.code]) res.status(422).send({ msg: codes[err.code] });
  else next(err);
};

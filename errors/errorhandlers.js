exports.handle404 = (err, req, res, next) => {
  if (err.status === 404) res.status(404).send({ msg: 'Page not found' });
  else next(err);
};

exports.handle400 = (err, req, res, next) => {
  const codes = {
    42703: 'Bad request, malformed body',
    '22P02': 'Bad request, invalid data type',
  };
  if (codes[err.code]) res.status(400).send({ msg: codes[err.code] });
  else next(err);
};

exports.handle405 = (req, res, next) => res.status(405).send({
  msg: 'Method not allowed, you should be more specific with path/endpoint',
});

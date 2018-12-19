exports.handle404 = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({
      msg: "Page not found"
    });
  }
  next(err);
};

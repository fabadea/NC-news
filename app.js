const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const router = require('./router/api');
const { handle400, handle404, handle422 } = require('./errors/errorhandlers');

app.use(bodyParser.json());
app.use('/api', router);
app.use('/*', (req, res, next) => {
  next({ status: 404, msg: 'Page not found' });
});
app.use(handle400);
app.use(handle404);
app.use(handle422);

app.use((err, req, res, next) => {
  res.status(500).json({
    msg: 'Server error',
  });
});

module.exports = app;

const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const router = require('./router/api');

app.use(bodyParser.json());
app.use('/api', router);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    msg: 'Server error',
  });
});

module.exports = app;

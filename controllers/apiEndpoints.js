exports.getEndpoint = (req, res, next) => {
  const endpoints = [
    {
      endpoint: 'api/topics',
      GET: 'responds with an array of topic objects',
      POST: 'responds with the posted topic object',
    },
    {
      endpoint: '/api/topics/:topic/articles',
      GET: 'responds with an array of article objects for a given topic',
      POST: 'responds with the posted article',
    },
    {
      endpoint: '/api/articles',
      GET:
        'responds with an array of article objects You can query using limit, sort_by, p and sort_ascending',
    },
    {
      endpoint: '/api/articles/:article_id',
      GET: 'responds with an article object',
      PATCH:
        'accepts an object in the form { inc_votes: newVote } that allows you to upVote or downVote an article',
      DELETE:
        'delete the article using the article_id and respond with an empty object',
    },
    {
      endpoint: '/api/articles/:article_id/comments',
      GET: 'responds with an array of comments for the given article_id',
      POST:
        'accepts an object with a username and body and responds with the posted comment',
    },
    {
      endpoint: '/api/articles/:article_id/comments/:comment_id',
      PATCH:
        'accepts an object in the form { inc_votes: newVote } that allows you to upVote or downVote an article',
      DELETE:
        'delete the given comment by comment_id and respond with an empty object',
    },
    {
      endpoint: '/api/users',
      GET: 'responds with an array of all the users',
    },
    {
      endpoint: '/api/users/:user_id',
      GET: 'request reponds with an object containing data for the chosen user',
    },
  ];
  res.status(200).send({ endpoints });
};

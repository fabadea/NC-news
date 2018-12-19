\c test_nc_news;
\dt;



SELECT articles.article_id, title, articles.votes, articles.created_at, users.username AS author
FROM articles
LEFT JOIN users ON articles.username = users.username
LEFT JOIN comments ON articles.article_id = comments.article_id
JOIN topics ON articles.topic = topics.slug
WHERE slug = 'mitch';

SELECT *
FROM users;

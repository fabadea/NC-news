process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const request = supertest(app);
const connection = require('../db/connection');


describe('/api', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => {
    connection.destroy();
  });
  describe('/topics', () => {
    it('GET method returns status 200 and all topics', () => request
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body[0]).to.have.all.keys('slug', 'description');
        expect(body).to.have.length(2);
        expect(body[0].slug).to.equal('mitch');
      }));
    it('POST method returns status 201 and the added object topic table is updated with new info', () => request
      .post('/api/topics')
      .send({ slug: 'dog', description: 'Not cats' })
      .expect(201)
      .then((res) => {
        expect(res.body).to.have.all.keys('slug', 'description');
        expect(res.body.slug).to.equal('dog');
        expect(res.body.description).to.equal('Not cats');
      }));
    it('POST method returns status 400 for ', () => request
      .post('/api/topics')
      .send({ slug: 'pidou', description:  })
      .expect(400)
      );
  });
  describe('/:topics', () => {
    describe('/articles', () => {
      it('GET method returns status 200 and an array of article objects', () => request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.an('Array');
          expect(articles.length).to.equal(10);
          expect(articles[0]).to.have.all.keys(['author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic']);
          expect(articles[0].topic).to.equal('mitch');
        }));
      it('GET responds with 200 and the articles skip first page, with 10 articles and return articles ffrom next page', () => request.get('/api/topics/mitch/articles?p=1')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].title).to.equal("Living in the shadow of a great man");
        }));
      it('GET responds with 200 and the articles are sorted by the title column', () => request.get('/api/topics/mitch/articles?sort_by=title')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].title).to.equal('A');
        }));
      it('GET responds with 200 and the articles are sorted ascendingly', () => request.get('/api/topics/mitch/articles?sort_ascending=true')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].title).to.equal('Moustache');
        }));
      it('POST responds with 201 and the article is in the correct format', () => {
        const newArticle = { title: "Some text here as title", body: "Text, but more detatails", username: "mohamed" };
        return request
          .post("/api/topics/mohamed/articles")
          .send(newArticle)
          .expect(201)
          .then(({ body }) => {
            expect(body.article).to.have.all.keys("article_id", "title", "body", "votes", "topic", "username", "created_at");
          });
      });
    });
  });
});


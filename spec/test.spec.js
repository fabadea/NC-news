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
        expect(body.topics[0]).to.have.all.keys('slug', 'description');
        expect(body.topics).to.have.length(2);
        expect(body.topics[0].slug).to.equal('mitch');
      }));
    it('POST method returns status 201 and the added object topic table is updated with new info', () => request
      .post('/api/topics')
      .send({ slug: 'dog', description: 'Not cats' })
      .expect(201)
      .then(({ body }) => {
        expect(body.postedTopic).to.have.all.keys('slug', 'description');
        expect(body.postedTopic.slug).to.equal('dog');
        expect(body.postedTopic.description).to.equal('Not cats');
      }));
    it('PATCH method returns status 405, you should be more specific with path/endpoint', () => request
      .patch('/api/topics')
      .send({ slug: 'sddasd', description: 'eccwom' })
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).to.equal(
          'Method not allowed, you should be more specific with path/endpoint',
        );
      }));
    it('DELETE method returns status 405, you should be more specific with path/endpoint', () => request
      .delete('/api/topics')
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).to.equal(
          'Method not allowed, you should be more specific with path/endpoint',
        );
      }));
  });

  describe('/:topics', () => {
    describe('/articles', () => {
      it('GET method returns status 200 and an array of article objects', () => request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an('array');
          expect(body.articles.length).to.be.oneOf([10, 11]); // there are 11 articles, limit=10
          expect(body.articles[0]).to.have.all.keys([
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'topic',
          ]);
          expect(body.articles[0].topic).to.equal('mitch');
        }));
      it('GET method and sort ascending query responds with 200 and correct sort order', () => request
        .get('/api/topics/mitch/articles?sort_ascending=true')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(12);
          expect(body.articles[9].article_id).to.equal(2);
        }));
      it('GET method and page && limit queries responds with 200 and correct items when page and limit are specified', () => request
        .get('/api/topics/mitch/articles?p=2&&limit=4')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(8);
        }));
      it('GET method and sort_by query responds with 200 and correct sort criteria if sort_by specified', () => request
        .get('/api/topics/mitch/articles?sort_by=title')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(6);
          expect(body.articles[9].article_id).to.equal(9);
        }));
      it('POST status:201 responds with a newly added article', () => request
        .post('/api/topics/mitch/articles')
        .send({
          title: 'some text',
          username: 'rogersop',
          body: 'related to title but more details',
        })
        .expect(201)
        .then(({ body }) => {
          expect(body[0]).to.have.all.keys(
            'article_id',
            'title',
            'body',
            'votes',
            'topic',
            'username',
            'created_at',
            'updated_at',
          );
          expect(body[0].article_id).to.eql(13);
          expect(body[0].body).to.eql('related to title but more details');
          expect(body[0].title).to.eql('some text');
          expect(body[0].votes).to.eql(0);
          expect(body[0].username).to.eql('rogersop');
          expect(body[0].topic).to.eql('mitch');
        }));
    });
  });
});

process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);
const connection = require('../db/connection');

describe('/', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => {
    connection.destroy();
  });
  it('GET method returns status 404, no endpoint available for this url', () => request
    .get('/noEndpointforUrl')
    .expect(404)
    .then((res) => {
      expect(res.body.msg).to.equal('Page not found');
    }));
  describe('/api', () => {
    it('GET method returns status 404, no endpoint available for this url', () => request
      .get('/api/noEndpointforUrl')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).to.eql('Page not found');
      }));
    it('GET method responds with 200 and returns all available endpoints', () => request
      .get('/api')
      .expect(200)
      .then((res) => {
        expect(res.body.endpoints.length).to.eql(8);
      }));
    describe('/topics', () => {
      it('GET method returns status 200 and all topics', () => request
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics[0]).to.have.all.keys('slug', 'description');
          expect(body.topics).to.have.length(2);
          expect(body.topics[0].slug).to.equal('mitch');
        }));
      it('POST method returns status 201 and the added object, topic table is updated with new info', () => request
        .post('/api/topics')
        .send({ slug: 'dog', description: 'Not cats' })
        .expect(201)
        .then(({ body }) => {
          expect(body.postedTopic).to.have.all.keys('slug', 'description');
          expect(body.postedTopic.slug).to.equal('dog');
          expect(body.postedTopic.description).to.equal('Not cats');
        }));
      it('POST method returns status 422 if client enters non-unique slug', () => request
        .post('/api/topics')
        .send({
          description: 'Some text here',
          slug: 'mitch',
        })
        .expect(422)
        .then((res) => {
          expect(res.body.msg).to.equal('This key already exists');
        }));
      it('POST method returns status 400 for malformed data entries (column name)', () => request
        .post('/api/topics')
        .send({
          slg: 'dogs',
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.eql('Bad request, invalid format');
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

      describe('/:topic/articles', () => {
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
        it('GET method returns status 200 and an array of article objects with a combination of queries', () => request
          .get('/api/topics/mitch/articles?limit=2&sort_ascending=true&p=3')
          .expect(200)
          .then((res) => {
            expect(res.body.articles[0].article_id).to.equal(8);
            expect(res.body.articles).to.have.length(2);
          }));
        it('GET method and sort_by query responds with 200 and correct sort criteria if sort_by specified', () => request
          .get('/api/topics/mitch/articles?sort_by=title')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].article_id).to.equal(6);
            expect(body.articles[9].article_id).to.equal(9);
          }));
        it('POST method returns status 201 and responds with a newly added article', () => request
          .post('/api/topics/mitch/articles')
          .send({
            title: 'some text',
            username: 'rogersop',
            body: 'related to title but more details',
          })
          .expect(201)
          .then(({ body }) => {
            expect(body.article[0]).to.have.all.keys(
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'username',
              'created_at',
              'updated_at',
            );
            expect(body.article[0].article_id).to.eql(13);
            expect(body.article[0].body).to.eql(
              'related to title but more details',
            );
            expect(body.article[0].title).to.eql('some text');
            expect(body.article[0].votes).to.eql(0);
            expect(body.article[0].username).to.eql('rogersop');
            expect(body.article[0].topic).to.eql('mitch');
          }));
        it("POST method return status 422 if the client provides a username that doesn't exist", () => {
          const newArticle = {
            title: 'title here',
            username: 111,
            body: 'Some txt here',
          };
          request
            .post('/api/topics/mitch/articles')
            .send(newArticle)
            .expect(422)
            .then((res) => {
              expect(res.body.msg).to.equal('violates foreign key constraint');
            });
        });
        it('POST method return status 404 for adding an article to an non-existing topic', () => {
          const newArticle = {
            title: 'text',
            username: 'nonexisting',
            body: 'another text',
          };
          request
            .post('/api/topics/nonexisting/articles')
            .send(newArticle)
            .expect(404)
            .then((res) => {
              expect(res.body.msg).to.equal('Topic does not exist');
            });
        });
        it('GET method returns status with 400 if client enters a incorrect syntax for p value', () => request
          .get('/api/topics/mitch/articles?p=puppies')
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('Bad request, invalid data type');
          }));
        it('GET method returns status 404 if client enters topic that does not exist but incorrect syntax', () => request
          .get('/api/topics/string/articles')
          .expect(404)
          .then((res) => {
            expect(res.body.msg).to.equal('Page not found');
          }));
        it('GET method return status 400 if client enters a limit in incorrect syntax', () => request
          .get('/api/topics/mitch/articles?limit=notAnInteger')
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('Bad request, invalid data type');
          }));
        it('GET method return status 400 if client enters a incorrect syntax for p value', () => request
          .get('/api/topics/mitch/articles?p=anythingElse')
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('Bad request, invalid data type');
          }));
      });
    });

    describe('/articles', () => {
      it('GET method returns status 200 and all articles', () => request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).to.have.all.keys(
            'article_id',
            'author',
            'body',
            'comment_count',
            'created_at',
            'title',
            'topic',
            'votes',
          );
          expect(body.articles.length).to.be.oneOf([10, 14]);
          expect(body.articles[0].title).to.equal('Moustache');
        }));
      it('GET method and sort ascending query responds with 200 and correct sort order', () => request
        .get('/api/articles?sort_ascending=true')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(12);
          expect(body.articles[9].article_id).to.equal(3);
        }));
      it('GET method and page && limit queries responds with 200 and correct items when page and limit are specified', () => request
        .get('/api/articles?p=2&&limit=4')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(8);
        }));
      it('GET method and sort_by query responds with 200 and correct sort criteria if sort_by specified', () => request
        .get('/api/articles?sort_by=title')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(6);
          expect(body.articles[9].article_id).to.equal(9);
        }));
      it('POST method returns status 405, you should be more specific with path/endpoint', () => request
        .post('/api/articles')
        .send({ slug: 'dog', description: 'Not cats' })
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal(
            'Method not allowed, you should be more specific with path/endpoint',
          );
        }));
      it('PATCH method returns status 405, you should be more specific with path/endpoint', () => request
        .patch('/api/articles')
        .send({ slug: 'sddasd', description: 'eccwom' })
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal(
            'Method not allowed, you should be more specific with path/endpoint',
          );
        }));
      it('DELETE method returns status 405, you should be more specific with path/endpoint', () => request
        .delete('/api/articles')
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal(
            'Method not allowed, you should be more specific with path/endpoint',
          );
        }));

      describe('/article_id', () => {
        it('GET method returns status 200 and the selected by id article object', () => request
          .get('/api/articles/3')
          .expect(200)
          .then(({ body }) => {
            expect(body.article[0]).to.be.an('object');
            expect(body.article[0]).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'body',
              'comment_count',
              'created_at',
              'topic',
              'votes',
            );
          }));
        it('GET method returns status 400 if client enters article_id of wrong data type', () => request
          .get('/api/articles/texthere')
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('Bad request, invalid data type');
          }));
        it('GET method returns status 404 if client enters article_id that does not exist', () => request
          .get('/api/articles/11111')
          .expect(404)
          .then((res) => {
            expect(res.body.msg).to.equal('Page not found');
          }));
        it('PATCH method returns status 200 and increases votes by value passed', () => request
          .patch('/api/articles/2')
          .send({ inc_votes: 1 })
          .expect(200)
          .then((res) => {
            expect(res.body.article.votes).to.equal(1);
          }));
        it('PATCH method returns status 200 and upates votes even if value is negative', () => {
          const vote = { inc_votes: -5 };
          request
            .patch('/api/articles/3')
            .send(vote)
            .expect(200)
            .then((res) => {
              expect(res.body.article.votes).to.equal(-5);
            });
        });
        it('PATCH method returns status 200 and an unaltered article if no data is given', () => request
          .patch('/api/articles/3')
          .send()
          .expect(200)
          .then((res) => {
            expect(res.body.article.votes).to.equal(0);
          }));
        it('PATCH method returns status 400 if client tries to update votes with an incorrect data type', () => {
          const vote = { inc_votes: 'some text' };
          request
            .patch('/api/articles/3')
            .send(vote)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).to.equal('Bad request, invalid data type');
            });
        });
        it('PATCH method returns status 404 if client tries to update votes on non-existent article_id', () => {
          const vote = { inc_votes: 4 };
          request
            .patch('/api/articles/11111')
            .send(vote)
            .expect(404)
            .then((res) => {
              expect(res.body.msg).to.equal('Page not found');
            });
        });
        it('DELETE method returns status 204 and and an empty object', () => request
          .delete('/api/articles/10')
          .expect(204)
          .then((res) => {
            expect(res.body).to.eql({});
          })
          .then(() => request.get('/api/articles/10').expect(404))
          .then((res) => {
            expect(res.body.msg).to.equal('Page not found');
          }));
        it('DELETE method returns status 404 if client tries to delete an article that does not exist', () => request
          .delete('/api/articles/1111')
          .expect(404)
          .then((res) => {
            expect(res.body.msg).to.equal('Page not found');
          }));
        it('DELETE method returns status 400 if client tries to delete an article given in incorrect syntax', () => request
          .delete('/api/articles/sometext')
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('Bad request, invalid data type');
          }));

        describe('/comments', () => {
          it('GET method returns status 200 and an array of comments with default queries', () => request
            .get('/api/articles/1/comments')
            .expect(200)
            .then((res) => {
              expect(res.body.comments).to.have.length(10);
              expect(res.body.comments[0].comment_id).to.equal(18);
            }));
          it('GET method returns status 404 if for a specific article there are no comments', () => request
            .get('/api/articles/4/comments')
            .expect(404)
            .then((res) => {
              expect(res.body.msg).to.equal('Page not found');
            }));
          it('GET method returns status 400 if client enters an article_id with incorrect syntax', () => request
            .get('/api/articles/sometext/comments')
            .expect(400)
            .then((res) => {
              expect(res.body.msg).to.equal('Bad request, invalid data type');
            }));
          it('GET method and page && limit queries responds with 200 and correct items when page and limit are specified', () => request
            .get('/api/topics/mitch/articles?p=2&&limit=4')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles[0].article_id).to.equal(8);
            }));

          it('GET method returns status 400 if client enters a limit in incorrect syntax for limit value', () => request
            .get('/api/articles/1/comments?limit=sometext')
            .expect(400)
            .then((res) => {
              expect(res.body.msg).to.equal('Bad request, invalid data type');
            }));
          it('GET method returns status 200 and applies sort_by query if client provides one', () => request
            .get('/api/articles/1/comments?sort_by=votes')
            .expect(200)
            .then((res) => {
              expect(res.body.comments[0].author).to.eql('butter_bridge');
              expect(res.body.comments[2].comment_id).to.eql(5);
            }));
          it('GET method returns status 400 if client enters a limit in incorrect syntax for p value', () => request
            .get('/api/articles/1/comments?p=sometext')
            .expect(400)
            .then((res) => {
              expect(res.body.msg).to.equal('Bad request, invalid data type');
            }));
          it('GET method returns status 200 and applies multiple ordering if client provides one', () => request
            .get(
              '/api/articles/1/comments?sort_by=comment_id&sort_ascending=true',
            )
            .expect(200)
            .then((res) => {
              expect(res.body.comments[0].comment_id).to.eql(2);
            }));

          it('POST method returns status 201 and the posted object with username and body', () => {
            const newComment = {
              username: 'rogersop',
              body: 'some text heres',
            };
            request
              .post('/api/articles/1/comments')
              .send(newComment)
              .expect(201)
              .then((res) => {
                expect(res.body.comment.body).to.eql('some text heres');
              });
          });
          it('POST method returns status 400 for malformed data entries', () => {
            const newComment = { username: 111 };
            request
              .post('/api/articles/111/comments')
              .send(newComment)
              .expect(400)
              .then((res) => {
                expect(res.body.msg).to.equal('Bad request, invalid data type');
              });
          });
          it("POST method returns status 404 if client tries to post a comment to an article that doesn't exist", () => {
            const newComment = { username: 'flaviu', body: 'some text here' };
            request
              .post('/api/articles/111/comments')
              .send(newComment)
              .expect(404)
              .then((res) => {
                expect(res.body.msg).to.equal('Page not found');
              });
          });
          it("POST method returns status 422 if client enters an username that doesn't exist", () => {
            const newComment = {
              username: 'alex',
              body: 'some text for a new comment',
            };
            request
              .post('/api/articles/1/comments')
              .send(newComment)
              .expect(422)
              .then((res) => {
                expect(res.body.msg).to.equal(
                  'violates foreign key constraint',
                );
              });
          });

          describe('/:comment_id', () => {
            it('PATCH method returns status 200 and updates the votes on a comment with a positive number', () => {
              const newVote = { inc_votes: -1 };
              request
                .patch('/api/articles/1/comments/2')
                .send(newVote)
                .expect(200)
                .then((res) => {
                  expect(res.body.comment.votes).to.equal(19);
                });
            });

            it('PATCH method returns status 200 and updates the votes on a comment with a negative number', () => {
              const newVote = { inc_votes: -1 };
              request
                .patch('/api/articles/1/comments/2')
                .send(newVote)
                .expect(200)
                .then((res) => {
                  expect(res.body.comment.votes).to.equal(9);
                });
            });
            it('PATCH method returns status 400 if client tries to update vote with an incorrect data type', () => {
              const newVote = { inc_votes: 'sometext' };
              request
                .patch('/api/articles/1/comments/2')
                .send(newVote)
                .expect(400)
                .then((res) => {
                  expect(res.body.msg).to.equal(
                    'Bad request, invalid data type',
                  );
                });
            });
            it('PATCH method returns status 404 if client tries to update vote of a non-existent comment', () => {
              const newVote = { inc_votes: 11 };
              request
                .patch('/api/articles/1/comments/11111')
                .send(newVote)
                .expect(404)
                .then((res) => {
                  expect(res.body.msg).to.equal('Page not found');
                });
            });
            it('DELETE method returns status 204 and returns and empty object', () => request
              .delete('/api/articles/1/comments/2')
              .expect(204)
              .then((res) => {
                expect(res.body).to.eql({});
              }));
            it('DELETE method returns status 404 if client tries to delete a comment that does not exist', () => request
              .delete('/api/articles/1/comments/111')
              .expect(404)
              .then((res) => {
                expect(res.body.msg).to.equal('Page not found');
              }));
            it('DELETE method returns status 404 if client tries to delete an comment on an article that does not exist', () => request
              .delete('/api/articles/111/comments/111')
              .expect(404)
              .then((res) => {
                expect(res.body.msg).to.equal('Page not found');
              }));
            it('DELETE method returns status 400 if client tries to delete an comment on an article_id entered with incorrect syntax', () => request
              .delete('/api/articles/somestring/comments/2')
              .expect(400)
              .then((res) => {
                expect(res.body.msg).to.equal(
                  'Bad request, invalid data type',
                );
              }));
            it('DELETE method returns status 400 if client tries to delete an comment on an article with comment_id in incorrect syntax', () => request
              .delete('/api/articles/1/comments/somestring')
              .expect(400)
              .then((res) => {
                expect(res.body.msg).to.equal(
                  'Bad request, invalid data type',
                );
              }));
          });
        });
      });
    });
    describe('/users', () => {
      it('GET method returns status 200 and an array of user objects', () => request
        .get('/api/users')
        .expect(200)
        .then((res) => {
          expect(res.body.users).to.have.length(3);
          expect(res.body.users[0].name).to.equal('jonny');
          expect(res.body.users[0]).to.have.all.keys([
            'username',
            'avatar_url',
            'name',
          ]);
        }));
      it('DELETE method returns status 405, you should be more specific with path/endpoint', () => request
        .delete('/api/users')
        .expect(405)
        .then((res) => {
          expect(res.body.msg).to.equal(
            'Method not allowed, you should be more specific with path/endpoint',
          );
        }));
      it('PATCH method returns status 405, you should be more specific with path/endpoint', () => request
        .patch('/api/topics')
        .send({ slug: 'sddasd', description: 'eccwom' })
        .expect(405)
        .then((res) => {
          expect(res.body.msg).to.equal(
            'Method not allowed, you should be more specific with path/endpoint',
          );
        }));
      describe('username', () => {
        it('GET method returns status 200 and a user object', () => request
          .get('/api/users/rogersop')
          .expect(200)
          .then((res) => {
            expect(res.body.user[0]).to.have.all.keys([
              'username',
              'avatar_url',
              'name',
            ]);
          }));
        // it("GET method returns status 404 if the client enters a username that doesn't exist", () =>
        //   request
        //     .get("/api/users/flaviu")
        //     .expect(404)
        //     .then(res => {
        //       console.log(req.params.username);

        //       expect(res.body.msg).to.equal("Page not found");
        //     }));
        // it("GET method returns status 400 if the client enters a username in the incorrect syntax", () =>
        //   request
        //     .get("/api/users/111")
        //     .expect(400)
        //     .then(res => {
        //       expect(res.body.msg).to.equal("Bad request, invalid data type");
        //     }));
      });
    });
  });
});

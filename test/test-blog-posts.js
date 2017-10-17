const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {Blog} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  console.log('seeding blog data');
  const seedData = [];

  for(let i=0; i< 10; i++) {
    seedData.push(generateBlogData());
  }
  return Blog.insertMany(seedData);
}

function generateBlogData() {
  return {
    title: faker.lorem.sentence(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    content: faker.lorem.text()
  };
}

function tearDownDb() {
  console.warn('deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blogs API resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return all existing blogs' function() {
      let res;
      return chai.request(app)
        .get('/posts').then(function(_res) {
            res = _res;
            res.should.have.status(200);
            res.body.blogs.should.have.length.of.at.least(1);
            return Blog.count();
        }).then(function(count) {
          res.body.blogs.should.have.length.of(count);
        });
    });

    it('should return blogs with right fields', function() {
      let resBlog;
      return chai.request(app).get('/posts').then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.blogs.should.be.a('array');
          res.body.blogs.should.have.length.of.at.least(1);
          res.body.blogs.forEach(function(blog) {
            blog.should.be.a('object');
            blog.should.include.keys(
              'id', 'title', 'author', 'content');
          });
          resBlog = res.body.blogs[0];
          return Blog.findById(resBlog.id);
        }).then(function(blog) {
          resBlog.id.should.equal(blog.id);
          resBlog.title.should.equal(blog.title);
          resBlog.author.should.equal(blog.author);
          resBlog.content.should.equal(blog.content);
        });
    });
  });

  describe('POST endpoint', function() {
    it('should add a new blog', function() {
      const newBlog = generateBlogData();
      return chai.request(app)
        .post('/posts')
        .send(newBlog)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'author', 'content');
          res.body.title.should.equal(newBlog.title);
          res.body.id.should.not.be.null;
          res.body.author.should.equal(newBlog.author);
          res.body.content.should.equal(newBlog.content);
          return Blog.findById(res.body.id);
        })
        .then(function(blog) {
          blog.title.should.equal(newBlog.title);
          blog.author.should.equal(newBlog.author);
          blog.content.should.equal(newBlog.content);
        });
    });
  });

  describe('PUT endpoint', function() {
    it('should update fields you send over', function() {
      const updateData = {
        title: 'another title',
        content: 'more content'
      };

      return Blog
        .findOne().then(function(blog) {
          updateData.id = blog.id;
          return chai.request(app)
            .put(`/posts/${blog.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);

          return Blog.findById(updateData.id);
        })
        .then(function(blog) {
          blog.title.should.equal(updateData.title);
          blog.content.should.equal(updateData.content);
        });
      });
  });

  describe('DELETE endpoint', function() {
    it('delete a blog by id', function() {
      let blog;
      return blog.findOne().then(function(_blog) {
          blog = _blog;
          return chai.request(app).delete(`/posts/${blog.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Blog.findById(blog.id);
        })
        .then(function(_blog) {
          should.not.exist(_blog);
        });
    });
  });
});

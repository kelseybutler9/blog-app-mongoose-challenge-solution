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
    it('should return all existing restaurants' function() {
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
  });

})

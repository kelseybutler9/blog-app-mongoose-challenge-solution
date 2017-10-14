const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');

const.app = express();
app.use(bodyParser.json());

app.get('/posts'), (req, res) => {
  Blog.find().limit(10).then(posts => {
    res.json({
      blogs: blogs.map(
        (blog) => blog.apiRepr())
    });
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });
};

app.get('/posts/:id', (req, res) => {
  Blog.findByID(req.params.id).then(blog => res.json(blog.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

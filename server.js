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

app.post('/posts', (req, res) => {
  const requireFields = ['title', 'author', 'content'];

  for (let i=0; i < requireFields.length; i++){
      const field = requireFields[i];
      if(!(field in req.body)) {
        const message = `Missing ${field} in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
  }

  Blog.create({
    title: req.body.title,
    author: req.body.author,
    content: req.body.content})
    .then(blog => res.status(201).json(blog.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message; 'Internal server error'});
    });
});

app.put('/posts/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'author', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Blog.findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

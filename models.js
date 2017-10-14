const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
   title: {type: String, required: true},
   author: {
     firstName: String,
     lastName: String
   },
   content: {type: String}
});

blogSchema.virtual('authorString').get(function() {
  return `${this}.author.firstName ${this}.author.lastName`;
});

blogSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorString,
    content: this.content
  };
};

const Blog = mongoose.model('Blogs', blogSchema);

module.exports = {Blogs};

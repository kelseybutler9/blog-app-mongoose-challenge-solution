const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
   title: {type: String, required: true},
   author: {
     firstName: String,
     lastName: String
   },
   content: {type: String},
   created: {type: Date, default: Date.now}
});

blogSchema.virtual('authorString').get(function() {
  return `${this}.author.firstName ${this}.author.lastName`.trim();
});

blogSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorString,
    content: this.content,
    created: this.created
  };
};

const BlogPost = mongoose.model('BlogPost', blogSchema);

module.exports = {BlogPost};

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: String,
  authorName: String,
  text: String,
  ts: { type: Number, default: Date.now }
}, { _id: false });

const postSchema = new mongoose.Schema({
  author:     { type: String, required: true },   // username
  authorName: { type: String, required: true },
  text:       { type: String, required: true, maxlength: 500 },
  likes:      [{ type: String }],                 // usernames who liked
  comments:   [commentSchema],
  ts:         { type: Number, default: Date.now }
});

postSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    author: this.author,
    authorName: this.authorName,
    text: this.text,
    likes: this.likes,
    comments: this.comments,
    ts: this.ts
  };
};

module.exports = mongoose.model('Post', postSchema);

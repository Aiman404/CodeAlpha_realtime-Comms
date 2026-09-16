const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true },   // bcrypt hash, never plain text
  bio:         { type: String, default: 'New here — say hello' },
  following:   [{ type: String }],                 // usernames this user follows
  followers:   [{ type: String }]
}, { timestamps: true });

// What the API sends to the browser. Password is never included.
userSchema.methods.toPublic = function () {
  return {
    username: this.username,
    displayName: this.displayName,
    email: this.email,
    bio: this.bio,
    following: this.following,
    followers: this.followers,
    joined: this.createdAt.getTime()
  };
};

module.exports = mongoose.model('User', userSchema);

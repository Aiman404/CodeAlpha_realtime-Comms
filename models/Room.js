const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: String, name: String, text: String, ts: Number
}, { _id: false });

const fileSchema = new mongoose.Schema({
  id: String, name: String, size: Number, type: String,
  data: String,              // base64 data URL (keep files small)
  sharedBy: String, ts: Number
}, { _id: false });

const roomSchema = new mongoose.Schema({
  code:     { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },   // bcrypt hash
  owner:    String,
  messages: [messageSchema],
  files:    [fileSchema]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);

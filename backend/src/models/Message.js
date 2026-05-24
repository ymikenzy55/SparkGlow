const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  read: { type: Boolean, default: false },
  repliedAt: { type: Date },
  replies: [{
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  userReadReplies: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

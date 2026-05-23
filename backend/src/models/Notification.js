const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['new_order', 'low_stock', 'new_message', 'new_user'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // e.g. '/admin/orders', '/admin/products', '/admin/messages'
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed }, // extra metadata
}, { timestamps: true });

notificationSchema.index({ read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

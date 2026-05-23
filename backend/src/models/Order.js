const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    region: String,
    location: String,
  },
  items: [orderItemSchema],
  shippingAddress: {
    region: { type: String },
    location: { type: String },
    // Keep legacy fields for existing orders
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  paymentMethod: { type: String, default: 'momo' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  notes: String,
  trackingNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

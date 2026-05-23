const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, default: 0, min: 0 },
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  featured: { type: Boolean, default: false },
  tags: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);

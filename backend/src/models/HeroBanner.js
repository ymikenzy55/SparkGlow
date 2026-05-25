const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  cta: { type: String, default: 'Shop Now', trim: true },
  link: { type: String, default: '/shop', trim: true },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HeroBanner', heroBannerSchema);

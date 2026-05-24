const Product = require('../models/Product');

// Helper to normalize tags to an array
const normalizeTags = (product) => {
  if (product && product.tags) {
    if (typeof product.tags === 'string') {
      product.tags = product.tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (!Array.isArray(product.tags)) {
      product.tags = [];
    }
  }
  return product;
};

exports.getProducts = async (req, res) => {
  const { page = 1, limit = 12, category, sort, search, featured, minPrice, maxPrice } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;
  if (featured === 'true') query.featured = true;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { tags: { $regex: search, $options: 'i' } },
  ];
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    popular: { sold: -1 },
    rating: { rating: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  let [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query),
  ]);

  // Normalize tags for all products
  products = products.map(normalizeTags);

  res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.getProduct = async (req, res) => {
  const isId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isId ? { _id: req.params.id, isActive: true } : { slug: req.params.id, isActive: true };
  let product = await Product.findOne(query)
    .populate('category', 'name slug')
    .populate('reviews.user', 'name');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  // Normalize tags
  product = normalizeTags(product.toObject ? product.toObject() : product);
  
  res.json({ success: true, product });
};

exports.searchProducts = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, products: [] });
  let products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  }).populate('category', 'name slug').limit(15).lean();
  
  // Normalize tags
  products = products.map(normalizeTags);
  
  res.json({ success: true, products });
};

exports.getFeatured = async (req, res) => {
  let products = await Product.find({ featured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .lean();
  
  // Normalize tags
  products = products.map(normalizeTags);
  
  res.json({ success: true, products });
};

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const already = product.reviews.find(r => r.user?.toString() === req.user._id.toString());
  if (already) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ success: true, message: 'Review added successfully' });
};

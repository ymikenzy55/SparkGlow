const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res) => {
  const categories = await Category.find().lean();
  res.json({ success: true, categories });
};

exports.getCategory = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const { page = 1, limit = 12, sort, search } = req.query;
  const query = { category: category._id, isActive: true };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }];

  const sortMap = { newest: { createdAt: -1 }, 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, popular: { sold: -1 } };
  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(query),
  ]);
  res.json({ success: true, category, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

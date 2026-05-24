const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

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

exports.getDashboard = async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueResult, recentOrders, lowStock] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').lean(),
    Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock price').limit(10).lean(),
  ]);
  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
    },
    recentOrders,
    lowStock,
  });
};

exports.getProducts = async (req, res) => {
  const { page = 1, limit = 20, search, category } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
  if (category) query.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  let [products, total] = await Promise.all([
    Product.find(query).populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(query),
  ]);
  
  // Normalize tags for all products
  products = products.map(normalizeTags);
  
  res.json({ success: true, products, total, pages: Math.ceil(total / Number(limit)), page: Number(page) });
};

exports.createProduct = async (req, res) => {
  const productData = { ...req.body };
  
  // Handle uploaded images from Cloudinary
  if (req.files && req.files.length > 0) {
    productData.images = req.files.map(file => file.path); // Cloudinary returns full URL in file.path
  } else if (req.body.images) {
    // Handle URL-based images (backward compatibility)
    productData.images = Array.isArray(req.body.images) ? req.body.images : req.body.images.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // Process tags: split comma-separated string into array
  if (productData.tags) {
    productData.tags = Array.isArray(productData.tags) 
      ? productData.tags 
      : productData.tags.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  const product = await Product.create(productData);
  await product.populate('category', 'name slug');
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('product-created', product);
  }
  
  res.status(201).json({ success: true, product });
};

exports.updateProduct = async (req, res) => {
  const productData = { ...req.body };
  
  // Handle uploaded images from Cloudinary
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    const oldProduct = await Product.findById(req.params.id);
    if (oldProduct && oldProduct.images) {
      for (const img of oldProduct.images) {
        if (img.includes('cloudinary.com')) {
          // Extract public_id from Cloudinary URL
          const publicId = img.split('/').slice(-2).join('/').split('.')[0];
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
          }
        }
      }
    }
    productData.images = req.files.map(file => file.path); // Cloudinary returns full URL
  } else if (req.body.images) {
    // Handle URL-based images (backward compatibility)
    productData.images = Array.isArray(req.body.images) ? req.body.images : req.body.images.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // Process tags: split comma-separated string into array
  if (productData.tags !== undefined) {
    productData.tags = Array.isArray(productData.tags) 
      ? productData.tags 
      : productData.tags.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true }).populate('category', 'name');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('product-updated', product);
  }
  
  res.json({ success: true, product });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  // Delete associated images from Cloudinary
  if (product.images) {
    for (const img of product.images) {
      if (img.includes('cloudinary.com')) {
        // Extract public_id from Cloudinary URL
        const publicId = img.split('/').slice(-2).join('/').split('.')[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
    }
  }
  
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('product-deleted', req.params.id);
  }
  
  res.json({ success: true, message: 'Product deleted' });
};

exports.getOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.$or = [
    { 'guestInfo.email': { $regex: search, $options: 'i' } },
    { 'guestInfo.name': { $regex: search, $options: 'i' } },
    { 'customerInfo.name': { $regex: search, $options: 'i' } },
    { 'customerInfo.email': { $regex: search, $options: 'i' } },
    { trackingNumber: { $regex: search, $options: 'i' } },
  ];
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, total, pages: Math.ceil(total / Number(limit)), page: Number(page) });
};

exports.getOrderDetail = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone address')
    .populate('items.product', 'name images price')
    .lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};

exports.updateOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  // Emit socket event
  const io = req.app.get('io');
  io.emit('order-updated', order);
  if (order.user) {
    io.to(`user-${order.user._id}`).emit('order-status-changed', order);
  }
  
  res.json({ success: true, order });
};

exports.deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  // Emit socket event
  const io = req.app.get('io');
  io.emit('order-deleted', req.params.id);
  
  res.json({ success: true, message: 'Order deleted' });
};

exports.getUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, total, pages: Math.ceil(total / Number(limit)) });
};

exports.getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  // Get user's orders
  const orders = await Order.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('total status paymentStatus createdAt items')
    .lean();
  
  // Calculate user stats
  const stats = await Order.aggregate([
    { $match: { user: user._id, paymentStatus: 'paid' } },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$total' },
        totalOrders: { $sum: 1 }
      }
    }
  ]);
  
  const userStats = stats[0] || { totalSpent: 0, totalOrders: 0 };
  
  res.json({ 
    success: true, 
    user: {
      ...user,
      stats: userStats,
      recentOrders: orders
    }
  });
};

exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find().lean();
  res.json({ success: true, categories });
};

exports.createCategory = async (req, res) => {
  const categoryData = { ...req.body };
  
  // Handle uploaded image from Cloudinary
  if (req.file) {
    categoryData.image = req.file.path; // Cloudinary returns full URL
  }
  
  const category = await Category.create(categoryData);
  res.status(201).json({ success: true, category });
};

exports.updateCategory = async (req, res) => {
  const categoryData = { ...req.body };
  
  // Handle uploaded image from Cloudinary
  if (req.file) {
    // Delete old image from Cloudinary
    const oldCategory = await Category.findById(req.params.id);
    if (oldCategory && oldCategory.image && oldCategory.image.includes('cloudinary.com')) {
      const publicId = oldCategory.image.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }
    categoryData.image = req.file.path; // Cloudinary returns full URL
  }
  
  const category = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  
  // Delete associated image from Cloudinary
  if (category.image && category.image.includes('cloudinary.com')) {
    const publicId = category.image.split('/').slice(-2).join('/').split('.')[0];
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Error deleting image from Cloudinary:', err);
    }
  }
  
  res.json({ success: true, message: 'Category deleted' });
};

// ==================== SALES ====================

exports.getSales = async (req, res) => {
  const { startDate, endDate } = req.query;
  const matchStage = { paymentStatus: 'paid' };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = end;
    }
  }
  
  const salesByDate = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        itemsSold: { $sum: { $sum: '$items.quantity' } }
      }
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        orderCount: 1,
        itemsSold: 1
      }
    }
  ]);
  
  const stats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        totalSales: { $sum: { $sum: '$items.quantity' } }
      }
    }
  ]);
  
  const statsData = stats[0] || { totalRevenue: 0, totalOrders: 0, totalSales: 0 };
  statsData.avgOrderValue = statsData.totalOrders > 0 ? statsData.totalRevenue / statsData.totalOrders : 0;
  
  res.json({ success: true, sales: salesByDate, stats: statsData });
};

// ==================== SETTINGS ====================// ==================== SETTINGS ====================

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords are required' });
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword)))
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

exports.changeEmail = async (req, res) => {
  const { newEmail, password } = req.body;
  if (!newEmail || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(password)))
    return res.status(400).json({ success: false, message: 'Password is incorrect' });
  const exists = await User.findOne({ email: newEmail });
  if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
  user.email = newEmail;
  await user.save();
  res.json({ success: true, message: 'Email updated successfully', user });
};

exports.getAdmins = async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('name email createdAt').lean();
  res.json({ success: true, admins });
};

exports.addAdmin = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found with that email' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'User is already an admin' });
  user.role = 'admin';
  await user.save();
  res.json({ success: true, message: `${user.name} is now an admin`, admin: { _id: user._id, name: user.name, email: user.email } });
};

exports.removeAdmin = async (req, res) => {
  if (req.params.id === req.user._id.toString())
    return res.status(400).json({ success: false, message: 'You cannot remove yourself as admin' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role !== 'admin') return res.status(400).json({ success: false, message: 'User is not an admin' });
  user.role = 'user';
  await user.save();
  res.json({ success: true, message: `${user.name} has been removed as admin` });
};

exports.deleteAdmin = async (req, res) => {
  if (req.params.id === req.user._id.toString())
    return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: `${user.name} has been deleted` });
};

// ==================== NOTIFICATIONS ====================

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50).lean();
  const unreadCount = await Notification.countDocuments({ read: false });
  res.json({ success: true, notifications, unreadCount });
};

exports.markNotificationRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
};

exports.markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ success: true });
};

// ==================== MESSAGES ====================

exports.getMessages = async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 }).lean();
  const unreadCount = await Message.countDocuments({ read: false });
  res.json({ success: true, messages, unreadCount });
};

exports.markMessageRead = async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
};

exports.deleteMessage = async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Message deleted' });
};

// ==================== IMAGE UPLOAD ====================

exports.uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No images uploaded' });
  }
  const imageUrls = req.files.map(file => file.path); // Cloudinary returns full URLs
  res.json({ success: true, images: imageUrls });
};

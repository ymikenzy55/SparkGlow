const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, guestInfo, customerInfo, notes } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ success: false, message: 'No items in order' });

  // Build customer info from either authenticated user or guest input
  let finalCustomerInfo = {};
  if (req.user) {
    finalCustomerInfo = {
      name: customerInfo?.name || req.user.name,
      email: customerInfo?.email || req.user.email,
      phone: customerInfo?.phone || req.user.phone || '',
      region: customerInfo?.region || shippingAddress?.region || '',
      location: customerInfo?.location || shippingAddress?.location || '',
    };
  } else {
    if (!customerInfo?.name && !guestInfo?.name)
      return res.status(400).json({ success: false, message: 'Name is required' });
    if (!customerInfo?.email && !guestInfo?.email)
      return res.status(400).json({ success: false, message: 'Email is required' });
    finalCustomerInfo = {
      name: customerInfo?.name || guestInfo?.name,
      email: customerInfo?.email || guestInfo?.email,
      phone: customerInfo?.phone || guestInfo?.phone || '',
      region: customerInfo?.region || shippingAddress?.region || '',
      location: customerInfo?.location || shippingAddress?.location || '',
    };
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: `Product not found` });
    if (product.stock < item.quantity)
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.price,
      quantity: item.quantity,
    });
    subtotal += product.price * item.quantity;
  }

  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const orderData = {
    items: orderItems,
    customerInfo: finalCustomerInfo,
    shippingAddress: shippingAddress || { region: finalCustomerInfo.region, location: finalCustomerInfo.location },
    paymentMethod: paymentMethod || 'momo',
    subtotal,
    shipping,
    total,
    notes,
  };

  // Handle guest info for backwards compatibility
  if (req.user) {
    orderData.user = req.user._id;
  } else {
    orderData.guestInfo = {
      name: finalCustomerInfo.name,
      email: finalCustomerInfo.email,
      phone: finalCustomerInfo.phone,
    };
  }

  const order = await Order.create(orderData);
  
  // Decrement stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
  }

  // Check for low stock and create notifications
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product && product.stock <= 5) {
      await Notification.create({
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} has only ${product.stock} items left`,
        link: '/admin/products',
        data: { productId: product._id },
      });
    }
  }

  // Create new order notification for admin
  await Notification.create({
    type: 'new_order',
    title: 'New Order Received',
    message: `Order from ${finalCustomerInfo.name} — GH₵ ${total.toFixed(2)}`,
    link: '/admin/orders',
    data: { orderId: order._id },
  });

  // Emit socket events
  const io = req.app.get('io');
  if (io) {
    io.to('admin-room').emit('new-order', order);
    io.to('admin-room').emit('new-notification', {
      type: 'new_order',
      title: 'New Order Received',
      message: `Order from ${finalCustomerInfo.name} — GH₵ ${total.toFixed(2)}`,
    });
  }

  await order.populate('items.product', 'name images');
  res.status(201).json({ success: true, order });
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images price')
    .lean();
  res.json({ success: true, orders });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images price')
    .populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  // Allow guests to view via order ID, and authenticated users to view their own orders
  if (order.user && req.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Access denied' });
  res.json({ success: true, order });
};

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');
const upload = require('../utils/upload');

router.use(protect, adminOnly);

router.get('/dashboard', ctrl.getDashboard);
router.get('/products', ctrl.getProducts);
router.post('/products', upload.array('images', 5), ctrl.createProduct);
router.put('/products/:id', upload.array('images', 5), ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);
router.post('/upload-images', upload.array('images', 5), ctrl.uploadImages);
router.get('/orders', ctrl.getOrders);
router.get('/orders/:id', ctrl.getOrderDetail);
router.put('/orders/:id', ctrl.updateOrder);
router.delete('/orders/:id', ctrl.deleteOrder);
router.get('/users', ctrl.getUsers);
router.get('/users/:id', ctrl.getUserDetail);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/categories', ctrl.getCategories);
router.post('/categories', upload.single('image'), ctrl.createCategory);
router.put('/categories/:id', upload.single('image'), ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

// Settings
router.put('/settings/password', ctrl.changePassword);
router.put('/settings/email', ctrl.changeEmail);
router.get('/admins', ctrl.getAdmins);
router.post('/admins', ctrl.addAdmin);
router.put('/admins/:id/remove', ctrl.removeAdmin);
router.delete('/admins/:id', ctrl.deleteAdmin);

// Notifications
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/:id/read', ctrl.markNotificationRead);
router.put('/notifications/read-all', ctrl.markAllNotificationsRead);

// Messages
router.get('/messages', ctrl.getMessages);
router.put('/messages/:id/read', ctrl.markMessageRead);
router.post('/messages/:id/reply', ctrl.replyToMessage);
router.delete('/messages/:id', ctrl.deleteMessage);

// Sales
router.get('/sales', ctrl.getSales);

module.exports = router;

const Message = require('../models/Message');
const Notification = require('../models/Notification');

exports.getMyMessages = async (req, res) => {
  const messages = await Message.find({ email: req.user.email })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, messages });
};

exports.markMyRepliesRead = async (req, res) => {
  await Message.updateMany(
    { email: req.user.email, userReadReplies: false },
    { userReadReplies: true }
  );
  res.json({ success: true });
};

exports.sendMessage = async (req, res) => {
  const { name, email, subject, body } = req.body;
  if (!name || !email || !subject || !body)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  const message = await Message.create({ name, email, subject, body });

  // Create notification for admin
  await Notification.create({
    type: 'new_message',
    title: 'New Message',
    message: `${name} sent a message: ${subject}`,
    link: '/admin/messages',
    data: { messageId: message._id },
  });

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to('admin-room').emit('new-message', message);
    io.to('admin-room').emit('new-notification', {
      type: 'new_message',
      title: 'New Message',
      message: `${name}: ${subject}`,
    });
  }

  res.status(201).json({ success: true, message: 'Message sent successfully!' });
};

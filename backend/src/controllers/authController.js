const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  
  // Emit socket event for new user registration
  const io = req.app.get('io');
  if (io) {
    io.to('admin-room').emit('new-user-registered', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  }
  
  res.status(201).json({ success: true, token, user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const token = signToken(user._id);
  res.json({ success: true, token, user });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword)))
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

// Google OAuth Success Callback
exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      console.error('No user in request after Google OAuth');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
    }

    console.log('Google OAuth successful for user:', req.user.email);
    
    // User is authenticated via passport
    const token = signToken(req.user._id);
    
    // Emit socket event for new Google user (if newly created)
    const io = req.app.get('io');
    if (io && req.user.createdAt && (Date.now() - new Date(req.user.createdAt).getTime() < 5000)) {
      io.to('admin-room').emit('new-user-registered', {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          createdAt: req.user.createdAt,
          provider: 'google'
        }
      });
    }
    
    console.log('JWT token generated, redirecting to frontend');
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./src/config/passport');
require('express-async-errors');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

connectDB();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Session configuration for passport
app.use(
  session({
    secret: process.env.JWT_SECRET || 'sparkglow_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Join admin room
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined:', socket.id);
  });

  // Join user room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log('User joined:', userId);
  });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/messages', require('./src/routes/messages'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'SparkGlow API' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`SparkGlow API running on port ${PORT}`));

module.exports = { io };

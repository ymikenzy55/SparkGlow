const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
  });

exports.authLimiter = createLimiter(15 * 60 * 1000, 20, 'Too many login attempts, try again in 15 minutes');
exports.apiLimiter = createLimiter(15 * 60 * 1000, 300, 'Too many requests, please slow down');
exports.orderLimiter = createLimiter(60 * 60 * 1000, 40, 'Too many orders, please wait an hour');

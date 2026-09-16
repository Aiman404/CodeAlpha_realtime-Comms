const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reads "Authorization: Bearer <token>", verifies it, attaches req.user.
module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists.' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Session expired. Sign in again.' });
  }
};

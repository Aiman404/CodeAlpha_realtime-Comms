const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password)
      return res.status(400).json({ message: 'Fill in every field to continue.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password needs at least 6 characters.' });

    if (await User.findOne({ username: username.toLowerCase() }))
      return res.status(409).json({ message: 'That username is taken.' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'An account already uses that email.' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, displayName: name, email, password: hash });
    res.status(201).json({ token: sign(user), user: user.toPublic() });
  } catch (e) {
    res.status(500).json({ message: 'Could not create the account. Try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: (username || '').toLowerCase() });
    if (!user) return res.status(401).json({ message: 'No account with that username.' });

    const ok = await bcrypt.compare(password || '', user.password);
    if (!ok) return res.status(401).json({ message: 'Wrong password.' });

    res.json({ token: sign(user), user: user.toPublic() });
  } catch (e) {
    res.status(500).json({ message: 'Sign in failed. Try again.' });
  }
});

module.exports = router;

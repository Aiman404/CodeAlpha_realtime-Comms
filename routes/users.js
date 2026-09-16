const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/users  — everyone (for the People list and suggestions)
router.get('/', auth, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map(u => u.toPublic()) });
});

// GET /api/users/me
router.get('/me', auth, (req, res) => res.json({ user: req.user.toPublic() }));

// PUT /api/users/me  — update bio
router.put('/me', auth, async (req, res) => {
  req.user.bio = (req.body.bio || '').slice(0, 140) || 'Hello!';
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

// POST /api/users/:username/follow
router.post('/:username/follow', auth, async (req, res) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return res.status(404).json({ message: 'That account does not exist.' });
  if (target.username === req.user.username)
    return res.status(400).json({ message: 'You cannot follow yourself.' });

  if (!req.user.following.includes(target.username)) req.user.following.push(target.username);
  if (!target.followers.includes(req.user.username)) target.followers.push(req.user.username);
  await Promise.all([req.user.save(), target.save()]);
  res.json({ me: req.user.toPublic() });
});

// POST /api/users/:username/unfollow
router.post('/:username/unfollow', auth, async (req, res) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return res.status(404).json({ message: 'That account does not exist.' });

  req.user.following = req.user.following.filter(u => u !== target.username);
  target.followers = target.followers.filter(u => u !== req.user.username);
  await Promise.all([req.user.save(), target.save()]);
  res.json({ me: req.user.toPublic() });
});

module.exports = router;

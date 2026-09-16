const router = require('express').Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// GET /api/posts — newest first
router.get('/', auth, async (req, res) => {
  const posts = await Post.find().sort({ ts: -1 }).limit(200);
  res.json({ posts: posts.map(p => p.toPublic()) });
});

// POST /api/posts
router.post('/', auth, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Write something before posting.' });
  const post = await Post.create({
    author: req.user.username,
    authorName: req.user.displayName,
    text: text.slice(0, 500),
    ts: Date.now()
  });
  res.status(201).json({ post: post.toPublic() });
});

// POST /api/posts/:id/like — toggles
router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'That post is gone.' });
  const i = post.likes.indexOf(req.user.username);
  i === -1 ? post.likes.push(req.user.username) : post.likes.splice(i, 1);
  await post.save();
  res.json({ post: post.toPublic() });
});

// POST /api/posts/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Write a comment first.' });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'That post is gone.' });
  post.comments.push({
    author: req.user.username,
    authorName: req.user.displayName,
    text: text.slice(0, 200),
    ts: Date.now()
  });
  await post.save();
  res.json({ post: post.toPublic() });
});

// DELETE /api/posts/:id — only your own
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'That post is gone.' });
  if (post.author !== req.user.username)
    return res.status(403).json({ message: 'You can only delete your own posts.' });
  await post.deleteOne();
  res.json({ ok: true });
});

module.exports = router;

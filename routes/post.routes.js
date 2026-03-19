const express = require('express');
const router = express.Router();
const { createPost, getFeed, deletePost, likePost } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');

// GET  /api/posts       - Feed
// POST /api/posts       - Create post
// DELETE /api/posts/:id - Delete post
// PUT /api/posts/:id/like - Like/Unlike

router.get('/', protect, getFeed);
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);

module.exports = router;
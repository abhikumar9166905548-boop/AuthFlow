const express = require('express');
const router = express.Router();
const { createPost, getFeed, deletePost, likePost } = require('../controllers/post.controller');
const { addComment, getComments, deleteComment } = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');

// Posts
router.get('/', protect, getFeed);
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);

// Comments
router.post('/:postId/comments', protect, addComment);
router.get('/:postId/comments', protect, getComments);
router.delete('/comments/:id', protect, deleteComment);

module.exports = router;
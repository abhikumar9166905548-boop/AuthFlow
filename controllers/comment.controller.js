const Comment = require('../models/Comment.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user.id,
      content: req.body.content,
    });
    await comment.populate('user', 'name');

    // Notification for post owner
    if (post.user.toString() !== req.user.id) {
      await User.findByIdAndUpdate(post.user, {
        $push: {
          notifications: {
            type: 'comment',
            from: req.user.id,
            post: post._id,
            message: `${req.user.name} ne aapke post pe comment kiya`,
          }
        }
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

// Get comments
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
  } catch (err) { next(err); }
};

// Delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};

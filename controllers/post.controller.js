const Post = require('../models/Post.model');

// Create post
exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      user: req.user.id,
      content: req.body.content,
      image: req.body.image || null,
    });
    await post.populate('user', 'name email');
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
};

// Get all posts (feed)
exports.getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (err) { next(err); }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

// Like / Unlike post
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const liked = post.likes.includes(req.user.id);
    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.status(200).json({ success: true, liked: !liked, likes: post.likes.length });
  } catch (err) { next(err); }
};
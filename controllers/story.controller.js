const Story = require('../models/Story.model');
const User = require('../models/User.model');

// Create story
exports.createStory = async (req, res, next) => {
  try {
    const story = await Story.create({
      user: req.user.id,
      image: req.body.image,
    });
    await story.populate('user', 'name');
    res.status(201).json({ success: true, story });
  } catch (err) { next(err); }
};

// Get all active stories
exports.getStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, stories });
  } catch (err) { next(err); }
};

// View story
exports.viewStory = async (req, res, next) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, {
      $addToSet: { viewers: req.user.id }
    });
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
};

// Delete story
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    if (story.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await story.deleteOne();
    res.status(200).json({ success: true, message: 'Story deleted' });
  } catch (err) { next(err); }
};
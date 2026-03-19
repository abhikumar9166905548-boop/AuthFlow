const express = require('express');
const router = express.Router();
const { createStory, getStories, viewStory, deleteStory } = require('../controllers/story.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getStories);
router.post('/', protect, createStory);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
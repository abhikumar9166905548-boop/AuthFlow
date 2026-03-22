const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getInbox, getUnreadCount } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/inbox', protect, getInbox);
router.get('/unread', protect, getUnreadCount);
router.post('/send', protect, sendMessage);
router.get('/:userId', protect, getConversation);
router.post('/voice', protect, require('../controllers/message.controller').sendVoiceMessage);
module.exports = router;

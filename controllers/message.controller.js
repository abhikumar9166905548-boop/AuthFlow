const Message = require('../models/Message.model');
const User = require('../models/User.model');

// Send message
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content)
      return res.status(400).json({ success: false, message: 'Receiver aur message required hai' });

    const receiver = await User.findById(receiverId);
    if (!receiver)
      return res.status(404).json({ success: false, message: 'User not found' });

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });
    await message.populate('sender', 'name');
    await message.populate('receiver', 'name');

    await User.findByIdAndUpdate(receiverId, {
      $push: {
        notifications: {
          type: 'message',
          from: req.user.id,
          message: `${req.user.name} ne aapko message kiya`,
        }
      }
    });

    res.status(201).json({ success: true, message });
  } catch (err) { next(err); }
};

// Send voice message
exports.sendVoiceMessage = async (req, res, next) => {
  try {
    const { receiverId, voiceUrl, duration } = req.body;
    if (!receiverId || !voiceUrl)
      return res.status(400).json({ success: false, message: 'receiverId aur voiceUrl required hai' });

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content: '🎤 Voice Message',
      voiceUrl,
      duration: duration || 0,
      isVoice: true,
    });
    await message.populate('sender', 'name profilePhoto');

    res.status(201).json({ success: true, message });
  } catch (err) { next(err); }
};

// Get conversation
exports.getConversation = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (err) { next(err); }
};

// Get all conversations (inbox)
exports.getInbox = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .sort({ createdAt: -1 });

    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const otherId = msg.sender._id.toString() === req.user.id
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({
          user: msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender,
          lastMessage: msg.isVoice ? '🎤 Voice Message' : msg.content,
          read: msg.read,
          time: msg.createdAt,
        });
      }
    }

    res.status(200).json({ success: true, conversations });
  } catch (err) { next(err); }
};

// Unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
    });
    res.status(200).json({ success: true, count });
  } catch (err) { next(err); }
};
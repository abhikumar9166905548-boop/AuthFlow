const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      maxlength: 500,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    video: {
      type: String,
      default: null,
    },
    music: {
      type: String,
      default: null,
    },
    musicName: {
      type: String,
      default: null,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['❤️', '😂', '🔥', '😮', '😢', '👏'] },
      }
    ],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      }
    ],
    mood: {
      type: String,
      default: null,
    },
    selfDestruct: {
      type: Date,
      default: null,
    },
    closeFriendsOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto delete self-destruct posts
postSchema.index({ selfDestruct: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { selfDestruct: { $type: 'date' } } });

module.exports = mongoose.model('Post', postSchema);
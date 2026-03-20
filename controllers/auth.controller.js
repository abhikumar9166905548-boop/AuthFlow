const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    if (existing && !existing.isVerified) {
      // Update existing unverified user
      existing.name = name;
      existing.password = password;
      existing.otp = otp;
      existing.otpExpire = otpExpire;
      await existing.save();
      user = existing;
    } else {
      user = await User.create({ name, email, password, otp, otpExpire, isVerified: false });
    }

    // Send OTP email
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#7c6cfc;">Welcome to Rollera! 🎉</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your verification OTP is:</p>
        <div style="background:#f0eeff;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
          <h1 style="color:#7c6cfc;letter-spacing:8px;font-size:36px;">${otp}</h1>
        </div>
        <p style="color:#888;font-size:13px;">This OTP will expire in <strong>10 minutes</strong>.</p>
      </div>
    `;

    await sendEmail({ to: email, subject: 'Rollera - Email Verification OTP', html });

    res.status(200).json({
      success: true,
      message: 'OTP bhej diya! Email check karo',
      email,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
// ─────────────────────────────────────────────
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.otpExpire < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expire ho gaya — dobara try karo' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    sendTokenResponse(user, 200, res, 'Email verified! Welcome to Rollera 🎉');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
// ─────────────────────────────────────────────
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#7c6cfc;">New OTP Request</h2>
        <p>Your new OTP is:</p>
        <div style="background:#f0eeff;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
          <h1 style="color:#7c6cfc;letter-spacing:8px;font-size:36px;">${otp}</h1>
        </div>
        <p style="color:#888;font-size:13px;">10 minutes mein expire ho jayega.</p>
      </div>
    `;

    await sendEmail({ to: email, subject: 'Rollera - New OTP', html });
    res.status(200).json({ success: true, message: 'Naya OTP bhej diya!' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get logged in user
// @access  Private
// ─────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Logout (client just deletes token; this confirms)
// @access  Private
// ─────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block; background:#4F46E5; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color:#888; font-size:13px;">This link will expire in <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
        <hr style="border:none; border-top:1px solid #eee; margin-top:30px;" />
        <p style="color:#aaa; font-size:12px;">If the button doesn't work, copy this link: ${resetUrl}</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html,
    });

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    // Clean up tokens if email fails
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }
    next(err);
  }
};

// ─────────────────────────────────────────────
// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};
// ─────────────────────────────────────────────
// @route   GET /api/auth/users?q=search
// @desc    Search users
// @access  Private
// ─────────────────────────────────────────────
exports.searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ success: false, message: 'Query required' });
    const users = await User.find({
      name: { $regex: query, $options: 'i' }
    }).select('name email').limit(10);
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
// ─────────────────────────────────────────────
// @route   PUT /api/auth/follow/:id
// @desc    Follow / Unfollow user
// @access  Private
// ─────────────────────────────────────────────
exports.followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, message: 'Aap khud ko follow nahi kar sakte' });

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ success: false, message: 'User not found' });

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
      res.status(200).json({ success: true, following: false, message: 'Unfollow ho gaya' });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user.id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user.id } });
      // Notification
      await User.findByIdAndUpdate(req.params.id, {
        $push: {
          notifications: {
            type: 'follow',
            from: req.user.id,
            message: `${req.user.name} ne aapko follow kiya`,
          }
        }
      });
      res.status(200).json({ success: true, following: true, message: 'Follow ho gaya' });
    }
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/notifications
// @desc    Get notifications
// @access  Private
// ─────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('notifications.from', 'name');
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    // Mark all as read
    await User.findByIdAndUpdate(req.user.id, {
      $set: { 'notifications.$[].read': true }
    });
    res.status(200).json({ success: true, notifications });
  } catch (err) { next(err); }
};
// ─────────────────────────────────────────────
// @route   PUT /api/auth/profile/update
// @desc    Update bio and profile photo
// @access  Private
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { bio, profilePhoto } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, profilePhoto },
      { new: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   PUT /api/auth/posts/:id/save
// @desc    Save / Unsave post
// @access  Private
// ─────────────────────────────────────────────
exports.savePost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.id;
    const saved = user.savedPosts.includes(postId);
    if (saved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }
    await user.save();
    res.status(200).json({ success: true, saved: !saved });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/posts/saved
// @desc    Get saved posts
// @access  Private
// ─────────────────────────────────────────────
exports.getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedPosts',
      populate: { path: 'user', select: 'name' }
    });
    res.status(200).json({ success: true, posts: user.savedPosts });
  } catch (err) { next(err); }
};
// ─────────────────────────────────────────────
// @route   PUT /api/auth/block/:id
// @desc    Block / Unblock user
// @access  Private
// ─────────────────────────────────────────────
exports.blockUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, message: 'Aap khud ko block nahi kar sakte' });

    const currentUser = await User.findById(req.user.id);
    const isBlocked = currentUser.blockedUsers.includes(req.params.id);

    if (isBlocked) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: req.params.id } });
      res.status(200).json({ success: true, blocked: false, message: 'Unblock ho gaya' });
    } else {
      await User.findByIdAndUpdate(req.user.id, { $push: { blockedUsers: req.params.id } });
      res.status(200).json({ success: true, blocked: true, message: 'Block ho gaya' });
    }
  } catch (err) { next(err); }
};
// ─────────────────────────────────────────────
// @route   GET /api/auth/suggestions
// @desc    Get friend suggestions
// @access  Private
// ─────────────────────────────────────────────
exports.getSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const following = currentUser.following || [];
    const blocked = currentUser.blockedUsers || [];

    // Find users not followed and not blocked
    const suggestions = await User.find({
      _id: {
        $ne: req.user.id,
        $nin: [...following, ...blocked]
      }
    })
    .select('name profilePhoto bio followers')
    .limit(10);

    res.status(200).json({ success: true, suggestions });
  } catch (err) { next(err); }
};
// ─────────────────────────────────────────────
// @route   PUT /api/auth/verify/:id
// @desc    Give/Remove verification badge (admin only)
// @access  Private
// ─────────────────────────────────────────────
exports.toggleVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isVerifiedBadge = !user.isVerifiedBadge;
    await user.save();

    res.status(200).json({
      success: true,
      isVerifiedBadge: user.isVerifiedBadge,
      message: user.isVerifiedBadge ? 'Verification badge diya gaya ✓' : 'Badge remove ho gaya'
    });
  } catch (err) { next(err); }
};
// ─────────────────────────────────────────────
// @route   POST /api/auth/google
// @desc    Google Sign In
// @access  Public
// ─────────────────────────────────────────────
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1!',
        profilePhoto: picture,
        isVerified: true,
      });
    } else {
      // Update profile photo if not set
      if (!user.profilePhoto && picture) {
        user.profilePhoto = picture;
        await user.save();
      }
    }

    sendTokenResponse(user, 200, res, 'Google login successful');
  } catch (err) { next(err); }
};
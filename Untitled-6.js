const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require('path');

// Models load karna
const User = require("./models/User");
const Reel = require("./models/Reel");
const Comment = require("./models/Comment");
const authMiddleware = require("./middleware/auth");

const app = express(); // 1. Sabse pehle app define karein
app.use(express.json());
app.use(cors());

// 2. Static files (Frontend) ko serve karein
app.use(express.static(path.join(__dirname, './')));

// 3. Database Connection (Sahi variable MONGO_URI use karein)
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected! ✅"))
.catch(err => console.log("DB Error: ", err));

/* --- ROUTES --- */

// Home Route (Frontend load karne ke liye)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SIGNUP
app.post("/signup", async (req, res) => {
    try {
        const hashed = await bcrypt.hash(req.body.password, 10);
        const user = new User({ ...req.body, password: hashed });
        await user.save();
        res.json({ message: "User Created Successfully! 🎉" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) return res.status(400).json({ message: "Wrong Password" });

        const token = jwt.sign({ id: user._id }, "SECRETKEY");
        res.json({ token, message: "Login Success!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPLOAD REEL
app.post("/upload", authMiddleware, async (req, res) => {
    const reel = new Reel({ ...req.body, user: req.user.id });
    await reel.save();
    res.json({ message: "Uploaded" });
});

// GET REELS
app.get("/reels", async (req, res) => {
    const reels = await Reel.find().populate('user', 'username');
    res.json(reels);
});

// LIKE
app.post("/like/:id", authMiddleware, async (req, res) => {
    await Reel.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user.id } });
    res.json({ message: "Liked" });
});

// COMMENT
app.post("/comment/:id", authMiddleware, async (req, res) => {
    const comment = new Comment({
        reelId: req.params.id,
        user: req.user.id,
        text: req.body.text
    });
    await comment.save();
    res.json({ message: "Comment Added" });
});

// FOLLOW
app.post("/follow/:id", authMiddleware, async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id } });
    res.json({ message: "Followed" });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

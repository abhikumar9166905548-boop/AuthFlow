const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // 1. Multer Import kiya
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARES ---
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); 
app.use('/uploads', express.static('uploads')); // Uploaded files ko access karne ke liye

// --- 2. MULTER CONFIGURATION ---
// Ye folder server par hona chahiye, multer ise use karega
const upload = multer({ 
    dest: 'uploads/', 
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// --- 3. MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Rollera DB Connected! ✅"))
  .catch(err => console.log("DB Connection Error: ", err));

// --- 4. SCHEMAS ---
const userSchema = new mongoose.Schema({
    fullName: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    birthday: String
});
const User = mongoose.model('User', userSchema);

// Post Schema (Uploads save karne ke liye)
const postSchema = new mongoose.Schema({
    userId: String,
    url: String,
    caption: String,
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- 5. ROUTES ---

// Health Check
app.get('/status', (req, res) => res.send("Rollera Server is Running... 🚀"));

// NEW: Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File nahi mili" });

        const { userId, caption } = req.body;
        
        // Filhal local path save kar rahe hain (Production mein Cloudinary use karna chahiye)
        const newPost = new Post({
            userId,
            caption,
            url: `/uploads/${req.file.filename}` 
        });

        await newPost.save();
        res.status(200).json({ message: "Upload Success!", post: newPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server par upload fail ho gaya" });
    }
});

// Search Route
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);
        
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        }).limit(10).select("-password");

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Search failed" });
    }
});

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { email, fullName, username, password, birthday } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: "Email ya Username pehle se hai!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            email, fullName, username, password: hashedPassword, birthday 
        });

        await newUser.save();
        res.status(201).json({ message: "Account Ban Gaya! 🎉" });
    } catch (err) {
        res.status(500).json({ message: "Signup Fail: " + err.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User nahi mila" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Galat Password" });
        
        res.json({ 
            message: "Success", 
            user: { _id: user._id, username: user.username, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// --- 6. SERVE FRONTEND ---
app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/login' || req.path === '/signup') return;
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 7. SERVER START ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rollera Server live on port ${PORT} 🚀`);
});

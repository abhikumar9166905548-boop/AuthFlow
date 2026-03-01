const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); 
require('dotenv').config();

const app = express();

// --- 1. UPLOADS FOLDER SETUP ---
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- 2. MIDDLEWARES ---
app.use(express.json());
app.use(cors());

// PEHLE: Static files (Images) serve karein
app.use('/uploads', express.static(uploadDir)); 
app.use(express.static(path.join(__dirname))); 

// --- 3. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } 
});

// --- 4. MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Rollera DB Connected! ✅"))
  .catch(err => console.error("DB Connection Error: ", err));

// --- 5. SCHEMAS ---
// (Aapka purana schema yahan rahega...)
const userSchema = new mongoose.Schema({
    fullName: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    birthday: String
});
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
    userId: String,
    url: String, // Isme '/uploads/filename.jpg' save hoga
    caption: String,
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- 6. ROUTES ---

// Upload Route (FIXED URL)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File nahi mili" });

        const { userId, caption } = req.body;
        
        // Relative path save karein
        const newPost = new Post({
            userId,
            caption,
            url: `/uploads/${req.file.filename}` 
        });

        await newPost.save();
        res.status(200).json({ message: "Upload Success!", post: newPost });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Post fetch karne ke liye route (TAAKI FRONTEND PAR DIKHE)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Posts nahi mil rahi" });
    }
});

// (Signup, Login, Search routes yahan rahenge...)

// --- 7. SERVE FRONTEND (FIXED LOGIC) ---
// Isse sabse niche rakhein taaki baaki routes block na ho
app.get('*', (req, res) => {
    // Agar request API ya Uploads ki hai, toh index.html mat bhejo
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/status')) {
        return res.status(404).json({ error: "Not Found" });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 8. SERVER START ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rollera Server live on port ${PORT} 🚀`);
});

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Static Files (Frontend dikhane ke liye)
app.use(express.static(path.join(__dirname, './')));

// 2. Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully! ✅"))
  .catch(err => console.log("DB Connection Error: ", err));

// 3. User Schema (Yahan humne 'username' ko 'email' se badal diya hai)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 4. SIGNUP ROUTE
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check agar user pehle se hai
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email pehle se register hai!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User Created Successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Signup fail ho gaya" });
    }
});

// 5. LOGIN ROUTE
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User nahi mila!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Galat Password!" });

        res.json({ message: "Login Successful!", token: "dummy-token" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

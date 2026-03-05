const express = require('express');
const path = require('path');
const User = require('./models/User'); // Database model

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(__dirname));

// Route: Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: Professional Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Simple Check (Production mein password hash zaroor karein)
        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).json({ success: true, message: "Welcome back, " + username });
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = app;

const express = require('express');
const path = require('path');
const User = require('./models/User');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

// API: Register (Naya User Banana)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const nayaUser = new User({ username, password });
        await nayaUser.save();
        res.json({ success: true, message: "Account ban gaya! Ab login karein." });
    } catch (err) {
        res.json({ success: false, message: "Username pehle se maujood hai!" });
    }
});

// API: Login logic
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true });
        else res.json({ success: false, message: "Galti! Details check karein." });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;

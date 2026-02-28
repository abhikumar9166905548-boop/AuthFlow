const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");

// Port definition (Render ke liye zaroori)
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose'); // Pehle mongoose import karein
const cors = require('cors'); // CORS zaroori hai frontend ke liye

app.use(cors()); // Ise app.use(express.json()) ke upar likhein

// MongoDB Connection Logic
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully! ✅"))
  .catch(err => console.log("DB Connection Error: ❌", err));
app.use(express.json());

// Aapka middleware function (jo aapne screenshot mein bheja tha)
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if(!token) return res.status(401).json({message:"Access Denied"});
    try {
        const verified = jwt.verify(token, "SECRETKEY");
        req.user = verified;
        next();
    } catch(err) {
        res.status(400).json({message:"Invalid Token"});
    }
};

// Ek basic route taki check ho sake ki server chal raha hai
app.get('/', (req, res) => {
    res.send("Server is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


const API_URL = "https://rollera.onrender.com"
// 1. SIGNUP FUNCTION
async function handleSignup() {
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

}

// 2. LOGIN FUNCTION
async function handleLogin() {
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

}

// 3. LOAD REELS (Videos dikhane ke liye)
async function loadReels() {
try {
const res = await fetch(${API_URL}/reels);
const reels = await res.json();
const feed = document.getElementById('feed');
feed.innerHTML = "";

}

// 4. ADVANCE UPLOAD FUNCTION
async function uploadReel() {
const file = document.getElementById('videoFile').files[0];
const caption = document.getElementById('caption').value;

}

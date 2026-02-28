// Iske peeche slash '/' mat lagana
const API_URL = "https://rollera.onrender.com"; 

// --- 1. Birthday Dropdowns (Signup ke liye) ---
window.onload = () => {
    const monthSelect = document.getElementById('dob-month');
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(monthSelect) months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i+1}">${m}</option>`);
    if(daySelect) for (let i = 1; i <= 31; i++) daySelect.innerHTML += `<option value="${i}">${i}</option>`;
    if(yearSelect) for (let i = 2024; i >= 1950; i--) yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
};

// --- 2. Login Logic ---
async function handleLogin() {
    const emailField = document.getElementById("login-email");
    const passwordField = document.getElementById("login-password");

    if (!emailField || !passwordField) {
        return alert("Login fields nahi mile!");
    }

    const email = emailField.value;
    const password = passwordField.value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            alert("Login Successful! 🔥");
            document.getElementById("auth").style.display = "none";
            document.getElementById("mainHeader").style.display = "none";
            document.getElementById("app").style.display = "block";
        } else {
            alert("Login Failed! Check credentials.");
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection failed!");
    }
}

// --- 3. Navigation Functions (Teeno Screens ke liye) ---

// HOME SCREEN DIKHAO
function showHome() {
    document.getElementById('reelsView').style.display = 'none';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('reelsContainer').style.display = 'block';
    
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'flex';
    
    // Header Reset
    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Rollera";
    }
    
    // Stop Videos
    document.querySelectorAll('video').forEach(v => v.pause());
}

// REELS SCREEN DIKHAO
function showReels() {
    document.getElementById('reelsContainer').style.display = 'none';
    document.getElementById('profileView').style.display = 'none';
    
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'none';
    
    document.getElementById('reelsView').style.display = 'block';
    
    // Header Chupao (Reels full screen hoti hain)
    const header = document.getElementById("mainHeader");
    if (header) header.style.display = "none";

    // Play first video
    const vid = document.querySelector('#reelsView video');
    if (vid) vid.play();
}

// PROFILE SCREEN DIKHAO
function showProfile() {
    document.getElementById('reelsView').style.display = 'none';
    document.getElementById('reelsContainer').style.display = 'none';
    
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'none';
    
    document.getElementById('profileView').style.display = 'block';

    // Header Title
    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Profile";
    }
    
    // Stop Videos
    document.querySelectorAll('video').forEach(v => v.pause());
}

// --- 4. Like System ---
function toggleLike(element) {
    if (!element) return;
    if (element.classList.contains('fa-regular')) {
        element.classList.replace('fa-regular', 'fa-solid');
        element.style.color = "red";
    } else {
        element.classList.replace('fa-solid', 'fa-regular');
        element.style.color = "white";
    }
}

// --- 5. Extra Helpers ---
function openSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "flex"; 
}
function closeSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "none"; 
}

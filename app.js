const API_URL = "https://rollera.onrender.com"; 

// --- 1. Birthday Dropdowns ---
window.onload = () => {
    const monthSelect = document.getElementById('dob-month');
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(monthSelect) months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i+1}">${m}</option>`);
    if(daySelect) for (let i = 1; i <= 31; i++) daySelect.innerHTML += `<option value="${i}">${i}</option>`;
    if(yearSelect) for (let i = 2024; i >= 1950; i--) yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
};

// --- 2. Login Logic (Fixed with Safety) ---
async function handleLogin() {
    const emailField = document.getElementById("login-email");
    const passwordField = document.getElementById("login-password");

    if (!emailField || !passwordField) {
        return alert("Login fields not found! Check your HTML IDs.");
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
            
            // Safety Check for Header
            const header = document.getElementById("mainHeader");
            if (header) header.style.display = "none";

            // Switch Screens
            const authDiv = document.getElementById("auth");
            const appDiv = document.getElementById("app");
            
            if (authDiv) authDiv.style.display = "none";
            if (appDiv) appDiv.style.display = "block";
            
        } else {
            alert("Login Failed! Please check email/password.");
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection failed!");
    }
}

// --- 3. Navigation Functions (Reels Toggle) ---
function showReels() {
    const reelsView = document.getElementById('reelsView');
    const reelsContainer = document.getElementById('reelsContainer');
    const storyContainer = document.querySelector('.story-container');

    if (reelsView) reelsView.style.display = 'block';
    if (reelsContainer) reelsContainer.style.display = 'none';
    if (storyContainer) storyContainer.style.display = 'none';

    // Play first video
    const vid = document.querySelector('#reelsView video');
    if (vid) vid.play();
}

function showHome() {
    const reelsView = document.getElementById('reelsView');
    const reelsContainer = document.getElementById('reelsContainer');
    const storyContainer = document.querySelector('.story-container');

    if (reelsView) reelsView.style.display = 'none';
    if (reelsContainer) reelsContainer.style.display = 'block';
    if (storyContainer) storyContainer.style.display = 'flex';

    // Stop videos
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

// Signup Modal Helpers
function openSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "flex"; 
}
function closeSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "none"; 
}

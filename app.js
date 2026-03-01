// --- Global Variables ---
let currentUserId = null; 
const API_URL = "https://rollera.onrender.com"; // Fixed: Duplicate hata di

// --- 1. Birthday Dropdowns ---
window.onload = () => {
    const monthSelect = document.getElementById('dob-month');
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(monthSelect) months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i+1}">${m}</option>`);
    if(daySelect) for (let i = 1; i <= 31; i++) daySelect.innerHTML += `<option value="${i}">${i}</option>`;
    
    const currentYear = new Date().getFullYear();
    if(yearSelect) for (let i = currentYear; i >= 1950; i--) yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
};

// --- 2. Login Logic ---
async function handleLogin() {
    const emailField = document.getElementById("login-email");
    const passwordField = document.getElementById("login-password");
    const loginBtn = document.querySelector("#auth button"); 

    if (!emailField || !passwordField) return alert("HTML elements missing!");
    if (!emailField.value || !passwordField.value) return alert("Email aur password daalo!");

    loginBtn.innerText = "Connecting to Server..."; 
    loginBtn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: emailField.value, 
                password: passwordField.value 
            })
        });

        const data = await res.json(); 

        if (res.ok) {
            alert("Login Successful! 🔥");
            currentUserId = data.user._id; 
            
            document.getElementById("auth").style.display = "none";
            document.getElementById("mainHeader").style.display = "none";
            document.getElementById("app").style.display = "block";
            
            if(data.user && data.user.username) {
                const profileUser = document.getElementById("profile-username");
                if(profileUser) profileUser.innerText = data.user.username;
            }

            loadProfilePosts(currentUserId); 
            loadAllPosts(); 
        } else {
            alert("Login Failed: " + (data.message || "Invalid credentials"));
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection failed! Please wait 30s for Render to wake up.");
    } finally {
        loginBtn.innerText = "Login"; 
        loginBtn.disabled = false;
    }
}

// --- 3. Navigation ---
function hideAllSections() {
    const sections = ['homeView', 'reelsView', 'profileView', 'searchView', 'reelsContainer'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'none';

    document.querySelectorAll('video').forEach(v => v.pause());
}

function showHome() {
    hideAllSections();
    const home = document.getElementById('homeView');
    const container = document.getElementById('reelsContainer');
    if(home) home.style.display = 'block';
    if(container) container.style.display = 'block';
    
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'flex';
    
    loadAllPosts(); 

    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Rollera";
    }
}

// --- 4. Content Loading (Reels & Posts) ---
async function showReels() {
    hideAllSections(); 
    const reelsView = document.getElementById("reelsView");
    if(!reelsView) return;

    reelsView.style.display = "block";
    reelsView.innerHTML = "<p style='text-align:center; color:white; margin-top:50px;'>Loading Reels...</p>"; 

    try {
        const res = await fetch(`${API_URL}/reels`); 
        const reels = await res.json();
        reelsView.innerHTML = ""; 

        if(!reels || reels.length === 0) {
            reelsView.innerHTML = "<p style='text-align:center; color:white; margin-top:50px;'>No reels found.</p>";
            return;
        }

        reels.forEach(reel => {
            const reelContainer = document.createElement("div");
            reelContainer.className = "reel-video-container";
            reelContainer.style.cssText = "height: 100vh; scroll-snap-align: start; position: relative; background: #000;";

            reelContainer.innerHTML = `
                <video src="${reel.videoUrl}" loop muted playsinline 
                       style="height: 100%; width: 100%; object-fit: cover;"
                       onclick="togglePlayPause(this)">
                </video>
                <div style="position: absolute; bottom: 80px; left: 15px; z-index: 10; color: white;">
                    <b>@${reel.username}</b>
                    <p>${reel.caption || ''}</p>
                </div>
            `;
            reelsView.appendChild(reelContainer);
        });

        const firstVideo = reelsView.querySelector("video");
        if(firstVideo) firstVideo.play();

    } catch (err) {
        reelsView.innerHTML = "<p style='text-align:center; color:white; margin-top:50px;'>Server Error. Reels not loaded.</p>";
    }
}

// ... rest of utility functions (handleSignup, uploadMyReel, etc.)
// Note: handleSignup, loadProfilePosts, loadAllPosts remain the same but ensure API_URL usage is consistent.

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

        const data = await res.json(); 

        if (res.ok) {
            alert("Login Successful! 🔥");
            document.getElementById("auth").style.display = "none";
            document.getElementById("mainHeader").style.display = "none";
            document.getElementById("app").style.display = "block";

            // --- MERGED LOGIC HERE ---
            // Login successful hone par username aur posts load karo
            if(data.user) {
                const profileUser = document.getElementById("profile-username");
                if(profileUser) profileUser.innerText = data.user.username; 
                loadProfilePosts(data.user._id); 
            }
            // -------------------------

        } else {
            alert("Login Failed: " + (data.message || "Check credentials."));
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection failed!");
    }
}

// --- 3. Navigation Functions (Screens switching) ---

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
    document.getElementById('homeView').style.display = 'block';
    document.getElementById('reelsContainer').style.display = 'block';
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'flex';
    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Rollera";
    }
}

function showSearch() {
    hideAllSections();
    document.getElementById('searchView').style.display = 'block';
    const header = document.getElementById("mainHeader");
    if (header) header.style.display = "none";
}

function showReels() {
    hideAllSections();
    document.getElementById('reelsView').style.display = 'block';
    const header = document.getElementById("mainHeader");
    if (header) header.style.display = "none";
    const vid = document.querySelector('#reelsView video');
    if (vid) vid.play();
}

function showProfile() {
    hideAllSections();
    document.getElementById('profileView').style.display = 'block';
    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Profile";
    }
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

// --- 6. Signup Logic ---
async function handleSignup() {
    const email = document.getElementById("signup-email").value;
    const fullName = document.getElementById("signup-fullname").value;
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    
    const day = document.getElementById("dob-day").value;
    const month = document.getElementById("dob-month").value;
    const year = document.getElementById("dob-year").value;
    const birthday = `${year}-${month}-${day}`;

    if (!email || !username || !password) {
        return alert("Please fill all required fields!");
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, fullName, username, password, birthday })
        });
        const data = await res.json();
        if (res.ok) {
            alert("Account created successfully! Ab login karein. 🎉");
            closeSignup();
        } else {
            alert("Signup Failed: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Signup Error:", err);
        alert("Server error. Try again later.");
    }
}

// --- 7. Profile Posts Fetching ---
async function loadProfilePosts(userId) {
    const postGrid = document.getElementById("userPostGrid");
    if (!postGrid) return;

    try {
        const res = await fetch(`${API_URL}/posts/user/${userId}`);
        const posts = await res.json();

        postGrid.innerHTML = ""; 

        if (!posts || posts.length === 0) {
            postGrid.innerHTML = "<p style='grid-column: 1/4; text-align: center; color: #8e8e8e; margin-top: 20px;'>No posts yet</p>";
            return;
        }

        posts.forEach(post => {
            const img = document.createElement("img");
            img.src = post.url; 
            img.style.cssText = "width: 100%; aspect-ratio: 1/1; object-fit: cover; cursor: pointer;";
            img.onclick = () => alert("Post details coming soon!"); 
            postGrid.appendChild(img);
        });
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

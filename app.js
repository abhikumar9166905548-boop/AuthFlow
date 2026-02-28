const API_URL = "https://rollera.onrender.com";

// Signup
async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    alert(data.message || "Error");
}

// Login
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        document.getElementById('auth').style.display = "none";
        document.getElementById('app').style.display = "block";
        loadReels();
    } else {
        alert(data.message || "Login Failed");
    }
}

// Load Reels
async function loadReels() {
    const res = await fetch(`${API_URL}/reels`);
    const reels = await res.json();
    const feed = document.getElementById('feed');
    feed.innerHTML = "";

    reels.forEach(r => {
        feed.innerHTML += `
            <div class="reel">
                <video src="${r.videoUrl}" autoplay muted loop></video>
                <div class="caption"><b>@User</b><br>${r.caption}</div>
                <div class="actions">❤️ ${r.likes || 0}</div>
            </div>`;
    });
}

function logout() {
    localStorage.clear();
    location.reload();
}

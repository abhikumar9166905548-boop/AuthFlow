const API_URL = "https://rollera.onrender.com";

// --- SIGNUP FUNCTION ---
async function handleSignup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Bhai, Email aur Password toh dalo!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("User Created Successfully! 🎉 Ab Login karo.");
        } else {
            alert("Error: " + (data.message || "Signup fail ho gaya"));
        }
    } catch (err) {
        console.error(err);
        alert("Server connect nahi ho pa raha!");
    }
}

// --- LOGIN FUNCTION ---
async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Email aur Password bhariye!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            document.getElementById("auth").style.display = "none";
            document.getElementById("app").style.display = "block";
            alert("Login Ho Gaya! 🔥");
            loadReels();
        } else {
            alert("Galat Password ya Email!");
        }
    } catch (err) {
        alert("Login fail ho gaya!");
    }
}

// --- LOAD REELS ---
async function loadReels() {
    try {
        const res = await fetch(`${API_URL}/reels`);
        const reels = await res.json();
        const feed = document.getElementById("feed");
        feed.innerHTML = reels.map(r => `
            <div class="reel">
                <video src="${API_URL}${r.videoUrl}" controls loop></video>
                <p style="padding:10px;">${r.caption}</p>
            </div>
        `).join("");
    } catch (err) {
        console.log("Reels load nahi hui");
    }
}

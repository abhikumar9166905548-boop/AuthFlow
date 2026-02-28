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
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Server connect nahi hua!");
    }
}

// --- LOGIN FUNCTION ---
async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
        } else {
            alert("Galat Password!");
        }
    } catch (err) {
        alert("Login fail!");
    }
}

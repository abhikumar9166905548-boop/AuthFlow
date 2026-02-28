// Ye code aapke Frontend (Buttons) ko Backend se jodege
const API_URL = "https://rollera.onrender.com";

async function signupUser(username, password) {
    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message);
}

// Login ke liye bhi aise hi function banega

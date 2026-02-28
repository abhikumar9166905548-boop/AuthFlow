const API_URL = "https://rollera.onrender.com";

function openSignup() {
    document.getElementById("signupModal").style.display = "block";
}

function closeSignup() {
    document.getElementById("signupModal").style.display = "none";
}

async function handleSignup() {
    const userData = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        email: document.getElementById("email").value,
        mobile: document.getElementById("mobile").value,
        password: document.getElementById("password").value
    };

    if (!userData.email || !userData.password || !userData.name) {
        alert("Bhai, saari details bharna zaroori hai!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const data = await res.json();
        if (res.ok) {
            alert("Badhai ho! Account ban gaya. 🎉");
            closeSignup();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Server connection fail!");
    }
}

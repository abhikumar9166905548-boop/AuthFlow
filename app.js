const API_URL = "https://rollera.onrender.com";
function openSignup() {
    document.getElementById("signupModal").style.display = "block";
}

function closeSignup() {
    document.getElementById("signupModal").style.display = "none";
}

async function handleSignup() {
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value;
    const mobile = document.getElementById("mobile").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !mobile || !password) {
        alert("Bhai, sari detail bharna zaruri hai!");
        return;
    }

    const userData = { name, age, email, mobile, password };

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const data = await res.json();
        if (res.ok) {
            alert("Registration Successful! 🎉");
            closeSignup();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Server error!");
    }
}

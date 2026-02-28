const API_URL = "https://rollera.onrender.com"; 

function openSignup() { document.getElementById("signupModal").style.display = "flex"; }
function closeSignup() { document.getElementById("signupModal").style.display = "none"; }

async function handleLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (res.ok) {
        alert("Login Successful! 🔥");
        document.getElementById("auth").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else { alert("Login Failed!"); }
}

function sendOtpLogic() {
    document.getElementById("otpSection").style.display = "block";
    document.getElementById("sendOtpBtn").style.display = "none";
    alert("OTP sent! (Use 123456)");
}

async function verifyAndSignup() {
    const data = {
        name: document.getElementById("signup-name").value,
        age: document.getElementById("signup-age").value,
        email: document.getElementById("signup-email").value,
        mobile: document.getElementById("signup-mobile").value,
        password: document.getElementById("signup-password").value,
        otp: document.getElementById("otpInput").value
    };

    const res = await fetch(`${API_URL}/verify-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Account Created! 🎉 Ab login karein.");
        location.reload();
    } else {
        const err = await res.json();
        alert("Signup failed: " + err.message);
    }
}

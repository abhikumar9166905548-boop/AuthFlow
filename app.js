const API_URL = "https://rollera.onrender.com";

// LOGIN
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
        alert("Welcome to Rollera! 🚀");
    } else {
        alert(data.message);
    }
}

// ADVANCE UPLOAD (Multer ready)
async function uploadReel() {
    const file = document.getElementById('videoFile').files[0];
    const caption = document.getElementById('caption').value;
    
    if (!file) return alert("Video select karo!");

    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);

    const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
        body: formData
    });

    const data = await res.json();
    alert(data.message || "Upload Successful!");
}

// SIGNUP function bhi handleSignup naam se bana lena same login ki tarah

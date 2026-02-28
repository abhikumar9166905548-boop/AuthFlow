const API_URL = "https://rollera.onrender.com";
async function handleSignup() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

}

async function handleLogin() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

}

async function loadReels() {
try {
const res = await fetch(${API_URL}/reels);
const reels = await res.json();
const feed = document.getElementById("feed");
feed.innerHTML = reels.map(r => <div class="reel"> <video src="${API_URL}${r.videoUrl}" controls loop></video> <p style="padding:10px;">${r.caption}</p> </div>).join("");
} catch (err) {
console.log("Reels load nahi hui");
}
}

async function uploadReel() {
const file = document.getElementById("videoFile").files[0];
const caption = document.getElementById("caption").value;

}

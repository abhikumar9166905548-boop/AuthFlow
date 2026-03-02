/**
 * ROLLER - THE GOD MODE ENGINE V3
 * Fully Integrated with User HTML
 */

const RollerApp = {
    state: {
        isLoggedIn: false,
        currentSection: 'feed',
        likedVideos: new Set(),
    },

    init() {
        this.setupIntersectionObserver();
        this.injectGlobalStyles();
        this.bindEvents();
        console.log("🚀 Roller Pro Engine Started!");
    },

    // 1. SMART AUTO-PLAY ENGINE
    setupIntersectionObserver() {
        const options = { threshold: 0.7 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (entry.isIntersecting) {
                    this.playVideo(video);
                    this.updateProgressBar(video);
                } else {
                    if (video) video.pause();
                }
            });
        }, options);

        document.querySelectorAll('.video-container').forEach(v => observer.observe(v));
    },

    async playVideo(video) {
        if (!video) return;
        try {
            video.muted = false; 
            await video.play();
        } catch (e) {
            video.muted = true;
            video.play();
        }
    },

    // 2. REAL-TIME PROGRESS BAR
    updateProgressBar(video) {
        let bar = video.parentElement.querySelector('.video-progress-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'video-progress-bar';
            video.parentElement.appendChild(bar);
        }
        video.ontimeupdate = () => {
            const progress = (video.currentTime / video.duration) * 100;
            bar.style.width = `${progress}%`;
        };
    },

    // 3. SEAMLESS NAVIGATION (Switching sections)
    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        // Show target section
        const target = document.getElementById(`${sectionId}Section`);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }

        // Top Header logic
        const header = document.getElementById('topHeader');
        header.style.display = (sectionId === 'feed') ? 'flex' : 'none';

        // Bottom Nav Active State
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick')?.includes(sectionId)) {
                item.classList.add('active');
            }
        });

        if (sectionId !== 'feed') this.pauseAll();
        this.state.currentSection = sectionId;
        this.showToast(`Switched to ${sectionId}`);
    },

    // 4. AUTH FLOW (Login to App)
    openAuthModal(type) {
        document.getElementById('authModal').classList.add('active');
        document.querySelectorAll('.auth-otp-container').forEach(c => c.classList.remove('active'));
        
        if (type === 'phone') document.getElementById('phoneAuth').classList.add('active');
        if (type === 'email') document.getElementById('emailAuth').classList.add('active');
    },

    sendOTP() {
        const phone = document.getElementById('phoneInput').value;
        if (!phone) return this.showToast("Enter phone number!");
        
        document.getElementById('phoneDisplay').innerText = phone;
        document.getElementById('phoneAuth').classList.remove('active');
        document.getElementById('otpAuth').classList.add('active');
        this.showToast("OTP Sent: 1234");
    },

    verifyOTP() {
        document.getElementById('otpAuth').classList.remove('active');
        document.getElementById('profileSetup').classList.add('active');
    },

    completeProfile() {
        const username = document.getElementById('usernameInput').value || "@user";
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('authModal').classList.remove('active');
        
        // Show App UI
        document.getElementById('topHeader').style.display = 'flex';
        document.getElementById('feedSection').style.display = 'block';
        document.getElementById('bottomNav').style.display = 'flex';
        
        this.showToast(`Welcome ${username}! 🎉`);
    },

    // 5. LIKE & HEART ANIMATION
    handleDoubleTap(e, container) {
        this.createHeart(e);
        const likeBtn = container.querySelector('.action-btn');
        this.toggleLike(likeBtn);
    },

    toggleLike(btn) {
        if (!btn) return;
        btn.classList.toggle('liked');
        const icon = btn.querySelector('.action-icon');
        icon.innerText = btn.classList.contains('liked') ? '❤️' : '🤍';
        icon.style.color = btn.classList.contains('liked') ? '#fe2c55' : 'white';
        if (btn.classList.contains('liked')) this.showToast("Added to Likes!");
    },

    createHeart(e) {
        const heart = document.createElement('div');
        heart.className = 'god-heart';
        heart.innerHTML = '❤️';
        heart.style.left = `${(e.clientX || e.touches[0].clientX) - 40}px`;
        heart.style.top = `${(e.clientY || e.touches[0].clientY) - 40}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
    },

    // 6. UTILS
    showToast(msg) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    },

    pauseAll() {
        document.querySelectorAll('video').forEach(v => v.pause());
    },

    injectGlobalStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .video-progress-bar { position: absolute; bottom: 0; left: 0; height: 3px; background: #fe2c55; z-index: 100; transition: width 0.1s; }
            .god-heart { position: fixed; font-size: 80px; z-index: 9999; pointer-events: none; animation: heartFly 0.8s forwards; }
            @keyframes heartFly { 
                0% { transform: scale(0); opacity: 0; } 
                50% { transform: scale(1.5) rotate(15deg); opacity: 1; } 
                100% { transform: scale(1) translateY(-100px); opacity: 0; } 
            }
            .auth-modal { display: none; }
            .auth-modal.active { display: block; position: fixed; top:0; left:0; width:100%; height:100%; background: #000; z-index: 10000; }
            .section { display: none; transition: all 0.3s; }
            .section.active { display: block; }
        `;
        document.head.appendChild(style);
    },

    bindEvents() {
        document.querySelectorAll('.video-container').forEach(c => {
            c.addEventListener('dblclick', (e) => this.handleDoubleTap(e, c));
        });
    }
};

// Global Listeners for Buttons
const openAuthModal = (t) => RollerApp.openAuthModal(t);
const closeAuthModal = () => document.getElementById('authModal').classList.remove('active');
const sendOTP = () => RollerApp.sendOTP();
const verifyOTP = () => RollerApp.verifyOTP();
const completeProfile = () => RollerApp.completeProfile();
const switchSection = (id) => RollerApp.switchSection(id);
const togglePlay = (el) => {
    const v = el.querySelector('video');
    v.paused ? v.play() : v.pause();
};
const toggleLike = (btn) => RollerApp.toggleLike(btn);
const openComments = () => {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('commentsModal').style.display = 'block';
};
const closeComments = () => {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('commentsModal').style.display = 'none';
};
const shareVideo = () => RollerApp.showToast("Link Copied! 🔗");
const logout = () => location.reload();

// Start App
document.addEventListener('DOMContentLoaded', () => RollerApp.init());

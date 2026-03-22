const counterEl = document.getElementById('counter');
const progressEl = document.getElementById('progress');
const motivateTextEl = document.getElementById('motivate-text');
const clickBtn = document.getElementById('click-btn');
const rewardContainer = document.getElementById('reward-container');
const resetBtn = document.getElementById('reset-btn');

// New Elements
const loginContainer = document.getElementById('login-container');
const gameContainer = document.getElementById('game-container');
const usernameInput = document.getElementById('username');
const startBtn = document.getElementById('start-btn');
const userGreeting = document.getElementById('user-greeting');
const timerEl = document.getElementById('timer');
const finalStats = document.getElementById('final-stats');

const newPlayerBtn = document.getElementById('new-player-btn');
const statsContainer = document.getElementById('stats-container');
const leaderboardList = document.getElementById('leaderboard-list');
const closeStatsBtn = document.getElementById('close-stats-btn');
const podNameBadge = document.getElementById('pod-name-badge');

async function fetchPodInfo() {
    try {
        const res = await fetch('/api/info');
        const data = await res.json();
        podNameBadge.innerText = `running on: ${data.podName}`;
    } catch (e) {
        podNameBadge.innerText = 'local-dev';
    }
}
fetchPodInfo();

let count = 0;
const goal = 100;
let username = "";
let startTime = null;
let timerInterval = null;

const motivations = [
    { threshold: 0, text: "เริ่มได้เลย! ความพยายามอยู่ที่ไหน ความพยายามอยู่ที่นั่น" },
    { threshold: 10, text: "มาแล้วๆ 10 ครั้งแล้วนะ ลุยต่อ!" },
    { threshold: 20, text: "มาแล้วๆ 20 ครั้งแล้วนะ เอาอีก!" },
    { threshold: 25, text: "โอ้โห! นิ้วเริ่มร้อนแล้วสิ สู้ๆ!" },
    { threshold: 40, text: "เกือบครึ่งทางแล้ว! อย่าหยุดนะ" },
    { threshold: 50, text: "ครึ่งทางแล้ว! อีกนิดเดียวเท่านั้น" },
    { threshold: 65, text: "นิ้วยังไหวไหม? ความลับรออยู่ข้างหน้า!" },
    { threshold: 80, text: "สุดยอด! อีกแค่ 20 ครั้งเท่านั้น!" },
    { threshold: 90, text: "ใกล้มากแล้ว! 10... 9... 8..." },
    { threshold: 95, text: "อีกนิดเดียว! ฮึบ!" },
    { threshold: 99, text: "ครั้งสุดท้ายแล้ว!!!" }
];

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const cents = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${cents.toString().padStart(2, '0')}`;
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        timerEl.innerText = formatTime(elapsed);
    }, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
    return Date.now() - startTime;
}

async function saveScore(time) {
    try {
        await fetch('/api/scores', {
            method: 'POST',
            body: JSON.stringify({ name: username, time: time }),
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("Failed to save score", e);
    }
}

async function showStats() {
    try {
        const res = await fetch('/api/scores');
        const scores = await res.json();
        leaderboardList.innerHTML = scores.map((s, i) => `
            <li>
                <span>${i + 1}. ${s.name}</span>
                <span>${formatTime(s.time)}</span>
            </li>
        `).join('') || "<li>ยังไม่มีสถิติ</li>";
        statsContainer.classList.remove('hidden');
    } catch (e) {
        console.error("Failed to fetch scores", e);
    }
}

function updateMotivateText() {
    const currentMotivation = [...motivations].reverse().find(m => count >= m.threshold);
    if (currentMotivation && motivateTextEl.innerText !== currentMotivation.text) {
        motivateTextEl.classList.remove('text-pop');
        void motivateTextEl.offsetWidth;
        motivateTextEl.innerText = currentMotivation.text;
        motivateTextEl.classList.add('text-pop');
    }
}

function updateDisplay() {
    counterEl.innerText = count;
    const percentage = (count / goal) * 100;
    progressEl.style.width = `${percentage}%`;
    updateMotivateText();
}

async function showReward() {
    const totalTime = stopTimer();
    finalStats.innerText = `ยินดีด้วย ${username}! คุณทำได้ในเวลา ${formatTime(totalTime)}`;
    rewardContainer.classList.remove('hidden');
    await saveScore(totalTime);
    setTimeout(() => showStats(), 2000); // Show stats after 2 seconds
}

const rewardImg = document.getElementById('reward-img');
const MAX_FLOATING_TEXTS = 15;
let activeFloatingTexts = 0;

function createFloatingText(x, y, text) {
    if (activeFloatingTexts >= MAX_FLOATING_TEXTS) return;
    activeFloatingTexts++;
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.remove();
        activeFloatingTexts--;
    }, 800);
}

function triggerRandomAnimation() {
    counterEl.style.transform = 'scale(1.2)';
    setTimeout(() => counterEl.style.transform = 'scale(1)', 100);

    if (count % 10 === 0) {
        gameContainer.classList.add('shake');
        setTimeout(() => gameContainer.classList.remove('shake'), 400);
    }

    const rect = clickBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() * 100 - 50);
    const y = rect.top;
    const clickEmojis = ["🔥", "✨", "🚀", "💥", "⚡️", "🔋"];
    const emoji = clickEmojis[Math.floor(Math.random() * clickEmojis.length)];
    createFloatingText(x, y, `+1 ${emoji}`);
}

// User Flow
startBtn.addEventListener('click', () => {
    username = usernameInput.value.trim() || "User";
    userGreeting.innerText = `หวัดดี ${username}!`;
    loginContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startTimer();
});

clickBtn.addEventListener('click', () => {
    if (count < goal) {
        count++;
        updateDisplay();
        triggerRandomAnimation();

        if (count === goal) {
            rewardImg.src = 'public/reward_final.png';
            if (!document.querySelector('.troll-msg')) {
                const msg = document.createElement('p');
                msg.className = 'troll-msg';
                msg.innerText = '"ว่างกันหรอ ถึงมากดเล่นอะไรแบบนี้"';
                rewardImg.after(msg);
            }
            showReward();
        }
    }
});

resetBtn.addEventListener('click', () => {
    count = 0;
    updateDisplay();
    rewardContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    const oldMsg = document.querySelector('.troll-msg');
    if (oldMsg) oldMsg.remove();
    timerEl.innerText = "00:00.00";
    startTimer();
});

newPlayerBtn.addEventListener('click', () => {
    count = 0;
    updateDisplay();
    rewardContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    gameContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    usernameInput.value = "";
    const oldMsg = document.querySelector('.troll-msg');
    if (oldMsg) oldMsg.remove();
});

closeStatsBtn.addEventListener('click', () => {
    statsContainer.classList.add('hidden');
});

updateDisplay();

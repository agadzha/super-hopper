import * as THREE from "three";

function track(event, params = {}) {
    if (typeof gtag === "function") {
        gtag("event", event, params);
        console.log("EVENT:", event, params);
    }
}

const PLAYER_LANES = [-1, 0, 1];
const OBSTACLE_LANES = [-1, 0, 1];

const CONFIG = {
    laneWidth: 1.8,
    roadOffsetX: 3.6,
    gravity: 0.015,
    jumpPower: 0.35,
    superJumpMultiplier: 1.9,
    flyHeight: 1.95,
    spawnDistance: -60,
    coinSpawnDistance: -68,
    powerupSpawnDistance: -72,
    removeDistance: 12,
    maxSpeed: 0.42,
    minObstaclesAhead: 8,
    swipeThreshold: 28,
    magnetRadius: 4.6,
    magnetPull: 0.16
};

const POWERUP_TYPES = {
    fly: {
        id: "fly",
        name: "Sky Hop",
        duration: 5,
        color: 0x87e8ff,
        accent: 0xe9fbff,
        label: "FLY",
        description: "Float above obstacles for 5s."
    },
    jump: {
        id: "jump",
        name: "Moon Jump",
        duration: 10,
        color: 0xff96de,
        accent: 0xffe4f6,
        label: "JUMP",
        description: "Huge jumps for 10s."
    },
    magnet: {
        id: "magnet",
        name: "Coin Pull",
        duration: 10,
        color: 0xffd166,
        accent: 0xfff4cc,
        label: "MAG",
        description: "Magnet coins for 10s."
    },
    shield: {
        id: "shield",
        name: "1 Hit Shield",
        duration: 20,
        color: 0x74f7b8,
        accent: 0xe7fff2,
        label: "SHD",
        description: "Blocks 1 death for 20s."
    }
};

const LEVELS = [
    null,
    { id: 1, name: "Candy", target: 500, speed: 0.14, speedInc: 0.00003, spawnGap: 3.6, theme: { sky: 0xffd0c4, ground: 0xa95c54, obstacle: 0x4a3a42, decor: 0x9ca35a, divider: 0xf2f2f2, roadEdge: 0x2d2120 } },
    { id: 2, name: "Mint", target: 700, speed: 0.15, speedInc: 0.000035, spawnGap: 3.4, theme: { sky: 0xd7fff1, ground: 0x5aa58c, obstacle: 0x2d4b44, decor: 0x9ad18b, divider: 0xffffff, roadEdge: 0x22312d } },
    { id: 3, name: "Dust", target: 900, speed: 0.16, speedInc: 0.00004, spawnGap: 3.2, theme: { sky: 0xf6c28b, ground: 0xb85c38, obstacle: 0x324a5f, decor: 0x9c9f4f, divider: 0xffffff, roadEdge: 0x2f2220 } },
    { id: 4, name: "Blue", target: 1100, speed: 0.17, speedInc: 0.000045, spawnGap: 3.05, theme: { sky: 0xcde7ff, ground: 0x5f6caf, obstacle: 0x2d3142, decor: 0x8fbf6a, divider: 0xf5f5f5, roadEdge: 0x20242f } },
    { id: 5, name: "Sun", target: 1300, speed: 0.18, speedInc: 0.00005, spawnGap: 2.95, theme: { sky: 0xffe29a, ground: 0xd47a3f, obstacle: 0x5c3b2e, decor: 0xb7b24d, divider: 0xffffff, roadEdge: 0x3b2418 } },
    { id: 6, name: "Pink", target: 1500, speed: 0.19, speedInc: 0.000055, spawnGap: 2.85, theme: { sky: 0xf7b2d9, ground: 0x9f4d73, obstacle: 0x3b2635, decor: 0xc2a85a, divider: 0xf2f2f2, roadEdge: 0x28161f } },
    { id: 7, name: "Forest", target: 1700, speed: 0.2, speedInc: 0.00006, spawnGap: 2.75, theme: { sky: 0x9be564, ground: 0x3c7a57, obstacle: 0x22333b, decor: 0x7bd389, divider: 0xffffff, roadEdge: 0x172026 } },
    { id: 8, name: "Storm", target: 1900, speed: 0.21, speedInc: 0.000065, spawnGap: 2.65, theme: { sky: 0x8d99ae, ground: 0x6d597a, obstacle: 0x2b2d42, decor: 0xb56576, divider: 0xf1f1f1, roadEdge: 0x1b1c28 } },
    { id: 9, name: "Lava", target: 2100, speed: 0.22, speedInc: 0.00007, spawnGap: 2.55, theme: { sky: 0xff9671, ground: 0xc44536, obstacle: 0x2d1e2f, decor: 0xf4a259, divider: 0xffffff, roadEdge: 0x251515 } },
    { id: 10, name: "Midnight", target: 2300, speed: 0.23, speedInc: 0.00008, spawnGap: 2.45, theme: { sky: 0x0f1020, ground: 0x2d3250, obstacle: 0xffc857, decor: 0x4f5d75, divider: 0xffffff, roadEdge: 0x0a0c14 } }
];

const ENDLESS_DIFFICULTIES = {
    easy: {
        name: "Easy",
        speed: 0.14,
        speedInc: 0.00003,
        spawnGap: 3.5,
        theme: LEVELS[1].theme
    },
    normal: {
        name: "Normal",
        speed: 0.18,
        speedInc: 0.00005,
        spawnGap: 2.9,
        theme: LEVELS[4].theme
    },
    hard: {
        name: "Hard",
        speed: 0.22,
        speedInc: 0.00007,
        spawnGap: 2.4,
        theme: LEVELS[9].theme
    }
};

const SHOP_DATA = {
    skins: [
        {
            id: "sky-bunny",
            name: "Sky Bunny",
            price: 0,
            species: "bunny",
            baseColor: 0x8ad5ff,
            accentColor: 0xffffff,
            innerEarColor: 0xffc4de,
            glowColor: 0x7cecff,
            bellyColor: 0xe9f7ff,
            eyeColor: 0x13233f
        },
        {
            id: "sunset-bunny",
            name: "Sunset Bunny",
            price: 0,
            species: "bunny",
            baseColor: 0xffb08b,
            accentColor: 0xfff0be,
            innerEarColor: 0xff8eb8,
            glowColor: 0xffbc62,
            bellyColor: 0xfff4d8,
            eyeColor: 0x3a1d18
        },
        {
            id: "gorilla-king",
            name: "Gorilla King",
            price: 110,
            species: "gorilla",
            baseColor: 0x585a62,
            accentColor: 0x9aa1ad,
            innerEarColor: 0x7f8794,
            glowColor: 0x8dc7ff,
            bellyColor: 0xcfd5df,
            eyeColor: 0x16181d
        },
        {
            id: "chicken-star",
            name: "Chicken Star",
            price: 150,
            species: "chicken",
            baseColor: 0xfff6df,
            accentColor: 0xffc52b,
            innerEarColor: 0xff6c5c,
            glowColor: 0xffe28a,
            bellyColor: 0xffffff,
            eyeColor: 0x211a12
        },
        {
            id: "duck-wave",
            name: "Duck Wave",
            price: 170,
            species: "duck",
            baseColor: 0xfff15e,
            accentColor: 0xff9f45,
            innerEarColor: 0xffd77a,
            glowColor: 0x86fff0,
            bellyColor: 0xfff8b2,
            eyeColor: 0x26343f
        },
        {
            id: "pig-pop",
            name: "Pig Pop",
            price: 185,
            species: "pig",
            baseColor: 0xffb4cd,
            accentColor: 0xff88b7,
            innerEarColor: 0xff77af,
            glowColor: 0xffa8dc,
            bellyColor: 0xffd4e7,
            eyeColor: 0x4b2941
        },
        {
            id: "fox-flare",
            name: "Fox Flare",
            price: 210,
            species: "fox",
            baseColor: 0xff8f45,
            accentColor: 0xfff0d8,
            innerEarColor: 0xffd0a2,
            glowColor: 0xffb36c,
            bellyColor: 0xfff7e8,
            eyeColor: 0x382113
        },
        {
            id: "cat-night",
            name: "Cat Night",
            price: 240,
            species: "cat",
            baseColor: 0x34384d,
            accentColor: 0x93a1ff,
            innerEarColor: 0xffb6d5,
            glowColor: 0x8aa7ff,
            bellyColor: 0xbec7f7,
            eyeColor: 0xf4fbff
        },
        {
            id: "panda-pop",
            name: "Panda Pop",
            price: 280,
            species: "panda",
            baseColor: 0xf5f5f5,
            accentColor: 0x22252d,
            innerEarColor: 0x9fa5b6,
            glowColor: 0x9fe8ff,
            bellyColor: 0xffffff,
            eyeColor: 0x14161b
        },
        {
            id: "bear-bronze",
            name: "Bear Bronze",
            price: 320,
            species: "bear",
            baseColor: 0x8d5d3d,
            accentColor: 0xd5a071,
            innerEarColor: 0xc48d66,
            glowColor: 0xffc089,
            bellyColor: 0xeed4b7,
            eyeColor: 0x2f1c12
        },
        {
            id: "moon-bunny",
            name: "Moon Bunny",
            price: 90,
            species: "bunny",
            baseColor: 0xf6f7ff,
            accentColor: 0xb7cbff,
            innerEarColor: 0xd4dbff,
            glowColor: 0x9ec8ff,
            bellyColor: 0xffffff,
            eyeColor: 0x20335d
        },
        {
            id: "sakura-bunny",
            name: "Sakura Bunny",
            price: 160,
            species: "bunny",
            baseColor: 0xffb8d8,
            accentColor: 0xffffff,
            innerEarColor: 0xff78b5,
            glowColor: 0xff9bd8,
            bellyColor: 0xfff0f7,
            eyeColor: 0x482340
        },
        {
            id: "neon-bunny",
            name: "Neon Bunny",
            price: 260,
            species: "bunny",
            baseColor: 0x1c2340,
            accentColor: 0x42ffc7,
            innerEarColor: 0x9b7cff,
            glowColor: 0x42ffc7,
            bellyColor: 0x39456f,
            eyeColor: 0xeafcff
        },
        {
            id: "royal-bunny",
            name: "Royal Bunny",
            price: 390,
            species: "bunny",
            baseColor: 0xf3c74f,
            accentColor: 0xfff3c2,
            innerEarColor: 0xffdc7d,
            glowColor: 0xffd166,
            bellyColor: 0xfff6d5,
            eyeColor: 0x4c3210
        }
    ]
};

const TRAIL_DATA = [
    { id: "stardust", name: "Stardust", price: 0, color: 0x7cecff },
    { id: "sunflare", name: "Sunflare", price: 80, color: 0xffc857 },
    { id: "mintline", name: "Mintline", price: 120, color: 0x7bf1a8 },
    { id: "roseblink", name: "Rose Blink", price: 150, color: 0xff8fcf },
    { id: "nightpulse", name: "Night Pulse", price: 210, color: 0x8aa7ff }
];

const MISSION_LIBRARY = {
    coins_30: { id: "coins_30", title: "Collect 30 coins", type: "coins", target: 30, reward: 40 },
    survive_60: { id: "survive_60", title: "Survive 60 seconds", type: "survive", target: 60, reward: 55 },
    powerups_2: { id: "powerups_2", title: "Catch 2 boosts", type: "powerups", target: 2, reward: 35 },
    chest_1: { id: "chest_1", title: "Open 1 treasure chest", type: "chests", target: 1, reward: 60 },
    combo_5: { id: "combo_5", title: "Reach combo x5", type: "combo", target: 5, reward: 45 }
};

const ACHIEVEMENT_LIBRARY = {
    first_run: { id: "first_run", title: "First Run", description: "Start your first run." },
    level_5: { id: "level_5", title: "Level 5", description: "Reach level 5." },
    level_10: { id: "level_10", title: "Final Night", description: "Reach level 10." },
    coins_500: { id: "coins_500", title: "Coin Stack", description: "Collect 500 total coins." },
    skins_5: { id: "skins_5", title: "Closet Ready", description: "Own 5 skins." },
    trails_3: { id: "trails_3", title: "Trailblazer", description: "Own 3 trails." },
    versus_win: { id: "versus_win", title: "Versus Winner", description: "Win a 2P run." },
    mission_master: { id: "mission_master", title: "Mission Master", description: "Finish all active missions." }
};

const SPECIAL_LEVEL_IDS = new Set([5, 10]);

let state = {
    isPlaying: false,
    isPaused: false,
    mode: "1p",
    gameType: "levels",
    difficulty: "easy",
    soundEnabled: true,
    currentLevel: 1,
    unlockedLevel: 1,
    speed: LEVELS[1].speed,
    speedInc: LEVELS[1].speedInc,
    spawnGap: LEVELS[1].spawnGap,
    theme: LEVELS[1].theme,
    runTime: 0,
    players: [],
    coins: 0,
    collectedThisRun: 0,
    levelRecords: {},
    comboCount: 0,
    comboTimer: 0,
    comboBonus: 0,
    endlessBest: {
        easy: 0,
        normal: 0,
        hard: 0
    },
    ownedSkins: ["sky-bunny", "sunset-bunny"],
    ownedTrails: ["stardust"],
    selectedSkinP1: "sky-bunny",
    selectedSkinP2: "sunset-bunny",
    selectedTrailId: "stardust",
    dailyReward: {
        lastClaimDay: "",
        streak: 0
    },
    missions: [],
    achievements: {},
    stats: {
        runs: 0,
        deaths: 0,
        coinsCollected: 0,
        bestCombo: 0,
        powerupsCollected: 0,
        chestsOpened: 0,
        versusWins: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalPlayTime: 0,
        levelsCleared: 0
    }
};

const elScoreDisplay = document.getElementById("score-display");
const elScoreP1 = document.getElementById("score-p1");
const elScoreP2 = document.getElementById("score-p2");
const elScoreCardP2 = document.getElementById("score-card-p2");
const elInstructionsP2 = document.getElementById("instruction-p2");
const elFinalScore = document.getElementById("final-score");
const elStart = document.getElementById("start-screen");
const elGameOver = document.getElementById("game-over-screen");
const elPauseScreen = document.getElementById("pause-screen");
const elSoundToggle = document.getElementById("sound-toggle");
const elWalletValue = document.getElementById("wallet-value");
const elPauseBtn = document.getElementById("pause-btn");
const elResumeBtn = document.getElementById("resume-btn");
const elPauseMenuBtn = document.getElementById("pause-menu-btn");
const elShopPanel = document.getElementById("shop-panel");
const elOpenShopBtn = document.getElementById("open-shop-btn");
const elOpenShopFromMenu = document.getElementById("open-shop-from-menu");
const elCloseShopBtn = document.getElementById("close-shop-btn");
const elSkinShopP1 = document.getElementById("skin-shop-p1");
const elSkinShopP2 = document.getElementById("skin-shop-p2");
const elPowerupInfo = document.getElementById("powerup-info");
const elPowerupStatus = document.getElementById("powerup-status");
const elComboDisplay = document.getElementById("combo-display");
const elComboLabel = document.getElementById("combo-label");
const elComboBonus = document.getElementById("combo-bonus");
const elInspectViewport = document.getElementById("inspect-viewport");
const elInspectName = document.getElementById("inspect-name");
const elInspectMeta = document.getElementById("inspect-meta");
const elSwipeHint = document.getElementById("mobile-swipe-hint");
const elLevelDisplay = document.getElementById("level-display");
const elLevelValue = document.getElementById("level-value");
const elRunProgress = document.getElementById("run-progress");
const elRunProgressLabel = document.getElementById("run-progress-label");
const elRunProgressFill = document.getElementById("run-progress-fill");
const elLevelSelect = document.getElementById("level-select");
const elMenuBtn = document.getElementById("menu-btn");
const elLevelsGroup = document.getElementById("levels-group");
const elDifficultyGroup = document.getElementById("difficulty-group");
const elDailyStatus = document.getElementById("daily-status");
const elClaimDailyBtn = document.getElementById("claim-daily-btn");
const elMissionsList = document.getElementById("missions-list");
const elAchievementsList = document.getElementById("achievements-list");
const elStatsList = document.getElementById("stats-list");
const elTrailShop = document.getElementById("trail-shop");
const elFinishTitle = document.getElementById("finish-title");
const elRewardSummary = document.getElementById("reward-summary");
const elNextLevelBtn = document.getElementById("next-level-btn");

let scene;
let camera;
let renderer;
let playerMeshes = [];
let floorGroups = [];
let worldObjects = [];
let ambientWorldObjects = [];
let spawnTimer = 0;
let powerupSpawnTimer = 0;
let nextPowerupSpawnIn = 7;
let animationId = null;
let audioContext = null;
let lastFrameTime = 0;
let inspectScene;
let inspectCamera;
let inspectRenderer;
let inspectMesh = null;
let inspectAnimationId = null;
let inspectRotationY = 0.35;
let inspectRotationX = -0.12;
let inspectDragging = false;
let inspectPointerId = null;
let inspectDragX = 0;
let inspectDragY = 0;
let inspectDistance = 3.9;
let inspectSkinId = "sky-bunny";

let swipeState = {
    tracking: false,
    startX: 0,
    startY: 0,
    playerIndex: 0
};

function toCssColor(value) {
    return `#${value.toString(16).padStart(6, "0")}`;
}

function getSkinById(id) {
    return SHOP_DATA.skins.find((skin) => skin.id === id) || SHOP_DATA.skins[0];
}

function getDefaultOwnedSkins() {
    return SHOP_DATA.skins.filter((skin) => skin.price === 0).map((skin) => skin.id);
}

function sanitizeOwnedSkins(owned) {
    if (!Array.isArray(owned)) return getDefaultOwnedSkins();
    const valid = owned.filter((id) => SHOP_DATA.skins.some((skin) => skin.id === id));
    return valid.length ? valid : getDefaultOwnedSkins();
}

function getTrailById(id) {
    return TRAIL_DATA.find((trail) => trail.id === id) || TRAIL_DATA[0];
}

function getBiomeConfig() {
    if (state.gameType !== "levels") {
        return {
            name: `Endless ${state.difficulty}`,
            obstacleGapScale: 1,
            coinChance: 0.02,
            powerupDelayScale: 1
        };
    }

    const levelId = state.currentLevel;
    if (levelId <= 2) {
        return {
            name: "Beginner Road",
            obstacleGapScale: 1.12,
            coinChance: 0.035,
            powerupDelayScale: 0.85
        };
    }
    if (levelId <= 4) {
        return {
            name: "Speed Fields",
            obstacleGapScale: 1,
            coinChance: 0.025,
            powerupDelayScale: 1
        };
    }
    if (levelId <= 6) {
        return {
            name: "Boss Garden",
            obstacleGapScale: SPECIAL_LEVEL_IDS.has(levelId) ? 0.94 : 0.98,
            coinChance: 0.022,
            powerupDelayScale: 0.8
        };
    }
    if (levelId <= 8) {
        return {
            name: "Storm Run",
            obstacleGapScale: 0.95,
            coinChance: 0.024,
            powerupDelayScale: 0.9
        };
    }
    return {
        name: "Final Night",
        obstacleGapScale: SPECIAL_LEVEL_IDS.has(levelId) ? 0.9 : 0.94,
        coinChance: 0.026,
        powerupDelayScale: 0.88
    };
}

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function createInitialMissions() {
    return ["coins_30", "survive_60", "powerups_2"].map((id) => ({
        id,
        progress: 0,
        completed: false,
        claimed: false
    }));
}

function ensureMissionSet() {
    if (!Array.isArray(state.missions) || !state.missions.length) {
        state.missions = createInitialMissions();
    }
    state.missions = state.missions.filter((mission) => MISSION_LIBRARY[mission.id]).slice(0, 3);
    while (state.missions.length < 3) {
        const nextId = Object.keys(MISSION_LIBRARY).find((id) => !state.missions.some((mission) => mission.id === id));
        if (!nextId) break;
        state.missions.push({ id: nextId, progress: 0, completed: false, claimed: false });
    }
}

function ensureAchievementSet() {
    Object.keys(ACHIEVEMENT_LIBRARY).forEach((id) => {
        if (typeof state.achievements[id] !== "boolean") {
            state.achievements[id] = false;
        }
    });
}

function renderDailyReward() {
    const ready = state.dailyReward.lastClaimDay !== todayKey();
    const rewardValue = Math.min(100, 25 + state.dailyReward.streak * 5);
    elDailyStatus.textContent = ready
        ? `Claim ${rewardValue} coins • streak ${state.dailyReward.streak}`
        : `Come back tomorrow • streak ${state.dailyReward.streak}`;
    elClaimDailyBtn.disabled = !ready;
    elClaimDailyBtn.textContent = ready ? "CLAIM" : "CLAIMED";
}

function renderMissions() {
    elMissionsList.innerHTML = "";
    state.missions.forEach((mission) => {
        const meta = MISSION_LIBRARY[mission.id];
        const progress = Math.min(meta.target, mission.progress || 0);
        const line = document.createElement("div");
        line.className = "meta-line";
        line.innerHTML = `${meta.title} <strong>${progress}/${meta.target}</strong> • ${mission.claimed ? "DONE" : `+${meta.reward}`}`;
        elMissionsList.appendChild(line);
    });
}

function renderAchievements() {
    elAchievementsList.innerHTML = "";
    Object.values(ACHIEVEMENT_LIBRARY).forEach((achievement) => {
        const unlocked = state.achievements[achievement.id];
        const line = document.createElement("div");
        line.className = "meta-line";
        line.innerHTML = `${unlocked ? "UNLOCKED" : "LOCKED"} • ${achievement.title}`;
        elAchievementsList.appendChild(line);
    });
}

function renderStats() {
    elStatsList.innerHTML = "";
    const lines = [
        `Runs • ${state.stats.runs}`,
        `Coins • ${state.stats.coinsCollected}`,
        `Deaths • ${state.stats.deaths}`,
        `Best combo • ${state.stats.bestCombo}`,
        `Best streak • ${state.stats.bestStreak}`,
        `2P wins • ${state.stats.versusWins}`,
        `Levels cleared • ${state.stats.levelsCleared}`,
        `Play time • ${Math.floor(state.stats.totalPlayTime)}s`
    ];
    lines.forEach((text) => {
        const line = document.createElement("div");
        line.className = "meta-line";
        line.textContent = text;
        elStatsList.appendChild(line);
    });
}

function renderMetaPanels() {
    renderDailyReward();
    renderMissions();
    renderAchievements();
    renderStats();
}

function unlockAchievement(id) {
    if (!ACHIEVEMENT_LIBRARY[id] || state.achievements[id]) return;
    state.achievements[id] = true;
    state.coins += 20;
    playTone(940, 0.08, "triangle", 0.05);
    playTone(1180, 0.12, "triangle", 0.04);
    renderMetaPanels();
    updateHUD();
    saveProgress();
}

function maybeCompleteMission(id) {
    const mission = state.missions.find((item) => item.id === id);
    const meta = MISSION_LIBRARY[id];
    if (!mission || !meta || mission.claimed || mission.completed === true && mission.claimed) return;
    if ((mission.progress || 0) >= meta.target) {
        mission.completed = true;
        mission.claimed = true;
        state.coins += meta.reward;
        updateHUD();
        saveProgress();
        renderMetaPanels();
        if (state.missions.every((item) => item.claimed)) {
            unlockAchievement("mission_master");
        }
    }
}

function updateMissionProgress(type, amount) {
    state.missions.forEach((mission) => {
        const meta = MISSION_LIBRARY[mission.id];
        if (!meta || meta.type !== type || mission.claimed) return;
        mission.progress = Math.max(mission.progress || 0, meta.type === "survive" ? amount : (mission.progress || 0) + amount);
        maybeCompleteMission(mission.id);
    });
}

function claimDailyReward() {
    const today = todayKey();
    if (state.dailyReward.lastClaimDay === today) return;
    if (state.dailyReward.lastClaimDay) {
        const last = new Date(state.dailyReward.lastClaimDay);
        const diffDays = Math.floor((new Date(today) - last) / 86400000);
        if (diffDays > 1) {
            state.dailyReward.streak = 0;
        }
    }
    const rewardValue = Math.min(100, 25 + state.dailyReward.streak * 5);
    state.coins += rewardValue;
    state.dailyReward.streak += 1;
    state.dailyReward.lastClaimDay = today;
    updateHUD();
    renderDailyReward();
    renderStats();
    saveProgress();
    playTone(820, 0.08, "triangle", 0.05);
    playTone(1080, 0.12, "triangle", 0.04);
}

function getPowerColor(player) {
    if (player.shieldTimer > 0 && player.shieldHits > 0) return POWERUP_TYPES.shield.color;
    if (player.flyTimer > 0) return POWERUP_TYPES.fly.color;
    if (player.magnetTimer > 0) return POWERUP_TYPES.magnet.color;
    if (player.jumpBoostTimer > 0) return POWERUP_TYPES.jump.color;
    return getSkinById(player.skinId).glowColor;
}

function formatTimer(seconds) {
    return seconds >= 10 ? `${Math.ceil(seconds)}s` : `${seconds.toFixed(1)}s`;
}

function addPart(group, geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
}

function updateMeshPresentation(group, time, accentScale = 1, options = {}) {
    if (!group?.userData) return;
    const skin = group.userData.skin;
    const highlightColor = options.highlightColor || skin.glowColor;

    if (group.userData.animatedParts) {
        group.userData.animatedParts.forEach((part, partIndex) => {
            const wave = Math.sin(time * part.speed + part.phase + partIndex * 0.5) * part.amplitude;
            if (part.axis === "x") part.mesh.rotation.x = part.baseRotation.x + wave;
            else if (part.axis === "y") part.mesh.rotation.y = part.baseRotation.y + wave;
            else part.mesh.rotation.z = part.baseRotation.z + wave;
        });
    }

    if (group.userData.glowMaterials) {
        group.userData.glowMaterials.forEach((entry, index) => {
            entry.material.emissive.setHex(highlightColor);
            entry.material.emissiveIntensity = entry.base * accentScale * (0.88 + 0.22 * Math.sin(time * 2 + index));
        });
    }
}

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 11, 10);
    camera.lookAt(0, 0, -12);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("game-container").appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(8, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    bindUI();
    loadProgress();
    updateMenuButtons();
    renderShop();
    renderLevelSelect();
    updateHUD();
    renderMetaPanels();
    updatePowerupStatus();
    renderer.render(scene, camera);
}

function bindUI() {
    window.addEventListener("resize", onWindowResize);
    document.addEventListener("keydown", handleKeyboardInput);

    document.getElementById("start-btn").addEventListener("click", () => {
        track("game_start", {
            mode: state.mode,
            game_type: state.gameType,
            level: state.currentLevel,
            difficulty: state.difficulty
        });
        startGame();
    });

    document.getElementById("restart-btn").addEventListener("click", startGame);
    elMenuBtn.addEventListener("click", returnToMenu);
    elPauseBtn.addEventListener("click", () => {
        if (!state.isPlaying) return;
        setPaused(!state.isPaused);
    });
    elResumeBtn.addEventListener("click", () => setPaused(false));
    elPauseMenuBtn.addEventListener("click", returnToMenu);
    elClaimDailyBtn.addEventListener("click", claimDailyReward);
    elNextLevelBtn.addEventListener("click", () => {
        if (state.currentLevel < state.unlockedLevel) {
            state.currentLevel += 1;
            saveProgress();
            startGame();
        }
    });

    document.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            state.mode = btn.dataset.mode;
            updateMenuButtons();
        });
    });

    document.querySelectorAll(".game-type-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            state.gameType = btn.dataset.gameType;
            saveProgress();
            updateMenuButtons();
            updateHUD();
        });
    });

    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            state.difficulty = btn.dataset.difficulty;
            saveProgress();
            updateMenuButtons();
            updateHUD();
        });
    });

    elSoundToggle.addEventListener("click", () => {
        state.soundEnabled = !state.soundEnabled;
        elSoundToggle.textContent = state.soundEnabled ? "ON" : "OFF";
        elSoundToggle.classList.toggle("active", state.soundEnabled);
        ensureAudio();
        playTone(700, 0.05, "square", 0.03);
    });

    elOpenShopBtn.addEventListener("click", openShop);
    elOpenShopFromMenu.addEventListener("click", openShop);
    elCloseShopBtn.addEventListener("click", closeShop);

    bindSwipeControls();
    bindInspectViewer();
}

function bindSwipeControls() {
    window.addEventListener("touchstart", (event) => {
        if (!isMobileLike() || !state.isPlaying || !event.touches.length) return;
        const touch = event.touches[0];
        swipeState.tracking = true;
        swipeState.startX = touch.clientX;
        swipeState.startY = touch.clientY;
        swipeState.playerIndex = state.mode === "2p" && touch.clientX >= window.innerWidth / 2 ? 1 : 0;
    }, { passive: true });

    window.addEventListener("touchend", (event) => {
        if (!isMobileLike() || !state.isPlaying || !swipeState.tracking || !event.changedTouches.length) return;

        const touch = event.changedTouches[0];
        const dx = touch.clientX - swipeState.startX;
        const dy = touch.clientY - swipeState.startY;
        swipeState.tracking = false;

        if (Math.abs(dx) < CONFIG.swipeThreshold && Math.abs(dy) < CONFIG.swipeThreshold) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            triggerPlayerAction(swipeState.playerIndex, dx > 0 ? "right" : "left");
        } else if (dy < -CONFIG.swipeThreshold) {
            triggerPlayerAction(swipeState.playerIndex, "jump");
        }
    }, { passive: true });

    window.addEventListener("touchcancel", () => {
        swipeState.tracking = false;
    }, { passive: true });
}

function isMobileLike() {
    return window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
}

function loadProgress() {
    const saved = JSON.parse(localStorage.getItem("super_hopper_progress") || "{}");
    state.coins = saved.coins || 0;
    state.ownedSkins = sanitizeOwnedSkins(saved.ownedSkins);
    state.ownedTrails = Array.isArray(saved.ownedTrails) && saved.ownedTrails.length ? saved.ownedTrails.filter((id) => TRAIL_DATA.some((trail) => trail.id === id)) : ["stardust"];
    state.unlockedLevel = Math.max(1, Math.min(10, saved.unlockedLevel || 1));
    state.currentLevel = Math.max(1, Math.min(state.unlockedLevel, saved.currentLevel || 1));
    state.gameType = saved.gameType === "endless" ? "endless" : "levels";
    state.difficulty = ENDLESS_DIFFICULTIES[saved.difficulty] ? saved.difficulty : "easy";
    state.endlessBest.easy = saved.endlessBest?.easy || 0;
    state.endlessBest.normal = saved.endlessBest?.normal || 0;
    state.endlessBest.hard = saved.endlessBest?.hard || 0;
    state.levelRecords = saved.levelRecords || {};
    state.selectedTrailId = TRAIL_DATA.some((trail) => trail.id === saved.selectedTrailId) ? saved.selectedTrailId : "stardust";
    state.dailyReward = saved.dailyReward || { lastClaimDay: "", streak: 0 };
    state.missions = saved.missions || createInitialMissions();
    state.achievements = saved.achievements || {};
    state.stats = {
        runs: saved.stats?.runs || 0,
        deaths: saved.stats?.deaths || 0,
        coinsCollected: saved.stats?.coinsCollected || 0,
        bestCombo: saved.stats?.bestCombo || 0,
        powerupsCollected: saved.stats?.powerupsCollected || 0,
        chestsOpened: saved.stats?.chestsOpened || 0,
        versusWins: saved.stats?.versusWins || 0,
        bestStreak: saved.stats?.bestStreak || 0,
        currentStreak: saved.stats?.currentStreak || 0,
        totalPlayTime: saved.stats?.totalPlayTime || 0,
        levelsCleared: saved.stats?.levelsCleared || 0
    };

    const fallbackP1 = state.ownedSkins[0] || "sky-bunny";
    const fallbackP2 = state.ownedSkins[1] || fallbackP1;

    state.selectedSkinP1 = state.ownedSkins.includes(saved.selectedSkinP1) ? saved.selectedSkinP1 : fallbackP1;
    state.selectedSkinP2 = state.ownedSkins.includes(saved.selectedSkinP2) ? saved.selectedSkinP2 : fallbackP2;
    ensureMissionSet();
    ensureAchievementSet();
}

function saveProgress() {
    localStorage.setItem("super_hopper_progress", JSON.stringify({
        coins: state.coins,
        ownedSkins: state.ownedSkins,
        ownedTrails: state.ownedTrails,
        selectedSkinP1: state.selectedSkinP1,
        selectedSkinP2: state.selectedSkinP2,
        selectedTrailId: state.selectedTrailId,
        unlockedLevel: state.unlockedLevel,
        currentLevel: state.currentLevel,
        gameType: state.gameType,
        difficulty: state.difficulty,
        endlessBest: state.endlessBest,
        levelRecords: state.levelRecords,
        dailyReward: state.dailyReward,
        missions: state.missions,
        achievements: state.achievements,
        stats: state.stats
    }));
}

function updateHUD() {
    elWalletValue.textContent = state.coins;
    if (state.gameType === "levels") {
        elLevelValue.textContent = `L${state.currentLevel}`;
        if (elRunProgressLabel) {
            elRunProgressLabel.textContent = `${SPECIAL_LEVEL_IDS.has(state.currentLevel) ? "BOSS" : "LEVEL"} ${state.currentLevel} • ${getBiomeConfig().name}`;
        }
    } else {
        elLevelValue.textContent = state.difficulty.toUpperCase();
        if (elRunProgressLabel) {
            elRunProgressLabel.textContent = `ENDLESS ${state.difficulty.toUpperCase()} • BEST ${Math.floor(state.endlessBest[state.difficulty] || 0)}`;
        }
    }
}

function updateRunProgress() {
    if (!elRunProgress || !elRunProgressFill || !elRunProgressLabel) return;

    if (!state.isPlaying || !state.players.length) {
        elRunProgress.classList.add("hidden");
        elRunProgressFill.style.width = "0%";
        return;
    }

    const leadScore = Math.max(...state.players.map((player) => player.score));
    let progress = 0;

    if (state.gameType === "levels") {
        const target = currentLevelData().target;
        progress = Math.min(1, leadScore / target);
        elRunProgressLabel.textContent = `${SPECIAL_LEVEL_IDS.has(state.currentLevel) ? "BOSS" : "LEVEL"} ${state.currentLevel} • ${getBiomeConfig().name} • ${Math.floor(leadScore)} / ${target}`;
    } else {
        const milestone = Math.max(400, state.endlessBest[state.difficulty] || 400);
        progress = Math.min(1, leadScore / milestone);
        elRunProgressLabel.textContent = `ENDLESS ${state.difficulty.toUpperCase()} • BEST ${Math.floor(state.endlessBest[state.difficulty] || 0)}`;
    }

    elRunProgressFill.style.width = `${Math.max(0.03, progress) * 100}%`;
    elRunProgress.classList.remove("hidden");
}

function setPaused(paused) {
    if (!state.isPlaying) return;
    state.isPaused = paused;
    if (!paused) {
        lastFrameTime = performance.now();
    }
    elPauseScreen.classList.toggle("hidden", !paused);
    elPauseBtn.textContent = paused ? "RESUME" : "PAUSE";
}

function updatePowerupStatus() {
    if (!state.isPlaying || !state.players.length) {
        elPowerupStatus.classList.add("hidden");
        elPowerupStatus.innerHTML = "";
        return;
    }

    const items = [];

    state.players.forEach((player, index) => {
        if (player.flyTimer > 0) {
            items.push(`<div class="powerup-pill fly"><span class="powerup-owner">P${index + 1}</span><span class="powerup-tag">FLY</span><span class="powerup-time">${formatTimer(player.flyTimer)}</span></div>`);
        }
        if (player.jumpBoostTimer > 0) {
            items.push(`<div class="powerup-pill jump"><span class="powerup-owner">P${index + 1}</span><span class="powerup-tag">JUMP</span><span class="powerup-time">${formatTimer(player.jumpBoostTimer)}</span></div>`);
        }
        if (player.magnetTimer > 0) {
            items.push(`<div class="powerup-pill magnet"><span class="powerup-owner">P${index + 1}</span><span class="powerup-tag">MAG</span><span class="powerup-time">${formatTimer(player.magnetTimer)}</span></div>`);
        }
    });

    if (!items.length) {
        elPowerupStatus.classList.add("hidden");
        elPowerupStatus.innerHTML = "";
        return;
    }

    elPowerupStatus.innerHTML = items.join("");
    elPowerupStatus.classList.remove("hidden");
}

function resetCombo() {
    state.comboCount = 0;
    state.comboTimer = 0;
    state.comboBonus = 0;
    elComboDisplay.classList.add("hidden");
    elComboLabel.textContent = "COMBO x1";
    elComboBonus.textContent = "+0";
}

function updateComboDisplay() {
    if (state.comboCount <= 1 || state.comboTimer <= 0) {
        elComboDisplay.classList.add("hidden");
        return;
    }

    elComboLabel.textContent = `COMBO x${state.comboCount}`;
    elComboBonus.textContent = `+${state.comboBonus}`;
    elComboDisplay.classList.remove("hidden");
}

function registerCoinCombo(value) {
    state.comboCount += 1;
    state.comboTimer = 1.7;
    state.comboBonus = Math.floor((state.comboCount - 1) / 3);
    updateComboDisplay();
    return value + state.comboBonus;
}

function bindInspectViewer() {
    if (!elInspectViewport) return;

    const onPointerMove = (event) => {
        if (!inspectDragging || event.pointerId !== inspectPointerId) return;
        const dx = event.clientX - inspectDragX;
        const dy = event.clientY - inspectDragY;
        inspectDragX = event.clientX;
        inspectDragY = event.clientY;
        inspectRotationY += dx * 0.012;
        inspectRotationX = Math.max(-0.7, Math.min(0.45, inspectRotationX + dy * 0.008));
    };

    const onPointerUp = (event) => {
        if (event.pointerId !== inspectPointerId) return;
        inspectDragging = false;
        inspectPointerId = null;
        if (elInspectViewport.hasPointerCapture(event.pointerId)) {
            elInspectViewport.releasePointerCapture(event.pointerId);
        }
    };

    elInspectViewport.addEventListener("pointerdown", (event) => {
        inspectDragging = true;
        inspectPointerId = event.pointerId;
        inspectDragX = event.clientX;
        inspectDragY = event.clientY;
        elInspectViewport.setPointerCapture(event.pointerId);
    });

    elInspectViewport.addEventListener("pointermove", onPointerMove);
    elInspectViewport.addEventListener("pointerup", onPointerUp);
    elInspectViewport.addEventListener("pointercancel", onPointerUp);
    elInspectViewport.addEventListener("wheel", (event) => {
        event.preventDefault();
        inspectDistance = Math.max(2.8, Math.min(5.2, inspectDistance + event.deltaY * 0.003));
        renderInspectFrame(performance.now());
    }, { passive: false });
}

function renderLevelSelect() {
    elLevelSelect.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
        const level = LEVELS[i];
        const btn = document.createElement("button");
        btn.className = "level-btn";
        if (i === state.currentLevel) btn.classList.add("active");
        if (i > state.unlockedLevel) btn.classList.add("locked");
        btn.innerHTML = `${i}<br>${level.name}`;
        btn.disabled = i > state.unlockedLevel;

        btn.addEventListener("click", () => {
            if (i > state.unlockedLevel) return;
            state.currentLevel = i;
            saveProgress();
            renderLevelSelect();
            updateHUD();
        });

        elLevelSelect.appendChild(btn);
    }
}

function openShop() {
    renderShop();
    elShopPanel.classList.remove("hidden");
    ensureInspectViewer();
    setInspectSkin(state.selectedSkinP1);
    startInspectLoop();
}

function closeShop() {
    elShopPanel.classList.add("hidden");
    stopInspectLoop();
}

function buySkin(id, playerKey) {
    const item = getSkinById(id);

    if (!state.ownedSkins.includes(id)) {
        if (state.coins < item.price) return;
        state.coins -= item.price;
        state.ownedSkins.push(id);
    }

    if (playerKey === "p1") state.selectedSkinP1 = id;
    else state.selectedSkinP2 = id;

    if (state.ownedSkins.length >= 5) unlockAchievement("skins_5");
    updateHUD();
    saveProgress();
    renderMetaPanels();
    renderShop();
}

function buyTrail(id) {
    const item = getTrailById(id);

    if (!state.ownedTrails.includes(id)) {
        if (state.coins < item.price) return;
        state.coins -= item.price;
        state.ownedTrails.push(id);
    }

    state.selectedTrailId = id;
    if (state.ownedTrails.length >= 3) unlockAchievement("trails_3");
    updateHUD();
    saveProgress();
    renderMetaPanels();
    renderShop();
}

function renderCharacterPreview(skin) {
    const speciesLabel = skin.species ? skin.species.toUpperCase() : "SKIN";
    const baseStyle = `--skin-base:${toCssColor(skin.baseColor)}; --skin-accent:${toCssColor(skin.accentColor)}; --skin-inner:${toCssColor(skin.innerEarColor)}; --skin-glow:${toCssColor(skin.glowColor)}; --skin-belly:${toCssColor(skin.bellyColor)};`;

    if (skin.species === "gorilla") {
        return `
            <div class="character-preview gorilla" style="${baseStyle}">
                <div class="preview-gorilla-head"></div>
                <div class="preview-gorilla-body"></div>
                <div class="preview-gorilla-arm left"></div>
                <div class="preview-gorilla-arm right"></div>
                <div class="preview-gorilla-muzzle"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    if (skin.species === "chicken") {
        return `
            <div class="character-preview chicken" style="${baseStyle}">
                <div class="preview-bird-body"></div>
                <div class="preview-bird-head"></div>
                <div class="preview-crest"></div>
                <div class="preview-wing left"></div>
                <div class="preview-wing right"></div>
                <div class="preview-beak"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    if (skin.species === "duck") {
        return `
            <div class="character-preview duck" style="${baseStyle}">
                <div class="preview-bird-body"></div>
                <div class="preview-bird-head"></div>
                <div class="preview-wing left"></div>
                <div class="preview-wing right"></div>
                <div class="preview-beak wide"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    if (skin.species === "pig") {
        return `
            <div class="character-preview pig" style="${baseStyle}">
                <div class="preview-pig-body"></div>
                <div class="preview-pig-ear left"></div>
                <div class="preview-pig-ear right"></div>
                <div class="preview-pig-snout"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="preview-tail"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    if (skin.species === "fox") {
        return `
            <div class="character-preview fox" style="${baseStyle}">
                <div class="preview-fox-body"></div>
                <div class="preview-fox-ear left"></div>
                <div class="preview-fox-ear right"></div>
                <div class="preview-fox-muzzle"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="preview-tail fluffy"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    if (skin.species === "cat") {
        return `
            <div class="character-preview cat" style="${baseStyle}">
                <div class="preview-cat-body"></div>
                <div class="preview-cat-ear left"></div>
                <div class="preview-cat-ear right"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="preview-nose small"></div>
                <div class="preview-tail slim"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    if (skin.species === "panda") {
        return `
            <div class="character-preview panda" style="${baseStyle}">
                <div class="preview-panda-body"></div>
                <div class="preview-panda-ear left"></div>
                <div class="preview-panda-ear right"></div>
                <div class="preview-panda-patch left"></div>
                <div class="preview-panda-patch right"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="preview-nose"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    if (skin.species === "bear") {
        return `
            <div class="character-preview bear" style="${baseStyle}">
                <div class="preview-bear-body"></div>
                <div class="preview-bear-ear left"></div>
                <div class="preview-bear-ear right"></div>
                <div class="preview-bear-muzzle"></div>
                <div class="preview-eye left"></div>
                <div class="preview-eye right"></div>
                <div class="character-species">${speciesLabel}</div>
            </div>
        `;
    }

    return `
        <div class="character-preview bunny" style="${baseStyle}">
            <div class="character-ear left"></div>
            <div class="character-ear right"></div>
            <div class="character-ear-inner left"></div>
            <div class="character-ear-inner right"></div>
            <div class="character-head"></div>
            <div class="character-belly"></div>
            <div class="character-cheek left"></div>
            <div class="character-cheek right"></div>
            <div class="character-eye left"></div>
            <div class="character-eye right"></div>
            <div class="character-nose"></div>
            <div class="character-gem"></div>
            <div class="character-species">${speciesLabel}</div>
        </div>
    `;
}

function renderSkinGrid(targetEl, selectedSkinId, playerKey) {
    targetEl.innerHTML = "";

    SHOP_DATA.skins.forEach((item) => {
        const owned = state.ownedSkins.includes(item.id);
        const selected = selectedSkinId === item.id;
        const inspectSelected = inspectSkinId === item.id;

        const card = document.createElement("div");
        card.className = "shop-item";
        if (inspectSelected) card.classList.add("inspect-selected");
        card.innerHTML = `
            <div class="shop-preview">${renderCharacterPreview(item)}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">${owned ? "OWNED" : `${item.price} COINS`}</div>
            <button>${selected ? "SELECTED" : owned ? "USE" : "BUY"}</button>
        `;
        card.addEventListener("click", () => setInspectSkin(item.id));
        card.querySelector("button").addEventListener("click", (event) => {
            event.stopPropagation();
            buySkin(item.id, playerKey);
            setInspectSkin(item.id);
        });
        targetEl.appendChild(card);
    });
}

function renderPowerupPreview(powerup) {
    return `<div class="boost-preview ${powerup.id}">${powerup.label}</div>`;
}

function renderPowerupInfo() {
    elPowerupInfo.innerHTML = "";

    Object.values(POWERUP_TYPES).forEach((powerup) => {
        const card = document.createElement("div");
        card.className = "shop-item";
        card.innerHTML = `
            <div class="shop-preview">${renderPowerupPreview(powerup)}</div>
            <div class="shop-item-name">${powerup.name}</div>
            <div class="shop-item-price">SPAWNS IN RUN • ${powerup.duration}S</div>
            <div class="shop-item-note">${powerup.description}</div>
        `;
        elPowerupInfo.appendChild(card);
    });
}

function renderTrailGrid() {
    elTrailShop.innerHTML = "";

    TRAIL_DATA.forEach((item) => {
        const owned = state.ownedTrails.includes(item.id);
        const selected = state.selectedTrailId === item.id;
        const card = document.createElement("div");
        card.className = "shop-item";
        card.innerHTML = `
            <div class="shop-preview"><div class="trail-preview" style="--trail-color:${toCssColor(item.color)}"></div></div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">${owned ? "OWNED" : `${item.price} COINS`}</div>
            <button>${selected ? "SELECTED" : owned ? "USE" : "BUY"}</button>
        `;
        card.querySelector("button").addEventListener("click", () => buyTrail(item.id));
        elTrailShop.appendChild(card);
    });
}

function renderShop() {
    renderSkinGrid(elSkinShopP1, state.selectedSkinP1, "p1");
    renderSkinGrid(elSkinShopP2, state.selectedSkinP2, "p2");
    renderTrailGrid();
    renderPowerupInfo();
}

function ensureInspectViewer() {
    if (inspectRenderer || !elInspectViewport) return;

    inspectScene = new THREE.Scene();
    inspectScene.background = null;

    inspectCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    inspectCamera.position.set(0, 1.1, 3.9);
    inspectCamera.lookAt(0, 0.7, 0);

    inspectRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    inspectRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    inspectRenderer.shadowMap.enabled = true;
    inspectRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    elInspectViewport.innerHTML = "";
    elInspectViewport.insertAdjacentHTML("beforeend", `<div class="inspect-stage"></div>`);
    elInspectViewport.appendChild(inspectRenderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.92);
    inspectScene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(3.6, 5.4, 3.8);
    inspectScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7cecff, 0.72);
    rimLight.position.set(-3.2, 2.5, -3.8);
    inspectScene.add(rimLight);

    resizeInspectViewer();
    window.addEventListener("resize", resizeInspectViewer);
}

function resizeInspectViewer() {
    if (!inspectRenderer || !elInspectViewport) return;
    const width = Math.max(180, elInspectViewport.clientWidth);
    const height = Math.max(180, elInspectViewport.clientHeight);
    inspectRenderer.setSize(width, height, false);
    inspectCamera.aspect = width / height;
    inspectCamera.updateProjectionMatrix();
}

function setInspectSkin(skinId) {
    ensureInspectViewer();
    const skin = getSkinById(skinId);
    inspectSkinId = skinId;

    if (inspectMesh) {
        inspectScene.remove(inspectMesh);
        inspectMesh = null;
    }

    inspectMesh = createPlayerMesh(skinId);
    scene.remove(inspectMesh);
    inspectMesh.position.set(0, -0.08, 0);
    inspectMesh.rotation.set(0, 0, 0);
    inspectMesh.scale.setScalar(1.52);
    inspectScene.add(inspectMesh);

    inspectRotationY = 0.35;
    inspectRotationX = -0.12;
    inspectDistance = 3.9;

    elInspectName.textContent = skin.name;
    elInspectMeta.textContent = `${skin.species.toUpperCase()} • DRAG TO ROTATE`;
    renderShop();
    renderInspectFrame(performance.now());
}

function renderInspectFrame(now) {
    if (!inspectRenderer || !inspectScene || !inspectCamera || !inspectMesh) return;
    resizeInspectViewer();

    const t = now * 0.0014;
    if (!inspectDragging) inspectRotationY += 0.004;

    inspectCamera.position.set(0, 1.1, inspectDistance);
    inspectCamera.lookAt(0, 0.7, 0);
    inspectMesh.rotation.y = inspectRotationY;
    inspectMesh.rotation.x = inspectRotationX;
    inspectMesh.position.y = -0.03 + Math.sin(t * 1.6) * 0.05;
    updateMeshPresentation(inspectMesh, t, 1.35);

    inspectRenderer.render(inspectScene, inspectCamera);
}

function inspectLoop(now) {
    if (!elShopPanel || elShopPanel.classList.contains("hidden")) {
        inspectAnimationId = null;
        return;
    }
    renderInspectFrame(now);
    inspectAnimationId = requestAnimationFrame(inspectLoop);
}

function startInspectLoop() {
    if (inspectAnimationId) return;
    inspectAnimationId = requestAnimationFrame(inspectLoop);
}

function stopInspectLoop() {
    if (!inspectAnimationId) return;
    cancelAnimationFrame(inspectAnimationId);
    inspectAnimationId = null;
}

function updateMenuButtons() {
    document.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === state.mode);
    });

    document.querySelectorAll(".game-type-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.gameType === state.gameType);
    });

    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.difficulty === state.difficulty);
    });

    elSoundToggle.textContent = state.soundEnabled ? "ON" : "OFF";
    elSoundToggle.classList.toggle("active", state.soundEnabled);

    elLevelsGroup.classList.toggle("hidden", state.gameType !== "levels");
    elDifficultyGroup.classList.toggle("hidden", state.gameType !== "endless");

    updateModeUI();
}

function updateModeUI() {
    const twoPlayer = state.mode === "2p";
    elScoreCardP2.classList.toggle("hidden", !twoPlayer);
    elInstructionsP2.classList.toggle("hidden", !twoPlayer);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function ensureAudio() {
    if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
    }
}

function playTone(freq, duration, type = "square", volume = 0.04) {
    if (!state.soundEnabled) return;
    ensureAudio();
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
}

function currentLevelData() {
    return LEVELS[state.currentLevel];
}

function createPlayers() {
    const createPlayer = (name, roadX, controls, skinId) => ({
        name,
        roadX,
        lane: 0,
        currentLaneX: roadX,
        isJumping: false,
        jumpVel: 0,
        playerY: 0,
        alive: true,
        score: 0,
        controls,
        skinId,
        coinsRun: 0,
        flyTimer: 0,
        jumpBoostTimer: 0,
        magnetTimer: 0,
        shieldTimer: 0,
        shieldHits: 0,
        bobOffset: Math.random() * Math.PI * 2
    });

    if (state.mode === "1p") {
        return [
            createPlayer("PLAYER 1", 0, { left: "KeyA", right: "KeyD", jump: "KeyW" }, state.selectedSkinP1)
        ];
    }

    return [
        createPlayer("PLAYER 1", -CONFIG.roadOffsetX, { left: "KeyA", right: "KeyD", jump: "KeyW" }, state.selectedSkinP1),
        createPlayer("PLAYER 2", CONFIG.roadOffsetX, { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp" }, state.selectedSkinP2)
    ];
}

function createPlayerMesh(skinId) {
    const skin = getSkinById(skinId);
    const group = new THREE.Group();
    const animatedParts = [];
    const addAnimatedPart = (mesh, kind, speed, amplitude, axis = "z", phase = Math.random() * Math.PI * 2) => {
        animatedParts.push({ mesh, kind, speed, amplitude, axis, phase, baseRotation: { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z } });
        return mesh;
    };

    const baseMat = new THREE.MeshStandardMaterial({
        color: skin.baseColor,
        emissive: skin.glowColor,
        emissiveIntensity: 0.15,
        flatShading: true
    });
    const accentMat = new THREE.MeshStandardMaterial({
        color: skin.accentColor,
        emissive: skin.glowColor,
        emissiveIntensity: 0.22,
        flatShading: true
    });
    const innerMat = new THREE.MeshStandardMaterial({
        color: skin.innerEarColor,
        emissive: skin.glowColor,
        emissiveIntensity: 0.18,
        flatShading: true
    });
    const bellyMat = new THREE.MeshStandardMaterial({
        color: skin.bellyColor,
        flatShading: true
    });
    const glowMat = new THREE.MeshStandardMaterial({
        color: skin.glowColor,
        emissive: skin.glowColor,
        emissiveIntensity: 0.9,
        flatShading: true
    });
    const darkMat = new THREE.MeshBasicMaterial({ color: skin.eyeColor });
    let leftEye;
    let rightEye;

    if (skin.species === "gorilla") {
        addPart(group, new THREE.SphereGeometry(0.55, 18, 18), baseMat, 0, 0.5, 0);
        addPart(group, new THREE.SphereGeometry(0.34, 18, 18), accentMat, 0, 0.93, 0.06);
        addPart(group, new THREE.SphereGeometry(0.22, 16, 16), bellyMat, 0, 0.8, 0.3);
        addPart(group, new THREE.CapsuleGeometry(0.12, 0.34, 4, 8), baseMat, -0.42, 0.45, 0, 0, 0, 0.3);
        addPart(group, new THREE.CapsuleGeometry(0.12, 0.34, 4, 8), baseMat, 0.42, 0.45, 0, 0, 0, -0.3);
        addPart(group, new THREE.SphereGeometry(0.09, 12, 12), baseMat, -0.22, 1.1, 0.02);
        addPart(group, new THREE.SphereGeometry(0.09, 12, 12), baseMat, 0.22, 1.1, 0.02);
        leftEye = addPart(group, new THREE.BoxGeometry(0.06, 0.08, 0.04), darkMat, -0.12, 0.9, 0.33);
        rightEye = addPart(group, new THREE.BoxGeometry(0.06, 0.08, 0.04), darkMat, 0.12, 0.9, 0.33);
    } else if (skin.species === "chicken") {
        addPart(group, new THREE.SphereGeometry(0.5, 12, 12), baseMat, 0, 0.54, 0);
        addPart(group, new THREE.SphereGeometry(0.26, 10, 10), baseMat, 0, 1.0, 0.12);
        addPart(group, new THREE.ConeGeometry(0.11, 0.28, 4), accentMat, 0, 0.95, 0.42, Math.PI / 2, 0, 0);
        addPart(group, new THREE.ConeGeometry(0.1, 0.24, 4), innerMat, -0.1, 1.27, 0.04, 0, 0, -0.2);
        addPart(group, new THREE.ConeGeometry(0.1, 0.24, 4), innerMat, 0, 1.34, 0.04, 0, 0, 0);
        addPart(group, new THREE.ConeGeometry(0.1, 0.24, 4), innerMat, 0.1, 1.27, 0.04, 0, 0, 0.2);
        addAnimatedPart(addPart(group, new THREE.BoxGeometry(0.18, 0.08, 0.3), accentMat, -0.42, 0.54, 0, 0, 0, 0.45), "wing", 2.4, 0.28);
        addAnimatedPart(addPart(group, new THREE.BoxGeometry(0.18, 0.08, 0.3), accentMat, 0.42, 0.54, 0, 0, 0, -0.45), "wing", 2.4, -0.28);
        addPart(group, new THREE.ConeGeometry(0.12, 0.22, 4), glowMat, 0, 0.62, -0.42, -Math.PI / 2, 0, 0);
        leftEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, -0.1, 0.98, 0.31);
        rightEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, 0.1, 0.98, 0.31);
    } else if (skin.species === "duck") {
        addPart(group, new THREE.SphereGeometry(0.48, 12, 12), baseMat, 0, 0.55, 0);
        addPart(group, new THREE.SphereGeometry(0.24, 10, 10), baseMat, 0, 0.92, 0.16);
        addPart(group, new THREE.BoxGeometry(0.3, 0.1, 0.18), accentMat, 0, 0.86, 0.42);
        addAnimatedPart(addPart(group, new THREE.BoxGeometry(0.18, 0.08, 0.28), accentMat, -0.38, 0.58, 0, 0, 0, 0.4), "wing", 2.1, 0.22);
        addAnimatedPart(addPart(group, new THREE.BoxGeometry(0.18, 0.08, 0.28), accentMat, 0.38, 0.58, 0, 0, 0, -0.4), "wing", 2.1, -0.22);
        addPart(group, new THREE.ConeGeometry(0.11, 0.2, 4), glowMat, 0, 0.6, -0.42, -Math.PI / 2, 0, 0);
        addPart(group, new THREE.BoxGeometry(0.2, 0.16, 0.08), bellyMat, 0, 0.42, 0.4);
        leftEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, -0.09, 0.96, 0.28);
        rightEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, 0.09, 0.96, 0.28);
    } else if (skin.species === "pig") {
        addPart(group, new THREE.SphereGeometry(0.54, 18, 18), baseMat, 0, 0.54, 0);
        addPart(group, new THREE.SphereGeometry(0.26, 16, 16), accentMat, 0, 0.5, 0.36);
        addPart(group, new THREE.SphereGeometry(0.1, 12, 12), baseMat, -0.22, 1.03, 0.06);
        addPart(group, new THREE.SphereGeometry(0.1, 12, 12), baseMat, 0.22, 1.03, 0.06);
        addPart(group, new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10), innerMat, -0.06, 0.52, 0.51, Math.PI / 2, 0, 0);
        addPart(group, new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10), innerMat, 0.06, 0.52, 0.51, Math.PI / 2, 0, 0);
        addAnimatedPart(addPart(group, new THREE.TorusGeometry(0.07, 0.02, 6, 14), glowMat, 0, 0.18, -0.4, 0, Math.PI / 2, 0.4), "tail", 2.8, 0.5, "y");
        leftEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, -0.14, 0.7, 0.41);
        rightEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, 0.14, 0.7, 0.41);
    } else if (skin.species === "fox") {
        addPart(group, new THREE.CapsuleGeometry(0.28, 0.3, 6, 10), baseMat, 0, 0.5, 0);
        addPart(group, new THREE.SphereGeometry(0.22, 16, 16), accentMat, 0, 0.6, 0.33);
        addAnimatedPart(addPart(group, new THREE.ConeGeometry(0.12, 0.28, 4), baseMat, -0.23, 1.04, 0.02, 0, 0, -0.32), "ear", 2.2, -0.12);
        addAnimatedPart(addPart(group, new THREE.ConeGeometry(0.12, 0.28, 4), baseMat, 0.23, 1.04, 0.02, 0, 0, 0.32), "ear", 2.2, 0.12);
        addPart(group, new THREE.ConeGeometry(0.06, 0.16, 4), innerMat, -0.23, 1.02, 0.08, 0, 0, -0.25);
        addPart(group, new THREE.ConeGeometry(0.06, 0.16, 4), innerMat, 0.23, 1.02, 0.08, 0, 0, 0.25);
        addAnimatedPart(addPart(group, new THREE.CapsuleGeometry(0.11, 0.34, 4, 8), glowMat, 0, 0.45, -0.56, 0.2, 0, 0.5), "tail", 2.1, 0.24, "y");
        leftEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, -0.13, 0.7, 0.41);
        rightEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, 0.13, 0.7, 0.41);
    } else if (skin.species === "cat") {
        addPart(group, new THREE.CapsuleGeometry(0.28, 0.28, 6, 10), baseMat, 0, 0.5, 0);
        addPart(group, new THREE.SphereGeometry(0.2, 16, 16), bellyMat, 0, 0.36, 0.31);
        addAnimatedPart(addPart(group, new THREE.ConeGeometry(0.11, 0.26, 4), baseMat, -0.21, 1.08, 0.03, 0, 0, -0.1), "ear", 2.5, -0.1);
        addAnimatedPart(addPart(group, new THREE.ConeGeometry(0.11, 0.26, 4), baseMat, 0.21, 1.08, 0.03, 0, 0, 0.1), "ear", 2.5, 0.1);
        addPart(group, new THREE.ConeGeometry(0.05, 0.16, 4), innerMat, -0.21, 1.05, 0.08, 0, 0, -0.1);
        addPart(group, new THREE.ConeGeometry(0.05, 0.16, 4), innerMat, 0.21, 1.05, 0.08, 0, 0, 0.1);
        addAnimatedPart(addPart(group, new THREE.CapsuleGeometry(0.04, 0.34, 4, 8), glowMat, 0, 0.52, -0.5, 1.1, 0, 0.5), "tail", 2.4, 0.22, "y");
        leftEye = addPart(group, new THREE.BoxGeometry(0.05, 0.1, 0.04), darkMat, -0.14, 0.68, 0.41);
        rightEye = addPart(group, new THREE.BoxGeometry(0.05, 0.1, 0.04), darkMat, 0.14, 0.68, 0.41);
    } else if (skin.species === "panda") {
        addPart(group, new THREE.SphereGeometry(0.5, 18, 18), baseMat, 0, 0.5, 0);
        addPart(group, new THREE.SphereGeometry(0.2, 16, 16), bellyMat, 0, 0.35, 0.31);
        addPart(group, new THREE.SphereGeometry(0.11, 10, 10), accentMat, -0.22, 1.02, 0.02);
        addPart(group, new THREE.SphereGeometry(0.11, 10, 10), accentMat, 0.22, 1.02, 0.02);
        addPart(group, new THREE.SphereGeometry(0.12, 10, 10), accentMat, -0.15, 0.67, 0.38);
        addPart(group, new THREE.SphereGeometry(0.12, 10, 10), accentMat, 0.15, 0.67, 0.38);
        leftEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, -0.15, 0.68, 0.41);
        rightEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, 0.15, 0.68, 0.41);
    } else if (skin.species === "bear") {
        addPart(group, new THREE.SphereGeometry(0.54, 18, 18), baseMat, 0, 0.5, 0);
        addPart(group, new THREE.SphereGeometry(0.22, 16, 16), bellyMat, 0, 0.34, 0.33);
        addPart(group, new THREE.SphereGeometry(0.11, 10, 10), accentMat, -0.23, 1.0, 0.02);
        addPart(group, new THREE.SphereGeometry(0.11, 10, 10), accentMat, 0.23, 1.0, 0.02);
        addPart(group, new THREE.SphereGeometry(0.17, 16, 16), accentMat, 0, 0.56, 0.34);
        leftEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, -0.13, 0.72, 0.41);
        rightEye = addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.04), darkMat, 0.13, 0.72, 0.41);
    } else {
        addPart(group, new THREE.SphereGeometry(0.5, 18, 18), baseMat, 0, 0.5, 0);
        addPart(group, new THREE.SphereGeometry(0.2, 16, 16), bellyMat, 0, 0.34, 0.32);
        addAnimatedPart(addPart(group, new THREE.CapsuleGeometry(0.06, 0.28, 4, 8), baseMat, -0.2, 1.06, -0.01, 0, 0, -0.12), "ear", 2.4, -0.1);
        addAnimatedPart(addPart(group, new THREE.CapsuleGeometry(0.06, 0.28, 4, 8), baseMat, 0.2, 1.06, -0.01, 0, 0, 0.12), "ear", 2.4, 0.1);
        addPart(group, new THREE.CapsuleGeometry(0.03, 0.16, 4, 8), innerMat, -0.2, 1.07, 0.05, 0, 0, -0.12);
        addPart(group, new THREE.CapsuleGeometry(0.03, 0.16, 4, 8), innerMat, 0.2, 1.07, 0.05, 0, 0, 0.12);
        addPart(group, new THREE.SphereGeometry(0.09, 10, 10), glowMat, -0.25, 0.44, 0.35);
        addPart(group, new THREE.SphereGeometry(0.09, 10, 10), glowMat, 0.25, 0.44, 0.35);
        addPart(group, new THREE.SphereGeometry(0.06, 10, 10), accentMat, 0, 0.34, 0.43);
        addPart(group, new THREE.SphereGeometry(0.13, 10, 10), accentMat, 0, 0.72, 0.3);
        addPart(group, new THREE.SphereGeometry(0.15, 10, 10), accentMat, 0, 0.42, -0.42);
        leftEye = addPart(group, new THREE.BoxGeometry(0.06, 0.1, 0.04), darkMat, -0.16, 0.58, 0.41);
        rightEye = addPart(group, new THREE.BoxGeometry(0.06, 0.1, 0.04), darkMat, 0.16, 0.58, 0.41);
    }

    leftEye.receiveShadow = false;
    rightEye.receiveShadow = false;

    group.userData = {
        skin,
        glowMaterials: [
            { material: baseMat, base: 0.15 },
            { material: accentMat, base: 0.22 },
            { material: innerMat, base: 0.18 },
            { material: glowMat, base: 0.9 }
        ],
        animatedParts
    };

    scene.add(group);
    return group;
}

function createObstacleMesh() {
    const difficultyFactor = state.speed / CONFIG.maxSpeed;
    const specialLevel = state.gameType === "levels" && SPECIAL_LEVEL_IDS.has(state.currentLevel);
    const roll = Math.random();
    let geo;
    let variant = "normal";
    let baseY = 0.45;

    if (roll < 0.18 + difficultyFactor * 0.12) {
        geo = new THREE.BoxGeometry(1.18, 0.55, 0.7);
        variant = "wide";
        baseY = 0.3;
    } else if (roll < 0.32 + difficultyFactor * 0.14) {
        geo = new THREE.BoxGeometry(0.78, 0.34, 0.78);
        variant = "low";
        baseY = 0.17;
    } else if (roll < 0.44 + difficultyFactor * 0.12) {
        geo = new THREE.CylinderGeometry(0.34, 0.34, 0.92, 8);
        variant = "mover";
    } else if (roll < 0.56 + (specialLevel ? 0.1 : 0)) {
        geo = new THREE.ConeGeometry(0.4, 0.9, 5);
        variant = "hopper";
    } else {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) geo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
        else if (type === 1) geo = new THREE.ConeGeometry(0.42, 0.95, 5);
        else geo = new THREE.CylinderGeometry(0.38, 0.38, 0.9, 6);
    }

    const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
            color: state.theme.obstacle,
            flatShading: true
        })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.variant = variant;
    mesh.userData.baseY = baseY;
    mesh.userData.moveAmp = variant === "mover" ? 0.52 : 0;
    mesh.userData.moveSpeed = 1.6 + Math.random() * 0.7;
    mesh.userData.hopAmp = variant === "hopper" ? 0.32 : 0;
    mesh.userData.hopSpeed = 2.2 + Math.random() * 1.2;
    return mesh;
}

function createDecorationMesh() {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 0.9, 5),
        new THREE.MeshStandardMaterial({ color: 0x5d4037, flatShading: true })
    );
    trunk.position.y = 0.45;
    trunk.castShadow = true;
    group.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.45),
        new THREE.MeshStandardMaterial({
            color: state.theme.decor,
            flatShading: true
        })
    );
    leaves.position.y = 1.12;
    leaves.castShadow = true;
    group.add(leaves);

    return group;
}

function createCoinMesh(value = 1, kind = "coin") {
    let geometry;
    let color = 0xffd166;

    if (kind === "chest") {
        geometry = new THREE.BoxGeometry(0.46, 0.36, 0.36);
        color = 0xc98933;
    } else {
        const isBig = value >= 5;
        geometry = new THREE.CylinderGeometry(
            isBig ? 0.34 : 0.22,
            isBig ? 0.34 : 0.22,
            isBig ? 0.12 : 0.08,
            18
        );
        color = value >= 10 ? 0x7cecff : isBig ? 0xff9f1c : 0xffd166;
    }

    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.35
        })
    );
    if (kind !== "chest") {
        mesh.rotation.x = Math.PI / 2;
    }
    mesh.castShadow = true;
    mesh.userData.kind = kind;
    return mesh;
}

function createPowerupMesh(kind) {
    const powerup = POWERUP_TYPES[kind];
    const group = new THREE.Group();

    const coreMat = new THREE.MeshStandardMaterial({
        color: powerup.color,
        emissive: powerup.color,
        emissiveIntensity: 0.75,
        flatShading: true
    });
    const accentMat = new THREE.MeshStandardMaterial({
        color: powerup.accent,
        emissive: powerup.color,
        emissiveIntensity: 0.35,
        flatShading: true
    });
    const auraMat = new THREE.MeshStandardMaterial({
        color: powerup.color,
        emissive: powerup.color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.24
    });

    addPart(group, new THREE.OctahedronGeometry(0.2), coreMat, 0, 0, 0);

        if (kind === "fly") {
            addPart(group, new THREE.BoxGeometry(0.18, 0.08, 0.28), accentMat, -0.23, 0, 0, 0, 0, 0.5);
            addPart(group, new THREE.BoxGeometry(0.18, 0.08, 0.28), accentMat, 0.23, 0, 0, 0, 0, -0.5);
            addPart(group, new THREE.TorusGeometry(0.34, 0.04, 8, 24), accentMat, 0, 0, 0, Math.PI / 2, 0, 0);
        } else if (kind === "jump") {
            addPart(group, new THREE.CylinderGeometry(0.08, 0.08, 0.38, 10), accentMat, 0, -0.12, 0);
            addPart(group, new THREE.ConeGeometry(0.14, 0.26, 6), accentMat, 0, 0.26, 0);
        } else if (kind === "shield") {
            addPart(group, new THREE.TorusGeometry(0.34, 0.05, 8, 28), accentMat, 0, 0, 0, Math.PI / 2, 0, 0);
            addPart(group, new THREE.OctahedronGeometry(0.1), accentMat, 0, 0.26, 0);
            addPart(group, new THREE.OctahedronGeometry(0.1), accentMat, 0, -0.26, 0);
        } else {
            addPart(group, new THREE.BoxGeometry(0.08, 0.36, 0.08), accentMat, -0.18, 0, 0);
            addPart(group, new THREE.BoxGeometry(0.08, 0.36, 0.08), accentMat, 0.18, 0, 0);
            addPart(group, new THREE.BoxGeometry(0.36, 0.08, 0.08), accentMat, 0, -0.18, 0);
        }

    const aura = addPart(group, new THREE.SphereGeometry(0.5, 12, 12), auraMat, 0, 0, 0);
    aura.castShadow = false;

    group.userData = {
        spin: 0.06 + Math.random() * 0.03,
        powerup
    };

    return group;
}

function getSelectedTrailColor() {
    return getTrailById(state.selectedTrailId).color;
}

function spawnTrail(x, y, z, color = getSelectedTrailColor(), scale = 0.08) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(scale, 6, 6),
        new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.45,
            transparent: true,
            opacity: 1
        })
    );

    mesh.position.set(x, y, z - 0.35);
    scene.add(mesh);
    worldObjects.push({
        mesh,
        type: "trail",
        life: 1
    });
}

function clearMeshes(list) {
    list.forEach((item) => scene.remove(item));
}

function clearWorld() {
    worldObjects.forEach((obj) => scene.remove(obj.mesh));
    worldObjects = [];
}

function addRoad(xCenter) {
    const roadWidth = 6.3;
    const roadLength = 180;

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(roadWidth, roadLength),
        new THREE.MeshStandardMaterial({
            color: state.theme.ground,
            roughness: 1
        })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(xCenter, 0, -45);
    road.receiveShadow = true;
    scene.add(road);
    floorGroups.push(road);

    const edgeMat = new THREE.MeshStandardMaterial({ color: state.theme.roadEdge });
    const lineMat = new THREE.MeshStandardMaterial({ color: state.theme.divider });

    const leftEdge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, roadLength), edgeMat);
    leftEdge.position.set(xCenter - roadWidth / 2, 0.06, -45);
    scene.add(leftEdge);
    floorGroups.push(leftEdge);

    const rightEdge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, roadLength), edgeMat);
    rightEdge.position.set(xCenter + roadWidth / 2, 0.06, -45);
    scene.add(rightEdge);
    floorGroups.push(rightEdge);

    PLAYER_LANES.forEach((laneLine) => {
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, roadLength), lineMat);
        line.position.set(xCenter + laneLine * CONFIG.laneWidth, 0.03, -45);
        scene.add(line);
        floorGroups.push(line);
    });
}

function addDecorations() {
    for (let i = 0; i < 18; i++) {
        const leftDecor = createDecorationMesh();
        leftDecor.position.set(-9 - Math.random() * 5, 0, -10 - i * 8);
        scene.add(leftDecor);
        worldObjects.push({ mesh: leftDecor, type: "decor" });

        const rightDecor = createDecorationMesh();
        rightDecor.position.set(9 + Math.random() * 5, 0, -10 - i * 8);
        scene.add(rightDecor);
        worldObjects.push({ mesh: rightDecor, type: "decor" });
    }
}

function clearAmbientWorld() {
    ambientWorldObjects.forEach((item) => scene.remove(item.mesh));
    ambientWorldObjects = [];
}

function addAmbientWorld() {
    clearAmbientWorld();

    const specialLevel = state.gameType === "levels" && SPECIAL_LEVEL_IDS.has(state.currentLevel);
    const levelId = state.currentLevel;

    if (specialLevel || levelId >= 8) {
        for (let i = 0; i < 22; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(0.06 + Math.random() * 0.05, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            star.position.set((Math.random() - 0.5) * 26, 5 + Math.random() * 7, -8 - Math.random() * 90);
            scene.add(star);
            ambientWorldObjects.push({ mesh: star, type: "star", phase: Math.random() * Math.PI * 2 });
        }
    } else {
        for (let i = 0; i < 8; i++) {
            const cloud = new THREE.Mesh(
                new THREE.SphereGeometry(0.55 + Math.random() * 0.25, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0xf5f7ff, transparent: true, opacity: 0.92 })
            );
            cloud.position.set((Math.random() - 0.5) * 20, 4.4 + Math.random() * 2.3, -10 - Math.random() * 80);
            scene.add(cloud);
            ambientWorldObjects.push({ mesh: cloud, type: "cloud", drift: 0.004 + Math.random() * 0.003 });
        }
    }

    if (levelId === 8) {
        for (let i = 0; i < 18; i++) {
            const rain = new THREE.Mesh(
                new THREE.BoxGeometry(0.03, 0.55, 0.03),
                new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.7 })
            );
            rain.position.set((Math.random() - 0.5) * 20, 5 + Math.random() * 4, -8 - Math.random() * 70);
            scene.add(rain);
            ambientWorldObjects.push({ mesh: rain, type: "rain", fall: 0.05 + Math.random() * 0.03 });
        }
    }

    if (levelId === 9 || levelId === 10) {
        for (let i = 0; i < 16; i++) {
            const ember = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xffa45b })
            );
            ember.position.set((Math.random() - 0.5) * 18, 0.8 + Math.random() * 2, -10 - Math.random() * 70);
            scene.add(ember);
            ambientWorldObjects.push({ mesh: ember, type: "ember", rise: 0.01 + Math.random() * 0.02 });
        }
    }
}

function updateAmbientWorld(dtScale) {
    for (let i = ambientWorldObjects.length - 1; i >= 0; i--) {
        const item = ambientWorldObjects[i];
        if (item.type === "cloud") {
            item.mesh.position.x += item.drift * dtScale * 60;
            if (item.mesh.position.x > 14) item.mesh.position.x = -14;
        } else if (item.type === "star") {
            item.mesh.material.opacity = 0.45 + 0.55 * Math.abs(Math.sin(performance.now() * 0.001 + item.phase));
        } else if (item.type === "rain") {
            item.mesh.position.y -= item.fall * dtScale * 10;
            item.mesh.position.z += state.speed * dtScale * 1.5;
            if (item.mesh.position.y < -0.5) {
                item.mesh.position.y = 7;
            }
        } else if (item.type === "ember") {
            item.mesh.position.y += item.rise * dtScale * 10;
            item.mesh.position.z += state.speed * dtScale * 1.3;
            if (item.mesh.position.y > 4.5) {
                item.mesh.position.y = 0.7;
            }
        }
    }
}

function spawnObstacleRow() {
    const lane = OBSTACLE_LANES[Math.floor(Math.random() * OBSTACLE_LANES.length)];

    state.players.forEach((player, index) => {
        if (!player.alive && state.mode === "2p") return;

        const obstacle = createObstacleMesh();
        obstacle.position.set(player.roadX + lane * CONFIG.laneWidth, 0.45, CONFIG.spawnDistance);
        scene.add(obstacle);

        worldObjects.push({
            mesh: obstacle,
            type: "obstacle",
            owner: index,
            hit: false
        });
    });
}

function spawnCoinRow() {
    const lane = OBSTACLE_LANES[Math.floor(Math.random() * OBSTACLE_LANES.length)];
    const chestRoll = Math.random();
    let value = 1;
    let kind = "coin";

    if (chestRoll < 0.03) {
        value = 25;
        kind = "chest";
    } else if (chestRoll < 0.1) {
        value = 10;
        kind = "super";
    } else if (chestRoll < 0.25) {
        value = 5;
    }

    state.players.forEach((player, index) => {
        if (!player.alive && state.mode === "2p") return;

        const coin = createCoinMesh(value, kind);
        coin.position.set(
            player.roadX + lane * CONFIG.laneWidth,
            kind === "chest" ? 0.95 : value >= 5 ? 1.05 : 0.9,
            CONFIG.coinSpawnDistance
        );
        scene.add(coin);

        worldObjects.push({
            mesh: coin,
            type: "coin",
            owner: index,
            taken: false,
            value,
            kind
        });
    });
}

function spawnPowerupRow() {
    const kinds = Object.keys(POWERUP_TYPES);
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const lane = OBSTACLE_LANES[Math.floor(Math.random() * OBSTACLE_LANES.length)];

    state.players.forEach((player, index) => {
        if (!player.alive && state.mode === "2p") return;

        const powerup = createPowerupMesh(kind);
        powerup.position.set(player.roadX + lane * CONFIG.laneWidth, 1.2, CONFIG.powerupSpawnDistance);
        scene.add(powerup);

        worldObjects.push({
            mesh: powerup,
            type: "powerup",
            owner: index,
            kind,
            taken: false,
            baseY: 1.2,
            phase: Math.random() * Math.PI * 2
        });
    });
}

function countObstaclesAhead() {
    return worldObjects.filter((obj) => obj.type === "obstacle" && obj.mesh.position.z < 0).length;
}

function startGame() {
    ensureAudio();

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    let setup;

    if (state.gameType === "levels") {
        const level = currentLevelData();
        setup = {
            speed: level.speed,
            speedInc: level.speedInc,
            spawnGap: level.spawnGap,
            theme: level.theme
        };
    } else {
        const endless = ENDLESS_DIFFICULTIES[state.difficulty];
        setup = {
            speed: endless.speed,
            speedInc: endless.speedInc,
            spawnGap: endless.spawnGap,
            theme: endless.theme
        };
    }

    state.isPlaying = true;
    state.isPaused = false;
    state.speed = setup.speed;
    state.speedInc = setup.speedInc;
    state.spawnGap = setup.spawnGap;
    state.theme = setup.theme;
    state.players = createPlayers();
    state.runTime = 0;
    state.collectedThisRun = 0;
    state.stats.runs += 1;
    unlockAchievement("first_run");
    if (state.currentLevel >= 5) unlockAchievement("level_5");
    if (state.currentLevel >= 10) unlockAchievement("level_10");

    spawnTimer = 0;
    powerupSpawnTimer = 0;
    nextPowerupSpawnIn = state.gameType === "levels" && state.currentLevel <= 3
        ? 4 + Math.random() * 2.5
        : SPECIAL_LEVEL_IDS.has(state.currentLevel)
            ? 3.8 + Math.random() * 2.2
            : 6 + Math.random() * 4;
    nextPowerupSpawnIn *= getBiomeConfig().powerupDelayScale;
    lastFrameTime = performance.now();

    elStart.classList.add("hidden");
    elGameOver.classList.add("hidden");
    elPauseScreen.classList.add("hidden");
    elScoreDisplay.classList.remove("hidden");
    elLevelDisplay.classList.remove("hidden");
    elRunProgress.classList.remove("hidden");
    elPauseBtn.classList.remove("hidden");
    elPauseBtn.textContent = "PAUSE";

    if (isMobileLike()) elSwipeHint.classList.remove("hidden");
    else elSwipeHint.classList.add("hidden");

    elScoreP1.textContent = "0";
    elScoreP2.textContent = "0";
    updateModeUI();
    updateHUD();
    updatePowerupStatus();
    updateRunProgress();
    resetCombo();

    scene.background = new THREE.Color(state.theme.sky);
    scene.fog = new THREE.Fog(state.theme.sky, 12, 58);

    clearMeshes(floorGroups);
    floorGroups = [];
    clearMeshes(playerMeshes);
    playerMeshes = [];
    clearWorld();
    clearAmbientWorld();

    if (state.mode === "1p") {
        addRoad(0);
    } else {
        addRoad(-CONFIG.roadOffsetX);
        addRoad(CONFIG.roadOffsetX);
    }

    addDecorations();
    addAmbientWorld();

    state.players.forEach((player) => {
        const mesh = createPlayerMesh(player.skinId);
        mesh.position.set(player.currentLaneX, 0.45, 0);
        playerMeshes.push(mesh);
    });

    for (let i = 0; i < 4; i++) spawnObstacleRow();
    for (let i = 0; i < (state.currentLevel <= 3 ? 3 : 2); i++) spawnCoinRow();

    playTone(520, 0.08, "square", 0.05);
    playTone(700, 0.1, "square", 0.04);
    saveProgress();
    renderMetaPanels();

    animate(lastFrameTime);
}

function returnToMenu() {
    state.isPlaying = false;
    state.isPaused = false;
    if (animationId) cancelAnimationFrame(animationId);

    elGameOver.classList.add("hidden");
    elPauseScreen.classList.add("hidden");
    elStart.classList.remove("hidden");
    elScoreDisplay.classList.add("hidden");
    elLevelDisplay.classList.add("hidden");
    elRunProgress.classList.add("hidden");
    elPauseBtn.classList.add("hidden");
    elSwipeHint.classList.add("hidden");
    elPowerupStatus.classList.add("hidden");
    elComboDisplay.classList.add("hidden");
    clearAmbientWorld();

    renderLevelSelect();
    updateHUD();
    renderMetaPanels();
    saveProgress();
}

function movePlayerLane(player, direction) {
    const currentIndex = PLAYER_LANES.indexOf(player.lane);
    const nextIndex = Math.max(0, Math.min(PLAYER_LANES.length - 1, currentIndex + direction));
    player.lane = PLAYER_LANES[nextIndex];
}

function triggerPlayerAction(playerIndex, action) {
    if (!state.isPlaying) return;
    const player = state.players[playerIndex];
    if (!player || !player.alive) return;

    if (action === "left") {
        movePlayerLane(player, -1);
        playTone(420, 0.03, "square", 0.02);
    } else if (action === "right") {
        movePlayerLane(player, 1);
        playTone(520, 0.03, "square", 0.02);
    } else if (action === "jump" && !player.isJumping && player.flyTimer <= 0) {
        player.isJumping = true;
        player.jumpVel = CONFIG.jumpPower * (player.jumpBoostTimer > 0 ? CONFIG.superJumpMultiplier : 1);
        playTone(player.jumpBoostTimer > 0 ? 1020 : 880, 0.08, "square", 0.04);
    }
}

function handleKeyboardInput(e) {
    if (e.code === "KeyP" || e.code === "Escape") {
        if (state.isPlaying) {
            setPaused(!state.isPaused);
        }
        return;
    }

    if (!state.isPlaying) {
        if (e.code === "Space" || e.code === "Enter") startGame();
        return;
    }
    if (state.isPaused) return;

    state.players.forEach((player, index) => {
        if (!player.alive) return;

        if (e.code === player.controls.left) triggerPlayerAction(index, "left");
        else if (e.code === player.controls.right) triggerPlayerAction(index, "right");
        else if (e.code === player.controls.jump) triggerPlayerAction(index, "jump");
    });
}

function applyPowerup(player, kind) {
    const data = POWERUP_TYPES[kind];

    if (kind === "fly") player.flyTimer = Math.max(player.flyTimer, data.duration);
    if (kind === "jump") player.jumpBoostTimer = Math.max(player.jumpBoostTimer, data.duration);
    if (kind === "magnet") player.magnetTimer = Math.max(player.magnetTimer, data.duration);
    if (kind === "shield") {
        player.shieldTimer = Math.max(player.shieldTimer, data.duration);
        player.shieldHits = 1;
    }
    state.stats.powerupsCollected += 1;
    updateMissionProgress("powerups", 1);

    track("powerup_collect", {
        kind,
        mode: state.gameType
    });

    if (kind === "fly") playTone(980, 0.09, "triangle", 0.05);
    if (kind === "jump") playTone(1180, 0.08, "triangle", 0.05);
    if (kind === "magnet") playTone(860, 0.1, "triangle", 0.05);
    if (kind === "shield") playTone(720, 0.14, "triangle", 0.06);

    renderMetaPanels();
    updatePowerupStatus();
}

function updatePlayers(dtScale) {
    const dtSeconds = dtScale / 60;
    const now = performance.now() * 0.005;
    state.runTime += dtSeconds;
    state.stats.totalPlayTime += dtSeconds;
    updateMissionProgress("survive", state.runTime);

    state.players.forEach((player, index) => {
        if (!player.alive) return;

        player.score += state.speed * dtScale;
        player.flyTimer = Math.max(0, player.flyTimer - dtSeconds);
        player.jumpBoostTimer = Math.max(0, player.jumpBoostTimer - dtSeconds);
        player.magnetTimer = Math.max(0, player.magnetTimer - dtSeconds);
        player.shieldTimer = Math.max(0, player.shieldTimer - dtSeconds);
        if (player.shieldTimer <= 0) {
            player.shieldHits = 0;
        }

        const mesh = playerMeshes[index];
        const targetX = player.roadX + player.lane * CONFIG.laneWidth;
        const prevX = player.currentLaneX;

        player.currentLaneX += (targetX - player.currentLaneX) * Math.min(1, 0.18 * dtScale);
        mesh.position.x = player.currentLaneX;

        if (player.flyTimer > 0) {
            player.isJumping = false;
            player.jumpVel = 0;
            const flyTarget = CONFIG.flyHeight + Math.sin(now * 1.7 + player.bobOffset) * 0.16;
            player.playerY += (flyTarget - player.playerY) * Math.min(1, 0.18 * dtScale);
        } else if (player.isJumping) {
            player.playerY += player.jumpVel * dtScale;
            player.jumpVel -= CONFIG.gravity * dtScale;

            if (player.playerY <= 0) {
                player.playerY = 0;
                player.isJumping = false;
                player.jumpVel = 0;
            }
        } else if (player.playerY > 0.12) {
            player.playerY = Math.max(0, player.playerY - 0.18 * dtScale);
        } else {
            player.playerY = Math.abs(Math.sin(Date.now() * 0.015 + player.bobOffset)) * 0.08;
        }

        mesh.position.y = player.playerY + 0.45;
        mesh.rotation.x = player.flyTimer > 0 ? -0.08 : player.isJumping ? -0.18 : 0;
        mesh.rotation.z = (player.currentLaneX - prevX) * -0.7;

        if (mesh.userData.animatedParts) {
            updateMeshPresentation(mesh, now, 1, { highlightColor: getPowerColor(player) });
        }

        const trailColor = getPowerColor(player);
        const trailChance = player.flyTimer > 0 ? 0.42 : 0.18;
        if (Math.random() < trailChance) {
            spawnTrail(mesh.position.x, mesh.position.y, mesh.position.z, trailColor, player.flyTimer > 0 ? 0.11 : 0.08);
        }
    });

    elScoreP1.textContent = Math.floor(state.players[0]?.score || 0);
    elScoreP2.textContent = Math.floor(state.players[1]?.score || 0);
    updatePowerupStatus();
    updateRunProgress();
}

function collectCoin(obj, value) {
    obj.taken = true;
    scene.remove(obj.mesh);
    const totalValue = registerCoinCombo(value);
    state.coins += totalValue;
    state.collectedThisRun += totalValue;
    state.stats.coinsCollected += totalValue;
    state.stats.bestCombo = Math.max(state.stats.bestCombo, state.comboCount);
    const player = state.players[obj.owner];
    if (player) {
        player.coinsRun += totalValue;
    }
    if (obj.kind === "chest") {
        state.stats.chestsOpened += 1;
        updateMissionProgress("chests", 1);
    } else {
        updateMissionProgress("coins", totalValue);
    }
    updateMissionProgress("combo", state.comboCount);
    if (state.stats.coinsCollected >= 500) unlockAchievement("coins_500");
    updateHUD();
    renderMetaPanels();
    saveProgress();
    if (obj.kind === "chest") {
        playTone(720, 0.08, "triangle", 0.05);
        playTone(980, 0.12, "triangle", 0.04);
    } else if (value >= 10) {
        playTone(1240, 0.08, "square", 0.04);
    } else {
        playTone(value === 5 ? 1320 : 1100, 0.06, "square", 0.035);
    }
}

function updateWorld(dtScale) {
    const dtSeconds = dtScale / 60;
    const biome = getBiomeConfig();
    spawnTimer += state.speed * dtScale;
    powerupSpawnTimer += dtSeconds;

    if (spawnTimer >= state.spawnGap * biome.obstacleGapScale) {
        spawnObstacleRow();
        spawnTimer = 0;
    }

    if (powerupSpawnTimer >= nextPowerupSpawnIn) {
        spawnPowerupRow();
        powerupSpawnTimer = 0;
        nextPowerupSpawnIn = (6 + Math.random() * 4.5) * biome.powerupDelayScale;
    }

    for (let i = worldObjects.length - 1; i >= 0; i--) {
        const obj = worldObjects[i];
        obj.mesh.position.z += state.speed * 2 * dtScale;

        if (obj.type === "obstacle") {
            if (obj.mesh.userData.variant === "mover") {
                obj.mesh.position.x += Math.sin(performance.now() * 0.001 * obj.mesh.userData.moveSpeed) * 0.008 * dtScale * 6;
            } else if (obj.mesh.userData.variant === "hopper") {
                obj.mesh.position.y = obj.mesh.userData.baseY + Math.abs(Math.sin(performance.now() * 0.001 * obj.mesh.userData.hopSpeed)) * obj.mesh.userData.hopAmp;
            } else {
                obj.mesh.position.y = obj.mesh.userData.baseY || 0.45;
            }

            const player = state.players[obj.owner];
            const mesh = playerMeshes[obj.owner];

            if (
                player &&
                player.alive &&
                !obj.hit &&
                obj.mesh.position.z > -0.7 &&
                obj.mesh.position.z < 0.7
            ) {
                const dx = Math.abs(mesh.position.x - obj.mesh.position.x);
                const dy = Math.abs(mesh.position.y - obj.mesh.position.y);
                const hitWidth = obj.mesh.userData.variant === "wide" ? 0.92 : 0.65;
                const hitHeight = obj.mesh.userData.variant === "low" ? 0.45 : 0.65;

                if (dx < hitWidth && dy < hitHeight) {
                    obj.hit = true;
                    if (player.shieldHits > 0 && player.shieldTimer > 0) {
                        player.shieldHits = 0;
                        player.shieldTimer = 0;
                        scene.remove(obj.mesh);
                        worldObjects.splice(i, 1);
                        playTone(640, 0.14, "triangle", 0.06);
                        updatePowerupStatus();
                        continue;
                    } else {
                        player.alive = false;
                        mesh.visible = false;
                        playTone(140, 0.18, "sawtooth", 0.06);
                    }
                }
            }
        }

        if (obj.type === "coin") {
            const player = state.players[obj.owner];
            const mesh = playerMeshes[obj.owner];

            obj.mesh.rotation.y += 0.15 * dtScale;

            if (player && player.alive && !obj.taken) {
                const dx = mesh.position.x - obj.mesh.position.x;
                const dy = mesh.position.y - obj.mesh.position.y;
                const dz = mesh.position.z - obj.mesh.position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (player.magnetTimer > 0 && distance < CONFIG.magnetRadius) {
                    const pull = CONFIG.magnetPull * dtScale;
                    obj.mesh.position.x += (mesh.position.x - obj.mesh.position.x) * pull;
                    obj.mesh.position.y += (mesh.position.y - obj.mesh.position.y) * pull;
                    obj.mesh.position.z += (mesh.position.z - obj.mesh.position.z) * pull;
                }

                if (obj.mesh.position.z > -1.2 && obj.mesh.position.z < 1.2) {
                    const collectY = player.flyTimer > 0 ? 1.8 : 1.1;
                    if (Math.abs(dx) < 0.9 && Math.abs(dy) < collectY && Math.abs(dz) < 1.2) {
                        collectCoin(obj, obj.value || 1);
                        worldObjects.splice(i, 1);
                        continue;
                    }
                }
            }
        }

        if (obj.type === "powerup") {
            const player = state.players[obj.owner];
            const mesh = playerMeshes[obj.owner];

            obj.mesh.rotation.y += obj.mesh.userData.spin * dtScale;
            obj.mesh.position.y = obj.baseY + Math.sin(performance.now() * 0.006 + obj.phase) * 0.16;

            if (player && player.alive && !obj.taken) {
                const dx = Math.abs(mesh.position.x - obj.mesh.position.x);
                const dy = Math.abs(mesh.position.y - obj.mesh.position.y);
                const dz = Math.abs(mesh.position.z - obj.mesh.position.z);

                if (dx < 0.95 && dy < 1.3 && dz < 1.2) {
                    obj.taken = true;
                    scene.remove(obj.mesh);
                    applyPowerup(player, obj.kind);
                    worldObjects.splice(i, 1);
                    continue;
                }
            }
        }

        if (obj.type === "trail") {
            obj.life -= 0.04 * dtScale;
            obj.mesh.material.opacity = Math.max(0, obj.life);
            obj.mesh.scale.multiplyScalar(0.98);

            if (obj.life <= 0) {
                scene.remove(obj.mesh);
                worldObjects.splice(i, 1);
                continue;
            }
        }

        if (obj.mesh.position.z > CONFIG.removeDistance) {
            scene.remove(obj.mesh);
            worldObjects.splice(i, 1);
        }
    }

    if (countObstaclesAhead() < CONFIG.minObstaclesAhead) {
        spawnObstacleRow();
    }

    if (Math.random() < biome.coinChance) {
        spawnCoinRow();
    }
}

function finishGame(completed) {
    track("game_over", {
        level: state.currentLevel,
        mode: state.gameType,
        score: Math.floor(state.players[0]?.score || 0),
        completed
    });

    const p1 = Math.floor(state.players[0]?.score || 0);
    const p2 = Math.floor(state.players[1]?.score || 0);
    const leadScore = Math.max(p1, p2);
    const levelRecord = state.levelRecords[state.currentLevel] || 0;
    const isNewLevelRecord = leadScore > levelRecord;
    if (state.gameType === "levels") {
        state.levelRecords[state.currentLevel] = Math.max(levelRecord, leadScore);
    }

    if (state.gameType === "levels") {
        if (completed && state.currentLevel < 10 && state.unlockedLevel < state.currentLevel + 1) {
            state.unlockedLevel = state.currentLevel + 1;
        }
        renderLevelSelect();
    }

    if (completed) {
        state.stats.currentStreak += 1;
        state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.currentStreak);
        if (state.gameType === "levels") {
            state.stats.levelsCleared += 1;
        }
    } else {
        state.stats.currentStreak = 0;
        state.stats.deaths += 1;
    }

    state.isPlaying = false;
    state.isPaused = false;
    elGameOver.classList.remove("hidden");
    elPauseScreen.classList.add("hidden");
    elScoreDisplay.classList.add("hidden");
    elLevelDisplay.classList.add("hidden");
    elRunProgress.classList.add("hidden");
    elPauseBtn.classList.add("hidden");
    elSwipeHint.classList.add("hidden");
    elPowerupStatus.classList.add("hidden");
    elComboDisplay.classList.add("hidden");
    elNextLevelBtn.classList.toggle("hidden", !(completed && state.gameType === "levels" && state.currentLevel < state.unlockedLevel));

    const versusWinner = state.mode === "2p"
        ? (() => {
            const p1Alive = state.players[0]?.alive ? 1 : 0;
            const p2Alive = state.players[1]?.alive ? 1 : 0;
            if (p1Alive !== p2Alive) return p1Alive > p2Alive ? "P1" : "P2";
            if (p1 !== p2) return p1 > p2 ? "P1" : "P2";
            const p1Coins = state.players[0]?.coinsRun || 0;
            const p2Coins = state.players[1]?.coinsRun || 0;
            if (p1Coins !== p2Coins) return p1Coins > p2Coins ? "P1" : "P2";
            return "DRAW";
        })()
        : null;

    elRewardSummary.innerHTML = "";

    if (state.gameType === "endless") {
        elFinishTitle.textContent = "ENDLESS OVER";
        state.endlessBest[state.difficulty] = Math.max(state.endlessBest[state.difficulty] || 0, p1);
        if (state.mode === "1p") {
            elFinalScore.textContent = `ENDLESS ${state.difficulty.toUpperCase()} • SCORE ${p1} • BEST ${Math.floor(state.endlessBest[state.difficulty])} • COINS +${state.collectedThisRun}`;
        } else if (versusWinner === "P1") {
            elFinalScore.textContent = `ENDLESS ${state.difficulty.toUpperCase()} • P1 WINS ${p1}-${p2}`;
            state.stats.versusWins += 1;
            unlockAchievement("versus_win");
        } else if (versusWinner === "P2") {
            elFinalScore.textContent = `ENDLESS ${state.difficulty.toUpperCase()} • P2 WINS ${p2}-${p1}`;
        } else {
            elFinalScore.textContent = `ENDLESS ${state.difficulty.toUpperCase()} • DRAW ${p1}-${p2}`;
        }
        elRewardSummary.innerHTML = `
            <div class="reward-line">Coins earned • ${state.collectedThisRun}</div>
            <div class="reward-line">Best ${state.difficulty.toUpperCase()} • ${Math.floor(state.endlessBest[state.difficulty])}</div>
            <div class="reward-line">Run time • ${Math.floor(state.runTime)}s</div>
        `;
        renderMetaPanels();
        saveProgress();
        return;
    }

    const level = currentLevelData();

    if (completed) {
        elFinishTitle.textContent = "LEVEL COMPLETE";
        if (state.mode === "1p") {
            elFinalScore.textContent = `LEVEL ${level.id} COMPLETE • SCORE ${p1} • COINS +${state.collectedThisRun}`;
        } else if (versusWinner === "P1") {
            elFinalScore.textContent = `LEVEL ${level.id} COMPLETE • P1 WINS ${p1}-${p2}`;
            state.stats.versusWins += 1;
            unlockAchievement("versus_win");
        } else if (versusWinner === "P2") {
            elFinalScore.textContent = `LEVEL ${level.id} COMPLETE • P2 WINS ${p2}-${p1}`;
        } else {
            elFinalScore.textContent = `LEVEL ${level.id} COMPLETE • DRAW ${p1}-${p2}`;
        }
        elRewardSummary.innerHTML = `
            <div class="reward-line">Reward • ${state.collectedThisRun} coins</div>
            <div class="reward-line">${isNewLevelRecord ? "New level record" : "Best level score"} • ${Math.floor(state.levelRecords[state.currentLevel])}</div>
            <div class="reward-line">${SPECIAL_LEVEL_IDS.has(level.id) ? "Boss stage cleared" : "Stage cleared"} • streak ${state.stats.currentStreak}</div>
            <div class="reward-line">Run time • ${Math.floor(state.runTime)}s</div>
        `;
        playTone(780, 0.08, "triangle", 0.05);
        playTone(1040, 0.12, "triangle", 0.04);
    } else {
        elFinishTitle.textContent = "RUN OVER";
        elFinalScore.textContent = `FAILED LEVEL ${level.id} • TARGET ${level.target}`;
        elRewardSummary.innerHTML = `
            <div class="reward-line">Best level score • ${Math.floor(state.levelRecords[state.currentLevel] || 0)}</div>
            <div class="reward-line">Current streak reset</div>
            <div class="reward-line">Run time • ${Math.floor(state.runTime)}s</div>
        `;
        playTone(180, 0.15, "sawtooth", 0.05);
    }
    renderMetaPanels();
    saveProgress();
}

function animate(now = performance.now()) {
    if (!state.isPlaying) return;

    animationId = requestAnimationFrame(animate);

    if (state.isPaused) {
        renderer.render(scene, camera);
        return;
    }

    const deltaMs = Math.min(now - lastFrameTime, 33);
    lastFrameTime = now;
    const dtScale = deltaMs / (1000 / 60);
    const dtSeconds = dtScale / 60;

    if (state.comboTimer > 0) {
        state.comboTimer = Math.max(0, state.comboTimer - dtSeconds);
        if (state.comboTimer <= 0) {
            resetCombo();
        } else {
            updateComboDisplay();
        }
    }

    state.speed = Math.min(state.speed + state.speedInc * dtScale, CONFIG.maxSpeed);

    updatePlayers(dtScale);
    updateWorld(dtScale);
    updateAmbientWorld(dtScale);

    const allDead = state.players.every((player) => !player.alive);
    if (allDead) {
        finishGame(false);
        return;
    }

    if (state.gameType === "levels") {
        const target = currentLevelData().target;
        const leadScore = Math.max(...state.players.map((player) => player.score));
        if (leadScore >= target) {
            finishGame(true);
            return;
        }
    }

    renderer.render(scene, camera);
}

init();

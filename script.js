import * as THREE from "three";

// 🔥 Analytics helper
function track(event, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", event, params);
    console.log("📊 EVENT:", event, params);
  }
}

const CONFIG = {
    laneWidth: 1.8,
    roadOffsetX: 3.6,
    gravity: 0.015,
    jumpPower: 0.35,
    spawnDistance: -60,
    removeDistance: 12,
    maxSpeed: 0.42,
    minObstaclesAhead: 8,
    swipeThreshold: 28
};

const DIFFICULTIES = {
    easy: { speed: 0.14, speedInc: 0.00003, spawnGap: 3.4 },
    normal: { speed: 0.18, speedInc: 0.00005, spawnGap: 2.9 },
    hard: { speed: 0.22, speedInc: 0.00007, spawnGap: 2.4 }
};

const THEMES = [
    {
        sky: 0xffb2a6,
        ground: 0xa94f63,
        obstacle: 0x473b4f,
        decor: 0xb89d32,
        divider: 0xe6e6e6,
        roadEdge: 0x2a1f26
    },
    {
        sky: 0xcde7ff,
        ground: 0x5f6caf,
        obstacle: 0x2d3142,
        decor: 0x8fbf6a,
        divider: 0xf5f5f5,
        roadEdge: 0x20242f
    },
    {
        sky: 0xf6c28b,
        ground: 0xb85c38,
        obstacle: 0x324a5f,
        decor: 0x9c9f4f,
        divider: 0xffffff,
        roadEdge: 0x2f2220
    }
];

let state = {
    isPlaying: false,
    mode: "1p",
    difficulty: "normal",
    soundEnabled: true,
    speed: DIFFICULTIES.normal.speed,
    speedInc: DIFFICULTIES.normal.speedInc,
    spawnGap: DIFFICULTIES.normal.spawnGap,
    theme: null,
    players: []
};

const elScoreDisplay = document.getElementById("score-display");
const elScoreP1 = document.getElementById("score-p1");
const elScoreP2 = document.getElementById("score-p2");
const elScoreCardP2 = document.getElementById("score-card-p2");
const elInstructionsP2 = document.getElementById("instruction-p2");
const elFinalScore = document.getElementById("final-score");
const elStart = document.getElementById("start-screen");
const elGameOver = document.getElementById("game-over-screen");
const elSoundToggle = document.getElementById("sound-toggle");
const elMobileControls = document.getElementById("mobile-controls");
const elMobilePadP2 = document.getElementById("mobile-pad-p2");

let scene;
let camera;
let renderer;
let playerMeshes = [];
let floorGroups = [];
let worldObjects = [];
let spawnTimer = 0;
let animationId = null;
let audioContext = null;
let lastFrameTime = 0;

let swipeState = {
    tracking: false,
    startX: 0,
    startY: 0,
    playerIndex: 0
};

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
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
    renderer.render(scene, camera);
}

function bindUI() {
    window.addEventListener("resize", onWindowResize);
    document.addEventListener("keydown", handleKeyboardInput);

    document.getElementById("start-btn").addEventListener("click", () => {
        track("game_start", {
            mode: state.mode,
            difficulty: state.difficulty
        });
        startGame();
    });

    document.getElementById("restart-btn").addEventListener("click", () => {
        track("game_restart");
        startGame();
    });

    document.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            state.mode = btn.dataset.mode;
            updateMenuButtons();
        });
    });

    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            state.difficulty = btn.dataset.difficulty;
            updateMenuButtons();
        });
    });

    elSoundToggle.addEventListener("click", () => {
        state.soundEnabled = !state.soundEnabled;
        elSoundToggle.textContent = state.soundEnabled ? "ON" : "OFF";
        elSoundToggle.classList.toggle("active", state.soundEnabled);
        ensureAudio();
        playTone(700, 0.05, "square", 0.03);
    });

    bindSwipeControls();

    updateMenuButtons();
    updateModeUI();
}

function bindSwipeControls() {
    window.addEventListener(
        "touchstart",
        (event) => {
            if (!isMobileLike()) return;
            if (!state.isPlaying) return;
            if (!event.touches || !event.touches.length) return;

            const touch = event.touches[0];
            swipeState.tracking = true;
            swipeState.startX = touch.clientX;
            swipeState.startY = touch.clientY;
            swipeState.playerIndex =
                state.mode === "2p" && swipeState.startX >= window.innerWidth / 2 ? 1 : 0;
        },
        { passive: true }
    );

    window.addEventListener(
        "touchend",
        (event) => {
            if (!isMobileLike()) return;
            if (!state.isPlaying) return;
            if (!swipeState.tracking) return;
            if (!event.changedTouches || !event.changedTouches.length) return;

            const touch = event.changedTouches[0];
            const dx = touch.clientX - swipeState.startX;
            const dy = touch.clientY - swipeState.startY;

            swipeState.tracking = false;

            if (
                Math.abs(dx) < CONFIG.swipeThreshold &&
                Math.abs(dy) < CONFIG.swipeThreshold
            ) {
                return;
            }

            if (Math.abs(dx) > Math.abs(dy)) {
                triggerPlayerAction(
                    swipeState.playerIndex,
                    dx > 0 ? "right" : "left"
                );
            } else if (dy < -CONFIG.swipeThreshold) {
                triggerPlayerAction(swipeState.playerIndex, "jump");
            }
        },
        { passive: true }
    );

    window.addEventListener(
        "touchcancel",
        () => {
            swipeState.tracking = false;
        },
        { passive: true }
    );
}

function isMobileLike() {
    return window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
}

function updateMenuButtons() {
    document.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === state.mode);
    });

    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.difficulty === state.difficulty);
    });

    elSoundToggle.textContent = state.soundEnabled ? "ON" : "OFF";
    elSoundToggle.classList.toggle("active", state.soundEnabled);
    updateModeUI();
}

function updateModeUI() {
    const twoPlayer = state.mode === "2p";
    elScoreCardP2.classList.toggle("hidden", !twoPlayer);
    elInstructionsP2.classList.toggle("hidden", !twoPlayer);

    if (elMobilePadP2) {
        elMobilePadP2.classList.toggle("hidden", !twoPlayer);
    }
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

function randomTheme() {
    return THEMES[Math.floor(Math.random() * THEMES.length)];
}

function createPlayers() {
    if (state.mode === "1p") {
        return [
            {
                name: "PLAYER 1",
                roadX: 0,
                lane: 0,
                currentLaneX: 0,
                isJumping: false,
                jumpVel: 0,
                playerY: 0,
                alive: true,
                score: 0,
                controls: { left: "KeyA", right: "KeyD", jump: "KeyW" },
                color: 0x54b7ff
            }
        ];
    }

    return [
        {
            name: "PLAYER 1",
            roadX: -CONFIG.roadOffsetX,
            lane: 0,
            currentLaneX: -CONFIG.roadOffsetX,
            isJumping: false,
            jumpVel: 0,
            playerY: 0,
            alive: true,
            score: 0,
            controls: { left: "KeyA", right: "KeyD", jump: "KeyW" },
            color: 0x54b7ff
        },
        {
            name: "PLAYER 2",
            roadX: CONFIG.roadOffsetX,
            lane: 0,
            currentLaneX: CONFIG.roadOffsetX,
            isJumping: false,
            jumpVel: 0,
            playerY: 0,
            alive: true,
            score: 0,
            controls: { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp" },
            color: 0xff9a62
        }
    ];
}

function createPlayerMesh(color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, flatShading: true });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.05);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.18, 0.6, 0.46);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.18, 0.6, 0.46);
    group.add(rightEye);

    scene.add(group);
    return group;
}

function createObstacleMesh() {
    const type = Math.floor(Math.random() * 3);
    let geo;

    if (type === 0) geo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    else if (type === 1) geo = new THREE.ConeGeometry(0.42, 0.95, 5);
    else geo = new THREE.CylinderGeometry(0.38, 0.38, 0.9, 6);

    const mat = new THREE.MeshStandardMaterial({
        color: state.theme.obstacle,
        flatShading: true
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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
        new THREE.MeshStandardMaterial({ color: state.theme.ground, roughness: 1 })
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

    [-1, 0, 1].forEach((laneLine) => {
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.03, roadLength),
            lineMat
        );
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

function spawnObstacleRow() {
    const lane = Math.floor(Math.random() * 3) - 1;

    state.players.forEach((player, index) => {
        if (!player.alive && state.mode === "2p") return;

        const obstacle = createObstacleMesh();
        obstacle.position.set(
            player.roadX + lane * CONFIG.laneWidth,
            0.45,
            CONFIG.spawnDistance
        );
        scene.add(obstacle);

        worldObjects.push({
            mesh: obstacle,
            type: "obstacle",
            owner: index,
            hit: false
        });
    });
}

function countObstaclesAhead() {
    return worldObjects.filter(
        (obj) => obj.type === "obstacle" && obj.mesh.position.z < 0
    ).length;
}

function startGame() {
    ensureAudio();

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    const diff = DIFFICULTIES[state.difficulty];

    state.isPlaying = true;
    state.speed = diff.speed;
    state.speedInc = diff.speedInc;
    state.spawnGap = diff.spawnGap;
    state.theme = randomTheme();
    state.players = createPlayers();

    spawnTimer = 0;
    lastFrameTime = performance.now();

    elStart.classList.add("hidden");
    elGameOver.classList.add("hidden");
    elScoreDisplay.classList.remove("hidden");

    if (elMobileControls) {
        elMobileControls.classList.toggle("hidden", true);
        elMobileControls.style.display = "none";
    }

    elScoreP1.textContent = "0";
    elScoreP2.textContent = "0";
    updateModeUI();

    scene.background = new THREE.Color(state.theme.sky);
    scene.fog = new THREE.Fog(state.theme.sky, 12, 58);

    clearMeshes(floorGroups);
    floorGroups = [];

    clearMeshes(playerMeshes);
    playerMeshes = [];

    clearWorld();

    if (state.mode === "1p") addRoad(0);
    else {
        addRoad(-CONFIG.roadOffsetX);
        addRoad(CONFIG.roadOffsetX);
    }

    addDecorations();

    state.players.forEach((player) => {
        const mesh = createPlayerMesh(player.color);
        mesh.position.set(player.roadX, 0.45, 0);
        playerMeshes.push(mesh);
    });

    for (let i = 0; i < 4; i++) {
        spawnObstacleRow();
    }

    playTone(520, 0.08, "square", 0.05);
    playTone(700, 0.1, "square", 0.04);

    animate(lastFrameTime);
}

function movePlayerLane(player, direction) {
    const nextLane = Math.max(-1, Math.min(1, player.lane + direction));
    if (nextLane !== player.lane) {
        player.lane = nextLane;
    }
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
    } else if (action === "jump" && !player.isJumping) {
        player.isJumping = true;
        player.jumpVel = CONFIG.jumpPower;
        playTone(880, 0.08, "square", 0.04);
    }
}

function handleKeyboardInput(e) {
    if (!state.isPlaying) {
        if (e.code === "Space" || e.code === "Enter") startGame();
        return;
    }

    state.players.forEach((player, index) => {
        if (!player.alive) return;

        if (e.code === player.controls.left) triggerPlayerAction(index, "left");
        else if (e.code === player.controls.right) triggerPlayerAction(index, "right");
        else if (e.code === player.controls.jump) triggerPlayerAction(index, "jump");
    });
}

function updatePlayers(dtScale) {
    state.players.forEach((player, index) => {
        if (!player.alive) return;

        player.score += state.speed * dtScale;

        const mesh = playerMeshes[index];
        const targetX = player.roadX + player.lane * CONFIG.laneWidth;
        const prevX = player.currentLaneX;

        player.currentLaneX += (targetX - player.currentLaneX) * Math.min(1, 0.18 * dtScale);
        mesh.position.x = player.currentLaneX;

        if (player.isJumping) {
            player.playerY += player.jumpVel * dtScale;
            player.jumpVel -= CONFIG.gravity * dtScale;

            if (player.playerY <= 0) {
                player.playerY = 0;
                player.isJumping = false;
                player.jumpVel = 0;
            }
        } else {
            player.playerY = Math.abs(Math.sin(Date.now() * 0.015 + index)) * 0.08;
        }

        mesh.position.y = player.playerY + 0.45;
        mesh.rotation.x = player.isJumping ? -0.18 : 0;
        mesh.rotation.z = (player.currentLaneX - prevX) * -0.7;
    });

    elScoreP1.textContent = Math.floor(state.players[0]?.score || 0);
    elScoreP2.textContent = Math.floor(state.players[1]?.score || 0);
}

function updateWorld(dtScale) {
    spawnTimer += state.speed * dtScale;

    if (spawnTimer >= state.spawnGap) {
        spawnObstacleRow();
        spawnTimer = 0;
    }

    for (let i = worldObjects.length - 1; i >= 0; i--) {
        const obj = worldObjects[i];
        obj.mesh.position.z += state.speed * 2 * dtScale;

        if (obj.type === "obstacle") {
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

                if (dx < 0.65 && dy < 0.65) {
                    obj.hit = true;
                    player.alive = false;
                    mesh.visible = false;
                    playTone(140, 0.18, "sawtooth", 0.06);
                }
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
}

function finishGame() {
    track("game_over", {
        score: Math.floor(state.players[0]?.score || 0)
    });

    state.isPlaying = false;
    elGameOver.classList.remove("hidden");
    elScoreDisplay.classList.add("hidden");

    const p1 = Math.floor(state.players[0]?.score || 0);
    const p2 = Math.floor(state.players[1]?.score || 0);

    if (state.mode === "1p") {
        elFinalScore.textContent = `SCORE: ${p1}`;
    } else if (p1 > p2) {
        elFinalScore.textContent = `PLAYER 1 WINS: ${p1} - ${p2}`;
    } else if (p2 > p1) {
        elFinalScore.textContent = `PLAYER 2 WINS: ${p2} - ${p1}`;
    } else {
        elFinalScore.textContent = `DRAW: ${p1} - ${p2}`;
    }
}

function animate(now = performance.now()) {
    if (!state.isPlaying) return;

    animationId = requestAnimationFrame(animate);

    const deltaMs = Math.min(now - lastFrameTime, 33);
    lastFrameTime = now;

    const dtScale = deltaMs / (1000 / 60);

    state.speed = Math.min(
        state.speed + state.speedInc * dtScale,
        CONFIG.maxSpeed
    );

    updatePlayers(dtScale);
    updateWorld(dtScale);

    const allDead = state.players.every((player) => !player.alive);
    if (allDead) {
        finishGame();
        return;
    }

    renderer.render(scene, camera);
}

init();

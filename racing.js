
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

(() => {
  const $ = id => document.getElementById(id);

  const viewport = $("racingViewport");
  const racingPage = $("racingPage");
  if (!viewport) return;

  // ==========================================
  // ELEMENT HTML
  // ==========================================

  const speedEl = $("racingSpeed");
  const nitroEl = $("racingNitro");
  const cameraLabel = $("racingCameraLabel");
  const statusEl = $("racingStatus");
  const loadingEl = $("racingLoading");
  const cameraBtn = $("racingCameraBtn");
  const nitroBtn = $("racingNitroBtn");

  const positionEl = $("racingPosition");
  const lapEl = $("racingLap");
  const timerEl = $("racingTimer");
  const countdownEl = $("racingCountdown");
  const raceStateEl = $("racingRaceState");
  const checkpointEl = $("racingCheckpointStatus");

  const leaderboardEl = $("racingLeaderboard");
  const leaderboardList = $("racingLeaderboardList");

  const resultEl = $("racingResult");
  const resultTitle = $("racingResultTitle");
  const resultTime = $("racingResultTime");
  const resultPosition = $("racingResultPosition");
  const finalLeaderboard = $("racingFinalLeaderboard");
  const restartBtn = $("racingRestartBtn");

  // ==========================================
  // KONFIGURASI BALAPAN
  // ==========================================

  const TOTAL_LAPS = 3;
  const TOTAL_CARS = 10;

  const TRACK_RX = 55;
  const TRACK_RZ = 34;

  const CHECKPOINTS = [
    { angle: Math.PI / 2, name: "GARIS START" },
    { angle: 0, name: "CHECKPOINT 1" },
    { angle: -Math.PI / 2, name: "CHECKPOINT 2" },
    { angle: -Math.PI, name: "CHECKPOINT 3" }
  ];

  const LAP_DISTANCE = 280;
  const keys = new Set();

  let raceState = "waiting";
  let countdownValue = 3;
  let countdownTime = 0;
  let raceStartTime = 0;
  let raceElapsed = 0;
  let lastTime = performance.now();

  let velocity = 0;
  let yaw = Math.PI / 2;
  let nitro = 100;
  let nitroHeld = false;
  let firstPerson = false;

  let playerLap = 1;
  let nextCheckpoint = 1;
  let playerProgress = 0;
  let playerFinished = false;
  let playerFinishTime = 0;
  let playerPosition = 10;

  // ==========================================
  // SCENE THREE.JS
  // ==========================================

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07152d);
  scene.fog = new THREE.Fog(0x07152d, 95, 230);

  const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 500);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0x9acbff, 0x14213b, 2.1));

  const moon = new THREE.DirectionalLight(0x9be8ff, 2.6);
  moon.position.set(-45, 75, 25);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  scene.add(moon);

  // ==========================================
  // ARENA
  // ==========================================

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 320),
    new THREE.MeshStandardMaterial({
      color: 0x102b3b,
      roughness: 0.96
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.12;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadShape = new THREE.Shape();
  roadShape.absellipse(0, 0, 62, 41, 0, Math.PI * 2, false, 0);

const roadHole = new THREE.Path();
roadHole.absellipse(0, 0, 43, 22, 0, Math.PI * 2, true, 0);
  roadShape.holes.push(roadHole);

  const road = new THREE.Mesh(
    new THREE.ShapeGeometry(roadShape, 96),
    new THREE.MeshStandardMaterial({
      color: 0x263b57,
      roughness: 0.82,
      metalness: 0.15
    })
  );

  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  road.receiveShadow = true;
  scene.add(road);

  function makeRing(rx, rz, color, y, tube = 0.42) {
    const points = [];

    for (let i = 0; i < 160; i++) {
      const angle = (i / 160) * Math.PI * 2;

      points.push(new THREE.Vector3(
        Math.cos(angle) * rx,
        y,
        Math.sin(angle) * rz
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points, true);

    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 240, tube, 8, true),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.45,
        metalness: 0.55
      })
    );

    scene.add(mesh);
    return mesh;
  }

// Garis neon lintasan
makeRing(62, 41, 0x19d9f2, 0.32, 0.5);
makeRing(43, 22, 0x9b6cff, 0.3, 0.48);

// DINDING PEMBATAS LUAR
makeRing(61.5, 40.5, 0x19d9f2, 1.0, 0.85);

// DINDING PEMBATAS DALAM
makeRing(43.5, 22.5, 0x9b6cff, 1.0, 0.85);

  const island = new THREE.Mesh(
    new THREE.CylinderGeometry(19, 21, 1.1, 64),
    new THREE.MeshStandardMaterial({
      color: 0x163b62,
      metalness: 0.35,
      roughness: 0.65
    })
  );

  island.position.y = 0.1;
  island.receiveShadow = true;
  scene.add(island);

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(8, 1),
    new THREE.MeshStandardMaterial({
      color: 0x31dff4,
      emissive: 0x087dba,
      emissiveIntensity: 1.2,
      metalness: 0.5,
      roughness: 0.2
    })
  );

  core.position.set(0, 10, 0);
  scene.add(core);

  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x234f79,
    emissive: 0x073e71,
    emissiveIntensity: 0.7,
    metalness: 0.45
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0x6df4ff,
    emissive: 0x15c9f2,
    emissiveIntensity: 2.2
  });

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const x = Math.cos(angle) * 78;
    const z = Math.sin(angle) * 57;

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.7, 12 + (i % 3) * 3, 8),
      pillarMat
    );

    pillar.position.set(x, 6, z);
    pillar.castShadow = true;
    scene.add(pillar);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 12, 10),
      lightMat
    );

    orb.position.set(x, 13 + (i % 3) * 3, z);
    scene.add(orb);
  }

  // ==========================================
// RINTANGAN LINTASAN
// ==========================================

const trackObstacles = [];

const obstacleMaterial = new THREE.MeshStandardMaterial({
  color: 0xff7438,
  emissive: 0x9c2700,
  emissiveIntensity: 0.6,
  roughness: 0.5
});

const obstacleAngles = [
  1.05,
  0.25,
  -0.65,
  -1.45,
  -2.35,
  -2.95
];

obstacleAngles.forEach((angle, index) => {
  const lane = index % 2 === 0 ? -2 : 2;

  const obstacle = new THREE.Mesh(
    new THREE.ConeGeometry(1.15, 2.2, 8),
    obstacleMaterial
  );

  obstacle.position.set(
    Math.cos(angle) * (TRACK_RX + lane),
    1.1,
    Math.sin(angle) * (TRACK_RZ + lane * 0.62)
  );

  obstacle.castShadow = true;
  obstacle.receiveShadow = true;

  scene.add(obstacle);
  trackObstacles.push(obstacle);
});

  // ==========================================
  // MODEL MOBIL
  // ==========================================

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x12c8d9,
    metalness: 0.72,
    roughness: 0.26
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x101d35,
    metalness: 0.45,
    roughness: 0.35
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x8eeeff,
    metalness: 0.6,
    roughness: 0.15,
    transparent: true,
    opacity: 0.82
  });

  const car = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.72, 4.2),
    bodyMat
  );

  body.name = "vehicleBody";
  body.position.y = 0.85;
  body.castShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.72, 0.82, 1.85),
    glassMat
  );

  cabin.position.set(0, 1.53, -0.25);
  cabin.castShadow = true;
  car.add(cabin);

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.22, 0.55),
    darkMat
  );

  nose.position.set(0, 0.55, 1.88);
  car.add(nose);

  const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.34, 18);
  const wheels = [];

  for (const x of [-1.27, 1.27]) {
    for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(wheelGeo, darkMat);

      wheel.name = "vehicleWheel";
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.48, z);
      wheel.castShadow = true;

      car.add(wheel);
      wheels.push(wheel);
    }
  }

  const exhaust = new THREE.PointLight(0x18dfff, 2, 8);
  exhaust.position.set(0, 0.7, -2.2);
  car.add(exhaust);

  scene.add(car);


  // ==========================================
  // GERBANG START / FINISH
  // ==========================================

  const arch = new THREE.Group();

  const archMat = new THREE.MeshStandardMaterial({
    color: 0x5defff,
    emissive: 0x1488b8,
    emissiveIntensity: 1.1
  });

  // Tiang kiri dan kanan
  const leftPost = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 7, 0.6),
    archMat
  );

  const rightPost = leftPost.clone();

  leftPost.position.set(-8.5, 3.5, 0);
  rightPost.position.set(8.5, 3.5, 0);

  // Palang atas
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.65, 0.7),
    archMat
  );

  beam.position.y = 7;

  arch.add(leftPost, rightPost, beam);

  // Gerbang melintang mengikuti lebar jalan
  arch.rotation.y = Math.PI / 2;
  arch.position.set(0, 0, 31.5);

  scene.add(arch);


  // ==========================================
  // 9 MOBIL AI
  // ==========================================

  const aiCars = [];

  const aiColors = [
    0xff3b5c,
    0xffb52e,
    0x8c5cff,
    0x36e58c,
    0xffffff,
    0xff65d4,
    0x438cff,
    0xe8ed45,
    0xff773d
  ];

  function setCarPosition(mesh, angle, lane = 0) {
    const rx = TRACK_RX + lane;
    const rz = TRACK_RZ + lane * 0.62;

    mesh.position.set(
      Math.cos(angle) * rx,
      0,
      Math.sin(angle) * rz
    );

    mesh.rotation.y = Math.atan2(
      rx * Math.sin(angle),
      -rz * Math.cos(angle)
    );
  }

  for (let i = 0; i < 9; i++) {
    const aiCar = car.clone(true);

    aiCar.traverse(object => {
      if (object.isMesh && object.name === "vehicleBody") {
        object.material = object.material.clone();
        object.material.color.setHex(aiColors[i]);
      }
    });

    const initialAngle = Math.PI / 2 + (i + 1) * 0.055;
    const lane = i % 2 === 0 ? -1.5 : 1.5;

    setCarPosition(aiCar, initialAngle, lane);
    scene.add(aiCar);

    const aiWheels = [];

    aiCar.traverse(object => {
      if (object.name === "vehicleWheel") {
        aiWheels.push(object);
      }
    });

    aiCars.push({
      mesh: aiCar,
      angle: initialAngle,
      initialAngle,
      lane,
      speed: 13 + Math.random() * 4,
      distance: 0,
      finished: false,
      finishTime: 0,
      wheels: aiWheels,
      progress: 0
    });
  }

  // ==========================================
// SOUND MESIN ARCADE
// ==========================================

let engineAudio = null;
let engineOscillator = null;
let engineHarmonic = null;
let engineFilter = null;
let engineGain = null;

let turboOscillator = null;
let turboGain = null;

function initRacingAudio() {

  window.addEventListener("keydown", event => {
  if (racingPage?.hidden) return;

  initRacingAudio();

  if ([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    " "
  ].includes(event.key)) {
    event.preventDefault();
  }

  keys.add(event.key.toLowerCase());

  if (event.key === "Shift" || event.key === " ") {
    nitroHeld = true;
  }
}, { passive: false });

  if (engineAudio) {
    if (engineAudio.state === "suspended") {
      engineAudio.resume();
    }
    return;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  engineAudio = new AudioContextClass();

  // Suara mesin utama
  engineOscillator = engineAudio.createOscillator();
  engineOscillator.type = "sawtooth";

  engineHarmonic = engineAudio.createOscillator();
  engineHarmonic.type = "triangle";

  engineFilter = engineAudio.createBiquadFilter();
  engineFilter.type = "lowpass";
  engineFilter.frequency.value = 450;

  engineGain = engineAudio.createGain();
  engineGain.gain.value = 0;

  engineOscillator.connect(engineFilter);
  engineHarmonic.connect(engineFilter);

  engineFilter.connect(engineGain);
  engineGain.connect(engineAudio.destination);

  // Suara turbo
  turboOscillator = engineAudio.createOscillator();
  turboOscillator.type = "sawtooth";
  turboOscillator.frequency.value = 180;

  const turboFilter = engineAudio.createBiquadFilter();
  turboFilter.type = "highpass";
  turboFilter.frequency.value = 700;

  turboGain = engineAudio.createGain();
  turboGain.gain.value = 0;

  turboOscillator.connect(turboFilter);
  turboFilter.connect(turboGain);
  turboGain.connect(engineAudio.destination);

  engineOscillator.start();
  engineHarmonic.start();
  turboOscillator.start();

  engineAudio.resume();
}

function updateEngineSound(currentSpeed, accelerating, boosting) {
  if (!engineAudio || !engineGain) return;

  const now = engineAudio.currentTime;
  const speed = Math.abs(currentSpeed);

  const rpm = 65 + speed * 5.5;

  engineOscillator.frequency.setTargetAtTime(
    rpm,
    now,
    0.08
  );

  engineHarmonic.frequency.setTargetAtTime(
    rpm * 2.01,
    now,
    0.08
  );

  engineFilter.frequency.setTargetAtTime(
    350 + speed * 65,
    now,
    0.1
  );

  const volume = accelerating || speed > 1
    ? 0.045 + Math.min(speed / 400, 0.09)
    : 0.012;

  engineGain.gain.setTargetAtTime(
    volume,
    now,
    0.12
  );

  turboOscillator.frequency.setTargetAtTime(
    boosting ? 420 + speed * 8 : 180,
    now,
    0.08
  );

  turboGain.gain.setTargetAtTime(
    boosting ? 0.045 : 0,
    now,
    0.1
  );
}

function stopRacingAudio() {
  if (!engineAudio || !engineGain) return;

  const now = engineAudio.currentTime;

  engineGain.gain.setTargetAtTime(0, now, 0.08);
  turboGain.gain.setTargetAtTime(0, now, 0.08);
}

  // ==========================================
  // INPUT DAN KAMERA
  // ==========================================

  function setCameraMode() {
    firstPerson = !firstPerson;

    if (cameraLabel) {
      cameraLabel.textContent = firstPerson
        ? "ORANG PERTAMA"
        : "ORANG KETIGA";
    }

    if (cameraBtn) {
      cameraBtn.textContent = firstPerson
        ? "Kamera Ketiga"
        : "Kamera Pertama";
    }
  }

  cameraBtn?.addEventListener("click", setCameraMode);

  nitroBtn?.addEventListener("pointerdown", () => {
    nitroHeld = true;
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach(type => {
    nitroBtn?.addEventListener(type, () => {
      nitroHeld = false;
    });
  });

  window.addEventListener("keydown", event => {
    if (racingPage?.hidden) return;

    if ([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " "
    ].includes(event.key)) {
      event.preventDefault();
    }

    keys.add(event.key.toLowerCase());

    if (event.key === "Shift" || event.key === " ") {
      nitroHeld = true;
    }
  }, { passive: false });

  window.addEventListener("keyup", event => {
    keys.delete(event.key.toLowerCase());

    if (event.key === "Shift" || event.key === " ") {
      nitroHeld = false;
    }
  });

  window.addEventListener("blur", () => {
    keys.clear();
    nitroHeld = false;
  });




  // ==========================================
  // KONTROL HP - TOUCHSCREEN
  // ==========================================

  document.querySelectorAll(
    ".racing-mobile-controls [data-racing-key]"
  ).forEach(button => {
    const key = button.dataset.racingKey.toLowerCase();

    button.addEventListener("pointerdown", event => {
      event.preventDefault();

      keys.add(key);
      button.classList.add("control-active");

      try {
        button.setPointerCapture(event.pointerId);
      } catch (error) {}
    });

    const releaseButton = event => {
      keys.delete(key);
      button.classList.remove("control-active");
    };

    button.addEventListener("pointerup", releaseButton);
    button.addEventListener("pointercancel", releaseButton);
    button.addEventListener("lostpointercapture", releaseButton);
    button.addEventListener("contextmenu", event => {
      event.preventDefault();
    });
  });




  // ==========================================
  // RESIZE
  // ==========================================

  let viewWidth = 0;
  let viewHeight = 0;

  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);

    if (width === viewWidth && height === viewHeight) return;

    viewWidth = width;
    viewHeight = height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(viewport);
  }

  window.addEventListener("resize", resize);
  resize();

  // ==========================================
  // UTILITAS WAKTU
  // ==========================================

  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const secs = Math.floor(safe % 60);
    const millis = Math.floor((safe % 1) * 100);

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
  }

  // ==========================================
  // RESET BALAPAN
  // ==========================================

  function resetRace() {
    raceState = "waiting";
    countdownValue = 3;
    countdownTime = 0;

    raceStartTime = 0;
    raceElapsed = 0;

    velocity = 0;
    yaw = Math.PI / 2;
    nitro = 100;
    nitroHeld = false;

    playerLap = 1;
    nextCheckpoint = 1;
    playerProgress = 0;
    playerFinished = false;
    playerFinishTime = 0;
    playerPosition = TOTAL_CARS;

    // Mobil pemain di garis start.
    car.position.set(0, 0, 34);
    car.rotation.y = yaw;

    // Kembalikan AI ke posisi awal.
    aiCars.forEach(ai => {
      ai.angle = ai.initialAngle;
      ai.distance = 0;
      ai.finished = false;
      ai.finishTime = 0;
      ai.progress = 0;

      setCarPosition(ai.mesh, ai.angle, ai.lane);
    });

    if (resultEl) resultEl.hidden = true;

    if (countdownEl) {
      countdownEl.hidden = true;
      countdownEl.textContent = "3";
    }

    if (lapEl) lapEl.textContent = `1 / ${TOTAL_LAPS}`;
    if (timerEl) timerEl.textContent = "00:00.00";
    if (positionEl) positionEl.textContent = `10 / ${TOTAL_CARS}`;

    if (checkpointEl) {
      checkpointEl.textContent = "Checkpoint berikutnya: 1";
    }

    if (raceStateEl) raceStateEl.textContent = "BERSIAP";
    if (statusEl) statusEl.textContent = "Menunggu countdown";

    updateLeaderboard();
  }

  // ==========================================
  // COUNTDOWN
  // ==========================================

  function startCountdown() {
    if (raceState !== "waiting") return;

    raceState = "countdown";
    countdownValue = 3;
    countdownTime = 0;

    if (raceStateEl) raceStateEl.textContent = "BERSIAP";

    if (countdownEl) {
      countdownEl.hidden = false;
      countdownEl.textContent = "3";
    }
  }

  function updateCountdown(dt) {
    countdownTime += dt;

    if (countdownTime < 1) return;

    countdownTime -= 1;
    countdownValue--;

    if (countdownValue > 0) {
      if (countdownEl) {
        countdownEl.textContent = String(countdownValue);
      }
      return;
    }

    raceState = "racing";
    raceStartTime = performance.now();
    raceElapsed = 0;

    if (countdownEl) {
      countdownEl.textContent = "GO!";
    }

    if (raceStateEl) raceStateEl.textContent = "BALAPAN BERLANGSUNG";
    if (statusEl) statusEl.textContent = "GO! GAS POLL!";

    setTimeout(() => {
      if (raceState === "racing" && countdownEl) {
        countdownEl.hidden = true;
      }
    }, 700);
  }

  // ==========================================
  // PERGERAKAN AI
  // ==========================================

  function updateAI(dt) {
    aiCars.forEach(ai => {
      if (ai.finished) return;

      const rx = TRACK_RX + ai.lane;
      const rz = TRACK_RZ + ai.lane * 0.62;

      const tangentLength = Math.sqrt(
        Math.pow(rx * Math.sin(ai.angle), 2) +
        Math.pow(rz * Math.cos(ai.angle), 2)
      );

      const distance = ai.speed * dt;

      ai.angle -= distance / tangentLength;
      ai.distance += distance;

      setCarPosition(ai.mesh, ai.angle, ai.lane);

      ai.wheels.forEach(wheel => {
        wheel.rotation.x += ai.speed * dt * 0.8;
      });

      ai.progress = ai.distance / LAP_DISTANCE;

      if (ai.distance >= LAP_DISTANCE * TOTAL_LAPS) {
        ai.finished = true;
        ai.finishTime = raceElapsed;
      }
    });
  }

  // ==========================================
  // CHECKPOINT PEMAIN
  // ==========================================

  function updatePlayerCheckpoint() {
    if (playerFinished || raceState !== "racing") return;

    const checkpoint = CHECKPOINTS[nextCheckpoint];

    const targetX = Math.cos(checkpoint.angle) * TRACK_RX;
    const targetZ = Math.sin(checkpoint.angle) * TRACK_RZ;

    const dx = car.position.x - targetX;
    const dz = car.position.z - targetZ;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 12) return;

    if (nextCheckpoint === 0) {
      playerLap++;

      if (playerLap > TOTAL_LAPS) {
        playerFinished = true;
        playerFinishTime = raceElapsed;
        playerProgress = TOTAL_LAPS * 4;

        finishRace();
        stopRacingAudio();
        return;
      }

      nextCheckpoint = 1;
    } else {
      nextCheckpoint++;
      if (nextCheckpoint >= CHECKPOINTS.length) {
        nextCheckpoint = 0;
      }
    }

    playerProgress = (playerLap - 1) * 4 + nextCheckpoint;

    if (lapEl) {
      lapEl.textContent = `${Math.min(playerLap, TOTAL_LAPS)} / ${TOTAL_LAPS}`;
    }

    if (checkpointEl) {
      checkpointEl.textContent = nextCheckpoint === 0
        ? "Checkpoint berikutnya: GARIS START"
        : `Checkpoint berikutnya: ${nextCheckpoint}`;
    }

    if (statusEl) {
      statusEl.textContent = "CHECKPOINT BERHASIL!";
    }
  }

  // ==========================================
  // POSISI DAN LEADERBOARD
  // ==========================================

  function getRacers() {
    const racers = [
      {
        name: "KAMU",
        progress: playerFinished
          ? TOTAL_LAPS * 4 + 1
          : playerProgress,
        time: playerFinishTime,
        isPlayer: true
      }
    ];

    aiCars.forEach((ai, index) => {
      racers.push({
        name: `AI ${String(index + 1).padStart(2, "0")}`,
        progress: ai.finished
          ? TOTAL_LAPS * 4 + 1
          : ai.progress * 4,
        time: ai.finishTime,
        isPlayer: false
      });
    });

    racers.sort((a, b) => {
      if (b.progress !== a.progress) {
        return b.progress - a.progress;
      }

      if (a.time && b.time) return a.time - b.time;
      if (a.time) return -1;
      if (b.time) return 1;

      return 0;
    });

    return racers;
  }

  function updateLeaderboard() {
    const racers = getRacers();
    const playerIndex = racers.findIndex(racer => racer.isPlayer);

    playerPosition = playerIndex + 1;

    if (positionEl) {
      positionEl.textContent = `${playerPosition} / ${TOTAL_CARS}`;
    }

    if (leaderboardList) {
      leaderboardList.innerHTML = racers.slice(0, 5).map((racer, index) => `
        <div class="racing-leaderboard-row ${racer.isPlayer ? "is-player" : ""}">
          <span>${index + 1}</span>
          <strong>${racer.name}</strong>
          <span>${racer.isPlayer && playerFinished ? "FINISH" : racer.progress >= TOTAL_LAPS * 4 ? "FINISH" : "RACE"}</span>
        </div>
      `).join("");
    }

    if (leaderboardEl) {
      leaderboardEl.hidden = false;
    }
  }

  // ==========================================
  // SELESAI BALAPAN
  // ==========================================

  function finishRace() {
    raceState = "finished";
    velocity = 0;
    nitroHeld = false;

    if (raceStateEl) raceStateEl.textContent = "BALAPAN SELESAI";
    if (statusEl) statusEl.textContent = "FINISH!";

    updateLeaderboard();

    const racers = getRacers();
    const playerIndex = racers.findIndex(racer => racer.isPlayer);
    const finalPositionNumber = playerIndex + 1;

    if (resultTitle) {
      resultTitle.textContent = finalPositionNumber === 1
        ? "JUARA 1! KEREN!"
        : "BALAPAN SELESAI!";
    }

    if (resultTime) {
      resultTime.textContent = formatTime(playerFinishTime);
    }

    if (resultPosition) {
      resultPosition.textContent = `${finalPositionNumber} / ${TOTAL_CARS}`;
    }

    if (finalLeaderboard) {
      finalLeaderboard.innerHTML = racers.map((racer, index) => `
        <div class="racing-result-row ${racer.isPlayer ? "is-player" : ""}">
          <span>${index + 1}</span>
          <strong>${racer.name}</strong>
          <span>${racer.time ? formatTime(racer.time) : "Belum finish"}</span>
        </div>
      `).join("");
    }

    if (resultEl) resultEl.hidden = false;
  }

  restartBtn?.addEventListener("click", () => {
    resetRace();
    startCountdown();
  });

  // ==========================================
// COLLISION MOBIL DAN DINDING
// ==========================================

function checkWallCollision(x, z) {
  const outerDistance = Math.sqrt(
    (x / 62) ** 2 + (z / 41) ** 2
  );

  const innerDistance = Math.sqrt(
    (x / 43) ** 2 + (z / 22) ** 2
  );

  return outerDistance > 0.97 || innerDistance < 1.06;
}

function checkCarCollision(x, z) {
  for (const ai of aiCars) {
    const dx = x - ai.mesh.position.x;
    const dz = z - ai.mesh.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 3.7) {
      return true;
    }
  }

  return false;
}

function checkObstacleCollision(x, z) {
  for (const obstacle of trackObstacles) {
    const dx = x - obstacle.position.x;
    const dz = z - obstacle.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 2.8) {
      return true;
    }
  }

  return false;
}

  // ==========================================
  // GERAKAN PEMAIN
  // ==========================================

function updatePlayer(dt) {
  if (raceState !== "racing" || playerFinished) {
    velocity *= Math.pow(0.90, dt * 60);
    updateEngineSound(velocity, false, false);
    return false;
  }

  const forward = keys.has("w") || keys.has("arrowup");
  const reverse = keys.has("s") || keys.has("arrowdown");
  const left = keys.has("a") || keys.has("arrowleft");
  const right = keys.has("d") || keys.has("arrowright");

  const boosting =
    nitroHeld &&
    nitro > 0 &&
    velocity > 1.5 &&
    forward;

  if (forward) {
    velocity += (boosting ? 27 : 16) * dt;
  } else if (reverse) {
    velocity -= 22 * dt;
  } else {
    velocity *= Math.pow(0.965, dt * 60);
  }

  velocity = THREE.MathUtils.clamp(
    velocity,
    -10,
    boosting ? 48 : 30
  );

  if (boosting) {
    nitro = Math.max(0, nitro - 28 * dt);
  } else {
    nitro = Math.min(100, nitro + 7 * dt);
  }

  const steerPower =
    (0.35 + Math.min(Math.abs(velocity) / 18, 1.3)) * dt;

  if (left) {
    yaw += steerPower * (velocity >= 0 ? 1 : -1);
  }

  if (right) {
    yaw -= steerPower * (velocity >= 0 ? 1 : -1);
  }

  car.rotation.y = yaw;

  // Simpan posisi sebelum bergerak
  const oldX = car.position.x;
  const oldZ = car.position.z;

  // Gerakkan mobil
  car.position.x += Math.sin(yaw) * velocity * dt;
  car.position.z += Math.cos(yaw) * velocity * dt;

  // COLLISION DINDING
  if (checkWallCollision(car.position.x, car.position.z)) {
    car.position.x = oldX;
    car.position.z = oldZ;

    velocity *= -0.25;

    if (statusEl) {
      statusEl.textContent = "BRAKK! MENABRAK DINDING!";
    }
  }

// COLLISION MOBIL AI
else if (checkCarCollision(car.position.x, car.position.z)) {
  car.position.x = oldX;
  car.position.z = oldZ;

  velocity *= -0.35;

  if (statusEl) {
    statusEl.textContent = "DUARR! MENABRAK MOBIL!";
  }
}

// COLLISION RINTANGAN
else if (checkObstacleCollision(car.position.x, car.position.z)) {
  car.position.x = oldX;
  car.position.z = oldZ;

  velocity *= -0.45;

  if (statusEl) {
    statusEl.textContent = "BRAKK! MENABRAK RINTANGAN!";
  }
}

  wheels.forEach(wheel => {
    wheel.rotation.x += velocity * dt * 0.8;
  });

  exhaust.intensity = boosting ? 5 : 1.8;

  // SOUND MESIN
  updateEngineSound(velocity, forward, boosting);

  if (speedEl) {
    speedEl.innerHTML =
      `${Math.round(Math.abs(velocity) * 7)} <small>km/j</small>`;
  }

  if (nitroEl) {
    nitroEl.textContent = `${Math.round(nitro)}%`;
  }

  if (statusEl && !playerFinished &&
      !checkWallCollision(car.position.x, car.position.z) &&
      !checkCarCollision(car.position.x, car.position.z)) {
    statusEl.textContent = boosting
      ? "NITRO AKTIF!"
      : velocity > 1
        ? "Melaju di arena"
        : "Gas untuk melaju";
  }

  updatePlayerCheckpoint();

  return boosting;
}

  // ==========================================
  // KAMERA
  // ==========================================

  function updateCamera(dt) {
    const desiredPosition = firstPerson
      ? new THREE.Vector3(
          car.position.x,
          car.position.y + 1.8,
          car.position.z + 0.35
        )
      : new THREE.Vector3(
          car.position.x - Math.sin(yaw) * 8,
          car.position.y + 5.2,
          car.position.z - Math.cos(yaw) * 8
        );

    const lookTarget = firstPerson
      ? new THREE.Vector3(
          car.position.x + Math.sin(yaw) * 18,
          1.5,
          car.position.z + Math.cos(yaw) * 18
        )
      : new THREE.Vector3(
          car.position.x,
          1.1,
          car.position.z
        );

    camera.position.lerp(
      desiredPosition,
      1 - Math.pow(0.001, dt)
    );

    camera.lookAt(lookTarget);
  }

  // ==========================================
  // LOOP UTAMA
  // ==========================================

  function animate(now) {
    requestAnimationFrame(animate);

    const dt = Math.min((now - lastTime) / 1000, 0.04);
    lastTime = now;

    resize();

    const pageVisible = !racingPage || !racingPage.hidden;

    if (!pageVisible) {
      renderer.render(scene, camera);
      return;
    }

    if (raceState === "waiting") {
      startCountdown();
    }

    if (raceState === "countdown") {
      updateCountdown(dt);
    }

    let boosting = false;

    if (raceState === "racing") {
      raceElapsed = (now - raceStartTime) / 1000;

      if (timerEl) {
        timerEl.textContent = formatTime(raceElapsed);
      }

      updateAI(dt);
      boosting = updatePlayer(dt);

      updateLeaderboard();
    } else if (raceState === "finished") {
      velocity = 0;
    }

    updateCamera(dt);

    core.rotation.y += dt * 0.45;
    core.rotation.x += dt * 0.18;

    if (speedEl && raceState !== "racing") {
      speedEl.innerHTML = `${Math.round(Math.abs(velocity) * 7)} <small>km/j</small>`;
    }

    if (nitroEl) {
      nitroEl.textContent = `${Math.round(nitro)}%`;
    }

    if (raceState === "racing" && boosting && statusEl) {
      statusEl.textContent = "NITRO AKTIF!";
    }

    renderer.render(scene, camera);
  }

  // ==========================================
  // MULAI
  // ==========================================

  resetRace();

  loadingEl?.remove();

  if (statusEl) {
    statusEl.textContent = "Arena siap. Menunggu balapan...";
  }

  requestAnimationFrame(animate);
})();

/* ── Konami code detector ── */
const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'KeyB','KeyA',
];

const KONAMI_TOUCH = ['up','up','down','down','left','right','left','right','tap','tap'];

const buffer      = [];
const touchBuffer = [];
let active = false;

function tryToggle() {
  active ? deactivateBrainrot() : activateBrainrot();
}

window.addEventListener('keydown', e => {
  buffer.push(e.code);
  if (buffer.length > KONAMI.length) buffer.shift();

  if (buffer.length === KONAMI.length && buffer.every((k, i) => k === KONAMI[i])) {
    buffer.length = 0;
    tryToggle();
    return;
  }

  if (e.code === 'Escape' && active) deactivateBrainrot();
});

/* ── Konami touch (↑↑↓↓←→←→ + 2× tap) ── */
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
const SWIPE_MIN    = 30;
const TAP_MAX_DIST = 10;
const TAP_MAX_TIME = 400;

function pushTouch(sym) {
  touchBuffer.push(sym);
  if (touchBuffer.length > KONAMI_TOUCH.length) touchBuffer.shift();
  if (touchBuffer.length === KONAMI_TOUCH.length && touchBuffer.every((k, i) => k === KONAMI_TOUCH[i])) {
    touchBuffer.length = 0;
    tryToggle();
  }
}

window.addEventListener('pointerdown', e => {
  if (!e.isPrimary || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
  touchStartX    = e.clientX;
  touchStartY    = e.clientY;
  touchStartTime = Date.now();
});

window.addEventListener('pointerup', e => {
  if (!e.isPrimary || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
  const dx   = e.clientX - touchStartX;
  const dy   = e.clientY - touchStartY;
  const dist = Math.hypot(dx, dy);
  const dt   = Date.now() - touchStartTime;

  if (dist < TAP_MAX_DIST && dt < TAP_MAX_TIME) { pushTouch('tap'); return; }
  if (dist < SWIPE_MIN) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    pushTouch(dx > 0 ? 'right' : 'left');
  } else {
    pushTouch(dy > 0 ? 'down' : 'up');
  }
});

/* ── Speech config ── */
const SPEECH_CONFIG = {
  rate: 1.0,
  pitch: 1.3,
  volume: 1.0,
  voicePrefs: {
    'en-US': ['Samantha', 'Alex', 'Daniel', 'Google US English'],
    'it-IT': ['Alice', 'Luca', 'Google italiano'],
  },
};

let voicesCache = [];
function loadVoices() {
  if (!window.speechSynthesis) return;
  voicesCache = speechSynthesis.getVoices();
}
if (window.speechSynthesis) {
  loadVoices();
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

function pickVoice(lang) {
  if (!voicesCache.length) return null;
  const prefs = SPEECH_CONFIG.voicePrefs[lang] || [];
  for (const name of prefs) {
    const v = voicesCache.find(v => v.name === name);
    if (v) return v;
  }
  return voicesCache.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())) || null;
}

/* ── Token data ── */
const TOKENS = [
  'tralalero tralala', 'skibidi', 'ohio rizz', 'gyatt', 'fanum tax', 'sigma',
  'no cap', 'sus', 'brainrot', 'bombardiro crocodilo', 'tung tung tung sahur',
  'rizz', 'slay', 'L + ratio', '🚽', '💀', '🗿', '🤡', '🇮🇹', '🐕', '⬆️',
  'bro is cooked', 'caught in 4k', "it's giving", 'very demure',
  'lirilì lirilà', 'brr brr patapim', 'chimpanzini bananini',
  'cappuccino assassino', 'bombombini gusini', 'frigo camilo',
  'trippi troppi', 'ballerina cappuccina', 'glorbo fruttodrillo',
  '🦈', '🐊', '🦌', '🍌', '☕', '✈️', 'W rizz', 'chat is this real',
  'i am cooked fr', 'not the gyatt', 'ohio moment', '💅',
];

const SPLASH_PHRASES = [
  { text: 'SKIBIDI',        lang: 'en-US' },
  { text: 'OHIO',           lang: 'en-US' },
  { text: '+1 RIZZ',        lang: 'en-US', spoken: 'plus one rizz' },
  { text: 'L + RATIO',      lang: 'en-US', spoken: 'L plus ratio' },
  { text: 'GYATT',          lang: 'en-US' },
  { text: 'NO CAP',         lang: 'en-US' },
  { text: 'SIGMA',          lang: 'en-US' },
  { text: 'FR FR',          lang: 'en-US', spoken: 'for real for real' },
  { text: 'W RIZZ',         lang: 'en-US', spoken: 'W rizz' },
  { text: 'SLAY',           lang: 'en-US' },
  { text: 'BRRR PATAPIM',   lang: 'it-IT' },
  { text: 'TUNG TUNG TUNG', lang: 'it-IT' },
  { text: 'BOMBARDIRO',     lang: 'it-IT' },
  { text: '💀',             lang: 'en-US', spoken: "I'm dead" },
  { text: '🚽',             lang: 'en-US', spoken: 'skibidi toilet' },
];

const TITLE_CYCLE = ['kazlik', 'skibidi', 'ohio', 'rizz', 'gyatt', 'sigma', '💀', 'tung tung'];

/* ── State handles ── */
let tokenInterval  = null;
let toiletInterval = null;
let splashInterval = null;
let titleInterval  = null;
let pointerHandler = null;

/* ── Token spawner ── */
function spawnToken() {
  const el = document.createElement('span');
  el.className = 'float-token';
  el.textContent = TOKENS[Math.floor(Math.random() * TOKENS.length)];
  el.style.left = (Math.random() * 88 + 2) + 'vw';
  el.style.top  = (Math.random() * 70 + 15) + 'vh';
  el.style.setProperty('--duration', (2.5 + Math.random() * 3) + 's');
  el.style.setProperty('--rot', (Math.random() * 20 - 10) + 'deg');
  document.getElementById('token-container').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ── Toilet rain ── */
function spawnToiletDrop() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const DROPS = ['🚽', '🚽', '🚽', '💀', '🗿', '🐕', '🦈'];
  const el = document.createElement('span');
  el.className = 'toilet-drop';
  el.textContent = DROPS[Math.floor(Math.random() * DROPS.length)];
  el.style.left = (Math.random() * 96 + 2) + 'vw';
  el.style.setProperty('--dur', (2 + Math.random() * 3) + 's');
  el.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
  document.getElementById('toilet-rain').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ── Splash burst ── */
function spawnSplashBurst() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const entry = SPLASH_PHRASES[Math.floor(Math.random() * SPLASH_PHRASES.length)];
  const el = document.createElement('div');
  el.className = 'splash-burst';
  el.textContent = entry.text;
  el.style.left = (20 + Math.random() * 55) + '%';
  el.style.top  = (15 + Math.random() * 55) + '%';
  document.getElementById('splash-container').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
  speakSplash(entry);
}

function speakSplash(entry) {
  if (!entry.lang || !window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(entry.spoken || entry.text);
  utt.lang   = entry.lang;
  utt.rate   = SPEECH_CONFIG.rate;
  utt.pitch  = Math.random() * 2;
  utt.volume = SPEECH_CONFIG.volume;
  const v = pickVoice(entry.lang);
  if (v) utt.voice = v;
  speechSynthesis.speak(utt);
}

/* ── Multi-doge satellite ring ── */
function populateMultiDoge() {
  const ring = document.getElementById('multi-doge-ring');
  ring.innerHTML = '';
  ['🚽', '🗿', '🦈', '🐊'].forEach(emoji => {
    const span = document.createElement('span');
    span.className = 'satellite-doge';
    span.textContent = emoji;
    ring.appendChild(span);
  });
}

/* ── Title cycler ── */
function startTitleCycle() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let idx = 0;
  const el = document.getElementById('main-title');
  titleInterval = setInterval(() => {
    idx = (idx + 1) % TITLE_CYCLE.length;
    el.textContent = TITLE_CYCLE[idx];
  }, 500);
}

function stopTitleCycle() {
  if (titleInterval) { clearInterval(titleInterval); titleInterval = null; }
  document.getElementById('main-title').textContent = 'kazlik';
}

/* ── Cursor trail ── */
function setupCursorTrail() {
  const TRAIL_EMOJIS  = ['🚽', '🗿', '💀', '🐕', '🦈', '🐊', '🍌', '☕'];
  const cursorEl      = document.getElementById('cursor-toilet');
  const trailEl       = document.getElementById('cursor-trail');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastTrail = 0;

  cursorEl.style.display = 'block';

  pointerHandler = e => {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top  = e.clientY + 'px';

    if (reducedMotion) return;
    const now = Date.now();
    if (now - lastTrail < 33) return;
    lastTrail = now;

    const dot = document.createElement('span');
    dot.className = 'trail-dot';
    dot.textContent = TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    trailEl.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  };

  window.addEventListener('pointermove', pointerHandler);
}

function teardownCursorTrail() {
  if (pointerHandler) {
    window.removeEventListener('pointermove', pointerHandler);
    pointerHandler = null;
  }
  document.getElementById('cursor-toilet').style.display = 'none';
  document.getElementById('cursor-trail').innerHTML = '';
}

/* ── Speech synthesis ── */
function stopSpeech() {
  if (window.speechSynthesis) speechSynthesis.cancel();
}

/* ── Web Audio music ── */
let audioCtx       = null;
let schedulerTimer = null;
let nextStepTime   = 0;
let currentStep    = 0;

const BPM   = 150;
const BEAT  = 60 / BPM;
const STEP  = BEAT / 4;
const STEPS = 32;

const noteHz = n => 440 * Math.pow(2, (n - 69) / 12);

const KICK    = [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0];
const SNARE   = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
const HIHAT   = [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
const COWBELL = [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0];
// A minor pentatonic: A2=45 C3=48 E3=52 G3=55 A3=57
const BASS = [
  45, 0, 0, 0,  48, 0, 0, 0,  52, 0, 0, 0,  55, 0, 0, 0,
  45, 0, 0, 0,  52, 0, 0, 0,  48, 0, 0, 0,  57, 0, 0, 0,
];
// A3=57 C4=60 E4=64 G4=67 A4=69
const LEAD = [
  57, 0, 60, 0,  64, 0, 67, 0,  69, 0, 67, 0,  64, 0, 60, 0,
  57, 0, 64, 0,  60, 0, 69, 0,  67, 0, 64, 0,  57, 0,  0, 0,
];

function scheduleKick(t) {
  const ctx  = audioCtx;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
  gain.gain.setValueAtTime(0.9, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.start(t); osc.stop(t + 0.15);
}

function scheduleSnare(t) {
  const ctx     = audioCtx;
  const bufSize = Math.floor(ctx.sampleRate * 0.08);
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src    = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass'; filter.frequency.value = 2200; filter.Q.value = 0.8;
  const gain   = ctx.createGain();
  gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(t); src.stop(t + 0.1);
}

function scheduleHihat(t) {
  const ctx     = audioCtx;
  const bufSize = Math.floor(ctx.sampleRate * 0.05);
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src    = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 9000;
  const gain   = ctx.createGain();
  gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(t); src.stop(t + 0.06);
}

function scheduleCowbell(t) {
  const ctx     = audioCtx;
  const bufSize = Math.floor(ctx.sampleRate * 0.12);
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src    = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass'; filter.frequency.value = 800; filter.Q.value = 12;
  const gain   = ctx.createGain();
  gain.gain.setValueAtTime(0.35, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(t); src.stop(t + 0.2);
}

function scheduleBass(freq, t) {
  const ctx    = audioCtx;
  const osc    = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain   = ctx.createGain();
  osc.type = 'sawtooth'; osc.frequency.value = noteHz(freq);
  filter.type = 'lowpass'; filter.frequency.value = 800; filter.Q.value = 2;
  gain.gain.setValueAtTime(0.45, t); gain.gain.exponentialRampToValueAtTime(0.001, t + STEP * 3.5);
  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  osc.start(t); osc.stop(t + STEP * 4);
}

function scheduleLead(freq, t) {
  const ctx      = audioCtx;
  const osc1     = ctx.createOscillator();
  const osc2     = ctx.createOscillator();
  const gain     = ctx.createGain();
  const baseFreq = noteHz(freq);
  osc1.type = 'triangle'; osc1.frequency.value = baseFreq;
  osc2.type = 'triangle'; osc2.frequency.value = baseFreq * Math.pow(2, 15 / 1200);
  gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + STEP * 1.8);
  osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
  osc1.start(t); osc1.stop(t + STEP * 2);
  osc2.start(t); osc2.stop(t + STEP * 2);
}

const LOOKAHEAD = 0.1;

function schedulerTick() {
  while (nextStepTime < audioCtx.currentTime + LOOKAHEAD) {
    const s = currentStep % STEPS;
    const t = nextStepTime;
    if (KICK[s])    scheduleKick(t);
    if (SNARE[s])   scheduleSnare(t);
    if (HIHAT[s])   scheduleHihat(t);
    if (COWBELL[s]) scheduleCowbell(t);
    if (BASS[s])    scheduleBass(BASS[s], t);
    if (LEAD[s])    scheduleLead(LEAD[s], t);
    nextStepTime += STEP;
    currentStep++;
  }
}

function startAudio() {
  audioCtx = new AudioContext();
  nextStepTime = audioCtx.currentTime + 0.05;
  currentStep  = 0;
  schedulerTimer = setInterval(schedulerTick, 25);
}

function stopAudio() {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

/* ── Activate / deactivate ── */
function activateBrainrot() {
  active = true;
  document.body.classList.add('brainrot-mode');
  startAudio();
  populateMultiDoge();
  setupCursorTrail();
  startTitleCycle();

  tokenInterval = setInterval(() => {
    if (active) { spawnToken(); spawnToken(); spawnToken(); }
  }, 200);

  toiletInterval = setInterval(() => {
    if (active) spawnToiletDrop();
  }, 250);

  splashInterval = setInterval(() => {
    if (active) spawnSplashBurst();
  }, 1500);
}

function deactivateBrainrot() {
  active = false;
  document.body.classList.remove('brainrot-mode');
  stopAudio();
  teardownCursorTrail();
  stopTitleCycle();
  stopSpeech();

  if (tokenInterval)  { clearInterval(tokenInterval);  tokenInterval  = null; }
  if (toiletInterval) { clearInterval(toiletInterval); toiletInterval = null; }
  if (splashInterval) { clearInterval(splashInterval); splashInterval = null; }

  document.getElementById('token-container').innerHTML  = '';
  document.getElementById('toilet-rain').innerHTML      = '';
  document.getElementById('splash-container').innerHTML = '';
  document.getElementById('multi-doge-ring').innerHTML  = '';
}

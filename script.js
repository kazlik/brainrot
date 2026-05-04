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
  if (!e.isPrimary) return;

  if (active) spawnTapBurst(e.clientX, e.clientY);

  if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
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
  { text: 'SKIBIDI',               lang: 'en-US' },
  { text: 'OHIO',                   lang: 'en-US' },
  { text: '+1 RIZZ',               lang: 'en-US', spoken: 'plus one rizz' },
  { text: 'L + RATIO',             lang: 'en-US', spoken: 'L plus ratio' },
  { text: 'GYATT',                  lang: 'en-US', spoken: 'gyat' },
  { text: 'NO CAP',                 lang: 'en-US' },
  { text: 'SIGMA',                  lang: 'en-US' },
  { text: 'FR FR',                  lang: 'en-US', spoken: 'for real for real' },
  { text: 'W RIZZ',                 lang: 'en-US', spoken: 'dub rizz' },
  { text: 'SLAY',                   lang: 'en-US' },
  { text: 'FANUM TAX',              lang: 'en-US' },
  { text: 'SUS',                    lang: 'en-US' },
  { text: 'MID',                    lang: 'en-US' },
  { text: 'BRO IS COOKED',          lang: 'en-US' },
  { text: 'CAUGHT IN 4K',           lang: 'en-US', spoken: 'caught in four K' },
  { text: 'BRR BRR PATAPIM',        lang: 'it-IT' },
  { text: 'TUNG TUNG TUNG SAHUR',   lang: 'it-IT' },
  { text: 'BOMBARDIRO CROCODILO',   lang: 'it-IT' },
  { text: 'TRALALERO TRALALA',      lang: 'it-IT' },
  { text: 'LIRILÌ LIRILÀ',          lang: 'it-IT' },
  { text: 'CAPPUCCINO ASSASSINO',   lang: 'it-IT' },
  { text: 'CHIMPANZINI BANANINI',   lang: 'it-IT' },
  { text: 'BALLERINA CAPPUCCINA',   lang: 'it-IT' },
  { text: '💀',                     lang: 'en-US', spoken: "I'm dead" },
  { text: '🚽',                     lang: 'en-US', spoken: 'skibidi toilet' },
];

const TITLE_CYCLE = ['kazlik', 'skibidi', 'ohio', 'rizz', 'gyatt', 'sigma', '💀', 'tung tung'];

const BURST_EMOJIS = ['🚽', '🗿', '💀', '🐕', '🦈', '🐊', '🍌', '☕', '💅', '🤡', '🇮🇹', '⬆️'];
const BURST_WORDS  = ['POW', 'BOOM', 'BONK', '💥', 'KAPOW', 'YEET', 'OHIO', 'W RIZZ', 'SKIBIDI'];

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
  el.style.left = (10 + Math.random() * 80) + '%';
  el.style.top  = (10 + Math.random() * 80) + '%';
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

/* ── Tap/click burst ── */
function spawnTapBurst(x, y) {
  const container     = document.getElementById('burst-container');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Shockwave ring
  if (!reducedMotion) {
    const ring = document.createElement('div');
    ring.className = 'burst-ring';
    ring.style.left = x + 'px';
    ring.style.top  = y + 'px';
    container.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  }

  // Emoji shrapnel
  if (!reducedMotion) {
    const N = 12;
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 + Math.random() * 0.5;
      const dist  = 60 + Math.random() * 90;
      const el    = document.createElement('span');
      el.className   = 'burst-shrapnel';
      el.textContent = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];
      el.style.left  = x + 'px';
      el.style.top   = y + 'px';
      el.style.setProperty('--dx',  (Math.cos(angle) * dist) + 'px');
      el.style.setProperty('--dy',  (Math.sin(angle) * dist) + 'px');
      el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      container.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  // Mini splash word
  const word = document.createElement('div');
  word.className   = 'burst-word';
  word.textContent = BURST_WORDS[Math.floor(Math.random() * BURST_WORDS.length)];
  word.style.left  = x + 'px';
  word.style.top   = (y - 30) + 'px';
  container.appendChild(word);
  word.addEventListener('animationend', () => word.remove());
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
let masterBus      = null;
let schedulerTimer = null;
let nextStepTime   = 0;
let currentStep    = 0;

const BPM   = 170;
const BEAT  = 60 / BPM;
const STEP  = BEAT / 4;
const STEPS = 64;

const noteHz = n => 440 * Math.pow(2, (n - 69) / 12);

// Patterns: 64 steps = 4 bars × 16 steps
// A minor pentatonic: A2=45 C3=48 E3=52 G3=55 A3=57
const KICK = [
  1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0,
  1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0,
];
const SNARE = [
  0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0,
  0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0,
];
const HIHAT = [
  0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0,
  0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0,
];
// 808-style cowbell on every 8th note — agresivně otravné
const COWBELL = [
  1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0,
  1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0,
];
const BASS = [
  45, 0, 0, 0,  48, 0, 0, 0,  52, 0, 0, 0,  55, 0, 0, 0,
  45, 0, 0, 0,  52, 0, 0, 0,  48, 0, 0, 0,  57, 0, 0, 0,
  55, 0, 0, 0,  48, 0, 0, 0,  57, 0, 0, 0,  52, 0, 0, 0,
  45, 0,45, 0,  48, 0,52, 0,  55, 0, 0, 0,  45, 0, 0, 0,
];
// A3=57 C4=60 E4=64 G4=67 A4=69 E5=76 A5=81 C5=72
const LEAD = [
  57, 0,60, 0,  64, 0,67, 0,  69, 0,67, 0,  64, 0,60, 0,
  57, 0,64, 0,  60, 0,69, 0,  67, 0,64, 0,  57, 0, 0, 0,
  69,67,64,60,  57,60,64,67,  69,76,81,76,  69,67,64, 0,
  57,64,57,64,  60,69,60,69,  72, 0, 0, 0,  57, 0, 0, 0,
];
// Wobble bass: square+LFO na silných dobách
const WOBBLE_BASS_NOTES = [
  45, 0, 0, 0,  0, 0, 0, 0,  45, 0, 0, 0,  0, 0, 0, 0,
  48, 0, 0, 0,  0, 0, 0, 0,  52, 0, 0, 0,  0, 0, 0, 0,
  45, 0, 0, 0,  0, 0, 0, 0,  55, 0, 0, 0,  0, 0, 0, 0,
  57, 0, 0, 0,  0, 0, 0, 0,  45, 0,45, 0,  0, 0, 0, 0,
];
// Toilet flush sweep na začátku barů 1 a 3
const FLUSH = [
  1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
  1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
];
// Robotic vox chop salvy
const VOX = [
  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
  1, 1, 1, 1,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
  1, 1, 1, 1,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
];

const DISTORTION_CURVE = (() => {
  const n = 256, drive = 30, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) curve[i] = Math.tanh(drive * (i * 2 / n - 1));
  return curve;
})();

function scheduleKick(t) {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(masterBus);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
  gain.gain.setValueAtTime(1.0, t);
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
  gain.gain.setValueAtTime(0.6, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  src.connect(filter); filter.connect(gain); gain.connect(masterBus);
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
  src.connect(filter); filter.connect(gain); gain.connect(masterBus);
  src.start(t); src.stop(t + 0.06);
}

function scheduleCowbell(t) {
  const ctx = audioCtx;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.3, t);
  masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  masterGain.connect(masterBus);
  [562, 845].forEach(f => {
    const osc  = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = f; filt.Q.value = 15;
    osc.type = 'square'; osc.frequency.value = f;
    osc.connect(filt); filt.connect(masterGain);
    osc.start(t); osc.stop(t + 0.14);
  });
}

function scheduleBass(freq, t) {
  const ctx    = audioCtx;
  const osc    = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain   = ctx.createGain();
  osc.type = 'sawtooth'; osc.frequency.value = noteHz(freq);
  filter.type = 'lowpass'; filter.frequency.value = 800; filter.Q.value = 2;
  gain.gain.setValueAtTime(0.45, t); gain.gain.exponentialRampToValueAtTime(0.001, t + STEP * 3.5);
  osc.connect(filter); filter.connect(gain); gain.connect(masterBus);
  osc.start(t); osc.stop(t + STEP * 4);
}

function scheduleWobbleBass(midiNote, t) {
  const ctx     = audioCtx;
  const osc     = ctx.createOscillator();
  const filter  = ctx.createBiquadFilter();
  const gain    = ctx.createGain();
  const lfo     = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  osc.type = 'square'; osc.frequency.value = noteHz(midiNote);
  filter.type = 'lowpass'; filter.frequency.value = 200; filter.Q.value = 8;
  lfo.type = 'sine'; lfo.frequency.value = 8;
  lfoGain.gain.value = 700;
  lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
  gain.gain.setValueAtTime(0.55, t); gain.gain.exponentialRampToValueAtTime(0.001, t + STEP * 3.5);
  osc.connect(filter); filter.connect(gain); gain.connect(masterBus);
  lfo.start(t); lfo.stop(t + STEP * 4);
  osc.start(t); osc.stop(t + STEP * 4);
}

function scheduleLead(freq, t) {
  const ctx      = audioCtx;
  const baseFreq = noteHz(freq);
  const shaper   = ctx.createWaveShaper();
  shaper.curve   = DISTORTION_CURVE;
  shaper.oversample = '4x';
  const outGain  = ctx.createGain();
  outGain.gain.setValueAtTime(0.1, t);
  outGain.gain.exponentialRampToValueAtTime(0.001, t + STEP * 1.8);
  shaper.connect(outGain); outGain.connect(masterBus);
  [-25, 0, 25].forEach(cents => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    const f = baseFreq * Math.pow(2, cents / 1200);
    osc.frequency.setValueAtTime(f, t);
    if (Math.random() < 0.3) {
      const wobble = (Math.random() > 0.5 ? 1 : -1) * 50;
      osc.frequency.linearRampToValueAtTime(baseFreq * Math.pow(2, (cents + wobble) / 1200), t + STEP);
    }
    osc.connect(shaper);
    osc.start(t); osc.stop(t + STEP * 2);
  });
}

function scheduleFlush(t) {
  const ctx     = audioCtx;
  const dur     = 0.4;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src    = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type  = 'lowpass';
  filter.frequency.setValueAtTime(4000, t);
  filter.frequency.exponentialRampToValueAtTime(80, t + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter); filter.connect(gain); gain.connect(masterBus);
  src.start(t); src.stop(t + dur + 0.05);

  const blub     = ctx.createOscillator();
  const blubGain = ctx.createGain();
  blub.type = 'sine';
  blub.frequency.setValueAtTime(80, t);
  blub.frequency.exponentialRampToValueAtTime(25, t + 0.15);
  blubGain.gain.setValueAtTime(0.5, t); blubGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  blub.connect(blubGain); blubGain.connect(masterBus);
  blub.start(t); blub.stop(t + 0.2);
}

function scheduleBruh(t) {
  const ctx = audioCtx;
  const dur = 0.2;
  [45, 48, 52].forEach(n => {
    const osc    = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain   = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(noteHz(n), t);
    osc.frequency.exponentialRampToValueAtTime(noteHz(n - 12), t + dur);
    filter.type = 'lowpass'; filter.frequency.value = 1200; filter.Q.value = 3;
    gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(filter); filter.connect(gain); gain.connect(masterBus);
    osc.start(t); osc.stop(t + dur + 0.02);
  });
}

function scheduleVoxChop(t) {
  const ctx        = audioCtx;
  const VOX_PITCHES = [880, 1100, 1320, 1760];
  const freq       = VOX_PITCHES[Math.floor(Math.random() * VOX_PITCHES.length)];
  const osc        = ctx.createOscillator();
  const lfo        = ctx.createOscillator();
  const lfoGain    = ctx.createGain();
  const gain       = ctx.createGain();
  osc.type = 'square'; osc.frequency.value = freq;
  lfo.type = 'sine'; lfo.frequency.value = 30;
  lfoGain.gain.value = 0.06;
  lfo.connect(lfoGain); lfoGain.connect(gain.gain);
  gain.gain.setValueAtTime(0.07, t); gain.gain.linearRampToValueAtTime(0.001, t + 0.07);
  osc.connect(gain); gain.connect(masterBus);
  lfo.start(t); lfo.stop(t + 0.08);
  osc.start(t); osc.stop(t + 0.08);
}

function scheduleRiser(t) {
  const ctx     = audioCtx;
  const dur     = BEAT * 4;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src    = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type  = 'lowpass';
  filter.frequency.setValueAtTime(200, t);
  filter.frequency.exponentialRampToValueAtTime(8000, t + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, t); gain.gain.linearRampToValueAtTime(0.4, t + dur);
  src.connect(filter); filter.connect(gain); gain.connect(masterBus);
  src.start(t); src.stop(t + dur + 0.01);
}

const LOOKAHEAD = 0.1;

function schedulerTick() {
  while (nextStepTime < audioCtx.currentTime + LOOKAHEAD) {
    const s   = currentStep % STEPS;
    const t   = nextStepTime;
    const bar = Math.floor(currentStep / 16) % 16; // 16-barový cyklus

    const isBuildBar    = bar === 8;
    const isDropSection = bar >= 9;

    if (!isBuildBar) {
      if (isDropSection && s % 4 === 0) scheduleKick(t);
      else if (KICK[s]) scheduleKick(t);
    }

    if (SNARE[s])              scheduleSnare(t);
    if (HIHAT[s])              scheduleHihat(t);
    if (COWBELL[s])            scheduleCowbell(t);
    if (BASS[s])               scheduleBass(BASS[s], t);
    if (WOBBLE_BASS_NOTES[s])  scheduleWobbleBass(WOBBLE_BASS_NOTES[s], t);
    if (LEAD[s])               scheduleLead(LEAD[s], t);
    if (FLUSH[s])              scheduleFlush(t);
    if (VOX[s])                scheduleVoxChop(t);

    if (isBuildBar && s === 0)           scheduleRiser(t);
    if (s % 2 === 0 && Math.random() < 0.1) scheduleBruh(t);

    nextStepTime += STEP;
    currentStep++;
  }
}

function startAudio() {
  audioCtx  = new AudioContext();
  masterBus = audioCtx.createDynamicsCompressor();
  masterBus.threshold.value = -10;
  masterBus.knee.value      = 6;
  masterBus.ratio.value     = 12;
  masterBus.attack.value    = 0.003;
  masterBus.release.value   = 0.1;
  masterBus.connect(audioCtx.destination);
  nextStepTime = audioCtx.currentTime + 0.05;
  currentStep  = 0;
  schedulerTimer = setInterval(schedulerTick, 25);
}

function stopAudio() {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
  masterBus = null;
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
  document.getElementById('burst-container').innerHTML  = '';
}

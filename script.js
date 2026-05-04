/* ── Konami code detector ── */
const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'KeyB','KeyA',
];

const buffer = [];
let active = false;

window.addEventListener('keydown', e => {
  buffer.push(e.code);
  if (buffer.length > KONAMI.length) buffer.shift();

  if (buffer.length === KONAMI.length && buffer.every((k, i) => k === KONAMI[i])) {
    buffer.length = 0;
    active ? deactivateBrainrot() : activateBrainrot();
    return;
  }

  if (e.code === 'Escape' && active) deactivateBrainrot();
});

/* ── Floating tokens ── */
const TOKENS = [
  'tralalero tralala', 'skibidi', 'ohio rizz', 'gyatt', 'fanum tax', 'sigma',
  'no cap', 'sus', 'brainrot', 'bombardiro crocodilo', 'tung tung sahur',
  'rizz', 'slay', 'L + ratio', '🚽', '💀', '🗿', '🤡', '🇮🇹', '🐕', '⬆️',
  'bro is cooked', 'caught in 4k', 'it\'s giving', 'very demure',
];

let tokenInterval = null;

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

/* ── Web Audio music ── */
let audioCtx = null;
let schedulerTimer = null;
let nextStepTime = 0;
let currentStep = 0;

const BPM   = 130;
const BEAT  = 60 / BPM;
const STEP  = BEAT / 4;  // 16th note
const STEPS = 32;         // 2 bars

const noteHz = n => 440 * Math.pow(2, (n - 69) / 12);

// Patterns — 1 = trigger, 0 = rest
const KICK  = [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0];
const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
const HIHAT = [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
// MIDI note numbers for A minor pentatonic
// A2=45 C3=48 E3=52 G3=55 A3=57
const BASS  = [
  45, 0, 0, 0,  48, 0, 0, 0,  52, 0, 0, 0,  55, 0, 0, 0,
  45, 0, 0, 0,  52, 0, 0, 0,  48, 0, 0, 0,  57, 0, 0, 0,
];
// A3=57 C4=60 E4=64 G4=67 A4=69
const LEAD  = [
  57, 0, 60, 0,  64, 0, 67, 0,  69, 0, 67, 0,  64, 0, 60, 0,
  57, 0, 64, 0,  60, 0, 69, 0,  67, 0, 64, 0,  57, 0,  0, 0,
];

function scheduleKick(t) {
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.start(t);
  osc.stop(t + 0.15);
}

function scheduleSnare(t) {
  const ctx = audioCtx;
  const bufSize = ctx.sampleRate * 0.08;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2200;
  filter.Q.value = 0.8;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.1);
}

function scheduleHihat(t) {
  const ctx = audioCtx;
  const bufSize = ctx.sampleRate * 0.05;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 9000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.06);
}

function scheduleBass(freq, t) {
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.value = noteHz(freq);

  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 2;

  gain.gain.setValueAtTime(0.45, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + STEP * 3.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + STEP * 4);
}

function scheduleLead(freq, t) {
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.value = noteHz(freq);

  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + STEP * 1.8);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + STEP * 2);
}

const LOOKAHEAD = 0.1; // seconds ahead to schedule

function schedulerTick() {
  while (nextStepTime < audioCtx.currentTime + LOOKAHEAD) {
    const s = currentStep % STEPS;
    const t = nextStepTime;

    if (KICK[s])                scheduleKick(t);
    if (SNARE[s])               scheduleSnare(t);
    if (HIHAT[s])               scheduleHihat(t);
    if (BASS[s])                scheduleBass(BASS[s], t);
    if (LEAD[s])                scheduleLead(LEAD[s], t);

    nextStepTime += STEP;
    currentStep++;
  }
}

function startAudio() {
  audioCtx = new AudioContext();
  nextStepTime = audioCtx.currentTime + 0.05;
  currentStep = 0;
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
  tokenInterval = setInterval(() => {
    if (active) { spawnToken(); spawnToken(); }
  }, 350);
}

function deactivateBrainrot() {
  active = false;
  document.body.classList.remove('brainrot-mode');
  stopAudio();
  if (tokenInterval) { clearInterval(tokenInterval); tokenInterval = null; }
  document.getElementById('token-container').innerHTML = '';
}

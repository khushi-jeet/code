// ============================================================
// 4. RENDER — draws bars to the canvas every frame
//    Clears the canvas div and repopulates with .bar elements
// ============================================================
function renderBars(arr, hl = {}) {
  const canvas = document.getElementById('vizCanvas');
  const maxVal = Math.max(...arr, 1);
  const H = (canvas.offsetHeight || 300) - 48; // usable bar height
  const W = (canvas.offsetWidth  || 700) - 28; // usable bar width
  const n = arr.length;
  const gap = n > 35 ? 2 : 3;
  const bw  = Math.max(5, Math.floor((W - gap * (n - 1)) / n));

  canvas.innerHTML = '';
  canvas.style.gap = gap + 'px';

  arr.forEach((val, i) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width  = bw + 'px';
    bar.style.height = Math.max(4, Math.round((val / maxVal) * H)) + 'px';

    // determine color class — order matters (higher = higher priority)
    if      (hl.sorted    && hl.sorted.includes(i))    bar.classList.add('st-sorted');
    else if (hl.found     && hl.found.includes(i))     bar.classList.add('st-found');
    else if (hl.mid       !== undefined && hl.mid===i) bar.classList.add('st-mid');
    else if (hl.pivot     !== undefined && hl.pivot===i)bar.classList.add('st-pivot');
    else if (hl.swapping  && hl.swapping.includes(i))  bar.classList.add('st-swapping');
    else if (hl.comparing && hl.comparing.includes(i)) bar.classList.add('st-comparing');
    else if (hl.elim      && hl.elim.includes(i))      bar.classList.add('st-elim');
    else                                                bar.classList.add('st-default');

    // show numeric value label when bars are wide enough to fit it
    if (bw >= 18 && n <= 30) {
      const lbl = document.createElement('div');
      lbl.className   = 'bar-val';
      lbl.textContent = val;
      bar.appendChild(lbl);
    }

    canvas.appendChild(bar);
  });
}


// ============================================================
// 5. ENGINE — state machine for run / step / pause / reset
// ============================================================

// --- global state ---
let algo    = null;   // active algorithm key e.g. 'bubble'
let arr     = [];     // current working array
let steps   = [];     // all pre-generated frames for current run
let stepIdx = 0;      // index into steps[]
let running = false;  // true while auto-run loop is active
let paused  = false;  // true when user has paused auto-run

// delay in ms per speed slider value (1 = slowest, 5 = instant)
const SPEEDS       = { 1: 700, 2: 320, 3: 140, 4: 45, 5: 8 };
const SPEED_LABELS = { 1: 'Very Slow', 2: 'Slow', 3: 'Medium', 4: 'Fast', 5: 'Instant' };

const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- DOM element refs ---
const statusDot   = document.getElementById('statusDot');
const statusText  = document.getElementById('statusText');
const stepCount   = document.getElementById('stepCount');
const speedSlider = document.getElementById('speedSlider');
const sizeSlider  = document.getElementById('sizeSlider');
const runBtn      = document.getElementById('runBtn');
const stepBtn     = document.getElementById('stepBtn');
const stepBackBtn = document.getElementById('stepBackBtn');
const pauseBtn    = document.getElementById('pauseBtn');
const resetBtn    = document.getElementById('resetBtn');
const shuffleBtn  = document.getElementById('shuffleBtn');

// update the status bar message and dot color
function setStatus(msg, state = 'idle') {
  statusText.textContent = msg;
  statusDot.className = 'status-dot' +
    (state === 'running' ? ' running' : state === 'done' ? ' done' : '');
}

// update "stepIdx / total" counter
function syncStepCount() {
  stepCount.textContent = steps.length ? `${stepIdx} / ${steps.length}` : '— / —';
}

// apply one frame: render bars + update status + highlight code
function applyStep(s) {
  if (!s) return;
  renderBars(s.arr, s.hl || {});
  setStatus(s.msg, 'running');
  syncStepCount();
  highlightCode(getLineId(s));
}

// materialize all generator frames into steps[]
// returns false if something is missing (e.g. no target entered)
function buildSteps() {
  steps = []; stepIdx = 0;
  let gen;

  if      (algo === 'bubble')    gen = bubbleGen(arr);
  else if (algo === 'insertion') gen = insertionGen(arr);
  else if (algo === 'quick')     gen = quickGen(arr);
  else if (algo === 'binary') {
    const t = parseInt(document.getElementById('targetInput').value);
    if (isNaN(t)) { setStatus('Enter a search target first', 'error'); return false; }
    gen = binaryGen(arr, t);
  }
  else return false;

  steps = [...gen]; // spread generator into array — enables back-stepping
  return true;
}

// auto-play: loop through steps with a delay between each
async function runAll() {
  running = true; paused = false;
  runBtn.disabled = stepBtn.disabled = stepBackBtn.disabled = true;
  pauseBtn.disabled = false;

  while (stepIdx < steps.length) {
    if (paused)   { await sleep(50); continue; } // busy-wait while paused
    if (!running) break;
    applyStep(steps[stepIdx++]);
    await sleep(SPEEDS[speedSlider.value] || 140);
  }

  if (running) {
    statusDot.className = 'status-dot done';
    setStatus(steps[steps.length - 1]?.msg || 'Done ✓', 'done');
  }
  resetBtns();
}

// restore button states after run finishes or is reset
function resetBtns() {
  running = paused = false;
  runBtn.disabled      = false;
  stepBtn.disabled     = false;
  stepBackBtn.disabled = stepIdx <= 0;
  pauseBtn.disabled    = true;
  pauseBtn.textContent = 'Pause';
}

// generate a random array of n values in range [10, 99]
function randArr(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
}

// full reset: new array, clear steps, redraw blank bars
function fullReset() {
  running = paused = false;
  steps = []; stepIdx = 0;
  arr = algo === 'binary'
    ? randArr(16)               // fixed size for search visualization
    : randArr(+sizeSlider.value);
  renderBars(arr, {});
  setStatus('Press Run to begin');
  syncStepCount();
  resetBtns();
  highlightCode(null);
}

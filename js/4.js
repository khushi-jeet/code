// ============================================================
// 6. UI WIRING — event listeners for all interactive elements
// ============================================================

// called whenever user selects a different algorithm
function handleAlgoChange(selected) {
  if (!selected || (running && !paused)) return;

  algo = selected;

  // keep both dropdowns in sync (selecting sort clears search, and vice versa)
  document.getElementById('sortSelect').value   = ['bubble','insertion','quick'].includes(algo) ? algo : '';
  document.getElementById('searchSelect').value = algo === 'binary' ? algo : '';

  // update sidebar: title, description, complexity grid, legend
  const m = META[algo];
  document.getElementById('algoTitle').textContent = m.title;
  document.getElementById('algoDesc').textContent  = m.desc;
  document.getElementById('cxGrid').innerHTML = `
    <div class="cx-cell"><div class="cx-label">Best</div><div class="cx-val">${m.best}</div></div>
    <div class="cx-cell"><div class="cx-label">Average</div><div class="cx-val">${m.avg}</div></div>
    <div class="cx-cell"><div class="cx-label">Worst</div><div class="cx-val">${m.worst}</div></div>
    <div class="cx-cell"><div class="cx-label">Space</div><div class="cx-val">${m.space}</div></div>`;
  document.getElementById('legendList').innerHTML = m.legend.map(l => `
    <div class="legend-row">
      <div class="legend-swatch" style="background:${l.color}"></div>${l.label}
    </div>`).join('');

  // show target input only for binary search; hide size slider for search
  document.getElementById('targetCtrl').style.display = algo === 'binary' ? 'block' : 'none';
  document.getElementById('sizeCtrl').style.display   = algo === 'binary' ? 'none'  : 'block';

  // enable action buttons now that an algo is selected
  [runBtn, stepBtn, resetBtn, shuffleBtn].forEach(b => b.disabled = false);

  buildCodePanel(algo); // render C++ code for this algorithm
  fullReset();
}

// dropdown change listeners
document.getElementById('sortSelect').addEventListener('change',   e => handleAlgoChange(e.target.value));
document.getElementById('searchSelect').addEventListener('change', e => handleAlgoChange(e.target.value));

// array size slider
sizeSlider.addEventListener('input', () => {
  document.getElementById('sizeVal').textContent = sizeSlider.value;
  if (!running) fullReset();
});

// speed slider — just updates the label, speed is read live during runAll()
speedSlider.addEventListener('input', () => {
  document.getElementById('speedVal').textContent = SPEED_LABELS[speedSlider.value];
});

// custom array apply button
document.getElementById('applyCustom').addEventListener('click', () => {
  const vals = document.getElementById('customInput').value
    .split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n) && n > 0 && n <= 999);
  if (vals.length < 2) { setStatus('Enter at least 2 numbers', 'error'); return; }
  arr = vals;
  steps = []; stepIdx = 0;
  renderBars(arr, {});
  setStatus('Custom array set — press Run');
  syncStepCount();
});

// RUN — build all steps then start auto-play
runBtn.addEventListener('click', () => {
  if (!buildSteps()) return;
  renderBars(arr, {});
  setStatus('Running…', 'running');
  runAll();
});

// STEP FORWARD — advance one frame at a time
stepBtn.addEventListener('click', () => {
  if (!steps.length) {
    if (!buildSteps()) return;
    renderBars(arr, {});
  }
  if (stepIdx < steps.length) applyStep(steps[stepIdx++]);
  stepBackBtn.disabled = stepIdx <= 0;
  if (stepIdx >= steps.length) {
    statusDot.className = 'status-dot done';
    stepBtn.disabled = true;
  }
  syncStepCount();
});

// STEP BACK — go to previous frame
stepBackBtn.addEventListener('click', () => {
  if (!steps.length || stepIdx <= 0) return;
  stepIdx--;
  if (stepIdx === 0) {
    renderBars(arr, {});
    setStatus('Press Run to begin');
    statusDot.className = 'status-dot';
    stepBackBtn.disabled = true;
  } else {
    applyStep(steps[stepIdx - 1]);
  }
  stepBtn.disabled = false;
  syncStepCount();
});

// PAUSE / RESUME
pauseBtn.addEventListener('click', () => {
  if (!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  setStatus(paused ? 'Paused' : 'Running…', paused ? 'idle' : 'running');
});

// RESET & SHUFFLE — both just do a full reset (new random array)
resetBtn.addEventListener('click',   fullReset);
shuffleBtn.addEventListener('click', fullReset);

// re-render on window resize so bar proportions stay correct
new ResizeObserver(() => {
  if (!arr.length) return;
  const last = steps[stepIdx - 1];
  last ? applyStep(last) : renderBars(arr, {});
}).observe(document.getElementById('vizCanvas'));


// ============================================================
// 7. CODE PANEL — build C++ lines and handle line highlighting
// ============================================================

// render the C++ code lines into the panel for the given algo
function buildCodePanel(a) {
  const lines = CPP_CODE[a];
  if (!lines) return;
  const body = document.getElementById('codeBody');
  body.innerHTML = '';
  lines.forEach(([id, text], i) => {
    const row = document.createElement('div');
    row.className = 'code-line';
    row.dataset.lineId = id || ''; // used by highlightCode() to find the right row
    row.innerHTML = `<span class="lno">${i+1}</span><span class="code-text">${text}</span>`;
    body.appendChild(row);
  });
}

// map a step's hl object to a lineId string for code highlighting
function getLineId(step) {
  const hl = step.hl || {};
  if (hl.found     && hl.found.length)     return 'found';
  if (hl.sorted    && hl.sorted.length)    return 'sorted';
  if (hl.swapping  && hl.swapping.length)  return 'swapping';
  if (hl.pivot     !== undefined)          return 'pivot';
  if (hl.mid       !== undefined)          return 'mid';
  if (hl.elim      && hl.elim.length)      return 'elim';
  if (hl.comparing && hl.comparing.length) return 'comparing';
  return null;
}

// highlight the first code line whose lineId matches, clear all others
function highlightCode(lineId) {
  let hit = false;
  document.querySelectorAll('#codeBody .code-line').forEach(row => {
    const match = lineId && row.dataset.lineId === lineId && !hit;
    row.classList.toggle('active', match);
    if (match) {
      hit = true;
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

// --- init labels on page load ---
document.getElementById('speedVal').textContent = SPEED_LABELS[speedSlider.value];
document.getElementById('sizeVal').textContent  = sizeSlider.value;

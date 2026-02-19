/ ============================================================
// 2. CPP_CODE — [lineId, displayText] pairs per algorithm
//    lineId maps to highlight states so the active line
//    lights up in sync with the visualization
//    null = no highlight for that line
// ============================================================
const CPP_CODE = {
  bubble: [
    [null,        `<span class="kw">void</span> <span class="fn">bubbleSort</span>(<span class="kw">int</span> arr[], <span class="kw">int</span> n) {`],
    [null,        `    <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">0</span>; i < n-<span class="nm">1</span>; i++) {`],
    ['comparing', `        <span class="kw">for</span> (<span class="kw">int</span> j = <span class="nm">0</span>; j < n-i-<span class="nm">1</span>; j++) {`],
    ['comparing', `            <span class="kw">if</span> (arr[j] > arr[j+<span class="nm">1</span>]) {`],
    ['swapping',  `                swap(arr[j], arr[j+<span class="nm">1</span>]);`],
    [null,        `            }`],
    [null,        `        }`],
    ['sorted',    `        <span class="cm">// largest element bubbled to end</span>`],
    [null,        `    }`],
    [null,        `}`],
  ],
  insertion: [
    [null,        `<span class="kw">void</span> <span class="fn">insertionSort</span>(<span class="kw">int</span> arr[], <span class="kw">int</span> n) {`],
    [null,        `    <span class="kw">for</span> (<span class="kw">int</span> i = <span class="nm">1</span>; i < n; i++) {`],
    ['pivot',     `        <span class="kw">int</span> key = arr[i]; <span class="cm">// element to insert</span>`],
    [null,        `        <span class="kw">int</span> j = i - <span class="nm">1</span>;`],
    ['comparing', `        <span class="kw">while</span> (j >= <span class="nm">0</span> && arr[j] > key) {`],
    ['comparing', `            arr[j+<span class="nm">1</span>] = arr[j]; <span class="cm">// shift right</span>`],
    ['comparing', `            j--;`],
    [null,        `        }`],
    ['sorted',    `        arr[j+<span class="nm">1</span>] = key; <span class="cm">// place key in gap</span>`],
    [null,        `    }`],
    [null,        `}`],
  ],
  quick: [
    [null,        `<span class="kw">int</span> <span class="fn">partition</span>(<span class="kw">int</span> A[], <span class="kw">int</span> lo, <span class="kw">int</span> hi) {`],
    ['pivot',     `    <span class="kw">int</span> pivot = A[hi]; <span class="cm">// choose last as pivot</span>`],
    [null,        `    <span class="kw">int</span> i = lo - <span class="nm">1</span>;`],
    ['comparing', `    <span class="kw">for</span> (<span class="kw">int</span> j = lo; j < hi; j++) {`],
    ['comparing', `        <span class="kw">if</span> (A[j] <= pivot) {`],
    ['swapping',  `            swap(A[++i], A[j]);`],
    [null,        `        }`],
    [null,        `    }`],
    ['sorted',    `    swap(A[i+<span class="nm">1</span>], A[hi]); <span class="cm">// pivot → final pos</span>`],
    [null,        `    <span class="kw">return</span> i + <span class="nm">1</span>;`],
    [null,        `}`],
    [null,        `<span class="kw">void</span> <span class="fn">quickSort</span>(<span class="kw">int</span> A[], <span class="kw">int</span> lo, <span class="kw">int</span> hi) {`],
    [null,        `    <span class="kw">if</span> (lo >= hi) <span class="kw">return</span>;`],
    [null,        `    <span class="kw">int</span> p = <span class="fn">partition</span>(A, lo, hi);`],
    [null,        `    <span class="fn">quickSort</span>(A, lo, p-<span class="nm">1</span>);`],
    [null,        `    <span class="fn">quickSort</span>(A, p+<span class="nm">1</span>, hi);`],
    [null,        `}`],
  ],
  binary: [
    [null,        `<span class="kw">int</span> <span class="fn">binarySearch</span>(<span class="kw">int</span> arr[], <span class="kw">int</span> n, <span class="kw">int</span> target) {`],
    [null,        `    <span class="cm">// array must be sorted!</span>`],
    [null,        `    <span class="kw">int</span> L = <span class="nm">0</span>, R = n - <span class="nm">1</span>;`],
    ['comparing', `    <span class="kw">while</span> (L <= R) {`],
    ['mid',       `        <span class="kw">int</span> mid = (L + R) / <span class="nm">2</span>;`],
    ['found',     `        <span class="kw">if</span> (arr[mid] == target)`],
    ['found',     `            <span class="kw">return</span> mid; <span class="cm">// found!</span>`],
    ['comparing', `        <span class="kw">if</span> (arr[mid] < target)`],
    ['comparing', `            L = mid + <span class="nm">1</span>; <span class="cm">// discard left half</span>`],
    ['elim',      `        <span class="kw">else</span>`],
    ['elim',      `            R = mid - <span class="nm">1</span>; <span class="cm">// discard right half</span>`],
    [null,        `    }`],
    [null,        `    <span class="kw">return</span> -<span class="nm">1</span>; <span class="cm">// not found</span>`],
    [null,        `}`],
  ],
};


// ============================================================
// 3. GENERATORS — each is a JS generator function (function*)
//    yield {arr, hl, msg} produces one visual frame at a time
//
//    hl (highlight) object keys:
//      comparing: [i, j]  — indices being compared (orange)
//      swapping:  [i, j]  — indices being swapped  (red)
//      sorted:    [i, ...]— finalized indices       (green)
//      pivot:     i       — single pivot index      (purple)
//      found:     [i]     — target found            (green)
//      elim:      [i, ...]— eliminated indices      (dark/muted)
//      mid:       i       — mid pointer             (purple)
// ============================================================

// ---- BUBBLE SORT ----
function* bubbleGen(input) {
  const a = [...input];       // work on a copy, never mutate original
  const n = a.length;
  const sorted = [];          // tracks indices that are in final position

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      // frame: show the two bars being compared
      yield { arr: [...a], hl: { comparing: [j, j+1], sorted: [...sorted] }, msg: `Compare ${a[j]} ↔ ${a[j+1]}` };

      if (a[j] > a[j+1]) {
        // frame: highlight as swapping before we swap
        yield { arr: [...a], hl: { swapping: [j, j+1], sorted: [...sorted] }, msg: `Swap ${a[j]} and ${a[j+1]}` };
        [a[j], a[j+1]] = [a[j+1], a[j]];
        swapped = true;
      }
    }

    // the last unsorted element is now in its final position
    sorted.unshift(n - 1 - i);
    yield { arr: [...a], hl: { sorted: [...sorted] }, msg: `Pass ${i+1} complete — ${a[n-1-i]} is in final position` };

    if (!swapped) break; // early exit: already sorted (best case O(n))
  }

  yield { arr: [...a], hl: { sorted: [...Array(n).keys()] }, msg: 'Sorted ✓' };
}

// ---- INSERTION SORT ----
function* insertionGen(input) {
  const a = [...input];
  const n = a.length;
  const sorted = [0]; // index 0 is trivially sorted

  yield { arr: [...a], hl: { sorted: [0] }, msg: 'First element is trivially sorted' };

  for (let i = 1; i < n; i++) {
    const key = a[i];

    // frame: highlight the element we're about to insert
    yield { arr: [...a], hl: { pivot: i, sorted: [...sorted] }, msg: `Insert ${key} into sorted prefix` };

    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      // frame: show the shift happening
      yield { arr: [...a], hl: { comparing: [j, j+1], sorted: sorted.filter(x => x < j) }, msg: `${a[j]} > ${key} — shift right` };
      a[j+1] = a[j];
      j--;
    }

    a[j+1] = key;
    sorted.push(i);
    sorted.sort((x, y) => x - y);
    yield { arr: [...a], hl: { sorted: [...sorted] }, msg: `${key} inserted at index ${j+1}` };
  }

  yield { arr: [...a], hl: { sorted: [...Array(n).keys()] }, msg: 'Sorted ✓' };
}

// ---- QUICK SORT ----
function* quickGen(input) {
  const a = [...input];
  const frames = [];            // collect all frames first, then yield them
  const globalSorted = new Set();

  // recursive helper — pushes frames into the array above
  function qs(arr, lo, hi) {
    if (lo >= hi) {
      if (lo >= 0 && lo < arr.length) globalSorted.add(lo);
      return;
    }

    const pivot = arr[hi];
    frames.push({ arr: [...arr], hl: { pivot: hi, sorted: [...globalSorted] }, msg: `Pivot: ${pivot} at index ${hi}` });

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      frames.push({ arr: [...arr], hl: { comparing: [j, hi], pivot: hi, sorted: [...globalSorted] }, msg: `Compare ${arr[j]} with pivot ${pivot}` });
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          frames.push({ arr: [...arr], hl: { swapping: [i, j], pivot: hi, sorted: [...globalSorted] }, msg: `Swap ${arr[i]} ↔ ${arr[j]}` });
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
    }

    [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];
    globalSorted.add(i+1);
    frames.push({ arr: [...arr], hl: { sorted: [...globalSorted], pivot: i+1 }, msg: `Pivot ${arr[i+1]} placed at final position (index ${i+1})` });

    qs(arr, lo, i);
    qs(arr, i+2, hi);
  }

  qs(a, 0, a.length - 1);
  yield* frames; // yield all collected frames
  yield { arr: [...a], hl: { sorted: [...Array(a.length).keys()] }, msg: 'Sorted ✓' };
}

// ---- BINARY SEARCH ----
// array is auto-sorted before the search begins
function* binaryGen(input, target) {
  const a = [...input].sort((x, y) => x - y); // binary search requires sorted array
  let L = 0, R = a.length - 1;
  const elim = new Set(); // tracks eliminated indices

  yield { arr: [...a], hl: { comparing: [...Array(a.length).keys()] }, msg: `Binary search for ${target} (array auto-sorted)` };

  while (L <= R) {
    const M = Math.floor((L + R) / 2);

    // frame: show current search window and mid pointer
    yield { arr: [...a], hl: { comparing: range(L, R), mid: M, elim: [...elim] }, msg: `L=${L} R=${R} → Mid=${M}, checking ${a[M]}` };

    if (a[M] === target) {
      yield { arr: [...a], hl: { found: [M], elim: [...elim] }, msg: `Found ${target} at index ${M} ✓` };
      return;
    } else if (a[M] < target) {
      // eliminate left half including mid
      for (let i = L; i <= M; i++) elim.add(i);
      yield { arr: [...a], hl: { comparing: range(M+1, R), elim: [...elim] }, msg: `${a[M]} < ${target} — discard left half` };
      L = M + 1;
    } else {
      // eliminate right half including mid
      for (let i = M; i <= R; i++) elim.add(i);
      yield { arr: [...a], hl: { comparing: range(L, M-1), elim: [...elim] }, msg: `${a[M]} > ${target} — discard right half` };
      R = M - 1;
    }
  }

  yield { arr: [...a], hl: { elim: [...elim] }, msg: `${target} not found in array` };
}

// helper: returns array [lo, lo+1, ..., hi]
function range(lo, hi) {
  const out = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

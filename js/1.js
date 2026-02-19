// ============================================================
// script.js — DSA Visualizer
// Structure:
//   1. META         — algorithm info (title, description, complexity, legend)
//   2. CPP_CODE     — C++ code lines for each algorithm
//   3. GENERATORS   — step-by-step algorithm logic (yield each visual frame)
//   4. RENDER       — draw bars to canvas
//   5. ENGINE       — run/step/pause/reset logic
//   6. UI WIRING    — connect buttons and dropdowns to functions
//   7. CODE PANEL   — build + highlight C++ code panel
// ============================================================


// ============================================================
// 1. META — add a new entry here when you add a new algorithm
//    keys must match the <option value="..."> in index.html
// ============================================================
const META = {
  bubble: {
    title: 'Bubble Sort',
    desc: 'Repeatedly compares adjacent elements and swaps them if out of order. Each pass bubbles the largest unsorted element to its final position.',
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
    legend: [
      { color: 'var(--c-default)',   label: 'Unsorted' },
      { color: 'var(--c-comparing)', label: 'Comparing' },
      { color: 'var(--c-swapping)',  label: 'Swapping' },
      { color: 'var(--c-sorted)',    label: 'Sorted' },
    ]
  },
  insertion: {
    title: 'Insertion Sort',
    desc: 'Builds a sorted array one element at a time by inserting each new element into its correct position within the already-sorted prefix.',
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
    legend: [
      { color: 'var(--c-default)',   label: 'Unsorted' },
      { color: 'var(--c-pivot)',     label: 'Key Element' },
      { color: 'var(--c-comparing)', label: 'Comparing' },
      { color: 'var(--c-sorted)',    label: 'Sorted' },
    ]
  },
  quick: {
    title: 'Quick Sort',
    desc: 'Picks a pivot, partitions the array so smaller elements go left and larger go right, then recursively sorts each side.',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)',
    legend: [
      { color: 'var(--c-default)',   label: 'Unsorted' },
      { color: 'var(--c-pivot)',     label: 'Pivot' },
      { color: 'var(--c-comparing)', label: 'Comparing' },
      { color: 'var(--c-swapping)',  label: 'Swapping' },
      { color: 'var(--c-sorted)',    label: 'Sorted' },
    ]
  },
  binary: {
    title: 'Binary Search',
    desc: 'Finds a target in a sorted array by repeatedly halving the search space. Compares the target with the midpoint and discards the irrelevant half.',
    best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)',
    legend: [
      { color: 'var(--c-comparing)', label: 'Search Range' },
      { color: 'var(--c-mid)',       label: 'Mid (checking)' },
      { color: 'var(--c-found)',     label: 'Found' },
      { color: 'var(--c-elim)',      label: 'Eliminated' },
    ]
  },
};

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CircleHelp, Clock3, Code2, FastForward, GitBranch, Pause, Play, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Badge, Button, SectionLabel } from '../../components/ui/primitives';
import type { AlgorithmStep } from '../../types';

type AlgorithmName = 'Bubble sort' | 'Selection sort' | 'Insertion sort' | 'Merge sort' | 'Quicksort' | 'Heap sort';

const algorithms: Record<AlgorithmName, { complexity: string; space: string; color: string }> = {
  'Bubble sort': { complexity: 'O(n²)', space: 'O(1)', color: '#f59e0b' },
  'Selection sort': { complexity: 'O(n²)', space: 'O(1)', color: '#f97316' },
  'Insertion sort': { complexity: 'O(n²)', space: 'O(1)', color: '#eab308' },
  'Merge sort': { complexity: 'O(n log n)', space: 'O(n)', color: '#10b981' },
  Quicksort: { complexity: 'O(n log n)', space: 'O(log n)', color: '#14b8a6' },
  'Heap sort': { complexity: 'O(n log n)', space: 'O(1)', color: '#06b6d4' },
};

function makeSteps(input: number[], algorithm: AlgorithmName): AlgorithmStep[] {
  const values = [...input];
  const steps: AlgorithmStep[] = [{ values: [...values], active: [], sorted: [], message: `Ready to start ${algorithm.toLowerCase()}.` }];
  const push = (active: number[], sorted: number[], message: string) => steps.push({ values: [...values], active, sorted, message });
  if (algorithm === 'Bubble sort') {
    const sorted: number[] = [];
    for (let end = values.length - 1; end > 0; end -= 1) {
      for (let index = 0; index < end; index += 1) {
        push([index, index + 1], sorted, `Compare ${values[index]} and ${values[index + 1]}.`);
        if (values[index] > values[index + 1]) { [values[index], values[index + 1]] = [values[index + 1], values[index]]; push([index, index + 1], sorted, `Swap them so ${values[index + 1]} moves toward the end.`); }
      }
      sorted.unshift(end); push([], sorted, `${values[end]} is in its final position.`);
    }
    sorted.unshift(0); push([], sorted, 'Array sorted. Every value is in the right place.');
  } else if (algorithm === 'Selection sort') {
    const sorted: number[] = [];
    for (let start = 0; start < values.length; start += 1) {
      let minimum = start;
      for (let index = start + 1; index < values.length; index += 1) { push([minimum, index], sorted, `Look for the smallest value from position ${start}.`); if (values[index] < values[minimum]) minimum = index; }
      if (minimum !== start) { [values[start], values[minimum]] = [values[minimum], values[start]]; push([start, minimum], sorted, `Move ${values[start]} into position ${start}.`); }
      sorted.push(start); push([], sorted, `${values[start]} is selected and locked.`);
    }
  } else if (algorithm === 'Insertion sort') {
    const sorted: number[] = [0];
    for (let index = 1; index < values.length; index += 1) {
      let cursor = index;
      while (cursor > 0) { push([cursor - 1, cursor], sorted, `Compare the new value with the sorted left side.`); if (values[cursor - 1] <= values[cursor]) break; [values[cursor - 1], values[cursor]] = [values[cursor], values[cursor - 1]]; push([cursor - 1, cursor], sorted, 'Shift the larger value one place right.'); cursor -= 1; }
      sorted.push(index); push([], sorted, `The first ${index + 1} values are sorted.`);
    }
  } else if (algorithm === 'Merge sort') {
    const sorted: number[] = [];
    const merge = (left: number, middle: number, right: number) => {
      const leftValues = values.slice(left, middle + 1); const rightValues = values.slice(middle + 1, right + 1); let a = 0; let b = 0; let cursor = left;
      while (a < leftValues.length && b < rightValues.length) { push([cursor, middle + 1 + b], sorted, 'Compare the heads of the two sorted halves.'); values[cursor] = leftValues[a] <= rightValues[b] ? leftValues[a++] : rightValues[b++]; push([cursor], sorted, `Write ${values[cursor]} back into the merged range.`); cursor += 1; }
      while (a < leftValues.length) { values[cursor] = leftValues[a++]; push([cursor], sorted, 'Copy the remaining left-side value.'); cursor += 1; }
      while (b < rightValues.length) { values[cursor] = rightValues[b++]; push([cursor], sorted, 'Copy the remaining right-side value.'); cursor += 1; }
    };
    const split = (left: number, right: number) => { if (left >= right) return; const middle = Math.floor((left + right) / 2); split(left, middle); split(middle + 1, right); merge(left, middle, right); for (let index = left; index <= right; index += 1) if (!sorted.includes(index)) sorted.push(index); };
    split(0, values.length - 1); push([], values.map((_, index) => index), 'Merge sort finished by combining ordered halves.');
  } else if (algorithm === 'Quicksort') {
    const sorted: number[] = [];
    const partition = (low: number, high: number): number => { const pivot = values[high]; let cursor = low; for (let index = low; index < high; index += 1) { push([index, high], sorted, `Compare ${values[index]} with pivot ${pivot}.`); if (values[index] < pivot) { [values[cursor], values[index]] = [values[index], values[cursor]]; push([cursor, index], sorted, 'Move the smaller value to the left partition.'); cursor += 1; } } [values[cursor], values[high]] = [values[high], values[cursor]]; sorted.push(cursor); push([cursor], sorted, `Pivot ${pivot} is now in its final position.`); return cursor; };
    const sort = (low: number, high: number) => { if (low >= high) return; const pivot = partition(low, high); sort(low, pivot - 1); sort(pivot + 1, high); };
    sort(0, values.length - 1); push([], values.map((_, index) => index), 'Quicksort finished by partitioning around pivots.');
  } else {
    const sorted: number[] = [];
    const heapify = (length: number, root: number) => { let largest = root; const left = root * 2 + 1; const right = root * 2 + 2; if (left < length) { push([root, left], sorted, 'Compare the root with its left child.'); if (values[left] > values[largest]) largest = left; } if (right < length) { push([largest, right], sorted, 'Compare the current maximum with its right child.'); if (values[right] > values[largest]) largest = right; } if (largest !== root) { [values[root], values[largest]] = [values[largest], values[root]]; push([root, largest], sorted, 'Swap the larger child into the heap root.'); heapify(length, largest); } };
    for (let index = Math.floor(values.length / 2) - 1; index >= 0; index -= 1) heapify(values.length, index);
    for (let end = values.length - 1; end > 0; end -= 1) { [values[0], values[end]] = [values[end], values[0]]; sorted.unshift(end); push([0, end], sorted, `${values[end]} is extracted to its final position.`); heapify(end, 0); }
    sorted.unshift(0); push([], sorted, 'Heap sort finished by repeatedly extracting the maximum.');
  }
  return steps;
}

function parseInput(input: string) { return input.split(',').map((value) => Number(value.trim())).filter((value) => Number.isFinite(value)).slice(0, 12); }

export function AlgorithmLabPage() {
  const navigate = useNavigate();
  const [algorithm, setAlgorithm] = useState<AlgorithmName>('Bubble sort');
  const [input, setInput] = useState('9, 3, 7, 4, 2, 8, 1');
  const [steps, setSteps] = useState(() => makeSteps(parseInput('9, 3, 7, 4, 2, 8, 1'), 'Bubble sort'));
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [notes, setNotes] = useState<Record<number, string>>(() => { try { return JSON.parse(localStorage.getItem('codrawithm-algorithm-notes') ?? '{}') as Record<number, string>; } catch { return {}; } });
  const [copied, setCopied] = useState(false);
  const current = steps[stepIndex];
  const details = algorithms[algorithm];
  const applyArray = () => { const values = parseInput(input); if (values.length > 1) { setSteps(makeSteps(values, algorithm)); setStepIndex(0); } };
  useEffect(() => { setSteps(makeSteps(parseInput(input), algorithm)); setStepIndex(0); }, [algorithm]);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setStepIndex((index) => { if (index >= steps.length - 1) { setPlaying(false); return index; } return index + 1; }), 900 / speed); return () => window.clearInterval(timer); }, [playing, speed, steps.length]);
  const bars = useMemo(() => current.values.map((value, index) => ({ value, index, height: `${Math.max(22, value * 9)}px`, active: current.active.includes(index), sorted: current.sorted.includes(index) })), [current]);
  const updateNote = (value: string) => setNotes((existing) => ({ ...existing, [stepIndex]: value }));
  const saveNote = () => { localStorage.setItem('codrawithm-algorithm-notes', JSON.stringify(notes)); };
  const shareStep = () => { navigator.clipboard?.writeText(`${window.location.origin}/algorithm?algorithm=${encodeURIComponent(algorithm)}&input=${encodeURIComponent(input)}&step=${stepIndex}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <main className="algorithm-shell"><header className="algorithm-topbar"><button className="icon-button" aria-label="Back to dashboard" onClick={() => navigate({ to: '/' })}><ArrowLeft size={17} /></button><div className="algorithm-title"><span className="workspace-icon workspace-icon-amber">↗</span><div><span className="eyebrow">Algorithm Lab</span><strong>Sorting algorithms</strong></div></div><div className="algorithm-top-actions"><Badge tone="warning">Local prototype</Badge><Button variant="outline" size="sm" onClick={shareStep}><Share2 size={15} /> {copied ? 'Copied' : 'Share step'}</Button><span className="avatar avatar-indigo">AK</span></div></header><div className="algorithm-content"><aside className="algorithm-sidebar"><SectionLabel>Workspace</SectionLabel><button className="algorithm-nav-item is-active"><GitBranch size={15} /> Sorting</button><button className="algorithm-nav-item"><CircleHelp size={15} /> Graphs <span>soon</span></button><button className="algorithm-nav-item"><Code2 size={15} /> Trees <span>soon</span></button><div className="algorithm-sidebar-bottom"><Sparkles size={15} /><span><strong>Annotate as you learn</strong><small>Notes are stored with each step.</small></span></div></aside><section className="algorithm-main"><div className="algorithm-heading-row"><div><span className="eyebrow"><span className="eyebrow-dot eyebrow-dot-amber" /> Visual playground</span><h1>See the algorithm think.</h1><p>Trace comparisons, swaps, and final positions one step at a time.</p></div><button className="reset-button" onClick={() => { setSteps(makeSteps(parseInput(input), algorithm)); setStepIndex(0); }}><RotateCcw size={14} /> Reset</button></div><div className="algorithm-card input-card"><div className="card-heading"><div><SectionLabel>01 / Choose the algorithm</SectionLabel><h2>What should we visualize?</h2></div><select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as AlgorithmName)} aria-label="Select sorting algorithm">{Object.keys(algorithms).map((name) => <option key={name}>{name}</option>)}</select></div><div className="algorithm-input-row"><label><span>Input array</span><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyArray(); }} /><small>Comma-separated integers · press Enter to apply</small></label><Button variant="soft" onClick={applyArray}>Apply array</Button></div></div><div className="algorithm-card visualization-card"><div className="card-heading"><div><SectionLabel>02 / Walk the steps</SectionLabel><h2>{algorithm}</h2></div><Badge tone="success"><span className="live-dot" /> Ready</Badge></div><div className="bar-chart">{bars.map((bar) => <div className="bar-column" key={`${bar.index}-${bar.value}`}><span className={`bar-value ${bar.active ? 'is-active' : ''} ${bar.sorted ? 'is-sorted' : ''}`} style={{ height: bar.height, background: bar.active ? details.color : bar.sorted ? '#34d399' : '#c7d2fe' }}>{bar.value}</span><small>{bar.index}</small></div>)}</div><div className="step-message"><span className="step-counter">Step {String(stepIndex + 1).padStart(2, '0')} <span>/ {String(steps.length).padStart(2, '0')}</span></span><p>{current.message}</p></div><div className="playback-row"><button className="round-control" aria-label="Previous step" onClick={() => setStepIndex((index) => Math.max(0, index - 1))}><ChevronLeft size={18} /></button><Button onClick={() => setPlaying((value) => !value)}>{playing ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play steps</>}</Button><button className="round-control" aria-label="Next step" onClick={() => setStepIndex((index) => Math.min(steps.length - 1, index + 1))}><ChevronRight size={18} /></button><div className="speed-control"><FastForward size={14} /><span>Speed</span><input type="range" min="0.5" max="3" step="0.5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /><strong>{speed}×</strong></div></div></div><div className="algorithm-bottom-grid"><div className="algorithm-card complexity-card"><SectionLabel>Complexity</SectionLabel><div className="complexity-values"><div><span>Time</span><strong>{details.complexity}</strong></div><div><span>Space</span><strong>{details.space}</strong></div><div><span>Steps</span><strong>{steps.length}</strong></div></div><div className="complexity-note"><Clock3 size={14} /> Best for learning the mechanics, not benchmarking.</div></div><div className="algorithm-card note-card"><div className="note-heading"><SectionLabel>Step note</SectionLabel><span className="mono-text">Saved locally</span></div><textarea placeholder="What do you notice at this step?" value={notes[stepIndex] ?? ''} onChange={(event) => updateNote(event.target.value)} /><div className="note-footer"><span>{(notes[stepIndex] ?? '').length}/240</span><Button variant="soft" size="sm" onClick={saveNote}>Save note</Button></div></div></div></section></div></main>;
}

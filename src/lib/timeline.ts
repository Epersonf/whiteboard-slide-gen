import type { Slide } from '../types';

export type TimelineMark = { slideIndex: number; holdStart: number; holdEnd: number };
export type Timeline = { marks: TimelineMark[]; totalMs: number };

/**
 * Cada slide tem um período de "aparecer sozinho" (hold) e compartilha uma
 * janela de transição com o vizinho, onde os dois se sobrepõem em crossfade.
 * O primeiro slide nasce de um fade-in solitário; o último termina num
 * fade-out solitário.
 */
export function buildTimeline(slides: Slide[], transitionMs: number): Timeline {
  const marks: TimelineMark[] = [];
  let cursor = transitionMs; // fade-in inicial do slide 0
  for (let i = 0; i < slides.length; i++) {
    if (i > 0) cursor += transitionMs; // crossfade compartilhado com o slide anterior
    const holdStart = cursor;
    const holdEnd = holdStart + slides[i].duration * 1000;
    marks.push({ slideIndex: i, holdStart, holdEnd });
    cursor = holdEnd;
  }
  const totalMs = slides.length === 0 ? 0 : cursor + transitionMs; // fade-out final
  return { marks, totalMs };
}

export type FrameState =
  | { kind: 'empty' }
  | { kind: 'solo'; slideIndex: number; alpha: number }
  | { kind: 'cross'; fromIndex: number; toIndex: number; progress: number };

/** Resolve o que deve ser desenhado em um instante t (ms) da linha do tempo. */
export function resolveFrameAt(t: number, timeline: Timeline, transitionMs: number): FrameState {
  const { marks, totalMs } = timeline;
  if (marks.length === 0) return { kind: 'empty' };

  const first = marks[0];
  const last = marks[marks.length - 1];

  // fade-in inicial solitário
  if (t < first.holdStart) {
    const progress = transitionMs === 0 ? 1 : clamp01(t / transitionMs);
    return { kind: 'solo', slideIndex: first.slideIndex, alpha: progress };
  }

  // fade-out final solitário
  if (t >= last.holdEnd) {
    const progress = transitionMs === 0 ? 0 : clamp01((t - last.holdEnd) / transitionMs);
    if (t >= totalMs) return { kind: 'empty' };
    return { kind: 'solo', slideIndex: last.slideIndex, alpha: 1 - progress };
  }

  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i];
    if (t >= mark.holdStart && t < mark.holdEnd) {
      return { kind: 'solo', slideIndex: mark.slideIndex, alpha: 1 };
    }
    const next = marks[i + 1];
    if (next && t >= mark.holdEnd && t < next.holdStart) {
      const progress = transitionMs === 0 ? 1 : clamp01((t - mark.holdEnd) / transitionMs);
      return { kind: 'cross', fromIndex: mark.slideIndex, toIndex: next.slideIndex, progress };
    }
  }

  return { kind: 'empty' };
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export type Timeline = { holdStart: number; holdEnd: number; totalMs: number };

/**
 * Linha do tempo de um único quadro: fade-in solitário, hold estático pela
 * duração configurada, fade-out solitário. Sem crossfade entre slides —
 * só existe um quadro.
 */
export function buildTimeline(durationSeconds: number, transitionMs: number): Timeline {
  const holdStart = transitionMs;
  const holdEnd = holdStart + durationSeconds * 1000;
  return { holdStart, holdEnd, totalMs: holdEnd + transitionMs };
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Opacidade do quadro inteiro em um instante t (ms): fade-in, hold em 1, fade-out. */
export function resolveFrameAlphaAt(t: number, timeline: Timeline, transitionMs: number): number {
  const { holdStart, holdEnd, totalMs } = timeline;
  if (t < 0 || t >= totalMs) return 0;
  if (t < holdStart) return transitionMs === 0 ? 1 : clamp01(t / transitionMs);
  if (t < holdEnd) return 1;
  return transitionMs === 0 ? 0 : clamp01((totalMs - t) / transitionMs);
}

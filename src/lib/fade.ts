import { DEFAULT_FADE_MS, type ElementBase } from '../types';

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * Multiplicador de opacidade de um elemento em função do tempo decorrido
 * desde o início do "hold" (exibição estática) do slide — independente do
 * crossfade entre slides, que já é tratado em outro nível (buildTimeline).
 * Antes do hold começar ou depois dele acabar, o elemento já está
 * totalmente esmaecido se tiver fadeIn/fadeOut habilitado; senão fica em 1,
 * deixando o crossfade do slide cuidar sozinho da entrada/saída.
 */
export function computeElementFadeAlpha(element: ElementBase, msSinceHoldStart: number, holdDurationMs: number): number {
  const fadeMs = Math.max(0, element.fadeMs ?? DEFAULT_FADE_MS);
  let alpha = 1;

  if (element.fadeIn) {
    alpha = Math.min(alpha, fadeMs === 0 ? (msSinceHoldStart >= 0 ? 1 : 0) : clamp01(msSinceHoldStart / fadeMs));
  }
  if (element.fadeOut) {
    const msUntilHoldEnd = holdDurationMs - msSinceHoldStart;
    alpha = Math.min(alpha, fadeMs === 0 ? (msUntilHoldEnd >= 0 ? 1 : 0) : clamp01(msUntilHoldEnd / fadeMs));
  }
  return alpha;
}

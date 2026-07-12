import { makeAutoObservable } from 'mobx';

/**
 * Estado de reprodução (índice do slide atual, se está tocando, progresso do
 * fade). É efêmero — existe só enquanto o preview está tocando — por isso
 * vive numa instância local (useState) dentro de <StageColumn>, nunca no
 * ProjectStore: misturar os dois faria o dado do projeto "piscar" a cada
 * frame de reprodução.
 */
export class PlaybackStore {
  currentIndex = 0;
  isPlaying = false;
  /** 'in' | 'hold' | 'out' — fase visual do slide atual durante o play. */
  phase: 'in' | 'hold' | 'out' = 'hold';

  constructor() {
    makeAutoObservable(this);
  }

  play(totalSlides: number) {
    if (totalSlides === 0) return;
    if (this.currentIndex >= totalSlides) this.currentIndex = 0;
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
    this.phase = 'hold';
  }

  setIndex(index: number) {
    this.currentIndex = index;
  }

  setPhase(phase: 'in' | 'hold' | 'out') {
    this.phase = phase;
  }

  reset() {
    this.currentIndex = 0;
    this.isPlaying = false;
    this.phase = 'hold';
  }
}

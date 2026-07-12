import { makeAutoObservable } from 'mobx';
import type { Project, ProjectSettings, Slide } from '../types';

function defaultSettings(): ProjectSettings {
  return {
    background: '#f5f1e8',
    textColor: '#1a1a1a',
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 56,
    duration: 4,
    transitionMs: 700,
    canvasWidth: 1920,
    canvasHeight: 1080,
    fps: 30,
    exportFormat: 'mp4',
  };
}

/**
 * Dono do estado do projeto (settings + slides). Substitui o par
 * useReducer+Context da especificação original por observables MobX —
 * mesmas transições de estado, expostas como métodos de ação.
 */
export class ProjectStore {
  id: string = crypto.randomUUID();
  name: string = 'Projeto sem título';
  settings: ProjectSettings = defaultSettings();
  slides: Slide[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get project(): Project {
    return { id: this.id, name: this.name, settings: this.settings, slides: this.slides };
  }

  setName(name: string) {
    this.name = name;
  }

  addSlide(slide: Slide) {
    this.slides.push(slide);
  }

  removeSlide(id: string) {
    this.slides = this.slides.filter((s) => s.id !== id);
  }

  duplicateSlide(id: string) {
    const idx = this.slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const copy: Slide = { ...this.slides[idx], id: crypto.randomUUID() };
    this.slides.splice(idx + 1, 0, copy);
  }

  moveSlide(id: string, direction: -1 | 1) {
    const idx = this.slides.findIndex((s) => s.id === id);
    const next = idx + direction;
    if (idx === -1 || next < 0 || next >= this.slides.length) return;
    const slides = [...this.slides];
    [slides[idx], slides[next]] = [slides[next], slides[idx]];
    this.slides = slides;
  }

  reorderSlide(fromIndex: number, toIndex: number) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.slides.length ||
      toIndex >= this.slides.length
    ) {
      return;
    }
    const slides = [...this.slides];
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, moved);
    this.slides = slides;
  }

  updateSlide(id: string, patch: Partial<Slide>) {
    this.slides = this.slides.map((s) => (s.id === id ? ({ ...s, ...patch } as Slide) : s));
  }

  appendSlides(slides: Slide[]) {
    this.slides.push(...slides);
  }

  updateSettings(patch: Partial<ProjectSettings>) {
    this.settings = { ...this.settings, ...patch };
  }

  newTextSlide(): Slide {
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'Novo slide',
      duration: this.settings.duration,
    };
  }

  newImageSlide(src: string): Slide {
    return {
      id: crypto.randomUUID(),
      type: 'image',
      src,
      duration: this.settings.duration,
    };
  }
}

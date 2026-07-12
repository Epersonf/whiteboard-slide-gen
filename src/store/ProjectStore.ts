import { makeAutoObservable } from 'mobx';
import type { ImageElement, Project, ProjectSettings, Slide, SlideElement, TextElement } from '../types';

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

/** Deixa cada elemento novo ligeiramente deslocado dos anteriores, pra não nascer 100% sobreposto. */
function cascadeOffset(existingCount: number): number {
  return Math.min(existingCount * 4, 60);
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
    const copy: Slide = {
      ...this.slides[idx],
      id: crypto.randomUUID(),
      elements: this.slides[idx].elements.map((el) => ({ ...el, id: crypto.randomUUID() })),
    };
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
    this.slides = this.slides.map((s) => (s.id === id ? { ...s, ...patch } : s));
  }

  appendSlides(slides: Slide[]) {
    this.slides.push(...slides);
  }

  updateSettings(patch: Partial<ProjectSettings>) {
    this.settings = { ...this.settings, ...patch };
  }

  /** Substitui o projeto inteiro (tema + slides) — usado ao importar um .json. */
  loadProject(project: Project) {
    this.id = project.id;
    this.name = project.name;
    this.settings = project.settings;
    this.slides = project.slides;
  }

  // --- Elementos (texto/imagem) dentro de um slide ---

  addElement(slideId: string, element: SlideElement) {
    const slide = this.slides.find((s) => s.id === slideId);
    if (!slide) return;
    slide.elements.push(element);
  }

  updateElement(slideId: string, elementId: string, patch: Partial<SlideElement>) {
    const slide = this.slides.find((s) => s.id === slideId);
    if (!slide) return;
    slide.elements = slide.elements.map((el) => (el.id === elementId ? ({ ...el, ...patch } as SlideElement) : el));
  }

  removeElement(slideId: string, elementId: string) {
    const slide = this.slides.find((s) => s.id === slideId);
    if (!slide) return;
    slide.elements = slide.elements.filter((el) => el.id !== elementId);
  }

  duplicateElement(slideId: string, elementId: string) {
    const slide = this.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const el = slide.elements.find((e) => e.id === elementId);
    if (!el) return;
    const maxZ = Math.max(0, ...slide.elements.map((e) => e.z));
    slide.elements.push({ ...el, id: crypto.randomUUID(), x: Math.min(el.x + 4, 90), y: Math.min(el.y + 4, 90), z: maxZ + 1 });
  }

  bringToFront(slideId: string, elementId: string) {
    const slide = this.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const maxZ = Math.max(0, ...slide.elements.map((e) => e.z));
    this.updateElement(slideId, elementId, { z: maxZ + 1 });
  }

  sendToBack(slideId: string, elementId: string) {
    const slide = this.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const minZ = Math.min(0, ...slide.elements.map((e) => e.z));
    this.updateElement(slideId, elementId, { z: minZ - 1 });
  }

  newTextElement(slide: Slide): TextElement {
    const offset = cascadeOffset(slide.elements.length);
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'Novo texto',
      x: 10 + offset,
      y: 35 + offset,
      z: slide.elements.length,
      width: 80,
      height: 30,
    };
  }

  newImageElement(slide: Slide, src: string): ImageElement {
    const offset = cascadeOffset(slide.elements.length);
    return {
      id: crypto.randomUUID(),
      type: 'image',
      src,
      x: 20 + offset,
      y: 20 + offset,
      z: slide.elements.length,
      width: 50,
      height: 50,
    };
  }

  newSlideWithText(): Slide {
    const slide: Slide = { id: crypto.randomUUID(), duration: this.settings.duration, elements: [] };
    slide.elements.push(this.newTextElement(slide));
    return slide;
  }

  newSlideWithImage(src: string): Slide {
    const slide: Slide = { id: crypto.randomUUID(), duration: this.settings.duration, elements: [] };
    slide.elements.push(this.newImageElement(slide, src));
    return slide;
  }
}

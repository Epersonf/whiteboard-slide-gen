import { makeAutoObservable } from 'mobx';
import type { ImageElement, Project, ProjectSettings, SlideElement, TextElement } from '../types';

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
 * Dono do estado do projeto: tema (settings) + elementos do único quadro.
 * Substitui o par useReducer+Context da especificação original por
 * observables MobX — mesmas transições de estado, expostas como métodos de ação.
 */
export class ProjectStore {
  id: string = crypto.randomUUID();
  name: string = 'Projeto sem título';
  settings: ProjectSettings = defaultSettings();
  elements: SlideElement[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get project(): Project {
    return { id: this.id, name: this.name, settings: this.settings, elements: this.elements };
  }

  setName(name: string) {
    this.name = name;
  }

  updateSettings(patch: Partial<ProjectSettings>) {
    this.settings = { ...this.settings, ...patch };
  }

  /** Substitui o projeto inteiro (tema + elementos) — usado ao importar um .json. */
  loadProject(project: Project) {
    this.id = project.id;
    this.name = project.name;
    this.settings = project.settings;
    this.elements = project.elements;
  }

  // --- Elementos (texto/imagem) do quadro ---

  addElement(element: SlideElement) {
    this.elements.push(element);
  }

  updateElement(elementId: string, patch: Partial<SlideElement>) {
    this.elements = this.elements.map((el) => (el.id === elementId ? ({ ...el, ...patch } as SlideElement) : el));
  }

  removeElement(elementId: string) {
    this.elements = this.elements.filter((el) => el.id !== elementId);
  }

  duplicateElement(elementId: string) {
    const el = this.elements.find((e) => e.id === elementId);
    if (!el) return;
    const maxZ = Math.max(0, ...this.elements.map((e) => e.z));
    this.elements.push({ ...el, id: crypto.randomUUID(), x: Math.min(el.x + 4, 90), y: Math.min(el.y + 4, 90), z: maxZ + 1 });
  }

  bringToFront(elementId: string) {
    const maxZ = Math.max(0, ...this.elements.map((e) => e.z));
    this.updateElement(elementId, { z: maxZ + 1 });
  }

  sendToBack(elementId: string) {
    const minZ = Math.min(0, ...this.elements.map((e) => e.z));
    this.updateElement(elementId, { z: minZ - 1 });
  }

  newTextElement(): TextElement {
    const offset = cascadeOffset(this.elements.length);
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'Novo texto',
      x: 10 + offset,
      y: 35 + offset,
      z: this.elements.length,
      width: 80,
      height: 30,
    };
  }

  newImageElement(src: string): ImageElement {
    const offset = cascadeOffset(this.elements.length);
    return {
      id: crypto.randomUUID(),
      type: 'image',
      src,
      x: 20 + offset,
      y: 20 + offset,
      z: this.elements.length,
      width: 50,
      height: 50,
    };
  }
}

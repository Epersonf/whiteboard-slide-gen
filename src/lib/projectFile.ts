import type { Project } from '../types';

/** Serializa o projeto inteiro (tema + elementos) como JSON legível. */
export function serializeProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/** Valida o formato mínimo esperado antes de substituir o projeto atual. */
export function parseProjectJson(text: string): Project {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('JSON inválido: não foi possível interpretar o arquivo.');
  }
  if (!data || typeof data !== 'object') {
    throw new Error('JSON inválido: esperado um objeto de projeto.');
  }
  const project = data as Partial<Project>;
  if (!Array.isArray(project.elements)) {
    throw new Error('JSON inválido: campo "elements" ausente ou não é uma lista.');
  }
  if (!project.settings || typeof project.settings !== 'object') {
    throw new Error('JSON inválido: campo "settings" ausente.');
  }
  return {
    id: typeof project.id === 'string' ? project.id : crypto.randomUUID(),
    name: typeof project.name === 'string' ? project.name : 'Projeto importado',
    settings: project.settings,
    elements: project.elements,
  };
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadProjectJson(project: Project): void {
  downloadTextFile(`${project.name || 'projeto'}.json`, serializeProject(project), 'application/json');
}

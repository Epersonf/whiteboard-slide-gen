import { clamp, type TextSlide } from '../types';

/**
 * Heurística de texto determinística — não usa IA, roda instantaneamente e
 * sem rede. Divide um roteiro colado em slides de texto:
 * 1. Por parágrafo (linha em branco), se o roteiro já vier formatado assim.
 * 2. Senão (bloco único longo), por frase, agrupando até um teto de caracteres.
 * Duração de cada slide é estimada pela contagem de palavras.
 */
export function splitScript(raw: string): TextSlide[] {
  const text = raw.trim();
  if (!text) return [];

  let paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    const single = paragraphs[0] ?? text;
    if (single.length > 200) {
      const sentences = single.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [single];
      paragraphs = [];
      let chunk = '';
      for (const sentence of sentences) {
        if ((chunk + sentence).length > 160 && chunk) {
          paragraphs.push(chunk.trim());
          chunk = sentence;
        } else {
          chunk += sentence;
        }
      }
      if (chunk.trim()) paragraphs.push(chunk.trim());
    } else {
      paragraphs = [single];
    }
  }

  return paragraphs.map((p): TextSlide => {
    const words = p.split(/\s+/).filter(Boolean).length;
    const duration = Math.round(clamp(words / 2.3, 2.5, 10) * 2) / 2;
    return { id: crypto.randomUUID(), type: 'text', content: p, duration };
  });
}

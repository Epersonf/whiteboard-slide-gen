// Contratos centrais do editor. O projeto é um único quadro (slide) — um
// canvas com uma ou mais 'elements' (texto e/ou imagem) posicionados
// livremente por x/y/z — exportado como um único arquivo de vídeo.

/** Cor hex ("#rrggbb") ou o literal 'transparent' (fundo sem cor, canal alpha). */
export type BackgroundColor = string;

export const TRANSPARENT: BackgroundColor = 'transparent';

export const DEFAULT_FADE_MS = 600;

export type ElementBase = {
  id: string;
  /** Posição do canto superior-esquerdo, em % da largura/altura do canvas. Sem limite — pode sangrar para fora do quadro. */
  x: number;
  y: number;
  /** Ordem de empilhamento — maior fica por cima. */
  z: number;
  /** Tamanho da caixa do elemento, em % da largura/altura do canvas (0-100). */
  width: number;
  height: number;
  /** Fade suave de entrada, no início do tempo de exibição do quadro. */
  fadeIn?: boolean;
  /** Fade suave de saída, perto do fim do tempo de exibição do quadro. */
  fadeOut?: boolean;
  /** Duração do fade de entrada/saída, em ms. Se ausente, usa DEFAULT_FADE_MS. */
  fadeMs?: number;
};

export type TextElement = ElementBase & {
  type: 'text';
  content: string;
  fontFamily?: string; // se ausente, herda ProjectSettings.fontFamily
  fontSize?: number; // px; se ausente, herda ProjectSettings.fontSize
  color?: string; // hex; se ausente, herda ProjectSettings.textColor
  align?: 'left' | 'center' | 'right'; // default: 'center'
  fontWeight?: number; // 300-900; default: 400
  italic?: boolean; // default: false
  underline?: boolean; // default: false
};

export type ImageElement = ElementBase & {
  type: 'image';
  /** Sempre um data URL (base64) — garante que o .json de exportação leve a imagem embutida. */
  src: string;
  fit?: 'contain' | 'cover'; // default: 'contain'
};

export type SlideElement = TextElement | ImageElement;

export type ExportFormat = 'mp4' | 'webm';

export type ProjectSettings = {
  background: BackgroundColor; // cor de fundo do quadro (hex ou 'transparent')
  textColor: string; // cor de texto padrão para novos elementos
  fontFamily: string; // fonte padrão para novos elementos de texto
  fontSize: number; // tamanho padrão (px)
  duration: number; // segundos de exibição do quadro, sem contar os fades
  transitionMs: number; // duração do fade de entrada/saída
  canvasWidth: number; // resolução de exportação, ex.: 1920
  canvasHeight: number; // ex.: 1080 (fixo em 16:9 no v1)
  fps: number; // ex.: 30
  exportFormat: ExportFormat; // formato preferido de exportação em vídeo
};

export type Project = {
  id: string;
  name: string;
  settings: ProjectSettings;
  elements: SlideElement[];
};

export const CURATED_FONTS: { label: string; family: string; googleFont?: string }[] = [
  { label: 'Source Serif (editorial)', family: '"Source Serif 4", Georgia, serif', googleFont: 'Source+Serif+4:wght@400;600;700' },
  { label: 'Merriweather (livro)', family: '"Merriweather", Georgia, serif', googleFont: 'Merriweather:wght@400;700' },
  { label: 'Playfair Display (expressiva)', family: '"Playfair Display", Georgia, serif', googleFont: 'Playfair+Display:wght@400;600;700' },
  { label: 'Inter (neutra)', family: '"Inter", system-ui, sans-serif', googleFont: 'Inter:wght@400;600;700' },
  { label: 'Poppins (geométrica)', family: '"Poppins", system-ui, sans-serif', googleFont: 'Poppins:wght@400;600;700' },
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

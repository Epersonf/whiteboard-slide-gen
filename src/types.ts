// Contratos centrais do editor de slides. 'Slide' é a união discriminada
// usada em toda a árvore de componentes e no pipeline de exportação.

/** Cor hex ("#rrggbb") ou o literal 'transparent' (fundo sem cor, canal alpha). */
export type BackgroundColor = string;

export const TRANSPARENT: BackgroundColor = 'transparent';

export type SlideBase = {
  id: string;
  duration: number; // segundos — tempo visível, sem contar a transição
  background?: BackgroundColor; // se ausente, herda ProjectSettings.background
};

export type TextSlide = SlideBase & {
  type: 'text';
  content: string;
  fontFamily?: string; // se ausente, herda ProjectSettings.fontFamily
  fontSize?: number; // px; se ausente, herda ProjectSettings.fontSize
  color?: string; // hex; se ausente, herda ProjectSettings.textColor
  align?: 'left' | 'center' | 'right'; // default: 'center'
};

export type ImageSlide = SlideBase & {
  type: 'image';
  src: string; // data URL
  fit?: 'contain' | 'cover'; // default: 'contain'
};

export type Slide = TextSlide | ImageSlide;

export type ExportFormat = 'mp4' | 'webm';

export type ProjectSettings = {
  background: BackgroundColor; // cor de fundo padrão do projeto (hex ou 'transparent')
  textColor: string; // cor de texto padrão do projeto (hex)
  fontFamily: string; // fonte padrão para novos slides de texto
  fontSize: number; // tamanho padrão (px)
  duration: number; // duração padrão (segundos) para novos slides
  transitionMs: number; // duração do fade — padronizada, um único valor pro projeto inteiro
  canvasWidth: number; // resolução de exportação, ex.: 1920
  canvasHeight: number; // ex.: 1080 (fixo em 16:9 no v1)
  fps: number; // ex.: 30
  exportFormat: ExportFormat; // formato preferido de exportação
};

export type Project = {
  id: string;
  name: string;
  settings: ProjectSettings;
  slides: Slide[];
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

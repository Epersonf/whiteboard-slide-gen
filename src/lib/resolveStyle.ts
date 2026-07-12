import type { ProjectSettings, Slide } from '../types';

export type ResolvedSlideStyle = {
  background: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
};

/** Resolve cor/fonte efetivas de um slide: valor próprio, senão o padrão do projeto. */
export function resolveSlideStyle(slide: Slide, settings: ProjectSettings): ResolvedSlideStyle {
  const background = slide.background ?? settings.background;
  if (slide.type === 'image') return { background };
  return {
    background,
    color: slide.color ?? settings.textColor,
    fontFamily: slide.fontFamily ?? settings.fontFamily,
    fontSize: slide.fontSize ?? settings.fontSize,
    align: slide.align ?? 'center',
  };
}

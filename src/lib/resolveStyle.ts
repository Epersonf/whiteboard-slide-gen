import type { ProjectSettings, Slide, TextElement } from '../types';

/** Cor de fundo efetiva do slide: valor próprio, senão o padrão do projeto. */
export function resolveSlideBackground(slide: Slide, settings: ProjectSettings): string {
  return slide.background ?? settings.background;
}

export type ResolvedTextStyle = {
  color: string;
  fontFamily: string;
  fontSize: number;
  align: 'left' | 'center' | 'right';
};

/** Cor/fonte efetivas de um elemento de texto: valor próprio, senão o padrão do projeto. */
export function resolveTextElementStyle(element: TextElement, settings: ProjectSettings): ResolvedTextStyle {
  return {
    color: element.color ?? settings.textColor,
    fontFamily: element.fontFamily ?? settings.fontFamily,
    fontSize: element.fontSize ?? settings.fontSize,
    align: element.align ?? 'center',
  };
}

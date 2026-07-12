import type { ProjectSettings, TextElement } from '../types';

export type ResolvedTextStyle = {
  color: string;
  fontFamily: string;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  fontWeight: number;
  italic: boolean;
  underline: boolean;
};

/** Cor/fonte efetivas de um elemento de texto: valor próprio, senão o padrão do projeto. */
export function resolveTextElementStyle(element: TextElement, settings: ProjectSettings): ResolvedTextStyle {
  return {
    color: element.color ?? settings.textColor,
    fontFamily: element.fontFamily ?? settings.fontFamily,
    fontSize: element.fontSize ?? settings.fontSize,
    align: element.align ?? 'center',
    fontWeight: element.fontWeight ?? 400,
    italic: element.italic ?? false,
    underline: element.underline ?? false,
  };
}

import type { ChangeEvent } from 'react';
import { useProjectStore } from '../store/projectContext';
import { ColorField } from './ColorField';
import { CURATED_FONTS, type ImageSlide, type TextSlide } from '../types';

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function TextControls({ slide }: { slide: TextSlide }) {
  const project = useProjectStore();
  const fontOverridden = slide.fontFamily !== undefined || slide.fontSize !== undefined;
  const colorOverridden = slide.color !== undefined;

  return (
    <>
      <label className="field">
        <span>Conteúdo</span>
        <textarea rows={3} value={slide.content} onChange={(e) => project.updateSlide(slide.id, { content: e.target.value })} />
      </label>

      <label className="field">
        <span>Alinhamento</span>
        <select
          value={slide.align ?? 'center'}
          onChange={(e) => project.updateSlide(slide.id, { align: e.target.value as 'left' | 'center' | 'right' })}
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </label>

      <label className="field field--toggle">
        <input
          type="checkbox"
          checked={fontOverridden}
          onChange={(e) =>
            project.updateSlide(slide.id, {
              fontFamily: e.target.checked ? project.settings.fontFamily : undefined,
              fontSize: e.target.checked ? project.settings.fontSize : undefined,
            })
          }
        />
        Personalizar fonte deste slide
      </label>
      {fontOverridden && (
        <>
          <label className="field">
            <span>Fonte</span>
            <select
              value={slide.fontFamily ?? project.settings.fontFamily}
              onChange={(e) => project.updateSlide(slide.id, { fontFamily: e.target.value })}
            >
              {CURATED_FONTS.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tamanho ({slide.fontSize ?? project.settings.fontSize}px)</span>
            <input
              type="range"
              min={16}
              max={140}
              value={slide.fontSize ?? project.settings.fontSize}
              onChange={(e) => project.updateSlide(slide.id, { fontSize: Number(e.target.value) })}
            />
          </label>
        </>
      )}

      <label className="field field--toggle">
        <input
          type="checkbox"
          checked={colorOverridden}
          onChange={(e) => project.updateSlide(slide.id, { color: e.target.checked ? project.settings.textColor : undefined })}
        />
        Personalizar cor do texto deste slide
      </label>
      {colorOverridden && (
        <ColorField
          label="Cor do texto"
          value={slide.color ?? project.settings.textColor}
          onChange={(color) => project.updateSlide(slide.id, { color })}
        />
      )}
    </>
  );
}

export function ImageControls({ slide }: { slide: ImageSlide }) {
  const project = useProjectStore();

  async function replaceImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const src = await readAsDataURL(file);
    project.updateSlide(slide.id, { src });
  }

  return (
    <>
      {slide.src && <img src={slide.src} alt="" className="slide-item__thumb" />}
      <label className="field">
        <span>Substituir imagem</span>
        <input type="file" accept="image/*" onChange={replaceImage} />
      </label>
      <label className="field">
        <span>Enquadramento</span>
        <select value={slide.fit ?? 'contain'} onChange={(e) => project.updateSlide(slide.id, { fit: e.target.value as 'contain' | 'cover' })}>
          <option value="contain">Conter</option>
          <option value="cover">Preencher</option>
        </select>
      </label>
    </>
  );
}

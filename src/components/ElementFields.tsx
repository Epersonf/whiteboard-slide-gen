import type { ChangeEvent } from 'react';
import { useProjectStore } from '../store/projectContext';
import { ColorField } from './ColorField';
import { CURATED_FONTS, type ImageElement, type TextElement } from '../types';

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function TextElementFields({ element }: { element: TextElement }) {
  const project = useProjectStore();
  const fontOverridden = element.fontFamily !== undefined || element.fontSize !== undefined;
  const colorOverridden = element.color !== undefined;

  return (
    <>
      <label className="field">
        <span>Conteúdo</span>
        <textarea rows={3} value={element.content} onChange={(e) => project.updateElement(element.id, { content: e.target.value })} />
      </label>

      <label className="field">
        <span>Alinhamento</span>
        <select
          value={element.align ?? 'center'}
          onChange={(e) => project.updateElement(element.id, { align: e.target.value as 'left' | 'center' | 'right' })}
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
            project.updateElement(element.id, {
              fontFamily: e.target.checked ? project.settings.fontFamily : undefined,
              fontSize: e.target.checked ? project.settings.fontSize : undefined,
            })
          }
        />
        Personalizar fonte
      </label>
      {fontOverridden && (
        <>
          <label className="field">
            <span>Fonte</span>
            <select
              value={element.fontFamily ?? project.settings.fontFamily}
              onChange={(e) => project.updateElement(element.id, { fontFamily: e.target.value })}
            >
              {CURATED_FONTS.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tamanho ({element.fontSize ?? project.settings.fontSize}px)</span>
            <input
              type="range"
              min={16}
              max={140}
              value={element.fontSize ?? project.settings.fontSize}
              onChange={(e) => project.updateElement(element.id, { fontSize: Number(e.target.value) })}
            />
          </label>
        </>
      )}

      <label className="field field--toggle">
        <input
          type="checkbox"
          checked={colorOverridden}
          onChange={(e) => project.updateElement(element.id, { color: e.target.checked ? project.settings.textColor : undefined })}
        />
        Personalizar cor do texto
      </label>
      {colorOverridden && (
        <ColorField
          label="Cor do texto"
          value={element.color ?? project.settings.textColor}
          onChange={(color) => project.updateElement(element.id, { color })}
        />
      )}

      <label className="field">
        <span>Peso da fonte</span>
        <select value={element.fontWeight ?? 400} onChange={(e) => project.updateElement(element.id, { fontWeight: Number(e.target.value) })}>
          <option value={300}>Leve</option>
          <option value={400}>Normal</option>
          <option value={600}>Semi-negrito</option>
          <option value={700}>Negrito</option>
          <option value={800}>Extra-negrito</option>
        </select>
      </label>

      <div className="text-style-toggles">
        <label className="field field--toggle">
          <input
            type="checkbox"
            checked={element.italic ?? false}
            onChange={(e) => project.updateElement(element.id, { italic: e.target.checked })}
          />
          <em>Itálico</em>
        </label>
        <label className="field field--toggle">
          <input
            type="checkbox"
            checked={element.underline ?? false}
            onChange={(e) => project.updateElement(element.id, { underline: e.target.checked })}
          />
          <span style={{ textDecoration: 'underline' }}>Sublinhado</span>
        </label>
      </div>
    </>
  );
}

export function ImageElementFields({ element }: { element: ImageElement }) {
  const project = useProjectStore();

  async function replaceImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const src = await readAsDataURL(file);
    project.updateElement(element.id, { src });
  }

  return (
    <>
      {element.src && <img src={element.src} alt="" className="element-thumb" />}
      <label className="field">
        <span>Substituir imagem</span>
        <input type="file" accept="image/*" onChange={replaceImage} />
      </label>
      <label className="field">
        <span>Enquadramento</span>
        <select value={element.fit ?? 'contain'} onChange={(e) => project.updateElement(element.id, { fit: e.target.value as 'contain' | 'cover' })}>
          <option value="contain">Conter</option>
          <option value="cover">Preencher</option>
        </select>
      </label>
    </>
  );
}

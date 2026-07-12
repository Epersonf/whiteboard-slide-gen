import { TRANSPARENT } from '../types';

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
};

export function ColorField({ label, value, onChange, allowTransparent }: ColorFieldProps) {
  const isTransparent = value === TRANSPARENT;

  return (
    <div className="color-field">
      <span className="color-field__label">{label}</span>
      <div className="color-field__controls">
        <input
          type="color"
          aria-label={`${label} (seletor de cor)`}
          value={isTransparent ? '#ffffff' : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isTransparent}
        />
        <input
          type="text"
          className="color-field__hex"
          aria-label={`${label} (código hex)`}
          value={isTransparent ? 'transparent' : value}
          disabled={isTransparent}
          onChange={(e) => onChange(e.target.value)}
        />
        {allowTransparent && (
          <label className="color-field__transparent">
            <input
              type="checkbox"
              checked={isTransparent}
              onChange={(e) => onChange(e.target.checked ? TRANSPARENT : '#ffffff')}
            />
            Transparente
          </label>
        )}
      </div>
    </div>
  );
}

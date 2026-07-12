import { useState, type ReactNode } from 'react';

export function CollapsiblePanel({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="panel">
      <button type="button" className="panel__header" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <h2 className="panel__title">{title}</h2>
        <span className="panel__chevron" aria-hidden="true">{open ? '︿' : '﹀'}</span>
      </button>
      {open && <div className="panel__body">{children}</div>}
    </section>
  );
}

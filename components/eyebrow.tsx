interface EyebrowProps {
  children: React.ReactNode;
  aside?: React.ReactNode;
}

export function Eyebrow({ children, aside }: EyebrowProps) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-ink-muted">
      <span>{children}</span>
      {aside && <span>{aside}</span>}
    </div>
  );
}

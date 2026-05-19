import { ReactNode, InputHTMLAttributes } from 'react';

/**
 * Bordered card with a `// section-name` mono eyebrow header.
 * Shared across dashboard pages so the visual language stays consistent.
 */
export function Section({
  title,
  required,
  padded = true,
  className,
  children,
  trailing,
}: {
  title: string;
  required?: boolean;
  padded?: boolean;
  className?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={`border-border bg-background overflow-hidden rounded-xl border ${className ?? ''}`}
    >
      <div className="border-border bg-muted/30 flex items-center justify-between border-b border-dashed px-4 py-2">
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.08em]">
          // {title}
        </span>
        {required ? (
          <span className="text-destructive font-mono text-[10px] uppercase tracking-[0.08em]">
            required
          </span>
        ) : (
          trailing
        )}
      </div>
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

/** Uppercase mono label + content slot — for form fields inside a Section. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="text-muted-foreground/80 mb-1.5 block font-mono text-[11px] uppercase tracking-[0.06em]">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Mono text input with brand-emerald focus ring. */
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-brand/25 h-9 w-full rounded-md border px-2.5 font-mono text-[12px] transition-shadow focus:outline-none focus:ring-2 ${
        props.className ?? ''
      }`}
    />
  );
}

/** Mono row used for read-only key/value pairs inside an info Section. */
export function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 font-mono text-[12px] ${
        isLast ? '' : 'border-border border-b border-dashed'
      }`}
    >
      <span className="text-muted-foreground uppercase tracking-[0.06em]">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}

import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 px-1">
      <div>
        <h1 className="text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mid">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass p-5 ${className}`}>{children}</div>;
}

export function GlassSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass h-20 animate-aurora" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-ink-hi">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-mid">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-ink-hi">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost">
          Tentar outra vez
        </button>
      )}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-light tracking-[0.02em] text-ink-mid">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-ink-mid">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl bg-surface-3 px-4 py-3 text-sm text-ink-hi placeholder:text-ink-lo focus:outline-none focus-visible:outline-2 focus-visible:outline-accent";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${
        checked ? "bg-accent-soft" : "bg-surface-3"
      }`}
    >
      <span
        className={`block size-5 rounded-full transition-transform ${
          checked
            ? "translate-x-5 bg-accent-ink"
            : "translate-x-0 bg-ink-lo"
        }`}
      />
    </button>
  );
}

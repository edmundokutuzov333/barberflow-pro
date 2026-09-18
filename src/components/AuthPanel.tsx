import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/Brand";

export function AuthPanel({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex">
          <Brand />
        </Link>
        <div className="glass p-8">
          <h1 className="text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-ink-mid">{subtitle}</p>
          <div className="mt-6 space-y-4">{children}</div>
        </div>
        {footer && <div className="mt-4 text-sm text-ink-mid">{footer}</div>}
      </div>
    </div>
  );
}

export function TextInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-light tracking-[0.02em] text-ink-mid">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl bg-surface-3 px-4 py-3 text-sm text-ink-hi placeholder:text-ink-lo"
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-full bg-accent-soft px-6 py-3 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-60"
    >
      {children}
    </button>
  );
}

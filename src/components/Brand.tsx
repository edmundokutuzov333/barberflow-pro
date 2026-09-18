export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[17px] font-medium tracking-[-0.01em] text-ink-hi">
        BarberOS
      </span>
      {!compact && (
        <span className="text-[12px] font-light text-ink-mid opacity-70">
          by Oryon
        </span>
      )}
    </span>
  );
}

export const SHOP_TZ = "Africa/Maputo";

/** 50000 -> "500 MT" ; 120050 -> "1 200,50 MT" */
export function formatMT(cents: number): string {
  const value = cents / 100;
  const hasDecimals = cents % 100 !== 0;
  const formatted = new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted.replace(/\u00a0/g, " ")} MT`;
}

export function formatHour(date: Date | string, timeZone = SHOP_TZ): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(d);
}

export function formatDayLong(date: Date | string, timeZone = SHOP_TZ): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(d);
}

/** Mensagens legíveis para as excepções lançadas pela base de dados. */
const DB_ERRORS: Record<string, string> = {
  SLOT_TAKEN: "Esse horário foi ocupado. Escolhe outro.",
  SLOT_UNAVAILABLE: "Esse horário foi ocupado. Escolhe outro.",
  POLICY_LOCKED: "Já passou o prazo para alterar online. Fala com a barbearia.",
  INVALID_PHONE: "Número inválido. Usa o formato 84 000 0000.",
  INVALID_NAME: "Escreve o nome completo.",
  BARBERSHOP_NOT_FOUND: "Esta barbearia não está disponível.",
  SERVICE_NOT_FOUND: "Este serviço já não está disponível.",
};

export function messageFor(error: unknown): string {
  const raw =
    typeof error === "string"
      ? error
      : ((error as { message?: string })?.message ?? "");
  for (const key of Object.keys(DB_ERRORS)) {
    if (raw.includes(key)) return DB_ERRORS[key]!;
  }
  if (raw.includes("Invalid login credentials"))
    return "Email ou palavra-passe errados.";
  if (raw.includes("Email not confirmed"))
    return "Confirma o email antes de entrar.";
  if (raw.includes("User already registered"))
    return "Já existe uma conta com este email.";
  return raw || "Algo falhou. Tenta outra vez.";
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyShop } from "@/lib/shop";
import { formatHour, formatMT, messageFor } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Painel — BarberOS by Oryon" },
      {
        name: "description",
        content:
          "Marcações de hoje, ocupação da agenda e o que precisa de atenção na tua barbearia.",
      },
      { property: "og:title", content: "Painel — BarberOS by Oryon" },
      {
        property: "og:description",
        content: "O dia da tua barbearia num só ecrã.",
      },
    ],
  }),
  component: Dashboard,
});

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`glass-card relative overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 animate-aurora bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs font-light tracking-[0.02em] text-ink-mid">
        {label}
      </p>
      <p className="num-lg mt-2 text-ink-hi">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { data: membership, isLoading, error } = useMyShop();
  const shopId = membership?.shop.id;

  const today = useQuery({
    queryKey: ["dashboard", shopId],
    enabled: !!shopId,
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);

      const [dayRes, monthNoShow] = await Promise.all([
        supabase
          .from("appointments")
          .select(
            "id, starts_at, status, price_cents, customers(name), services(name)",
          )
          .eq("barbershop_id", shopId!)
          .gte("starts_at", start.toISOString())
          .lt("starts_at", end.toISOString())
          .order("starts_at", { ascending: true }),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("barbershop_id", shopId!)
          .eq("status", "no_show")
          .gte("starts_at", monthStart.toISOString()),
      ]);

      if (dayRes.error) throw dayRes.error;
      if (monthNoShow.error) throw monthNoShow.error;

      const rows = dayRes.data ?? [];
      const revenue = rows
        .filter((r) => r.status !== "cancelled" && r.status !== "no_show")
        .reduce((sum, r) => sum + r.price_cents, 0);

      return {
        rows,
        count: rows.length,
        revenue,
        noShowMonth: monthNoShow.count ?? 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 p-1 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6">
        <h1 className="text-xl">Não foi possível carregar o painel</h1>
        <p className="mt-2 text-sm text-ink-mid">{messageFor(error)}</p>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="glass mx-auto mt-10 max-w-lg p-8 text-center">
        <h1 className="text-2xl">Ainda não tens barbearia</h1>
        <p className="mt-2 text-sm text-ink-mid">
          Cria o perfil da tua barbearia para abrir a agenda e receber
          marcações.
        </p>
        <Link
          to="/app/definicoes/perfil"
          className="mt-6 inline-flex rounded-full bg-accent-soft px-5 py-2.5 text-sm font-medium text-accent-ink"
        >
          Criar barbearia
        </Link>
      </div>
    );
  }

  const shop = membership.shop;
  const data = today.data;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-2xl">{shop.name}</h1>
          <p className="text-sm text-ink-mid">
            {shop.status === "trial" ? "Período de teste" : "Conta activa"} ·
            /barbearia/{shop.slug}
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Marcações de hoje" value={String(data?.count ?? 0)} />
        <Kpi
          label="Concluídas hoje"
          value={String(
            data?.rows.filter((r) => r.status === "completed").length ?? 0,
          )}
        />
        <Kpi label="Receita estimada" value={formatMT(data?.revenue ?? 0)} />
        <Kpi label="Faltas este mês" value={String(data?.noShowMonth ?? 0)} />
      </div>

      <section className="glass p-6">
        <h2 className="text-base font-medium">A seguir</h2>
        {today.isLoading ? (
          <Skeleton className="mt-4 h-24" />
        ) : (data?.rows.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-ink-mid">
            Nada marcado para hoje. Partilha o teu link para encher a agenda.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data!.rows.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="glass-card flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm">
                    {(r.customers as { name: string } | null)?.name ??
                      "Cliente"}
                  </p>
                  <p className="text-xs text-ink-mid">
                    {(r.services as { name: string } | null)?.name}
                  </p>
                </div>
                <span className="text-lg tabular-nums">
                  {formatHour(r.starts_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

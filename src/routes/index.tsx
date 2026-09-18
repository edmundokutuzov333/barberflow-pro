import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Brand } from "@/components/Brand";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BarberOS by Oryon — gestão de barbearias" },
      {
        name: "description",
        content:
          "A plataforma onde a barbearia controla o dia e o cliente marca o corte em menos de 40 segundos, sem instalar nada.",
      },
      {
        property: "og:title",
        content: "BarberOS by Oryon — gestão de barbearias",
      },
      {
        property: "og:description",
        content:
          "Menos faltas, menos horários vazios. Marcações online para barbearias em Moçambique.",
      },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    title: "Marcar em 40 segundos",
    body: "O cliente escolhe o corte, o barbeiro e a hora pelo telemóvel. Sem conta, sem aplicação.",
  },
  {
    title: "Uma vaga, uma pessoa",
    body: "A agenda é validada na base de dados. Duas marcações nunca ocupam o mesmo horário.",
  },
  {
    title: "Menos faltas",
    body: "Lembretes, sinal opcional e lista de espera que reocupa o horário que ficou livre.",
  },
];

function Landing() {
  const reduced = useReducedMotion();
  const { session, loading } = useSession();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="flex items-center justify-between">
        <Brand />
        <nav className="flex items-center gap-2">
          {loading ? null : session ? (
            <Link
              to="/app"
              className="rounded-full bg-accent-soft px-5 py-2.5 text-sm font-medium text-accent-ink"
            >
              Abrir painel
            </Link>
          ) : (
            <>
              <Link
                to="/entrar"
                className="rounded-full px-4 py-2.5 text-sm text-ink-mid transition-colors hover:text-accent-soft"
              >
                Entrar
              </Link>
              <Link
                to="/registar"
                className="rounded-full bg-accent-soft px-5 py-2.5 text-sm font-medium text-accent-ink"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </header>

      <motion.section
        initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="glass mt-8 p-8 sm:p-12"
      >
        <h1 className="max-w-2xl text-[32px] leading-tight sm:text-[44px]">
          A barbearia controla o dia. O cliente marca o corte em menos de 40
          segundos.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ink-mid">
          Agenda, clientes, cortes e marcações online numa só plataforma, feita
          para barbearias em Moçambique.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={session ? "/app" : "/registar"}
            className="rounded-full bg-accent-soft px-6 py-3 text-sm font-medium text-accent-ink"
          >
            {session ? "Abrir painel" : "Começar agora"}
          </Link>
        </div>
      </motion.section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="glass-card p-6">
            <h2 className="text-base font-medium">{p.title}</h2>
            <p className="mt-2 text-sm text-ink-mid">{p.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-10 px-1 pb-10 text-xs text-ink-mid">
        BarberOS <span className="opacity-70">by Oryon</span> · Maputo
      </footer>
    </div>
  );
}

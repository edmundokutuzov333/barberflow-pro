import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { messageFor } from "@/lib/format";
import { AuthPanel, TextInput, PrimaryButton } from "@/components/AuthPanel";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — BarberOS by Oryon" },
      {
        name: "description",
        content: "Entra na tua conta BarberOS para gerir a agenda da barbearia.",
      },
      { property: "og:title", content: "Entrar — BarberOS by Oryon" },
      {
        property: "og:description",
        content: "Acede ao painel da tua barbearia.",
      },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(messageFor(error));
      return;
    }
    navigate({ to: "/app", replace: true });
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(messageFor(result.error));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app", replace: true });
  }

  return (
    <AuthPanel
      title="Entrar"
      subtitle="Gere a agenda da tua barbearia."
      footer={
        <span>
          Ainda não tens conta?{" "}
          <Link to="/registar" className="text-accent-soft">
            Registar
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <TextInput
          label="Palavra-passe"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <PrimaryButton disabled={busy}>
          {busy ? "A entrar…" : "Entrar"}
        </PrimaryButton>
      </form>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-full border border-white/15 bg-surface-3 px-6 py-3 text-sm text-ink-hi"
      >
        Continuar com Google
      </button>

      <Link
        to="/recuperar"
        className="block text-center text-xs text-ink-mid hover:text-accent-soft"
      >
        Esqueci-me da palavra-passe
      </Link>
    </AuthPanel>
  );
}

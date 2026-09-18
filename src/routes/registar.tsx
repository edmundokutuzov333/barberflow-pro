import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { messageFor } from "@/lib/format";
import { AuthPanel, TextInput, PrimaryButton } from "@/components/AuthPanel";

export const Route = createFileRoute("/registar")({
  head: () => ({
    meta: [
      { title: "Registar — BarberOS by Oryon" },
      {
        name: "description",
        content:
          "Cria a conta da tua barbearia e começa a receber marcações online.",
      },
      { property: "og:title", content: "Registar — BarberOS by Oryon" },
      {
        property: "og:description",
        content: "Abre a conta da tua barbearia em poucos minutos.",
      },
    ],
  }),
  component: Registar,
});

function Registar() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(messageFor(error));
      return;
    }
    if (data.session) {
      navigate({ to: "/app", replace: true });
      return;
    }
    setSent(true);
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

  if (sent) {
    return (
      <AuthPanel
        title="Confirma o email"
        subtitle={`Enviámos um link para ${email}. Abre-o para activar a conta.`}
      >
        <Link to="/entrar" className="text-sm text-accent-soft">
          Voltar a entrar
        </Link>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel
      title="Criar conta"
      subtitle="Abre a agenda da tua barbearia."
      footer={
        <span>
          Já tens conta?{" "}
          <Link to="/entrar" className="text-accent-soft">
            Entrar
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput label="Nome" value={name} onChange={setName} />
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
          autoComplete="new-password"
        />
        <PrimaryButton disabled={busy}>
          {busy ? "A criar…" : "Criar conta"}
        </PrimaryButton>
      </form>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-full border border-white/15 bg-surface-3 px-6 py-3 text-sm text-ink-hi"
      >
        Continuar com Google
      </button>
    </AuthPanel>
  );
}

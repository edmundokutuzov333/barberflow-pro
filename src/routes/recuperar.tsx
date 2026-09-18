import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { messageFor } from "@/lib/format";
import { AuthPanel, TextInput, PrimaryButton } from "@/components/AuthPanel";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar palavra-passe — BarberOS by Oryon" },
      {
        name: "description",
        content: "Recebe um link para definir uma nova palavra-passe.",
      },
      { property: "og:title", content: "Recuperar palavra-passe — BarberOS" },
      {
        property: "og:description",
        content: "Repõe o acesso à conta da tua barbearia.",
      },
    ],
  }),
  component: Recuperar,
});

function Recuperar() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-palavra-passe`,
    });
    setBusy(false);
    if (error) {
      toast.error(messageFor(error));
      return;
    }
    setSent(true);
  }

  return (
    <AuthPanel
      title="Recuperar acesso"
      subtitle={
        sent
          ? "Se existir uma conta com este email, o link já vai a caminho."
          : "Enviamos um link para definires uma nova palavra-passe."
      }
      footer={
        <Link to="/entrar" className="text-accent-soft">
          Voltar a entrar
        </Link>
      }
    >
      {!sent && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <PrimaryButton disabled={busy}>
            {busy ? "A enviar…" : "Enviar link"}
          </PrimaryButton>
        </form>
      )}
    </AuthPanel>
  );
}

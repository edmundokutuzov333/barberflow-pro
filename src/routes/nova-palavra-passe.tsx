import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { messageFor } from "@/lib/format";
import { AuthPanel, TextInput, PrimaryButton } from "@/components/AuthPanel";

export const Route = createFileRoute("/nova-palavra-passe")({
  head: () => ({
    meta: [
      { title: "Nova palavra-passe — BarberOS by Oryon" },
      {
        name: "description",
        content: "Define uma nova palavra-passe para a tua conta BarberOS.",
      },
      { property: "og:title", content: "Nova palavra-passe — BarberOS" },
      {
        property: "og:description",
        content: "Termina a recuperação de acesso à tua conta.",
      },
    ],
  }),
  component: NovaPalavraPasse,
});

function NovaPalavraPasse() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Usa pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(messageFor(error));
      return;
    }
    toast.success("Palavra-passe actualizada");
    navigate({ to: "/app", replace: true });
  }

  return (
    <AuthPanel
      title="Nova palavra-passe"
      subtitle="Escolhe uma palavra-passe que só tu saibas."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput
          label="Nova palavra-passe"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PrimaryButton disabled={busy}>
          {busy ? "A guardar…" : "Guardar"}
        </PrimaryButton>
      </form>
    </AuthPanel>
  );
}

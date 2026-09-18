import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyShop, slugify } from "@/lib/shop";
import { messageFor } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/definicoes/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil da barbearia — BarberOS by Oryon" },
      {
        name: "description",
        content:
          "Nome, endereço no link, contactos e morada da tua barbearia no BarberOS.",
      },
      { property: "og:title", content: "Perfil da barbearia — BarberOS" },
      {
        property: "og:description",
        content: "Define o nome, o link público e os contactos da barbearia.",
      },
    ],
  }),
  component: PerfilBarbearia,
});

type FormState = {
  name: string;
  slug: string;
  description: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  description: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  address: "",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-light tracking-[0.02em] text-ink-mid">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl bg-surface-3 px-4 py-3 text-sm text-ink-hi placeholder:text-ink-lo focus:outline-none focus-visible:outline-2"
      />
      {hint && <span className="mt-1 block text-xs text-ink-mid">{hint}</span>}
    </label>
  );
}

function PerfilBarbearia() {
  const { data: membership, isLoading } = useMyShop();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (membership) {
      const s = membership.shop;
      setForm({
        name: s.name,
        slug: s.slug,
        description: s.description ?? "",
        phone: s.phone ?? "",
        whatsapp: s.whatsapp ?? "",
        instagram: s.instagram ?? "",
        address: s.address ?? "",
      });
      setSlugTouched(true);
    }
  }, [membership]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "name" && !slugTouched ? { slug: slugify(value) } : {}),
    }));

  const save = useMutation({
    mutationFn: async () => {
      if (form.name.trim().length < 2) throw new Error("Escreve o nome.");
      const slug = slugify(form.slug || form.name);
      if (!slug) throw new Error("O link não pode ficar vazio.");

      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        instagram: form.instagram || null,
        address: form.address || null,
      };

      if (membership) {
        const { error } = await supabase
          .from("barbershops")
          .update(payload)
          .eq("id", membership.shop.id);
        if (error) throw error;
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Sessão expirada. Entra de novo.");

      const { data: shop, error } = await supabase
        .from("barbershops")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      const { error: memberError } = await supabase
        .from("barbershop_members")
        .insert({
          barbershop_id: shop.id,
          user_id: user.user.id,
          role: "owner",
        });
      if (memberError) throw memberError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop"] });
      toast.success(membership ? "Alterações guardadas" : "Barbearia criada");
    },
    onError: (e) => toast.error(messageFor(e)),
  });

  if (isLoading) {
    return <div className="glass h-64 animate-aurora" aria-hidden />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="px-1">
        <h1 className="text-2xl">
          {membership ? "Perfil da barbearia" : "Criar barbearia"}
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          Isto é o que o cliente vê na página pública.
        </p>
      </header>

      <form
        className="glass space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Nome" value={form.name} onChange={set("name")} />
        <label className="block">
          <span className="text-xs font-light tracking-[0.02em] text-ink-mid">
            Link público
          </span>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
            }}
            className="mt-1.5 w-full rounded-2xl bg-surface-3 px-4 py-3 text-sm text-ink-hi placeholder:text-ink-lo"
            placeholder="barbearia-do-joao"
          />
          <span className="mt-1 block text-xs text-ink-mid">
            /barbearia/{form.slug || "…"}
          </span>
        </label>
        <Field
          label="Descrição"
          value={form.description}
          onChange={set("description")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Telemóvel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="84 000 0000"
          />
          <Field
            label="WhatsApp"
            value={form.whatsapp}
            onChange={set("whatsapp")}
            placeholder="84 000 0000"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Instagram"
            value={form.instagram}
            onChange={set("instagram")}
          />
          <Field label="Morada" value={form.address} onChange={set("address")} />
        </div>

        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-accent-soft px-6 py-3 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-60"
        >
          {save.isPending
            ? "A guardar…"
            : membership
              ? "Guardar"
              : "Criar barbearia"}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { messageFor, formatMT } from "@/lib/format";
import { useDragOrder } from "@/hooks/useDragOrder";
import {
  EmptyState,
  ErrorState,
  GlassSkeleton,
  Toggle,
  inputClass,
} from "@/components/kit";
import type { Database } from "@/integrations/supabase/types";

export type Service = Database["public"]["Tables"]["services"]["Row"];

export function useServices(shopId: string | undefined) {
  return useQuery({
    queryKey: ["services", shopId],
    enabled: !!shopId,
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("barbershop_id", shopId!)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function ServicesEditor({ shopId }: { shopId: string }) {
  const qc = useQueryClient();
  const services = useServices(shopId);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["services", shopId] });

  const create = useMutation({
    mutationFn: async () => {
      const cleanName = name.trim();
      if (cleanName.length < 2) throw new Error("Escreve o nome do serviço.");
      const cents = Math.round(Number(price.replace(",", ".")) * 100);
      const minutes = Number(duration);
      if (!Number.isFinite(cents) || cents < 0)
        throw new Error("Preço inválido.");
      if (!Number.isFinite(minutes) || minutes < 5 || minutes > 480)
        throw new Error("A duração tem de estar entre 5 e 480 minutos.");
      const { error } = await supabase.from("services").insert({
        barbershop_id: shopId,
        name: cleanName,
        price_cents: cents,
        duration_min: minutes,
        sort_order: (services.data?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      setPrice("");
      setDuration("30");
      invalidate();
      toast.success("Serviço criado");
    },
    onError: (e) => toast.error(messageFor(e)),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Service> }) => {
      const { error } = await supabase.from("services").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(messageFor(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Serviço removido");
    },
    onError: (e) => toast.error(messageFor(e)),
  });

  const reorder = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id, index) =>
          supabase.from("services").update({ sort_order: index + 1 }).eq("id", id),
        ),
      );
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(messageFor(e)),
  });

  const list = services.data ?? [];
  const { itemProps } = useDragOrder(list, (ids) => reorder.mutate(ids));

  return (
    <div className="space-y-4">
      <form
        className="glass grid gap-3 p-5 sm:grid-cols-[1fr_8rem_8rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <input
          className={inputClass}
          placeholder="Corte simples"
          aria-label="Nome do serviço"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Preço (MT)"
          aria-label="Preço em meticais"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Minutos"
          aria-label="Duração em minutos"
          inputMode="numeric"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={create.isPending}>
          Adicionar
        </button>
      </form>

      {services.isLoading ? (
        <GlassSkeleton />
      ) : services.isError ? (
        <ErrorState
          message={messageFor(services.error)}
          onRetry={() => services.refetch()}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title="Ainda não há serviços"
          hint="Acrescenta o primeiro serviço para o cliente poder marcar."
        />
      ) : (
        <ul className="space-y-2">
          {list.map((s) => (
            <li
              key={s.id}
              {...itemProps(s.id)}
              className="glass-card flex flex-wrap items-center gap-3 p-4"
            >
              <GripVertical className="size-4 cursor-grab text-ink-lo" aria-hidden />
              <input
                className="min-w-40 flex-1 bg-transparent text-sm text-ink-hi focus:outline-none"
                aria-label="Nome"
                defaultValue={s.name}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== s.name) update.mutate({ id: s.id, patch: { name: v } });
                }}
              />
              <input
                className="w-24 rounded-2xl bg-surface-3 px-3 py-2 text-sm text-ink-hi"
                aria-label={`Preço de ${s.name}`}
                defaultValue={(s.price_cents / 100).toString()}
                inputMode="decimal"
                onBlur={(e) => {
                  const cents = Math.round(Number(e.target.value.replace(",", ".")) * 100);
                  if (Number.isFinite(cents) && cents >= 0 && cents !== s.price_cents)
                    update.mutate({ id: s.id, patch: { price_cents: cents } });
                }}
              />
              <input
                className="w-20 rounded-2xl bg-surface-3 px-3 py-2 text-sm text-ink-hi"
                aria-label={`Duração de ${s.name}`}
                defaultValue={s.duration_min}
                inputMode="numeric"
                onBlur={(e) => {
                  const m = Number(e.target.value);
                  if (m >= 5 && m <= 480 && m !== s.duration_min)
                    update.mutate({ id: s.id, patch: { duration_min: m } });
                }}
              />
              <span className="chip">{formatMT(s.price_cents)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-mid">Sinal</span>
                <Toggle
                  label={`Exigir sinal em ${s.name}`}
                  checked={s.requires_deposit}
                  onChange={(v) =>
                    update.mutate({ id: s.id, patch: { requires_deposit: v } })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-mid">Activo</span>
                <Toggle
                  label={`Serviço ${s.name} activo`}
                  checked={s.is_active}
                  onChange={(v) => update.mutate({ id: s.id, patch: { is_active: v } })}
                />
              </div>
              <button
                type="button"
                aria-label={`Remover ${s.name}`}
                onClick={() => remove.mutate(s.id)}
                className="text-ink-lo transition-colors hover:text-st-noshow"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

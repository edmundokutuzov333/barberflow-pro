import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Barbershop = Database["public"]["Tables"]["barbershops"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type Membership = {
  role: AppRole;
  shop: Barbershop;
};

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function fetchMembership(): Promise<Membership | null> {
  const { data, error } = await supabase
    .from("barbershop_members")
    .select("role, barbershops(*)")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.barbershops) return null;
  return { role: data.role, shop: data.barbershops as Barbershop };
}

export function useMyShop() {
  return useQuery({
    queryKey: ["my-shop"],
    queryFn: fetchMembership,
    staleTime: 30_000,
  });
}

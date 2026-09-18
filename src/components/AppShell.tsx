import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Brand } from "@/components/Brand";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
};

// Cada item aqui aponta para um ecrã que existe. Os restantes módulos entram
// nas fases seguintes e são acrescentados a esta lista quando ficam prontos.
export const NAV_ITEMS: NavItem[] = [
  { to: "/app", label: "Painel", icon: LayoutDashboard },
  { to: "/app/definicoes/perfil", label: "Definições", icon: Settings },
];

function useActivePath() {
  return useRouterState({ select: (s) => s.location.pathname });
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useActivePath();
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <div className="flex min-h-dvh gap-4 p-3 md:p-4">
      <motion.aside
        aria-label="Navegação principal"
        initial={false}
        animate={{ width: collapsed ? 76 : 264 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 200, damping: 25 }
        }
        className="glass sticky top-4 hidden h-[calc(100dvh-2rem)] shrink-0 flex-col overflow-hidden p-3 md:flex"
      >
        <div className="flex items-center justify-between px-2 py-3">
          {!collapsed && <Brand />}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir menu" : "Encolher menu"}
            className="rounded-2xl p-2 text-ink-lo transition-colors hover:text-accent-soft"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 32 }
                    }
                    className="absolute inset-0 rounded-2xl bg-accent-soft"
                  />
                )}
                <Icon
                  className={`relative size-5 shrink-0 transition-colors ${
                    active
                      ? "text-accent-ink"
                      : "text-ink-lo opacity-55 hover:opacity-100"
                  }`}
                />
                {!collapsed && (
                  <span
                    className={`relative ${active ? "font-medium text-accent-ink" : "text-ink-mid"}`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="mt-auto flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-ink-mid transition-colors hover:text-accent-soft"
        >
          <LogOut className="size-5 shrink-0 opacity-70" />
          {!collapsed && <span>Sair</span>}
        </button>
      </motion.aside>

      <main className="min-w-0 flex-1 pb-28 md:pb-0">{children}</main>

      {/* Dock flutuante — telemóvel */}
      <nav
        aria-label="Navegação"
        className="glass fixed inset-x-4 bottom-4 z-40 flex items-center justify-around gap-1 rounded-full px-2 py-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active =
            item.to === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className="relative flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5"
            >
              {active && (
                <motion.span
                  layoutId="dock-pill"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                  className="absolute inset-0 rounded-full bg-accent-soft"
                />
              )}
              <Icon
                className={`relative size-5 ${active ? "text-accent-ink" : "text-ink-lo"}`}
              />
              <span
                className={`relative text-xs ${active ? "font-medium text-accent-ink" : "text-ink-mid"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

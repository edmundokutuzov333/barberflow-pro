# BarberFlow Pro

# PROMPT 1 — LOVABLE
### BarberOS by Oryon — sistema de gestão de barbearias
*(cola tudo o que está abaixo como primeira mensagem no Lovable)*

---

## 0. PAPEL E REGRAS DE OURO

Actuas como **Arquitecto de Software Sénior + Director de Arte + Engenheiro de Produto**. Vais construir um SaaS multi-tenant de produção, não um protótipo.

Regras inegociáveis:

1. **Zero dados falsos.** Nada de `mockData.ts`, nada de arrays hardcoded. Tudo vem do Supabase desde a primeira linha.
2. **Zero ecrãs decorativos.** Se um botão existe, funciona. Se um estado existe, é alcançável.
3. **A lógica crítica vive no Postgres**, não no browser. Disponibilidade, marcação, cancelamento e lista de espera são funções `SECURITY DEFINER`. O cliente nunca escreve directamente na tabela `appointments`.
4. **Rejeita o visual genérico de IA.** Nada de cartões brancos, nada de `shadow-lg` cinzento, nada de gradiente azul-roxo de template. A identidade está fechada na secção 3 e cumpre-se à letra.
5. **Português europeu de Moçambique** em toda a interface: *marcação, telemóvel, ecrã, ficheiro, definições, guardar, remarcar*. Nunca português do Brasil (*agendamento, celular, tela, arquivo, configurações, salvar*).
6. Constrói por fases (secção 14). Termina e valida uma fase antes de abrir a seguinte.

O nome do produto escreve-se sempre **BarberOS** em destaque e *by Oryon* em peso leve e opacidade reduzida ao lado.

---

## 1. O PRODUTO

**BarberOS by Oryon** é a plataforma onde uma barbearia gere a sua operação e o cliente marca o corte em menos de 40 segundos, sem instalar nada e sem criar conta.

Três áreas, três públicos, três mentalidades de design:

| Área | Quem usa | Objectivo | Tom |
|---|---|---|---|
| **Pública** | Cliente final, no telemóvel, muitas vezes com dados móveis fracos | Marcar sem fricção | Rápida, visual, leve |
| **Barbearia** | Dono, gerente, barbeiro | Controlar o dia | Densa, operacional, teclado-friendly |
| **Administração** | Equipa Oryon | Gerir contas e planos | Sóbria, tabular |

Métrica que o produto tem de mover: **menos faltas e menos horários vazios**. Todas as decisões de UX servem isso.

---

## 2. STACK

- React 18 + TypeScript + Vite
- Tailwind CSS (configuração personalizada — secção 3)
- shadcn/ui **apenas como base de acessibilidade Radix**; todos os componentes são re-estilizados com os nossos tokens. Não entregues um único componente com o aspecto padrão do shadcn.
- Framer Motion para transições, `layoutId` e micro-interacções
- React Router v6 (rotas na secção 5)
- TanStack Query para estado de servidor, cache e revalidação
- React Hook Form + Zod para todos os formulários
- date-fns + `@date-fns/tz` — **todo o tempo é `timestamptz` e renderiza-se em `Africa/Maputo`**
- Supabase: Postgres, Auth, Storage, Realtime, Edge Functions, pg_cron + pg_net
- `qrcode.react` para o QR Code, `lucide-react` para ícones

Liga o Supabase logo no início. Sem Supabase não avanças.

---

## 3. IDENTIDADE VISUAL (obrigatória, sem interpretação livre)

### 3.1 Tokens

Cria `src/styles/tokens.css` e importa-o no `index.css`:

```css
:root{
  /* fundo */
  --canvas-void:#000000;
  --canvas-glow-a:#1a102f;
  --canvas-glow-b:#0c0614;

  /* superfícies */
  --surface-1:rgba(15,12,22,.65);
  --surface-2:rgba(22,20,28,.80);
  --surface-3:rgba(30,26,40,.55);

  /* acentos */
  --accent:#9d7bf5;
  --accent-soft:#b59eff;
  --accent-ink:#120c1f;      /* texto escuro sobre lilás sólido */

  /* texto */
  --text-hi:#ffffff;
  --text-mid:#9b95a8;        /* texto secundário legível */
  --text-lo:#5c5765;         /* SÓ ícones inactivos e decoração */

  /* estados */
  --st-pending:#e0b057;
  --st-confirmed:#b59eff;
  --st-active:#7bd7f5;
  --st-done:#6ee7b7;
  --st-cancelled:#5c5765;
  --st-noshow:#f57b9d;

  --radius-panel:1.5rem;     /* rounded-3xl */
  --radius-card:1rem;        /* rounded-2xl */
}
```

**Nota de acessibilidade que respeitas:** `--text-lo` (#5c5765) tem contraste insuficiente para texto corrido sobre preto. Usa-o exclusivamente em ícones inactivos, separadores e decoração. Para texto secundário legível usa `--text-mid`. Não negoceies este ponto — a interface é usada em barbearias com luz forte.

### 3.2 Canvas

O fundo nunca é uma cor chapada. É luz que emana de baixo:

```css
body{
  background:
    radial-gradient(120% 80% at 50% 100%, var(--canvas-glow-a) 0%, transparent 60%),
    radial-gradient(90% 60% at 15% 0%, rgba(157,123,245,.10) 0%, transparent 55%),
    var(--canvas-void);
  background-attachment:fixed;
  color:var(--text-hi);
  font-feature-settings:"ss01","cv11";
}
```

### 3.3 Vidro e bordas com brilho

Classe utilitária obrigatória para todos os painéis, sidebars, modais e cartões:

```css
.glass{
  position:relative;
  background:var(--surface-1);
  backdrop-filter:blur(28px) saturate(140%);
  -webkit-backdrop-filter:blur(28px) saturate(140%);
  border-radius:var(--radius-panel);
  box-shadow:0 24px 60px -20px rgba(80,40,160,.45);
}
.glass::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:.5px;
  background:linear-gradient(180deg,
    rgba(255,255,255,.28) 0%,
    rgba(157,123,245,.14) 45%,
    rgba(157,123,245,0) 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
  pointer-events:none;
}
```

Proibido: `shadow-lg`, `shadow-xl` pretos, `border-gray-200`, `bg-white`, `bg-slate-900`.
Profundidade faz-se sempre com brilho roxo difuso, nunca com sombra preta.

### 3.4 Formas

- Painéis e sidebar: `rounded-3xl`
- Cartões internos, inputs, botões de navegação: `rounded-2xl`
- Chips, badges de estado, pesquisa: `rounded-full`
- Item activo da navegação: superelipse lilás **sólida** (`--accent-soft`) com ícone e texto em `--accent-ink`. Contraste invertido, imediato.

### 3.5 Tipografia

Uma família só: **Geist Sans** (fallback: Plus Jakarta Sans, Inter).

| Uso | Tamanho | Peso | Tracking |
|---|---|---|---|
| Número grande (KPI, preço, hora) | 40–56px | 500 | -0.02em |
| Título de ecrã | 24px | 500 | -0.01em |
| Título de cartão | 16px | 500 | 0 |
| Texto corrido | 14px | 300 | 0.01em |
| Label / meta | 12px | 300 | 0.02em |

Proibido: labels em MAIÚSCULAS espaçadas, `01 / 02 / 03` como decoração, uma palavra do título a cor diferente, `→` colado ao texto dos botões. Sentence case em tudo.

### 3.6 Tailwind

```ts
// tailwind.config.ts
extend:{
  colors:{
    canvas:{void:'#000000',glowA:'#1a102f',glowB:'#0c0614'},
    accent:{DEFAULT:'#9d7bf5',soft:'#b59eff',ink:'#120c1f'},
    ink:{hi:'#ffffff',mid:'#9b95a8',lo:'#5c5765'},
    st:{pending:'#e0b057',confirmed:'#b59eff',active:'#7bd7f5',
        done:'#6ee7b7',cancelled:'#5c5765',noshow:'#f57b9d'},
  },
  fontFamily:{sans:['Geist Sans','Plus Jakarta Sans','Inter','system-ui','sans-serif']},
  backdropBlur:{xs:'2px'},
  keyframes:{aurora:{'0%,100%':{opacity:'.35',transform:'translateX(-12%)'},
                     '50%':{opacity:'.7',transform:'translateX(12%)'}}},
  animation:{aurora:'aurora 3.2s ease-in-out infinite'},
}
```

### 3.7 Os 10 temas da página pública

`theme_key` na tabela `barbershops` escolhe um preset. Todos partilham a gramática de vidro; muda o par de acentos e a luz do fundo. Define-os num único ficheiro `src/themes/index.ts` que injecta variáveis CSS no ``:

`violet-noir` (base) · `neon-lilac` · `midnight-indigo` · `cyan-abyss` · `emerald-smoke` · `amber-ash` · `rose-quartz` · `plum-ember` · `nordic-mono` · `blood-orange`

O painel de definições mostra-os como 10 miniaturas ao vivo, não como uma lista de nomes.

---

## 4. MOVIMENTO (Framer Motion)

Motion responde a acções. Não há entradas animadas em todas as secções — isso é o tique do template.

```tsx
// transição de página
const page = {
  initial:{opacity:0,y:8,filter:'blur(6px)'},
  animate:{opacity:1,y:0,filter:'blur(0px)'},
  exit:{opacity:0,y:-6,filter:'blur(4px)'},
  transition:{duration:.28,ease:[.22,1,.36,1]},
};
```

- **Colapso da sidebar:** `animate={{width: collapsed?76:264}}` com `transition={{type:'spring',stiffness:200,damping:25}}`.
- **Pílula activa da navegação:** `` por baixo do item seleccionado — o bloco lilás desliza entre ícones.
- **Ícones inactivos em hover:** opacidade `.55 → 1` e cor a subir de `--text-lo` para `--accent-soft`, 160 ms.
- **Botões:** `whileTap={{scale:.97}}`. Nada de `whileHover` a levantar cartões.
- **Grelha de horários:** entrada com `staggerChildren:.02`, máximo 300 ms no total.
- **Carregamento:** nunca um spinner. Skeleton de vidro com a `animate-aurora` a atravessar o painel.
- `useReducedMotion()` desliga tudo excepto opacidade. Obrigatório.

**Dock flutuante (mobile, área da barbearia):** barra `rounded-full` fixa a 16px do fundo, `backdrop-blur-2xl`, 5 ícones (Agenda, Marcações, Clientes, Relatórios, Mais), pílula `layoutId` partilhada com a sidebar desktop.

---

## 5. ROTAS

```
PÚBLICO
/                                  landing do BarberOS
/barbearia/:slug                   página pública da barbearia
/barbearia/:slug/marcar            assistente de marcação (6 passos)
/marcacao/:token                   gerir marcação (ver, cancelar, remarcar, .ics)
/marcacao/:token/avaliar           avaliação pós-corte
/vaga/:token                       aceitar vaga da lista de espera
/entrar  /registar  /recuperar

BARBEARIA (protegida)
/app                               dashboard
/app/agenda                        dia | semana
/app/marcacoes                     tabela + filtros
/app/clientes  /app/clientes/:id
/app/servicos
/app/cortes
/app/barbeiros
/app/horarios                      horários + bloqueios
/app/lista-espera
/app/avaliacoes
/app/relatorios
/app/definicoes/(perfil|pagina|regras|sinal|utilizadores|link)
/app/onboarding                    assistente de 9 passos

ADMIN (protegida, is_platform_admin)
/admin  /admin/barbearias  /admin/barbearias/:id  /admin/utilizadores
/admin/planos  /admin/pagamentos  /admin/suporte  /admin/metricas
```

---

## 6. MODELO DE DADOS

Cria a migração completa no Supabase. Valores monetários em **centavos de metical** (`50000` = 500,00 MT).

```sql
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type app_role           as enum ('owner','manager','barber');
create type shop_status        as enum ('trial','active','suspended','cancelled');
create type appointment_status as enum ('pending','confirmed','in_progress','completed','cancelled','no_show');
create type deposit_state      as enum ('not_required','awaiting','paid','failed','refunded');
create type booking_source     as enum ('online','manual','waitlist');
create type block_reason       as enum ('lunch','day_off','holiday','meeting','maintenance','absence','other');
create type waitlist_status    as enum ('waiting','offered','converted','expired','cancelled');
create type notif_channel      as enum ('whatsapp','email');
create type notif_status       as enum ('queued','sent','failed','skipped');
create type payment_provider   as enum ('mpesa','emola');
create type payment_state      as enum ('pending','paid','failed','refunded');
create type cancellation_rule  as enum ('flex_2h','moderate_6h','strict_24h','contact_only');
create type deposit_mode       as enum ('percent','fixed');

create table profiles(
  id uuid primary key references auth.users on delete cascade,
  full_name text, phone text, avatar_url text,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now());

create table plans(
  id uuid primary key default gen_random_uuid(),
  code text unique not null, name text not null,
  price_cents int not null default 0, max_barbers int not null default 3,
  features jsonb not null default '{}'::jsonb, is_active boolean not null default true);

create table barbershops(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null, description text,
  logo_url text, cover_url text, theme_key text not null default 'violet-noir',
  phone text, whatsapp text, instagram text,
  address text, maps_url text, lat numeric, lng numeric,
  timezone text not null default 'Africa/Maputo',
  slot_interval_min int not null default 15,
  min_lead_time_min int not null default 30,
  max_advance_days int not null default 30,
  cancellation_rule cancellation_rule not null default 'flex_2h',
  deposit_enabled boolean not null default false,
  deposit_mode deposit_mode not null default 'percent',
  deposit_value int not null default 20,
  deposit_hold_min int not null default 10,
  status shop_status not null default 'trial',
  plan_id uuid references plans,
  created_at timestamptz not null default now());

create table barbershop_members(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(barbershop_id,user_id));

create table barbers(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  user_id uuid references auth.users on delete set null,
  display_name text not null, photo_url text, bio text,
  years_experience int not null default 0,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  is_active boolean not null default true, sort_order int not null default 0);

create table services(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  name text not null, price_cents int not null check(price_cents>=0),
  duration_min int not null check(duration_min between 5 and 480),
  requires_deposit boolean not null default false,
  is_active boolean not null default true, sort_order int not null default 0);

create table barber_services(
  barber_id uuid not null references barbers on delete cascade,
  service_id uuid not null references services on delete cascade,
  primary key(barber_id,service_id));

create table haircuts(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  service_id uuid references services on delete set null,
  name text not null, description text, photo_url text,
  price_cents int, duration_min int,
  is_active boolean not null default true, sort_order int not null default 0);

-- weekday: 0=domingo ... 6=sábado; barber_id null = horário da barbearia
create table working_hours(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  barber_id uuid references barbers on delete cascade,
  weekday int not null check(weekday between 0 and 6),
  opens_at time not null, closes_at time not null,
  is_closed boolean not null default false,
  check (is_closed or closes_at > opens_at));

create table time_blocks(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  barber_id uuid references barbers on delete cascade,
  starts_at timestamptz not null, ends_at timestamptz not null,
  reason block_reason not null default 'other', note text,
  check(ends_at>starts_at));

create table customers(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  name text not null, phone text not null, email text,
  notes text, preferences jsonb not null default '{}'::jsonb,
  visits_count int not null default 0,
  no_show_count int not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  unique(barbershop_id,phone));

create table appointments(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  barber_id uuid not null references barbers on delete restrict,
  service_id uuid not null references services on delete restrict,
  haircut_id uuid references haircuts on delete set null,
  customer_id uuid not null references customers on delete restrict,
  starts_at timestamptz not null, ends_at timestamptz not null,
  duration_min int not null, price_cents int not null,
  status appointment_status not null default 'pending',
  deposit_status deposit_state not null default 'not_required',
  deposit_cents int not null default 0,
  hold_expires_at timestamptz,
  manage_token uuid not null unique default gen_random_uuid(),
  source booking_source not null default 'online',
  internal_note text, created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz, started_at timestamptz, completed_at timestamptz,
  cancelled_at timestamptz, cancel_reason text, no_show_at timestamptz,
  check(ends_at>starts_at));

-- ISTO é o que garante 100% de precisão: o Postgres recusa sobreposição.
alter table appointments add constraint appointments_no_overlap
exclude using gist (
  barber_id with =,
  tstzrange(starts_at,ends_at,'[)') with &&
) where (status in ('pending','confirmed','in_progress'));

create index on appointments(barbershop_id,starts_at);
create index on appointments(barber_id,starts_at);
create index on time_blocks(barbershop_id,starts_at);

create table waitlist_entries(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  service_id uuid not null references services on delete cascade,
  haircut_id uuid references haircuts on delete set null,
  barber_id uuid references barbers on delete set null,
  customer_name text not null, phone text not null, email text,
  date_from date, date_to date,
  period text not null default 'any' check(period in ('morning','afternoon','evening','any')),
  status waitlist_status not null default 'waiting',
  offer_token uuid, offer_slot_start timestamptz, offer_barber_id uuid,
  offer_expires_at timestamptz,
  created_at timestamptz not null default now());

create table reviews(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  barber_id uuid references barbers on delete set null,
  appointment_id uuid not null unique references appointments on delete cascade,
  rating int not null check(rating between 1 and 5),
  comment text, is_published boolean not null default true,
  created_at timestamptz not null default now());

create table payments(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  appointment_id uuid references appointments on delete set null,
  provider payment_provider not null, amount_cents int not null,
  msisdn text, status payment_state not null default 'pending',
  provider_ref text, raw jsonb, created_at timestamptz not null default now());

create table notifications(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops on delete cascade,
  appointment_id uuid references appointments on delete cascade,
  waitlist_entry_id uuid references waitlist_entries on delete cascade,
  channel notif_channel not null, template_key text not null,
  recipient text not null, payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz not null default now(),
  status notif_status not null default 'queued',
  sent_at timestamptz, error text);
create index on notifications(status,scheduled_for);

create table audit_logs(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references barbershops on delete cascade,
  actor_id uuid references auth.users, action text not null,
  entity text, entity_id uuid, diff jsonb,
  created_at timestamptz not null default now());
```

---

## 7. SEGURANÇA E RLS

```sql
create or replace function public.is_member(p_shop uuid, p_roles app_role[] default array['owner','manager','barber']::app_role[])
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from barbershop_members m
    where m.barbershop_id=p_shop and m.user_id=auth.uid() and m.role=any(p_roles));
$$;

create or replace function public.is_platform_admin() returns boolean
language sql stable security definer set search_path=public as $$
  select coalesce((select is_platform_admin from profiles where id=auth.uid()),false);
$$;

create or replace function public.my_barber_id(p_shop uuid) returns uuid
language sql stable security definer set search_path=public as $$
  select id from barbers where barbershop_id=p_shop and user_id=auth.uid() limit 1;
$$;
```

Activa RLS em **todas** as tabelas. Padrões:

```sql
alter table appointments enable row level security;

create policy appt_read on appointments for select using (
  is_platform_admin()
  or is_member(barbershop_id, array['owner','manager']::app_role[])
  or (is_member(barbershop_id, array['barber']::app_role[])
      and barber_id = my_barber_id(barbershop_id))
);

create policy appt_write on appointments for all using (
  is_member(barbershop_id, array['owner','manager']::app_role[])
) with check (
  is_member(barbershop_id, array['owner','manager']::app_role[])
);

-- barbeiro só muda o estado da SUA marcação
create policy appt_barber_update on appointments for update using (
  is_member(barbershop_id, array['barber']::app_role[])
  and barber_id = my_barber_id(barbershop_id)
) with check (
  status in ('in_progress','completed','no_show')
);
```

Leitura pública (`anon`) apenas para: `barbershops` com `status in ('active','trial')`, e `services`, `haircuts`, `barbers`, `working_hours` activos dessa barbearia. **`anon` não tem `select`, `insert` nem `update` em `appointments`, `customers`, `payments` ou `notifications`** — tudo passa por RPC.

Storage: buckets públicos de leitura `shop-logos`, `shop-photos`, `barbers`, `haircuts`; escrita restrita a membros da barbearia via política de path `{{barbershop_id}}/...`.

---

## 8. MOTOR DE DISPONIBILIDADE

Esta é a peça central do sistema. Não a reimplementes em JavaScript.

```sql
create or replace function public.get_available_slots(
  p_slug text, p_service_id uuid, p_barber_id uuid default null, p_date date default current_date)
returns table(slot_start timestamptz, barber_ids uuid[])
language plpgsql stable security definer set search_path=public as $$
declare v_shop barbershops%rowtype; v_dur int; v_step int; v_lead int; v_tz text;
begin
  select * into v_shop from barbershops where slug=p_slug and status in ('active','trial');
  if not found then raise exception 'BARBERSHOP_NOT_FOUND'; end if;

  select duration_min into v_dur from services
   where id=p_service_id and barbershop_id=v_shop.id and is_active;
  if v_dur is null then raise exception 'SERVICE_NOT_FOUND'; end if;

  v_step:=v_shop.slot_interval_min; v_lead:=v_shop.min_lead_time_min; v_tz:=v_shop.timezone;
  if p_date > (now() at time zone v_tz)::date + v_shop.max_advance_days then return; end if;

  return query
  with candidates as (
    select b.id from barbers b
    join barber_services bs on bs.barber_id=b.id and bs.service_id=p_service_id
    where b.barbershop_id=v_shop.id and b.is_active
      and (p_barber_id is null or b.id=p_barber_id)
  ),
  windows as (
    select c.id as barber_id,
           ((p_date::text||' '||wh.opens_at::text)::timestamp at time zone v_tz)  as win_start,
           ((p_date::text||' '||wh.closes_at::text)::timestamp at time zone v_tz) as win_end
    from candidates c
    join lateral (
      select * from working_hours w
      where w.barbershop_id=v_shop.id
        and w.weekday=extract(dow from p_date)::int
        and (w.barber_id=c.id or w.barber_id is null)
        and not w.is_closed
      order by (w.barber_id is not null) desc   -- override do barbeiro ganha
      limit 1
    ) wh on true
  ),
  grid as (
    select w.barber_id, gs as s, gs+make_interval(mins=>v_dur) as e
    from windows w
    cross join lateral generate_series(
      w.win_start, w.win_end-make_interval(mins=>v_dur), make_interval(mins=>v_step)) gs
  )
  select g.s, array_agg(g.barber_id order by g.barber_id)
  from grid g
  where g.s >= now()+make_interval(mins=>v_lead)
    and not exists (select 1 from appointments a
      where a.barber_id=g.barber_id
        and a.status in ('pending','confirmed','in_progress')
        and tstzrange(a.starts_at,a.ends_at,'[)') && tstzrange(g.s,g.e,'[)'))
    and not exists (select 1 from time_blocks tb
      where tb.barbershop_id=v_shop.id
        and (tb.barber_id is null or tb.barber_id=g.barber_id)
        and tstzrange(tb.starts_at,tb.ends_at,'[)') && tstzrange(g.s,g.e,'[)'))
  group by g.s order by g.s;
end $$;

grant execute on function public.get_available_slots(text,uuid,uuid,date) to anon, authenticated;
```

Também precisas de `get_available_days(p_slug,p_service_id,p_barber_id,p_from,p_to)` que devolve `date, slots_count` — o calendário do assistente usa isto para desenhar um ponto lilás nos dias com vaga e esbater os dias cheios. **Nunca mostres um dia clicável que abre vazio.**

---

## 9. RPCs DE ESCRITA

### 9.1 Marcar

```sql
create or replace function public.book_appointment(
  p_slug text, p_service_id uuid, p_haircut_id uuid, p_barber_id uuid,
  p_start timestamptz, p_name text, p_phone text, p_email text default null)
returns table(appointment_id uuid, manage_token uuid, deposit_cents int, needs_payment boolean)
language plpgsql security definer set search_path=public as $$
declare v_shop barbershops%rowtype; v_svc services%rowtype;
        v_barber uuid; v_end timestamptz; v_cust uuid; v_id uuid;
        v_tok uuid; v_dep int:=0; v_status appointment_status; v_dstate deposit_state;
begin
  if p_name is null or length(btrim(p_name))<2 then raise exception 'INVALID_NAME'; end if;
  if p_phone !~ '^\+?258?8[2-7][0-9]{7}$' then raise exception 'INVALID_PHONE'; end if;

  select * into v_shop from barbershops where slug=p_slug and status in ('active','trial');
  if not found then raise exception 'BARBERSHOP_NOT_FOUND'; end if;
  select * into v_svc from services where id=p_service_id and barbershop_id=v_shop.id and is_active;
  if not found then raise exception 'SERVICE_NOT_FOUND'; end if;

  v_end := p_start + make_interval(mins=>v_svc.duration_min);

  -- "qualquer barbeiro": o motor decide, o cliente não escolhe às cegas
  if p_barber_id is null then
    select (barber_ids)[1] into v_barber
    from get_available_slots(p_slug,p_service_id,null,(p_start at time zone v_shop.timezone)::date)
    where slot_start=p_start;
  else
    v_barber:=p_barber_id;
  end if;
  if v_barber is null then raise exception 'SLOT_UNAVAILABLE'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_barber::text,0));

  if not exists (select 1 from get_available_slots(p_slug,p_service_id,v_barber,
                   (p_start at time zone v_shop.timezone)::date) where slot_start=p_start)
  then raise exception 'SLOT_UNAVAILABLE'; end if;

  insert into customers(barbershop_id,name,phone,email)
  values (v_shop.id,btrim(p_name),p_phone,nullif(p_email,''))
  on conflict (barbershop_id,phone) do update
    set name=excluded.name, email=coalesce(excluded.email,customers.email)
  returning id into v_cust;

  if v_shop.deposit_enabled and v_svc.requires_deposit then
    v_dep := case v_shop.deposit_mode
               when 'percent' then round(v_svc.price_cents*v_shop.deposit_value/100.0)::int
               else v_shop.deposit_value end;
    v_status:='pending'; v_dstate:='awaiting';
  else
    v_status:='confirmed'; v_dstate:='not_required';
  end if;

  begin
    insert into appointments(barbershop_id,barber_id,service_id,haircut_id,customer_id,
      starts_at,ends_at,duration_min,price_cents,status,deposit_status,deposit_cents,
      hold_expires_at,source)
    values (v_shop.id,v_barber,p_service_id,p_haircut_id,v_cust,
      p_start,v_end,v_svc.duration_min,v_svc.price_cents,v_status,v_dstate,v_dep,
      case when v_dep>0 then now()+make_interval(mins=>v_shop.deposit_hold_min) end,'online')
    returning id,manage_token into v_id,v_tok;
  exception when exclusion_violation then
    raise exception 'SLOT_TAKEN';
  end;

  perform enqueue_appointment_notifications(v_id);
  return query select v_id,v_tok,v_dep,(v_dep>0);
end $$;

grant execute on function public.book_appointment(text,uuid,uuid,uuid,timestamptz,text,text,text) to anon, authenticated;
```

A `enqueue_appointment_notifications(uuid)` insere em `notifications`: confirmação imediata, lembrete `starts_at - 24h`, lembrete `starts_at - 1h`, e pedido de avaliação `completed_at + 1h` (este último criado por trigger ao concluir).

### 9.2 Gestão pelo cliente (por token)

`get_appointment_by_token(uuid)`, `cancel_by_token(uuid,text)`, `reschedule_by_token(uuid,timestamptz)`.
Todas validam a política antes de tocar na marcação:

```sql
v_hours := case v_shop.cancellation_rule
             when 'flex_2h' then 2 when 'moderate_6h' then 6
             when 'strict_24h' then 24 else null end;
if v_hours is null or now() > a.starts_at - make_interval(hours=>v_hours)
  then raise exception 'POLICY_LOCKED'; end if;
```

As 4 regras que a barbearia escolhe nas definições, com texto que o cliente lê:
1. **Flexível** — cancela ou remarca até 2 horas antes
2. **Moderada** — até 6 horas antes
3. **Rigorosa** — até 24 horas antes
4. **Só por contacto** — alterações apenas falando com a barbearia

Quando `POLICY_LOCKED`, o ecrã não mostra um erro seco: mostra o botão **Falar com a barbearia** com mensagem WhatsApp já escrita.

### 9.3 Lista de espera sem corrida

Ao cancelar (`cancel_by_token`, cancelamento interno ou expiração de sinal), dispara `offer_next_waitlist(p_shop, p_barber, p_slot_start)`:

```
-- selecciona a entrada 'waiting' mais antiga compatível (serviço, barbeiro, data, período)
-- FOR UPDATE SKIP LOCKED  → duas vagas nunca apanham a mesma pessoa
-- marca status='offered', offer_token, offer_expires_at = now()+15min
-- enfileira notificação com o link /vaga/{token}
```

`claim_waitlist_offer(p_token)` valida `status='offered' and offer_expires_at>now()`, adquire o mesmo advisory lock do barbeiro, chama a mesma lógica de inserção e marca `converted`. Se expirar, o cron passa à pessoa seguinte. **Uma vaga, uma pessoa de cada vez.**

---

## 10. EDGE FUNCTIONS E CRON

| Função | Gatilho | O que faz |
|---|---|---|
| `notify-dispatch` | cron `* * * * *` | envia `notifications` com `scheduled_for<=now()`; WhatsApp Cloud API se configurada, senão marca `skipped` e a barbearia vê o botão de envio manual |
| `holds-expire` | cron `*/2 * * * *` | cancela `pending` com `hold_expires_at`. Nunca deixes a barbearia sem forma de avisar o cliente.

Segredos apenas em Supabase Secrets: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `RESEND_API_KEY`, `MPESA_*`, `EMOLA_*`. Nunca no browser.

---

## 11. ESPECIFICAÇÃO ECRÃ A ECRÃ

### 11.1 Página pública `/barbearia/:slug`

Ordem no telemóvel — o herói é a barbearia, não um slogan:

1. Capa com a foto da barbearia, logo sobreposto em vidro, nome em 28px/500, e um chip vivo **Aberta · fecha às 19:00** ou **Fechada · abre amanhã às 09:00** (calculado a partir de `working_hours` e do fuso, não hardcoded).
2. Botão principal fixo no fundo: **Marcar corte** (lilás sólido, `rounded-full`, `rounded-2xl` no desktop). Está sempre visível.
3. Serviços — cartões com nome, duração e preço. Preço formatado `1 200 MT`.
4. Catálogo de cortes — carrossel horizontal com fotos 3:4, nome e duração. Tocar num corte abre o assistente já no passo do horário com serviço e corte preenchidos. Este é o atalho mais usado; trata-o como caminho principal.
5. Barbeiros — avatar, nome, anos de experiência, estrelas e número de avaliações.
6. Horário da semana, com o dia de hoje destacado.
7. Localização (mapa estático + botão de direcções), telefone, WhatsApp, Instagram.

Estilos de corte a semear no catálogo: Low fade, Mid fade, High fade, Taper fade, Skin fade, Drop fade, Burst fade, Buzz cut, Crew cut, Caesar, French crop, Pompadour, Quiff, Slick back, Afro shape-up, Waves, Twists, Dreads retwist, Corte à tesoura, Corte infantil, Design freestyle, Careca à navalha.

### 11.2 Assistente de marcação `/barbearia/:slug/marcar`

Seis passos, um por ecrã, estado sincronizado nos *search params* (back do telemóvel funciona, o link é partilhável):

`Serviço → Corte → Barbeiro → Data → Hora → Dados`

- Barra de progresso: linha de 2px lilás, sem números nem "Passo 3 de 6" em maiúsculas.
- Passo Corte tem **Saltar** — nem toda a gente sabe o nome do corte.
- Barbeiro: cartões, com **Qualquer barbeiro** primeiro e etiquetado *o mais cedo possível*.
- Data: 14 dias em faixa horizontal; ponto lilás = tem vaga, esbatido = cheio, dias fechados não aparecem.
- Hora: agrupada em **Manhã · Tarde · Noite**. Chips `rounded-2xl`. Se não houver nada: painel de lista de espera imediatamente, não uma página vazia.
- Dados: nome e telemóvel com máscara `+258 84 000 0000` e validação `^(8[2-7])\d{7}$`. Email opcional.
- Barra de resumo em vidro colada ao fundo em todos os passos: serviço · duração · preço · sinal, se aplicável.
- Confirmação: hora grande, botões **Adicionar ao calendário** (.ics), **Guardar link da marcação**, **Falar no WhatsApp**. Explica a regra de cancelamento em uma frase.

Se a RPC devolver `SLOT_TAKEN`, não mostres um alerta vermelho: recarrega os horários, marca o slot perdido e diz *"Esse horário foi ocupado há instantes. Escolhe outro."*

### 11.3 Agenda `/app/agenda`

O ecrã mais usado do produto. Timeline vertical, colunas por barbeiro, linha do tempo actual em lilás a atravessar o painel.

- Vistas **Dia** e **Semana** (`layoutId` na troca).
- Cada bloco mostra hora, cliente, serviço, corte e uma barra lateral de 3px com a cor do estado.
- Arrastar um bloco remarca (optimistic update + rollback se o Postgres recusar).
- Toque longo / clique direito: confirmar, iniciar, concluir, faltou, remarcar, cancelar, WhatsApp.
- Realtime do Supabase em `appointments` — se o gerente marca ao balcão, o telemóvel do barbeiro actualiza sem refrescar.
- Botão flutuante **Nova marcação** abre o mesmo motor de disponibilidade, com opção de forçar encaixe (só dono/gerente, fica no `audit_logs`).

Estados e cores: Pendente `--st-pending` · Confirmada `--st-confirmed` · Em atendimento `--st-active` (com pulso lento) · Concluída `--st-done` · Cancelada `--st-cancelled` (riscada) · Faltou `--st-noshow`.

### 11.4 Dashboard `/app`

Quatro KPIs em números grandes sem ícones decorativos: marcações de hoje, ocupação da agenda (%), receita estimada de hoje, faltas do mês. Por baixo: **A seguir** (próximas 5 marcações) e **Precisa de atenção** (pendentes sem sinal, lista de espera com vaga possível, avaliações novas). Se não há nada a fazer, diz isso — não inventes cartões.

### 11.5 Clientes

Lista com pesquisa em pílula por nome ou telemóvel. Ficha do cliente: última visita, número de visitas, serviços e cortes habituais, faltas, notas livres (*"Máquina 2 nas laterais, topo mais comprido"*) e histórico. Sem funil, sem tags de CRM, sem pontuação — isto é uma ficha de barbearia.

### 11.6 Serviços, cortes, barbeiros, horários

Tabelas editáveis com reordenação por arrastar, interruptor activo/inactivo, e upload de foto directo para o Storage com recorte. No ecrã de horários: grelha semanal para o horário base, mais uma lista de bloqueios com os motivos (almoço, folga, feriado, reunião, manutenção, ausência, imprevisto).

### 11.7 Definições → Link e QR

Link copiável, QR Code gerado no cliente, e **Descarregar cartaz** — PNG A5 pronto a imprimir para o espelho e o balcão, com o QR, o nome da barbearia e a frase *Marca o teu corte em 30 segundos*. Isto é Service Design: o momento de contacto físico é onde a adopção acontece.

### 11.8 Relatórios

Períodos hoje / semana / mês. Marcações, serviços mais pedidos, cortes mais escolhidos, ocupação, cancelamentos, faltas, concluídas, receita estimada, sinais recebidos, receita por serviço. Barras finas lilás sobre vidro. Exportar CSV. Sem contabilidade, sem previsões.

### 11.9 Administração `/admin`

Tabela densa de barbearias com estado, plano, número de marcações e última actividade. Pesquisa, activar/suspender, gerir planos e subscrições, pagamentos da plataforma, métricas globais e fila de suporte. Visual mais sóbrio: menos brilho, mais informação por pixel.

---

## 12. ESTADOS, ERROS E VAZIOS

Cada lista tem quatro estados desenhados: **a carregar** (skeleton de vidro), **vazio**, **erro**, **cheio**. Nada de `

Loading...

`.

Vazios convidam à acção, no tom da interface:
- Agenda sem marcações: *"Nada marcado para hoje. Partilha o teu link para encher a agenda."* + botão que copia o link.
- Sem serviços: *"Cria o primeiro serviço para abrir a agenda."*

Erros dizem o que falhou e o que fazer, sem pedir desculpa e sem vaguidade. Mapeia cada excepção da base de dados para uma frase:

| Excepção | Mensagem |
|---|---|
| `SLOT_TAKEN` / `SLOT_UNAVAILABLE` | Esse horário foi ocupado. Escolhe outro. |
| `POLICY_LOCKED` | Já passou o prazo para alterar online. Fala com a barbearia. |
| `INVALID_PHONE` | Número inválido. Usa o formato 84 000 0000. |
| `BARBERSHOP_NOT_FOUND` | Esta barbearia não está disponível. |

---

## 13. SERVICE DESIGN — O PERCURSO COMPLETO

| Momento | O cliente | Palco | Bastidores | Sistema |
|---|---|---|---|---|
| Descoberta | Vê o QR no espelho ou o link no Instagram | Cartaz, bio | — | `slug` público |
| Escolha | Abre a página, vê cortes e preços | Página pública | — | leitura `anon` |
| Marcação | 6 passos, sem conta | Assistente | — | `get_available_slots` + `book_appointment` |
| Garantia | Paga sinal, se exigido | Ecrã M-Pesa / e-Mola | — | `payments-initiate` + webhook |
| Espera | Recebe confirmação e lembretes | WhatsApp / email | Fila de notificações | `notify-dispatch` |
| Alteração | Cancela ou remarca pelo link | `/marcacao/:token` | Vaga volta ao mercado | `offer_next_waitlist` |
| Chegada | Entra na barbearia | Balcão | Barbeiro vê nome, corte e notas | agenda realtime |
| Atendimento | Corta | Cadeira | Barbeiro marca em atendimento → concluído | update de estado |
| Saída | Recebe pedido de avaliação 1h depois | WhatsApp / email | Média do barbeiro actualiza | `reviews` + trigger |
| Regresso | Vê a mesma página, já com o seu histórico | Página pública | Notas do cliente prontas | `customers` |

---

## 14. PLANO DE EXECUÇÃO (não saltes fases)

**Fase 1 — Fundações.** Supabase ligado, migração completa da secção 6, RLS da secção 7, tokens e tema da secção 3, layout com sidebar colapsável + dock flutuante, autenticação e guardas de rota. Entrega com base de dados real e zero mock.

**Fase 2 — Configuração da barbearia.** Onboarding de 9 passos, serviços, cortes, barbeiros, horários, bloqueios, definições, link e QR, 10 temas.

**Fase 3 — Motor e marcação pública.** `get_available_slots`, `get_available_days`, `book_appointment`, página pública, assistente de 6 passos, gestão por token, .ics.

**Fase 4 — Operação.** Agenda dia/semana com realtime e arrastar, marcação manual, estados, clientes, notas.

**Fase 5 — Retenção.** Notificações e cron, lista de espera com `SKIP LOCKED`, avaliações, médias dos barbeiros.

**Fase 6 — Dinheiro e escala.** Sinal M-Pesa/e-Mola com hold e expiração, relatórios, painel de administração, planos.

---

## 15. CRITÉRIOS DE ACEITAÇÃO

Não declares nada pronto sem passar isto:

1. Duas marcações simultâneas no mesmo barbeiro e horário → uma confirma, a outra recebe `SLOT_TAKEN`. Nunca duas linhas.
2. Serviço de 40 min às 10:00 → 10:15 e 10:30 desaparecem da grelha desse barbeiro.
3. Bloqueio de almoço 12:00–13:00 → nenhum slot cabe dentro nem atravessa o limite.
4. Barbeiro autenticado tenta ler a marcação de outro barbeiro → 0 linhas por RLS.
5. `anon` tenta `insert` directo em `appointments` → recusado.
6. Regra "até 2 horas antes": a 1h59 do início, o cancelamento online está bloqueado e aparece o botão de WhatsApp.
7. Cancelamento liberta a vaga e apenas **uma** pessoa da lista de espera recebe a oferta, com 15 minutos de validade.
8. Sinal não pago em 10 minutos → marcação cancelada e horário de volta à grelha.
9. Horários corretos em `Africa/Maputo` independentemente do relógio do dispositivo.
10. Página pública abaixo de 2,5s em 3G simulado; `prefers-reduced-motion` desliga o movimento; foco de teclado visível em tudo.
11. Lighthouse acessibilidade ≥ 90 na página pública e no assistente.

---

**Começa agora pela Fase 1. Mostra-me a migração SQL e o layout antes de avançar.**

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/549811e6-6009-448f-842b-0d85cca16c79).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

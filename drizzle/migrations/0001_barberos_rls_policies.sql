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

create or replace function public.shop_is_public(p_shop uuid) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from barbershops b where b.id=p_shop and b.status in ('active','trial'));
$$;

grant execute on function public.shop_is_public(uuid) to anon, authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- profiles
alter table public.profiles enable row level security;
create policy profiles_self_read on public.profiles for select to authenticated
  using (id = auth.uid() or is_platform_admin());
create policy profiles_self_write on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_self_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- plans
alter table public.plans enable row level security;
create policy plans_read on public.plans for select to anon, authenticated using (is_active or is_platform_admin());
create policy plans_admin on public.plans for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

-- barbershops
alter table public.barbershops enable row level security;
create policy shops_public_read on public.barbershops for select to anon, authenticated
  using (status in ('active','trial'));
create policy shops_member_read on public.barbershops for select to authenticated
  using (is_member(id) or is_platform_admin());
create policy shops_insert on public.barbershops for insert to authenticated with check (true);
create policy shops_update on public.barbershops for update to authenticated
  using (is_member(id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(id, array['owner','manager']::app_role[]) or is_platform_admin());
create policy shops_delete on public.barbershops for delete to authenticated
  using (is_member(id, array['owner']::app_role[]) or is_platform_admin());

-- members
alter table public.barbershop_members enable row level security;
create policy members_read on public.barbershop_members for select to authenticated
  using (user_id = auth.uid() or is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());
create policy members_insert on public.barbershop_members for insert to authenticated
  with check (user_id = auth.uid() or is_member(barbershop_id, array['owner']::app_role[]) or is_platform_admin());
create policy members_write on public.barbershop_members for update to authenticated
  using (is_member(barbershop_id, array['owner']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner']::app_role[]) or is_platform_admin());
create policy members_delete on public.barbershop_members for delete to authenticated
  using (is_member(barbershop_id, array['owner']::app_role[]) or is_platform_admin());

-- barbers
alter table public.barbers enable row level security;
create policy barbers_public_read on public.barbers for select to anon, authenticated
  using ((is_active and shop_is_public(barbershop_id)) or is_member(barbershop_id) or is_platform_admin());
create policy barbers_write on public.barbers for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- services
alter table public.services enable row level security;
create policy services_public_read on public.services for select to anon, authenticated
  using ((is_active and shop_is_public(barbershop_id)) or is_member(barbershop_id) or is_platform_admin());
create policy services_write on public.services for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- barber_services
alter table public.barber_services enable row level security;
create policy bsvc_read on public.barber_services for select to anon, authenticated using (true);
create policy bsvc_write on public.barber_services for all to authenticated
  using (exists(select 1 from barbers b where b.id=barber_id and (is_member(b.barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())))
  with check (exists(select 1 from barbers b where b.id=barber_id and (is_member(b.barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())));

-- haircuts
alter table public.haircuts enable row level security;
create policy haircuts_public_read on public.haircuts for select to anon, authenticated
  using ((is_active and shop_is_public(barbershop_id)) or is_member(barbershop_id) or is_platform_admin());
create policy haircuts_write on public.haircuts for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- working_hours
alter table public.working_hours enable row level security;
create policy wh_public_read on public.working_hours for select to anon, authenticated
  using (shop_is_public(barbershop_id) or is_member(barbershop_id) or is_platform_admin());
create policy wh_write on public.working_hours for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- time_blocks
alter table public.time_blocks enable row level security;
create policy tb_read on public.time_blocks for select to authenticated
  using (is_member(barbershop_id) or is_platform_admin());
create policy tb_write on public.time_blocks for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- customers
alter table public.customers enable row level security;
create policy cust_read on public.customers for select to authenticated
  using (is_member(barbershop_id) or is_platform_admin());
create policy cust_write on public.customers for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- appointments
alter table public.appointments enable row level security;
create policy appt_read on public.appointments for select to authenticated using (
  is_platform_admin()
  or is_member(barbershop_id, array['owner','manager']::app_role[])
  or (is_member(barbershop_id, array['barber']::app_role[]) and barber_id = my_barber_id(barbershop_id))
);
create policy appt_write on public.appointments for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]))
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]));
create policy appt_barber_update on public.appointments for update to authenticated
  using (is_member(barbershop_id, array['barber']::app_role[]) and barber_id = my_barber_id(barbershop_id))
  with check (status in ('in_progress','completed','no_show'));

-- waitlist
alter table public.waitlist_entries enable row level security;
create policy wl_read on public.waitlist_entries for select to authenticated
  using (is_member(barbershop_id) or is_platform_admin());
create policy wl_write on public.waitlist_entries for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- reviews
alter table public.reviews enable row level security;
create policy reviews_public_read on public.reviews for select to anon, authenticated
  using ((is_published and shop_is_public(barbershop_id)) or is_member(barbershop_id) or is_platform_admin());
create policy reviews_write on public.reviews for all to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- payments
alter table public.payments enable row level security;
create policy pay_read on public.payments for select to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- notifications
alter table public.notifications enable row level security;
create policy notif_read on public.notifications for select to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());
create policy notif_update on public.notifications for update to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin())
  with check (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());

-- audit logs
alter table public.audit_logs enable row level security;
create policy audit_read on public.audit_logs for select to authenticated
  using (is_member(barbershop_id, array['owner','manager']::app_role[]) or is_platform_admin());
create policy audit_insert on public.audit_logs for insert to authenticated
  with check (is_member(barbershop_id) or is_platform_admin());
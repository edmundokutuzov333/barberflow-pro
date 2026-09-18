-- Leitura pública (anon e autenticados) das fotos de barbearias activas,
-- escrita restrita a membros da barbearia dona da pasta {barbershop_id}/...

create policy "Media publica de barbearias visiveis"
on storage.objects for select
to anon, authenticated
using (
  bucket_id in ('shop-logos','shop-photos','barbers','haircuts')
  and public.shop_is_public(nullif(split_part(name, '/', 1), '')::uuid)
);

create policy "Membros veem a media da sua barbearia"
on storage.objects for select
to authenticated
using (
  bucket_id in ('shop-logos','shop-photos','barbers','haircuts')
  and public.is_member(nullif(split_part(name, '/', 1), '')::uuid, array['owner','manager','barber']::public.app_role[])
);

create policy "Membros carregam media da sua barbearia"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('shop-logos','shop-photos','barbers','haircuts')
  and public.is_member(nullif(split_part(name, '/', 1), '')::uuid, array['owner','manager']::public.app_role[])
);

create policy "Membros actualizam media da sua barbearia"
on storage.objects for update
to authenticated
using (
  bucket_id in ('shop-logos','shop-photos','barbers','haircuts')
  and public.is_member(nullif(split_part(name, '/', 1), '')::uuid, array['owner','manager']::public.app_role[])
);

create policy "Membros apagam media da sua barbearia"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('shop-logos','shop-photos','barbers','haircuts')
  and public.is_member(nullif(split_part(name, '/', 1), '')::uuid, array['owner','manager']::public.app_role[])
);

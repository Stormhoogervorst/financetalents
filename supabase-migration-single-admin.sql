-- ─────────────────────────────────────────────────────────────────────────────
-- Single-admin constraint
-- ─────────────────────────────────────────────────────────────────────────────
-- Doel: in public.profiles mag er maximaal één rij staan met role = 'admin'.
-- Een tweede UPDATE of INSERT die iemand op 'admin' probeert te zetten faalt
-- met een unique_violation — ook wanneer iemand rechtstreeks in de DB werkt.
--
-- Werkt via een partiële unique index op een constante expressie. Omdat de
-- index maar één mogelijke sleutelwaarde toelaat (TRUE) en alleen admin-rijen
-- indexeert, kan er fysiek maar één admin-rij bestaan.
--
-- Idempotent: drop + create.
-- ─────────────────────────────────────────────────────────────────────────────

drop index if exists public.profiles_single_admin_idx;

create unique index profiles_single_admin_idx
  on public.profiles ((true))
  where role = 'admin';

-- Verificatie (optioneel):
-- select id, email, role from public.profiles where role = 'admin';

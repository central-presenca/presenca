-- Presença de Culto – base de dados de uma unidade (Supabase).
-- Rodar inteiro no SQL Editor de um projeto novo do Supabase (ex.: Central Boulevard).
-- Cada unidade tem o seu próprio projeto; o código da página (core/) é o mesmo para todas.

create table if not exists public.autorizados (
  email text primary key,
  papel text not null default 'leitor' check (papel in ('leitor','editor'))
);
-- Os e-mails ficam só no Supabase (não neste repositório público). Exemplo:
-- insert into public.autorizados (email, papel) values ('nome@exemplo.com','editor');

create table if not exists public.cultos (
  id text primary key,                 -- "AAAA-MM-DD_<id do culto>"
  data date not null,
  culto text not null,                 -- id do culto em unidades/<unidade>.js
  dados jsonb not null,
  atualizado_em timestamptz not null default now(),
  atualizado_por text
);

create table if not exists public.registro (
  id bigint generated always as identity primary key,
  em timestamptz not null default now(),
  por text,
  acao text not null,
  data date,
  culto text,
  det text
);

create table if not exists public.config (
  id int primary key default 1 check (id = 1),
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);
insert into public.config (id, dados)
values (1, '{"capAud":0,"capCdc":0,"capCarros":0,"capMotos":0,"essenciais":["Segurança","Enfermaria"]}')
on conflict do nothing;

-- Papel de quem está logado: 'leitor', 'editor' ou nulo (sem acesso)
create or replace function public.meu_papel() returns text
language sql stable security definer set search_path = public as $$
  select papel from public.autorizados where email = lower(coalesce(auth.jwt()->>'email',''));
$$;
grant execute on function public.meu_papel() to anon, authenticated;

create or replace function public.pode_editar() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_papel() = 'editor', false);
$$;
grant execute on function public.pode_editar() to anon, authenticated;

-- Registro automático: quem lançou, editou ou excluiu
create or replace function public.tg_cultos() returns trigger
language plpgsql security definer set search_path = public as $$
declare e text := lower(coalesce(auth.jwt()->>'email','sistema'));
begin
  if tg_op = 'DELETE' then
    insert into public.registro (por, acao, data, culto, det)
    values (e, 'Excluiu', old.data, old.culto, 'total geral ' || coalesce(old.dados->>'totalGeral','?'));
    return old;
  end if;
  new.atualizado_em := now();
  new.atualizado_por := e;
  insert into public.registro (por, acao, data, culto, det)
  values (e, case when tg_op = 'INSERT' then 'Lançou' else 'Editou' end, new.data, new.culto,
          'total geral ' || coalesce(new.dados->>'totalGeral','?'));
  return new;
end $$;
drop trigger if exists t_cultos on public.cultos;
create trigger t_cultos before insert or update or delete on public.cultos
for each row execute function public.tg_cultos();

create or replace function public.tg_config() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.atualizado_em := now();
  insert into public.registro (por, acao) values (lower(coalesce(auth.jwt()->>'email','sistema')), 'Alterou configurações');
  return new;
end $$;
drop trigger if exists t_config on public.config;
create trigger t_config before update on public.config
for each row execute function public.tg_config();

create or replace function public.tg_registro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.em := now();
  new.por := lower(coalesce(auth.jwt()->>'email', new.por, 'sistema'));
  return new;
end $$;
drop trigger if exists t_registro on public.registro;
create trigger t_registro before insert on public.registro
for each row execute function public.tg_registro();

-- Regras de acesso: só e-mails cadastrados veem; só editores alteram
alter table public.autorizados enable row level security;
alter table public.cultos enable row level security;
alter table public.registro enable row level security;
alter table public.config enable row level security;

drop policy if exists cultos_ler on public.cultos;
drop policy if exists cultos_inserir on public.cultos;
drop policy if exists cultos_alterar on public.cultos;
drop policy if exists cultos_excluir on public.cultos;
create policy cultos_ler on public.cultos for select using (public.meu_papel() is not null);
create policy cultos_inserir on public.cultos for insert with check (public.pode_editar());
create policy cultos_alterar on public.cultos for update using (public.pode_editar()) with check (public.pode_editar());
create policy cultos_excluir on public.cultos for delete using (public.pode_editar());

drop policy if exists config_ler on public.config;
drop policy if exists config_alterar on public.config;
create policy config_ler on public.config for select using (public.meu_papel() is not null);
create policy config_alterar on public.config for update using (public.pode_editar()) with check (public.pode_editar());

drop policy if exists registro_ler on public.registro;
drop policy if exists registro_inserir on public.registro;
create policy registro_ler on public.registro for select using (public.pode_editar());
create policy registro_inserir on public.registro for insert with check (public.pode_editar());

-- ── TABELAS ────────────────────────────────────────────────────────────────

create table if not exists servicos_cliente (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  consultoria boolean default false,
  conteudo boolean default false,
  processos boolean default false,
  treinamento boolean default false,
  mentoria boolean default false,
  criado_em timestamptz default now()
);
create table if not exists materiais (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  nome text not null, tipo text, descricao text, url text,
  visivel boolean default true,
  criado_em timestamptz default now()
);
create table if not exists processos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  titulo text not null, descricao text, tipo text default 'Manual',
  conteudo text, status text default 'Ativo',
  criado_em timestamptz default now()
);
create table if not exists mentorias (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  titulo text, data date, duracao integer,
  link_gravacao text, anotacoes text,
  proxima_sessao date, status text default 'Concluída',
  criado_em timestamptz default now()
);

-- ── COLUNA DE VIDEOAULA NOS MÓDULOS ────────────────────────────────────────
-- Execute apenas se a coluna ainda não existir
alter table modulos add column if not exists video_youtube text;

-- ── REVOGAR ACESSO ANÔNIMO ──────────────────────────────────────────────────
-- anon não deve ter acesso direto a nenhuma tabela de dados
revoke all on table public.servicos_cliente from anon;
revoke all on table public.materiais       from anon;
revoke all on table public.processos       from anon;
revoke all on table public.mentorias       from anon;

-- Apenas o role 'authenticated' opera nas tabelas
grant select, insert, update, delete on table public.servicos_cliente to authenticated;
grant select, insert, update, delete on table public.materiais         to authenticated;
grant select, insert, update, delete on table public.processos         to authenticated;
grant select, insert, update, delete on table public.mentorias         to authenticated;

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table servicos_cliente enable row level security;
alter table materiais         enable row level security;
alter table processos         enable row level security;
alter table mentorias         enable row level security;

-- Cada cliente só acessa seus próprios registros
-- (adaptar auth.uid() ao campo de usuário conforme a coluna de referência do projeto)
create policy if not exists "cliente_ve_seus_servicos"
  on servicos_cliente for all using (cliente_id = auth.uid());

create policy if not exists "cliente_ve_seus_materiais"
  on materiais for all using (cliente_id = auth.uid());

create policy if not exists "cliente_ve_seus_processos"
  on processos for all using (cliente_id = auth.uid());

create policy if not exists "cliente_ve_suas_mentorias"
  on mentorias for all using (cliente_id = auth.uid());

create table if not exists servicos_cliente (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id),
  consultoria boolean default false,
  conteudo boolean default false,
  processos boolean default false,
  treinamento boolean default false,
  mentoria boolean default false,
  criado_em timestamptz default now()
);
create table if not exists materiais (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id),
  nome text not null, tipo text, descricao text, url text,
  visivel boolean default true,
  criado_em timestamptz default now()
);
create table if not exists processos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id),
  titulo text not null, descricao text, tipo text default 'Manual',
  conteudo text, status text default 'Ativo',
  criado_em timestamptz default now()
);
create table if not exists mentorias (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id),
  titulo text, data date, duracao integer,
  link_gravacao text, anotacoes text,
  proxima_sessao date, status text default 'Concluída',
  criado_em timestamptz default now()
);
grant select, insert, update, delete on table public.servicos_cliente to anon;
grant select, insert, update, delete on table public.materiais to anon;
grant select, insert, update, delete on table public.processos to anon;
grant select, insert, update, delete on table public.mentorias to anon;
alter table servicos_cliente disable row level security;
alter table materiais disable row level security;
alter table processos disable row level security;
alter table mentorias disable row level security;

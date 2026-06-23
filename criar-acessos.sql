-- ============================================================
-- Portal FS Consultoria - Criação de acessos (login e senha)
-- Cole TODO este script no SQL Editor do Supabase e clique em RUN.
-- Ele é seguro de rodar várias vezes (idempotente).
-- ============================================================

-- 1) Garante que a tabela "usuarios" existe com as colunas que o app usa
CREATE TABLE IF NOT EXISTS usuarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text,
  email       text,
  senha       text,
  tipo        text DEFAULT 'cliente',
  cliente_id  uuid,
  ativo       boolean DEFAULT true,
  criado_em   timestamptz DEFAULT now()
);

-- 2) Caso a tabela já exista mas falte alguma coluna, adiciona.
--    (cobre o caso de a tabela ter sido criada só com "senha_hash")
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nome       text;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email      text;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha      text;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo       text DEFAULT 'cliente';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cliente_id uuid;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo      boolean DEFAULT true;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS criado_em  timestamptz DEFAULT now();

-- 3) Garante a constraint UNIQUE no email (necessária para o "upsert" abaixo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_unico'
  ) THEN
    ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unico UNIQUE (email);
  END IF;
END$$;

-- 4) Libera leitura/escrita para a chave anon (o app usa a anon key).
--    Sem isso o login retorna vazio mesmo com o usuário cadastrado.
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 5) ADMIN (acesso total ao painel)
INSERT INTO usuarios (nome, email, senha, tipo, ativo)
VALUES ('Isa Fernanda', 'isa@fsconsultoria.com', 'admin123', 'admin', true)
ON CONFLICT (email) DO UPDATE
  SET senha = EXCLUDED.senha,
      tipo  = 'admin',
      ativo = true;

-- 6) CLIENTE DE EXEMPLO (login simples, sem vínculo obrigatório)
INSERT INTO usuarios (nome, email, senha, tipo, ativo)
VALUES ('Cliente Exemplo', 'cliente@exemplo.com', 'cliente123', 'cliente', true)
ON CONFLICT (email) DO UPDATE
  SET senha = EXCLUDED.senha,
      tipo  = 'cliente',
      ativo = true;

-- 7) Confere o resultado
SELECT id, nome, email, senha, tipo, ativo FROM usuarios;

-- ============================================================
-- CREDENCIAIS:
--   ADMIN   -> email: isa@fsconsultoria.com   | senha: admin123
--   CLIENTE -> email: cliente@exemplo.com     | senha: cliente123
-- Troque as senhas depois de testar.
-- ============================================================

-- ============================================================
-- Portal FS Consultoria - Criação de acessos (login e senha)
-- Cole este script no SQL Editor do Supabase e execute (Run).
-- ============================================================

-- 1) ADMIN (acesso total ao painel)
INSERT INTO usuarios (nome, email, senha, tipo, ativo)
VALUES ('Isa Fernanda', 'isa@fsconsultoria.com', 'admin123', 'admin', true)
ON CONFLICT (email) DO UPDATE
  SET senha = EXCLUDED.senha,
      tipo  = 'admin',
      ativo = true;

-- 2) CLIENTE DE EXEMPLO
-- Primeiro cria (ou reaproveita) o registro do cliente...
WITH cli AS (
  INSERT INTO clientes (nome, negocio, segmento, cidade, email, valor, status, pagamento)
  VALUES ('Cliente Exemplo', 'Negócio Exemplo', 'Geral', 'São Paulo',
          'cliente@exemplo.com', 0, 'Em Andamento', 'PIX')
  ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
  RETURNING id
)
-- ...e em seguida cria o login do cliente vinculado a esse registro.
INSERT INTO usuarios (nome, email, senha, tipo, cliente_id, ativo)
SELECT 'Cliente Exemplo', 'cliente@exemplo.com', 'cliente123', 'cliente', cli.id, true
FROM cli
ON CONFLICT (email) DO UPDATE
  SET senha = EXCLUDED.senha,
      tipo  = 'cliente',
      ativo = true;

-- ============================================================
-- CREDENCIAIS CRIADAS:
--   ADMIN   -> email: isa@fsconsultoria.com    | senha: admin123
--   CLIENTE -> email: cliente@exemplo.com      | senha: cliente123
-- Troque as senhas depois de testar.
-- ============================================================

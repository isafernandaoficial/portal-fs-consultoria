# Relatório de Segurança — Portal FS Consultoria

## Vulnerabilidades Críticas Encontradas

### 1. CRÍTICO — Chave Supabase exposta no código (`src/App.jsx` linhas 4–5)
**Problema:** A `SB_KEY` está hardcoded no fonte, aparece no bundle JS e no histórico do Git.  
**Correção:**
```bash
# Crie o arquivo .env na raiz do projeto (nunca comitar)
VITE_SB_URL=https://ioybontcswdbblfsuutr.supabase.co
VITE_SB_KEY=<sua_chave_aqui>
```
```js
// Em src/App.jsx, substitua as linhas 4-5 por:
const SB_URL = import.meta.env.VITE_SB_URL;
const SB_KEY  = import.meta.env.VITE_SB_KEY;
```
Adicione `.env` ao `.gitignore`. **Revogue a chave atual no painel Supabase agora.**

---

### 2. CRÍTICO — Senhas em texto puro no código (`portal-v2.jsx` linha 17)
**Problema:** Senhas reais ("isa2026", "ana2026") hardcoded, visíveis no DevTools e no Git.  
**Correção:** Use o utilitário criado em `src/passwordUtils.js`:
```js
import { hashSenha, verificarSenha } from "./passwordUtils.js";

// Ao cadastrar usuário:
const hash = await hashSenha(senhaDigitada);
// Armazene `hash` no banco, NUNCA a senha pura.

// Ao fazer login:
const ok = await verificarSenha(senhaDigitada, hashDobanco);
```

---

### 3. CRÍTICO — Credenciais no localStorage (`src/App.jsx` linha 889)
**Problema:** `localStorage.setItem("pv-sessao", JSON.stringify({email,senha}))` persiste as credenciais em texto no browser.  
**Correção:**
```js
// Armazene apenas um token de sessão opaco, nunca email+senha:
localStorage.setItem("pv-sessao", JSON.stringify({ token: u.session_token }));
```
Ou melhor: use `supabase.auth.signInWithPassword()` — o Supabase Auth gerencia a sessão automaticamente com cookies seguros.

---

### 4. CRÍTICO — Row-Level Security (RLS) desativado (`src/App-servicos.jsx` linhas 37–40)
**Problema:** `alter table ... disable row level security` expõe todos os dados de todos os clientes para qualquer usuário autenticado.  
**Correção:**
```sql
-- Ative o RLS em todas as tabelas:
ALTER TABLE servicos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorias ENABLE ROW LEVEL SECURITY;

-- Crie políticas de acesso:
CREATE POLICY "cliente_ve_so_seus_dados"
  ON servicos_cliente FOR ALL
  USING (cliente_id = auth.uid());
```

---

### 5. ALTO — Permissões excessivas para `anon` (`src/App-servicos.jsx` linhas 33–36)
**Problema:** O role `anon` tem SELECT/INSERT/UPDATE/DELETE em todas as tabelas.  
**Correção:** Revogar e conceder apenas o necessário via RLS policies ao role `authenticated`.
```sql
REVOKE ALL ON TABLE servicos_cliente, materiais, processos, mentorias FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE servicos_cliente TO authenticated;
-- (repita para as demais tabelas)
```

---

### 6. MÉDIO — Sem paginação nas consultas (`src/App.jsx` linha 24)
**Problema:** `db.get(table)` carrega TODOS os registros.  
**Correção:**
```js
get: (table, q = "", limit = 50, offset = 0) =>
  sb(`${table}?${q}&order=criado_em.desc&limit=${limit}&offset=${offset}`),
```

---

### 7. MÉDIO — Erro silencioso em blocos catch vazios (`dashboard.jsx` linha 65)
**Problema:** `catch {}` oculta erros reais.  
**Correção:**
```js
catch(e) { console.error("[dashboard] falha ao carregar clientes:", e); }
```

---

## Novos Utilitários Criados

| Arquivo | O que faz |
|---|---|
| `src/passwordUtils.js` | Geração segura de senhas, hash PBKDF2, verificação, análise de força |
| `src/GeradorSenha.jsx` | Componente React com UI para gerar senhas (use em qualquer tela) |

### Como usar o componente:
```jsx
import GeradorSenha from "./GeradorSenha.jsx";

// Em qualquer tela do admin ou perfil:
<GeradorSenha />
```

### Como fazer hash de senha no cadastro:
```js
import { hashSenha, verificarSenha, avaliarForca } from "./passwordUtils.js";

// Validar antes de salvar
const { nivel } = avaliarForca(senha);
if (nivel === "Muito Fraca" || nivel === "Fraca") {
  return setErro("Senha fraca demais. Use o gerador para criar uma senha segura.");
}

// Salvar com hash
const hash = await hashSenha(senha);
await db.insert("usuarios", { ...dados, senha: hash });

// Login
const u = await db.getOne("usuarios", `email=eq.${email}`);
if (!u || !(await verificarSenha(senhaDigitada, u.senha))) return false;
```

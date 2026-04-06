import { useState } from "react";

const C = {
  verde: "#153029",
  verdeM: "#1A4738",
  cobre: "#AD7F67",
  cobreL: "#C99A80",
  lavanda: "#E6E1E7",
  branco: "#F9F7F4",
  cinza: "#8A8580",
  preto: "#0D1F1A",
};

const ENTIDADES = [
  {
    id: "usuarios",
    emoji: "🔐",
    nome: "Usuários",
    descricao: "Login e controle de acesso",
    visivel: "Sistema",
    cor: "#2D6A4F",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "nome", tipo: "Texto" },
      { nome: "email", tipo: "Email", unico: true },
      { nome: "senha_hash", tipo: "Hash" },
      { nome: "tipo", tipo: "admin | cliente" },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "ativo", tipo: "Boolean" },
      { nome: "ultimo_acesso", tipo: "DateTime" },
    ],
  },
  {
    id: "clientes",
    emoji: "👥",
    nome: "Clientes",
    descricao: "Perfil completo de cada cliente",
    visivel: "Admin + Cliente",
    cor: "#1A4738",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "nome", tipo: "Texto" },
      { nome: "negocio", tipo: "Texto" },
      { nome: "segmento", tipo: "Texto" },
      { nome: "cidade", tipo: "Texto" },
      { nome: "whatsapp", tipo: "Telefone" },
      { nome: "email", tipo: "Email" },
      { nome: "status", tipo: "SELECT" },
      { nome: "tipo_servico", tipo: "SELECT" },
      { nome: "valor_acordado", tipo: "Decimal" },
      { nome: "forma_pagamento", tipo: "SELECT" },
      { nome: "data_inicio", tipo: "Date" },
      { nome: "data_encerramento", tipo: "Date" },
      { nome: "cor_perfil", tipo: "HEX" },
      { nome: "notas_internas", tipo: "Texto longo" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
  {
    id: "financeiro",
    emoji: "💰",
    nome: "Financeiro",
    descricao: "Receitas, despesas e fluxo de caixa",
    visivel: "Admin + Cliente",
    cor: "#AD7F67",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "tipo", tipo: "receita | despesa | permuta" },
      { nome: "descricao", tipo: "Texto" },
      { nome: "valor", tipo: "Decimal" },
      { nome: "data", tipo: "Date" },
      { nome: "categoria", tipo: "SELECT" },
      { nome: "status_pagamento", tipo: "SELECT" },
      { nome: "comprovante_url", tipo: "URL" },
      { nome: "mes_referencia", tipo: "Texto" },
      { nome: "inserido_por", tipo: "admin | cliente" },
      { nome: "notas", tipo: "Texto" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
  {
    id: "treinamentos",
    emoji: "🎓",
    nome: "Treinamentos",
    descricao: "Módulos, progresso e certificações",
    visivel: "Admin + Cliente",
    cor: "#4EADCF",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "nome_treinamento", tipo: "Texto" },
      { nome: "descricao", tipo: "Texto longo" },
      { nome: "total_modulos", tipo: "Integer" },
      { nome: "modulos_concluidos", tipo: "Integer" },
      { nome: "status", tipo: "SELECT" },
      { nome: "data_inicio", tipo: "Date" },
      { nome: "data_conclusao", tipo: "Date" },
      { nome: "certificado_emitido", tipo: "Boolean" },
      { nome: "link_material", tipo: "URL" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
  {
    id: "modulos",
    emoji: "📚",
    nome: "Módulos de Treinamento",
    descricao: "Cada módulo dentro de um treinamento",
    visivel: "Admin + Cliente",
    cor: "#3A8FA0",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "treinamento_id", tipo: "→ Treinamentos", fk: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "numero", tipo: "Integer" },
      { nome: "titulo", tipo: "Texto" },
      { nome: "descricao", tipo: "Texto longo" },
      { nome: "concluido", tipo: "Boolean" },
      { nome: "data_conclusao", tipo: "Date" },
      { nome: "anotacoes_cliente", tipo: "Texto longo" },
      { nome: "avaliacao", tipo: "1–5" },
    ],
  },
  {
    id: "tarefas",
    emoji: "✅",
    nome: "Tarefas",
    descricao: "Ações e entregas por cliente",
    visivel: "Admin + Cliente",
    cor: "#52C97A",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "titulo", tipo: "Texto" },
      { nome: "descricao", tipo: "Texto longo" },
      { nome: "status", tipo: "SELECT" },
      { nome: "prioridade", tipo: "SELECT" },
      { nome: "responsavel", tipo: "admin | cliente" },
      { nome: "data_limite", tipo: "Date" },
      { nome: "data_conclusao", tipo: "Date" },
      { nome: "criado_por", tipo: "admin | cliente" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
  {
    id: "reunioes",
    emoji: "🗓️",
    nome: "Reuniões",
    descricao: "Histórico de encontros e decisões",
    visivel: "Admin + Cliente",
    cor: "#E8974D",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "titulo", tipo: "Texto" },
      { nome: "data", tipo: "DateTime" },
      { nome: "tipo", tipo: "SELECT" },
      { nome: "pauta", tipo: "Texto longo" },
      { nome: "decisoes", tipo: "Texto longo" },
      { nome: "proximas_acoes", tipo: "Texto longo" },
      { nome: "duracao_min", tipo: "Integer" },
      { nome: "link_gravacao", tipo: "URL" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
  {
    id: "documentos",
    emoji: "📁",
    nome: "Documentos",
    descricao: "Arquivos e materiais entregues",
    visivel: "Admin + Cliente",
    cor: "#9B72CF",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "nome", tipo: "Texto" },
      { nome: "tipo", tipo: "SELECT" },
      { nome: "categoria", tipo: "SELECT" },
      { nome: "url", tipo: "URL" },
      { nome: "tamanho_kb", tipo: "Integer" },
      { nome: "descricao", tipo: "Texto" },
      { nome: "visivel_cliente", tipo: "Boolean" },
      { nome: "enviado_por", tipo: "admin | cliente" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
  {
    id: "metricas",
    emoji: "📊",
    nome: "Métricas do Cliente",
    descricao: "Indicadores inseridos pelo cliente",
    visivel: "Admin + Cliente",
    cor: "#E8C547",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "data_referencia", tipo: "Date" },
      { nome: "faturamento", tipo: "Decimal" },
      { nome: "numero_pacientes", tipo: "Integer" },
      { nome: "taxa_retorno", tipo: "Decimal %" },
      { nome: "ticket_medio", tipo: "Decimal" },
      { nome: "novos_pacientes", tipo: "Integer" },
      { nome: "cancelamentos", tipo: "Integer" },
      { nome: "satisfacao", tipo: "1–10" },
      { nome: "observacao", tipo: "Texto" },
      { nome: "inserido_por", tipo: "cliente" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
  {
    id: "etapas_projeto",
    emoji: "⚙️",
    nome: "Etapas do Projeto",
    descricao: "Progresso do Método ISA por cliente",
    visivel: "Admin + Cliente",
    cor: "#153029",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "etapa", tipo: "Diagnóstico | Estratégia | Execução | Entrega | Ajuste" },
      { nome: "status", tipo: "SELECT" },
      { nome: "data_inicio", tipo: "Date" },
      { nome: "data_conclusao", tipo: "Date" },
      { nome: "observacao", tipo: "Texto" },
      { nome: "percentual", tipo: "Integer 0–100" },
    ],
  },
  {
    id: "notificacoes",
    emoji: "🔔",
    nome: "Notificações",
    descricao: "Alertas e atualizações do sistema",
    visivel: "Admin + Cliente",
    cor: "#CC4444",
    campos: [
      { nome: "id", tipo: "UUID", chave: true },
      { nome: "usuario_id", tipo: "→ Usuários", fk: true },
      { nome: "cliente_id", tipo: "→ Clientes", fk: true },
      { nome: "tipo", tipo: "SELECT" },
      { nome: "titulo", tipo: "Texto" },
      { nome: "mensagem", tipo: "Texto" },
      { nome: "lida", tipo: "Boolean" },
      { nome: "criado_em", tipo: "DateTime" },
    ],
  },
];

const FLUXO = [
  { de: "clientes", para: "financeiro", label: "1:N" },
  { de: "clientes", para: "treinamentos", label: "1:N" },
  { de: "clientes", para: "tarefas", label: "1:N" },
  { de: "clientes", para: "reunioes", label: "1:N" },
  { de: "clientes", para: "documentos", label: "1:N" },
  { de: "clientes", para: "metricas", label: "1:N" },
  { de: "clientes", para: "etapas_projeto", label: "1:N" },
  { de: "treinamentos", para: "modulos", label: "1:N" },
  { de: "usuarios", para: "clientes", label: "1:1" },
  { de: "usuarios", para: "notificacoes", label: "1:N" },
];

const TELAS_CLIENTE = [
  { emoji: "🏠", nome: "Início", descricao: "Progresso geral, próximas tarefas, notificações" },
  { emoji: "📊", nome: "Minhas Métricas", descricao: "Inserir faturamento, pacientes, indicadores mensais" },
  { emoji: "💰", nome: "Financeiro", descricao: "Ver lançamentos, inserir despesas, acompanhar fluxo" },
  { emoji: "🎓", nome: "Treinamentos", descricao: "Ver módulos, marcar conclusões, anotações" },
  { emoji: "✅", nome: "Minhas Tarefas", descricao: "Ver e concluir tarefas atribuídas" },
  { emoji: "📁", nome: "Documentos", descricao: "Acessar materiais entregues, fazer upload" },
  { emoji: "🗓️", nome: "Reuniões", descricao: "Histórico de encontros e decisões" },
  { emoji: "👤", nome: "Meu Perfil", descricao: "Dados de cadastro e senha" },
];

const TELAS_ADMIN = [
  { emoji: "🏠", nome: "Dashboard", descricao: "Visão geral: todos os clientes, receita, alertas" },
  { emoji: "👥", nome: "Clientes", descricao: "Lista, pipeline, adicionar novo, detalhes" },
  { emoji: "💰", nome: "Financeiro", descricao: "Fluxo de caixa, receitas, despesas, permutas" },
  { emoji: "🎓", nome: "Treinamentos", descricao: "Gerenciar cursos, módulos, progresso por cliente" },
  { emoji: "✅", nome: "Tarefas", descricao: "Criar, atribuir e acompanhar tarefas" },
  { emoji: "📁", nome: "Documentos", descricao: "Upload e gestão de materiais por cliente" },
  { emoji: "📊", nome: "Métricas", descricao: "Indicadores inseridos pelos clientes, gráficos" },
  { emoji: "🗓️", nome: "Reuniões", descricao: "Agendar, registrar atas, histórico" },
  { emoji: "⚙️", nome: "Etapas ISA", descricao: "Progresso do método por cliente" },
  { emoji: "🔔", nome: "Notificações", descricao: "Alertas de novos dados inseridos pelos clientes" },
  { emoji: "🔐", nome: "Usuários", descricao: "Gerenciar logins de clientes" },
];

export default function Schema() {
  const [aba, setAba] = useState("entidades");
  const [selecionada, setSelecionada] = useState(null);

  return (
    <div style={{ background: C.preto, minHeight: "100vh", fontFamily: "'Georgia', serif", color: C.lavanda }}>

      {/* HEADER */}
      <div style={{ background: C.verde, borderBottom: `1px solid ${C.verdeM}`, padding: "18px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 10, color: C.cobre, letterSpacing: 4, textTransform: "uppercase" }}>FS Consultoria</div>
          <div style={{ fontSize: 20, color: C.lavanda, marginTop: 4 }}>Arquitetura de Dados</div>
          <div style={{ fontSize: 11, color: C.cinza, marginTop: 2 }}>Portal Cliente + Admin · Sistema Completo</div>
        </div>
      </div>

      {/* ABAS */}
      <div style={{ background: C.verde, padding: "0 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {[
            { id: "entidades", label: "📦 Tabelas" },
            { id: "telas", label: "📱 Telas" },
            { id: "fluxo", label: "🔗 Relações" },
            { id: "auth", label: "🔐 Login" },
          ].map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              style={{ background: "none", border: "none", padding: "12px 16px", fontSize: 12, cursor: "pointer", color: aba === a.id ? C.cobre : C.lavanda, borderBottom: aba === a.id ? `2px solid ${C.cobre}` : "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.2s" }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* TABELAS */}
        {aba === "entidades" && (
          <div>
            <div style={{ fontSize: 11, color: C.cinza, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
              {ENTIDADES.length} entidades · Toque para ver os campos
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {ENTIDADES.map(e => (
                <div key={e.id} onClick={() => setSelecionada(selecionada?.id === e.id ? null : e)}
                  style={{ background: selecionada?.id === e.id ? e.cor : "#1A2E28", border: `1px solid ${selecionada?.id === e.id ? e.cor : "#253D34"}`, borderRadius: 14, padding: 16, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 22 }}>{e.emoji}</div>
                    <div>
                      <div style={{ fontSize: 14, color: C.lavanda, fontWeight: "bold" }}>{e.nome}</div>
                      <div style={{ fontSize: 10, color: C.cinza }}>{e.descricao}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ background: `${e.cor}33`, borderRadius: 10, padding: "2px 8px", fontSize: 10, color: C.cobre }}>
                      {e.campos.length} campos
                    </div>
                    <div style={{ fontSize: 10, color: C.cinza }}>{e.visivel}</div>
                  </div>

                  {selecionada?.id === e.id && (
                    <div style={{ marginTop: 14, borderTop: `1px solid rgba(255,255,255,0.15)`, paddingTop: 12 }}>
                      {e.campos.map((c, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < e.campos.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {c.chave && <span style={{ fontSize: 9, color: "#E8C547", background: "#E8C54722", borderRadius: 4, padding: "1px 4px" }}>PK</span>}
                            {c.fk && <span style={{ fontSize: 9, color: C.cobreL, background: `${C.cobre}22`, borderRadius: 4, padding: "1px 4px" }}>FK</span>}
                            <span style={{ fontSize: 12, color: c.chave ? "#E8C547" : c.fk ? C.cobreL : C.lavanda }}>{c.nome}</span>
                          </div>
                          <span style={{ fontSize: 10, color: C.cinza }}>{c.tipo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TELAS */}
        {aba === "telas" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* CLIENTE */}
            <div>
              <div style={{ background: "#1A4738", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.cobre, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Portal do Cliente</div>
                <div style={{ fontSize: 12, color: C.cinza }}>O cliente entra com login próprio e vê apenas os seus dados</div>
              </div>
              {TELAS_CLIENTE.map((t, i) => (
                <div key={i} style={{ background: "#1A2E28", border: "1px solid #253D34", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 18, width: 28, textAlign: "center" }}>{t.emoji}</div>
                    <div>
                      <div style={{ fontSize: 13, color: C.lavanda }}>{t.nome}</div>
                      <div style={{ fontSize: 11, color: C.cinza, marginTop: 2 }}>{t.descricao}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ADMIN */}
            <div>
              <div style={{ background: `${C.cobre}22`, borderRadius: 14, padding: 16, marginBottom: 16, border: `1px solid ${C.cobre}44` }}>
                <div style={{ fontSize: 11, color: C.cobre, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Portal Admin (Isa)</div>
                <div style={{ fontSize: 12, color: C.cinza }}>Visão completa de todos os clientes e dados</div>
              </div>
              {TELAS_ADMIN.map((t, i) => (
                <div key={i} style={{ background: "#1A2E28", border: `1px solid ${C.cobre}33`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 18, width: 28, textAlign: "center" }}>{t.emoji}</div>
                    <div>
                      <div style={{ fontSize: 13, color: C.lavanda }}>{t.nome}</div>
                      <div style={{ fontSize: 11, color: C.cinza, marginTop: 2 }}>{t.descricao}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELAÇÕES */}
        {aba === "fluxo" && (
          <div>
            <div style={{ fontSize: 11, color: C.cinza, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Relacionamentos entre tabelas</div>

            {/* CENTRO: CLIENTES */}
            <div style={{ background: "#1A2E28", border: `2px solid ${C.cobre}`, borderRadius: 16, padding: 20, marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>👥</div>
              <div style={{ fontSize: 16, color: C.cobre, marginTop: 6 }}>Clientes</div>
              <div style={{ fontSize: 11, color: C.cinza, marginTop: 4 }}>Entidade central. Todas as outras tabelas se conectam aqui.</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {FLUXO.map((f, i) => {
                const de = ENTIDADES.find(e => e.id === f.de);
                const para = ENTIDADES.find(e => e.id === f.para);
                if (!de || !para) return null;
                return (
                  <div key={i} style={{ background: "#1A2E28", border: "1px solid #253D34", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>{de.emoji}</span>
                      <span style={{ fontSize: 11, color: C.cinza }}>{de.nome}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.cobre, textAlign: "center", margin: "4px 0" }}>
                      ──── {f.label} ────▶
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 16 }}>{para.emoji}</span>
                      <span style={{ fontSize: 11, color: C.lavanda }}>{para.nome}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#1A2E28", border: "1px solid #253D34", borderRadius: 14, padding: 16, marginTop: 20 }}>
              <div style={{ fontSize: 11, color: C.cobre, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Legenda</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { label: "1:1", desc: "Um para um" },
                  { label: "1:N", desc: "Um para muitos" },
                  { label: "PK", desc: "Chave primária" },
                  { label: "FK", desc: "Chave estrangeira" },
                ].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: `${C.cobre}33`, borderRadius: 6, padding: "2px 8px", fontSize: 10, color: C.cobre }}>{l.label}</span>
                    <span style={{ fontSize: 11, color: C.cinza }}>{l.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUTH */}
        {aba === "auth" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            <div style={{ gridColumn: "1 / -1", background: "#1A2E28", borderRadius: 14, padding: 20, border: "1px solid #253D34" }}>
              <div style={{ fontSize: 11, color: C.cobre, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Fluxo de Autenticação</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {["Tela de Login", "→", "Verificar tipo", "→", "admin?", "→", "Dashboard Admin", "|", "cliente?", "→", "Portal Cliente"].map((s, i) => (
                  <span key={i} style={{ fontSize: s === "→" || s === "|" ? 16 : 12, color: s === "→" || s === "|" ? C.cobre : ["admin?", "cliente?"].includes(s) ? "#E8C547" : C.lavanda, background: ["Tela de Login", "Dashboard Admin", "Portal Cliente"].includes(s) ? "#253D34" : "none", borderRadius: 8, padding: ["Tela de Login", "Dashboard Admin", "Portal Cliente"].includes(s) ? "4px 10px" : "0" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: "#1A2E28", borderRadius: 14, padding: 20, border: "1px solid #253D34" }}>
              <div style={{ fontSize: 13, color: C.lavanda, marginBottom: 16 }}>🔐 Admin (Isa)</div>
              {[
                { campo: "Credencial", valor: "Email ou username único" },
                { campo: "Senha", valor: "Hash bcrypt, mínimo 8 chars" },
                { campo: "Tipo", valor: "admin" },
                { campo: "Acesso", valor: "Todos os clientes e dados" },
                { campo: "Sessão", valor: "Token JWT, 24h" },
                { campo: "Recuperação", valor: "Email de reset" },
              ].map(r => (
                <div key={r.campo} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12 }}>
                  <span style={{ color: C.cinza }}>{r.campo}</span>
                  <span style={{ color: C.lavanda }}>{r.valor}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#1A2E28", borderRadius: 14, padding: 20, border: "1px solid #253D34" }}>
              <div style={{ fontSize: 13, color: C.lavanda, marginBottom: 16 }}>👤 Cliente</div>
              {[
                { campo: "Credencial", valor: "Email cadastrado por Isa" },
                { campo: "Senha", valor: "Definida no primeiro acesso" },
                { campo: "Tipo", valor: "cliente" },
                { campo: "Acesso", valor: "Apenas seus próprios dados" },
                { campo: "Sessão", valor: "Token JWT, 24h" },
                { campo: "Criado por", valor: "Admin cria o acesso" },
              ].map(r => (
                <div key={r.campo} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12 }}>
                  <span style={{ color: C.cinza }}>{r.campo}</span>
                  <span style={{ color: C.lavanda }}>{r.valor}</span>
                </div>
              ))}
            </div>

            <div style={{ gridColumn: "1 / -1", background: `${C.cobre}11`, border: `1px solid ${C.cobre}44`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, color: C.cobre, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Tecnologia para Rodar em Todos os Dispositivos</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  { emoji: "⚛️", nome: "React", desc: "Interface única para web, Android e Apple" },
                  { emoji: "📱", nome: "PWA", desc: "Instala como app nativo no celular" },
                  { emoji: "🗄️", nome: "Supabase", desc: "Banco de dados + autenticação prontos" },
                  { emoji: "🔐", nome: "JWT", desc: "Sessão segura em todos os dispositivos" },
                  { emoji: "☁️", nome: "Vercel", desc: "Deploy gratuito, acesso por URL" },
                  { emoji: "🔄", nome: "Tempo Real", desc: "Cliente insere dado, Isa vê na hora" },
                ].map(t => (
                  <div key={t.nome} style={{ background: "#1A2E28", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 20 }}>{t.emoji}</div>
                    <div style={{ fontSize: 13, color: C.lavanda, marginTop: 6 }}>{t.nome}</div>
                    <div style={{ fontSize: 11, color: C.cinza, marginTop: 4 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

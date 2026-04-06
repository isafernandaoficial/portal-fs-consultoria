import { useState, useEffect, useCallback } from "react";

const CORES = {
  verde: "#153029",
  verdeM: "#1A4738",
  cobre: "#AD7F67",
  lavanda: "#E6E1E7",
  branco: "#F9F7F4",
  cinza: "#8A8580",
};

const STATUS_CONFIG = {
  "Proposta Enviada": { cor: "#E8C547", emoji: "📤" },
  "Em Andamento": { cor: "#4EADCF", emoji: "⚡" },
  "Aguardando Cliente": { cor: "#E8974D", emoji: "⏳" },
  "Concluído": { cor: "#52C97A", emoji: "✅" },
  "Pausado": { cor: "#8A8580", emoji: "⏸️" },
  "Permuta": { cor: "#AD7F67", emoji: "🔄" },
};

const ETAPAS = [
  "Diagnóstico",
  "Estratégia",
  "Execução",
  "Entrega",
  "Acompanhamento",
];

const ICONES_ETAPA = ["🔍", "🧠", "⚙️", "📦", "📊"];

const CLIENTES_INICIAIS = [
  {
    id: 1,
    nome: "Ana Lúcia",
    negocio: "Costa Terapias",
    segmento: "Terapia & Bem-estar",
    status: "Permuta",
    valor: 3500,
    etapaAtual: 4,
    metricas: { posts: 0, materiais: 10, sessoes: 0 },
    etapas: [true, true, true, true, false],
    notas: "Landing page, cardápio, 3 apostilas Reiki, folder, proposta locação. Formalizar recebimento.",
    cor: "#AD7F67",
    ultimaAtualizacao: "2026-04-04",
  },
];

export default function App() {
  const [tela, setTela] = useState("home");
  const [clientes, setClientes] = useState(CLIENTES_INICIAIS);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: "", negocio: "", segmento: "", status: "Proposta Enviada", valor: "",
    etapaAtual: 0, etapas: [false, false, false, false, false],
    metricas: { posts: 0, materiais: 0, sessoes: 0 },
    notas: "", cor: "#1A4738",
  });
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const r = await window.storage.get("isa-clientes");
        if (r && r.value) setClientes(JSON.parse(r.value));
      } catch {}
      setCarregado(true);
    }
    carregar();
  }, []);

  const salvar = useCallback(async (dados) => {
    try {
      await window.storage.set("isa-clientes", JSON.stringify(dados));
    } catch {}
  }, []);

  const atualizarClientes = (novos) => {
    setClientes(novos);
    salvar(novos);
  };

  const abrirCliente = (c) => {
    setClienteSelecionado({ ...c });
    setTela("cliente");
  };

  const salvarCliente = () => {
    const id = Date.now();
    const c = { ...novoCliente, id, ultimaAtualizacao: new Date().toISOString().split("T")[0] };
    const novos = [...clientes, c];
    atualizarClientes(novos);
    setModalAberto(false);
    setNovoCliente({
      nome: "", negocio: "", segmento: "", status: "Proposta Enviada", valor: "",
      etapaAtual: 0, etapas: [false, false, false, false, false],
      metricas: { posts: 0, materiais: 0, sessoes: 0 }, notas: "", cor: "#1A4738",
    });
  };

  const toggleEtapa = (idx) => {
    if (!clienteSelecionado) return;
    const novasEtapas = [...clienteSelecionado.etapas];
    novasEtapas[idx] = !novasEtapas[idx];
    const concluidas = novasEtapas.filter(Boolean).length;
    const atualizado = {
      ...clienteSelecionado,
      etapas: novasEtapas,
      etapaAtual: concluidas,
      ultimaAtualizacao: new Date().toISOString().split("T")[0],
    };
    setClienteSelecionado(atualizado);
    const novos = clientes.map(c => c.id === atualizado.id ? atualizado : c);
    atualizarClientes(novos);
  };

  const atualizarMetrica = (campo, val) => {
    const atualizado = {
      ...clienteSelecionado,
      metricas: { ...clienteSelecionado.metricas, [campo]: Number(val) },
      ultimaAtualizacao: new Date().toISOString().split("T")[0],
    };
    setClienteSelecionado(atualizado);
    const novos = clientes.map(c => c.id === atualizado.id ? atualizado : c);
    atualizarClientes(novos);
  };

  const atualizarStatus = (s) => {
    const atualizado = { ...clienteSelecionado, status: s, ultimaAtualizacao: new Date().toISOString().split("T")[0] };
    setClienteSelecionado(atualizado);
    const novos = clientes.map(c => c.id === atualizado.id ? atualizado : c);
    atualizarClientes(novos);
  };

  const atualizarNota = (nota) => {
    const atualizado = { ...clienteSelecionado, notas: nota, ultimaAtualizacao: new Date().toISOString().split("T")[0] };
    setClienteSelecionado(atualizado);
    const novos = clientes.map(c => c.id === atualizado.id ? atualizado : c);
    atualizarClientes(novos);
  };

  const excluirCliente = () => {
    const novos = clientes.filter(c => c.id !== clienteSelecionado.id);
    atualizarClientes(novos);
    setTela("home");
    setClienteSelecionado(null);
  };

  const progresso = (c) => {
    const p = c.etapas.filter(Boolean).length;
    return Math.round((p / 5) * 100);
  };

  const totalReceita = clientes
    .filter(c => c.status === "Concluído" || c.status === "Em Andamento")
    .reduce((a, c) => a + Number(c.valor || 0), 0);

  const totalPermuta = clientes
    .filter(c => c.status === "Permuta")
    .reduce((a, c) => a + Number(c.valor || 0), 0);

  if (!carregado) return (
    <div style={{ background: CORES.verde, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: CORES.lavanda, fontFamily: "serif", fontSize: 20 }}>carregando...</div>
    </div>
  );

  return (
    <div style={{ background: CORES.branco, minHeight: "100vh", maxWidth: 480, margin: "0 auto", fontFamily: "'Georgia', serif", position: "relative" }}>

      {/* HEADER */}
      <div style={{ background: CORES.verde, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {tela !== "home" ? (
            <button onClick={() => setTela("home")} style={{ background: "none", border: "none", color: CORES.cobre, fontSize: 22, cursor: "pointer", padding: 0 }}>←</button>
          ) : <div style={{ width: 22 }} />}
          <div style={{ textAlign: "center" }}>
            <div style={{ color: CORES.cobre, fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}>FS Consultoria</div>
            <div style={{ color: CORES.lavanda, fontSize: 16, marginTop: 2 }}>
              {tela === "home" ? "Clientes" : tela === "cliente" ? clienteSelecionado?.negocio : "Métricas"}
            </div>
          </div>
          {tela === "home" ? (
            <button onClick={() => setModalAberto(true)} style={{ background: CORES.cobre, border: "none", color: CORES.verde, width: 32, height: 32, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          ) : <div style={{ width: 32 }} />}
        </div>
      </div>

      {/* HOME */}
      {tela === "home" && (
        <div style={{ padding: "0 16px 100px" }}>

          {/* RESUMO */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "20px 0" }}>
            {[
              { label: "clientes", valor: clientes.length, emoji: "👥" },
              { label: "receita", valor: `R$${(totalReceita / 1000).toFixed(1)}k`, emoji: "💰" },
              { label: "permuta", valor: `R$${(totalPermuta / 1000).toFixed(1)}k`, emoji: "🔄" },
            ].map(item => (
              <div key={item.label} style={{ background: CORES.verde, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{item.emoji}</div>
                <div style={{ color: CORES.cobre, fontSize: 18, fontWeight: "bold", marginTop: 4 }}>{item.valor}</div>
                <div style={{ color: CORES.lavanda, fontSize: 10, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* LISTA DE CLIENTES */}
          {clientes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: CORES.cinza }}>
              <div style={{ fontSize: 40 }}>🌱</div>
              <div style={{ marginTop: 12, fontSize: 14 }}>Nenhum cliente ainda.</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Toque em + para adicionar.</div>
            </div>
          ) : clientes.map(c => (
            <div key={c.id} onClick={() => abrirCliente(c)}
              style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 2px 12px rgba(21,48,41,0.08)", cursor: "pointer", borderLeft: `4px solid ${STATUS_CONFIG[c.status]?.cor || CORES.cobre}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, color: CORES.verde, fontWeight: "bold" }}>{c.negocio}</div>
                  <div style={{ fontSize: 12, color: CORES.cinza, marginTop: 2 }}>{c.nome} · {c.segmento}</div>
                </div>
                <div style={{ background: STATUS_CONFIG[c.status]?.cor || CORES.cobre, borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "#fff", whiteSpace: "nowrap" }}>
                  {STATUS_CONFIG[c.status]?.emoji} {c.status}
                </div>
              </div>

              {/* BARRA DE PROGRESSO */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: CORES.cinza, textTransform: "uppercase", letterSpacing: 1 }}>progresso</span>
                  <span style={{ fontSize: 10, color: CORES.cobre, fontWeight: "bold" }}>{progresso(c)}%</span>
                </div>
                <div style={{ background: CORES.lavanda, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${progresso(c)}%`, height: "100%", background: `linear-gradient(90deg, ${CORES.verdeM}, ${CORES.cobre})`, borderRadius: 4, transition: "width 0.4s ease" }} />
                </div>
              </div>

              {/* ETAPAS */}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {c.etapas.map((ok, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: ok ? CORES.cobre : CORES.lavanda }} />
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
                <div style={{ fontSize: 11, color: CORES.cinza }}>Atualizado {c.ultimaAtualizacao}</div>
                {c.valor ? <div style={{ fontSize: 13, color: CORES.verde, fontWeight: "bold" }}>R$ {Number(c.valor).toLocaleString("pt-BR")}</div> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETALHE DO CLIENTE */}
      {tela === "cliente" && clienteSelecionado && (
        <div style={{ padding: "0 16px 100px" }}>

          {/* STATUS BADGE */}
          <div style={{ margin: "16px 0 8px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(STATUS_CONFIG).map(s => (
              <button key={s} onClick={() => atualizarStatus(s)}
                style={{ border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer", background: clienteSelecionado.status === s ? STATUS_CONFIG[s].cor : CORES.lavanda, color: clienteSelecionado.status === s ? "#fff" : CORES.cinza, transition: "all 0.2s" }}>
                {STATUS_CONFIG[s].emoji} {s}
              </button>
            ))}
          </div>

          {/* PROGRESSO GERAL */}
          <div style={{ background: CORES.verde, borderRadius: 16, padding: 20, margin: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ color: CORES.lavanda, fontSize: 13 }}>Progresso Geral</div>
              <div style={{ color: CORES.cobre, fontSize: 28, fontWeight: "bold" }}>{progresso(clienteSelecionado)}%</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${progresso(clienteSelecionado)}%`, height: "100%", background: `linear-gradient(90deg, ${CORES.cobre}, #E8C547)`, borderRadius: 6, transition: "width 0.5s ease" }} />
            </div>
            {clienteSelecionado.valor ? (
              <div style={{ color: CORES.lavanda, fontSize: 11, marginTop: 10, opacity: 0.8 }}>
                Valor: <span style={{ color: CORES.cobre }}>R$ {Number(clienteSelecionado.valor).toLocaleString("pt-BR")}</span>
              </div>
            ) : null}
          </div>

          {/* ETAPAS */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(21,48,41,0.06)" }}>
            <div style={{ fontSize: 11, color: CORES.cinza, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>Etapas do Projeto</div>
            {ETAPAS.map((etapa, i) => (
              <div key={i} onClick={() => toggleEtapa(i)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < 4 ? `1px solid ${CORES.lavanda}` : "none", cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: clienteSelecionado.etapas[i] ? CORES.cobre : CORES.lavanda, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, transition: "all 0.2s", flexShrink: 0 }}>
                  {clienteSelecionado.etapas[i] ? "✓" : ICONES_ETAPA[i]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: clienteSelecionado.etapas[i] ? CORES.cinza : CORES.verde, textDecoration: clienteSelecionado.etapas[i] ? "line-through" : "none" }}>{etapa}</div>
                </div>
                <div style={{ fontSize: 11, color: clienteSelecionado.etapas[i] ? CORES.cobre : CORES.lavanda }}>
                  {clienteSelecionado.etapas[i] ? "feito" : "pendente"}
                </div>
              </div>
            ))}
          </div>

          {/* MÉTRICAS */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(21,48,41,0.06)" }}>
            <div style={{ fontSize: 11, color: CORES.cinza, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>Métricas</div>
            {[
              { campo: "materiais", label: "Materiais Entregues", emoji: "📦" },
              { campo: "posts", label: "Posts Produzidos", emoji: "📸" },
              { campo: "sessoes", label: "Sessões Realizadas", emoji: "🗓️" },
            ].map(m => (
              <div key={m.campo} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 22, width: 32, textAlign: "center" }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: CORES.cinza, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => atualizarMetrica(m.campo, Math.max(0, (clienteSelecionado.metricas[m.campo] || 0) - 1))}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${CORES.lavanda}`, background: "#fff", cursor: "pointer", fontSize: 16, color: CORES.cinza }}>−</button>
                    <div style={{ minWidth: 40, textAlign: "center", fontSize: 20, fontWeight: "bold", color: CORES.verde }}>{clienteSelecionado.metricas[m.campo] || 0}</div>
                    <button onClick={() => atualizarMetrica(m.campo, (clienteSelecionado.metricas[m.campo] || 0) + 1)}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: CORES.cobre, cursor: "pointer", fontSize: 16, color: "#fff" }}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NOTAS */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(21,48,41,0.06)" }}>
            <div style={{ fontSize: 11, color: CORES.cinza, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>📝 Notas</div>
            <textarea value={clienteSelecionado.notas || ""} onChange={e => atualizarNota(e.target.value)}
              style={{ width: "100%", minHeight: 100, border: `1px solid ${CORES.lavanda}`, borderRadius: 10, padding: 12, fontFamily: "inherit", fontSize: 13, color: CORES.verde, resize: "vertical", outline: "none", background: CORES.branco, boxSizing: "border-box" }}
              placeholder="Notas sobre o projeto..." />
          </div>

          {/* EXCLUIR */}
          <button onClick={excluirCliente}
            style={{ width: "100%", padding: 14, background: "none", border: `1px solid #ffcccc`, borderRadius: 12, color: "#cc4444", fontSize: 13, cursor: "pointer", marginBottom: 20 }}>
            🗑️ Remover cliente
          </button>
        </div>
      )}

      {/* MODAL NOVO CLIENTE */}
      {modalAberto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(21,48,41,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: CORES.branco, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, margin: "0 auto", padding: "24px 20px 40px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, color: CORES.verde, fontWeight: "bold" }}>Novo Cliente</div>
              <button onClick={() => setModalAberto(false)} style={{ background: CORES.lavanda, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: CORES.cinza, fontSize: 16 }}>×</button>
            </div>

            {[
              { campo: "nome", label: "Nome", placeholder: "Ex: Ana Lúcia" },
              { campo: "negocio", label: "Negócio", placeholder: "Ex: Costa Terapias" },
              { campo: "segmento", label: "Segmento", placeholder: "Ex: Medicina, Terapia..." },
              { campo: "valor", label: "Valor (R$)", placeholder: "Ex: 3500", tipo: "number" },
            ].map(f => (
              <div key={f.campo} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: CORES.cinza, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{f.label}</div>
                <input type={f.tipo || "text"} value={novoCliente[f.campo]} onChange={e => setNovoCliente({ ...novoCliente, [f.campo]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "12px 14px", border: `1px solid ${CORES.lavanda}`, borderRadius: 10, fontFamily: "inherit", fontSize: 14, color: CORES.verde, outline: "none", background: "#fff", boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: CORES.cinza, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Status Inicial</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.keys(STATUS_CONFIG).map(s => (
                  <button key={s} onClick={() => setNovoCliente({ ...novoCliente, status: s })}
                    style={{ border: "none", borderRadius: 20, padding: "6px 12px", fontSize: 11, cursor: "pointer", background: novoCliente.status === s ? STATUS_CONFIG[s].cor : CORES.lavanda, color: novoCliente.status === s ? "#fff" : CORES.cinza }}>
                    {STATUS_CONFIG[s].emoji} {s}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={salvarCliente}
              style={{ width: "100%", padding: 16, background: CORES.verde, border: "none", borderRadius: 14, color: CORES.cobre, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Adicionar Cliente
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: CORES.verde, borderTop: `1px solid ${CORES.verdeM}`, display: "flex", padding: "10px 0 16px", zIndex: 40 }}>
        {[
          { id: "home", emoji: "🏠", label: "Clientes" },
          { id: "metricas", emoji: "📊", label: "Resumo" },
        ].map(nav => (
          <button key={nav.id} onClick={() => setTela(nav.id)}
            style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 20 }}>{nav.emoji}</div>
            <div style={{ fontSize: 10, color: tela === nav.id ? CORES.cobre : CORES.lavanda, opacity: tela === nav.id ? 1 : 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{nav.label}</div>
          </button>
        ))}
      </div>

      {/* TELA MÉTRICAS RESUMO */}
      {tela === "metricas" && (
        <div style={{ padding: "20px 16px 100px" }}>
          <div style={{ fontSize: 11, color: CORES.cinza, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Visão Geral</div>

          {/* POR STATUS */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(21,48,41,0.06)" }}>
            <div style={{ fontSize: 12, color: CORES.cinza, marginBottom: 12 }}>Por Status</div>
            {Object.keys(STATUS_CONFIG).map(s => {
              const count = clientes.filter(c => c.status === s).length;
              if (!count) return null;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_CONFIG[s].cor, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, color: CORES.verde }}>{s}</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: CORES.cobre }}>{count}</div>
                </div>
              );
            })}
          </div>

          {/* FINANCEIRO */}
          <div style={{ background: CORES.verde, borderRadius: 16, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: CORES.lavanda, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Financeiro</div>
            {[
              { label: "Receita Ativa", valor: totalReceita },
              { label: "Em Permuta", valor: totalPermuta },
              { label: "Total Previsto", valor: clientes.reduce((a, c) => a + Number(c.valor || 0), 0) },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ color: CORES.lavanda, fontSize: 13 }}>{f.label}</div>
                <div style={{ color: CORES.cobre, fontSize: 17, fontWeight: "bold" }}>R$ {f.valor.toLocaleString("pt-BR")}</div>
              </div>
            ))}
          </div>

          {/* LISTA RÁPIDA COM PROGRESSO */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(21,48,41,0.06)" }}>
            <div style={{ fontSize: 12, color: CORES.cinza, marginBottom: 12 }}>Progresso por Cliente</div>
            {clientes.map(c => (
              <div key={c.id} onClick={() => abrirCliente(c)} style={{ marginBottom: 14, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: CORES.verde }}>{c.negocio}</span>
                  <span style={{ fontSize: 11, color: CORES.cobre }}>{progresso(c)}%</span>
                </div>
                <div style={{ background: CORES.lavanda, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${progresso(c)}%`, height: "100%", background: `linear-gradient(90deg, ${CORES.verdeM}, ${CORES.cobre})`, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

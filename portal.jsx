import { useState, useEffect } from "react";

const C = { verde: "#153029", verdeM: "#1A4738", cobre: "#AD7F67", cobreL: "#C99A80", lavanda: "#E6E1E7", branco: "#F9F7F4", cinza: "#8A8580", erro: "#CC4444", ok: "#52C97A" };

const st = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} }
};

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const hoje = () => new Date().toISOString().split("T")[0];
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const USUARIOS_SEED = [
  { id: "adm1", nome: "Isa Fernanda", email: "isa@fsconsultoria.com.br", senha: "isa2026", tipo: "admin", ativo: true },
  { id: "cli1", nome: "Ana Lúcia", email: "ana@costas.com", senha: "ana2026", tipo: "cliente", clienteId: "c1", ativo: true }
];
const CLIENTES_SEED = [
  { id: "c1", nome: "Ana Lúcia", negocio: "Costa Terapias", segmento: "Terapia & Bem-estar", cidade: "Cabo Frio, RJ", email: "ana@costas.com", whatsapp: "", status: "Permuta", servico: "Permuta", valor: 3500, pagamento: "Permuta", inicio: "2026-01-15", etapas: [true,true,true,true,false], cor: "#AD7F67", notas: "10 materiais entregues. Formalizar recebimento." }
];
const TREINOS_SEED = [
  { id: "tr1", clienteId: "c1", nome: "Estruturação de Negócio", descricao: "Posicionamento, produto e processos", totalModulos: 4, concluidos: 2, status: "Em Andamento", inicio: "2026-02-01" }
];
const MODULOS_SEED = [
  { id: "mo1", treinoId: "tr1", clienteId: "c1", num: 1, titulo: "Diagnóstico do Negócio", desc: "Mapear pontos fortes e gargalos", feito: true, feito_em: "2026-02-10", notas: "3 gargalos identificados.", nota: 5 },
  { id: "mo2", treinoId: "tr1", clienteId: "c1", num: 2, titulo: "Serviços e Preços", desc: "Estruturar portfólio com precificação", feito: true, feito_em: "2026-02-20", notas: "Cardápio com 5 serviços criado.", nota: 4 },
  { id: "mo3", treinoId: "tr1", clienteId: "c1", num: 3, titulo: "Materiais de Apresentação", desc: "Landing page, portfólio e visuais", feito: false, feito_em: null, notas: "", nota: 0 },
  { id: "mo4", treinoId: "tr1", clienteId: "c1", num: 4, titulo: "Processo de Captação", desc: "Funil simples de atração e conversão", feito: false, feito_em: null, notas: "", nota: 0 },
];
const TAREFAS_SEED = [
  { id: "ta1", clienteId: "c1", titulo: "Formalizar acordo de permuta", desc: "Definir serviços a receber e prazo de 12 meses", status: "Para Fazer", prioridade: "Alta", resp: "admin", limite: "2026-04-15", criado: "2026-04-04" },
  { id: "ta2", clienteId: "c1", titulo: "Preencher métricas de março", desc: "Inserir faturamento e atendimentos do mês", status: "Para Fazer", prioridade: "Média", resp: "cliente", limite: "2026-04-10", criado: "2026-04-04" },
];

// ─── UI ATOMS ──────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, full, secondary, perigo, sm }) => (
  <button onClick={onClick} style={{ width: full ? "100%" : "auto", padding: sm ? "8px 14px" : "13px 20px", background: perigo ? C.erro : secondary ? "transparent" : C.verde, border: secondary ? `1px solid ${C.lavanda}` : perigo ? "none" : "none", borderRadius: 12, color: secondary ? C.cinza : C.cobreL, fontSize: sm ? 12 : 14, cursor: "pointer", fontFamily: "Georgia,serif" }}>{children}</button>
);
const Input = ({ label, value, onChange, type = "text", placeholder, multi }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 11, color: C.cinza, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>}
    {multi
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ width: "100%", padding: "11px 13px", border: `1px solid ${C.lavanda}`, borderRadius: 10, fontFamily: "Georgia,serif", fontSize: 13, color: C.verde, background: C.branco, resize: "vertical", boxSizing: "border-box", outline: "none" }} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "11px 13px", border: `1px solid ${C.lavanda}`, borderRadius: 10, fontFamily: "Georgia,serif", fontSize: 13, color: C.verde, background: C.branco, boxSizing: "border-box", outline: "none" }} />}
  </div>
);
const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 11, color: C.cinza, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "11px 13px", border: `1px solid ${C.lavanda}`, borderRadius: 10, fontFamily: "Georgia,serif", fontSize: 13, color: C.verde, background: C.branco, outline: "none" }}>
      {options.map(o => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}
    </select>
  </div>
);
const Card = ({ children, onClick, pad = 16, mb = 10 }) => (
  <div onClick={onClick} style={{ background: "#fff", borderRadius: 16, padding: pad, marginBottom: mb, boxShadow: "0 2px 12px rgba(21,48,41,0.07)", cursor: onClick ? "pointer" : "default" }}>{children}</div>
);
const Tag = ({ txt, cor }) => <span style={{ background: `${cor}22`, color: cor, borderRadius: 20, padding: "3px 10px", fontSize: 11 }}>{txt}</span>;
const Sep = () => <div style={{ height: 1, background: C.lavanda, margin: "12px 0" }} />;
const Titulo = ({ txt }) => <div style={{ fontSize: 11, color: C.cinza, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>{txt}</div>;
const BarraProg = ({ pct, cor = C.cobre }) => (
  <div style={{ background: C.lavanda, borderRadius: 4, height: 7, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: `linear-gradient(90deg,${C.verdeM},${cor})`, borderRadius: 4, transition: "width 0.4s" }} />
  </div>
);

// ─── STATUS CORES ──────────────────────────────────────────────────────────
const STATUS_COR = { "Para Fazer": "#E8974D", "Em Andamento": "#4EADCF", "Concluída": C.ok, "Bloqueada": C.cinza, "Em Andamento ": "#4EADCF" };
const PRIO_COR = { Alta: C.erro, Média: "#E8C547", Baixa: C.ok };

// ─── HEADER ────────────────────────────────────────────────────────────────
const Header = ({ titulo, sub, voltar, extra }) => (
  <div style={{ background: C.verde, padding: "18px 20px 14px", position: "sticky", top: 0, zIndex: 50 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {voltar ? <button onClick={voltar} style={{ background: "none", border: "none", color: C.cobre, fontSize: 22, cursor: "pointer" }}>←</button> : <div style={{ width: 22 }} />}
      <div style={{ textAlign: "center" }}>
        {sub && <div style={{ fontSize: 10, color: C.cobre, letterSpacing: 3, textTransform: "uppercase" }}>{sub}</div>}
        <div style={{ color: C.lavanda, fontSize: 16, marginTop: sub ? 2 : 0 }}>{titulo}</div>
      </div>
      {extra || <div style={{ width: 22 }} />}
    </div>
  </div>
);

// ─── BOTTOM NAV ────────────────────────────────────────────────────────────
const BottomNav = ({ itens, atual, onTroca }) => (
  <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.verde, borderTop: `1px solid ${C.verdeM}`, display: "flex", padding: "8px 0 14px", zIndex: 40 }}>
    {itens.map(i => (
      <button key={i.id} onClick={() => onTroca(i.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div style={{ fontSize: 20 }}>{i.emoji}</div>
        <div style={{ fontSize: 9, color: atual === i.id ? C.cobre : C.lavanda, opacity: atual === i.id ? 1 : 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{i.label}</div>
      </button>
    ))}
  </div>
);

// ─── MODAL ─────────────────────────────────────────────────────────────────
const Modal = ({ titulo, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
    <div style={{ background: C.branco, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, margin: "0 auto", padding: "22px 20px 36px", maxHeight: "88vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 15, color: C.verde, fontWeight: "bold" }}>{titulo}</div>
        <button onClick={onClose} style={{ background: C.lavanda, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: C.cinza, fontSize: 16 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    setErro(""); setCarregando(true);
    const ok = await onLogin(email.trim(), senha);
    setCarregando(false);
    if (!ok) setErro("Email ou senha incorretos.");
  };

  return (
    <div style={{ background: C.verde, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: C.cobre, letterSpacing: 5, textTransform: "uppercase" }}>FS Consultoria</div>
          <div style={{ color: C.lavanda, fontSize: 28, marginTop: 8, fontStyle: "italic" }}>Portal de Gestão</div>
          <div style={{ color: C.cinza, fontSize: 12, marginTop: 6 }}>Transformando desafios em qualidade.</div>
        </div>
        <div style={{ background: C.branco, borderRadius: 20, padding: 28 }}>
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="seu@email.com" />
          <Input label="Senha" value={senha} onChange={setSenha} type="password" placeholder="••••••••" />
          {erro && <div style={{ color: C.erro, fontSize: 12, marginBottom: 14, textAlign: "center" }}>{erro}</div>}
          <Btn full onClick={entrar}>{carregando ? "Entrando..." : "Entrar"}</Btn>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, color: C.cinza, fontSize: 11, opacity: 0.6 }}>
          Admin: isa@fsconsultoria.com.br · isa2026<br />
          Cliente teste: ana@costas.com · ana2026
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN APP
// ═══════════════════════════════════════════════════════════════════════════
function AdminApp(props) {
  const { tela, setTela, logout, notificacoes, usuario } = props;
  const [subTela, setSubTela] = useState(null);
  const [clienteSel, setClienteSel] = useState(null);

  const navItems = [
    { id: "dashboard", emoji: "🏠", label: "Início" },
    { id: "clientes", emoji: "👥", label: "Clientes" },
    { id: "financeiro", emoji: "💰", label: "Caixa" },
    { id: "treinos", emoji: "🎓", label: "Treinos" },
    { id: "mais", emoji: "⚙️", label: "Mais" },
  ];

  const naoLidas = notificacoes.filter(n => !n.lida).length;
  const subProps = { ...props, subTela, setSubTela, clienteSel, setClienteSel };

  return (
    <div style={{ background: C.branco, minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      <Header
        titulo={tela === "dashboard" ? `Olá, ${usuario.nome.split(" ")[0]} 👋` : tela === "clientes" ? "Clientes" : tela === "financeiro" ? "Financeiro" : tela === "treinos" ? "Treinamentos" : tela === "mais" ? "Mais opções" : tela}
        sub="FS Consultoria"
        extra={naoLidas > 0 ? <div onClick={() => setTela("notifs")} style={{ position: "relative", cursor: "pointer" }}>🔔<span style={{ position: "absolute", top: -5, right: -5, background: C.erro, color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>{naoLidas}</span></div> : <div style={{ width: 22 }} />}
      />
      <div style={{ paddingBottom: 80 }}>
        {tela === "dashboard" && <AdminDashboard {...subProps} />}
        {tela === "clientes" && <AdminClientes {...subProps} />}
        {tela === "financeiro" && <AdminFinanceiro {...subProps} />}
        {tela === "treinos" && <AdminTreinos {...subProps} />}
        {tela === "mais" && <AdminMais {...subProps} onLogout={logout} />}
        {tela === "notifs" && <AdminNotifs {...subProps} onVoltar={() => setTela("dashboard")} />}
        {tela === "tarefas" && <AdminTarefas {...subProps} onVoltar={() => setTela("mais")} />}
        {tela === "reunioes" && <AdminReunioes {...subProps} onVoltar={() => setTela("mais")} />}
        {tela === "usuarios" && <AdminUsuarios {...subProps} onVoltar={() => setTela("mais")} />}
        {tela === "metricas" && <AdminMetricas {...subProps} onVoltar={() => setTela("mais")} />}
      </div>
      <BottomNav itens={navItems} atual={tela} onTroca={setTela} />
    </div>
  );
}

function AdminDashboard({ clientes, financeiro, tarefas, notificacoes, metricas }) {
  const receita = financeiro.filter(f => f.tipo === "Receita").reduce((a, b) => a + Number(b.valor), 0);
  const despesa = financeiro.filter(f => f.tipo === "Despesa").reduce((a, b) => a + Number(b.valor), 0);
  const pendentes = tarefas.filter(t => t.status !== "Concluída").length;
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { emoji: "👥", label: "Clientes", valor: clientes.length, cor: C.verdeM },
          { emoji: "💰", label: "Receita", valor: fmt(receita), cor: "#2D6A4F" },
          { emoji: "📉", label: "Despesas", valor: fmt(despesa), cor: C.erro },
          { emoji: "✅", label: "Tarefas", valor: `${pendentes} pend.`, cor: "#E8974D" },
        ].map(k => (
          <div key={k.label} style={{ background: k.cor, borderRadius: 14, padding: "14px 12px" }}>
            <div style={{ fontSize: 20 }}>{k.emoji}</div>
            <div style={{ color: C.cobre, fontSize: 18, fontWeight: "bold", marginTop: 4 }}>{k.valor}</div>
            <div style={{ color: C.lavanda, fontSize: 10, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <Titulo txt="Clientes Ativos" />
      {clientes.map(c => {
        const prog = Math.round(c.etapas.filter(Boolean).length / 5 * 100);
        return (
          <Card key={c.id} mb={10}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: C.verde, fontWeight: "bold" }}>{c.negocio}</div>
                <div style={{ fontSize: 11, color: C.cinza }}>{c.nome}</div>
              </div>
              <Tag txt={c.status} cor={c.status === "Em Andamento" ? "#4EADCF" : c.status === "Permuta" ? C.cobre : C.ok} />
            </div>
            <BarraProg pct={prog} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: C.cinza }}>Progresso {prog}%</span>
              <span style={{ fontSize: 12, color: C.cobre }}>{fmt(c.valor)}</span>
            </div>
          </Card>
        );
      })}

      {naoLidas > 0 && (
        <>
          <Sep />
          <Titulo txt={`${naoLidas} Notificação(ões) Novas`} />
          {notificacoes.filter(n => !n.lida).slice(0, 3).map(n => (
            <Card key={n.id} mb={8}>
              <div style={{ fontSize: 13, color: C.verde }}>{n.titulo}</div>
              <div style={{ fontSize: 11, color: C.cinza, marginTop: 4 }}>{n.mensagem}</div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

function AdminClientes({ clientes, saveClientes, usuarios, saveUsuarios }) {
  const [modal, setModal] = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [form, setForm] = useState({ nome: "", negocio: "", segmento: "", cidade: "", email: "", whatsapp: "", status: "Proposta Enviada", servico: "Consultoria Completa", valor: "", pagamento: "PIX", notas: "" });
  const [senhaCliente, setSenhaCliente] = useState("");

  const salvar = async () => {
    const novoCliente = { ...form, id: id(), valor: Number(form.valor) || 0, etapas: [false, false, false, false, false], cor: C.cobre };
    const novoUser = { id: id(), nome: form.nome, email: form.email, senha: senhaCliente || "mudar123", tipo: "cliente", clienteId: novoCliente.id, ativo: true };
    await saveClientes([...clientes, novoCliente]);
    await saveUsuarios([...usuarios, novoUser]);
    setModal(false);
    setForm({ nome: "", negocio: "", segmento: "", cidade: "", email: "", whatsapp: "", status: "Proposta Enviada", servico: "Consultoria Completa", valor: "", pagamento: "PIX", notas: "" });
    setSenhaCliente("");
  };

  const toggleEtapa = async (cId, idx) => {
    const novos = clientes.map(c => {
      if (c.id !== cId) return c;
      const e = [...c.etapas]; e[idx] = !e[idx];
      return { ...c, etapas: e };
    });
    await saveClientes(novos);
    setDetalhe(novos.find(c => c.id === cId));
  };

  if (detalhe) return (
    <div style={{ padding: "16px 16px 0" }}>
      <Btn sm secondary onClick={() => setDetalhe(null)}>← Voltar</Btn>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 20, color: C.verde, fontWeight: "bold" }}>{detalhe.negocio}</div>
        <div style={{ fontSize: 13, color: C.cinza, marginTop: 2 }}>{detalhe.nome} · {detalhe.segmento}</div>
        <div style={{ fontSize: 13, color: C.cobre, marginTop: 2 }}>{fmt(detalhe.valor)} · {detalhe.pagamento}</div>
      </div>
      <Sep />
      <Titulo txt="Etapas Método ISA" />
      {["Diagnóstico", "Estratégia", "Execução", "Entrega", "Ajuste"].map((e, i) => (
        <Card key={i} onClick={() => toggleEtapa(detalhe.id, i)} mb={8}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: detalhe.etapas[i] ? C.cobre : C.lavanda, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{detalhe.etapas[i] ? "✓" : i + 1}</div>
            <div style={{ flex: 1, fontSize: 14, color: detalhe.etapas[i] ? C.cinza : C.verde, textDecoration: detalhe.etapas[i] ? "line-through" : "none" }}>{e}</div>
            <Tag txt={detalhe.etapas[i] ? "Feito" : "Pendente"} cor={detalhe.etapas[i] ? C.ok : "#E8974D"} />
          </div>
        </Card>
      ))}
      {detalhe.notas && (<><Sep /><Titulo txt="Notas" /><Card><div style={{ fontSize: 13, color: C.cinza }}>{detalhe.notas}</div></Card></>)}
    </div>
  );

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Titulo txt={`${clientes.length} cliente(s)`} />
        <Btn sm onClick={() => setModal(true)}>+ Novo</Btn>
      </div>
      {clientes.map(c => (
        <Card key={c.id} onClick={() => setDetalhe(c)} mb={10}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, color: C.verde, fontWeight: "bold" }}>{c.negocio}</div>
              <div style={{ fontSize: 11, color: C.cinza }}>{c.nome} · {c.cidade}</div>
            </div>
            <Tag txt={c.status} cor={c.status === "Em Andamento" ? "#4EADCF" : c.status === "Permuta" ? C.cobre : c.status === "Concluído" ? C.ok : "#E8974D"} />
          </div>
          <BarraProg pct={Math.round(c.etapas.filter(Boolean).length / 5 * 100)} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: C.cinza }}>{c.etapas.filter(Boolean).length}/5 etapas</span>
            <span style={{ fontSize: 12, color: C.cobre }}>{fmt(c.valor)}</span>
          </div>
        </Card>
      ))}
      {modal && (
        <Modal titulo="Novo Cliente" onClose={() => setModal(false)}>
          <Input label="Nome completo" value={form.nome} onChange={v => setForm({ ...form, nome: v })} />
          <Input label="Nome do negócio" value={form.negocio} onChange={v => setForm({ ...form, negocio: v })} />
          <Input label="Segmento" value={form.segmento} onChange={v => setForm({ ...form, segmento: v })} placeholder="Ex: Medicina, Terapia..." />
          <Input label="Cidade" value={form.cidade} onChange={v => setForm({ ...form, cidade: v })} />
          <Input label="Email (login do cliente)" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
          <Input label="Senha inicial do cliente" value={senhaCliente} onChange={setSenhaCliente} type="password" placeholder="Mínimo 6 caracteres" />
          <Input label="WhatsApp" value={form.whatsapp} onChange={v => setForm({ ...form, whatsapp: v })} />
          <Input label="Valor (R$)" value={form.valor} onChange={v => setForm({ ...form, valor: v })} type="number" />
          <Select label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={["Proposta Enviada", "Em Andamento", "Concluído", "Pausado", "Permuta"]} />
          <Select label="Tipo de Serviço" value={form.servico} onChange={v => setForm({ ...form, servico: v })} options={["Consultoria Completa", "Diagnóstico Pontual", "Treinamento", "Mentoria", "Permuta"]} />
          <Select label="Pagamento" value={form.pagamento} onChange={v => setForm({ ...form, pagamento: v })} options={["PIX", "Cartão", "Boleto", "Permuta", "Parcelado"]} />
          <Input label="Notas internas" value={form.notas} onChange={v => setForm({ ...form, notas: v })} multi />
          <Btn full onClick={salvar}>Adicionar Cliente</Btn>
        </Modal>
      )}
    </div>
  );
}

function AdminFinanceiro({ financeiro, saveFinanceiro, clientes }) {
  const [modal, setModal] = useState(false);
  const [filtro, setFiltro] = useState("Todos");
  const [form, setForm] = useState({ tipo: "Receita", descricao: "", valor: "", data: hoje(), categoria: "Consultoria", clienteId: "", status: "Recebido", notas: "" });

  const salvar = async () => {
    const novo = { ...form, id: id(), valor: Number(form.valor), criadoEm: hoje() };
    await saveFinanceiro([...financeiro, novo]);
    setModal(false);
    setForm({ tipo: "Receita", descricao: "", valor: "", data: hoje(), categoria: "Consultoria", clienteId: "", status: "Recebido", notas: "" });
  };

  const lista = filtro === "Todos" ? financeiro : financeiro.filter(f => f.tipo === filtro);
  const receita = financeiro.filter(f => f.tipo === "Receita").reduce((a, b) => a + Number(b.valor), 0);
  const despesa = financeiro.filter(f => f.tipo === "Despesa").reduce((a, b) => a + Number(b.valor), 0);

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[{ l: "Receitas", v: receita, cor: C.ok }, { l: "Despesas", v: despesa, cor: C.erro }, { l: "Saldo", v: receita - despesa, cor: C.cobre }].map(k => (
          <div key={k.l} style={{ background: C.verde, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ color: k.cor, fontSize: 14, fontWeight: "bold" }}>{fmt(k.v)}</div>
            <div style={{ color: C.lavanda, fontSize: 10, opacity: 0.7 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["Todos", "Receita", "Despesa", "Permuta"].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{ border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer", background: filtro === f ? C.verde : C.lavanda, color: filtro === f ? C.cobre : C.cinza }}>{f}</button>
        ))}
        <Btn sm onClick={() => setModal(true)}>+ Lançar</Btn>
      </div>

      {lista.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 30, fontSize: 13 }}>Nenhum lançamento ainda.</div>}
      {lista.map(f => {
        const cli = clientes.find(c => c.id === f.clienteId);
        return (
          <Card key={f.id} mb={8}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, color: C.verde }}>{f.descricao}</div>
                <div style={{ fontSize: 11, color: C.cinza, marginTop: 2 }}>{f.data} {cli ? `· ${cli.negocio}` : ""} · {f.categoria}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, color: f.tipo === "Receita" ? C.ok : f.tipo === "Despesa" ? C.erro : C.cobre, fontWeight: "bold" }}>{f.tipo === "Despesa" ? "-" : "+"}{fmt(f.valor)}</div>
                <Tag txt={f.status} cor={f.status === "Recebido" || f.status === "Pago" ? C.ok : "#E8974D"} />
              </div>
            </div>
          </Card>
        );
      })}

      {modal && (
        <Modal titulo="Novo Lançamento" onClose={() => setModal(false)}>
          <Select label="Tipo" value={form.tipo} onChange={v => setForm({ ...form, tipo: v })} options={["Receita", "Despesa", "Permuta", "Investimento"]} />
          <Input label="Descrição" value={form.descricao} onChange={v => setForm({ ...form, descricao: v })} />
          <Input label="Valor (R$)" value={form.valor} onChange={v => setForm({ ...form, valor: v })} type="number" />
          <Input label="Data" value={form.data} onChange={v => setForm({ ...form, data: v })} type="date" />
          <Select label="Categoria" value={form.categoria} onChange={v => setForm({ ...form, categoria: v })} options={["Consultoria", "Produto Digital", "Serviço Avulso", "Ferramenta", "Marketing", "Infraestrutura", "Permuta", "Outro"]} />
          <Select label="Cliente" value={form.clienteId} onChange={v => setForm({ ...form, clienteId: v })} options={[{ v: "", l: "Nenhum" }, ...clientes.map(c => ({ v: c.id, l: c.negocio }))]} />
          <Select label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={["A Receber", "Recebido", "A Pagar", "Pago", "Atrasado"]} />
          <Btn full onClick={salvar}>Salvar Lançamento</Btn>
        </Modal>
      )}
    </div>
  );
}

function AdminTreinos({ treinamentos, saveTreinamentos, modulos, saveModulos, clientes }) {
  const [modal, setModal] = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [form, setForm] = useState({ clienteId: "", nome: "", descricao: "", totalModulos: 4 });

  const salvar = async () => {
    const novo = { ...form, id: id(), totalModulos: Number(form.totalModulos), concluidos: 0, status: "Em Andamento", inicio: hoje() };
    await saveTreinamentos([...treinamentos, novo]);
    setModal(false);
    setForm({ clienteId: "", nome: "", descricao: "", totalModulos: 4 });
  };

  const toggleModulo = async (mId) => {
    const novos = modulos.map(m => m.id === mId ? { ...m, feito: !m.feito, feito_em: !m.feito ? hoje() : null } : m);
    await saveModulos(novos);
    setDetalhe(d => d ? { ...d } : null);
  };

  const modsDoTreino = (tId) => modulos.filter(m => m.treinoId === tId);

  if (detalhe) {
    const mods = modsDoTreino(detalhe.id).sort((a, b) => a.num - b.num);
    const cli = clientes.find(c => c.id === detalhe.clienteId);
    const prog = mods.length ? Math.round(mods.filter(m => m.feito).length / mods.length * 100) : 0;
    return (
      <div style={{ padding: "16px 16px 0" }}>
        <Btn sm secondary onClick={() => setDetalhe(null)}>← Voltar</Btn>
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 18, color: C.verde, fontWeight: "bold" }}>{detalhe.nome}</div>
          <div style={{ fontSize: 12, color: C.cinza }}>{cli?.negocio} · {detalhe.status}</div>
          <div style={{ marginTop: 8 }}><BarraProg pct={prog} /></div>
          <div style={{ fontSize: 11, color: C.cinza, marginTop: 4 }}>{prog}% concluído · {mods.filter(m => m.feito).length}/{mods.length} módulos</div>
        </div>
        {mods.map(m => (
          <Card key={m.id} onClick={() => toggleModulo(m.id)} mb={8}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.feito ? C.cobre : C.lavanda, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{m.feito ? "✓" : m.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: m.feito ? C.cinza : C.verde, textDecoration: m.feito ? "line-through" : "none" }}>{m.titulo}</div>
                <div style={{ fontSize: 11, color: C.cinza }}>{m.desc}</div>
                {m.notas && <div style={{ fontSize: 11, color: C.cobre, marginTop: 4 }}>📝 {m.notas}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Titulo txt={`${treinamentos.length} treinamento(s)`} />
        <Btn sm onClick={() => setModal(true)}>+ Novo</Btn>
      </div>
      {treinamentos.map(t => {
        const mods = modsDoTreino(t.id);
        const cli = clientes.find(c => c.id === t.clienteId);
        const prog = mods.length ? Math.round(mods.filter(m => m.feito).length / mods.length * 100) : 0;
        return (
          <Card key={t.id} onClick={() => setDetalhe(t)} mb={10}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: C.verde, fontWeight: "bold" }}>{t.nome}</div>
                <div style={{ fontSize: 11, color: C.cinza }}>{cli?.negocio}</div>
              </div>
              <Tag txt={t.status} cor={t.status === "Em Andamento" ? "#4EADCF" : t.status === "Concluído" ? C.ok : "#E8974D"} />
            </div>
            <BarraProg pct={prog} />
            <div style={{ fontSize: 11, color: C.cinza, marginTop: 5 }}>{prog}% · {mods.filter(m => m.feito).length}/{mods.length} módulos</div>
          </Card>
        );
      })}
      {modal && (
        <Modal titulo="Novo Treinamento" onClose={() => setModal(false)}>
          <Select label="Cliente" value={form.clienteId} onChange={v => setForm({ ...form, clienteId: v })} options={[{ v: "", l: "Selecione..." }, ...clientes.map(c => ({ v: c.id, l: c.negocio }))]} />
          <Input label="Nome do treinamento" value={form.nome} onChange={v => setForm({ ...form, nome: v })} />
          <Input label="Descrição" value={form.descricao} onChange={v => setForm({ ...form, descricao: v })} multi />
          <Input label="Total de módulos" value={form.totalModulos} onChange={v => setForm({ ...form, totalModulos: v })} type="number" />
          <Btn full onClick={salvar}>Criar Treinamento</Btn>
        </Modal>
      )}
    </div>
  );
}

function AdminTarefas({ tarefas, saveTarefas, clientes, onVoltar }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ clienteId: "", titulo: "", desc: "", prioridade: "Média", resp: "cliente", limite: "" });

  const salvar = async () => {
    const nova = { ...form, id: id(), status: "Para Fazer", criado: hoje() };
    await saveTarefas([...tarefas, nova]);
    setModal(false);
    setForm({ clienteId: "", titulo: "", desc: "", prioridade: "Média", resp: "cliente", limite: "" });
  };

  const toggle = async (tId) => {
    const novos = tarefas.map(t => t.id === tId ? { ...t, status: t.status === "Concluída" ? "Para Fazer" : "Concluída" } : t);
    await saveTarefas(novos);
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ marginBottom: 8 }}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Titulo txt="Tarefas" />
        <Btn sm onClick={() => setModal(true)}>+ Nova</Btn>
      </div>
      {tarefas.map(t => {
        const cli = clientes.find(c => c.id === t.clienteId);
        return (
          <Card key={t.id} mb={8}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div onClick={() => toggle(t.id)} style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${t.status === "Concluída" ? C.ok : C.lavanda}`, background: t.status === "Concluída" ? C.ok : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, fontSize: 12, color: "#fff" }}>{t.status === "Concluída" ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: t.status === "Concluída" ? C.cinza : C.verde, textDecoration: t.status === "Concluída" ? "line-through" : "none" }}>{t.titulo}</div>
                <div style={{ fontSize: 11, color: C.cinza, marginTop: 2 }}>{cli?.negocio} · {t.resp === "cliente" ? "👤 Cliente" : "👑 Admin"} · vence {t.limite}</div>
                <div style={{ marginTop: 4 }}><Tag txt={t.prioridade} cor={PRIO_COR[t.prioridade]} /></div>
              </div>
            </div>
          </Card>
        );
      })}
      {modal && (
        <Modal titulo="Nova Tarefa" onClose={() => setModal(false)}>
          <Select label="Cliente" value={form.clienteId} onChange={v => setForm({ ...form, clienteId: v })} options={[{ v: "", l: "Selecione..." }, ...clientes.map(c => ({ v: c.id, l: c.negocio }))]} />
          <Input label="Título" value={form.titulo} onChange={v => setForm({ ...form, titulo: v })} />
          <Input label="Descrição" value={form.desc} onChange={v => setForm({ ...form, desc: v })} multi />
          <Select label="Responsável" value={form.resp} onChange={v => setForm({ ...form, resp: v })} options={[{ v: "cliente", l: "Cliente" }, { v: "admin", l: "Admin (Isa)" }]} />
          <Select label="Prioridade" value={form.prioridade} onChange={v => setForm({ ...form, prioridade: v })} options={["Alta", "Média", "Baixa"]} />
          <Input label="Data limite" value={form.limite} onChange={v => setForm({ ...form, limite: v })} type="date" />
          <Btn full onClick={salvar}>Criar Tarefa</Btn>
        </Modal>
      )}
    </div>
  );
}

function AdminReunioes({ reunioes, saveReunioes, clientes, onVoltar }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ clienteId: "", titulo: "", data: hoje(), tipo: "Reunião com Cliente", pauta: "", decisoes: "", proximas: "", duracao: "" });

  const salvar = async () => {
    await saveReunioes([...reunioes, { ...form, id: id(), duracao: Number(form.duracao) }]);
    setModal(false);
    setForm({ clienteId: "", titulo: "", data: hoje(), tipo: "Reunião com Cliente", pauta: "", decisoes: "", proximas: "", duracao: "" });
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ marginBottom: 8 }}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Titulo txt="Reuniões" />
        <Btn sm onClick={() => setModal(true)}>+ Registrar</Btn>
      </div>
      {reunioes.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 30, fontSize: 13 }}>Nenhuma reunião registrada.</div>}
      {reunioes.sort((a, b) => b.data.localeCompare(a.data)).map(r => {
        const cli = clientes.find(c => c.id === r.clienteId);
        return (
          <Card key={r.id} mb={10}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 14, color: C.verde }}>{r.titulo}</div>
              <div style={{ fontSize: 11, color: C.cinza }}>{r.data}</div>
            </div>
            <div style={{ fontSize: 11, color: C.cinza }}>{cli?.negocio} · {r.tipo} · {r.duracao}min</div>
            {r.decisoes && <div style={{ fontSize: 12, color: C.verdeM, marginTop: 8, background: `${C.lavanda}`, borderRadius: 8, padding: "8px 10px" }}>📋 {r.decisoes}</div>}
          </Card>
        );
      })}
      {modal && (
        <Modal titulo="Registrar Reunião" onClose={() => setModal(false)}>
          <Select label="Cliente" value={form.clienteId} onChange={v => setForm({ ...form, clienteId: v })} options={[{ v: "", l: "Selecione..." }, ...clientes.map(c => ({ v: c.id, l: c.negocio }))]} />
          <Input label="Título" value={form.titulo} onChange={v => setForm({ ...form, titulo: v })} />
          <Input label="Data" value={form.data} onChange={v => setForm({ ...form, data: v })} type="date" />
          <Select label="Tipo" value={form.tipo} onChange={v => setForm({ ...form, tipo: v })} options={["Reunião com Cliente", "Call de Vendas", "Alinhamento", "Treinamento"]} />
          <Input label="Duração (minutos)" value={form.duracao} onChange={v => setForm({ ...form, duracao: v })} type="number" />
          <Input label="Pauta" value={form.pauta} onChange={v => setForm({ ...form, pauta: v })} multi />
          <Input label="Decisões tomadas" value={form.decisoes} onChange={v => setForm({ ...form, decisoes: v })} multi />
          <Input label="Próximas ações" value={form.proximas} onChange={v => setForm({ ...form, proximas: v })} multi />
          <Btn full onClick={salvar}>Salvar Reunião</Btn>
        </Modal>
      )}
    </div>
  );
}

function AdminMetricas({ metricas, clientes, onVoltar }) {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ marginBottom: 8 }}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <Titulo txt="Métricas dos Clientes" />
      {metricas.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 40 }}>
        <div style={{ fontSize: 36 }}>📊</div>
        <div style={{ marginTop: 10, fontSize: 13 }}>Nenhuma métrica inserida ainda.</div>
        <div style={{ fontSize: 11, marginTop: 6 }}>Os clientes inserem dados no portal deles.</div>
      </div>}
      {metricas.sort((a, b) => b.data.localeCompare(a.data)).map(m => {
        const cli = clientes.find(c => c.id === m.clienteId);
        return (
          <Card key={m.id} mb={10}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 14, color: C.verde }}>{cli?.negocio}</div>
              <div style={{ fontSize: 11, color: C.cinza }}>{m.data}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { l: "Faturamento", v: fmt(m.faturamento) },
                { l: "Pacientes", v: m.pacientes },
                { l: "Ticket Médio", v: fmt(m.ticket) },
                { l: "Novos", v: m.novos },
                { l: "Retorno %", v: `${m.retorno}%` },
                { l: "Satisfação", v: `${m.satisfacao}/10` },
              ].map(k => (
                <div key={k.l} style={{ background: C.branco, borderRadius: 8, padding: "8px 6px", textAlign: "center", border: `1px solid ${C.lavanda}` }}>
                  <div style={{ fontSize: 13, color: C.cobre, fontWeight: "bold" }}>{k.v}</div>
                  <div style={{ fontSize: 9, color: C.cinza, textTransform: "uppercase" }}>{k.l}</div>
                </div>
              ))}
            </div>
            {m.obs && <div style={{ fontSize: 11, color: C.cinza, marginTop: 8 }}>💬 {m.obs}</div>}
          </Card>
        );
      })}
    </div>
  );
}

function AdminNotifs({ notificacoes, saveNotificacoes, clientes, onVoltar }) {
  const marcarTodas = async () => {
    await saveNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
  };
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <Btn sm secondary onClick={onVoltar}>← Voltar</Btn>
        <Btn sm onClick={marcarTodas}>Marcar todas como lidas</Btn>
      </div>
      {notificacoes.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 30 }}>Sem notificações.</div>}
      {notificacoes.sort((a, b) => b.criadoEm?.localeCompare(a.criadoEm || "") || 0).map(n => (
        <Card key={n.id} mb={8}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.lida ? C.lavanda : C.erro, flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 13, color: n.lida ? C.cinza : C.verde }}>{n.titulo}</div>
              <div style={{ fontSize: 11, color: C.cinza, marginTop: 3 }}>{n.mensagem}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AdminUsuarios({ usuarios, saveUsuarios, clientes, onVoltar }) {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ marginBottom: 8 }}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <Titulo txt="Usuários do Sistema" />
      {usuarios.map(u => {
        const cli = clientes.find(c => c.id === u.clienteId);
        return (
          <Card key={u.id} mb={8}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, color: C.verde }}>{u.nome}</div>
                <div style={{ fontSize: 11, color: C.cinza }}>{u.email}</div>
                {cli && <div style={{ fontSize: 11, color: C.cobre }}>→ {cli.negocio}</div>}
              </div>
              <Tag txt={u.tipo} cor={u.tipo === "admin" ? C.cobre : "#4EADCF"} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AdminMais({ setTela, onLogout }) {
  const opcoes = [
    { emoji: "✅", label: "Tarefas", tela: "tarefas" },
    { emoji: "🗓️", label: "Reuniões", tela: "reunioes" },
    { emoji: "📊", label: "Métricas dos Clientes", tela: "metricas" },
    { emoji: "🔐", label: "Usuários e Acessos", tela: "usuarios" },
  ];
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <Titulo txt="Funcionalidades" />
      {opcoes.map(o => (
        <Card key={o.tela} onClick={() => setTela(o.tela)} mb={10}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 24 }}>{o.emoji}</span>
            <span style={{ fontSize: 14, color: C.verde }}>{o.label}</span>
            <span style={{ marginLeft: "auto", color: C.cinza }}>›</span>
          </div>
        </Card>
      ))}
      <Sep />
      <Btn full perigo onClick={onLogout}>Sair da conta</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTE APP
// ═══════════════════════════════════════════════════════════════════════════
function ClienteApp(props) {
  const { tela, setTela, logout, usuario, clienteDoUsuario } = props;
  const navItems = [
    { id: "inicio", emoji: "🏠", label: "Início" },
    { id: "metricas", emoji: "📊", label: "Métricas" },
    { id: "financeiro", emoji: "💰", label: "Caixa" },
    { id: "treinos", emoji: "🎓", label: "Treinos" },
    { id: "mais", emoji: "⚙️", label: "Mais" },
  ];

  return (
    <div style={{ background: C.branco, minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      <Header titulo={tela === "inicio" ? `Olá, ${usuario.nome.split(" ")[0]} 👋` : tela === "metricas" ? "Minhas Métricas" : tela === "financeiro" ? "Financeiro" : tela === "treinos" ? "Treinamentos" : "Mais"} sub={clienteDoUsuario?.negocio || "Portal do Cliente"} />
      <div style={{ paddingBottom: 80 }}>
        {tela === "inicio" && <ClienteInicio {...props} />}
        {tela === "metricas" && <ClienteMetricas {...props} />}
        {tela === "financeiro" && <ClienteFinanceiro {...props} />}
        {tela === "treinos" && <ClienteTreinos {...props} />}
        {tela === "mais" && <ClienteMais {...props} onLogout={logout} />}
        {tela === "tarefas" && <ClienteTarefas {...props} onVoltar={() => setTela("mais")} />}
        {tela === "reunioes" && <ClienteReunioes {...props} onVoltar={() => setTela("mais")} />}
      </div>
      <BottomNav itens={navItems} atual={tela} onTroca={setTela} />
    </div>
  );
}

function ClienteInicio({ clienteDoUsuario, tarefas, notificacoes }) {
  if (!clienteDoUsuario) return <div style={{ padding: 20, color: C.cinza }}>Perfil não encontrado.</div>;
  const c = clienteDoUsuario;
  const prog = Math.round(c.etapas.filter(Boolean).length / 5 * 100);
  const meusTasks = tarefas.filter(t => t.clienteId === c.id && t.status !== "Concluída");
  const minhasNotifs = notificacoes.filter(n => n.clienteId === c.id && !n.lida);

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ background: C.verde, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ color: C.lavanda, fontSize: 13, marginBottom: 4 }}>{c.negocio}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ color: C.cobre, fontSize: 11 }}>Progresso do Projeto</div>
          <div style={{ color: C.cobre, fontSize: 26, fontWeight: "bold" }}>{prog}%</div>
        </div>
        <BarraProg pct={prog} />
        <div style={{ display: "flex", marginTop: 12, gap: 8 }}>
          {["Diagnóstico", "Estratégia", "Execução", "Entrega", "Ajuste"].map((e, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 5, borderRadius: 3, background: c.etapas[i] ? C.cobre : "rgba(255,255,255,0.2)", marginBottom: 4 }} />
              <div style={{ fontSize: 8, color: c.etapas[i] ? C.cobre : "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{e.slice(0, 4)}</div>
            </div>
          ))}
        </div>
      </div>

      {meusTasks.length > 0 && (
        <>
          <Titulo txt={`${meusTasks.length} tarefa(s) pendente(s)`} />
          {meusTasks.map(t => (
            <Card key={t.id} mb={8}>
              <div style={{ fontSize: 13, color: C.verde }}>{t.titulo}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: C.cinza }}>Vence {t.limite}</span>
                <Tag txt={t.prioridade} cor={PRIO_COR[t.prioridade]} />
              </div>
            </Card>
          ))}
        </>
      )}

      {minhasNotifs.length > 0 && (
        <>
          <Sep />
          <Titulo txt="Novidades" />
          {minhasNotifs.map(n => (
            <Card key={n.id} mb={8}>
              <div style={{ fontSize: 13, color: C.verde }}>🔔 {n.titulo}</div>
              <div style={{ fontSize: 11, color: C.cinza, marginTop: 4 }}>{n.mensagem}</div>
            </Card>
          ))}
        </>
      )}

      <div style={{ background: C.lavanda, borderRadius: 12, padding: 14, marginTop: 8 }}>
        <div style={{ fontSize: 11, color: C.cinza, textAlign: "center" }}>
          Valor do projeto: <strong style={{ color: C.verde }}>{fmt(c.valor)}</strong> · {c.pagamento}
        </div>
      </div>
    </div>
  );
}

function ClienteMetricas({ clienteDoUsuario, metricas, saveMetricas, addNotificacao, usuario }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ data: hoje(), faturamento: "", pacientes: "", novos: "", ticket: "", retorno: "", satisfacao: "", obs: "" });
  if (!clienteDoUsuario) return null;
  const cId = clienteDoUsuario.id;
  const meus = metricas.filter(m => m.clienteId === cId).sort((a, b) => b.data.localeCompare(a.data));

  const salvar = async () => {
    const nova = { ...form, id: id(), clienteId: cId, faturamento: Number(form.faturamento), pacientes: Number(form.pacientes), novos: Number(form.novos), ticket: Number(form.ticket), retorno: Number(form.retorno), satisfacao: Number(form.satisfacao) };
    await saveMetricas([...metricas, nova]);
    await addNotificacao("adm1", "metricas", `Nova métrica de ${clienteDoUsuario.negocio}`, `${clienteDoUsuario.nome} inseriu dados de ${form.data}`, cId);
    setModal(false);
    setForm({ data: hoje(), faturamento: "", pacientes: "", novos: "", ticket: "", retorno: "", satisfacao: "", obs: "" });
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Titulo txt="Indicadores mensais" />
        <Btn sm onClick={() => setModal(true)}>+ Inserir</Btn>
      </div>
      {meus.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 40 }}>
        <div style={{ fontSize: 36 }}>📊</div>
        <div style={{ marginTop: 10, fontSize: 13 }}>Insira seus dados mensais aqui.</div>
        <div style={{ fontSize: 11, marginTop: 6, color: C.cinza }}>Isa acompanha em tempo real.</div>
      </div>}
      {meus.map(m => (
        <Card key={m.id} mb={10}>
          <div style={{ fontSize: 14, color: C.verde, marginBottom: 10, fontWeight: "bold" }}>{m.data}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[{ l: "Faturamento", v: fmt(m.faturamento) }, { l: "Pacientes", v: m.pacientes }, { l: "Ticket", v: fmt(m.ticket) }, { l: "Novos", v: m.novos }, { l: "Retorno", v: `${m.retorno}%` }, { l: "Satisfação", v: `${m.satisfacao}/10` }].map(k => (
              <div key={k.l} style={{ textAlign: "center", background: C.branco, borderRadius: 8, padding: 8, border: `1px solid ${C.lavanda}` }}>
                <div style={{ fontSize: 13, color: C.cobre, fontWeight: "bold" }}>{k.v}</div>
                <div style={{ fontSize: 9, color: C.cinza, textTransform: "uppercase" }}>{k.l}</div>
              </div>
            ))}
          </div>
          {m.obs && <div style={{ fontSize: 11, color: C.cinza, marginTop: 8 }}>💬 {m.obs}</div>}
        </Card>
      ))}
      {modal && (
        <Modal titulo="Inserir Métricas do Mês" onClose={() => setModal(false)}>
          <Input label="Mês de referência" value={form.data} onChange={v => setForm({ ...form, data: v })} type="date" />
          <Input label="Faturamento total (R$)" value={form.faturamento} onChange={v => setForm({ ...form, faturamento: v })} type="number" />
          <Input label="Total de pacientes/atendimentos" value={form.pacientes} onChange={v => setForm({ ...form, pacientes: v })} type="number" />
          <Input label="Novos pacientes/clientes" value={form.novos} onChange={v => setForm({ ...form, novos: v })} type="number" />
          <Input label="Ticket médio (R$)" value={form.ticket} onChange={v => setForm({ ...form, ticket: v })} type="number" />
          <Input label="Taxa de retorno (%)" value={form.retorno} onChange={v => setForm({ ...form, retorno: v })} type="number" placeholder="Ex: 65" />
          <Input label="Satisfação geral (1 a 10)" value={form.satisfacao} onChange={v => setForm({ ...form, satisfacao: v })} type="number" placeholder="Ex: 8" />
          <Input label="Observações" value={form.obs} onChange={v => setForm({ ...form, obs: v })} multi placeholder="Algo que influenciou os números este mês..." />
          <Btn full onClick={salvar}>Enviar Métricas</Btn>
        </Modal>
      )}
    </div>
  );
}

function ClienteFinanceiro({ clienteDoUsuario, financeiro, saveFinanceiro, addNotificacao }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ tipo: "Despesa", descricao: "", valor: "", data: hoje(), categoria: "Outro", notas: "" });
  if (!clienteDoUsuario) return null;
  const cId = clienteDoUsuario.id;
  const meus = financeiro.filter(f => f.clienteId === cId).sort((a, b) => b.data?.localeCompare(a.data || "") || 0);

  const salvar = async () => {
    const novo = { ...form, id: id(), clienteId: cId, valor: Number(form.valor), inseridoPor: "cliente", criadoEm: hoje() };
    await saveFinanceiro([...financeiro, novo]);
    await addNotificacao("adm1", "financeiro", `Lançamento de ${clienteDoUsuario.negocio}`, `${form.tipo}: ${form.descricao} - ${fmt(Number(form.valor))}`, cId);
    setModal(false);
    setForm({ tipo: "Despesa", descricao: "", valor: "", data: hoje(), categoria: "Outro", notas: "" });
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Titulo txt="Meus lançamentos" />
        <Btn sm onClick={() => setModal(true)}>+ Inserir</Btn>
      </div>
      {meus.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 30, fontSize: 13 }}>Nenhum lançamento ainda.</div>}
      {meus.map(f => (
        <Card key={f.id} mb={8}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: C.verde }}>{f.descricao}</div>
              <div style={{ fontSize: 11, color: C.cinza }}>{f.data} · {f.categoria}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: "bold", color: f.tipo === "Receita" ? C.ok : f.tipo === "Despesa" ? C.erro : C.cobre }}>{f.tipo === "Despesa" ? "-" : "+"}{fmt(f.valor)}</div>
            </div>
          </div>
        </Card>
      ))}
      {modal && (
        <Modal titulo="Novo Lançamento" onClose={() => setModal(false)}>
          <Select label="Tipo" value={form.tipo} onChange={v => setForm({ ...form, tipo: v })} options={["Receita", "Despesa"]} />
          <Input label="Descrição" value={form.descricao} onChange={v => setForm({ ...form, descricao: v })} />
          <Input label="Valor (R$)" value={form.valor} onChange={v => setForm({ ...form, valor: v })} type="number" />
          <Input label="Data" value={form.data} onChange={v => setForm({ ...form, data: v })} type="date" />
          <Select label="Categoria" value={form.categoria} onChange={v => setForm({ ...form, categoria: v })} options={["Receita Clínica", "Material", "Equipamento", "Aluguel", "Funcionário", "Marketing", "Imposto", "Outro"]} />
          <Btn full onClick={salvar}>Salvar</Btn>
        </Modal>
      )}
    </div>
  );
}

function ClienteTreinos({ clienteDoUsuario, treinamentos, modulos, saveModulos, addNotificacao }) {
  const [detalhe, setDetalhe] = useState(null);
  if (!clienteDoUsuario) return null;
  const cId = clienteDoUsuario.id;
  const meusTreinos = treinamentos.filter(t => t.clienteId === cId);

  const toggleMod = async (mId) => {
    const m = modulos.find(x => x.id === mId);
    const novos = modulos.map(x => x.id === mId ? { ...x, feito: !x.feito, feito_em: !x.feito ? hoje() : null } : x);
    await saveModulos(novos);
    if (!m.feito) await addNotificacao("adm1", "treino", `Módulo concluído por ${clienteDoUsuario.nome}`, `"${m.titulo}" foi marcado como concluído.`, cId);
  };

  if (detalhe) {
    const mods = modulos.filter(m => m.treinoId === detalhe.id).sort((a, b) => a.num - b.num);
    const prog = mods.length ? Math.round(mods.filter(m => m.feito).length / mods.length * 100) : 0;
    return (
      <div style={{ padding: "16px 16px 0" }}>
        <Btn sm secondary onClick={() => setDetalhe(null)}>← Voltar</Btn>
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 18, color: C.verde, fontWeight: "bold" }}>{detalhe.nome}</div>
          <div style={{ fontSize: 12, color: C.cinza, marginTop: 2 }}>{detalhe.descricao}</div>
          <div style={{ marginTop: 8 }}><BarraProg pct={prog} /></div>
          <div style={{ fontSize: 11, color: C.cinza, marginTop: 4 }}>{prog}% concluído</div>
        </div>
        {mods.map(m => (
          <Card key={m.id} mb={8}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div onClick={() => toggleMod(m.id)} style={{ width: 30, height: 30, borderRadius: "50%", background: m.feito ? C.cobre : C.lavanda, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 14 }}>{m.feito ? "✓" : m.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: m.feito ? C.cinza : C.verde, textDecoration: m.feito ? "line-through" : "none" }}>{m.titulo}</div>
                <div style={{ fontSize: 11, color: C.cinza }}>{m.desc}</div>
                {m.feito_em && <div style={{ fontSize: 10, color: C.ok, marginTop: 4 }}>✓ Concluído em {m.feito_em}</div>}
                {m.notas && <div style={{ fontSize: 11, color: C.cobre, marginTop: 4 }}>📝 {m.notas}</div>}
                {m.nota > 0 && <div style={{ fontSize: 11, color: "#E8C547" }}>{"★".repeat(m.nota)}{"☆".repeat(5 - m.nota)}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <Titulo txt="Meus Treinamentos" />
      {meusTreinos.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 40 }}><div style={{ fontSize: 36 }}>🎓</div><div style={{ marginTop: 10, fontSize: 13 }}>Nenhum treinamento atribuído ainda.</div></div>}
      {meusTreinos.map(t => {
        const mods = modulos.filter(m => m.treinoId === t.id);
        const prog = mods.length ? Math.round(mods.filter(m => m.feito).length / mods.length * 100) : 0;
        return (
          <Card key={t.id} onClick={() => setDetalhe(t)} mb={10}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: C.verde, fontWeight: "bold" }}>{t.nome}</div>
              <Tag txt={t.status} cor={t.status === "Em Andamento" ? "#4EADCF" : C.ok} />
            </div>
            <div style={{ fontSize: 12, color: C.cinza, marginBottom: 8 }}>{t.descricao}</div>
            <BarraProg pct={prog} />
            <div style={{ fontSize: 11, color: C.cinza, marginTop: 5 }}>{prog}% · {mods.filter(m => m.feito).length}/{mods.length} módulos</div>
          </Card>
        );
      })}
    </div>
  );
}

function ClienteTarefas({ clienteDoUsuario, tarefas, saveTarefas, addNotificacao, onVoltar }) {
  if (!clienteDoUsuario) return null;
  const cId = clienteDoUsuario.id;
  const meus = tarefas.filter(t => t.clienteId === cId);

  const toggle = async (tId) => {
    const t = tarefas.find(x => x.id === tId);
    const novos = tarefas.map(x => x.id === tId ? { ...x, status: x.status === "Concluída" ? "Para Fazer" : "Concluída" } : x);
    await saveTarefas(novos);
    if (t.status !== "Concluída") await addNotificacao("adm1", "tarefa", `Tarefa concluída por ${clienteDoUsuario.nome}`, `"${t.titulo}" foi marcada como concluída.`, cId);
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ marginBottom: 8 }}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <Titulo txt="Minhas Tarefas" />
      {meus.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 30 }}>Sem tarefas no momento.</div>}
      {meus.map(t => (
        <Card key={t.id} mb={8}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div onClick={() => toggle(t.id)} style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${t.status === "Concluída" ? C.ok : C.lavanda}`, background: t.status === "Concluída" ? C.ok : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 12, color: "#fff" }}>{t.status === "Concluída" ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: t.status === "Concluída" ? C.cinza : C.verde, textDecoration: t.status === "Concluída" ? "line-through" : "none" }}>{t.titulo}</div>
              <div style={{ fontSize: 11, color: C.cinza }}>{t.desc}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <Tag txt={t.prioridade} cor={PRIO_COR[t.prioridade]} />
                {t.limite && <span style={{ fontSize: 10, color: C.cinza }}>Vence {t.limite}</span>}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ClienteReunioes({ clienteDoUsuario, reunioes, onVoltar }) {
  if (!clienteDoUsuario) return null;
  const minhas = reunioes.filter(r => r.clienteId === clienteDoUsuario.id).sort((a, b) => b.data.localeCompare(a.data));
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ marginBottom: 8 }}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <Titulo txt="Histórico de Reuniões" />
      {minhas.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 30 }}>Nenhuma reunião registrada ainda.</div>}
      {minhas.map(r => (
        <Card key={r.id} mb={10}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 14, color: C.verde }}>{r.titulo}</div>
            <div style={{ fontSize: 11, color: C.cinza }}>{r.data}</div>
          </div>
          <Tag txt={r.tipo} cor={C.verdeM} />
          {r.decisoes && <div style={{ marginTop: 10, background: C.lavanda, borderRadius: 8, padding: "8px 10px", fontSize: 12, color: C.verde }}>📋 {r.decisoes}</div>}
          {r.proximas && <div style={{ marginTop: 8, fontSize: 12, color: C.cinza }}>→ {r.proximas}</div>}
        </Card>
      ))}
    </div>
  );
}

function ClienteMais({ setTela, onLogout, usuario }) {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <Titulo txt="Mais opções" />
      {[
        { emoji: "✅", label: "Minhas Tarefas", tela: "tarefas" },
        { emoji: "🗓️", label: "Histórico de Reuniões", tela: "reunioes" },
      ].map(o => (
        <Card key={o.tela} onClick={() => setTela(o.tela)} mb={10}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 22 }}>{o.emoji}</span>
            <span style={{ fontSize: 14, color: C.verde }}>{o.label}</span>
            <span style={{ marginLeft: "auto", color: C.cinza }}>›</span>
          </div>
        </Card>
      ))}
      <Sep />
      <Card mb={10}>
        <div style={{ fontSize: 13, color: C.cinza }}>Logado como</div>
        <div style={{ fontSize: 14, color: C.verde, marginTop: 4 }}>{usuario.nome}</div>
        <div style={{ fontSize: 12, color: C.cinza }}>{usuario.email}</div>
      </Card>
      <Btn full perigo onClick={onLogout}>Sair da conta</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING
// ═══════════════════════════════════════════════════════════════════════════
function Carregando() {
  return (
    <div style={{ background: C.verde, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ color: C.cobre, fontSize: 32 }}>◈</div>
      <div style={{ color: C.lavanda, fontSize: 14, fontFamily: "Georgia,serif" }}>carregando portal...</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [fase, setFase] = useState("loading");
  const [usuario, setUsuario] = useState(null);
  const [tela, setTelaRaw] = useState("dashboard");
  const [telaC, setTelaC] = useState("inicio");
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [treinamentos, setTreinamentos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [reunioes, setReunioes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [metricas, setMetricas] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await st.get("portal-usuarios") || USUARIOS_SEED;
      const c = await st.get("portal-clientes") || CLIENTES_SEED;
      const f = await st.get("portal-financeiro") || [];
      const tr = await st.get("portal-treinos") || TREINOS_SEED;
      const mo = await st.get("portal-modulos") || MODULOS_SEED;
      const ta = await st.get("portal-tarefas") || TAREFAS_SEED;
      const re = await st.get("portal-reunioes") || [];
      const do2 = await st.get("portal-docs") || [];
      const me = await st.get("portal-metricas") || [];
      const no = await st.get("portal-notifs") || [];
      setUsuarios(u); setClientes(c); setFinanceiro(f); setTreinamentos(tr);
      setModulos(mo); setTarefas(ta); setReunioes(re); setDocumentos(do2); setMetricas(me); setNotificacoes(no);
      const sess = await st.get("portal-sessao");
      if (sess?.email) {
        const found = u.find(x => x.email === sess.email && x.ativo);
        if (found) { setUsuario(found); setFase(found.tipo === "admin" ? "admin" : "cliente"); return; }
      }
      setFase("login");
    })();
  }, []);

  const save = async (key, setter, val) => { setter(val); await st.set(key, val); };
  const saveUsuarios = v => save("portal-usuarios", setUsuarios, v);
  const saveClientes = v => save("portal-clientes", setClientes, v);
  const saveFinanceiro = v => save("portal-financeiro", setFinanceiro, v);
  const saveTreinamentos = v => save("portal-treinos", setTreinamentos, v);
  const saveModulos = v => save("portal-modulos", setModulos, v);
  const saveTarefas = v => save("portal-tarefas", setTarefas, v);
  const saveReunioes = v => save("portal-reunioes", setReunioes, v);
  const saveDocumentos = v => save("portal-docs", setDocumentos, v);
  const saveMetricas = v => save("portal-metricas", setMetricas, v);
  const saveNotificacoes = v => save("portal-notifs", setNotificacoes, v);

  const addNotificacao = async (uId, tipo, titulo, msg, cId) => {
    const nova = { id: id(), usuarioId: uId, clienteId: cId, tipo, titulo, mensagem: msg, lida: false, criadoEm: new Date().toISOString() };
    const novos = [...notificacoes, nova];
    setNotificacoes(novos); await st.set("portal-notifs", novos);
  };

  const login = async (email, senha) => {
    const u = usuarios.find(x => x.email === email && x.senha === senha && x.ativo);
    if (!u) return false;
    setUsuario(u); await st.set("portal-sessao", { email });
    setFase(u.tipo === "admin" ? "admin" : "cliente");
    return true;
  };

  const logout = async () => {
    await st.set("portal-sessao", null); setUsuario(null); setFase("login");
  };

  const clienteDoUsuario = usuario?.tipo === "cliente" ? clientes.find(c => c.id === usuario.clienteId) : null;
  const setTela = (t) => { setTelaRaw(t); };

  const p = { usuario, usuarios, clientes, financeiro, treinamentos, modulos, tarefas, reunioes, documentos, metricas, notificacoes, saveUsuarios, saveClientes, saveFinanceiro, saveTreinamentos, saveModulos, saveTarefas, saveReunioes, saveDocumentos, saveMetricas, saveNotificacoes, addNotificacao, logout, clienteDoUsuario };

  if (fase === "loading") return <Carregando />;
  if (fase === "login") return <Login onLogin={login} />;
  if (fase === "admin") return <AdminApp tela={tela} setTela={setTela} {...p} />;
  return <ClienteApp tela={telaC} setTela={setTelaC} {...p} />;
}

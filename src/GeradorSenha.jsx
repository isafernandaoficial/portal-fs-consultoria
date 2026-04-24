import { useState, useCallback } from "react";
import { gerarSenhaSegura, avaliarForca } from "./passwordUtils.js";

const C = {
  verde: "#153029", verdeM: "#1A4738", cobre: "#AD7F67", cobreL: "#C99A80",
  lavanda: "#E6E1E7", branco: "#F9F7F4", cinza: "#8A8580", erro: "#CC4444",
  ok: "#52C97A", escuro: "#0D1F1A",
};

const st = {
  card: {
    background: C.branco, borderRadius: 16, padding: 28,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)", maxWidth: 460, width: "100%", fontFamily: "Georgia,serif",
  },
  titulo: { fontSize: 18, color: C.verde, fontWeight: "bold", marginBottom: 6 },
  subtitulo: { fontSize: 13, color: C.cinza, marginBottom: 24 },
  label: { fontSize: 11, color: C.cinza, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 },
  senhaBox: {
    display: "flex", alignItems: "center", gap: 8,
    border: `1px solid ${C.lavanda}`, borderRadius: 10,
    padding: "10px 14px", background: "#fff", marginBottom: 16,
  },
  senhaTexto: {
    flex: 1, fontFamily: "monospace", fontSize: 15, color: C.verde,
    wordBreak: "break-all", userSelect: "all",
  },
  btnIcone: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 18, padding: "2px 6px", color: C.cinza, borderRadius: 6,
    transition: "color .15s",
  },
  slider: { width: "100%", accentColor: C.verde, cursor: "pointer" },
  checkbox: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10, fontSize: 13, color: C.verde },
  barraForca: { height: 6, borderRadius: 4, transition: "width .3s, background .3s" },
  dica: { fontSize: 12, color: C.cinza, marginTop: 4, paddingLeft: 4 },
  btnGerar: {
    width: "100%", padding: "13px 20px", background: C.verde, border: "none",
    borderRadius: 12, color: C.cobreL, fontSize: 14, cursor: "pointer",
    fontFamily: "Georgia,serif", marginTop: 8,
  },
  copiado: { fontSize: 12, color: C.ok, textAlign: "center", marginTop: 8, height: 16 },
};

export default function GeradorSenha() {
  const [comprimento, setComprimento] = useState(16);
  const [opcoes, setOpcoes] = useState({ maiusculas: true, minusculas: true, numeros: true, simbolos: true });
  const [senha, setSenha] = useState(() => gerarSenhaSegura(16));
  const [copiado, setCopiado] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  const forca = avaliarForca(senha);

  const gerar = useCallback(() => {
    try {
      setSenha(gerarSenhaSegura(comprimento, opcoes));
      setCopiado(false);
    } catch {}
  }, [comprimento, opcoes]);

  const copiar = () => {
    navigator.clipboard.writeText(senha).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const toggleOpcao = (k) => {
    const ativas = Object.values({ ...opcoes, [k]: !opcoes[k] }).filter(Boolean).length;
    if (ativas === 0) return; // Garante ao menos uma categoria ativa
    setOpcoes(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const larguraForca = `${(forca.pontuacao / forca.nivelMax) * 100}%`;

  return (
    <div style={st.card}>
      <div style={st.titulo}>Gerador de Senha Segura</div>
      <div style={st.subtitulo}>Senhas geradas com criptografia nativa do navegador (Web Crypto API).</div>

      {/* Exibição da senha */}
      <div style={st.label}>Senha gerada</div>
      <div style={st.senhaBox}>
        <div style={{ ...st.senhaTexto, filter: mostrar ? "none" : "blur(5px)", transition: "filter .2s" }}>
          {senha}
        </div>
        <button style={st.btnIcone} onClick={() => setMostrar(v => !v)} title={mostrar ? "Ocultar" : "Mostrar"}>
          {mostrar ? "🙈" : "👁"}
        </button>
        <button style={st.btnIcone} onClick={copiar} title="Copiar">📋</button>
      </div>
      <div style={st.copiado}>{copiado ? "✓ Copiado!" : ""}</div>

      {/* Indicador de força */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={st.label}>Força</div>
          <div style={{ fontSize: 12, color: forca.cor, fontWeight: "bold" }}>{forca.nivel}</div>
        </div>
        <div style={{ background: C.lavanda, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ ...st.barraForca, width: larguraForca, background: forca.cor }} />
        </div>
        {forca.dicas.slice(0, 2).map((d, i) => (
          <div key={i} style={st.dica}>⚠ {d}</div>
        ))}
      </div>

      {/* Comprimento */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={st.label}>Comprimento</div>
          <div style={{ fontSize: 13, color: C.verde, fontWeight: "bold" }}>{comprimento}</div>
        </div>
        <input
          type="range" min={8} max={64} value={comprimento}
          onChange={e => setComprimento(Number(e.target.value))}
          style={st.slider}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.cinza }}>
          <span>8</span><span>64</span>
        </div>
      </div>

      {/* Opções */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...st.label, marginBottom: 10 }}>Incluir</div>
        {[
          { k: "maiusculas", label: "Maiúsculas (A–Z)" },
          { k: "minusculas", label: "Minúsculas (a–z)" },
          { k: "numeros",    label: "Números (0–9)" },
          { k: "simbolos",   label: "Símbolos (!@#$...)" },
        ].map(({ k, label }) => (
          <label key={k} style={st.checkbox}>
            <input
              type="checkbox" checked={opcoes[k]}
              onChange={() => toggleOpcao(k)}
              style={{ accentColor: C.verde, width: 15, height: 15 }}
            />
            {label}
          </label>
        ))}
      </div>

      <button style={st.btnGerar} onClick={gerar}>↻ Gerar Nova Senha</button>
    </div>
  );
}

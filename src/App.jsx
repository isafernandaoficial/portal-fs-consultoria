import { useState, useEffect } from "react";

// ── SUPABASE CONFIG ─────────────────────────────────────────────────────────
const SB_URL = "https://ioybontcswdbblfsuutr.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveWJvbnRjc3dkYmJsZnN1dXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNDU1ODAsImV4cCI6MjA5MDkyMTU4MH0.ife20ZzY8VlvtfZuVQCHIDksP8Byfwv_kP8-EsCjRGE";

const sb = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      "Prefer": opts.method === "POST" ? "return=representation" : "return=representation",
      ...opts.headers
    },
    ...opts
  });
  if (!r.ok) { const e = await r.text(); throw new Error(e); }
  const t = await r.text();
  return t ? JSON.parse(t) : [];
};

const db = {
  get: (table, q = "") => sb(`${table}?${q}&order=criado_em.desc`),
  getOne: (table, q) => sb(`${table}?${q}`).then(r => r[0] || null),
  insert: (table, data) => sb(table, { method: "POST", body: JSON.stringify(data) }),
  update: (table, id, data) => sb(`${table}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  del: (table, id) => sb(`${table}?id=eq.${id}`, { method: "DELETE" }),
};

// ── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = { verde: "#153029", verdeM: "#1A4738", cobre: "#AD7F67", cobreL: "#C99A80", lavanda: "#E6E1E7", branco: "#F9F7F4", cinza: "#8A8580", erro: "#CC4444", ok: "#52C97A", escuro: "#0D1F1A" };

const hoje = () => new Date().toISOString().split("T")[0];
const fmt = v => Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const pct = (a,b) => b ? Math.round((a/b)*100) : 0;

// ── ATOMS ───────────────────────────────────────────────────────────────────
const Btn = ({children,onClick,full,sm,secondary,perigo,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",padding:sm?"8px 14px":"13px 20px",background:disabled?"#ccc":perigo?C.erro:secondary?"transparent":C.verde,border:secondary?`1px solid ${C.lavanda}`:"none",borderRadius:12,color:perigo?"#fff":secondary?C.cinza:C.cobreL,fontSize:sm?12:14,cursor:disabled?"not-allowed":"pointer",fontFamily:"Georgia,serif",opacity:disabled?0.6:1}}>{children}</button>
);
const Input = ({label,value,onChange,type="text",placeholder,multi}) => (
  <div style={{marginBottom:14}}>
    {label&&<div style={{fontSize:11,color:C.cinza,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{label}</div>}
    {multi
      ?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{width:"100%",padding:"11px 13px",border:`1px solid ${C.lavanda}`,borderRadius:10,fontFamily:"Georgia,serif",fontSize:13,color:C.verde,background:C.branco,resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
      :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"11px 13px",border:`1px solid ${C.lavanda}`,borderRadius:10,fontFamily:"Georgia,serif",fontSize:13,color:C.verde,background:C.branco,boxSizing:"border-box",outline:"none"}}/>}
  </div>
);
const Sel = ({label,value,onChange,options}) => (
  <div style={{marginBottom:14}}>
    {label&&<div style={{fontSize:11,color:C.cinza,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"11px 13px",border:`1px solid ${C.lavanda}`,borderRadius:10,fontFamily:"Georgia,serif",fontSize:13,color:C.verde,background:C.branco,outline:"none"}}>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  </div>
);
const Card = ({children,onClick,pad=16,mb=10,border}) => (
  <div onClick={onClick} style={{background:"#fff",borderRadius:16,padding:pad,marginBottom:mb,boxShadow:"0 2px 12px rgba(21,48,41,0.07)",cursor:onClick?"pointer":"default",border:border||"none"}}>{children}</div>
);
const Tag = ({txt,cor}) => <span style={{background:`${cor}22`,color:cor,borderRadius:20,padding:"3px 10px",fontSize:11,whiteSpace:"nowrap"}}>{txt}</span>;
const Sep = () => <div style={{height:1,background:C.lavanda,margin:"14px 0"}}/>;
const Tit = ({txt}) => <div style={{fontSize:11,color:C.cinza,textTransform:"uppercase",letterSpacing:2,marginBottom:14}}>{txt}</div>;
const Bar = ({p,cor=C.cobre,h=7}) => (
  <div style={{background:C.lavanda,borderRadius:4,height:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min(100,p||0)}%`,height:"100%",background:`linear-gradient(90deg,${C.verdeM},${cor})`,borderRadius:4,transition:"width 0.4s"}}/>
  </div>
);
const Erro = ({msg}) => msg ? <div style={{color:C.erro,fontSize:12,marginBottom:10,padding:"8px 12px",background:"#ffeeee",borderRadius:8}}>{msg}</div> : null;

const Header = ({titulo,sub,voltar,extra}) => (
  <div style={{background:C.verde,padding:"18px 20px 14px",position:"sticky",top:0,zIndex:50}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      {voltar?<button onClick={voltar} style={{background:"none",border:"none",color:C.cobre,fontSize:22,cursor:"pointer"}}>←</button>:<div style={{width:22}}/>}
      <div style={{textAlign:"center"}}>
        {sub&&<div style={{fontSize:10,color:C.cobre,letterSpacing:3,textTransform:"uppercase"}}>{sub}</div>}
        <div style={{color:C.lavanda,fontSize:16,marginTop:sub?2:0}}>{titulo}</div>
      </div>
      {extra||<div style={{width:22}}/>}
    </div>
  </div>
);
const BottomNav = ({itens,atual,onTroca}) => (
  <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.verde,borderTop:`1px solid ${C.verdeM}`,display:"flex",padding:"8px 0 14px",zIndex:40}}>
    {itens.map(i=>(
      <button key={i.id} onClick={()=>onTroca(i.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <div style={{fontSize:20}}>{i.emoji}</div>
        <div style={{fontSize:9,color:atual===i.id?C.cobre:C.lavanda,opacity:atual===i.id?1:0.5,textTransform:"uppercase",letterSpacing:1}}>{i.label}</div>
      </button>
    ))}
  </div>
);
const Modal = ({titulo,onClose,children}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
    <div style={{background:C.branco,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"22px 20px 36px",maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:15,color:C.verde,fontWeight:"bold"}}>{titulo}</div>
        <button onClick={onClose} style={{background:C.lavanda,border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16}}>×</button>
      </div>
      {children}
    </div>
  </div>
);
const Carregando = ({msg="carregando..."}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,flexDirection:"column",gap:10}}>
    <div style={{color:C.cobre,fontSize:24}}>◈</div>
    <div style={{color:C.cinza,fontSize:13}}>{msg}</div>
  </div>
);

// ── LOGIN ───────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [email,setEmail]=useState("");
  const [senha,setSenha]=useState("");
  const [erro,setErro]=useState("");
  const [load,setLoad]=useState(false);

  const entrar = async () => {
    setErro(""); setLoad(true);
    const ok = await onLogin(email.trim(), senha);
    setLoad(false);
    if(!ok) setErro("Email ou senha incorretos.");
  };

  return (
    <div style={{background:C.verde,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,color:C.cobre,letterSpacing:5,textTransform:"uppercase"}}>FS Consultoria</div>
          <div style={{color:C.lavanda,fontSize:30,marginTop:10,fontStyle:"italic"}}>Portal de Gestão</div>
          <div style={{color:C.cinza,fontSize:12,marginTop:6,opacity:0.7}}>Transformando desafios em qualidade.</div>
        </div>
        <div style={{background:C.branco,borderRadius:20,padding:28}}>
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="seu@email.com"/>
          <Input label="Senha" value={senha} onChange={setSenha} type="password" placeholder="••••••••"/>
          <Erro msg={erro}/>
          <Btn full onClick={entrar} disabled={load}>{load?"Entrando...":"Entrar"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── TREINAMENTOS NETFLIX ────────────────────────────────────────────────────
function TelaTreinos({treinos,modulos,carregarModulos,clienteId,isAdmin,usuario,addNotif,carregarTreinos}) {
  const [aberto,setAberto]=useState(null);
  const [modAberto,setModAberto]=useState(null);
  const [modalNovo,setModalNovo]=useState(false);
  const [form,setForm]=useState({nome:"",descricao:"",categoria:"Gestão",thumb:"🎓",cor:C.verdeM,cliente_id:clienteId||""});
  const [salvando,setSalvando]=useState(false);

  const meus = isAdmin ? treinos : treinos.filter(t=>t.cliente_id===clienteId);
  const destaque = meus.find(t=>t.destaque)||meus[0];
  const categorias = [...new Set(meus.map(t=>t.categoria))];

  const progT = (t) => {
    const ms = modulos.filter(m=>m.treino_id===t.id);
    return ms.length ? pct(ms.filter(m=>m.feito).length, ms.length) : 0;
  };

  const toggleMod = async (m) => {
    await db.update("modulos", m.id, {feito:!m.feito, feito_em:!m.feito?hoje():null});
    await carregarModulos();
    if(!m.feito && addNotif) await addNotif("treino",`Módulo concluído`,`${usuario.nome} concluiu "${m.titulo}"`);
  };

  const salvarTreino = async () => {
    setSalvando(true);
    await db.insert("treinos", {...form, destaque:false, status:"Não Iniciado", inicio:hoje()});
    await carregarTreinos();
    setSalvando(false); setModalNovo(false);
    setForm({nome:"",descricao:"",categoria:"Gestão",thumb:"🎓",cor:C.verdeM,cliente_id:clienteId||""});
  };

  if(modAberto) {
    const m = modAberto;
    return (
      <div style={{background:C.escuro,minHeight:"100%"}}>
        <div style={{background:`linear-gradient(180deg,${aberto?.cor||C.verde}88 0%,${C.escuro} 60%)`,padding:"20px 16px 0"}}>
          <button onClick={()=>setModAberto(null)} style={{background:"rgba(0,0,0,0.4)",border:"none",color:"#fff",padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:12,marginBottom:16}}>← Voltar</button>
          <div style={{fontSize:32,marginBottom:8}}>{aberto?.thumb||"📚"}</div>
          <div style={{color:C.cobre,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>{aberto?.nome}</div>
          <div style={{color:"#fff",fontSize:20,margin:"6px 0 4px",fontWeight:"bold"}}>{m.titulo}</div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>⏱ {m.duracao}</div>
        </div>
        <div style={{padding:"20px 16px 100px"}}>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Sobre este módulo</div>
            <div style={{color:"rgba(255,255,255,0.9)",fontSize:14,lineHeight:1.6}}>{m.descricao}</div>
          </div>
          {m.notas&&<div style={{background:`${C.cobre}22`,border:`1px solid ${C.cobre}44`,borderRadius:14,padding:14,marginBottom:16}}>
            <div style={{color:C.cobre,fontSize:11,marginBottom:6}}>📝 Anotações</div>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>{m.notas}</div>
          </div>}
          {m.nota>0&&<div style={{color:"#E8C547",fontSize:18,marginBottom:16}}>{"★".repeat(m.nota)}{"☆".repeat(5-m.nota)}</div>}
          <button onClick={()=>toggleMod(m)} style={{width:"100%",padding:16,background:m.feito?"rgba(82,201,122,0.15)":C.cobre,border:m.feito?`1px solid ${C.ok}`:"none",borderRadius:14,color:m.feito?C.ok:"#fff",fontSize:15,cursor:"pointer",fontFamily:"Georgia,serif"}}>
            {m.feito?"✓ Módulo Concluído":"Marcar como Concluído"}
          </button>
          {m.feito&&m.feito_em&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:8}}>Concluído em {m.feito_em}</div>}
        </div>
      </div>
    );
  }

  if(aberto) {
    const mods = modulos.filter(m=>m.treino_id===aberto.id).sort((a,b)=>a.num-b.num);
    const p = progT(aberto);
    return (
      <div style={{background:C.escuro,minHeight:"100%"}}>
        <div style={{background:`linear-gradient(180deg,${aberto.cor} 0%,${C.escuro} 70%)`}}>
          <div style={{padding:"16px 16px 0"}}>
            <button onClick={()=>setAberto(null)} style={{background:"rgba(0,0,0,0.4)",border:"none",color:"#fff",padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:12}}>← Cursos</button>
          </div>
          <div style={{padding:"20px 16px 24px"}}>
            <div style={{fontSize:48,marginBottom:8}}>{aberto.thumb}</div>
            <div style={{color:C.cobre,fontSize:10,letterSpacing:3,textTransform:"uppercase"}}>{aberto.categoria}</div>
            <div style={{color:"#fff",fontSize:22,margin:"6px 0 8px",fontWeight:"bold"}}>{aberto.nome}</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:16}}>{aberto.descricao}</div>
            <Bar p={p} cor={C.cobre} h={6}/>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:6}}>{p}% · {mods.filter(m=>m.feito).length}/{mods.length} módulos</div>
          </div>
        </div>
        <div style={{padding:"8px 16px 100px"}}>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,textTransform:"uppercase",letterSpacing:2,marginBottom:14}}>Módulos</div>
          {mods.map((m,i)=>(
            <div key={m.id} onClick={()=>setModAberto(m)} style={{display:"flex",gap:14,alignItems:"center",padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:m.feito?`${C.cobre}33`:"rgba(255,255,255,0.08)",border:`2px solid ${m.feito?C.cobre:"rgba(255,255,255,0.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:m.feito?C.cobre:"rgba(255,255,255,0.5)",flexShrink:0}}>{m.feito?"✓":i+1}</div>
              <div style={{flex:1}}>
                <div style={{color:m.feito?"rgba(255,255,255,0.4)":"#fff",fontSize:14,textDecoration:m.feito?"line-through":"none"}}>{m.titulo}</div>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:3}}>⏱ {m.duracao}</div>
              </div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:20}}>›</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{background:C.escuro,minHeight:"100%",paddingBottom:100}}>
      {destaque&&(
        <div style={{position:"relative",height:220,background:`linear-gradient(135deg,${destaque.cor} 0%,${C.escuro} 100%)`,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 16px 20px"}}>
          <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{color:C.cobre,fontSize:10,letterSpacing:3,textTransform:"uppercase"}}>Em destaque</div>
            {isAdmin&&<button onClick={()=>setModalNovo(true)} style={{background:C.cobre,border:"none",borderRadius:20,padding:"5px 14px",color:C.verde,fontSize:11,cursor:"pointer"}}>+ Curso</button>}
          </div>
          <div style={{fontSize:44}}>{destaque.thumb}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:"bold",margin:"6px 0 4px"}}>{destaque.nome}</div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:10}}>{destaque.descricao}</div>
          <Bar p={progT(destaque)} cor={C.cobre} h={4}/>
          <button onClick={()=>setAberto(destaque)} style={{marginTop:12,background:C.cobre,border:"none",borderRadius:20,padding:"8px 24px",color:C.verde,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif",width:"fit-content"}}>▶ {progT(destaque)>0?"Continuar":"Iniciar"}</button>
        </div>
      )}
      {meus.length===0&&!destaque&&<div style={{textAlign:"center",padding:60,color:"rgba(255,255,255,0.3)"}}>
        <div style={{fontSize:40}}>🎓</div>
        <div style={{marginTop:10,fontSize:13}}>Nenhum curso disponível.</div>
        {isAdmin&&<button onClick={()=>setModalNovo(true)} style={{marginTop:16,background:C.cobre,border:"none",borderRadius:20,padding:"10px 24px",color:C.verde,fontSize:13,cursor:"pointer"}}>+ Criar primeiro curso</button>}
      </div>}
      {categorias.map(cat=>{
        const lista = meus.filter(t=>t.categoria===cat);
        return (
          <div key={cat} style={{marginTop:24}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,textTransform:"uppercase",letterSpacing:2,padding:"0 16px",marginBottom:12}}>{cat}</div>
            <div style={{display:"flex",gap:12,padding:"0 16px",overflowX:"auto",paddingBottom:4}}>
              {lista.map(t=>{
                const p = progT(t);
                return (
                  <div key={t.id} onClick={()=>setAberto(t)} style={{flexShrink:0,width:140,cursor:"pointer"}}>
                    <div style={{height:90,background:`linear-gradient(135deg,${t.cor} 0%,${C.escuro} 100%)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,position:"relative",overflow:"hidden"}}>
                      {t.thumb}
                      {p>0&&p<100&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.2)"}}><div style={{width:`${p}%`,height:"100%",background:C.cobre}}/></div>}
                      {p===100&&<div style={{position:"absolute",top:6,right:6,background:C.ok,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>✓</div>}
                    </div>
                    <div style={{color:"#fff",fontSize:12,marginTop:8,fontWeight:"bold"}}>{t.nome}</div>
                    <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:2}}>{modulos.filter(m=>m.treino_id===t.id).length} módulos · {p}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {modalNovo&&(
        <Modal titulo="Novo Curso" onClose={()=>setModalNovo(false)}>
          {isAdmin&&<Input label="Cliente ID" value={form.cliente_id} onChange={v=>setForm({...form,cliente_id:v})} placeholder="ID do cliente"/>}
          <Input label="Nome do curso" value={form.nome} onChange={v=>setForm({...form,nome:v})}/>
          <Input label="Descrição" value={form.descricao} onChange={v=>setForm({...form,descricao:v})} multi/>
          <Sel label="Categoria" value={form.categoria} onChange={v=>setForm({...form,categoria:v})} options={["Gestão","Financeiro","Equipe","Marketing","Operacional","Outro"]}/>
          <Input label="Emoji de capa" value={form.thumb} onChange={v=>setForm({...form,thumb:v})} placeholder="Ex: 🏢"/>
          <Btn full onClick={salvarTreino} disabled={salvando}>{salvando?"Salvando...":"Criar Curso"}</Btn>
        </Modal>
      )}
    </div>
  );
}

// ── PAGAMENTOS ──────────────────────────────────────────────────────────────
function TelaPagamentos({pagamentos,carregarPagamentos,clienteId,isAdmin,clientes}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({cliente_id:clienteId||"",descricao:"",valor:"",vencimento:"",link_pagamento:""});
  const [salvando,setSalvando]=useState(false);

  const lista = isAdmin ? pagamentos : pagamentos.filter(p=>p.cliente_id===clienteId);
  const pendentes = lista.filter(p=>p.status==="Pendente");
  const pagos = lista.filter(p=>p.status==="Pago");
  const totalPend = pendentes.reduce((a,b)=>a+Number(b.valor),0);

  const salvar = async () => {
    setSalvando(true);
    await db.insert("pagamentos",{...form,status:"Pendente",valor:Number(form.valor),pago_em:null});
    await carregarPagamentos();
    setSalvando(false); setModal(false);
    setForm({cliente_id:clienteId||"",descricao:"",valor:"",vencimento:"",link_pagamento:""});
  };

  const marcarPago = async (id) => {
    await db.update("pagamentos",id,{status:"Pago",pago_em:hoje()});
    await carregarPagamentos();
  };

  return (
    <div style={{padding:"16px 16px 0"}}>
      {isAdmin&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><Tit txt="Cobranças"/><Btn sm onClick={()=>setModal(true)}>+ Nova</Btn></div>}
      {totalPend>0&&<div style={{background:C.verde,borderRadius:16,padding:20,marginBottom:16}}>
        <div style={{color:C.lavanda,fontSize:12,marginBottom:4}}>Total em aberto</div>
        <div style={{color:C.cobre,fontSize:28,fontWeight:"bold"}}>{fmt(totalPend)}</div>
        <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:4}}>{pendentes.length} pendente(s)</div>
      </div>}
      {pendentes.length>0&&<><Tit txt="Em aberto"/>
        {pendentes.map(p=>{
          const cli = clientes?.find(c=>c.id===p.cliente_id);
          const venceu = p.vencimento && p.vencimento < hoje();
          return (
            <Card key={p.id} mb={12} border={venceu?`1px solid ${C.erro}`:"none"}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{p.descricao}</div>
                  {isAdmin&&cli&&<div style={{fontSize:11,color:C.cinza,marginTop:2}}>{cli.negocio}</div>}
                  <div style={{fontSize:11,color:venceu?C.erro:C.cinza,marginTop:2}}>Vence: {p.vencimento} {venceu?"· VENCIDO":""}</div>
                </div>
                <div style={{fontSize:18,color:C.verde,fontWeight:"bold"}}>{fmt(p.valor)}</div>
              </div>
              <div style={{display:"flex",gap:10}}>
                {p.link_pagamento&&<a href={p.link_pagamento} target="_blank" rel="noreferrer" style={{flex:1,display:"block",textAlign:"center",padding:11,background:C.cobre,borderRadius:12,color:C.verde,fontSize:13,textDecoration:"none",fontFamily:"Georgia,serif"}}>💳 Pagar agora</a>}
                {isAdmin&&<button onClick={()=>marcarPago(p.id)} style={{flex:1,padding:11,background:"transparent",border:`1px solid ${C.ok}`,borderRadius:12,color:C.ok,fontSize:12,cursor:"pointer",fontFamily:"Georgia,serif"}}>✓ Marcar pago</button>}
              </div>
              {!p.link_pagamento&&!isAdmin&&<div style={{textAlign:"center",padding:10,background:C.lavanda,borderRadius:10,color:C.cinza,fontSize:12}}>Link de pagamento em breve</div>}
            </Card>
          );
        })}
      </>}
      {pagos.length>0&&<><Sep/><Tit txt={`${pagos.length} pago(s)`}/>
        {pagos.map(p=>{
          const cli = clientes?.find(c=>c.id===p.cliente_id);
          return (
            <Card key={p.id} mb={8}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,color:C.cinza,textDecoration:"line-through"}}>{p.descricao}</div>
                  {isAdmin&&cli&&<div style={{fontSize:11,color:C.cinza}}>{cli.negocio}</div>}
                  {p.pago_em&&<div style={{fontSize:11,color:C.ok}}>✓ Pago em {p.pago_em}</div>}
                </div>
                <div style={{fontSize:14,color:C.cinza}}>{fmt(p.valor)}</div>
              </div>
            </Card>
          );
        })}
      </>}
      {lista.length===0&&<div style={{textAlign:"center",padding:40,color:C.cinza}}><div style={{fontSize:36}}>💳</div><div style={{marginTop:10,fontSize:13}}>Nenhuma cobrança ainda.</div></div>}
      <div style={{background:C.lavanda,borderRadius:12,padding:14,marginTop:16}}>
        <div style={{fontSize:10,color:C.cinza,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Integração</div>
        <div style={{fontSize:12,color:C.cinza}}>Pagamentos via <strong>Banco Asaas</strong> · PIX, cartão e boleto.</div>
      </div>
      {modal&&<Modal titulo="Nova Cobrança" onClose={()=>setModal(false)}>
        {isAdmin&&clientes&&<Sel label="Cliente" value={form.cliente_id} onChange={v=>setForm({...form,cliente_id:v})} options={[{v:"",l:"Selecione..."},...clientes.map(c=>({v:c.id,l:c.negocio}))]}/>}
        <Input label="Descrição" value={form.descricao} onChange={v=>setForm({...form,descricao:v})} placeholder="Ex: Consultoria Maio/2026"/>
        <Input label="Valor (R$)" value={form.valor} onChange={v=>setForm({...form,valor:v})} type="number"/>
        <Input label="Vencimento" value={form.vencimento} onChange={v=>setForm({...form,vencimento:v})} type="date"/>
        <Input label="Link Asaas" value={form.link_pagamento} onChange={v=>setForm({...form,link_pagamento:v})} placeholder="https://pay.asaas.com/..."/>
        <Btn full onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"Criar Cobrança"}</Btn>
      </Modal>}
    </div>
  );
}

// ── MÉTRICAS CLIENTE ────────────────────────────────────────────────────────
function TelaMetricas({clienteId,metricas,carregarMetricas,addNotif,usuario}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({data:hoje(),faturamento:"",total_atendimentos:"",novos_clientes:"",cancelamentos:""});
  const [salvando,setSalvando]=useState(false);

  const meus = metricas.filter(m=>m.cliente_id===clienteId).sort((a,b)=>b.data?.localeCompare(a.data||"")||0);

  const calc = (f) => {
    const fat=Number(f.faturamento)||0, tot=Number(f.total_atendimentos)||0, nov=Number(f.novos_clientes)||0, can=Number(f.cancelamentos)||0;
    return { ticket:tot?fat/tot:0, taxaRetorno:tot?pct(tot-nov,tot):0, taxaCancelamento:tot?pct(can,tot):0 };
  };

  const c = calc(form);

  const salvar = async () => {
    setSalvando(true);
    const cv = calc(form);
    await db.insert("metricas",{cliente_id:clienteId,data:form.data,faturamento:Number(form.faturamento),total_atendimentos:Number(form.total_atendimentos),novos_clientes:Number(form.novos_clientes),cancelamentos:Number(form.cancelamentos),ticket_medio:cv.ticket,taxa_retorno:cv.taxaRetorno,taxa_cancelamento:cv.taxaCancelamento});
    await carregarMetricas();
    if(addNotif) await addNotif("metricas","Nova métrica inserida",`${usuario.nome} inseriu dados de ${form.data}`);
    setSalvando(false); setModal(false);
    setForm({data:hoje(),faturamento:"",total_atendimentos:"",novos_clientes:"",cancelamentos:""});
  };

  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <Tit txt="Indicadores mensais"/><Btn sm onClick={()=>setModal(true)}>+ Inserir</Btn>
      </div>
      {meus.length===0&&<div style={{textAlign:"center",padding:40,color:C.cinza}}><div style={{fontSize:36}}>📊</div><div style={{marginTop:10,fontSize:13}}>Insira os dados do mês.</div><div style={{fontSize:11,marginTop:6}}>Ticket, retorno e cancelamento são calculados automaticamente.</div></div>}
      {meus.map(m=>(
        <Card key={m.id} mb={12}>
          <div style={{fontSize:15,color:C.verde,fontWeight:"bold",marginBottom:12}}>{m.data}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            {[{l:"Faturamento",v:fmt(m.faturamento),d:true},{l:"Atendimentos",v:m.total_atendimentos},{l:"Novos clientes",v:m.novos_clientes},{l:"Cancelamentos",v:m.cancelamentos}].map(k=>(
              <div key={k.l} style={{background:k.d?C.verde:C.branco,border:`1px solid ${C.lavanda}`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:15,color:k.d?C.cobre:C.verde,fontWeight:"bold"}}>{k.v}</div>
                <div style={{fontSize:10,color:k.d?"rgba(255,255,255,0.5)":C.cinza,textTransform:"uppercase"}}>{k.l}</div>
              </div>
            ))}
          </div>
          <Sep/>
          <div style={{fontSize:10,color:C.cinza,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Calculado automaticamente</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"Ticket Médio",v:fmt(m.ticket_medio),cor:C.cobre},{l:"Taxa Retorno",v:`${m.taxa_retorno}%`,cor:C.ok},{l:"Cancelamento",v:`${m.taxa_cancelamento}%`,cor:m.taxa_cancelamento>20?C.erro:"#E8974D"}].map(k=>(
              <div key={k.l} style={{textAlign:"center",background:`${k.cor}11`,border:`1px solid ${k.cor}33`,borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:13,color:k.cor,fontWeight:"bold"}}>{k.v}</div>
                <div style={{fontSize:9,color:C.cinza,textTransform:"uppercase",marginTop:2}}>{k.l}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {modal&&<Modal titulo="Inserir Dados do Mês" onClose={()=>setModal(false)}>
        <Input label="Mês de referência" value={form.data} onChange={v=>setForm({...form,data:v})} type="date"/>
        <Input label="Faturamento total (R$)" value={form.faturamento} onChange={v=>setForm({...form,faturamento:v})} type="number"/>
        <Input label="Total de atendimentos" value={form.total_atendimentos} onChange={v=>setForm({...form,total_atendimentos:v})} type="number" placeholder="Quantos clientes atendidos"/>
        <Input label="Novos clientes no mês" value={form.novos_clientes} onChange={v=>setForm({...form,novos_clientes:v})} type="number"/>
        <Input label="Cancelamentos ou faltas" value={form.cancelamentos} onChange={v=>setForm({...form,cancelamentos:v})} type="number"/>
        {(form.faturamento||form.total_atendimentos)&&<div style={{background:`${C.verde}11`,border:`1px solid ${C.verde}33`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontSize:11,color:C.cinza,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Preview calculado</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"Ticket",v:fmt(c.ticket)},{l:"Retorno",v:`${c.taxaRetorno}%`},{l:"Cancel.",v:`${c.taxaCancelamento}%`}].map(k=>(
              <div key={k.l} style={{textAlign:"center"}}><div style={{fontSize:13,color:C.verde,fontWeight:"bold"}}>{k.v}</div><div style={{fontSize:9,color:C.cinza,textTransform:"uppercase"}}>{k.l}</div></div>
            ))}
          </div>
        </div>}
        <Btn full onClick={salvar} disabled={salvando||!form.faturamento||!form.total_atendimentos}>{salvando?"Salvando...":"Salvar Métricas"}</Btn>
      </Modal>}
    </div>
  );
}

// ── ADMIN APP ───────────────────────────────────────────────────────────────
function AdminApp({usuario,logout,dados,carregar}) {
  const [tela,setTela]=useState("dashboard");
  const {clientes,financeiro,treinos,modulos,tarefas,reunioes,metricas,pagamentos,notificacoes,usuarios} = dados;
  const naoLidas = notificacoes.filter(n=>!n.lida).length;
  const nav = [{id:"dashboard",emoji:"🏠",label:"Início"},{id:"clientes",emoji:"👥",label:"Clientes"},{id:"pagamentos",emoji:"💳",label:"Cobranças"},{id:"treinos",emoji:"🎓",label:"Treinos"},{id:"mais",emoji:"⚙️",label:"Mais"}];

  const addNotif = async (tipo,titulo,mensagem) => {
    await db.insert("notificacoes",{tipo,titulo,mensagem,lida:false});
    await carregar.notificacoes();
  };

  return (
    <div style={{background:tela==="treinos"?C.escuro:C.branco,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      {tela!=="treinos"&&<Header titulo={tela==="dashboard"?`Olá, ${usuario.nome.split(" ")[0]} 👋`:tela==="clientes"?"Clientes":tela==="pagamentos"?"Cobranças":tela==="mais"?"Mais":"Painel"} sub="FS Consultoria" extra={naoLidas>0?<div onClick={()=>setTela("notifs")} style={{position:"relative",cursor:"pointer",fontSize:20}}>🔔<span style={{position:"absolute",top:-4,right:-4,background:C.erro,color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"}}>{naoLidas}</span></div>:<div style={{width:22}}/>}/>}
      {tela==="treinos"&&<div style={{background:C.escuro,padding:"16px 16px 0"}}><div style={{fontSize:10,color:C.cobre,letterSpacing:3,textTransform:"uppercase",textAlign:"center"}}>FS Consultoria</div><div style={{color:"rgba(255,255,255,0.8)",fontSize:16,textAlign:"center",marginTop:2}}>Treinamentos</div></div>}
      <div style={{paddingBottom:80}}>
        {tela==="dashboard"&&<AdminDash clientes={clientes} financeiro={financeiro} tarefas={tarefas} pagamentos={pagamentos}/>}
        {tela==="clientes"&&<AdminClientes clientes={clientes} usuarios={usuarios} carregar={carregar}/>}
        {tela==="pagamentos"&&<TelaPagamentos pagamentos={pagamentos} carregarPagamentos={carregar.pagamentos} isAdmin clientes={clientes}/>}
        {tela==="treinos"&&<TelaTreinos treinos={treinos} modulos={modulos} carregarModulos={carregar.modulos} carregarTreinos={carregar.treinos} isAdmin usuario={usuario} addNotif={addNotif}/>}
        {tela==="mais"&&<AdminMais setTela={setTela} onLogout={logout}/>}
        {tela==="tarefas"&&<AdminTarefas tarefas={tarefas} carregarTarefas={carregar.tarefas} clientes={clientes} onVoltar={()=>setTela("mais")}/>}
        {tela==="reunioes"&&<AdminReunioes reunioes={reunioes} carregarReunioes={carregar.reunioes} clientes={clientes} onVoltar={()=>setTela("mais")}/>}
        {tela==="metricas_admin"&&<AdminMetricas metricas={metricas} clientes={clientes} onVoltar={()=>setTela("mais")}/>}
        {tela==="notifs"&&<AdminNotifs notificacoes={notificacoes} carregarNotifs={carregar.notificacoes} onVoltar={()=>setTela("dashboard")}/>}
      </div>
      <BottomNav itens={nav} atual={tela} onTroca={setTela}/>
    </div>
  );
}

function AdminDash({clientes,financeiro,tarefas,pagamentos}) {
  const receita = financeiro.filter(f=>f.tipo==="Receita").reduce((a,b)=>a+Number(b.valor),0);
  const aReceber = pagamentos.filter(p=>p.status==="Pendente").reduce((a,b)=>a+Number(b.valor),0);
  const pendTask = tarefas.filter(t=>t.status!=="Concluída").length;
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{e:"👥",l:"Clientes",v:clientes.length,cor:C.verdeM},{e:"💰",l:"Receita",v:fmt(receita),cor:"#2D6A4F"},{e:"💳",l:"A receber",v:fmt(aReceber),cor:C.cobre},{e:"✅",l:"Tarefas",v:`${pendTask} pend.`,cor:"#E8974D"}].map(k=>(
          <div key={k.l} style={{background:k.cor,borderRadius:14,padding:"14px 12px"}}>
            <div style={{fontSize:20}}>{k.e}</div>
            <div style={{color:C.cobre,fontSize:18,fontWeight:"bold",marginTop:4}}>{k.v}</div>
            <div style={{color:C.lavanda,fontSize:10,opacity:0.7,textTransform:"uppercase",letterSpacing:1}}>{k.l}</div>
          </div>
        ))}
      </div>
      <Tit txt="Clientes"/>
      {clientes.length===0&&<div style={{textAlign:"center",color:C.cinza,padding:20,fontSize:13}}>Nenhum cliente ainda.</div>}
      {clientes.map(c=>{
        const etapas = Array.isArray(c.etapas)?c.etapas:[false,false,false,false,false];
        return (
          <Card key={c.id} mb={10}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div><div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{c.negocio}</div><div style={{fontSize:11,color:C.cinza}}>{c.nome}</div></div>
              <Tag txt={c.status} cor={c.status==="Permuta"?C.cobre:c.status==="Em Andamento"?"#4EADCF":C.ok}/>
            </div>
            <Bar p={pct(etapas.filter(Boolean).length,5)}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:11,color:C.cinza}}>{etapas.filter(Boolean).length}/5 etapas</span>
              <span style={{fontSize:12,color:C.cobre}}>{fmt(c.valor)}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AdminClientes({clientes,usuarios,carregar}) {
  const [modal,setModal]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const [form,setForm]=useState({nome:"",negocio:"",segmento:"",cidade:"",email:"",senha:"",valor:"",status:"Proposta Enviada",pagamento:"PIX",notas:""});
  const [salvando,setSalvando]=useState(false);

  const salvar = async () => {
    setSalvando(true);
    const c = await db.insert("clientes",{nome:form.nome,negocio:form.negocio,segmento:form.segmento,cidade:form.cidade,email:form.email,valor:Number(form.valor)||0,status:form.status,pagamento:form.pagamento,notas:form.notas,etapas:[false,false,false,false,false],cor:C.cobre});
    await db.insert("usuarios",{nome:form.nome,email:form.email,senha:form.senha||"mudar123",tipo:"cliente",cliente_id:c[0]?.id,ativo:true});
    await carregar.clientes(); await carregar.usuarios();
    setSalvando(false); setModal(false);
    setForm({nome:"",negocio:"",segmento:"",cidade:"",email:"",senha:"",valor:"",status:"Proposta Enviada",pagamento:"PIX",notas:""});
  };

  const toggleEtapa = async (c,i) => {
    const etapas = Array.isArray(c.etapas)?[...c.etapas]:[false,false,false,false,false];
    etapas[i]=!etapas[i];
    await db.update("clientes",c.id,{etapas});
    await carregar.clientes();
    setDetalhe({...c,etapas});
  };

  if(detalhe) return (
    <div style={{padding:"16px 16px 0"}}>
      <Btn sm secondary onClick={()=>setDetalhe(null)}>← Voltar</Btn>
      <div style={{marginTop:12,marginBottom:16}}>
        <div style={{fontSize:20,color:C.verde,fontWeight:"bold"}}>{detalhe.negocio}</div>
        <div style={{fontSize:12,color:C.cinza}}>{detalhe.nome} · {detalhe.cidade}</div>
        <div style={{fontSize:13,color:C.cobre,marginTop:4}}>{fmt(detalhe.valor)} · {detalhe.pagamento}</div>
      </div>
      <Tit txt="Etapas Método ISA"/>
      {["Diagnóstico","Estratégia","Execução","Entrega","Ajuste"].map((e,i)=>{
        const etapas=Array.isArray(detalhe.etapas)?detalhe.etapas:[false,false,false,false,false];
        return (
          <Card key={i} onClick={()=>toggleEtapa(detalhe,i)} mb={8}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:etapas[i]?C.cobre:C.lavanda,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{etapas[i]?"✓":i+1}</div>
              <div style={{flex:1,fontSize:14,color:etapas[i]?C.cinza:C.verde,textDecoration:etapas[i]?"line-through":"none"}}>{e}</div>
              <Tag txt={etapas[i]?"Feito":"Pendente"} cor={etapas[i]?C.ok:"#E8974D"}/>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <Tit txt={`${clientes.length} cliente(s)`}/><Btn sm onClick={()=>setModal(true)}>+ Novo</Btn>
      </div>
      {clientes.map(c=>{
        const etapas=Array.isArray(c.etapas)?c.etapas:[false,false,false,false,false];
        return (
          <Card key={c.id} onClick={()=>setDetalhe(c)} mb={10}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div><div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{c.negocio}</div><div style={{fontSize:11,color:C.cinza}}>{c.nome}</div></div>
              <Tag txt={c.status} cor={c.status==="Permuta"?C.cobre:c.status==="Em Andamento"?"#4EADCF":c.status==="Concluído"?C.ok:"#E8974D"}/>
            </div>
            <Bar p={pct(etapas.filter(Boolean).length,5)}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:11,color:C.cinza}}>{etapas.filter(Boolean).length}/5 etapas</span>
              <span style={{fontSize:12,color:C.cobre}}>{fmt(c.valor)}</span>
            </div>
          </Card>
        );
      })}
      {modal&&<Modal titulo="Novo Cliente" onClose={()=>setModal(false)}>
        <Input label="Nome" value={form.nome} onChange={v=>setForm({...form,nome:v})}/>
        <Input label="Negócio" value={form.negocio} onChange={v=>setForm({...form,negocio:v})}/>
        <Input label="Segmento" value={form.segmento} onChange={v=>setForm({...form,segmento:v})}/>
        <Input label="Cidade" value={form.cidade} onChange={v=>setForm({...form,cidade:v})}/>
        <Input label="Email (login do cliente)" value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/>
        <Input label="Senha inicial" value={form.senha} onChange={v=>setForm({...form,senha:v})} type="password"/>
        <Input label="Valor (R$)" value={form.valor} onChange={v=>setForm({...form,valor:v})} type="number"/>
        <Sel label="Status" value={form.status} onChange={v=>setForm({...form,status:v})} options={["Proposta Enviada","Em Andamento","Concluído","Pausado","Permuta"]}/>
        <Sel label="Pagamento" value={form.pagamento} onChange={v=>setForm({...form,pagamento:v})} options={["PIX","Cartão","Boleto","Permuta","Parcelado"]}/>
        <Input label="Notas internas" value={form.notas} onChange={v=>setForm({...form,notas:v})} multi/>
        <Btn full onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"Adicionar Cliente"}</Btn>
      </Modal>}
    </div>
  );
}

function AdminTarefas({tarefas,carregarTarefas,clientes,onVoltar}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({cliente_id:"",titulo:"",descricao:"",prioridade:"Média",responsavel:"cliente",data_limite:""});
  const salvar=async()=>{await db.insert("tarefas",{...form,status:"Para Fazer"});await carregarTarefas();setModal(false);setForm({cliente_id:"",titulo:"",descricao:"",prioridade:"Média",responsavel:"cliente",data_limite:""});};
  const toggle=async(t)=>{await db.update("tarefas",t.id,{status:t.status==="Concluída"?"Para Fazer":"Concluída"});await carregarTarefas();};
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{marginBottom:8}}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><Tit txt="Tarefas"/><Btn sm onClick={()=>setModal(true)}>+ Nova</Btn></div>
      {tarefas.map(t=>{const cli=clientes.find(c=>c.id===t.cliente_id);return(
        <Card key={t.id} mb={8}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div onClick={()=>toggle(t)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${t.status==="Concluída"?C.ok:C.lavanda}`,background:t.status==="Concluída"?C.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:2,fontSize:11,color:"#fff"}}>{t.status==="Concluída"?"✓":""}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:t.status==="Concluída"?C.cinza:C.verde,textDecoration:t.status==="Concluída"?"line-through":"none"}}>{t.titulo}</div>
              <div style={{fontSize:11,color:C.cinza,marginTop:2}}>{cli?.negocio} · vence {t.data_limite}</div>
              <Tag txt={t.prioridade} cor={t.prioridade==="Alta"?C.erro:t.prioridade==="Média"?"#E8C547":C.ok}/>
            </div>
          </div>
        </Card>
      );})}
      {modal&&<Modal titulo="Nova Tarefa" onClose={()=>setModal(false)}>
        <Sel label="Cliente" value={form.cliente_id} onChange={v=>setForm({...form,cliente_id:v})} options={[{v:"",l:"Selecione..."},...clientes.map(c=>({v:c.id,l:c.negocio}))]}/>
        <Input label="Título" value={form.titulo} onChange={v=>setForm({...form,titulo:v})}/>
        <Input label="Descrição" value={form.descricao} onChange={v=>setForm({...form,descricao:v})} multi/>
        <Sel label="Responsável" value={form.responsavel} onChange={v=>setForm({...form,responsavel:v})} options={[{v:"cliente",l:"Cliente"},{v:"admin",l:"Admin (Isa)"}]}/>
        <Sel label="Prioridade" value={form.prioridade} onChange={v=>setForm({...form,prioridade:v})} options={["Alta","Média","Baixa"]}/>
        <Input label="Data limite" value={form.data_limite} onChange={v=>setForm({...form,data_limite:v})} type="date"/>
        <Btn full onClick={salvar}>Criar Tarefa</Btn>
      </Modal>}
    </div>
  );
}

function AdminReunioes({reunioes,carregarReunioes,clientes,onVoltar}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({cliente_id:"",titulo:"",data:hoje(),tipo:"Reunião com Cliente",pauta:"",decisoes:"",proximas_acoes:"",duracao:""});
  const salvar=async()=>{await db.insert("reunioes",{...form,duracao:Number(form.duracao)});await carregarReunioes();setModal(false);setForm({cliente_id:"",titulo:"",data:hoje(),tipo:"Reunião com Cliente",pauta:"",decisoes:"",proximas_acoes:"",duracao:""});};
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{marginBottom:8}}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><Tit txt="Reuniões"/><Btn sm onClick={()=>setModal(true)}>+ Registrar</Btn></div>
      {reunioes.length===0&&<div style={{textAlign:"center",color:C.cinza,padding:30,fontSize:13}}>Nenhuma reunião registrada.</div>}
      {reunioes.map(r=>{const cli=clientes.find(c=>c.id===r.cliente_id);return(
        <Card key={r.id} mb={10}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={{fontSize:14,color:C.verde}}>{r.titulo}</div><div style={{fontSize:11,color:C.cinza}}>{r.data}</div></div>
          <div style={{fontSize:11,color:C.cinza}}>{cli?.negocio} · {r.tipo} · {r.duracao}min</div>
          {r.decisoes&&<div style={{marginTop:8,background:C.lavanda,borderRadius:8,padding:"8px 10px",fontSize:12,color:C.verde}}>📋 {r.decisoes}</div>}
        </Card>
      );})}
      {modal&&<Modal titulo="Registrar Reunião" onClose={()=>setModal(false)}>
        <Sel label="Cliente" value={form.cliente_id} onChange={v=>setForm({...form,cliente_id:v})} options={[{v:"",l:"Selecione..."},...clientes.map(c=>({v:c.id,l:c.negocio}))]}/>
        <Input label="Título" value={form.titulo} onChange={v=>setForm({...form,titulo:v})}/>
        <Input label="Data" value={form.data} onChange={v=>setForm({...form,data:v})} type="date"/>
        <Sel label="Tipo" value={form.tipo} onChange={v=>setForm({...form,tipo:v})} options={["Reunião com Cliente","Call de Vendas","Alinhamento","Treinamento"]}/>
        <Input label="Duração (min)" value={form.duracao} onChange={v=>setForm({...form,duracao:v})} type="number"/>
        <Input label="Pauta" value={form.pauta} onChange={v=>setForm({...form,pauta:v})} multi/>
        <Input label="Decisões" value={form.decisoes} onChange={v=>setForm({...form,decisoes:v})} multi/>
        <Input label="Próximas ações" value={form.proximas_acoes} onChange={v=>setForm({...form,proximas_acoes:v})} multi/>
        <Btn full onClick={salvar}>Salvar</Btn>
      </Modal>}
    </div>
  );
}

function AdminMetricas({metricas,clientes,onVoltar}) {
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{marginBottom:8}}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <Tit txt="Métricas dos Clientes"/>
      {metricas.length===0&&<div style={{textAlign:"center",color:C.cinza,padding:40}}><div style={{fontSize:36}}>📊</div><div style={{marginTop:10,fontSize:13}}>Aguardando dados dos clientes.</div></div>}
      {metricas.map(m=>{const cli=clientes.find(c=>c.id===m.cliente_id);return(
        <Card key={m.id} mb={12}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{cli?.negocio}</div><div style={{fontSize:11,color:C.cinza}}>{m.data}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"Faturamento",v:fmt(m.faturamento)},{l:"Atendimentos",v:m.total_atendimentos},{l:"Ticket",v:fmt(m.ticket_medio)},{l:"Novos",v:m.novos_clientes},{l:"Retorno",v:`${m.taxa_retorno}%`},{l:"Cancelam.",v:`${m.taxa_cancelamento}%`}].map(k=>(
              <div key={k.l} style={{background:C.branco,border:`1px solid ${C.lavanda}`,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                <div style={{fontSize:12,color:C.cobre,fontWeight:"bold"}}>{k.v}</div>
                <div style={{fontSize:9,color:C.cinza,textTransform:"uppercase"}}>{k.l}</div>
              </div>
            ))}
          </div>
        </Card>
      );})}
    </div>
  );
}

function AdminNotifs({notificacoes,carregarNotifs,onVoltar}) {
  const marcarTodas=async()=>{for(const n of notificacoes.filter(x=>!x.lida)){await db.update("notificacoes",n.id,{lida:true});}await carregarNotifs();};
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <Btn sm secondary onClick={onVoltar}>← Voltar</Btn>
        <Btn sm onClick={marcarTodas}>Marcar todas lidas</Btn>
      </div>
      {notificacoes.length===0&&<div style={{textAlign:"center",color:C.cinza,padding:30}}>Sem notificações.</div>}
      {notificacoes.map(n=>(
        <Card key={n.id} mb={8}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:n.lida?C.lavanda:C.erro,flexShrink:0,marginTop:5}}/>
            <div><div style={{fontSize:13,color:n.lida?C.cinza:C.verde}}>{n.titulo}</div><div style={{fontSize:11,color:C.cinza,marginTop:3}}>{n.mensagem}</div></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AdminMais({setTela,onLogout}) {
  return (
    <div style={{padding:"16px 16px 0"}}>
      <Tit txt="Mais opções"/>
      {[{e:"✅",l:"Tarefas",t:"tarefas"},{e:"🗓️",l:"Reuniões",t:"reunioes"},{e:"📊",l:"Métricas dos Clientes",t:"metricas_admin"},{e:"🔔",l:"Notificações",t:"notifs"}].map(o=>(
        <Card key={o.t} onClick={()=>setTela(o.t)} mb={10}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:22}}>{o.e}</span><span style={{fontSize:14,color:C.verde}}>{o.l}</span>
            <span style={{marginLeft:"auto",color:C.cinza}}>›</span>
          </div>
        </Card>
      ))}
      <Sep/>
      <Btn full perigo onClick={onLogout}>Sair da conta</Btn>
    </div>
  );
}

// ── CLIENTE APP ─────────────────────────────────────────────────────────────
function ClienteApp({usuario,logout,clienteDoUsuario,dados,carregar}) {
  const [tela,setTela]=useState("inicio");
  const {treinos,modulos,metricas,pagamentos,tarefas,reunioes,notificacoes} = dados;
  const cId = clienteDoUsuario?.id;
  const nav = [{id:"inicio",emoji:"🏠",label:"Início"},{id:"metricas",emoji:"📊",label:"Métricas"},{id:"pagamentos",emoji:"💳",label:"Pagamentos"},{id:"treinos",emoji:"🎓",label:"Treinos"},{id:"mais",emoji:"⚙️",label:"Mais"}];

  const addNotif = async (tipo,titulo,mensagem) => {
    await db.insert("notificacoes",{tipo,titulo,mensagem,lida:false,cliente_id:cId});
    await carregar.notificacoes();
  };

  if(!clienteDoUsuario) return <div style={{padding:20,color:C.cinza}}>Perfil não encontrado.</div>;

  return (
    <div style={{background:tela==="treinos"?C.escuro:C.branco,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      {tela!=="treinos"&&<Header titulo={tela==="inicio"?`Olá, ${usuario.nome.split(" ")[0]} 👋`:tela==="metricas"?"Minhas Métricas":tela==="pagamentos"?"Pagamentos":"Mais"} sub={clienteDoUsuario.negocio}/>}
      {tela==="treinos"&&<div style={{background:C.escuro,padding:"16px 16px 0"}}><div style={{fontSize:10,color:C.cobre,letterSpacing:3,textTransform:"uppercase",textAlign:"center"}}>{clienteDoUsuario.negocio}</div><div style={{color:"rgba(255,255,255,0.8)",fontSize:16,textAlign:"center",marginTop:2}}>Treinamentos</div></div>}
      <div style={{paddingBottom:80}}>
        {tela==="inicio"&&<ClienteInicio cliente={clienteDoUsuario} tarefas={tarefas.filter(t=>t.cliente_id===cId)} notificacoes={notificacoes.filter(n=>n.cliente_id===cId&&!n.lida)}/>}
        {tela==="metricas"&&<TelaMetricas clienteId={cId} metricas={metricas} carregarMetricas={carregar.metricas} addNotif={addNotif} usuario={usuario}/>}
        {tela==="pagamentos"&&<TelaPagamentos pagamentos={pagamentos} carregarPagamentos={carregar.pagamentos} clienteId={cId} isAdmin={false} clientes={[]}/>}
        {tela==="treinos"&&<TelaTreinos treinos={treinos} modulos={modulos} carregarModulos={carregar.modulos} carregarTreinos={carregar.treinos} clienteId={cId} isAdmin={false} usuario={usuario} addNotif={addNotif}/>}
        {tela==="mais"&&<ClienteMais usuario={usuario} onLogout={logout} tarefas={tarefas.filter(t=>t.cliente_id===cId)} carregarTarefas={carregar.tarefas} reunioes={reunioes.filter(r=>r.cliente_id===cId)} addNotif={addNotif}/>}
      </div>
      <BottomNav itens={nav} atual={tela} onTroca={setTela}/>
    </div>
  );
}

function ClienteInicio({cliente,tarefas,notificacoes}) {
  const etapas = Array.isArray(cliente.etapas)?cliente.etapas:[false,false,false,false,false];
  const p = pct(etapas.filter(Boolean).length,5);
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{background:C.verde,borderRadius:16,padding:20,marginBottom:16}}>
        <div style={{color:C.lavanda,fontSize:13,marginBottom:4}}>{cliente.negocio}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{color:C.cobre,fontSize:11}}>Progresso do projeto</div>
          <div style={{color:C.cobre,fontSize:26,fontWeight:"bold"}}>{p}%</div>
        </div>
        <Bar p={p}/>
        <div style={{display:"flex",marginTop:12,gap:6}}>
          {["Diagnóst.","Estratégia","Execução","Entrega","Ajuste"].map((e,i)=>(
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{height:5,borderRadius:3,background:etapas[i]?C.cobre:"rgba(255,255,255,0.15)",marginBottom:4}}/>
              <div style={{fontSize:8,color:etapas[i]?C.cobre:"rgba(255,255,255,0.3)",textTransform:"uppercase"}}>{e.slice(0,4)}</div>
            </div>
          ))}
        </div>
      </div>
      {tarefas.length>0&&<><Tit txt={`${tarefas.filter(t=>t.status!=="Concluída").length} tarefa(s) pendente(s)`}/>
        {tarefas.filter(t=>t.status!=="Concluída").slice(0,3).map(t=>(
          <Card key={t.id} mb={8}>
            <div style={{fontSize:13,color:C.verde}}>{t.titulo}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:11,color:C.cinza}}>Vence {t.data_limite}</span>
              <Tag txt={t.prioridade} cor={t.prioridade==="Alta"?C.erro:t.prioridade==="Média"?"#E8C547":C.ok}/>
            </div>
          </Card>
        ))}
      </>}
      {notificacoes.length>0&&<><Sep/><Tit txt="Novidades"/>
        {notificacoes.slice(0,2).map(n=>(
          <Card key={n.id} mb={8}><div style={{fontSize:13,color:C.verde}}>🔔 {n.titulo}</div><div style={{fontSize:11,color:C.cinza,marginTop:4}}>{n.mensagem}</div></Card>
        ))}
      </>}
    </div>
  );
}

function ClienteMais({usuario,onLogout,tarefas,carregarTarefas,reunioes,addNotif}) {
  const toggle=async(t)=>{await db.update("tarefas",t.id,{status:t.status==="Concluída"?"Para Fazer":"Concluída"});await carregarTarefas();if(t.status!=="Concluída"&&addNotif)await addNotif("tarefa","Tarefa concluída",`${usuario.nome} concluiu "${t.titulo}"`);};
  return (
    <div style={{padding:"16px 16px 0"}}>
      {tarefas.length>0&&<><Tit txt="Minhas Tarefas"/>
        {tarefas.map(t=>(
          <Card key={t.id} mb={8}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div onClick={()=>toggle(t)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${t.status==="Concluída"?C.ok:C.lavanda}`,background:t.status==="Concluída"?C.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,color:"#fff",flexShrink:0}}>{t.status==="Concluída"?"✓":""}</div>
              <div style={{flex:1,fontSize:13,color:t.status==="Concluída"?C.cinza:C.verde,textDecoration:t.status==="Concluída"?"line-through":"none"}}>{t.titulo}</div>
            </div>
          </Card>
        ))}
        <Sep/>
      </>}
      {reunioes.length>0&&<><Tit txt="Reuniões"/>
        {reunioes.slice(0,3).map(r=>(
          <Card key={r.id} mb={8}>
            <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,color:C.verde}}>{r.titulo}</div><div style={{fontSize:11,color:C.cinza}}>{r.data}</div></div>
            {r.decisoes&&<div style={{marginTop:8,background:C.lavanda,borderRadius:8,padding:"6px 10px",fontSize:11,color:C.verde}}>📋 {r.decisoes}</div>}
          </Card>
        ))}
        <Sep/>
      </>}
      <Card mb={10}><div style={{fontSize:13,color:C.cinza}}>Conta</div><div style={{fontSize:14,color:C.verde,marginTop:4}}>{usuario.nome}</div><div style={{fontSize:12,color:C.cinza}}>{usuario.email}</div></Card>
      <Btn full perigo onClick={onLogout}>Sair da conta</Btn>
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [fase,setFase]=useState("loading");
  const [usuario,setUsuario]=useState(null);
  const [erroGlobal,setErroGlobal]=useState("");
  const [dados,setDados]=useState({clientes:[],financeiro:[],treinos:[],modulos:[],tarefas:[],reunioes:[],metricas:[],pagamentos:[],notificacoes:[],usuarios:[]});

  const carregar = {
    clientes: async () => { const d=await db.get("clientes"); setDados(p=>({...p,clientes:d})); },
    financeiro: async () => { const d=await db.get("financeiro"); setDados(p=>({...p,financeiro:d})); },
    treinos: async () => { const d=await db.get("treinos"); setDados(p=>({...p,treinos:d})); },
    modulos: async () => { const d=await db.get("modulos"); setDados(p=>({...p,modulos:d})); },
    tarefas: async () => { const d=await db.get("tarefas"); setDados(p=>({...p,tarefas:d})); },
    reunioes: async () => { const d=await db.get("reunioes"); setDados(p=>({...p,reunioes:d})); },
    metricas: async () => { const d=await db.get("metricas"); setDados(p=>({...p,metricas:d})); },
    pagamentos: async () => { const d=await db.get("pagamentos"); setDados(p=>({...p,pagamentos:d})); },
    notificacoes: async () => { const d=await db.get("notificacoes"); setDados(p=>({...p,notificacoes:d})); },
    usuarios: async () => { const d=await db.get("usuarios"); setDados(p=>({...p,usuarios:d})); },
    tudo: async () => {
      const [cl,fi,tr,mo,ta,re,me,pg,no,us] = await Promise.all([
        db.get("clientes"),db.get("financeiro"),db.get("treinos"),db.get("modulos"),
        db.get("tarefas"),db.get("reunioes"),db.get("metricas"),db.get("pagamentos"),
        db.get("notificacoes"),db.get("usuarios")
      ]);
      setDados({clientes:cl,financeiro:fi,treinos:tr,modulos:mo,tarefas:ta,reunioes:re,metricas:me,pagamentos:pg,notificacoes:no,usuarios:us});
    }
  };

  useEffect(()=>{
    (async()=>{
      try {
        const sessao = localStorage.getItem("pv-sessao");
        if(sessao) {
          const {email,senha} = JSON.parse(sessao);
          const u = await db.getOne("usuarios",`email=eq.${encodeURIComponent(email)}&senha=eq.${encodeURIComponent(senha)}&ativo=eq.true`);
          if(u) { setUsuario(u); await carregar.tudo(); setFase(u.tipo==="admin"?"admin":"cliente"); return; }
        }
      } catch(e) { setErroGlobal("Erro ao conectar com o banco de dados."); }
      setFase("login");
    })();
  },[]);

  const login = async (email,senha) => {
    try {
      const u = await db.getOne("usuarios",`email=eq.${encodeURIComponent(email)}&senha=eq.${encodeURIComponent(senha)}&ativo=eq.true`);
      if(!u) return false;
      localStorage.setItem("pv-sessao", JSON.stringify({email,senha}));
      setUsuario(u);
      await carregar.tudo();
      setFase(u.tipo==="admin"?"admin":"cliente");
      return true;
    } catch { return false; }
  };

  const logout = () => { localStorage.removeItem("pv-sessao"); setUsuario(null); setFase("login"); };

  const clienteDoUsuario = usuario?.tipo==="cliente" ? dados.clientes.find(c=>c.id===usuario.cliente_id) : null;

  if(fase==="loading") return (
    <div style={{background:C.verde,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{color:C.cobre,fontSize:36}}>◈</div>
      <div style={{color:C.lavanda,fontSize:14,fontFamily:"Georgia,serif"}}>conectando ao banco...</div>
      {erroGlobal&&<div style={{color:C.erro,fontSize:12,marginTop:8,padding:"8px 16px",background:"rgba(0,0,0,0.3)",borderRadius:8}}>{erroGlobal}</div>}
    </div>
  );

  if(fase==="login") return <Login onLogin={login}/>;
  if(fase==="admin") return <AdminApp usuario={usuario} logout={logout} dados={dados} carregar={carregar}/>;
  return <ClienteApp usuario={usuario} logout={logout} clienteDoUsuario={clienteDoUsuario} dados={dados} carregar={carregar}/>;
}

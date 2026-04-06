import { useState, useEffect, useRef } from "react";

const C = { verde: "#153029", verdeM: "#1A4738", cobre: "#AD7F67", cobreL: "#C99A80", lavanda: "#E6E1E7", branco: "#F9F7F4", cinza: "#8A8580", erro: "#CC4444", ok: "#52C97A", escuro: "#0D1F1A" };

const st = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} }
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
const hoje = () => new Date().toISOString().split("T")[0];
const fmt = v => Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const pct = (a,b) => b ? Math.round((a/b)*100) : 0;

// ── SEED DATA ──────────────────────────────────────────────────────────────
const US = [
  { id:"adm1", nome:"Isa Fernanda", email:"isa@fsconsultoria.com.br", senha:"isa2026", tipo:"admin", ativo:true },
  { id:"cli1", nome:"Ana Lúcia", email:"ana@costas.com", senha:"ana2026", tipo:"cliente", clienteId:"c1", ativo:true }
];
const CS = [{ id:"c1", nome:"Ana Lúcia", negocio:"Costa Terapias", segmento:"Terapia", cidade:"Cabo Frio, RJ", email:"ana@costas.com", status:"Permuta", valor:3500, pagamento:"Permuta", etapas:[true,true,true,true,false], cor:C.cobre, notas:"10 materiais entregues." }];
const TS = [
  { id:"tr1", clienteId:"c1", nome:"Estruturação de Negócio", desc:"Posicionamento, produto e processos", categoria:"Gestão", thumb:"🏢", cor:"#1A4738", status:"Em Andamento", inicio:"2026-02-01", destaque:true },
  { id:"tr2", clienteId:"c1", nome:"Atendimento e Recepção", desc:"Scripts, padrão e retenção de clientes", categoria:"Equipe", thumb:"🤝", cor:"#2D6A4F", status:"Não Iniciado", inicio:"", destaque:false },
  { id:"tr3", clienteId:"c1", nome:"Financeiro Básico", desc:"Fluxo de caixa, DRE simplificado e metas", categoria:"Financeiro", thumb:"💰", cor:"#AD7F67", status:"Não Iniciado", inicio:"", destaque:false },
];
const MS = [
  { id:"mo1", trId:"tr1", clienteId:"c1", num:1, titulo:"Diagnóstico do Negócio", desc:"Mapear pontos fortes e gargalos", duracao:"45 min", feito:true, feito_em:"2026-02-10", notas:"3 gargalos identificados.", nota:5 },
  { id:"mo2", trId:"tr1", clienteId:"c1", num:2, titulo:"Serviços e Preços", desc:"Estruturar portfólio com precificação", duracao:"60 min", feito:true, feito_em:"2026-02-20", notas:"Cardápio criado.", nota:4 },
  { id:"mo3", trId:"tr1", clienteId:"c1", num:3, titulo:"Materiais de Apresentação", desc:"Landing page e visuais profissionais", duracao:"50 min", feito:false, feito_em:null, notas:"", nota:0 },
  { id:"mo4", trId:"tr1", clienteId:"c1", num:4, titulo:"Processo de Captação", desc:"Funil simples de atração e conversão", duracao:"40 min", feito:false, feito_em:null, notas:"", nota:0 },
];
const PAGAMENTOS_S = [
  { id:"pg1", clienteId:"c1", descricao:"Consultoria Mensal - Abril/2026", valor:1500, vencimento:"2026-04-10", status:"Pago", linkPagamento:"", pago_em:"2026-04-08" },
  { id:"pg2", clienteId:"c1", descricao:"Consultoria Mensal - Maio/2026", valor:1500, vencimento:"2026-05-10", status:"Pendente", linkPagamento:"https://pay.asaas.com/demo", pago_em:null },
];

// ── ATOMS ──────────────────────────────────────────────────────────────────
const Btn = ({children,onClick,full,sm,secondary,perigo,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",padding:sm?"8px 14px":"13px 20px",background:disabled?"#ccc":perigo?C.erro:secondary?"transparent":C.verde,border:secondary?`1px solid ${C.lavanda}`:"none",borderRadius:12,color:perigo?"#fff":secondary?C.cinza:C.cobreL,fontSize:sm?12:14,cursor:disabled?"not-allowed":"pointer",fontFamily:"Georgia,serif",opacity:disabled?0.6:1}}>{children}</button>
);
const Input = ({label,value,onChange,type="text",placeholder,multi,min,max}) => (
  <div style={{marginBottom:14}}>
    {label&&<div style={{fontSize:11,color:C.cinza,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{label}</div>}
    {multi
      ?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{width:"100%",padding:"11px 13px",border:`1px solid ${C.lavanda}`,borderRadius:10,fontFamily:"Georgia,serif",fontSize:13,color:C.verde,background:C.branco,resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
      :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} max={max} style={{width:"100%",padding:"11px 13px",border:`1px solid ${C.lavanda}`,borderRadius:10,fontFamily:"Georgia,serif",fontSize:13,color:C.verde,background:C.branco,boxSizing:"border-box",outline:"none"}}/>}
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
const Bar = ({pct:p,cor=C.cobre,h=7}) => (
  <div style={{background:C.lavanda,borderRadius:4,height:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min(100,p||0)}%`,height:"100%",background:`linear-gradient(90deg,${C.verdeM},${cor})`,borderRadius:4,transition:"width 0.4s"}}/>
  </div>
);

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
          {erro&&<div style={{color:C.erro,fontSize:12,marginBottom:14,textAlign:"center"}}>{erro}</div>}
          <Btn full onClick={entrar} disabled={load}>{load?"Entrando...":"Entrar"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TREINAMENTO NETFLIX (compartilhado admin/cliente)
// ══════════════════════════════════════════════════════════════════════════
function TelaTreinos({treinos,modulos,saveModulos,clienteId,isAdmin,addNotif,clienteNome,saveTreinos}) {
  const [aberto,setAberto]=useState(null); // treino selecionado
  const [modAberto,setModAberto]=useState(null);
  const [modalNovo,setModalNovo]=useState(false);
  const [form,setForm]=useState({nome:"",desc:"",categoria:"Gestão",thumb:"🎓",cor:C.verdeM});

  const meusTreinos = isAdmin ? treinos : treinos.filter(t=>t.clienteId===clienteId);
  const destaque = meusTreinos.find(t=>t.destaque) || meusTreinos[0];
  const categorias = [...new Set(meusTreinos.map(t=>t.categoria))];

  const progTreino = (t) => {
    const mods = modulos.filter(m=>m.trId===t.id);
    if(!mods.length) return 0;
    return pct(mods.filter(m=>m.feito).length, mods.length);
  };

  const toggleMod = async (mId) => {
    const m = modulos.find(x=>x.id===mId);
    const novos = modulos.map(x=>x.id===mId?{...x,feito:!x.feito,feito_em:!x.feito?hoje():null}:x);
    await saveModulos(novos);
    if(!m.feito && addNotif) await addNotif("adm1","treino",`Módulo concluído`,`${clienteNome} concluiu "${m.titulo}"`,clienteId);
  };

  const salvarTreino = async () => {
    const novo = {...form, id:uid(), clienteId, status:"Não Iniciado", inicio:"", destaque:false};
    await saveTreinos([...treinos, novo]);
    setModalNovo(false);
    setForm({nome:"",desc:"",categoria:"Gestão",thumb:"🎓",cor:C.verdeM});
  };

  // TELA DE MÓDULO
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
            <div style={{color:"rgba(255,255,255,0.9)",fontSize:14,lineHeight:1.6}}>{m.desc}</div>
          </div>
          {m.notas&&(
            <div style={{background:`${C.cobre}22`,border:`1px solid ${C.cobre}44`,borderRadius:14,padding:14,marginBottom:16}}>
              <div style={{color:C.cobre,fontSize:11,marginBottom:6}}>📝 Suas anotações</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>{m.notas}</div>
            </div>
          )}
          {m.nota>0&&<div style={{color:"#E8C547",fontSize:18,marginBottom:16}}>{"★".repeat(m.nota)}{"☆".repeat(5-m.nota)}</div>}
          <button onClick={()=>toggleMod(m.id)} style={{width:"100%",padding:16,background:m.feito?"rgba(82,201,122,0.15)":C.cobre,border:m.feito?`1px solid ${C.ok}`:"none",borderRadius:14,color:m.feito?C.ok:"#fff",fontSize:15,cursor:"pointer",fontFamily:"Georgia,serif"}}>
            {m.feito?"✓ Módulo Concluído":"Marcar como Concluído"}
          </button>
          {m.feito&&m.feito_em&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:8}}>Concluído em {m.feito_em}</div>}
        </div>
      </div>
    );
  }

  // TELA DO TREINO (lista de módulos)
  if(aberto) {
    const mods = modulos.filter(m=>m.trId===aberto.id).sort((a,b)=>a.num-b.num);
    const p = progTreino(aberto);
    return (
      <div style={{background:C.escuro,minHeight:"100%"}}>
        <div style={{background:`linear-gradient(180deg,${aberto.cor} 0%,${C.escuro} 70%)`,padding:"0 0 0"}}>
          <div style={{padding:"16px 16px 0"}}>
            <button onClick={()=>setAberto(null)} style={{background:"rgba(0,0,0,0.4)",border:"none",color:"#fff",padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:12}}>← Cursos</button>
          </div>
          <div style={{padding:"20px 16px 24px"}}>
            <div style={{fontSize:48,marginBottom:8}}>{aberto.thumb}</div>
            <div style={{color:C.cobre,fontSize:10,letterSpacing:3,textTransform:"uppercase"}}>{aberto.categoria}</div>
            <div style={{color:"#fff",fontSize:22,margin:"6px 0 8px",fontWeight:"bold"}}>{aberto.nome}</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:16}}>{aberto.desc}</div>
            <div style={{marginBottom:8}}><Bar pct={p} cor={C.cobre} h={6}/></div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>{p}% concluído · {mods.filter(m=>m.feito).length}/{mods.length} módulos</div>
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

  // HOME NETFLIX
  return (
    <div style={{background:C.escuro,minHeight:"100%",paddingBottom:100}}>
      {/* HERO */}
      {destaque&&(
        <div style={{position:"relative",height:220,background:`linear-gradient(135deg,${destaque.cor} 0%,${C.escuro} 100%)`,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 16px 20px"}}>
          <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{color:C.cobre,fontSize:10,letterSpacing:3,textTransform:"uppercase"}}>Em destaque</div>
            {isAdmin&&<button onClick={()=>setModalNovo(true)} style={{background:C.cobre,border:"none",borderRadius:20,padding:"5px 14px",color:C.verde,fontSize:11,cursor:"pointer"}}>+ Curso</button>}
          </div>
          <div style={{fontSize:44}}>{destaque.thumb}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:"bold",margin:"6px 0 4px"}}>{destaque.nome}</div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:10}}>{destaque.desc}</div>
          <Bar pct={progTreino(destaque)} cor={C.cobre} h={4}/>
          <button onClick={()=>setAberto(destaque)} style={{marginTop:12,background:C.cobre,border:"none",borderRadius:20,padding:"8px 24px",color:C.verde,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif",width:"fit-content"}}>▶ {progTreino(destaque)>0?"Continuar":"Iniciar"}</button>
        </div>
      )}

      {/* CATEGORIAS */}
      {categorias.map(cat=>{
        const lista = meusTreinos.filter(t=>t.categoria===cat);
        return (
          <div key={cat} style={{marginTop:24}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,textTransform:"uppercase",letterSpacing:2,padding:"0 16px",marginBottom:12}}>{cat}</div>
            <div style={{display:"flex",gap:12,padding:"0 16px",overflowX:"auto",paddingBottom:4}}>
              {lista.map(t=>{
                const p = progTreino(t);
                return (
                  <div key={t.id} onClick={()=>setAberto(t)} style={{flexShrink:0,width:140,cursor:"pointer"}}>
                    <div style={{height:90,background:`linear-gradient(135deg,${t.cor} 0%,${C.escuro} 100%)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,position:"relative",overflow:"hidden"}}>
                      {t.thumb}
                      {p>0&&p<100&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.2)"}}><div style={{width:`${p}%`,height:"100%",background:C.cobre}}/></div>}
                      {p===100&&<div style={{position:"absolute",top:6,right:6,background:C.ok,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>✓</div>}
                    </div>
                    <div style={{color:"#fff",fontSize:12,marginTop:8,fontWeight:"bold"}}>{t.nome}</div>
                    <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,marginTop:2}}>{modulos.filter(m=>m.trId===t.id).length} módulos · {p}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {modalNovo&&(
        <Modal titulo="Novo Curso" onClose={()=>setModalNovo(false)}>
          <Input label="Nome do curso" value={form.nome} onChange={v=>setForm({...form,nome:v})}/>
          <Input label="Descrição" value={form.desc} onChange={v=>setForm({...form,desc:v})}/>
          <Sel label="Categoria" value={form.categoria} onChange={v=>setForm({...form,categoria:v})} options={["Gestão","Financeiro","Equipe","Marketing","Operacional","Outro"]}/>
          <Input label="Emoji de capa" value={form.thumb} onChange={v=>setForm({...form,thumb:v})} placeholder="Ex: 🏢"/>
          <Btn full onClick={salvarTreino}>Criar Curso</Btn>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PAGAMENTOS (integração Asaas)
// ══════════════════════════════════════════════════════════════════════════
function TelaPagementos({pagamentos,savePagamentos,clienteId,isAdmin,clientes}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({clienteId:clienteId||"",descricao:"",valor:"",vencimento:"",linkPagamento:""});

  const lista = isAdmin ? pagamentos : pagamentos.filter(p=>p.clienteId===clienteId);
  const pendentes = lista.filter(p=>p.status==="Pendente");
  const pagos = lista.filter(p=>p.status==="Pago");
  const totalPendente = pendentes.reduce((a,b)=>a+Number(b.valor),0);

  const salvar = async () => {
    const novo = {...form, id:uid(), status:"Pendente", pago_em:null, valor:Number(form.valor)};
    await savePagamentos([...pagamentos, novo]);
    setModal(false);
    setForm({clienteId:clienteId||"",descricao:"",valor:"",vencimento:"",linkPagamento:""});
  };

  const marcarPago = async (pId) => {
    const novos = pagamentos.map(p=>p.id===pId?{...p,status:"Pago",pago_em:hoje()}:p);
    await savePagamentos(novos);
  };

  return (
    <div style={{padding:"16px 16px 0"}}>
      {isAdmin&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <Tit txt="Cobranças"/>
          <Btn sm onClick={()=>setModal(true)}>+ Nova cobrança</Btn>
        </div>
      )}

      {/* RESUMO */}
      {totalPendente>0&&(
        <div style={{background:C.verde,borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{color:C.lavanda,fontSize:12,marginBottom:4}}>Total em aberto</div>
          <div style={{color:C.cobre,fontSize:28,fontWeight:"bold"}}>{fmt(totalPendente)}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:4}}>{pendentes.length} cobrança(s) pendente(s)</div>
        </div>
      )}

      {/* PENDENTES */}
      {pendentes.length>0&&(
        <>
          <Tit txt="Em aberto"/>
          {pendentes.map(p=>{
            const cli = clientes?.find(c=>c.id===p.clienteId);
            const venceu = p.vencimento && p.vencimento < hoje();
            return (
              <Card key={p.id} mb={12} border={venceu?`1px solid ${C.erro}`:"none"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{p.descricao}</div>
                    {isAdmin&&cli&&<div style={{fontSize:11,color:C.cinza,marginTop:2}}>{cli.negocio}</div>}
                    <div style={{fontSize:11,color:venceu?C.erro:C.cinza,marginTop:2}}>Vencimento: {p.vencimento} {venceu?"· VENCIDO":""}</div>
                  </div>
                  <div style={{fontSize:18,color:C.verde,fontWeight:"bold"}}>{fmt(p.valor)}</div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  {p.linkPagamento&&(
                    <a href={p.linkPagamento} target="_blank" rel="noreferrer" style={{flex:1,display:"block",textAlign:"center",padding:"11px",background:C.cobre,borderRadius:12,color:C.verde,fontSize:13,textDecoration:"none",fontFamily:"Georgia,serif"}}>💳 Pagar agora</a>
                  )}
                  {isAdmin&&(
                    <button onClick={()=>marcarPago(p.id)} style={{flex:1,padding:"11px",background:"transparent",border:`1px solid ${C.ok}`,borderRadius:12,color:C.ok,fontSize:12,cursor:"pointer",fontFamily:"Georgia,serif"}}>✓ Marcar como pago</button>
                  )}
                </div>
                {!p.linkPagamento&&!isAdmin&&(
                  <div style={{textAlign:"center",padding:"10px",background:C.lavanda,borderRadius:10,color:C.cinza,fontSize:12}}>Link de pagamento será gerado em breve</div>
                )}
              </Card>
            );
          })}
        </>
      )}

      {/* PAGOS */}
      {pagos.length>0&&(
        <>
          <Sep/>
          <Tit txt={`${pagos.length} pago(s)`}/>
          {pagos.map(p=>{
            const cli = clientes?.find(c=>c.id===p.clienteId);
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
        </>
      )}

      {lista.length===0&&(
        <div style={{textAlign:"center",padding:40,color:C.cinza}}>
          <div style={{fontSize:36}}>💳</div>
          <div style={{marginTop:10,fontSize:13}}>Nenhuma cobrança ainda.</div>
        </div>
      )}

      {/* INFO ASAAS */}
      <div style={{background:C.lavanda,borderRadius:12,padding:14,marginTop:16}}>
        <div style={{fontSize:10,color:C.cinza,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Integração</div>
        <div style={{fontSize:12,color:C.cinza}}>Pagamentos via <strong>Banco Asaas</strong> · PIX, cartão e boleto. Links gerados automaticamente após configuração da API.</div>
      </div>

      {modal&&(
        <Modal titulo="Nova Cobrança" onClose={()=>setModal(false)}>
          {isAdmin&&clientes&&<Sel label="Cliente" value={form.clienteId} onChange={v=>setForm({...form,clienteId:v})} options={[{v:"",l:"Selecione..."}, ...clientes.map(c=>({v:c.id,l:c.negocio}))]}/>}
          <Input label="Descrição" value={form.descricao} onChange={v=>setForm({...form,descricao:v})} placeholder="Ex: Consultoria Mensal - Maio/2026"/>
          <Input label="Valor (R$)" value={form.valor} onChange={v=>setForm({...form,valor:v})} type="number"/>
          <Input label="Vencimento" value={form.vencimento} onChange={v=>setForm({...form,vencimento:v})} type="date"/>
          <Input label="Link de pagamento (Asaas)" value={form.linkPagamento} onChange={v=>setForm({...form,linkPagamento:v})} placeholder="https://pay.asaas.com/..."/>
          <Btn full onClick={salvar}>Criar Cobrança</Btn>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MÉTRICAS CLIENTE (automáticas)
// ══════════════════════════════════════════════════════════════════════════
function TelaMetricasCliente({clienteId,metricas,saveMetricas,addNotif,clienteNome}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({data:hoje(),faturamento:"",totalAtendimentos:"",novosClientes:"",cancelamentos:""});

  const meus = metricas.filter(m=>m.clienteId===clienteId).sort((a,b)=>b.data.localeCompare(a.data));

  // Cálculo automático
  const calcular = (f) => {
    const fat = Number(f.faturamento)||0;
    const tot = Number(f.totalAtendimentos)||0;
    const nov = Number(f.novosClientes)||0;
    const can = Number(f.cancelamentos)||0;
    const ticket = tot>0 ? fat/tot : 0;
    const retornos = tot - nov;
    const taxaRetorno = tot>0 ? pct(retornos, tot) : 0;
    const taxaCancelamento = tot>0 ? pct(can, tot) : 0;
    return { ticket, taxaRetorno, taxaCancelamento, retornos };
  };

  const calc = calcular(form);

  const salvar = async () => {
    const c = calcular(form);
    const nova = {
      id:uid(), clienteId,
      data:form.data,
      faturamento:Number(form.faturamento),
      totalAtendimentos:Number(form.totalAtendimentos),
      novosClientes:Number(form.novosClientes),
      cancelamentos:Number(form.cancelamentos),
      ticketMedio:c.ticket,
      taxaRetorno:c.taxaRetorno,
      taxaCancelamento:c.taxaCancelamento,
      retornos:c.retornos,
    };
    await saveMetricas([...metricas, nova]);
    if(addNotif) await addNotif("adm1","metricas",`Nova métrica`,`${clienteNome} inseriu dados de ${form.data}`,clienteId);
    setModal(false);
    setForm({data:hoje(),faturamento:"",totalAtendimentos:"",novosClientes:"",cancelamentos:""});
  };

  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <Tit txt="Indicadores mensais"/>
        <Btn sm onClick={()=>setModal(true)}>+ Inserir</Btn>
      </div>

      {meus.length===0&&(
        <div style={{textAlign:"center",padding:40,color:C.cinza}}>
          <div style={{fontSize:36}}>📊</div>
          <div style={{marginTop:10,fontSize:13}}>Insira os dados do mês.</div>
          <div style={{fontSize:11,marginTop:6}}>O sistema calcula ticket, retorno e cancelamento automaticamente.</div>
        </div>
      )}

      {meus.map(m=>(
        <Card key={m.id} mb={12}>
          <div style={{fontSize:15,color:C.verde,fontWeight:"bold",marginBottom:12}}>{m.data}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            {[
              {l:"Faturamento",v:fmt(m.faturamento),destaque:true},
              {l:"Atendimentos",v:m.totalAtendimentos},
              {l:"Novos clientes",v:m.novosClientes},
              {l:"Cancelamentos",v:m.cancelamentos},
            ].map(k=>(
              <div key={k.l} style={{background:k.destaque?C.verde:C.branco,border:`1px solid ${C.lavanda}`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:15,color:k.destaque?C.cobre:C.verde,fontWeight:"bold"}}>{k.v}</div>
                <div style={{fontSize:10,color:k.destaque?"rgba(255,255,255,0.5)":C.cinza,textTransform:"uppercase"}}>{k.l}</div>
              </div>
            ))}
          </div>
          <Sep/>
          <div style={{fontSize:10,color:C.cinza,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Calculado automaticamente</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {l:"Ticket Médio",v:fmt(m.ticketMedio),cor:C.cobre},
              {l:"Taxa Retorno",v:`${m.taxaRetorno}%`,cor:C.ok},
              {l:"Cancelamento",v:`${m.taxaCancelamento}%`,cor:m.taxaCancelamento>20?C.erro:"#E8974D"},
            ].map(k=>(
              <div key={k.l} style={{textAlign:"center",background:`${k.cor}11`,border:`1px solid ${k.cor}33`,borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:13,color:k.cor,fontWeight:"bold"}}>{k.v}</div>
                <div style={{fontSize:9,color:C.cinza,textTransform:"uppercase",marginTop:2}}>{k.l}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {modal&&(
        <Modal titulo="Inserir Dados do Mês" onClose={()=>setModal(false)}>
          <Input label="Mês de referência" value={form.data} onChange={v=>setForm({...form,data:v})} type="date"/>
          <Input label="Faturamento total (R$)" value={form.faturamento} onChange={v=>setForm({...form,faturamento:v})} type="number" placeholder="0,00"/>
          <Input label="Total de atendimentos realizados" value={form.totalAtendimentos} onChange={v=>setForm({...form,totalAtendimentos:v})} type="number" placeholder="Quantos clientes foram atendidos"/>
          <Input label="Novos clientes no mês" value={form.novosClientes} onChange={v=>setForm({...form,novosClientes:v})} type="number" placeholder="Quantos foram pela primeira vez"/>
          <Input label="Cancelamentos ou faltas" value={form.cancelamentos} onChange={v=>setForm({...form,cancelamentos:v})} type="number" placeholder="Agendamentos que não aconteceram"/>

          {/* PREVIEW CALCULADO */}
          {(form.faturamento||form.totalAtendimentos)&&(
            <div style={{background:`${C.verde}11`,border:`1px solid ${C.verde}33`,borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{fontSize:11,color:C.cinza,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Calculado automaticamente</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[
                  {l:"Ticket Médio",v:fmt(calc.ticket)},
                  {l:"Taxa Retorno",v:`${calc.taxaRetorno}%`},
                  {l:"Cancelamento",v:`${calc.taxaCancelamento}%`},
                ].map(k=>(
                  <div key={k.l} style={{textAlign:"center"}}>
                    <div style={{fontSize:13,color:C.verde,fontWeight:"bold"}}>{k.v}</div>
                    <div style={{fontSize:9,color:C.cinza,textTransform:"uppercase"}}>{k.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Btn full onClick={salvar} disabled={!form.faturamento||!form.totalAtendimentos}>Salvar Métricas</Btn>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN APP
// ══════════════════════════════════════════════════════════════════════════
function AdminApp(props) {
  const {tela,setTela,logout,notificacoes,usuario,clientes,financeiro,treinos,saveTreinos,modulos,saveModulos,tarefas,saveTarefas,reunioes,saveReunioes,metricas,pagamentos,savePagamentos,saveMetricas,addNotif,usuarios,saveUsuarios,saveClientes} = props;
  const naoLidas = notificacoes.filter(n=>!n.lida).length;

  const nav = [{id:"dashboard",emoji:"🏠",label:"Início"},{id:"clientes",emoji:"👥",label:"Clientes"},{id:"pagamentos",emoji:"💳",label:"Cobranças"},{id:"treinos",emoji:"🎓",label:"Treinos"},{id:"mais",emoji:"⚙️",label:"Mais"}];

  return (
    <div style={{background:C.branco,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      <Header
        titulo={tela==="dashboard"?`Olá, ${usuario.nome.split(" ")[0]} 👋`:tela==="clientes"?"Clientes":tela==="pagamentos"?"Cobranças":tela==="treinos"?"Treinamentos":tela==="mais"?"Mais":"Painel"}
        sub="FS Consultoria"
        extra={naoLidas>0?<div onClick={()=>setTela("notifs")} style={{position:"relative",cursor:"pointer",fontSize:20}}>🔔<span style={{position:"absolute",top:-4,right:-4,background:C.erro,color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"}}>{naoLidas}</span></div>:<div style={{width:22}}/>}
      />
      <div style={{paddingBottom:80}}>
        {tela==="dashboard"&&<AdminDash clientes={clientes} financeiro={financeiro} tarefas={tarefas} metricas={metricas} pagamentos={pagamentos}/>}
        {tela==="clientes"&&<AdminClientes clientes={clientes} saveClientes={saveClientes} usuarios={usuarios} saveUsuarios={saveUsuarios}/>}
        {tela==="pagamentos"&&<TelaPagementos pagamentos={pagamentos} savePagamentos={savePagamentos} isAdmin clientes={clientes}/>}
        {tela==="treinos"&&<TelaTreinos treinos={treinos} modulos={modulos} saveModulos={saveModulos} saveTreinos={saveTreinos} isAdmin/>}
        {tela==="mais"&&<AdminMais setTela={setTela} onLogout={logout}/>}
        {tela==="tarefas"&&<AdminTarefas tarefas={tarefas} saveTarefas={saveTarefas} clientes={clientes} onVoltar={()=>setTela("mais")}/>}
        {tela==="reunioes"&&<AdminReunioes reunioes={reunioes} saveReunioes={saveReunioes} clientes={clientes} onVoltar={()=>setTela("mais")}/>}
        {tela==="metricas"&&<AdminMetricas metricas={metricas} clientes={clientes} onVoltar={()=>setTela("mais")}/>}
        {tela==="notifs"&&<AdminNotifs notificacoes={notificacoes} saveNotificacoes={props.saveNotificacoes} onVoltar={()=>setTela("dashboard")}/>}
      </div>
      <BottomNav itens={nav} atual={tela} onTroca={setTela}/>
    </div>
  );
}

function AdminDash({clientes,financeiro,tarefas,metricas,pagamentos}) {
  const receita = financeiro.filter(f=>f.tipo==="Receita").reduce((a,b)=>a+Number(b.valor),0);
  const pendFin = pagamentos.filter(p=>p.status==="Pendente").reduce((a,b)=>a+Number(b.valor),0);
  const pendTask = tarefas.filter(t=>t.status!=="Concluída").length;
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{e:"👥",l:"Clientes",v:clientes.length,cor:C.verdeM},{e:"💰",l:"Receita",v:fmt(receita),cor:"#2D6A4F"},{e:"💳",l:"A receber",v:fmt(pendFin),cor:C.cobre},{e:"✅",l:"Tarefas",v:`${pendTask} pend.`,cor:"#E8974D"}].map(k=>(
          <div key={k.l} style={{background:k.cor,borderRadius:14,padding:"14px 12px"}}>
            <div style={{fontSize:20}}>{k.e}</div>
            <div style={{color:C.cobre,fontSize:18,fontWeight:"bold",marginTop:4}}>{k.v}</div>
            <div style={{color:C.lavanda,fontSize:10,opacity:0.7,textTransform:"uppercase",letterSpacing:1}}>{k.l}</div>
          </div>
        ))}
      </div>
      <Tit txt="Clientes"/>
      {clientes.map(c=>(
        <Card key={c.id} mb={10}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{c.negocio}</div>
              <div style={{fontSize:11,color:C.cinza}}>{c.nome}</div>
            </div>
            <Tag txt={c.status} cor={c.status==="Permuta"?C.cobre:c.status==="Em Andamento"?"#4EADCF":C.ok}/>
          </div>
          <Bar pct={pct(c.etapas.filter(Boolean).length,5)}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <span style={{fontSize:11,color:C.cinza}}>{c.etapas.filter(Boolean).length}/5 etapas</span>
            <span style={{fontSize:12,color:C.cobre}}>{fmt(c.valor)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AdminClientes({clientes,saveClientes,usuarios,saveUsuarios}) {
  const [modal,setModal]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const [form,setForm]=useState({nome:"",negocio:"",segmento:"",cidade:"",email:"",senha:"",valor:"",status:"Proposta Enviada",pagamento:"PIX",notas:""});

  const salvar = async () => {
    const c = {...form,id:uid(),valor:Number(form.valor)||0,etapas:[false,false,false,false,false],cor:C.cobre};
    const u = {id:uid(),nome:form.nome,email:form.email,senha:form.senha||"mudar123",tipo:"cliente",clienteId:c.id,ativo:true};
    await saveClientes([...clientes,c]);
    await saveUsuarios([...usuarios,u]);
    setModal(false);
    setForm({nome:"",negocio:"",segmento:"",cidade:"",email:"",senha:"",valor:"",status:"Proposta Enviada",pagamento:"PIX",notas:""});
  };

  const toggleE = async (cId,i) => {
    const novos = clientes.map(c=>{if(c.id!==cId)return c;const e=[...c.etapas];e[i]=!e[i];return{...c,etapas:e};});
    await saveClientes(novos);
    setDetalhe(novos.find(c=>c.id===cId));
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
      {["Diagnóstico","Estratégia","Execução","Entrega","Ajuste"].map((e,i)=>(
        <Card key={i} onClick={()=>toggleE(detalhe.id,i)} mb={8}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:detalhe.etapas[i]?C.cobre:C.lavanda,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{detalhe.etapas[i]?"✓":i+1}</div>
            <div style={{flex:1,fontSize:14,color:detalhe.etapas[i]?C.cinza:C.verde,textDecoration:detalhe.etapas[i]?"line-through":"none"}}>{e}</div>
            <Tag txt={detalhe.etapas[i]?"Feito":"Pendente"} cor={detalhe.etapas[i]?C.ok:"#E8974D"}/>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <Tit txt={`${clientes.length} cliente(s)`}/>
        <Btn sm onClick={()=>setModal(true)}>+ Novo</Btn>
      </div>
      {clientes.map(c=>(
        <Card key={c.id} onClick={()=>setDetalhe(c)} mb={10}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{c.negocio}</div><div style={{fontSize:11,color:C.cinza}}>{c.nome}</div></div>
            <Tag txt={c.status} cor={c.status==="Permuta"?C.cobre:c.status==="Em Andamento"?"#4EADCF":c.status==="Concluído"?C.ok:"#E8974D"}/>
          </div>
          <Bar pct={pct(c.etapas.filter(Boolean).length,5)}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <span style={{fontSize:11,color:C.cinza}}>{c.etapas.filter(Boolean).length}/5 etapas</span>
            <span style={{fontSize:12,color:C.cobre}}>{fmt(c.valor)}</span>
          </div>
        </Card>
      ))}
      {modal&&(
        <Modal titulo="Novo Cliente" onClose={()=>setModal(false)}>
          <Input label="Nome" value={form.nome} onChange={v=>setForm({...form,nome:v})}/>
          <Input label="Negócio" value={form.negocio} onChange={v=>setForm({...form,negocio:v})}/>
          <Input label="Segmento" value={form.segmento} onChange={v=>setForm({...form,segmento:v})}/>
          <Input label="Cidade" value={form.cidade} onChange={v=>setForm({...form,cidade:v})}/>
          <Input label="Email (login)" value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/>
          <Input label="Senha inicial" value={form.senha} onChange={v=>setForm({...form,senha:v})} type="password"/>
          <Input label="Valor (R$)" value={form.valor} onChange={v=>setForm({...form,valor:v})} type="number"/>
          <Sel label="Status" value={form.status} onChange={v=>setForm({...form,status:v})} options={["Proposta Enviada","Em Andamento","Concluído","Pausado","Permuta"]}/>
          <Sel label="Pagamento" value={form.pagamento} onChange={v=>setForm({...form,pagamento:v})} options={["PIX","Cartão","Boleto","Permuta","Parcelado"]}/>
          <Input label="Notas internas" value={form.notas} onChange={v=>setForm({...form,notas:v})} multi/>
          <Btn full onClick={salvar}>Adicionar Cliente</Btn>
        </Modal>
      )}
    </div>
  );
}

function AdminTarefas({tarefas,saveTarefas,clientes,onVoltar}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({clienteId:"",titulo:"",desc:"",prioridade:"Média",resp:"cliente",limite:""});
  const salvar=async()=>{await saveTarefas([...tarefas,{...form,id:uid(),status:"Para Fazer",criado:hoje()}]);setModal(false);setForm({clienteId:"",titulo:"",desc:"",prioridade:"Média",resp:"cliente",limite:""});};
  const toggle=async(id)=>{const n=tarefas.map(t=>t.id===id?{...t,status:t.status==="Concluída"?"Para Fazer":"Concluída"}:t);await saveTarefas(n);};
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{marginBottom:8}}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <Tit txt="Tarefas"/><Btn sm onClick={()=>setModal(true)}>+ Nova</Btn>
      </div>
      {tarefas.map(t=>{const cli=clientes.find(c=>c.id===t.clienteId);return(
        <Card key={t.id} mb={8}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div onClick={()=>toggle(t.id)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${t.status==="Concluída"?C.ok:C.lavanda}`,background:t.status==="Concluída"?C.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:2,fontSize:11,color:"#fff"}}>{t.status==="Concluída"?"✓":""}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:t.status==="Concluída"?C.cinza:C.verde,textDecoration:t.status==="Concluída"?"line-through":"none"}}>{t.titulo}</div>
              <div style={{fontSize:11,color:C.cinza,marginTop:2}}>{cli?.negocio} · vence {t.limite}</div>
              <Tag txt={t.prioridade} cor={t.prioridade==="Alta"?C.erro:t.prioridade==="Média"?"#E8C547":C.ok}/>
            </div>
          </div>
        </Card>
      );})}
      {modal&&(<Modal titulo="Nova Tarefa" onClose={()=>setModal(false)}>
        <Sel label="Cliente" value={form.clienteId} onChange={v=>setForm({...form,clienteId:v})} options={[{v:"",l:"Selecione..."},...clientes.map(c=>({v:c.id,l:c.negocio}))]}/>
        <Input label="Título" value={form.titulo} onChange={v=>setForm({...form,titulo:v})}/>
        <Input label="Descrição" value={form.desc} onChange={v=>setForm({...form,desc:v})} multi/>
        <Sel label="Responsável" value={form.resp} onChange={v=>setForm({...form,resp:v})} options={[{v:"cliente",l:"Cliente"},{v:"admin",l:"Admin (Isa)"}]}/>
        <Sel label="Prioridade" value={form.prioridade} onChange={v=>setForm({...form,prioridade:v})} options={["Alta","Média","Baixa"]}/>
        <Input label="Data limite" value={form.limite} onChange={v=>setForm({...form,limite:v})} type="date"/>
        <Btn full onClick={salvar}>Criar Tarefa</Btn>
      </Modal>)}
    </div>
  );
}

function AdminReunioes({reunioes,saveReunioes,clientes,onVoltar}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({clienteId:"",titulo:"",data:hoje(),tipo:"Reunião com Cliente",pauta:"",decisoes:"",proximas:"",duracao:""});
  const salvar=async()=>{await saveReunioes([...reunioes,{...form,id:uid(),duracao:Number(form.duracao)}]);setModal(false);setForm({clienteId:"",titulo:"",data:hoje(),tipo:"Reunião com Cliente",pauta:"",decisoes:"",proximas:"",duracao:""});};
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{marginBottom:8}}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <Tit txt="Reuniões"/><Btn sm onClick={()=>setModal(true)}>+ Registrar</Btn>
      </div>
      {reunioes.length===0&&<div style={{textAlign:"center",color:C.cinza,padding:30,fontSize:13}}>Nenhuma reunião.</div>}
      {reunioes.sort((a,b)=>b.data.localeCompare(a.data)).map(r=>{const cli=clientes.find(c=>c.id===r.clienteId);return(
        <Card key={r.id} mb={10}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <div style={{fontSize:14,color:C.verde}}>{r.titulo}</div>
            <div style={{fontSize:11,color:C.cinza}}>{r.data}</div>
          </div>
          <div style={{fontSize:11,color:C.cinza}}>{cli?.negocio} · {r.tipo} · {r.duracao}min</div>
          {r.decisoes&&<div style={{marginTop:8,background:C.lavanda,borderRadius:8,padding:"8px 10px",fontSize:12,color:C.verde}}>📋 {r.decisoes}</div>}
        </Card>
      );})}
      {modal&&(<Modal titulo="Registrar Reunião" onClose={()=>setModal(false)}>
        <Sel label="Cliente" value={form.clienteId} onChange={v=>setForm({...form,clienteId:v})} options={[{v:"",l:"Selecione..."},...clientes.map(c=>({v:c.id,l:c.negocio}))]}/>
        <Input label="Título" value={form.titulo} onChange={v=>setForm({...form,titulo:v})}/>
        <Input label="Data" value={form.data} onChange={v=>setForm({...form,data:v})} type="date"/>
        <Sel label="Tipo" value={form.tipo} onChange={v=>setForm({...form,tipo:v})} options={["Reunião com Cliente","Call de Vendas","Alinhamento","Treinamento"]}/>
        <Input label="Duração (min)" value={form.duracao} onChange={v=>setForm({...form,duracao:v})} type="number"/>
        <Input label="Pauta" value={form.pauta} onChange={v=>setForm({...form,pauta:v})} multi/>
        <Input label="Decisões" value={form.decisoes} onChange={v=>setForm({...form,decisoes:v})} multi/>
        <Input label="Próximas ações" value={form.proximas} onChange={v=>setForm({...form,proximas:v})} multi/>
        <Btn full onClick={salvar}>Salvar</Btn>
      </Modal>)}
    </div>
  );
}

function AdminMetricas({metricas,clientes,onVoltar}) {
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{marginBottom:8}}><Btn sm secondary onClick={onVoltar}>← Voltar</Btn></div>
      <Tit txt="Métricas dos Clientes"/>
      {metricas.length===0&&<div style={{textAlign:"center",color:C.cinza,padding:40}}><div style={{fontSize:36}}>📊</div><div style={{marginTop:10,fontSize:13}}>Aguardando dados dos clientes.</div></div>}
      {metricas.sort((a,b)=>b.data.localeCompare(a.data)).map(m=>{const cli=clientes.find(c=>c.id===m.clienteId);return(
        <Card key={m.id} mb={12}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:14,color:C.verde,fontWeight:"bold"}}>{cli?.negocio}</div>
            <div style={{fontSize:11,color:C.cinza}}>{m.data}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"Faturamento",v:fmt(m.faturamento)},{l:"Atendimentos",v:m.totalAtendimentos},{l:"Ticket Médio",v:fmt(m.ticketMedio)},{l:"Novos",v:m.novosClientes},{l:"Retorno",v:`${m.taxaRetorno}%`},{l:"Cancelamento",v:`${m.taxaCancelamento}%`}].map(k=>(
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

function AdminNotifs({notificacoes,saveNotificacoes,onVoltar}) {
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <Btn sm secondary onClick={onVoltar}>← Voltar</Btn>
        <Btn sm onClick={()=>saveNotificacoes(notificacoes.map(n=>({...n,lida:true})))}>Marcar todas lidas</Btn>
      </div>
      {notificacoes.length===0&&<div style={{textAlign:"center",color:C.cinza,padding:30}}>Sem notificações.</div>}
      {notificacoes.sort((a,b)=>(b.criadoEm||"").localeCompare(a.criadoEm||"")).map(n=>(
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
      {[{e:"✅",l:"Tarefas",t:"tarefas"},{e:"🗓️",l:"Reuniões",t:"reunioes"},{e:"📊",l:"Métricas dos Clientes",t:"metricas"},{e:"🔔",l:"Notificações",t:"notifs"}].map(o=>(
        <Card key={o.t} onClick={()=>setTela(o.t)} mb={10}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:22}}>{o.e}</span>
            <span style={{fontSize:14,color:C.verde}}>{o.l}</span>
            <span style={{marginLeft:"auto",color:C.cinza}}>›</span>
          </div>
        </Card>
      ))}
      <Sep/>
      <Btn full perigo onClick={onLogout}>Sair da conta</Btn>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CLIENTE APP
// ══════════════════════════════════════════════════════════════════════════
function ClienteApp(props) {
  const {tela,setTela,logout,usuario,clienteDoUsuario,treinos,modulos,saveModulos,saveTreinos,metricas,saveMetricas,pagamentos,savePagamentos,tarefas,saveTarefas,reunioes,addNotif,notificacoes} = props;

  if(!clienteDoUsuario) return <div style={{padding:20,color:C.cinza}}>Perfil não encontrado.</div>;
  const cId = clienteDoUsuario.id;
  const nav = [{id:"inicio",emoji:"🏠",label:"Início"},{id:"metricas",emoji:"📊",label:"Métricas"},{id:"pagamentos",emoji:"💳",label:"Pagamentos"},{id:"treinos",emoji:"🎓",label:"Treinos"},{id:"mais",emoji:"⚙️",label:"Mais"}];

  return (
    <div style={{background:tela==="treinos"?C.escuro:C.branco,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      {tela!=="treinos"&&<Header titulo={tela==="inicio"?`Olá, ${usuario.nome.split(" ")[0]} 👋`:tela==="metricas"?"Minhas Métricas":tela==="pagamentos"?"Pagamentos":tela==="mais"?"Mais":"Portal"} sub={clienteDoUsuario.negocio}/>}
      {tela==="treinos"&&<div style={{background:C.escuro,padding:"16px 16px 0",paddingTop:"env(safe-area-inset-top,16px)"}}>
        <div style={{fontSize:10,color:C.cobre,letterSpacing:3,textTransform:"uppercase",textAlign:"center"}}>{clienteDoUsuario.negocio}</div>
        <div style={{color:"rgba(255,255,255,0.8)",fontSize:16,textAlign:"center",marginTop:2}}>Treinamentos</div>
      </div>}
      <div style={{paddingBottom:80}}>
        {tela==="inicio"&&<ClienteInicio cliente={clienteDoUsuario} tarefas={tarefas} notificacoes={notificacoes} cId={cId}/>}
        {tela==="metricas"&&<TelaMetricasCliente clienteId={cId} metricas={metricas} saveMetricas={saveMetricas} addNotif={addNotif} clienteNome={usuario.nome}/>}
        {tela==="pagamentos"&&<TelaPagementos pagamentos={pagamentos} savePagamentos={savePagamentos} clienteId={cId} isAdmin={false} clientes={[]}/>}
        {tela==="treinos"&&<TelaTreinos treinos={treinos} modulos={modulos} saveModulos={saveModulos} saveTreinos={saveTreinos} clienteId={cId} isAdmin={false} addNotif={addNotif} clienteNome={usuario.nome}/>}
        {tela==="mais"&&<ClienteMais setTela={setTela} onLogout={logout} usuario={usuario} tarefas={tarefas} saveTarefas={saveTarefas} cId={cId} reunioes={reunioes} addNotif={addNotif}/>}
      </div>
      <BottomNav itens={nav} atual={tela} onTroca={setTela}/>
    </div>
  );
}

function ClienteInicio({cliente,tarefas,notificacoes,cId}) {
  const prog = pct(cliente.etapas.filter(Boolean).length,5);
  const meusTasks = tarefas.filter(t=>t.clienteId===cId&&t.status!=="Concluída");
  const notifs = notificacoes.filter(n=>n.clienteId===cId&&!n.lida);
  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{background:C.verde,borderRadius:16,padding:20,marginBottom:16}}>
        <div style={{color:C.lavanda,fontSize:13,marginBottom:4}}>{cliente.negocio}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{color:C.cobre,fontSize:11}}>Progresso do projeto</div>
          <div style={{color:C.cobre,fontSize:26,fontWeight:"bold"}}>{prog}%</div>
        </div>
        <Bar pct={prog}/>
        <div style={{display:"flex",marginTop:12,gap:6}}>
          {["Diagnóst.","Estratégia","Execução","Entrega","Ajuste"].map((e,i)=>(
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{height:5,borderRadius:3,background:cliente.etapas[i]?C.cobre:"rgba(255,255,255,0.15)",marginBottom:4}}/>
              <div style={{fontSize:8,color:cliente.etapas[i]?C.cobre:"rgba(255,255,255,0.3)",textTransform:"uppercase"}}>{e.slice(0,4)}</div>
            </div>
          ))}
        </div>
      </div>
      {meusTasks.length>0&&(<>
        <Tit txt={`${meusTasks.length} tarefa(s) para você`}/>
        {meusTasks.slice(0,3).map(t=>(
          <Card key={t.id} mb={8}>
            <div style={{fontSize:13,color:C.verde}}>{t.titulo}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:11,color:C.cinza}}>Vence {t.limite}</span>
              <Tag txt={t.prioridade} cor={t.prioridade==="Alta"?C.erro:t.prioridade==="Média"?"#E8C547":C.ok}/>
            </div>
          </Card>
        ))}
      </>)}
      {notifs.length>0&&(<><Sep/><Tit txt="Novidades"/>{notifs.slice(0,2).map(n=>(
        <Card key={n.id} mb={8}><div style={{fontSize:13,color:C.verde}}>🔔 {n.titulo}</div><div style={{fontSize:11,color:C.cinza,marginTop:4}}>{n.mensagem}</div></Card>
      ))}</>)}
    </div>
  );
}

function ClienteMais({setTela,onLogout,usuario,tarefas,saveTarefas,cId,reunioes,addNotif}) {
  const meusTasks = tarefas.filter(t=>t.clienteId===cId);
  const toggle=async(id)=>{const m=tarefas.find(x=>x.id===id);const n=tarefas.map(t=>t.id===id?{...t,status:t.status==="Concluída"?"Para Fazer":"Concluída"}:t);await saveTarefas(n);if(m.status!=="Concluída"&&addNotif)await addNotif("adm1","tarefa",`Tarefa concluída`,`${usuario.nome} concluiu "${m.titulo}"`,cId);};
  const minhasReunioes = reunioes.filter(r=>r.clienteId===cId).sort((a,b)=>b.data.localeCompare(a.data));
  return (
    <div style={{padding:"16px 16px 0"}}>
      {meusTasks.length>0&&(<>
        <Tit txt="Minhas Tarefas"/>
        {meusTasks.map(t=>(
          <Card key={t.id} mb={8}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div onClick={()=>toggle(t.id)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${t.status==="Concluída"?C.ok:C.lavanda}`,background:t.status==="Concluída"?C.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,color:"#fff",flexShrink:0}}>{t.status==="Concluída"?"✓":""}</div>
              <div style={{flex:1,fontSize:13,color:t.status==="Concluída"?C.cinza:C.verde,textDecoration:t.status==="Concluída"?"line-through":"none"}}>{t.titulo}</div>
            </div>
          </Card>
        ))}
        <Sep/>
      </>)}
      {minhasReunioes.length>0&&(<>
        <Tit txt="Reuniões"/>
        {minhasReunioes.slice(0,3).map(r=>(
          <Card key={r.id} mb={8}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:13,color:C.verde}}>{r.titulo}</div>
              <div style={{fontSize:11,color:C.cinza}}>{r.data}</div>
            </div>
            {r.decisoes&&<div style={{marginTop:8,background:C.lavanda,borderRadius:8,padding:"6px 10px",fontSize:11,color:C.verde}}>📋 {r.decisoes}</div>}
          </Card>
        ))}
        <Sep/>
      </>)}
      <Card mb={10}>
        <div style={{fontSize:13,color:C.cinza}}>Conta</div>
        <div style={{fontSize:14,color:C.verde,marginTop:4}}>{usuario.nome}</div>
        <div style={{fontSize:12,color:C.cinza}}>{usuario.email}</div>
      </Card>
      <Btn full perigo onClick={onLogout}>Sair da conta</Btn>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [fase,setFase]=useState("loading");
  const [usuario,setUsuario]=useState(null);
  const [telaA,setTelaA]=useState("dashboard");
  const [telaC,setTelaC]=useState("inicio");
  const [usuarios,setUsuarios]=useState([]);
  const [clientes,setClientes]=useState([]);
  const [financeiro,setFinanceiro]=useState([]);
  const [treinos,setTreinos]=useState([]);
  const [modulos,setModulos]=useState([]);
  const [tarefas,setTarefas]=useState([]);
  const [reunioes,setReunioes]=useState([]);
  const [metricas,setMetricas]=useState([]);
  const [pagamentos,setPagamentos]=useState([]);
  const [notificacoes,setNotificacoes]=useState([]);

  useEffect(()=>{
    (async()=>{
      const u=await st.get("pv-usuarios")||US;
      const c=await st.get("pv-clientes")||CS;
      const f=await st.get("pv-financeiro")||[];
      const tr=await st.get("pv-treinos")||TS;
      const mo=await st.get("pv-modulos")||MS;
      const ta=await st.get("pv-tarefas")||[];
      const re=await st.get("pv-reunioes")||[];
      const me=await st.get("pv-metricas")||[];
      const pg=await st.get("pv-pagamentos")||PAGAMENTOS_S;
      const no=await st.get("pv-notifs")||[];
      setUsuarios(u);setClientes(c);setFinanceiro(f);setTreinos(tr);setModulos(mo);setTarefas(ta);setReunioes(re);setMetricas(me);setPagamentos(pg);setNotificacoes(no);
      const sess=await st.get("pv-sessao");
      if(sess?.email){const found=u.find(x=>x.email===sess.email&&x.ativo);if(found){setUsuario(found);setFase(found.tipo==="admin"?"admin":"cliente");return;}}
      setFase("login");
    })();
  },[]);

  const save=(k,s)=>async v=>{s(v);await st.set(k,v);};
  const saveUsuarios=save("pv-usuarios",setUsuarios);
  const saveClientes=save("pv-clientes",setClientes);
  const saveFinanceiro=save("pv-financeiro",setFinanceiro);
  const saveTreinos=save("pv-treinos",setTreinos);
  const saveModulos=save("pv-modulos",setModulos);
  const saveTarefas=save("pv-tarefas",setTarefas);
  const saveReunioes=save("pv-reunioes",setReunioes);
  const saveMetricas=save("pv-metricas",setMetricas);
  const savePagamentos=save("pv-pagamentos",setPagamentos);
  const saveNotificacoes=save("pv-notifs",setNotificacoes);

  const addNotif=async(uId,tipo,titulo,msg,cId)=>{
    const nova={id:uid(),usuarioId:uId,clienteId:cId,tipo,titulo,mensagem:msg,lida:false,criadoEm:new Date().toISOString()};
    const novos=[...notificacoes,nova];setNotificacoes(novos);await st.set("pv-notifs",novos);
  };

  const login=async(email,senha)=>{
    const u=usuarios.find(x=>x.email===email&&x.senha===senha&&x.ativo);
    if(!u)return false;
    setUsuario(u);await st.set("pv-sessao",{email});
    setFase(u.tipo==="admin"?"admin":"cliente");return true;
  };
  const logout=async()=>{await st.set("pv-sessao",null);setUsuario(null);setFase("login");};

  const clienteDoUsuario=usuario?.tipo==="cliente"?clientes.find(c=>c.id===usuario.clienteId):null;

  const p={usuario,usuarios,clientes,financeiro,treinos,modulos,tarefas,reunioes,metricas,pagamentos,notificacoes,saveUsuarios,saveClientes,saveFinanceiro,saveTreinos,saveModulos,saveTarefas,saveReunioes,saveMetricas,savePagamentos,saveNotificacoes,addNotif,logout,clienteDoUsuario};

  if(fase==="loading")return <div style={{background:C.verde,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}><div style={{color:C.cobre,fontSize:32}}>◈</div><div style={{color:C.lavanda,fontSize:14,fontFamily:"Georgia,serif"}}>carregando...</div></div>;
  if(fase==="login")return <Login onLogin={login}/>;
  if(fase==="admin")return <AdminApp tela={telaA} setTela={setTelaA} {...p}/>;
  return <ClienteApp tela={telaC} setTela={setTelaC} {...p}/>;
}

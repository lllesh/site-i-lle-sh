/* A PÁGINA DE ENTRAR (modelo da plataforma): e-mail + senha, com "criar conta".
   Sem Google, sem link por e-mail. Conta no "i m b i g o" (Supabase gqeipjiidtrcbmnrnknc), pelo cliente do próprio site (banco.js).
   Depois de entrar, confere o plano deste site (plataforma.pode_entrar): hoje todo site
   pede Platinum e ninguém tem — só a dona (le@umbii.boo) passa. */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

import { banco, BUCKET } from './banco.js'

const SB = 'https://gqeipjiidtrcbmnrnknc.supabase.co'
const volta = new URLSearchParams(location.search).get('volta')
const PUB = 'sb_publishable_5PMV1M5XkgU6xzdnwCcWgQ_xy-9fLLV'

const DOMINIO = '@iiiii.boo'
// só letras e números, sem acento e em minúsculas (vira e-mail e site)
const limpa = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)

export async function sair() { await banco.auth.signOut(); location.reload() }

async function podeEntrar(token) {
  const r = await fetch(`${SB}/rest/v1/rpc/pode_entrar`, {
    method: 'POST',
    headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Profile': 'plataforma' },
    body: JSON.stringify({ dominio: location.hostname }),
  })
  return r.ok && (await r.json()) === true
}

/** Porta do site: mostra o app só para quem entrou e tem o plano. */

// a caixinha do VIDS: um squircle só com uma letra de SQUIRCLES; tocou, troca a letra dando um pulinho
const LETRAS_SQ = 'SQUIRCLES'.split('')
// cada toque também troca o fundo lá de trás (como no VIDS); o cartão da frente continua igual, com o efeito neumórfico
// cada letra tem a sua cor (o S é sempre rosa; nenhuma outra letra repete cor), sempre com a letra branca (lele)
const COR_DA_LETRA = { S: '#F48591', Q: '#FA8D85', U: '#FEA283', I: '#FFB872', R: '#8DA599', C: '#8D96C1', L: '#C18EA9', E: '#C8C4B9' } // o E saiu do preto (quebrava a página): cinza da paleta até a Dra Lê escolher outra
// cadastrar: o fundo lá atrás tem a cor e o cartão é claro. entrar: tudo invertido — a cor vai para o cartão e o fundo fica claro
function pintaFundo() {
  // i.lle.sh (06/10/2026): as cores do ll e.s h, iguais nos dois modos: a página branca, o cartão creme,
  // as pílulas afundadas num creme um pouco mais escuro, o botão branco e a letra no cinza da página (nada de preto) (o 3D macio do my.squircl.es continua)
  const r = document.documentElement.style
  r.setProperty('--fundo-pag', '#FFFFFF')
  document.body.style.background = '#FFFFFF'; document.documentElement.style.background = '#FFFFFF'
  r.setProperty('--cartao', '#FFFBF3')
  r.setProperty('--campo', '#F1EDE4')
  r.setProperty('--inset', 'inset 4px 4px 9px rgba(0,0,0,.08), inset -4px -4px 9px rgba(255,255,255,.9)')
  r.setProperty('--caixa', '#FFFFFF')
  r.setProperty('--caixa-letra', '#86868b')
  r.setProperty('--acc-texto', '#86868b')
  let m = document.querySelector('meta[name="theme-color"]'); if (m) m.remove()
  m = document.createElement('meta'); m.name = 'theme-color'; m.content = '#000000'; document.head.appendChild(m)
}
// o quadradinho de cima:
//  · cadastrar: S Q U I R C L E S, uma letra por toque; depois do último S vem o quadradinho creme com a câmera,
//    para a pessoa tirar uma selfie (ela aparece dentro do squircle e é guardada quando a conta é criada)
//  · entrar: vai passando a carinha de quem já está dentro (se ainda não tem ninguém, mostra as letras)
// as carinhas de teste agora são 5 bonequinhos do squivatars (cada um numa cor da paleta)
const ROSTOS_TESTE = Array.from({ length: 5 }, (_, k) => '/teste/sq-' + (k + 1) + '.jpg?b=1')
function Caixinha({ modo, selfie, setSelfie }) {
  const [i, setI] = useState(0)
  const [rostos, setRostos] = useState([])
  const [r, setR] = useState(0)
  const cam = useRef(null)
  const CAMERA = LETRAS_SQ.length // a posição depois do último S
  const naCamera = modo === 'criar' && i === CAMERA
  const letra = LETRAS_SQ[Math.min(i, LETRAS_SQ.length - 1)]
  useEffect(() => { if (modo === 'entrar' && i === CAMERA) setI(0) }, [modo])
  useEffect(() => { pintaFundo(COR_DA_LETRA[naCamera ? 'S' : letra], modo === 'entrar') }, [i, modo])
  // enquanto ninguém tem selfie, passam as carinhas de teste (desenhadas nas cores da paleta)
  useEffect(() => { banco.from('rostos').select('url').order('criado', { ascending: false }).limit(40).then(({ data }) => { const u = (data || []).map(x => x.url); setRostos(u.length ? u : ROSTOS_TESTE) }, () => setRostos(ROSTOS_TESTE)) }, [])
  const mostraRostos = modo === 'entrar' && rostos.length > 0
  const semNinguem = modo === 'entrar' && rostos.length === 0 // no entrar não tem letras: só pessoas (enquanto ninguém tem selfie, a silhueta)
  useEffect(() => { if (!mostraRostos) return; const t = setInterval(() => setR(n => (n + 1) % rostos.length), 1100); return () => clearInterval(t) }, [mostraRostos, rostos.length])
  function toque() {
    if (naCamera) return cam.current && cam.current.click()
    if (mostraRostos) return setR(n => (n + 1) % rostos.length)
    if (semNinguem) return
    setI(n => (n + 1) % (modo === 'criar' ? CAMERA + 1 : LETRAS_SQ.length))
  }
  const foto = naCamera ? (selfie && selfie.url) : mostraRostos ? rostos[r] : null
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: modo === 'entrar' ? 60 : 36 }}>
      {/* o brilho da fotinho no entrar: uma luz redonda atrás, sem filtro (o filtro mostrava a "caixinha" da sombra no iPhone) */}
      {/* o brilho da fotinho no entrar: camadas em formato de squircle (não redondo), cada uma um pouco maior e mais clarinha — sem filtro, para não aparecer a caixinha no iPhone */}
      {modo === 'entrar' && [[1.06, .55], [1.11, .32], [1.16, .16], [1.21, .07]].map(([k, o], n) => <div key={n} aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '1.14em', height: '1.14em', fontSize: 104, transform: 'translate(-50%, -50%) scale(' + k + ')', background: '#FFFBF3', opacity: o, WebkitMask: 'var(--squircle) center / 100% 100% no-repeat', mask: 'var(--squircle) center / 100% 100% no-repeat', pointerEvents: 'none', zIndex: 0 }} />)}
      <input ref={cam} type="file" accept="image/*" capture="user" hidden onChange={e => { const f = e.target.files && e.target.files[0]; if (f) setSelfie({ file: f, url: URL.createObjectURL(f) }); e.target.value = '' }} />
      <motion.button type="button" aria-label={naCamera ? 'tirar uma selfie' : 'squircles'} onClick={toque}
        drag dragSnapToOrigin dragElastic={0.9} dragTransition={{ bounceStiffness: 1100, bounceDamping: 11 }} whileTap={{ scale: 1.25 }} whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="titulo-sq" style={{ position: 'relative', zIndex: 0, padding: 0, border: 0, background: 'none', cursor: 'grab', touchAction: 'none', fontSize: modo === 'entrar' ? 104 : 80 }}>
        <motion.span key={naCamera ? 'camera' + (foto || '') : mostraRostos ? 'rosto' + r : i} initial={{ scale: .4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14 }}
          style={foto ? { background: '#FFFBF3', padding: '.06em' } : naCamera ? { background: '#FFFBF3', color: COR_DA_LETRA.S } : undefined}>
          {foto ? <img src={foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', WebkitMask: 'var(--squircle) center / 100% 100% no-repeat', mask: 'var(--squircle) center / 100% 100% no-repeat' }} />
            : naCamera ? <svg width=".56em" height=".56em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.6" /></svg>
            : semNinguem ? <svg width=".62em" height=".62em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8.2" r="4.2" /><path d="M3.8 21c.6-4.4 4-7.2 8.2-7.2s7.6 2.8 8.2 7.2z" /></svg>
            : letra}
        </motion.span>
      </motion.button>
    </div>
  )
}


// a logo do ll e.s h no lugar dos bonequinhos (06/10/2026): de tempos em tempos o pontinho sai dando
// uma cambalhota e volta para o lugar; tocar na logo faz ele sair na hora. Ocupa a mesma altura da caixinha antiga,
// para nada mudar de lugar.
function LogoComPonto({ modo }) {
  const [vez, setVez] = useState(0)
  useEffect(() => { pintaFundo() }, [modo])
  useEffect(() => { const t = setInterval(() => setVez(n => n + 1), 3600); return () => clearInterval(t) }, [])
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 118.5, marginBottom: modo === 'entrar' ? 60 : 36 }}>
      <button type="button" className="logo-lle" aria-label="ll e.s h" onClick={() => setVez(n => n + 1)}>
        <span className={'logo-caixa' + (vez ? ' pousa' : '')} key={'c' + vez}>
          <img className="logo" src="/logo-sem-bolinha.png" alt="ll e.s h" draggable="false" />
          <img className={'ponto' + (vez ? ' sai' : '')} key={'p' + vez} src="/bolinha-logo-grande.png" alt="" draggable="false" />
        </span>
      </button>
    </div>
  )
}

// o olhinho dentro da pílula da senha: toca e mostra/esconde a senha
function Olhinho({ ver, troca }) {
  return (
    <button type="button" onClick={troca} aria-label={ver ? 'esconder a senha' : 'mostrar a senha'}
      style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, padding: 0, border: 0, background: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--acc-texto, #F48591)' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
        {!ver && <path d="M4 20 20 4" />}
      </svg>
    </button>
  )
}
// o cadeadinho desenhado: fica da cor escolhida (a do texto ao lado)
function Cadeado() {
  return (
    <svg width="9" height="10" viewBox="0 0 14 16" aria-hidden="true">
      <path d="M3.5 7V4.8a3.5 3.5 0 0 1 7 0V7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="1" y="7" width="12" height="8.5" rx="3" fill="currentColor" />
    </svg>
  )
}


// um squircle redondinho com ícone (documento / gravar) na segunda página do cadastro
function Bolinha({ rotulo, feito, onClick, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <motion.button type="button" onClick={onClick} whileTap={{ scale: 1.2 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} aria-label={rotulo}
        style={{ width: 64, height: 64, padding: 0, border: 0, display: 'grid', placeItems: 'center', cursor: 'pointer', background: feito ? 'var(--caixa-letra, #FFFBF3)' : 'var(--caixa, #F48591)', color: feito ? 'var(--caixa, #F48591)' : 'var(--caixa-letra, #FFFBF3)', WebkitMask: 'var(--squircle) center / 100% 100% no-repeat', mask: 'var(--squircle) center / 100% 100% no-repeat' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
      </motion.button>
      <div className="rotulo-bern" style={{ fontSize: 11, color: 'var(--acc-texto, #F48591)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{rotulo}</div>
    </div>
  )
}
// o que a pessoa falou vira campos: e-mail, whatsapp e data de nascimento
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
function falaParaCampos(texto) {
  const t = ' ' + String(texto || '').toLowerCase().replace(/[,;]/g, ' ') + ' '
  const c = {}
  const e = t.replace(/\s*\b(arroba|a?roba)\s*/g, '@').replace(/\s+ponto\s+/g, '.').replace(/\s*@\s*/g, '@').replace(/\s*\.\s*(com|br|net|org)\b/g, '.$1')
  const m = e.match(/[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}/); if (m) c.email = m[0].replace(/\.$/, '')
  const d = t.replace(/(\d)[\s().-]+(?=\d)/g, '$1').match(/\d{10,13}/); if (d) c.whats = d[0]
  let n = t.match(/(\d{1,2})\s*(?:de\s+)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s*(?:de\s+)?(\d{4})/)
  if (n) { const mes = n[2] === 'marco' ? 3 : MESES.indexOf(n[2]) + 1; c.nasc = n[3] + '-' + String(mes).padStart(2, '0') + '-' + n[1].padStart(2, '0') }
  else if ((n = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/))) c.nasc = n[3] + '-' + n[2].padStart(2, '0') + '-' + n[1].padStart(2, '0')
  return c
}

export default function Entrar({ children, antes }) {
  const [estado, setEstado] = useState('vendo') // vendo | fora | dentro
  const [modo, setModo] = useState('entrar') // entrar | criar — 29/09/2026: começa no ENTRAR (por enquanto só a Dra Lê usa); jogar o botão para o lado vai para o cadastrar
  const [nome, setNome] = useState('')
  const [usuario, setUsuario] = useState('') // o nome escolhido: vira nome@iiiii.boo e nome.iiiii.boo
  const [mexeu, setMexeu] = useState(false)  // a pessoa já escreveu o usuário dela? então não sugere mais
  const [livre, setLivre] = useState('')     // '' | vendo | sim | nao
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('') // repetir a senha (no cadastrar)
  const [ver, setVer] = useState(false)   // o olhinho: mostra ou esconde a senha
  const [etapa, setEtapa] = useState(1)     // cadastrar tem 2 páginas: 1 (nome, umbigo, senha) e 2 (whatsapp, código, e-mail, nascimento ou documento)
  const [whats, setWhats] = useState('')
  const [codigo, setCodigo] = useState('')
  const [emailReal, setEmailReal] = useState('')
  const [nasc, setNasc] = useState('')
  const [doc, setDoc] = useState(null)
  const [gravando, setGravando] = useState(false)
  const gravador = useRef(null), docRef = useRef(null)
  useEffect(() => { if (modo !== 'criar') setEtapa(1); setDentro({}) }, [modo])
  // o botão de gravar: a pessoa fala tudo ("meu aniversário é…, meu e-mail é…, meu whatsapp é…") e a gente transcreve e preenche
  async function grava() {
    if (gravando && gravador.current) return gravador.current.stop()
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(st), pedacos = []
      rec.ondataavailable = e => e.data.size && pedacos.push(e.data)
      rec.onstop = async () => {
        st.getTracks().forEach(t => t.stop()); setGravando(false); setMsg('transcrevendo…')
        try {
          const r = await fetch('/api/transcreve', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: new Blob(pedacos, { type: rec.mimeType || 'audio/webm' }) })
          const j = await r.json(); if (!j.texto) throw 0
          const c = falaParaCampos(j.texto)
          if (c.whats) setWhats(c.whats); if (c.email) setEmailReal(c.email); if (c.nasc) setNasc(c.nasc)
          setMsg(c.whats || c.email || c.nasc ? '' : 'não entendi, tenta de novo')
        } catch (e) { setMsg('não deu para transcrever, tenta de novo') }
      }
      gravador.current = rec; rec.start(); setGravando(true); setMsg('gravando… toque de novo para parar')
    } catch (e) { setMsg('o microfone não abriu') }
  }
  const [dentro, setDentro] = useState({}) // avisos que aparecem escritos dentro das pílulas vazias (em vez de embaixo do botão)
  const [selfie, setSelfie] = useState(null) // a selfie do cadastro (fica guardada quando a conta é criada)
  const joga = useRef(false)              // o botão foi jogado para o lado (não conta como toque)
  const [msg, setMsg] = useState('')
  const [indo, setIndo] = useState(false)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const { data } = await banco.auth.getSession()
        const s = data.session
        if (s && volta) return location.replace('/sso?volta=' + encodeURIComponent(volta))
        const ok = s && (await podeEntrar(s.access_token))
        if (vivo) setEstado(ok ? 'dentro' : 'fora')
      } catch { if (vivo) setEstado('fora') }
    })()
    return () => { vivo = false }
  }, [])

  useEffect(() => {
    if (modo !== 'criar' || usuario.length < 2) { setLivre(''); return }
    setLivre('vendo')
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${SB}/rest/v1/rpc/nome_livre`, {
          method: 'POST', headers: { apikey: PUB, 'Content-Type': 'application/json', 'Content-Profile': 'plataforma' },
          body: JSON.stringify({ nome: usuario }),
        })
        setLivre(r.ok && (await r.json()) === true ? 'sim' : 'nao')
      } catch { setLivre('') }
    }, 350)
    return () => clearTimeout(t)
  }, [usuario, modo])

  async function vai(e) {
    e.preventDefault()
    const digitado = email.trim().toLowerCase()
    const em = modo === 'criar' ? `${usuario}${DOMINIO}` : (digitado.includes('@') ? digitado : digitado ? `${limpa(digitado)}${DOMINIO}` : '')
    // o que faltou aparece escrito dentro da própria pílula (vazia), todas de uma vez
    const falta = {}
    if (modo === 'criar' && etapa === 1) {
      if (!nome.trim()) falta.nome = 'escreva seu nome'
      if (usuario.length < 2) falta.usuario = 'escolha seu umbigo'
      if (!senha) falta.senha = 'crie uma senha'
      else if (senha.length < 6) { falta.senha = 'pelo menos 6 letras ou números'; setSenha(''); setSenha2('') }
      if (!senha2) falta.senha2 = 'repita a senha'
      else if (!falta.senha && senha !== senha2) { falta.senha2 = 'as senhas não estão iguais'; setSenha2('') }
    }
    if (modo === 'entrar') { if (!email.trim()) falta.email = 'seu umbigo'; if (!senha) falta.senha = 'sua senha' }
    if (Object.keys(falta).length) { setDentro(falta); setMsg(''); return }
    setDentro({})
    if (modo === 'criar' && livre !== 'sim') return setMsg('esse nome não está livre, escolha outro')
    if (modo === 'criar' && etapa === 1) { setEtapa(2); setMsg(''); return }
    if (modo === 'criar' && whats.replace(/\D/g, '').length < 10) return setMsg('coloque o seu whatsapp com ddd')
    if (modo === 'criar' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailReal.trim())) return setMsg('coloque o seu e-mail')
    if (modo === 'criar' && !nasc && !doc) return setMsg('coloque a data de nascimento ou a foto de um documento')
    setIndo(true); setMsg(modo === 'criar' ? 'criando a conta…' : 'entrando…')
    try {
      const { data, error } = modo === 'criar'
        ? await banco.auth.signUp({ email: em, password: senha, options: { data: { nome: nome.trim(), usuario, whatsapp: whats.replace(/\D/g, ''), email_contato: emailReal.trim().toLowerCase(), nascimento: nasc || null } } })
        : await banco.auth.signInWithPassword({ email: em, password: senha })
      if (error) throw modo === 'criar' ? (/registered|exists/i.test(error.message) ? 'esse e-mail já tem conta: é só entrar' : 'não deu para criar a conta') : 'e-mail ou senha errada'
      const s = data.session
      if (!s?.access_token) { setModo('entrar'); setSenha(''); throw 'conta criada. confirme no seu e-mail e depois entre aqui' }
      if (modo === 'criar') await banco.schema('plataforma').rpc('guardar_nome', { nome: usuario, apelido: nome.trim() }).then(() => {}, () => {})
      // a foto do documento (se ela mandou) vai para a pasta dela no bucket
      if (modo === 'criar' && doc) { try { await banco.storage.from(BUCKET).upload(s.user.id + '/documento-' + Date.now() + '.jpg', doc, { upsert: true, contentType: doc.type || 'image/jpeg' }) } catch (e) {} }
      // a selfie do cadastro: vai para a pasta da pessoa no bucket e entra na lista de carinhas (que aparece no entrar)
      if (modo === 'criar' && selfie && selfie.file) {
        try {
          const uid = s.user.id, caminho = uid + '/rosto-' + Date.now() + '.jpg'
          const up = await banco.storage.from(BUCKET).upload(caminho, selfie.file, { upsert: true, contentType: selfie.file.type || 'image/jpeg' })
          if (!up.error) { const url = banco.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl; await banco.from('rostos').upsert({ dono: uid, url, criado: new Date().toISOString() }) }
        } catch (e) {}
      }
      if (modo === 'criar') return location.replace('/carteirinha/') // completou o cadastro: vai para a carteirinha do clube
      if (volta) return location.replace('/sso?volta=' + encodeURIComponent(volta))
      if (!(await podeEntrar(s.access_token))) throw 'sua conta ainda não tem acesso a este site'
      setEstado('dentro')
    } catch (err) {
      setMsg(typeof err === 'string' ? err : 'sem conexão, tenta de novo')
    } finally { setIndo(false) }
  }

  if (estado === 'dentro') return children
  if (estado === 'vendo') return antes ?? null

  const [primeiro, ...sobrenome] = nome.trim().split(/\s+/)
  const resto = sobrenome.join(' ')
  const dica = { fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', margin: '-2px 4px 8px' }
  const rotulo = { fontSize: 12, fontWeight: 800, color: 'var(--acc-texto, #F48591)', margin: '0 4px 7px', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center' }
  const FUNDO = 'var(--caixa-letra, #FFFBF3)' // a letra dentro das pílulas coloridas (branco lele; preto nas cores claras)
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.form data-modo={modo} onSubmit={vai} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, padding: '80px 32px 52px', borderRadius: 40, transition: 'background .35s ease', fontFamily: "'Scota', sans-serif", fontWeight: 400, background: 'var(--cartao, linear-gradient(145deg,#edf1fc,#dde4f5))', boxShadow: 'var(--raise)' }}>
        {/* o nome de quem está se cadastrando, no lugar do nome da Kamilla: vai aparecendo enquanto a pessoa escreve */}
        {/* a caixinha do VIDS: um squircle só; cada toque troca a letra de SQUIRCLES (e ele se arrasta e volta com mola) */}
        <LogoComPonto modo={modo} />
        {/* a pílula de cima saiu: para trocar entre cadastrar e entrar vai ter outro pontinho (a Dra Lê vai dizer onde) */}
        {modo === 'criar' && etapa === 1 && (<>
          <div className="rotulo-bern" style={rotulo}>nome</div>
          <div className="field" style={{ marginBottom: 9 }}><input autoComplete="name" placeholder={dentro.nome || ''} value={nome} onChange={e => { setDentro(d => ({ ...d, nome: '' })); setNome(e.target.value); if (!mexeu) setUsuario(limpa(e.target.value.trim().split(/\s+/)[0])) }} /></div>
          <div className="rotulo-bern" style={rotulo}>umbigo</div>
          <div className="field" style={{ marginBottom: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <input autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder={dentro.usuario || ''} value={usuario} onChange={e => { setDentro(d => ({ ...d, usuario: '' })); setMexeu(true); setUsuario(limpa(e.target.value)) }} style={{ flex: 1, minWidth: 0, textAlign: 'center' }} />
            
          </div>
          {livre === 'nao' && <div style={{ ...dica, margin: '0 4px 16px', minHeight: 16, color: livre === 'sim' ? '#8DA599' : livre === 'nao' ? 'var(--acc-texto, #F48591)' : 'var(--ink-faint)' }}>
            {livre === 'nao' ? 'esse nome já tem dono' : ''}
          </div>}
        </>)}
        {modo === 'entrar' && (<>
          <div className="rotulo-bern" style={rotulo}>umbigo</div>
          <div className="field" style={{ marginBottom: 16 }}><input type="text" inputMode="email" autoCapitalize="none" spellCheck={false} autoComplete="username" aria-label="e-mail" placeholder={dentro.email || ''} value={email} onChange={e => { setDentro(d => ({ ...d, email: '' })); setEmail(e.target.value) }} /></div>
        </>)}
        {modo === 'criar' && etapa === 2 && (<>
          {/* a segunda (e última) página do cadastro */}
          <div className="rotulo-bern" style={rotulo}>whatsapp</div>
          <div className="field" style={{ marginBottom: 9 }}><input type="tel" inputMode="tel" autoComplete="tel" aria-label="whatsapp" value={whats} onChange={e => setWhats(e.target.value)} /></div>
          <div className="rotulo-bern" style={rotulo}>código</div>
          <div className="field" style={{ marginBottom: 9 }}><input inputMode="numeric" autoComplete="one-time-code" aria-label="código" value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} /></div>
          <div className="rotulo-bern" style={rotulo}>e-mail</div>
          <div className="field" style={{ marginBottom: 9 }}><input type="email" inputMode="email" autoCapitalize="none" autoComplete="email" aria-label="e-mail" value={emailReal} onChange={e => setEmailReal(e.target.value)} /></div>
          <div className="rotulo-bern" style={rotulo}>nascimento</div>
          <div className="field" style={{ marginBottom: 18 }}><input type="date" aria-label="nascimento" value={nasc} onChange={e => setNasc(e.target.value)} /></div>
          <input ref={docRef} type="file" accept="image/*" capture="environment" hidden onChange={e => { const f = e.target.files && e.target.files[0]; if (f) setDoc(f); e.target.value = '' }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 30 }}>
            <Bolinha rotulo="documento" feito={!!doc} onClick={() => docRef.current && docRef.current.click()}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.6" /></Bolinha>
            <Bolinha rotulo={gravando ? 'parar' : 'gravar'} feito={gravando} onClick={grava}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Bolinha>
          </div>
        </>)}
        {!(modo === 'criar' && etapa === 2) && <div className="rotulo-bern" style={rotulo}>senha</div>}
        {!(modo === 'criar' && etapa === 2) && <div className="field" style={{ marginBottom: modo === 'criar' ? 9 : 40, position: 'relative' }}><input type={ver ? 'text' : 'password'} aria-label="senha" autoComplete={modo === 'criar' ? 'new-password' : 'current-password'} placeholder={dentro.senha || ''} value={senha} onChange={e => { setDentro(d => ({ ...d, senha: '' })); setSenha(e.target.value) }} /><Olhinho ver={ver} troca={() => setVer(v => !v)} /></div>}
        {modo === 'criar' && etapa === 1 && <div className="rotulo-bern" style={rotulo}>repetir senha</div>}
        {modo === 'criar' && etapa === 1 && <div className="field" style={{ marginBottom: 32, position: 'relative' }}><input type={ver ? 'text' : 'password'} aria-label="repetir senha" autoComplete="new-password" placeholder={dentro.senha2 || ''} value={senha2} onChange={e => { setDentro(d => ({ ...d, senha2: '' })); setSenha2(e.target.value) }} /><Olhinho ver={ver} troca={() => setVer(v => !v)} /></div>}
        <motion.button type="submit" className="pilula-bern" disabled={indo} whileTap={{ scale: .97 }}
          key={modo} initial={{ x: modo === 'criar' ? -260 : 260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          drag="x" dragSnapToOrigin dragElastic={0.7}
          onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 90) { joga.current = true; setModo(m => m === 'criar' ? 'entrar' : 'criar'); setMsg('') } }}
          onClickCapture={e => { if (joga.current) { e.preventDefault(); e.stopPropagation(); joga.current = false } }}
          style={{ width: '100%', height: 'calc(var(--pilula) + 10px)', padding: 0, borderRadius: 999, touchAction: 'pan-y', cursor: 'grab', background: 'var(--caixa, #F48591)', color: FUNDO, fontWeight: 800, fontSize: 20, textTransform: 'uppercase', letterSpacing: 2, boxShadow: 'var(--raise-sm)', opacity: indo ? .7 : 1 }}>
          {modo === 'criar' ? (etapa === 2 ? 'enviar' : 'cadastrar') : 'entrar'}
        </motion.button>
        <div role="status" style={{ minHeight: 0, marginTop: 14, textAlign: 'center', color: 'var(--acc-texto, #F48591)', fontWeight: 700, fontSize: 13 }}>{msg}</div>
        <div style={{ marginTop: 4, textAlign: 'center', color: 'var(--acc-texto, #F48591)', fontWeight: 700, fontSize: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: .5 }}><Cadeado /> seus dados estão seguros</div>
      </motion.form>
    </div>
  )
}

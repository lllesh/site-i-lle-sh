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
function pintaFundo(c, invertido) {
  const r = document.documentElement.style, CLARO = '#FFFBF3'
  const fundo = invertido ? '' : c
  // o fundo vai no body e no html (cor sólida), para não aparecer branco quando a página é puxada para cima
  document.body.style.background = fundo || ''; document.documentElement.style.background = fundo || '#e5ebf9'
  r.setProperty('--cartao', invertido ? c : 'linear-gradient(145deg,#edf1fc,#dde4f5)')
  r.setProperty('--campo', invertido ? 'color-mix(in srgb, ' + c + ' 94%, #000)' : '#e0e7f6')
  r.setProperty('--inset', invertido ? 'inset 4px 4px 9px rgba(0,0,0,.09), inset -4px -4px 9px rgba(255,255,255,.28)' : 'inset 6px 6px 12px rgba(165,181,222,.6), inset -6px -6px 12px rgba(255,255,255,.95)')
  r.setProperty('--caixa', invertido ? CLARO : c)        // o que é preenchido (quadradinho, botão)
  r.setProperty('--caixa-letra', invertido ? c : CLARO)  // a letra dentro do que é preenchido
  r.setProperty('--acc-texto', invertido ? CLARO : c)    // os textos em cima do cartão
  let m = document.querySelector('meta[name="theme-color"]'); if (m) m.remove()
  if (fundo) { m = document.createElement('meta'); m.name = 'theme-color'; m.content = fundo; document.head.appendChild(m) }
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
      {modo === 'entrar' && <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: 250, height: 250, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,251,243,1) 38%, rgba(255,251,243,.6) 62%, rgba(255,251,243,0))', pointerEvents: 'none', zIndex: 0 }} />}
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

export default function Entrar({ children, antes }) {
  const [estado, setEstado] = useState('vendo') // vendo | fora | dentro
  const [modo, setModo] = useState('criar') // entrar | criar — começa no cadastrar (ainda ninguém tem cadastro)
  const [nome, setNome] = useState('')
  const [usuario, setUsuario] = useState('') // o nome escolhido: vira nome@iiiii.boo e nome.iiiii.boo
  const [mexeu, setMexeu] = useState(false)  // a pessoa já escreveu o usuário dela? então não sugere mais
  const [livre, setLivre] = useState('')     // '' | vendo | sim | nao
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('') // repetir a senha (no cadastrar)
  const [ver, setVer] = useState(false)   // o olhinho: mostra ou esconde a senha
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
    if (modo === 'criar' && !nome.trim()) return setMsg('escreva como te chamam')
    if (modo === 'criar' && usuario.length < 2) return setMsg('escolha o seu nome de usuário')
    if (modo === 'criar' && livre !== 'sim') return setMsg('esse nome não está livre, escolha outro')
    if (!em || !senha) return setMsg(modo === 'criar' ? 'crie uma senha' : 'preencha o e-mail e a senha')
    if (modo === 'criar' && senha.length < 6) return setMsg('a senha precisa de pelo menos 6 letras ou números')
    if (modo === 'criar' && senha !== senha2) return setMsg('as senhas não estão iguais')
    setIndo(true); setMsg(modo === 'criar' ? 'criando a conta…' : 'entrando…')
    try {
      const { data, error } = modo === 'criar'
        ? await banco.auth.signUp({ email: em, password: senha, options: { data: { nome: nome.trim(), usuario } } })
        : await banco.auth.signInWithPassword({ email: em, password: senha })
      if (error) throw modo === 'criar' ? (/registered|exists/i.test(error.message) ? 'esse e-mail já tem conta: é só entrar' : 'não deu para criar a conta') : 'e-mail ou senha errada'
      const s = data.session
      if (!s?.access_token) { setModo('entrar'); setSenha(''); throw 'conta criada. confirme no seu e-mail e depois entre aqui' }
      if (modo === 'criar') await banco.schema('plataforma').rpc('guardar_nome', { nome: usuario, apelido: nome.trim() }).then(() => {}, () => {})
      // a selfie do cadastro: vai para a pasta da pessoa no bucket e entra na lista de carinhas (que aparece no entrar)
      if (modo === 'criar' && selfie && selfie.file) {
        try {
          const uid = s.user.id, caminho = uid + '/rosto-' + Date.now() + '.jpg'
          const up = await banco.storage.from(BUCKET).upload(caminho, selfie.file, { upsert: true, contentType: selfie.file.type || 'image/jpeg' })
          if (!up.error) { const url = banco.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl; await banco.from('rostos').upsert({ dono: uid, url, criado: new Date().toISOString() }) }
        } catch (e) {}
      }
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
        <Caixinha modo={modo} selfie={selfie} setSelfie={setSelfie} />
        {/* a pílula de cima saiu: para trocar entre cadastrar e entrar vai ter outro pontinho (a Dra Lê vai dizer onde) */}
        {modo === 'criar' && (<>
          <div className="rotulo-bern" style={rotulo}>nome</div>
          <div className="field" style={{ marginBottom: 9 }}><input autoComplete="name" value={nome} onChange={e => { setNome(e.target.value); if (!mexeu) setUsuario(limpa(e.target.value.trim().split(/\s+/)[0])) }} /></div>
          <div className="rotulo-bern" style={rotulo}>umbigo</div>
          <div className="field" style={{ marginBottom: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <input autoComplete="off" autoCapitalize="none" spellCheck={false} value={usuario} onChange={e => { setMexeu(true); setUsuario(limpa(e.target.value)) }} style={{ flex: 1, minWidth: 0, textAlign: 'center' }} />
            
          </div>
          {livre === 'nao' && <div style={{ ...dica, margin: '0 4px 16px', minHeight: 16, color: livre === 'sim' ? '#8DA599' : livre === 'nao' ? 'var(--acc-texto, #F48591)' : 'var(--ink-faint)' }}>
            {livre === 'nao' ? 'esse nome já tem dono' : ''}
          </div>}
        </>)}
        {modo === 'entrar' && (<>
          <div className="rotulo-bern" style={rotulo}>umbigo</div>
          <div className="field" style={{ marginBottom: 16 }}><input type="text" inputMode="email" autoCapitalize="none" spellCheck={false} autoComplete="username" aria-label="e-mail" value={email} onChange={e => setEmail(e.target.value)} /></div>
        </>)}
        <div className="rotulo-bern" style={rotulo}>senha</div>
        <div className="field" style={{ marginBottom: modo === 'criar' ? 9 : 58, position: 'relative' }}><input type={ver ? 'text' : 'password'} aria-label="senha" autoComplete={modo === 'criar' ? 'new-password' : 'current-password'} value={senha} onChange={e => setSenha(e.target.value)} /><Olhinho ver={ver} troca={() => setVer(v => !v)} /></div>
        {modo === 'criar' && <div className="rotulo-bern" style={rotulo}>repetir senha</div>}
        {modo === 'criar' && <div className="field" style={{ marginBottom: 32, position: 'relative' }}><input type={ver ? 'text' : 'password'} aria-label="repetir senha" autoComplete="new-password" value={senha2} onChange={e => setSenha2(e.target.value)} /><Olhinho ver={ver} troca={() => setVer(v => !v)} /></div>}
        <motion.button type="submit" className="pilula-bern" disabled={indo} whileTap={{ scale: .97 }}
          key={modo} initial={{ x: modo === 'criar' ? -260 : 260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          drag="x" dragSnapToOrigin dragElastic={0.7}
          onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 90) { joga.current = true; setModo(m => m === 'criar' ? 'entrar' : 'criar'); setMsg('') } }}
          onClickCapture={e => { if (joga.current) { e.preventDefault(); e.stopPropagation(); joga.current = false } }}
          style={{ width: '100%', height: 'calc(var(--pilula) + 10px)', padding: 0, borderRadius: 999, touchAction: 'pan-y', cursor: 'grab', background: 'var(--caixa, #F48591)', color: FUNDO, fontWeight: 800, fontSize: 20, textTransform: 'uppercase', letterSpacing: 2, boxShadow: 'var(--raise-sm)', opacity: indo ? .7 : 1 }}>
          {modo === 'criar' ? 'cadastrar' : 'entrar'}
        </motion.button>
        <div role="status" style={{ minHeight: 0, marginTop: 14, textAlign: 'center', color: '#C18EA9', fontWeight: 700, fontSize: 13 }}>{msg}</div>
        <div style={{ marginTop: 4, textAlign: 'center', color: 'var(--acc-texto, #F48591)', fontWeight: 700, fontSize: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: .5 }}><Cadeado /> seus dados estão seguros</div>
      </motion.form>
    </div>
  )
}

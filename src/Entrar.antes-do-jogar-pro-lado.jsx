/* A PÁGINA DE ENTRAR (modelo da plataforma): e-mail + senha, com "criar conta".
   Sem Google, sem link por e-mail. Conta no "i m b i g o" (Supabase gqeipjiidtrcbmnrnknc), pelo cliente do próprio site (banco.js).
   Depois de entrar, confere o plano deste site (plataforma.pode_entrar): hoje todo site
   pede Platinum e ninguém tem — só a dona (le@umbii.boo) passa. */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { banco } from './banco.js'

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
function pintaFundo(c) {
  document.body.style.background = c || ''; document.documentElement.style.background = c || ''
  // o quadradinho troca de cor junto com o fundo (no fundo original ele fica rosa); nas cores claras a letra fica preta
  const r = document.documentElement.style
  r.setProperty('--caixa', c || '#F48591'); r.setProperty('--acc-texto', c || '#F48591'); r.setProperty('--caixa-letra', '#FFFBF3') // as letras são sempre brancas (lele)
  let m = document.querySelector('meta[name="theme-color"]'); if (m) m.remove()
  if (c) { m = document.createElement('meta'); m.name = 'theme-color'; m.content = c; document.head.appendChild(m) }
}
function Caixinha() {
  const [i, setI] = useState(0)
  useEffect(() => { pintaFundo(COR_DA_LETRA[LETRAS_SQ[i]]) }, [i])
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
      <motion.button type="button" aria-label="squircles" onClick={() => setI(n => (n + 1) % LETRAS_SQ.length)}
        drag dragSnapToOrigin dragElastic={0.6} whileTap={{ scale: 1.25 }} whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="titulo-sq" style={{ padding: 0, border: 0, background: 'none', cursor: 'grab', touchAction: 'none', fontSize: 80 }}>
        <motion.span key={i} initial={{ scale: .4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14 }}>{LETRAS_SQ[i]}</motion.span>
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
      <motion.form onSubmit={vai} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, padding: '80px 32px 52px', borderRadius: 40, fontFamily: "'Scota', sans-serif", fontWeight: 400, background: 'linear-gradient(145deg,#edf1fc,#dde4f5)', boxShadow: 'var(--raise)' }}>
        {/* o nome de quem está se cadastrando, no lugar do nome da Kamilla: vai aparecendo enquanto a pessoa escreve */}
        {/* a caixinha do VIDS: um squircle só; cada toque troca a letra de SQUIRCLES (e ele se arrasta e volta com mola) */}
        <Caixinha />
        {/* a pílula de cima saiu: para trocar entre cadastrar e entrar vai ter outro pontinho (a Dra Lê vai dizer onde) */}
        {modo === 'criar' && (<>
          <div className="rotulo-bern" style={rotulo}>nome</div>
          <div className="field" style={{ marginBottom: 9 }}><input autoComplete="name" value={nome} onChange={e => { setNome(e.target.value); if (!mexeu) setUsuario(limpa(e.target.value.trim().split(/\s+/)[0])) }} /></div>
          <div className="rotulo-bern" style={rotulo}>usuário</div>
          <div className="field" style={{ marginBottom: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <input autoComplete="off" autoCapitalize="none" spellCheck={false} value={usuario} onChange={e => { setMexeu(true); setUsuario(limpa(e.target.value)) }} style={{ flex: 1, minWidth: 0, textAlign: 'center' }} />
            
          </div>
          {livre === 'nao' && <div style={{ ...dica, margin: '0 4px 16px', minHeight: 16, color: livre === 'sim' ? '#8DA599' : livre === 'nao' ? 'var(--acc-texto, #F48591)' : 'var(--ink-faint)' }}>
            {livre === 'nao' ? 'esse nome já tem dono' : ''}
          </div>}
        </>)}
        {modo === 'entrar' && (<>
          <div className="field" style={{ marginBottom: 9 }}><input type="text" inputMode="email" autoCapitalize="none" spellCheck={false} autoComplete="username" aria-label="e-mail" value={email} onChange={e => setEmail(e.target.value)} /></div>
        </>)}
        {modo === 'criar' && <div className="rotulo-bern" style={rotulo}>senha</div>}
        <div className="field" style={{ marginBottom: modo === 'criar' ? 9 : 18, position: 'relative' }}><input type={ver ? 'text' : 'password'} aria-label="senha" autoComplete={modo === 'criar' ? 'new-password' : 'current-password'} value={senha} onChange={e => setSenha(e.target.value)} /><Olhinho ver={ver} troca={() => setVer(v => !v)} /></div>
        {modo === 'criar' && <div className="rotulo-bern" style={rotulo}>repetir senha</div>}
        {modo === 'criar' && <div className="field" style={{ marginBottom: 32, position: 'relative' }}><input type={ver ? 'text' : 'password'} aria-label="repetir senha" autoComplete="new-password" value={senha2} onChange={e => setSenha2(e.target.value)} /><Olhinho ver={ver} troca={() => setVer(v => !v)} /></div>}
        <motion.button type="submit" className="pilula-bern" disabled={indo} whileTap={{ scale: .97 }}
          style={{ width: '100%', height: 'calc(var(--pilula) + 10px)', padding: 0, borderRadius: 999, background: 'var(--caixa, #F48591)', color: FUNDO, fontWeight: 800, fontSize: 20, textTransform: 'uppercase', letterSpacing: 2, boxShadow: 'var(--raise-sm)', opacity: indo ? .7 : 1 }}>
          {modo === 'criar' ? 'cadastrar' : 'entrar'}
        </motion.button>
        <div role="status" style={{ minHeight: 0, marginTop: 14, textAlign: 'center', color: '#C18EA9', fontWeight: 700, fontSize: 13 }}>{msg}</div>
        <div style={{ marginTop: 4, textAlign: 'center', color: 'var(--acc-texto, #F48591)', fontWeight: 700, fontSize: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: .5 }}><Cadeado /> seus dados estão seguros</div>
      </motion.form>
    </div>
  )
}

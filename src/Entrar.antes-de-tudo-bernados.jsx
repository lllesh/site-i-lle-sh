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
export default function Entrar({ children, antes }) {
  const [estado, setEstado] = useState('vendo') // vendo | fora | dentro
  const [modo, setModo] = useState('entrar') // entrar | criar
  const [nome, setNome] = useState('')
  const [usuario, setUsuario] = useState('') // o nome escolhido: vira nome@iiiii.boo e nome.iiiii.boo
  const [mexeu, setMexeu] = useState(false)  // a pessoa já escreveu o usuário dela? então não sugere mais
  const [livre, setLivre] = useState('')     // '' | vendo | sim | nao
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
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
  const rotulo = { fontSize: 12, fontWeight: 800, color: '#F48591', margin: '0 4px 9px', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center' }
  const FUNDO = '#FFFBF3' // o branco lele: a cor da letra dentro das pílulas cor-de-rosa
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.form onSubmit={vai} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, padding: '64px 36px 40px', borderRadius: 40, background: 'linear-gradient(145deg,#edf1fc,#dde4f5)', boxShadow: 'var(--raise)' }}>
        {/* o nome de quem está se cadastrando, no lugar do nome da Kamilla: vai aparecendo enquanto a pessoa escreve */}
        {/* SQUIRCLES escrito como no VIDS: uma letra em cada squircle */}
        <div className="titulo-sq" aria-label="squircles" style={{ marginBottom: 58 }}>{'SQUIRCLES'.split('').map((l, i) => <span key={i}>{l}</span>)}</div>
        {/* abas: criar conta | entrar (molde: cadastro-wish) */}
        <div style={{ display: 'flex', gap: 6, padding: 6, height: 'var(--pilula)', marginBottom: 26, borderRadius: 999, background: '#e0e7f6', boxShadow: 'var(--inset)' }}>
          {[['criar', 'cadastrar'], ['entrar', 'entrar']].map(([m, t]) => (
            <button key={m} type="button" onClick={() => { setModo(m); setMsg('') }}
              style={{ flex: 1, padding: 0, borderRadius: 999, fontWeight: 800, fontSize: 13, letterSpacing: .5, color: modo === m ? FUNDO : '#F48591', background: modo === m ? '#F48591' : 'transparent', boxShadow: modo === m ? 'var(--raise-sm)' : 'none', transition: 'all .2s ease' }}>{t}</button>
          ))}
        </div>
        {modo === 'criar' && (<>
          <div style={rotulo}>nome</div>
          <div className="field" style={{ marginBottom: 14 }}><input autoComplete="name" value={nome} onChange={e => { setNome(e.target.value); if (!mexeu) setUsuario(limpa(e.target.value.trim().split(/\s+/)[0])) }} /></div>
          <div style={rotulo}>usuário</div>
          <div className="field" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <input autoComplete="off" autoCapitalize="none" spellCheck={false} value={usuario} onChange={e => { setMexeu(true); setUsuario(limpa(e.target.value)) }} style={{ flex: 1, minWidth: 0 }} />
            <span style={{ color: '#F48591', fontWeight: 700, whiteSpace: 'nowrap', textTransform: 'lowercase' }}>{DOMINIO}</span>
          </div>
          <div style={{ ...dica, margin: '0 4px 16px', minHeight: 16, color: livre === 'sim' ? '#8DA599' : livre === 'nao' ? '#F48591' : 'var(--ink-faint)' }}>
            {livre === 'nao' ? 'esse nome já tem dono' : ''}
          </div>
        </>)}
        {modo === 'entrar' && (<>
          <div className="field" style={{ marginBottom: 26 }}><input type="text" inputMode="email" autoCapitalize="none" spellCheck={false} autoComplete="username" aria-label="e-mail" value={email} onChange={e => setEmail(e.target.value)} /></div>
        </>)}
        {modo === 'criar' && <div style={rotulo}>senha</div>}
        <div className="field" style={{ marginBottom: 36 }}><input type="password" aria-label="senha" autoComplete={modo === 'criar' ? 'new-password' : 'current-password'} value={senha} onChange={e => setSenha(e.target.value)} /></div>
        <motion.button type="submit" disabled={indo} whileTap={{ scale: .97 }}
          style={{ width: '100%', height: 'var(--pilula)', padding: 0, borderRadius: 999, background: '#F48591', color: FUNDO, fontWeight: 800, fontSize: 16, textTransform: 'uppercase', letterSpacing: 2, boxShadow: '6px 8px 22px rgba(244,133,145,.5)', opacity: indo ? .7 : 1 }}>
          {modo === 'criar' ? 'cadastrar' : 'entrar'}
        </motion.button>
        <div role="status" style={{ minHeight: 0, marginTop: 14, textAlign: 'center', color: '#C18EA9', fontWeight: 700, fontSize: 13 }}>{msg}</div>
        <div style={{ marginTop: 4, textAlign: 'center', color: 'var(--ink-faint)', fontWeight: 700, fontSize: 11.5 }}>🔒 seus dados ficam seguros</div>
      </motion.form>
    </div>
  )
}

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon, Avatar, raiseSm } from './ui.jsx'
import { Store, useStore, money, monthTotals } from './store.jsx'
import Entrar, { sair } from './Entrar.jsx'
import { partesDoNome } from './banco.js'
import { Inicio, Transacoes, Cartoes, Estatisticas, Agenda, Perfil, Leticia, Kamilla, AddModal } from './pages.jsx'

/* ---------- nav ---------- */
const NAV = [
  { id: 'inicio', name: 'Início', icon: 'home', color: '#F48591' },
  { id: 'transacoes', name: 'Transações', icon: 'card', color: '#FA8D85' },
  { id: 'cartoes', name: 'Cartões', icon: 'bag', color: '#FEA283' },
  { id: 'estatisticas', name: 'Estatísticas', icon: 'chart', color: '#FFB872' },
  { id: 'agenda', name: 'Agenda', icon: 'calendar', color: '#8DA599' },
  { id: 'perfil', name: 'Perfil', icon: 'user', color: '#8D96C1' },
  { id: 'leticia', name: 'Letícia', icon: 'card', color: '#C18EA9' },
  { id: 'kamilla', name: 'Kamilla', icon: 'bag', color: '#5AD0D6' },
]

/* ---------- label that stretches to always end at the same right edge ---------- */
function JustifyLabel({ children }) {
  const wrapRef = useRef(null)
  const textRef = useRef(null)
  const [ls, setLs] = useState(0)
  useLayoutEffect(() => {
    const wrap = wrapRef.current, txt = textRef.current
    if (!wrap || !txt) return
    txt.style.letterSpacing = '0px'
    const natural = txt.getBoundingClientRect().width
    const avail = wrap.getBoundingClientRect().width
    const chars = String(children).length
    setLs(chars > 1 ? (avail - natural) / chars : 0)
  }, [children])
  return (
    <span ref={wrapRef} style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}>
      <span ref={textRef} style={{ letterSpacing: ls, display: 'inline-block' }}>{children}</span>
    </span>
  )
}

/* ---------- splash loader ---------- */
function Loader({ done }) {
  const { profile } = useStore()
  const [nome1, nome2] = partesDoNome(profile.name)
  return (
    <motion.div initial={{ opacity: 1 }} animate={{ opacity: done ? 0 : 1 }} transition={{ duration: .55 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,#eef2ff,#dfe7ff)', pointerEvents: done ? 'none' : 'all' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          style={{ width: 88, height: 88, margin: '0 auto 40px', borderRadius: '50%', background: 'conic-gradient(from 0deg,#7b8cf4,#46d6a6,#ff9bb3,#ffd86b,#7b8cf4)', padding: 10 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#eef2ff' }} />
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0, padding: '20px 24px', borderRadius: 999, ...raiseSm(999) }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '.5px', lineHeight: 1, textTransform: 'lowercase' }}>{nome1}</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2.5, color: 'var(--ink-faint)', marginTop: 5, textTransform: 'uppercase' }}>{nome2}</div>
        </div>
      </div>
    </motion.div>
  )
}


/* ---------- sidebar ---------- */
function Sidebar({ route, go, open, onClose }) {
  const { tx, profile } = useStore()
  const [nome1, nome2] = partesDoNome(profile.name)
  const m = monthTotals(tx)
  return (
    <>
      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="scrim" />}
      </AnimatePresence>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0, padding: '20px 24px', borderRadius: 999, marginBottom: 48, ...raiseSm(999) }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '.5px', lineHeight: 1, textTransform: 'lowercase' }}>{nome1}</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2.5, color: 'var(--ink-faint)', marginTop: 5, textTransform: 'uppercase' }}>{nome2}</div>
        </div>

        <div style={{ padding: 16, borderRadius: 999, marginBottom: 22, color: '#fff', textAlign: 'center', background: 'linear-gradient(135deg,#8a8df6,#6c70ef)', boxShadow: '6px 8px 22px rgba(108,112,239,.4)' }}>
          <div style={{ fontSize: 11.5, opacity: .9, fontWeight: 700, letterSpacing: 2.5 }}>Saldo do mês</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{money(m.balance)}</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {NAV.map(n => {
            const on = n.id === route
            return (
              <motion.button key={n.id} whileHover={{ scale: 1.1, y: -10 }} whileTap={{ scale: .95, y: -2 }} transition={{ type: 'spring', stiffness: 420, damping: 14 }} onClick={() => { go(n.id); onClose() }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, padding: '15px 34px 15px 32px', borderRadius: 999, textAlign: 'left', fontWeight: 800, fontSize: 16,
                  background: n.color, color: '#fff',
                  boxShadow: on ? `0 0 18px 2px rgba(255,255,255,.55), 0 0 26px 6px ${n.color}bb, 0 0 50px 16px ${n.color}66, 6px 8px 20px ${n.color}99` : `4px 5px 14px ${n.color}55` }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 10, color: '#fff', background: 'rgba(255,255,255,.18)', flex: '0 0 auto' }}>
                  <Icon name={n.icon} size={18} />
                </span>
                <JustifyLabel>{n.id === 'kamilla' ? (partesDoNome(profile.name)[0] || n.name) : n.name}</JustifyLabel>
              </motion.button>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 11, padding: '14px 8px 4px' }}>
          <Avatar name={profile.name} size={38} grad={['#3dd68c', '#8fd0ff']} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'none' }}>{profile.name}</div>
            <div style={{ fontSize: 8, color: 'var(--ink-faint)', fontWeight: 700, letterSpacing: 2.5, marginTop: 6 }}>{profile.role}</div>
          </div>
        </div>
        <button type="button" onClick={sair}
          style={{ margin: '14px 8px 4px', padding: '11px 0', borderRadius: 999, fontWeight: 800, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--ink-soft)', boxShadow: 'var(--raise-sm)', background: 'linear-gradient(145deg,#f3f6fe,#e3e9f8)' }}>sair</button>
      </aside>
    </>
  )
}

/* ---------- app shell ---------- */
function Shell() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'inicio')
  const [menu, setMenu] = useState(false)
  const [add, setAdd] = useState(null) // 'tx' | 'card' | 'event'
  const skip = new URLSearchParams(window.location.search).has('skipsplash')
  const [loaded, setLoaded] = useState(skip)
  const [authed, setAuthed] = useState(() => { try { return sessionStorage.getItem('ka-lello-auth') === '1' } catch { return false } })

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || 'inicio')
    window.addEventListener('hashchange', onHash)
    const onKey = e => { if (e.key === 'Escape') { setMenu(false); setAdd(null) } }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => setLoaded(true), 1400)
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [])

  const go = id => { window.location.hash = id; setRoute(id); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const enter = () => { try { sessionStorage.setItem('ka-lello-auth', '1') } catch { /* ignore */ } setAuthed(true) }
  const openAdd = { inicio: 'tx', transacoes: 'tx', cartoes: 'card', agenda: 'event', estatisticas: 'tx', perfil: 'tx', leticia: 'leticiaTx', kamilla: 'kamillaCompra' }[route] || 'tx'


  const props = { onMenu: () => setMenu(true), go, openAdd: () => setAdd(openAdd) }
  const PAGES = {
    inicio: <Inicio {...props} />,
    transacoes: <Transacoes {...props} />,
    cartoes: <Cartoes {...props} />,
    estatisticas: <Estatisticas {...props} />,
    agenda: <Agenda {...props} />,
    perfil: <Perfil {...props} />,
    leticia: <Leticia {...props} />,
    kamilla: <Kamilla {...props} />,
  }

  return (
    <>
      {!skip && <Loader done={loaded} />}
      <div className="shell">
        <Sidebar route={route} go={go} open={menu} onClose={() => setMenu(false)} />
        <main className="main">
          <AnimatePresence mode="wait">
            <motion.div key={route} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35 }}>
              {PAGES[route] || PAGES.inicio}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>{add && <AddModal key={add} kind={add} onClose={() => setAdd(null)} />}</AnimatePresence>
    </>
  )
}

export default function App() {
  // a página de entrar (e-mail + senha, criar conta) vem antes de tudo; os dados carregam depois de entrar
  // enquanto confere o login: só o fundo lilás, sem nome de ninguém
  return <Entrar antes={<div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg,#eef2ff,#dfe7ff)' }} />}><Store><Shell /></Store></Entrar>
}

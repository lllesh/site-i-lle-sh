import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Screen, Avatar, Icon, IconBtn, Pill, Chip, Donut, Bars, raise, raiseSm, inset, glow } from './ui.jsx'
import { useStore, CATS, catOf, money, totals, monthTotals, sameMonth, fmtDay } from './store.jsx'

/* ---------- motion ---------- */
const stagger = { animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }
const up = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }
const Up = ({ children, style, ...r }) => <motion.div variants={up} style={style} {...r}>{children}</motion.div>
const Page = ({ children }) => (
  <motion.div className="content" variants={stagger} initial="initial" animate="animate">{children}</motion.div>
)
const btn = {
  width: '100%', padding: '16px', borderRadius: 999, background: 'linear-gradient(135deg,#F48591,#F48591)',
  color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: 2, boxShadow: '6px 8px 22px rgba(244,133,145,.5), inset 0 2px 6px rgba(255,255,255,.35)',
}
const ctaBtn = {
  padding: '13px 20px', borderRadius: 999, background: 'linear-gradient(135deg,#F48591,#F48591)',
  color: '#fff', fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap',
  boxShadow: '5px 6px 16px rgba(244,133,145,.45), inset 0 2px 5px rgba(255,255,255,.3)',
}
const ghostBtn = {
  width: '100%', padding: '16px 18px', borderRadius: 28, color: 'var(--violet)', fontWeight: 800, fontSize: 13.5,
  background: 'linear-gradient(145deg,#edf1fc,#dde4f5)', boxShadow: 'var(--raise-sm)',
}

/* ---------- page header ---------- */
function PageHead({ title, sub, onMenu, right, lowerTitle = false }) {
  return (
    <Up style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
      <button className="burger" onClick={onMenu} aria-label="menu"><Icon name="more" size={22} /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 14, fontWeight: 800, letterSpacing: 5, margin: 0, lineHeight: 1, textTransform: lowerTitle ? 'lowercase' : 'uppercase' }}>{title}</h1>
        {sub && <p style={{ color: 'var(--ink-soft)', fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: '10px 0 0' }}>{sub}</p>}
      </div>
      <div style={{ marginRight: 10 }}>{right}</div>
    </Up>
  )
}

/* ---------- reusable modal ---------- */
function Modal({ title, onClose, children }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(45,53,86,.34)', backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center', padding: 24 }}>
        <motion.div onClick={e => e.stopPropagation()}
          initial={{ y: 24, opacity: 0, scale: .96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0, scale: .97 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ width: '100%', maxWidth: 480, maxHeight: '88dvh', overflowY: 'auto',
            background: 'linear-gradient(180deg,#eef2fd,#e6edfa)', borderRadius: 40,
            padding: '30px 30px calc(30px + env(safe-area-inset-bottom))', boxShadow: '0 30px 80px rgba(80,90,160,.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 21, fontWeight: 800, textTransform: 'lowercase', letterSpacing: '-.5px' }}>{title}</div>
            <motion.button whileTap={{ scale: .9 }} onClick={onClose} style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', color: 'var(--ink-soft)', ...raiseSm(20) }}><Icon name="close" size={20} /></motion.button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
const Label = ({ children }) => <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', margin: '0 4px 7px' }}>{children}</div>

/* ---------- add transaction ---------- */
function AddTx({ onClose, leticia = false, kamilla = false }) {
  const { addTx, addLeticiaTx, addKamillaCompra } = useStore()
  const [type, setType] = useState('out')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('BRL')
  const list = CATS.filter(c => c.kind === type)
  const [cat, setCat] = useState(list[0].id)
  const pick = t => { setType(t); setCat(CATS.filter(c => c.kind === t)[0].id) }
  const save = () => {
    const v = parseFloat(String(amount).replace(',', '.'))
    if (!name.trim() || !v || v <= 0) return
    if (kamilla) addKamillaCompra({ name: name.trim(), cat, amount: v, currency })
    else if (leticia) addLeticiaTx({ name: name.trim(), cat, amount: v, type, currency })
    else addTx({ name: name.trim(), cat, amount: v, type })
    onClose()
  }
  return (
    <Modal title="Novo lançamento" onClose={onClose}>
      {!kamilla && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[['out', 'Saída', '255,122,146'], ['in', 'Entrada', '61,214,140']].map(([t, l, rgb]) => (
            <motion.button key={t} whileTap={{ scale: .96 }} onClick={() => pick(t)}
              style={{ flex: 1, padding: 14, borderRadius: 999, fontWeight: 800, fontSize: 15,
                ...(type === t ? { background: `linear-gradient(135deg,rgb(${rgb}),rgba(${rgb},.8))`, color: '#fff', boxShadow: `5px 6px 16px rgba(${rgb},.45)` } : { ...inset(999), color: 'var(--ink-soft)' }) }}>
              {l}
            </motion.button>
          ))}
        </div>
      )}
      <Label>Descrição</Label>
      <div className="field" style={{ marginBottom: 16 }}><input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Mercado" autoFocus /></div>
      {(leticia || kamilla) && (
        <>
          <Label>Moeda</Label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {['BRL', 'USD'].map(c => (
              <motion.button key={c} whileTap={{ scale: .96 }} onClick={() => setCurrency(c)}
                style={{ flex: 1, padding: 12, borderRadius: 999, fontWeight: 800, fontSize: 14,
                  ...(currency === c ? { background: 'linear-gradient(135deg,#F48591,#F48591)', color: '#fff' } : { ...inset(999), color: 'var(--ink-soft)' }) }}>
                {c === 'BRL' ? 'R$' : 'US$'}
              </motion.button>
            ))}
          </div>
        </>
      )}
      <Label>Valor</Label>
      <div className="field" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 800, color: 'var(--ink-soft)' }}>{(leticia || kamilla) && currency === 'USD' ? 'US$' : 'R$'}</span>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" inputMode="decimal" />
      </div>
      <Label>Categoria</Label>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 24 }}>
        {list.map(c => {
          const on = c.id === cat
          return (
            <motion.button key={c.id} whileTap={{ scale: .95 }} onClick={() => setCat(c.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, fontWeight: 800, fontSize: 13.5,
                ...(on ? { background: `linear-gradient(135deg,rgb(${c.rgb}),rgba(${c.rgb},.8))`, color: '#fff', boxShadow: `4px 5px 14px rgba(${c.rgb},.45)` } : { ...raiseSm(24), color: 'var(--ink-soft)' }) }}>
              <Icon name={c.icon} size={16} /> {c.name}
            </motion.button>
          )
        })}
      </div>
      <motion.button whileTap={{ scale: .97 }} style={btn} onClick={save}>Salvar</motion.button>
    </Modal>
  )
}

/* ---------- add card ---------- */
const GRADS = [['#ffc9a3', '#ff9bb3', '#FA8D85'], ['#8fd0ff', '#F48591', '#F48591'], ['#3dd68c', '#8fd0ff', '#5ad0d6'], ['#ffd86b', '#ffc9a3', '#ff9bb3']]
function AddCard({ onClose }) {
  const { addCard, profile } = useStore()
  const [label, setLabel] = useState('')
  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [balance, setBalance] = useState('')
  const [g, setG] = useState(0)
  const save = () => {
    if (!label.trim()) return
    const num = (number.replace(/\D/g, '') + '0'.repeat(16)).slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
    addCard({ label: label.trim(), holder: holder.trim() || profile.name, number: num, exp: '08/28', balance: parseFloat(String(balance).replace(',', '.')) || 0, grad: GRADS[g] })
    onClose()
  }
  return (
    <Modal title="Novo cartão" onClose={onClose}>
      <Label>Nome do cartão</Label>
      <div className="field" style={{ marginBottom: 16 }}><input value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex.: Cartão pessoal" autoFocus /></div>
      <Label>Titular</Label>
      <div className="field" style={{ marginBottom: 16 }}><input value={holder} onChange={e => setHolder(e.target.value)} placeholder={profile.name} /></div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}><Label>Nº (opcional)</Label><div className="field"><input value={number} onChange={e => setNumber(e.target.value)} placeholder="0000 0000" inputMode="numeric" /></div></div>
        <div style={{ flex: 1 }}><Label>Saldo</Label><div className="field"><input value={balance} onChange={e => setBalance(e.target.value)} placeholder="0,00" inputMode="decimal" /></div></div>
      </div>
      <Label>Cor</Label>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {GRADS.map((gr, i) => (
          <motion.button key={i} whileTap={{ scale: .9 }} onClick={() => setG(i)}
            style={{ width: 52, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${gr.join(',')})`, boxShadow: g === i ? `0 0 0 3px #fff, 0 6px 16px ${gr[1]}88` : '4px 5px 12px rgba(120,134,200,.3)' }} />
        ))}
      </div>
      <motion.button whileTap={{ scale: .97 }} style={btn} onClick={save}>Cartão</motion.button>
    </Modal>
  )
}

/* ---------- add event ---------- */
function AddEvent({ onClose }) {
  const { addEvent } = useStore()
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [place, setPlace] = useState('')
  const [cat, setCat] = useState('lazer')
  const save = () => {
    if (!title.trim()) return
    addEvent({ title: title.trim(), time, place: place.trim() || 'Agenda', cat, date: new Date().toISOString() })
    onClose()
  }
  return (
    <Modal title="Novo compromisso" onClose={onClose}>
      <Label>Título</Label>
      <div className="field" style={{ marginBottom: 16 }}><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Reunião" autoFocus /></div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: '0 0 130px' }}><Label>Horário</Label><div className="field"><input type="time" value={time} onChange={e => setTime(e.target.value)} /></div></div>
        <div style={{ flex: 1 }}><Label>Local</Label><div className="field"><input value={place} onChange={e => setPlace(e.target.value)} placeholder="Zoom, Escritório…" /></div></div>
      </div>
      <Label>Cor</Label>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATS.filter(c => c.kind === 'out').map(c => {
          const on = c.id === cat
          return (
            <motion.button key={c.id} whileTap={{ scale: .95 }} onClick={() => setCat(c.id)}
              style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff',
                background: `linear-gradient(135deg,rgb(${c.rgb}),rgba(${c.rgb},.75))`, boxShadow: on ? `0 0 0 3px #fff, 0 5px 14px rgba(${c.rgb},.5)` : `4px 5px 12px rgba(${c.rgb},.4)` }}>
              <Icon name={c.icon} size={17} />
            </motion.button>
          )
        })}
      </div>
      <motion.button whileTap={{ scale: .97 }} style={btn} onClick={save}>Salvar</motion.button>
    </Modal>
  )
}

/* ---------- transaction row (deletable) ---------- */
function TxRow({ t, onDel }) {
  const c = catOf(t.cat)
  return (
    <Up><motion.div layout style={{ padding: '13px 30px 13px 26px', marginBottom: 20, display: 'flex', gap: 22, alignItems: 'center', ...raise(999) }}>
      <Chip name={c.icon} rgb={c.rgb} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800 }}>{t.name}</div>
        <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 600, letterSpacing: 1, marginTop: 6 }}>{c.name} · {fmtDay(t.date)}</div>
      </div>
      <div style={{ fontWeight: 800, color: t.type === 'in' ? 'var(--green-d)' : 'var(--coral)', whiteSpace: 'nowrap' }}>
        {t.type === 'in' ? '+ ' : '- '}{money(t.amount, t.currency).replace('- ', '')}
      </div>
      {onDel && (
        <motion.button whileTap={{ scale: .85 }} onClick={() => onDel(t.id)} aria-label="apagar"
          style={{ width: 34, height: 34, flex: '0 0 auto', display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', ...inset(16) }}>
          <Icon name="plus" size={16} />
        </motion.button>
      )}
    </motion.div></Up>
  )
}

/* ============ INÍCIO ============ */
export function Inicio({ onMenu, go, openAdd }) {
  const { tx, cards, profile, goal } = useStore()
  const m = monthTotals(tx)
  const pct = m.income ? Math.min(100, Math.round((m.spent / m.income) * 100)) : 0
  const recent = tx.slice(0, 6)
  const totalCards = cards.reduce((s, c) => s + c.balance, 0)
  const byCat = {}
  tx.filter(t => t.type === 'out' && sameMonth(t.date)).forEach(t => { byCat[t.cat] = (byCat[t.cat] || 0) + t.amount })
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const maxTop = Math.max(1, ...top.map(c => c[1]))
  return (
    <Page>
      <PageHead onMenu={onMenu}
        title=""
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.button whileTap={{ scale: .9 }} onClick={openAdd} style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', color: '#fff', borderRadius: '50%', background: 'linear-gradient(135deg,#F48591,#F48591)', boxShadow: '5px 6px 16px rgba(244,133,145,.45)' }}><Icon name="plus" size={22} /></motion.button>
          <Avatar name={profile.name} size={46} grad={['#3dd68c', '#8fd0ff']} />
        </div>} />

      {/* hero row */}
      <Up><div className="row3" style={{ marginBottom: 52 }}>
        <div style={{ borderRadius: 36, padding: '34px 38px 34px 52px', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: 196,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: 'linear-gradient(135deg,#F48591,#F48591)', boxShadow: '10px 16px 36px rgba(244,133,145,.5)' }}>
          <div style={{ position: 'absolute', right: -30, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.14)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, opacity: .9, fontWeight: 700 }}>Saldo do mês</div><Icon name="card" size={22} />
          </div>
          <div style={{ fontSize: 'clamp(32px,3.2vw,44px)', fontWeight: 800, margin: '8px 0' }}>{money(m.balance)}</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, fontWeight: 700 }}>
            <span>↑ Entradas {money(m.income)}</span><span>↓ Saídas {money(m.spent)}</span>
          </div>
        </div>

        <div style={{ padding: 20, display: 'grid', placeItems: 'center', ...raise(36) }}>
          <Donut value={pct} size={150} stroke={16} from="#ff7a92" to="#ffc9a3" label={`${pct}%`} sub="do mês gasto" id="home" />
        </div>

        <div style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', ...raise(36) }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>Meta de gastos</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{money(goal)}</div>
          <div style={{ height: 10, ...inset(6), padding: 0 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (m.spent / goal) * 100)}%` }} transition={{ duration: 1 }}
              style={{ height: '100%', borderRadius: 6, background: 'linear-gradient(90deg,#F48591,#F48591)' }} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>Restam {money(Math.max(0, goal - m.spent))}</div>
        </div>
      </div></Up>

      {/* main split: recent list + side panel */}
      <div className="split">
        <div>
          <Up style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 2px 26px' }}>
            <div style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 4 }}>Últimos lançamentos</div>
            <button onClick={() => go('transacoes')} style={{ color: 'var(--violet)', fontWeight: 800, fontSize: 13 }}>Ver mais</button>
          </Up>
          {recent.length ? recent.map(t => <TxRow key={t.id} t={t} />) : <Empty label="Nenhum lançamento ainda" />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 38 }}>
          <Up><div style={{ padding: '24px 30px 28px 40px', ...raise(32) }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', marginBottom: 10 }}>Total em cartões</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 22 }}>{money(totalCards)}</div>
            <motion.button whileTap={{ scale: .97 }} onClick={() => go('cartoes')} style={ghostBtn}>Ver cartões</motion.button>
          </div></Up>
          <Up><div style={{ padding: 30, ...raise(32) }}>
            <div style={{ fontWeight: 800, marginBottom: 26 }}>Mais gastos do mês</div>
            {top.length ? top.map(([id, v]) => {
              const c = catOf(id)
              return (
                <div key={id} style={{ marginBottom: 26 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13.5 }}>
                    <span style={{ fontWeight: 800 }}>{c.name}</span><span style={{ fontWeight: 800, color: 'var(--ink-soft)' }}>{money(v)}</span>
                  </div>
                  <div style={{ height: 7, ...inset(5), padding: 0 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(v / maxTop) * 100}%` }} transition={{ duration: 1 }}
                      style={{ height: '100%', borderRadius: 5, background: `linear-gradient(90deg,rgb(${c.rgb}),rgba(${c.rgb},.7))` }} />
                  </div>
                </div>
              )
            }) : <div style={{ color: 'var(--ink-faint)', fontWeight: 700, fontSize: 13.5 }}>Sem gastos ainda</div>}
          </div></Up>
        </div>
      </div>
    </Page>
  )
}

/* ============ TRANSAÇÕES ============ */
export function Transacoes({ onMenu, openAdd }) {
  const { tx, delTx } = useStore()
  const [filter, setFilter] = useState('todos')
  const used = ['todos', ...new Set(tx.map(t => t.cat))]
  const list = tx.filter(t => filter === 'todos' || t.cat === filter)
  const t = totals(list)
  return (
    <Page>
      <PageHead onMenu={onMenu} title="Transações" sub={`${list.length} lançamento${list.length === 1 ? '' : 's'}`}
        right={<motion.button whileTap={{ scale: .9 }} onClick={openAdd} style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', color: '#fff', borderRadius: '50%', background: 'linear-gradient(135deg,#F48591,#F48591)', boxShadow: '5px 6px 16px rgba(244,133,145,.45)' }}><Icon name="plus" size={22} /></motion.button>} />

      <Up style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingBottom: 4, marginBottom: 36 }}>
        {used.map(f => {
          const on = f === filter
          const c = f === 'todos' ? { name: 'Todos', icon: 'star', rgb: '138,141,246' } : catOf(f)
          return (
            <motion.button key={f} whileTap={{ scale: .95 }} onClick={() => setFilter(f)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 15px', borderRadius: 999, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap', flex: '0 0 auto',
                ...(on ? { background: `linear-gradient(135deg,rgb(${c.rgb}),rgba(${c.rgb},.8))`, color: '#fff', boxShadow: `4px 5px 14px rgba(${c.rgb},.45)` } : { ...raiseSm(24), color: 'var(--ink-soft)' }) }}>
              <Icon name={c.icon} size={13} /> {c.name}
            </motion.button>
          )
        })}
      </Up>

      <div className="split">
        <div>
          <AnimatePresence mode="popLayout">
            {list.length ? list.map(t => <TxRow key={t.id} t={t} onDel={delTx} />) : <Empty label="Nada por aqui" />}
          </AnimatePresence>
        </div>

        <Up><div style={{ padding: 40, position: 'sticky', top: 24, ...raise(56) }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 24, textTransform: 'lowercase', letterSpacing: '.5px' }}>Resumo</div>
          {[['Entradas', money(t.income), 'var(--green-d)'], ['Saídas', money(t.spent), 'var(--coral)']].map(([l, v, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ color: 'var(--ink-soft)', fontWeight: 700, fontSize: 14 }}>{l}</span>
              <span style={{ fontWeight: 800, color: col }}>{v}</span>
            </div>
          ))}
          <div style={{ height: 1, background: 'rgba(45,53,86,.1)', margin: '10px 0 20px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Saldo</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: t.balance >= 0 ? 'var(--green-d)' : 'var(--coral)' }}>{money(t.balance)}</span>
          </div>
        </div></Up>
      </div>
    </Page>
  )
}

export function Leticia({ onMenu, openAdd }) {
  const { leticiaTx, delLeticiaTx, leticiaPhoto, setLeticiaPhoto } = useStore()
  const [filter, setFilter] = useState('todos')
  const used = ['todos', ...new Set(leticiaTx.map(t => t.cat))]
  const list = leticiaTx.filter(t => filter === 'todos' || t.cat === filter)
  const brl = totals(list.filter(x => (x.currency || 'BRL') === 'BRL'))
  const usd = totals(list.filter(x => x.currency === 'USD'))
  const fileRef = useRef(null)
  const pickPhoto = () => fileRef.current?.click()
  const onPhoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLeticiaPhoto(reader.result)
    reader.readAsDataURL(file)
  }
  return (
    <Page>
      <PageHead onMenu={onMenu} title="Letícia" sub={`${list.length} lançamento${list.length === 1 ? '' : 's'}`}
        right={<motion.button whileTap={{ scale: .9 }} onClick={openAdd} style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', color: '#fff', borderRadius: '50%', background: 'linear-gradient(135deg,#F48591,#F48591)', boxShadow: '5px 6px 16px rgba(244,133,145,.45)' }}><Icon name="plus" size={22} /></motion.button>} />

      <div className="split" style={{ alignItems: 'stretch' }}>
        {/* left: photo */}
        <div style={{ display: 'flex' }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
          <motion.div whileTap={{ scale: .99 }} onClick={pickPhoto}
            style={{ flex: 1, minHeight: 360, cursor: 'pointer', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: leticiaPhoto ? 'flex-end' : 'center', textAlign: 'center',
              padding: leticiaPhoto ? 0 : 28, ...raise(68),
              ...(leticiaPhoto ? { backgroundImage: `url(${leticiaPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
            {leticiaPhoto ? (
              <div style={{ width: '100%', padding: '50px 26px 26px', background: 'linear-gradient(0deg, rgba(30,28,60,.6), rgba(30,28,60,0))' }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#fff' }}>Letícia</div>
                <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>Toque para trocar a foto</div>
              </div>
            ) : (
              <>
                <Avatar name="Letícia" size={104} />
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 32, textTransform: 'none' }}>Letícia</div>
                <div style={{ color: 'var(--ink-faint)', fontWeight: 700, fontSize: 12.5, marginTop: 10, letterSpacing: .5 }}>Toque para adicionar foto</div>
              </>
            )}
          </motion.div>
        </div>

        {/* right: filters + entries */}
        <div>
          <Up style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingBottom: 4, marginBottom: 24 }}>
            {used.map(f => {
              const on = f === filter
              const c = f === 'todos' ? { name: 'Todos', icon: 'star', rgb: '138,141,246' } : catOf(f)
              return (
                <motion.button key={f} whileTap={{ scale: .95 }} onClick={() => setFilter(f)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 15px', borderRadius: 999, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap', flex: '0 0 auto',
                    ...(on ? { background: `linear-gradient(135deg,rgb(${c.rgb}),rgba(${c.rgb},.8))`, color: '#fff', boxShadow: `4px 5px 14px rgba(${c.rgb},.45)` } : { ...raiseSm(24), color: 'var(--ink-soft)' }) }}>
                  <Icon name={c.icon} size={13} /> {c.name}
                </motion.button>
              )
            })}
          </Up>

          <AnimatePresence mode="popLayout">
            {list.length ? list.map(t => <TxRow key={t.id} t={t} onDel={delLeticiaTx} />) : <Empty label="Nada por aqui" />}
          </AnimatePresence>
        </div>
      </div>

      {/* total, below everything */}
      <Up style={{ marginTop: 24 }}><div style={{ padding: 40, ...raise(56) }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 24, textTransform: 'lowercase', letterSpacing: '.5px' }}>Resumo</div>
        <div className="g2" style={{ marginBottom: 20 }}>
          {[['Entradas', money(brl.income), 'var(--green-d)'], ['Saídas', money(brl.spent), 'var(--coral)']].map(([l, v, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-soft)', fontWeight: 700, fontSize: 14 }}>{l}</span>
              <span style={{ fontWeight: 800, color: col }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'rgba(45,53,86,.1)', margin: '0 0 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Saldo (R$)</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: brl.balance >= 0 ? 'var(--green-d)' : 'var(--coral)' }}>{money(brl.balance)}</span>
        </div>
        <div style={{ height: 1, background: 'rgba(45,53,86,.1)', margin: '0 0 20px' }} />
        <div className="g2" style={{ marginBottom: 20 }}>
          {[['Entradas (US$)', money(usd.income, 'USD'), 'var(--green-d)'], ['Saídas (US$)', money(usd.spent, 'USD'), 'var(--coral)']].map(([l, v, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-soft)', fontWeight: 700, fontSize: 14 }}>{l}</span>
              <span style={{ fontWeight: 800, color: col }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Saldo (US$)</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: usd.balance >= 0 ? 'var(--green-d)' : 'var(--coral)' }}>{money(usd.balance, 'USD')}</span>
        </div>
      </div></Up>
    </Page>
  )
}

/* ============ KAMILLA (lista de compras) ============ */
export function Kamilla({ onMenu, openAdd }) {
  const { kamillaCompras, delKamillaCompra, kamillaPhoto, setKamillaPhoto, profile } = useStore()
  const eu = profile.name || ''
  const primeiro = eu.split(/\s+/).filter(x => !/^(doutora|doutor|dra?)\.?$/i.test(x))[0] || ''
  const [filter, setFilter] = useState('todos')
  const used = ['todos', ...new Set(kamillaCompras.map(t => t.cat))]
  const list = kamillaCompras.filter(t => filter === 'todos' || t.cat === filter)
  const brl = totals(list.filter(x => (x.currency || 'BRL') === 'BRL'))
  const fileRef = useRef(null)
  const pickPhoto = () => fileRef.current?.click()
  const onPhoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setKamillaPhoto(reader.result)
    reader.readAsDataURL(file)
  }
  return (
    <Page>
      <PageHead onMenu={onMenu} title={primeiro} sub={`${list.length} ite${list.length === 1 ? 'm' : 'ns'}`}
        right={<motion.button whileTap={{ scale: .9 }} onClick={openAdd} style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', color: '#fff', borderRadius: '50%', background: 'linear-gradient(135deg,#F48591,#F48591)', boxShadow: '5px 6px 16px rgba(244,133,145,.45)' }}><Icon name="plus" size={22} /></motion.button>} />

      <div className="split" style={{ alignItems: 'stretch' }}>
        {/* left: photo */}
        <div style={{ display: 'flex' }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
          <motion.div whileTap={{ scale: .99 }} onClick={pickPhoto}
            style={{ flex: 1, minHeight: 360, cursor: 'pointer', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: kamillaPhoto ? 'flex-end' : 'center', textAlign: 'center',
              padding: kamillaPhoto ? 0 : 28, ...raise(68),
              ...(kamillaPhoto ? { backgroundImage: `url(${kamillaPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
            {kamillaPhoto ? (
              <div style={{ width: '100%', padding: '50px 26px 26px', background: 'linear-gradient(0deg, rgba(30,28,60,.6), rgba(30,28,60,0))' }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#fff' }}>{primeiro}</div>
                <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>Toque para trocar a foto</div>
              </div>
            ) : (
              <>
                <Avatar name={eu} size={104} />
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 32, textTransform: 'none' }}>{primeiro}</div>
                <div style={{ color: 'var(--ink-faint)', fontWeight: 700, fontSize: 12.5, marginTop: 10, letterSpacing: .5 }}>Toque para adicionar foto</div>
              </>
            )}
          </motion.div>
        </div>

        {/* right: filters + entries */}
        <div>
          <Up style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingBottom: 4, marginBottom: 24 }}>
            {used.map(f => {
              const on = f === filter
              const c = f === 'todos' ? { name: 'Todos', icon: 'star', rgb: '138,141,246' } : catOf(f)
              return (
                <motion.button key={f} whileTap={{ scale: .95 }} onClick={() => setFilter(f)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 15px', borderRadius: 999, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap', flex: '0 0 auto',
                    ...(on ? { background: `linear-gradient(135deg,rgb(${c.rgb}),rgba(${c.rgb},.8))`, color: '#fff', boxShadow: `4px 5px 14px rgba(${c.rgb},.45)` } : { ...raiseSm(24), color: 'var(--ink-soft)' }) }}>
                  <Icon name={c.icon} size={13} /> {c.name}
                </motion.button>
              )
            })}
          </Up>

          <AnimatePresence mode="popLayout">
            {list.length ? list.map(t => <TxRow key={t.id} t={t} onDel={delKamillaCompra} />) : <Empty label="Nada por aqui" />}
          </AnimatePresence>
        </div>
      </div>

      {/* total, below everything */}
      <Up style={{ marginTop: 24 }}><div style={{ padding: 40, ...raise(56) }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 24, textTransform: 'lowercase', letterSpacing: '.5px' }}>Resumo</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Total considerado</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--coral)' }}>{money(brl.spent)}</span>
        </div>
      </div></Up>
    </Page>
  )
}

/* ============ CARTÕES ============ */
export function Cartoes({ onMenu, openAdd }) {
  const { cards, delCard } = useStore()
  const total = cards.reduce((s, c) => s + c.balance, 0)
  return (
    <Page>
      <PageHead onMenu={onMenu} title="Meus cartões" sub={`${cards.length} ${cards.length === 1 ? 'cartão' : 'cartões'}`}
        right={<motion.button whileTap={{ scale: .9 }} onClick={openAdd} style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', color: '#fff', borderRadius: '50%', background: 'linear-gradient(135deg,#F48591,#F48591)', boxShadow: '5px 6px 16px rgba(244,133,145,.45)' }}><Icon name="plus" size={22} /></motion.button>} />
      <Up><div style={{ padding: '28px 36px 28px 52px', marginBottom: 34, ...raise(34) }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', letterSpacing: 2 }}>Saldo total nos cartões</div>
        <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{money(total)}</div>
      </div></Up>
      <div className="cardgrid">
        <AnimatePresence mode="popLayout">
          {cards.map(cd => (
            <motion.div key={cd.id} layout variants={up} initial="initial" animate="animate" exit={{ opacity: 0, scale: .9 }}>
              <div style={{ borderRadius: 40, padding: 44, color: '#fff', minHeight: 260, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg,${cd.grad.join(',')})`, boxShadow: `10px 16px 36px rgba(${hexToRgb(cd.grad[1])},.45)` }}>
                <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.2)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                  <div>
                    <div style={{ fontSize: 13, opacity: .92, fontWeight: 700 }}>{cd.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, margin: '6px 0 22px' }}>{money(cd.balance)}</div>
                  </div>
                  <motion.button whileTap={{ scale: .85 }} onClick={() => delCard(cd.id)} aria-label="apagar"
                    style={{ width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', color: '#fff', background: 'rgba(255,255,255,.22)' }}><Icon name="plus" size={16} /></motion.button>
                </div>
                <div style={{ letterSpacing: 3, fontWeight: 700, fontSize: 15, position: 'relative' }}>{cd.number}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12.5, opacity: .92, position: 'relative' }}><span>{cd.holder}</span><span>{cd.exp}</span></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {!cards.length && <Empty label="Nenhum cartão. Toque em + para criar." />}
    </Page>
  )
}
function hexToRgb(h) {
  const x = h.replace('#', ''); const n = parseInt(x.length === 3 ? x.split('').map(c => c + c).join('') : x, 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

/* ============ ESTATÍSTICAS ============ */
export function Estatisticas({ onMenu }) {
  const { tx, goal } = useStore()
  const m = monthTotals(tx)
  const savings = m.income ? Math.max(0, Math.round((m.balance / m.income) * 100)) : 0
  const goalPct = Math.min(100, Math.round((m.spent / goal) * 100))

  // gasto por categoria (mês)
  const byCat = {}
  tx.filter(t => t.type === 'out' && sameMonth(t.date)).forEach(t => { byCat[t.cat] = (byCat[t.cat] || 0) + t.amount })
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const maxCat = Math.max(1, ...cats.map(c => c[1]))

  // gasto por dia da semana
  const dow = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const week = [0, 0, 0, 0, 0, 0, 0]
  tx.filter(t => t.type === 'out' && sameMonth(t.date)).forEach(t => { week[new Date(t.date).getDay()] += t.amount })
  const cols = ['#FA8D85', '#8fd0ff', '#F48591', '#3dd68c', '#ffd86b', '#ff9bb3', '#5ad0d6']
  const bars = week.map((v, i) => ({ l: dow[i], v: Math.max(0, v), c: cols[i], c2: i === 3 ? '#16c06e' : undefined }))

  return (
    <Page>
      <PageHead onMenu={onMenu} title="Estatísticas" sub="Seus números do mês" />

      <div className="split" style={{ marginBottom: 22 }}>
        <Up style={{ height: '100%' }}><div style={{ padding: 24, height: '100%', boxSizing: 'border-box', ...raise(34) }}>
          <div style={{ fontWeight: 800, marginBottom: 18, textTransform: 'uppercase', letterSpacing: 3 }}>Gastos por dia da semana</div>
          <Bars height={190} data={bars} />
        </div></Up>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Up><div style={{ padding: 20, textAlign: 'center', ...raise(34) }}>
            <Donut value={savings} size={120} stroke={13} from="#3dd68c" to="#8fd0ff" label={`${savings}%`} id="sv" />
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10, fontWeight: 800 }}>Economia</div>
          </div></Up>
          <Up><div style={{ padding: 20, textAlign: 'center', ...raise(34) }}>
            <Donut value={goalPct} size={120} stroke={13} from="#ff7a92" to="#ffc9a3" label={`${goalPct}%`} id="gl" />
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10, fontWeight: 800 }}>Meta usada</div>
          </div></Up>
        </div>
      </div>

      <Up style={{ fontWeight: 800, fontSize: 12, margin: '4px 2px 14px', textTransform: 'uppercase', letterSpacing: 2.5 }}>Por categoria</Up>
      {cats.length ? (
        <div className="g2">
          {cats.map(([id, v]) => {
            const c = catOf(id)
            return (
              <Up key={id}><div style={{ padding: '13px 30px 13px 26px', display: 'flex', gap: 22, alignItems: 'center', ...raise(999) }}>
                <Chip name={c.icon} rgb={c.rgb} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800 }}>{c.name}</span><span style={{ fontWeight: 800, color: 'var(--ink-soft)' }}>{money(v)}</span>
                  </div>
                  <div style={{ height: 8, ...inset(5), padding: 0 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(v / maxCat) * 100}%` }} transition={{ duration: 1 }}
                      style={{ height: '100%', borderRadius: 5, background: `linear-gradient(90deg,rgb(${c.rgb}),rgba(${c.rgb},.7))` }} />
                  </div>
                </div>
              </div></Up>
            )
          })}
        </div>
      ) : <Empty label="Sem gastos no mês" />}
    </Page>
  )
}

/* ============ AGENDA ============ */
export function Agenda({ onMenu, openAdd }) {
  const { events, delEvent } = useStore()
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(now.getDate() + i - 2); return d })
  const wd = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return (
    <Page>
      <PageHead onMenu={onMenu} title={now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} sub="Agenda"
        right={<motion.button whileTap={{ scale: .9 }} onClick={openAdd} style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', color: '#fff', borderRadius: '50%', background: 'linear-gradient(135deg,#F48591,#F48591)', boxShadow: '5px 6px 16px rgba(244,133,145,.45)' }}><Icon name="plus" size={22} /></motion.button>} />
      <Up style={{ display: 'flex', gap: 10, marginBottom: 22, paddingBottom: 6 }}>
        {days.map((d, i) => {
          const today = d.toDateString() === now.toDateString()
          return (
            <div key={i} style={{ padding: '13px 0', textAlign: 'center', flex: '1 1 0',
              ...(today ? { background: 'linear-gradient(135deg,#3dd68c,#16c06e)', borderRadius: 26, color: '#fff', boxShadow: '5px 6px 16px rgba(61,214,140,.5)' } : raiseSm(26)) }}>
              <div style={{ fontSize: 11, opacity: .75, fontWeight: 700 }}>{wd[d.getDay()]}</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{d.getDate()}</div>
            </div>
          )
        })}
      </Up>
      {events.length ? (
        <div>
          {events.map(ev => {
            const c = catOf(ev.cat)
            return (
              <Up key={ev.id}><motion.div layout style={{ padding: '13px 30px 13px 26px', marginBottom: 20, display: 'flex', gap: 22, alignItems: 'center', ...raise(999) }}>
                <Chip name={c.icon} rgb={c.rgb} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800 }}>{ev.title}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 600, letterSpacing: 1, marginTop: 6 }}>{ev.time} · {ev.place}</div>
                </div>
                <motion.button whileTap={{ scale: .85 }} onClick={() => delEvent(ev.id)} aria-label="apagar"
                  style={{ width: 34, height: 34, flex: '0 0 auto', display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', ...inset(16) }}><Icon name="plus" size={16} /></motion.button>
              </motion.div></Up>
            )
          })}
        </div>
      ) : <Empty label="Sem compromissos" />}
    </Page>
  )
}

/* ============ PERFIL ============ */
export function Perfil({ onMenu }) {
  const { tx, cards, profile, setProfile, goal, setGoal, reset } = useStore()
  const t = totals(tx)
  const fileRef = useRef(null)
  const achievements = [
    { t: 'Primeiro registro', icon: 'star', rgb: '255,216,107', done: tx.length >= 1, p: Math.min(100, tx.length * 100) },
    { t: '10 lançamentos', icon: 'bolt', rgb: '138,141,246', done: tx.length >= 10, p: Math.min(100, tx.length * 10) },
    { t: 'No azul', icon: 'trophy', rgb: '61,214,140', done: t.balance > 0, p: t.balance > 0 ? 100 : 0 },
    { t: 'Colecionador de cartões', icon: 'card', rgb: '255,122,146', done: cards.length >= 2, p: Math.min(100, cards.length * 50) },
  ]
  const stats = [['Lançamentos', tx.length, '138,141,246'], ['Cartões', cards.length, '61,214,140'], ['Saldo', money(t.balance).replace('R$ ', ''), '255,155,179']]
  const pickPhoto = () => fileRef.current?.click()
  const onPhoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfile({ photo: reader.result })
    reader.readAsDataURL(file)
  }
  return (
    <Page>
      <PageHead onMenu={onMenu} title="" />

      <div className="split" style={{ alignItems: 'stretch' }}>
        {/* left column: photo + name */}
        <div style={{ display: 'flex' }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
          <motion.div whileTap={{ scale: .99 }} onClick={pickPhoto}
            style={{ flex: 1, minHeight: 420, cursor: 'pointer', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: profile.photo ? 'flex-end' : 'center', textAlign: 'center',
              padding: profile.photo ? 0 : 28, ...raise(68),
              ...(profile.photo ? { backgroundImage: `url(${profile.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
            {profile.photo ? (
              <div style={{ width: '100%', padding: '50px 26px 26px', background: 'linear-gradient(0deg, rgba(30,28,60,.6), rgba(30,28,60,0))' }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#fff' }}>{profile.name}</div>
                <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>Toque para trocar a foto</div>
              </div>
            ) : (
              <>
                <Avatar name={profile.name} size={104} />
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 32, textTransform: 'none' }}>{profile.name}</div>
                <div style={{ color: 'var(--ink-faint)', fontWeight: 700, fontSize: 12.5, marginTop: 10, letterSpacing: .5 }}>Toque para adicionar foto</div>
              </>
            )}
          </motion.div>
        </div>

        {/* right column: stats, meta, conquistas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {stats.map(([l, v, rgb], i) => (
              <div key={i} style={{ flex: 1, padding: 18, textAlign: 'center', ...raise(28) }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: `rgb(${rgb})`, wordBreak: 'break-word' }}>{v}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 800, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: 22, ...raise(34) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 800 }}>Meta de gastos</span>
              <span style={{ fontWeight: 800, color: 'var(--violet)' }}>{money(goal)}</span>
            </div>
            <input type="range" min="500" max="20000" step="500" value={goal} onChange={e => setGoal(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <button onClick={() => { if (confirm('Restaurar os dados de exemplo? Isso apaga suas alterações.')) reset() }}
            style={{ color: 'var(--ink-faint)', fontWeight: 800, fontSize: 13, padding: '10px 2px', alignSelf: 'flex-start' }}>Restaurar dados de exemplo</button>

          <div style={{ fontWeight: 800, fontSize: 17, margin: '10px 2px 4px', textTransform: 'uppercase', letterSpacing: 2.5 }}>Conquistas</div>
          {achievements.map((a, i) => (
            <Up key={i}><div style={{ padding: '13px 30px 13px 26px', display: 'flex', gap: 22, alignItems: 'center', ...raise(999), opacity: a.done ? 1 : .75 }}>
              <Chip name={a.icon} rgb={a.rgb} size={46} fill={a.done} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, marginBottom: 7, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{a.t}</span>{a.done && <Icon name="check" size={18} color="var(--green-d)" />}
                </div>
                <div style={{ height: 8, ...inset(5), padding: 0 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${a.p}%` }} transition={{ duration: 1, delay: i * .08 }}
                    style={{ height: '100%', borderRadius: 5, background: `linear-gradient(90deg,rgb(${a.rgb}),rgba(${a.rgb},.7))` }} />
                </div>
              </div>
            </div></Up>
          ))}
        </div>
      </div>
    </Page>
  )
}

/* ---------- empty state ---------- */
function Empty({ label }) {
  return (
    <Up><div style={{ padding: 34, textAlign: 'center', color: 'var(--ink-faint)', fontWeight: 700, ...inset(28) }}>{label}</div></Up>
  )
}

/* ---------- add modals dispatcher ---------- */
export function AddModal({ kind, onClose }) {
  if (kind === 'tx') return <AddTx onClose={onClose} />
  if (kind === 'leticiaTx') return <AddTx onClose={onClose} leticia />
  if (kind === 'kamillaCompra') return <AddTx onClose={onClose} kamilla />
  if (kind === 'card') return <AddCard onClose={onClose} />
  if (kind === 'event') return <AddEvent onClose={onClose} />
  return null
}

import { createContext, useContext, useEffect, useState } from 'react'
import { carregar, salvar, quemSou } from './banco.js'

/* ============ categorias ============ */
export const CATS = [
  { id: 'salario',    name: 'Salário',     icon: 'card',   rgb: '61,214,140',  kind: 'in'  },
  { id: 'renda',      name: 'Outra renda', icon: 'star',   rgb: '255,216,107', kind: 'in'  },
  { id: 'mercado',    name: 'Mercado',     icon: 'bag',    rgb: '255,201,163', kind: 'out' },
  { id: 'comida',     name: 'Comida',      icon: 'coffee', rgb: '255,122,146', kind: 'out' },
  { id: 'casa',       name: 'Casa',        icon: 'home',   rgb: '143,208,255', kind: 'out' },
  { id: 'transporte', name: 'Transporte',  icon: 'bus',    rgb: '61,214,140',  kind: 'out' },
  { id: 'lazer',      name: 'Lazer',       icon: 'play',   rgb: '138,141,246', kind: 'out' },
  { id: 'saude',      name: 'Saúde',       icon: 'heart',  rgb: '90,208,214',  kind: 'out' },
  { id: 'outros',     name: 'Outros',      icon: 'more',   rgb: '184,185,255', kind: 'out' },
]
export const catOf = id => CATS.find(c => c.id === id) || CATS[CATS.length - 1]

/* ============ helpers ============ */
const uid = () => Math.random().toString(36).slice(2, 9)
export const money = (n, currency = 'BRL') =>
  (n < 0 ? '- ' : '') + (currency === 'USD' ? 'US$ ' : 'R$ ') + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const sameMonth = iso => {
  const d = new Date(iso), n = new Date()
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}
export const totals = tx => {
  const income = tx.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0)
  const spent  = tx.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0)
  return { income, spent, balance: income - spent }
}
export const monthTotals = tx => totals(tx.filter(t => sameMonth(t.date)))
export const fmtDay = iso => {
  const d = new Date(iso), n = new Date()
  const same = d.toDateString() === n.toDateString()
  const y = new Date(n); y.setDate(n.getDate() - 1)
  if (same) return 'Hoje'
  if (d.toDateString() === y.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/* ============ seed ============ */
function seed() {
  const now = new Date()
  const d = ago => new Date(now.getFullYear(), now.getMonth(), now.getDate() - ago, 10, 0).toISOString()
  return {
    profile: { name: '', role: '' },
    tx: [
      { id: uid(), name: 'Salário',       cat: 'salario',    amount: 6200,  type: 'in',  date: d(6) },
      { id: uid(), name: 'Freela',        cat: 'renda',      amount: 900,   type: 'in',  date: d(4) },
      { id: uid(), name: 'Aluguel',       cat: 'casa',       amount: 1200,  type: 'out', date: d(3) },
      { id: uid(), name: 'Cinema',        cat: 'lazer',      amount: 45,    type: 'out', date: d(3) },
      { id: uid(), name: 'Uber',          cat: 'transporte', amount: 32,    type: 'out', date: d(1) },
      { id: uid(), name: 'Feira',         cat: 'mercado',    amount: 130.9, type: 'out', date: d(0) },
      { id: uid(), name: 'Clube do Café', cat: 'comida',     amount: 20.8,  type: 'out', date: d(0) },
    ],
    cards: [
      { id: uid(), label: 'Cartão pessoal', holder: '', number: '0001 2000 3090 0000', exp: '08/28', balance: 4890,  grad: ['#ffc9a3', '#ff9bb3', '#b8b9ff'] },
      { id: uid(), label: 'Platinum',       holder: '', number: '3302 4410 7788 1290', exp: '11/27', balance: 12040, grad: ['#8fd0ff', '#8a8df6', '#6c70ef'] },
    ],
    events: [
      { id: uid(), title: 'Zoom com Michael', time: '09:00', place: 'Zoom',       cat: 'lazer',      date: d(0) },
      { id: uid(), title: 'Site GCA',         time: '13:00', place: 'Teams',      cat: 'transporte', date: d(0) },
      { id: uid(), title: 'Briefing',         time: '16:00', place: 'Escritório', cat: 'casa',       date: d(1) },
    ],
    goal: 8000,
    leticiaPhoto: null,
    leticiaTx: [
      { id: uid(), name: 'Assinatura — Le Phone',  cat: 'outros', amount: 39.90, currency: 'BRL', type: 'out', date: '2026-08-20T15:13:00' },
      { id: uid(), name: 'Assinatura no cartão',   cat: 'outros', amount: 34.90, currency: 'BRL', type: 'out', date: '2026-09-01T09:30:00' },
      { id: uid(), name: 'Assinatura — Lele 11',   cat: 'outros', amount: 39.90, currency: 'BRL', type: 'out', date: '2026-09-06T05:24:00' },
      { id: uid(), name: 'fertility.rehab (domínio)', cat: 'outros', amount: 15.19, currency: 'USD', type: 'out', date: '2026-09-07T00:00:00' },
      { id: uid(), name: 'Pix recebido de Ká',      cat: 'outros', amount: 100,   currency: 'BRL', type: 'out', date: '2026-09-11T12:39:00' },
      { id: uid(), name: 'gio.baby + 21 domínios', cat: 'outros', amount: 59.48, currency: 'USD', type: 'out', date: '2026-09-11T15:12:00' },
      { id: uid(), name: 'boooo.uk (domínio)',     cat: 'outros', amount: 5.42,  currency: 'USD', type: 'out', date: '2026-09-14T01:41:00' },
    ],
    kamillaPhoto: null,
    kamillaCompras: [
      { id: uid(), name: 'Cama Emma King',                    cat: 'outros', amount: 6000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: 'Geladeira Brastemp 443L',           cat: 'outros', amount: 2000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: 'Máquina de lavar',                  cat: 'outros', amount: 2000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: 'Máquina de secar',                  cat: 'outros', amount: 1000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: '2 TVs',                             cat: 'outros', amount: 3000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: 'Mesa redonda de demolição',         cat: 'outros', amount: 2000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: 'Sofá grande',                       cat: 'outros', amount: 3000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: 'Mesa mármore (Tulipe)',             cat: 'outros', amount: 1500, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
      { id: uid(), name: 'Mesa retangular (bases cônicas)',   cat: 'outros', amount: 4000, currency: 'BRL', type: 'out', date: '2026-08-30T00:00:00' },
    ],
  }
}

/* ============ store (banco + cópia no navegador) ============ */
const KEY = 'ka-lello-v2'
const Ctx = createContext(null)

export function Store({ children }) {
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem(KEY)
      if (s) {
        const merged = { ...seed(), ...JSON.parse(s) }
        if (merged.profile) merged.profile = { ...merged.profile, role: merged.profile.role?.replace(/^m[ée]dica?\s*\/\s*/i, '') }
        if (merged.leticiaTx) merged.leticiaTx = merged.leticiaTx.map(t =>
          t.name === 'Pix recebido de Ká' && t.amount === 100 && t.type === 'in' ? { ...t, type: 'out' } : t)
        return merged
      }
    } catch { /* ignore */ }
    return seed()
  })
  // banco: ao abrir, puxa o que está salvo; se ainda não tem nada, o banco começa com os dados daqui
  const [pronto, setPronto] = useState(false)
  useEffect(() => {
    // o nome que aparece é o de quem entrou: tira o nome da Kamilla, que veio com o modelo
    const kami = n => !n || /kamilla|piazentini/i.test(n)
    const comNome = (d, nome) => !nome ? d : ({
      ...d,
      profile: kami(d.profile?.name) ? { ...d.profile, name: nome, role: /nutrolog/i.test(d.profile?.role || '') ? '' : (d.profile?.role || '') } : d.profile,
      cards: (d.cards || []).map(c => kami(c.holder) ? { ...c, holder: nome } : c),
    })
    Promise.all([carregar().catch(() => null), quemSou().catch(() => '')])
      .then(([salvo, nome]) => setData(d => comNome(salvo ? { ...d, ...salvo } : d, nome)))
      .finally(() => setPronto(true))
  }, [])
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* ignore */ }
    if (!pronto) return
    const t = setTimeout(() => { salvar(data).catch(() => {}) }, 600)
    return () => clearTimeout(t)
  }, [data, pronto])

  const api = {
    ...data,
    addTx:   t  => setData(d => ({ ...d, tx: [{ id: uid(), date: new Date().toISOString(), ...t }, ...d.tx] })),
    delTx:   id => setData(d => ({ ...d, tx: d.tx.filter(x => x.id !== id) })),
    addLeticiaTx: t  => setData(d => ({ ...d, leticiaTx: [{ id: uid(), date: new Date().toISOString(), currency: 'BRL', ...t }, ...d.leticiaTx] })),
    delLeticiaTx: id => setData(d => ({ ...d, leticiaTx: d.leticiaTx.filter(x => x.id !== id) })),
    addKamillaCompra: t  => setData(d => ({ ...d, kamillaCompras: [{ id: uid(), date: new Date().toISOString(), currency: 'BRL', type: 'out', ...t }, ...d.kamillaCompras] })),
    delKamillaCompra: id => setData(d => ({ ...d, kamillaCompras: d.kamillaCompras.filter(x => x.id !== id) })),
    setKamillaPhoto: photo => setData(d => ({ ...d, kamillaPhoto: photo })),
    addCard: c  => setData(d => ({ ...d, cards: [...d.cards, { id: uid(), ...c }] })),
    delCard: id => setData(d => ({ ...d, cards: d.cards.filter(x => x.id !== id) })),
    addEvent: e => setData(d => ({ ...d, events: [{ id: uid(), ...e }, ...d.events] })),
    delEvent: id => setData(d => ({ ...d, events: d.events.filter(x => x.id !== id) })),
    setProfile: p => setData(d => ({ ...d, profile: { ...d.profile, ...p } })),
    setGoal: g => setData(d => ({ ...d, goal: g })),
    setLeticiaPhoto: photo => setData(d => ({ ...d, leticiaPhoto: photo })),
    reset: () => setData(seed()),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
export const useStore = () => useContext(Ctx)

import { motion } from 'framer-motion'

/* ============ neumorphic recipes ============ */
export const CLAY = '#e3eafa'
export const raise = (radius = 22) => ({
  background: 'linear-gradient(145deg,#edf1fc,#dde4f5)', borderRadius: radius,
  boxShadow: '9px 9px 20px rgba(165,181,222,.6), -9px -9px 20px rgba(255,255,255,.95)',
})
export const raiseSm = (radius = 16) => ({
  background: 'linear-gradient(145deg,#edf1fc,#dde4f5)', borderRadius: radius,
  boxShadow: '5px 5px 12px rgba(165,181,222,.55), -5px -5px 12px rgba(255,255,255,.95)',
})
export const inset = (radius = 18) => ({
  background: '#e0e7f6', borderRadius: radius,
  boxShadow: 'inset 6px 6px 12px rgba(165,181,222,.6), inset -6px -6px 12px rgba(255,255,255,.95)',
})
/* soft colored glow chip */
export const glow = (rgb, radius = 16) => ({
  background: 'linear-gradient(145deg,#f0f3fd,#dde4f5)', borderRadius: radius,
  boxShadow: `5px 5px 14px rgba(${rgb},.45), -5px -5px 12px rgba(255,255,255,.95)`,
})

/* ============ iPhone status bar ============ */
export function StatusBar({ dark = false }) {
  const c = dark ? '#fff' : '#F48591'
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', fontSize: 14, fontWeight: 800, color: c, flex: '0 0 auto' }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill={c}><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4" y="5" width="3" height="6" rx="1"/><rect x="8" y="2.5" width="3" height="8.5" rx="1"/><rect x="12" y="0" width="3" height="11" rx="1"/></g></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2.2c2 0 3.8.8 5.1 2.1l1.1-1.2C13.6 1.4 10.9.3 8 .3S2.4 1.4.7 3.1l1.1 1.2C3.1 3 5 2.2 8 2.2z" fill={c}/><circle cx="8" cy="9" r="1.5" fill={c}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="1" y="1" width="20" height="10" rx="3" fill="none" stroke={c} strokeOpacity="0.5"/><rect x="3" y="3" width="15" height="6" rx="1.5" fill={c}/><rect x="22.5" y="4" width="1.5" height="4" rx="0.75" fill={c} fillOpacity="0.5"/></svg>
      </div>
    </div>
  )
}
export function HomeIndicator({ dark = false }) {
  return (
    <div style={{ height: 26, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, flex: '0 0 auto' }}>
      <div style={{ width: 134, height: 5, borderRadius: 3, background: dark ? 'rgba(255,255,255,.55)' : 'rgba(45,53,86,.25)' }} />
    </div>
  )
}
export function Screen({ children, bg, dark = false, pad = 22 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg || CLAY }}>
      <StatusBar dark={dark} />
      <div className="screen-body" style={{ flex: 1, overflowY: 'auto', padding: `4px ${pad}px 8px` }}>{children}</div>
      <HomeIndicator dark={dark} />
    </div>
  )
}

/* ============ bits ============ */
export function Avatar({ name = '', size = 40, grad = ['#F48591', '#FA8D85'], ring = true }) {
  const words = name.split(' ').filter(w => !/^(dra?|sra?|srta)\.?$/i.test(w))
  const initials = words.map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ padding: ring ? 4 : 0, borderRadius: '50%', ...(ring ? raiseSm('50%') : {}), background: ring ? 'linear-gradient(145deg,#edf1fc,#dde4f5)' : 'none', flex: `0 0 auto` }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.38 }}>{initials}</div>
    </div>
  )
}

export function Pill({ children, active, rgb = '138,141,246' }) {
  return (
    <span style={{ padding: '8px 16px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap',
      ...(active
        ? { background: `linear-gradient(135deg, rgb(${rgb}), rgba(${rgb},.82))`, color: '#fff', boxShadow: `4px 4px 12px rgba(${rgb},.45)` }
        : { ...inset(28), color: 'var(--ink-soft)' }) }}>{children}</span>
  )
}

/* soft colored icon chip */
export function Chip({ name, rgb, size = 48, glyph = 22, fill = false }) {
  return (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', color: `rgb(${rgb})`, ...glow(rgb, 16) }}>
      <Icon name={name} size={glyph} fill={fill} />
    </div>
  )
}

/* ============ charts ============ */
export function Donut({ value = 65, size = 130, stroke = 16, from = '#3dd68c', to = '#8fd0ff', label, sub, id = 'g' }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs><linearGradient id={`don-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={from}/><stop offset="1" stopColor={to}/></linearGradient></defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#d4ddf2" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#don-${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div><div style={{ fontSize: size * 0.2, fontWeight: 800 }}>{label ?? `${value}%`}</div>{sub && <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600 }}>{sub}</div>}</div>
      </div>
    </div>
  )
}

export function Bars({ data, height = 120 }) {
  const max = Math.max(...data.map(d => d.v))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }}>
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.v / max) * 100}%` }} transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '74%', minHeight: 8, borderRadius: 10, background: `linear-gradient(180deg, ${d.c}, ${d.c2 || d.c})`, boxShadow: `0 6px 14px ${d.c}66` }} />
          <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 800 }}>{d.l}</span>
        </div>
      ))}
    </div>
  )
}

export function Spark({ from = '#3dd68c', to = '#8fd0ff', height = 46, id = 's' }) {
  return (
    <svg viewBox="0 0 120 46" width="100%" height={height} preserveAspectRatio="none">
      <defs><linearGradient id={`sp-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={from}/><stop offset="1" stopColor={to}/></linearGradient></defs>
      <motion.path d="M0 34 C14 34 18 12 30 14 C44 16 46 30 58 28 C72 26 74 6 88 9 C100 11 108 22 120 18" fill="none" stroke={`url(#sp-${id})`} strokeWidth="3.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
    </svg>
  )
}

/* a soft glowing orb — the signature hero element */
export function Orb({ size = 200, from = '#3dd68c', to = '#16c06e', glyph = 'pin', float = true }) {
  return (
    <motion.div animate={float ? { y: [0, -12, 0] } : {}} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'absolute', width: size * 1.25, height: size * 1.25, borderRadius: '50%', background: `radial-gradient(circle at 50% 50%, ${from}55, transparent 68%)`, filter: 'blur(8px)' }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: '2px dashed rgba(255,255,255,.6)' }} />
      <div style={{ width: size * 0.62, height: size * 0.62, borderRadius: '50%', background: `linear-gradient(135deg, ${from}, ${to})`, display: 'grid', placeItems: 'center', color: '#fff',
        boxShadow: `0 22px 44px ${from}88, inset 0 -8px 20px rgba(0,0,0,.12), inset 0 8px 18px rgba(255,255,255,.4)` }}>
        <Icon name={glyph} size={size * 0.26} fill />
      </div>
    </motion.div>
  )
}

/* ============ icon set ============ */
const P = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3', bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  plus: 'M12 5v14M5 12h14', home: 'M3 11l9-8 9 8M5 10v10h14V10',
  calendar: 'M3 9h18M7 3v4M17 3v4M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  card: 'M3 7h18a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM2 11h20',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2', user: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
  heart: 'M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 6 4.5 4.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7 7-7z',
  play: 'M6 4l14 8-14 8V4z', pause: 'M7 4h3v16H7zM14 4h3v16h-3z', mic: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10a7 7 0 0 1-14 0M12 19v4',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z', pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  chevR: 'M9 6l6 6-6 6', chevL: 'M15 6l-6 6 6 6', chevD: 'M6 9l6 6 6-6', arrowL: 'M19 12H5M12 19l-7-7 7-7',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  cloud: 'M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 19h11.5z', moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  bag: 'M6 7V6a3 3 0 0 1 6 0v1M3 7h14l-1 13H4L3 7z', bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8z',
  star: 'M12 2l3 6.5 7 .9-5 4.8 1.3 7-6.3-3.4L5.7 21 7 14.2 2 9.4l7-.9L12 2z', more: 'M5 12h.01M12 12h.01M19 12h.01',
  check: 'M20 6 9 17l-5-5', close: 'M6 6l12 12M18 6L6 18', trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3',
  wand: 'M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M3 21l9-9M12.2 6.2 10.8 4.8',
  truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  film: 'M3 3h18v18H3zM7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4', globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z',
  bus: 'M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10M4 11h16M7 20v-2M17 20v-2M3 16h18v2H3z', coffee: 'M18 8h1a3 3 0 0 1 0 6h-1M2 8h16v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
}
export function Icon({ name, size = 22, color = 'currentColor', sw = 2, fill = false }) {
  const d = P[name] || P.more
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={fill ? 'none' : color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
}

/* round neumorphic icon button */
export function IconBtn({ name, color = 'var(--ink)', size = 44 }) {
  return (
    <motion.div whileTap={{ scale: 0.9, boxShadow: 'var(--inset-sm)' }} style={{ width: size, height: size, display: 'grid', placeItems: 'center', color, ...raiseSm(22) }}>
      <Icon name={name} size={20} />
    </motion.div>
  )
}

export function TabBar({ items, active = 0 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '16px 14px 6px', margin: '8px -22px 0', ...raise(38), borderRadius: '34px 34px 0 0' }}>
      {items.map((it, i) => (
        <motion.div key={i} whileTap={{ scale: 0.85 }} style={{ position: 'relative', width: 44, height: 44, display: 'grid', placeItems: 'center', color: i === active ? 'var(--violet)' : 'var(--ink-faint)', ...(i === active ? glow('138,141,246', 14) : {}) }}>
          <Icon name={it} size={22} sw={2.2} />
        </motion.div>
      ))}
    </div>
  )
}

/* 08/10/2026: bolinhas e quadradinhos caindo atrás do cartão de entrar, nas cores da paleta da Dra Lê.
   Caem de cima, quicam e se amontoam no chão. Só enfeite: não pegam o toque, o cartão continua por cima. */
import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

const CORES = ['#F48591', '#FA8D85', '#FEA283', '#FFB872', '#8DA599', '#8D96C1', '#C18EA9']

export default function Chuva() {
  const caixa = useRef(null)
  useEffect(() => {
    const box = caixa.current
    if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const { Engine, Runner, Bodies, Composite } = Matter
    let W = box.clientWidth, H = box.clientHeight
    const eng = Engine.create(); eng.gravity.y = 0.9
    const chao = Bodies.rectangle(W / 2, H + 50, W * 3, 100, { isStatic: true })
    const esq = Bodies.rectangle(-50, H / 2, 100, H * 4, { isStatic: true })
    const dir = Bodies.rectangle(W + 50, H / 2, 100, H * 4, { isStatic: true })
    Composite.add(eng.world, [chao, esq, dir])
    const pc = W > 760, TOTAL = pc ? 70 : 34
    const pecas = []
    let n = 0
    const solta = setInterval(() => {
      if (n++ >= TOTAL) return clearInterval(solta)
      const t = (pc ? 22 : 16) + Math.random() * (pc ? 34 : 24), x = t + Math.random() * (W - 2 * t)
      const bola = Math.random() < 0.5
      const b = bola
        ? Bodies.circle(x, -t, t / 2, { restitution: 0.45, friction: 0.3 })
        : Bodies.rectangle(x, -t, t, t, { chamfer: { radius: t * 0.22 }, restitution: 0.3, friction: 0.5, angle: Math.random() * 3 })
      const el = document.createElement('div')
      el.style.cssText = `position:absolute;left:0;top:0;width:${t}px;height:${t}px;background:${CORES[n % CORES.length]};border-radius:${bola ? '50%' : t * 0.22 + 'px'};will-change:transform`
      box.appendChild(el); Composite.add(eng.world, b); pecas.push([b, el, t])
    }, 140)
    const run = Runner.create(); Runner.run(run, eng)
    let raf
    const pinta = () => {
      for (const [b, el, t] of pecas) el.style.transform = `translate(${b.position.x - t / 2}px,${b.position.y - t / 2}px) rotate(${b.angle}rad)`
      raf = requestAnimationFrame(pinta)
    }
    pinta()
    const muda = () => {
      W = box.clientWidth; H = box.clientHeight
      Matter.Body.setPosition(chao, { x: W / 2, y: H + 50 }); Matter.Body.setPosition(dir, { x: W + 50, y: H / 2 })
    }
    addEventListener('resize', muda)
    return () => { clearInterval(solta); cancelAnimationFrame(raf); Runner.stop(run); Engine.clear(eng); removeEventListener('resize', muda); box.innerHTML = '' }
  }, [])
  return <div ref={caixa} aria-hidden="true" style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} />
}

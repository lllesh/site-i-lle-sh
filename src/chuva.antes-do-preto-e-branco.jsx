/* 09/10/2026: bolinhas e quadradinhos GRANDES caindo, com física de verdade (matter-js): caem, batem e quicam
   em cima do cartão, se amontoam no chão, e dá para pegar com o mouse ou com o dedo e jogar.
   A camada fica atrás do cartão; o cartão é um obstáculo de verdade (as peças batem nele). */
import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

const CORES = ['#F48591', '#FA8D85', '#FEA283', '#FFB872', '#8DA599', '#8D96C1', '#C18EA9']

export default function Chuva() {
  const caixa = useRef(null)
  useEffect(() => {
    const box = caixa.current
    if (!box) return
    const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter
    let W = box.clientWidth, H = box.clientHeight
    const eng = Engine.create(); eng.gravity.y = 1
    const chao = Bodies.rectangle(W / 2, H + 50, W * 3, 100, { isStatic: true })
    const esq = Bodies.rectangle(-50, H / 2, 100, H * 6, { isStatic: true })
    const dir = Bodies.rectangle(W + 50, H / 2, 100, H * 6, { isStatic: true })
    Composite.add(eng.world, [chao, esq, dir])

    // o cartão de entrar vira um obstáculo: as peças caem em cima dele e escorregam pelos lados
    let cartao = null, medida = ''
    const poeCartao = () => {
      const f = document.querySelector('form[data-modo]'); if (!f) return
      const r = f.getBoundingClientRect(), m = [r.left, r.top, r.width, r.height].map(Math.round).join()
      if (m === medida) return
      medida = m
      if (cartao) Composite.remove(eng.world, cartao)
      cartao = null
      // no celular o cartão ocupa a largura toda: aí as peças passam por trás dele e caem até o chão
      if (innerWidth - r.width < 2 * 170) return
      cartao = Bodies.rectangle(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height, { isStatic: true, chamfer: { radius: 40 } })
      Composite.add(eng.world, cartao)
    }
    poeCartao()
    const vigia = setInterval(poeCartao, 400)

    const pc = W > 760, TOTAL = pc ? 42 : 22
    const pecas = []
    let n = 0
    const solta = setInterval(() => {
      if (n >= TOTAL) return clearInterval(solta)
      const t = pc ? 70 + Math.random() * 80 : 44 + Math.random() * 40, x = t + Math.random() * (W - 2 * t)
      const bola = n % 2 === 0, cor = CORES[n % CORES.length]; n++
      const b = bola
        ? Bodies.circle(x, -t, t / 2, { restitution: 0.6, friction: 0.2, frictionAir: 0.005, density: 0.002 })
        : Bodies.rectangle(x, -t, t, t, { chamfer: { radius: t * 0.22 }, restitution: 0.4, friction: 0.4, frictionAir: 0.005, density: 0.002, angle: Math.random() * 3 })
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.2)
      const el = document.createElement('div')
      el.style.cssText = `position:absolute;left:0;top:0;width:${t}px;height:${t}px;background:${cor};border-radius:${bola ? '50%' : t * 0.22 + 'px'};will-change:transform;cursor:grab`
      box.appendChild(el); Composite.add(eng.world, b); pecas.push([b, el, t])
    }, 120)

    // pegar e jogar (mouse e dedo)
    const mouse = Mouse.create(box)
    mouse.element.removeEventListener('wheel', mouse.mousewheel)
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel)
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel)
    const pega = MouseConstraint.create(eng, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } })
    Composite.add(eng.world, pega)
    Matter.Events.on(pega, 'startdrag', () => { box.style.cursor = 'grabbing' })
    Matter.Events.on(pega, 'enddrag', () => { box.style.cursor = '' })

    const run = Runner.create(); Runner.run(run, eng)
    let raf
    const pinta = () => {
      for (const [b, el, t] of pecas) {
        // peça jogada para fora da tela volta caindo de cima
        if (b.position.y > H + 300 || b.position.x < -300 || b.position.x > W + 300) { Body.setPosition(b, { x: t + Math.random() * (W - 2 * t), y: -t }); Body.setVelocity(b, { x: 0, y: 0 }) }
        el.style.transform = `translate(${b.position.x - t / 2}px,${b.position.y - t / 2}px) rotate(${b.angle}rad)`
      }
      raf = requestAnimationFrame(pinta)
    }
    pinta()
    const muda = () => {
      W = box.clientWidth; H = box.clientHeight
      Body.setPosition(chao, { x: W / 2, y: H + 50 }); Body.setPosition(dir, { x: W + 50, y: H / 2 }); poeCartao()
    }
    addEventListener('resize', muda)
    return () => { clearInterval(solta); clearInterval(vigia); cancelAnimationFrame(raf); Runner.stop(run); Engine.clear(eng); Mouse.clearSourceEvents?.(mouse); removeEventListener('resize', muda); box.innerHTML = '' }
  }, [])
  return <div ref={caixa} aria-hidden="true" style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} />
}

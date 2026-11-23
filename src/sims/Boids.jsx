import { useEffect, useRef, useState } from 'react'
import { Btn, Slider, Stats } from '../components/ui'
import { useLoop, rand } from '../lib/util'

const W = 640
const H = 380

function makeBoids(n) {
  return Array.from({ length: n }, () => {
    const a = rand(0, Math.PI * 2)
    return { x: rand(0, W), y: rand(0, H), vx: Math.cos(a) * 2, vy: Math.sin(a) * 2 }
  })
}

/** Reynolds' three local rules. No bird knows about "the flock" - yet a flock appears. */
export default function Boids() {
  const [sep, setSep] = useState(1.5)
  const [ali, setAli] = useState(1)
  const [coh, setCoh] = useState(1)
  const [radius, setRadius] = useState(55)
  const [running, setRunning] = useState(true)
  const [order, setOrder] = useState(0)
  const boids = useRef(makeBoids(130))
  const cv = useRef(null)

  const step = () => {
    const bs = boids.current
    const r2 = radius * radius
    let sx = 0
    let sy = 0
    for (const b of bs) {
      let cx = 0, cy = 0, ax = 0, ay = 0, px = 0, py = 0, n = 0
      for (const o of bs) {
        if (o === b) continue
        const dx = o.x - b.x
        const dy = o.y - b.y
        const d2 = dx * dx + dy * dy
        if (d2 < r2) {
          n++
          cx += o.x; cy += o.y
          ax += o.vx; ay += o.vy
          if (d2 < 18 * 18) { px -= dx / (Math.sqrt(d2) + 0.01); py -= dy / (Math.sqrt(d2) + 0.01) }
        }
      }
      if (n) {
        b.vx += ((cx / n - b.x) * 0.0006) * coh + ((ax / n - b.vx) * 0.05) * ali + px * 0.12 * sep
        b.vy += ((cy / n - b.y) * 0.0006) * coh + ((ay / n - b.vy) * 0.05) * ali + py * 0.12 * sep
      }
      b.vx += rand(-0.08, 0.08)
      b.vy += rand(-0.08, 0.08)
      const sp = Math.hypot(b.vx, b.vy) || 1
      const target = Math.min(3.2, Math.max(1.6, sp))
      b.vx = (b.vx / sp) * target
      b.vy = (b.vy / sp) * target
    }
    for (const b of bs) {
      b.x = (b.x + b.vx + W) % W
      b.y = (b.y + b.vy + H) % H
      const sp = Math.hypot(b.vx, b.vy) || 1
      sx += b.vx / sp
      sy += b.vy / sp
    }
    setOrder(Math.hypot(sx, sy) / bs.length)
    paint()
  }

  const paint = () => {
    const c = cv.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#0a1024'
    ctx.fillRect(0, 0, W, H)
    for (const b of boids.current) {
      const a = Math.atan2(b.vy, b.vx)
      ctx.save()
      ctx.translate(b.x, b.y)
      ctx.rotate(a)
      ctx.beginPath()
      ctx.moveTo(7, 0)
      ctx.lineTo(-4, 3.2)
      ctx.lineTo(-4, -3.2)
      ctx.closePath()
      ctx.fillStyle = `hsl(${(a * 180) / Math.PI + 180}, 75%, 68%)`
      ctx.fill()
      ctx.restore()
    }
  }
  useEffect(paint, [])
  useLoop(step, running, 45)

  const preset = (s, a, c) => { setSep(s); setAli(a); setCoh(c) }

  return (
    <div className="sim-grid one">
      <canvas ref={cv} width={W} height={H} className="canvas-wide" />
      <div className="sim-side row">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run'}</Btn>
          <Btn onClick={() => preset(0, 0, 0)}>No rules</Btn>
          <Btn onClick={() => preset(1.5, 1, 1)}>All three rules</Btn>
          <Btn onClick={() => preset(1.5, 0, 1)}>No alignment</Btn>
          <Btn onClick={() => { boids.current = makeBoids(130); paint() }}>Scatter</Btn>
        </div>
        <div className="slider-grid">
          <Slider label="Separation: don't crowd neighbours" value={sep} min={0} max={3} step={0.1} onChange={setSep} hint="Negative feedback: stops the group collapsing to a point." />
          <Slider label="Alignment: steer the way neighbours are heading" value={ali} min={0} max={3} step={0.1} onChange={setAli} hint="Positive feedback: a shared direction amplifies itself." />
          <Slider label="Cohesion: drift towards neighbours' centre" value={coh} min={0} max={3} step={0.1} onChange={setCoh} hint="Positive feedback: groups attract more members." />
          <Slider label="How far each bird can see (pixels)" value={radius} min={15} max={150} step={5} onChange={setRadius} hint="Local communication only. Nobody sees the whole flock." />
        </div>
        <Stats items={[{ label: 'order (0 = chaos, 1 = everyone flying the same way)', value: order.toFixed(2), color: order > 0.7 ? '#5eead4' : '#fbbf24' }]} />
      </div>
    </div>
  )
}

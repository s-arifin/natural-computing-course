import { useEffect, useRef, useState } from 'react'
import { Btn, Slider, Stats, Toggle } from '../components/ui'
import { DFO } from '../lib/algos'
import { fmt, useLoop, useForce } from '../lib/util'

/* ───────────────────────── The lecture's 4-fly worked example ───────────────────────── */
const FLIES = [
  [2, 3, 1],
  [1, 1, 1],
  [0, 0, 1],
  [-5, 0, 1],
]
const sphere = (x) => x.reduce((s, v) => s + v * v, 0)

export function DfoWorked() {
  const [i, setI] = useState(0)
  const [u, setU] = useState([0.1, 0.5, 0.5])
  const fit = FLIES.map(sphere)
  const s = fit.indexOf(Math.min(...fit))
  const l = (i + 3) % 4
  const r = (i + 1) % 4
  const n = fit[r] < fit[l] ? r : l
  const next = FLIES[i].map((x, d) => FLIES[n][d] + u[d] * (FLIES[s][d] - x))
  const R = 78
  const pos = (k) => [130 + R * Math.cos(-Math.PI / 2 + (k * Math.PI) / 2), 118 + R * Math.sin(-Math.PI / 2 + (k * Math.PI) / 2)]
  const col = (k) => (k === s ? '#fbbf24' : k === i ? '#f472b6' : k === n ? '#5eead4' : '#94a3b8')
  const sub = (k) => String.fromCharCode(0x2080 + k)

  return (
    <div className="sim-grid">
      <div>
        <svg viewBox="0 0 260 240" className="svg-panel">
          <circle cx="130" cy="118" r={R} fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 5" />
          {i !== s && (
            <>
              <line x1={pos(i)[0]} y1={pos(i)[1]} x2={pos(n)[0]} y2={pos(n)[1]} stroke="#5eead4" strokeWidth="3" />
              <line x1={pos(i)[0]} y1={pos(i)[1]} x2={pos(s)[0]} y2={pos(s)[1]} stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 4" />
            </>
          )}
          {FLIES.map((x, k) => {
            const [cx, cy] = pos(k)
            return (
              <g key={k} onClick={() => setI(k)} style={{ cursor: 'pointer' }}>
                <circle cx={cx} cy={cy} r="26" fill="#0b1020" stroke={col(k)} strokeWidth="3" />
                <text x={cx} y={cy - 2} textAnchor="middle" fill={col(k)} fontSize="15" fontWeight="700">x{sub(k)}</text>
                <text x={cx} y={cy + 13} textAnchor="middle" fill="#cbd5e1" fontSize="10">f = {fit[k]}</text>
              </g>
            )
          })}
        </svg>
        <div className="map-key">
          <span><i className="k-dot" style={{ background: '#f472b6' }} /> fly being updated</span>
          <span><i className="k-dot" style={{ background: '#5eead4' }} /> its best neighbour</span>
          <span><i className="k-dot" style={{ background: '#fbbf24' }} /> best fly in the swarm</span>
        </div>
        <p className="sim-note">Click any fly in the ring to update that one instead.</p>
      </div>
      <div className="sim-side">
        <table className="table compact">
          <thead>
            <tr><th>fly</th><th>position</th><th>fitness</th><th>role</th></tr>
          </thead>
          <tbody>
            {FLIES.map((x, k) => (
              <tr key={k} style={{ color: col(k) }}>
                <td>x{sub(k)}</td>
                <td>[{x.join(', ')}]</td>
                <td>{fit[k]}</td>
                <td>{k === s ? 'swarm best (xₛ)' : k === i ? 'current fly (xᵢ)' : k === n ? 'best neighbour' : k === l || k === r ? 'other neighbour' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {i === s ? (
          <p className="sim-note warn">x{sub(s)} is the best fly, so DFO leaves it exactly where it is (this is called <b>elitism</b>: never lose your best answer). Pick another fly.</p>
        ) : (
          <>
            <p className="sim-note">
              Neighbours of x{sub(i)} on the ring are x{sub(l)} (f = {fit[l]}) and x{sub(r)} (f = {fit[r]}). The smaller fitness wins, so the best neighbour is <b style={{ color: '#5eead4' }}>x{sub(n)}</b>.
            </p>
            {[0, 1, 2].map((d) => (
              <div className="worked-row" key={d}>
                <Slider label={`u for dimension ${d}`} value={u[d]} min={0} max={1} step={0.01} onChange={(v) => setU(u.map((o, k) => (k === d ? v : o)))} format={(v) => v.toFixed(2)} />
                <div className="worked-eq">
                  <span style={{ color: '#5eead4' }}>{FLIES[n][d]}</span> + {u[d].toFixed(2)} × (<span style={{ color: '#fbbf24' }}>{FLIES[s][d]}</span> − <span style={{ color: '#f472b6' }}>{FLIES[i][d]}</span>) = <b>{fmt(next[d], 2)}</b>
                </div>
              </div>
            ))}
            <Stats
              items={[
                { label: 'old position', value: `[${FLIES[i].join(', ')}]` },
                { label: 'new position', value: `[${next.map((v) => fmt(v, 2)).join(', ')}]`, color: '#f472b6' },
                { label: 'old fitness → new fitness', value: `${fit[i]} → ${fmt(sphere(next), 2)}`, color: sphere(next) < fit[i] ? '#5eead4' : '#f87171' },
              ]}
            />
          </>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── Week 4 task: find / track the brightest spot in an image ───────────────────────── */
const IW = 480
const IH = 320

export function ImageTracker() {
  const [delta, setDelta] = useState(0.01)
  const [N, setN] = useState(30)
  const [running, setRunning] = useState(true)
  const [moving, setMoving] = useState(false)
  const [second, setSecond] = useState(false)
  const [fading, setFading] = useState(false)
  const cv = useRef(null)
  const world = useRef({ ax: 340, ay: 110, bx: 110, by: 230, t: 0, wa: 1, wb: 0.75 })
  const inst = useRef(null)
  const force = useForce()

  const brightness = (x, y) => {
    const w = world.current
    let b = w.wa * Math.exp(-((x - w.ax) ** 2 + (y - w.ay) ** 2) / (2 * 45 * 45))
    if (second || fading) b += w.wb * Math.exp(-((x - w.bx) ** 2 + (y - w.by) ** 2) / (2 * 45 * 45))
    // faint texture so the image is not perfectly smooth
    b += 0.04 * (Math.sin(x * 0.05) * Math.cos(y * 0.07) + 1)
    return b
  }
  const brightRef = useRef(brightness)
  brightRef.current = brightness

  const reset = () => {
    // DFO minimises, we want the BRIGHTEST pixel, so fitness = −brightness.
    inst.current = new DFO({ f: (p) => -brightRef.current(p[0], p[1]), D: 2, lo: [0, 0], hi: [IW, IH], N, delta, dynamic: true })
    force()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, [N])
  useEffect(() => { if (inst.current) inst.current.delta = delta }, [delta])
  useEffect(() => {
    const w = world.current
    if (!fading) { w.wa = 1; w.wb = 0.75 }
  }, [fading])

  const paint = () => {
    const c = cv.current
    if (!c) return
    const ctx = c.getContext('2d')
    const res = 4
    const img = ctx.createImageData(IW / res, IH / res)
    for (let j = 0; j < IH / res; j++)
      for (let i = 0; i < IW / res; i++) {
        const v = Math.min(255, brightness(i * res, j * res) * 255)
        const k = (j * (IW / res) + i) * 4
        img.data[k] = v
        img.data[k + 1] = v
        img.data[k + 2] = v * 0.95
        img.data[k + 3] = 255
      }
    const off = document.createElement('canvas')
    off.width = IW / res
    off.height = IH / res
    off.getContext('2d').putImageData(img, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(off, 0, 0, IW, IH)
    const a = inst.current
    if (!a) return
    for (let i = 0; i < a.N; i++) {
      ctx.beginPath()
      ctx.arc(a.X[i][0], a.X[i][1], i === a.best ? 6 : 3.5, 0, Math.PI * 2)
      ctx.fillStyle = i === a.best ? '#fbbf24' : a.restarted.has(i) ? '#f472b6' : '#5eead4'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  const step = () => {
    const w = world.current
    w.t += 1
    if (moving) {
      w.ax = IW / 2 + Math.cos(w.t * 0.02) * 160
      w.ay = IH / 2 + Math.sin(w.t * 0.031) * 100
    }
    if (fading) {
      const ph = (Math.sin(w.t * 0.012) + 1) / 2
      w.wa = 0.15 + 0.85 * ph
      w.wb = 0.15 + 0.85 * (1 - ph)
    }
    inst.current.step()
    paint()
    force()
  }
  useLoop(step, running, 20)
  useEffect(paint)

  const click = (e) => {
    const r = cv.current.getBoundingClientRect()
    world.current.ax = ((e.clientX - r.left) / r.width) * IW
    world.current.ay = ((e.clientY - r.top) / r.height) * IH
    paint()
  }

  const a = inst.current
  const w = world.current
  const trueBest = Math.max(brightness(w.ax, w.ay), second || fading ? brightness(w.bx, w.by) : 0)
  const found = a ? -a.fit[a.best] : 0

  return (
    <div className="sim-grid">
      <div>
        <canvas ref={cv} width={IW} height={IH} className="canvas-wide" onClick={click} style={{ cursor: 'crosshair' }} />
        <p className="sim-note">Click anywhere on the image to teleport the bright spot. Gold = the fly on the brightest pixel found; pink = a fly that was just restarted by Δ.</p>
      </div>
      <div className="sim-side">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run'}</Btn>
          <Btn onClick={reset}>Reset flies</Btn>
        </div>
        <Stats
          items={[
            { label: 'brightness under the best fly', value: fmt(found, 2), color: '#fbbf24' },
            { label: 'true brightest value in the image', value: fmt(trueBest, 2) },
            { label: 'swarm is', value: found > trueBest * 0.9 ? 'on target' : 'lost / on the wrong spot', color: found > trueBest * 0.9 ? '#5eead4' : '#f87171' },
          ]}
        />
        <Slider label="Disturbance threshold Δ" value={delta} min={0} max={0.3} step={0.005} onChange={setDelta} format={(v) => v.toFixed(3)} hint="Set this to 0, wait for the swarm to collapse, then move the spot." />
        <Slider label="Number of flies N" value={N} min={5} max={100} onChange={setN} />
        <Toggle label="Task 4: the bright object moves continuously" checked={moving} onChange={setMoving} />
        <Toggle label="Task 6: add a second, dimmer bright spot" checked={second} onChange={(v) => { setSecond(v); if (v) setFading(false) }} />
        <Toggle label="Task 5: one object fades out while another emerges" checked={fading} onChange={(v) => { setFading(v); if (v) setSecond(false) }} />
      </div>
    </div>
  )
}

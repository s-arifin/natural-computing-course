import { useEffect, useMemo, useRef, useState } from 'react'
import { Btn, Slider, Select, Stats } from '../components/ui'
import LineChart from '../components/LineChart'
import TourMap from '../components/TourMap'
import { fmt, randInt, useLoop, useForce, mean } from '../lib/util'
import { ukProblem, randomProblem, tourLength } from '../lib/tsp'

/* ───────────────────────── Goss et al. choice formula ───────────────────────── */
export const goss = (m1, m2, k, h) => (m1 + k) ** h / ((m1 + k) ** h + (m2 + k) ** h)

export function GossCalc() {
  const [m1, setM1] = useState(30)
  const [m2, setM2] = useState(10)
  const [k, setK] = useState(20)
  const [h, setH] = useState(2)
  const p = goss(m1, m2, k, h)
  return (
    <div className="sim-grid one">
      <div className="slider-grid">
        <Slider label="m₁: ants that have used bridge 1" value={m1} min={0} max={200} onChange={setM1} />
        <Slider label="m₂: ants that have used bridge 2" value={m2} min={0} max={200} onChange={setM2} />
        <Slider label="k: how attractive an unmarked bridge is" value={k} min={0} max={100} onChange={setK} hint="Big k = ants ignore pheromone until there is a lot of it." />
        <Slider label="h: how strongly ants react to a difference" value={h} min={0} max={5} step={0.1} onChange={setH} hint="h = 0: coin toss. h = 1: proportional. h > 1: the leader gets an extra boost." />
      </div>
      <div className="probbar">
        <div style={{ width: `${p * 100}%`, background: '#5eead4' }}>bridge 1: {(p * 100).toFixed(1)}%</div>
        <div style={{ width: `${(1 - p) * 100}%`, background: '#fbbf24' }}>bridge 2: {((1 - p) * 100).toFixed(1)}%</div>
      </div>
      <p className="sim-note mono">
        p₁ = ({m1} + {k})^{h} ÷ [ ({m1} + {k})^{h} + ({m2} + {k})^{h} ] = {fmt((m1 + k) ** h, 1)} ÷ {fmt((m1 + k) ** h + (m2 + k) ** h, 1)} = <b>{p.toFixed(3)}</b>
      </p>
    </div>
  )
}

/* ───────────────────────── Double-bridge experiment ───────────────────────── */
export function DoubleBridge() {
  const [ratio, setRatio] = useState(2)
  const [k, setK] = useState(20)
  const [h, setH] = useState(2)
  const [evap, setEvap] = useState(0)
  const [running, setRunning] = useState(true)
  const st = useRef(null)
  const force = useForce()
  const SHORT = 40

  const reset = () => {
    // ph[side][branch]: pheromone an ant can smell at each end of each branch (0 = short, 1 = long)
    st.current = { ants: [], ph: [[0, 0], [0, 0]], t: 0, recent: [], hist: [], totals: [0, 0] }
    force()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, [ratio])

  const choose = (s, side) => {
    const p = goss(s.ph[side][0], s.ph[side][1], k, h)
    const br = Math.random() < p ? 0 : 1
    s.ph[side][br] += 1 // lays pheromone as it enters the branch
    s.recent.push(br)
    if (s.recent.length > 120) s.recent.shift()
    s.totals[br]++
    return br
  }
  const step = () => {
    const s = st.current
    s.t++
    if (s.ants.length < 60 && s.t % 3 === 0) s.ants.push({ side: 0, br: choose(s, 0), prog: 0 })
    for (const a of s.ants) {
      a.prog += 1
      const len = a.br === 0 ? SHORT : SHORT * ratio
      if (a.prog >= len) {
        const arrive = 1 - a.side
        s.ph[arrive][a.br] += 1 // its trail now reaches the far end of the branch
        a.side = arrive
        a.br = choose(s, arrive)
        a.prog = 0
      }
    }
    if (evap > 0) for (const side of s.ph) for (let b = 0; b < 2; b++) side[b] *= 1 - evap
    if (s.t % 8 === 0) {
      s.hist.push(s.recent.length ? (s.recent.filter((b) => b === 0).length / s.recent.length) * 100 : 50)
      if (s.hist.length > 400) s.hist.shift()
    }
    force()
  }
  useLoop(step, running, 40)
  const s = st.current
  if (!s) return null
  const shareShort = s.recent.length ? s.recent.filter((b) => b === 0).length / s.recent.length : 0.5
  const tot = [s.ph[0][0] + s.ph[1][0], s.ph[0][1] + s.ph[1][1]]
  const maxT = Math.max(tot[0], tot[1], 1)
  // geometry: short branch = shallow arc (top), long branch = deep arc (bottom)
  const x0 = 70
  const x1 = 490
  const bend = [60, 60 + (ratio - 1) * 95 + (ratio === 1 ? 0 : 20)]
  const pt = (br, f) => {
    const sgn = br === 0 ? -1 : 1
    const x = x0 + (x1 - x0) * f
    const y = 150 + sgn * bend[br] * Math.sin(Math.PI * f)
    return [x, y]
  }
  const arc = (br) => Array.from({ length: 41 }, (_, i) => pt(br, i / 40)).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')
  return (
    <div className="sim-grid one">
      <svg viewBox="0 0 560 300" className="svg-panel">
        {[0, 1].map((br) => (
          <g key={br}>
            <path d={arc(br)} fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
            <path d={arc(br)} fill="none" stroke="#a78bfa" strokeOpacity={0.25 + 0.75 * (tot[br] / maxT)} strokeWidth={2 + 12 * (tot[br] / maxT)} strokeLinecap="round" />
          </g>
        ))}
        <circle cx={x0 - 22} cy="150" r="26" fill="#0b1020" stroke="#94a3b8" strokeWidth="2" />
        <text x={x0 - 22} y="154" textAnchor="middle" fontSize="12" fill="#e2e8f0">nest</text>
        <circle cx={x1 + 22} cy="150" r="26" fill="#0b1020" stroke="#fbbf24" strokeWidth="2" />
        <text x={x1 + 22} y="154" textAnchor="middle" fontSize="12" fill="#fbbf24">food</text>
        {s.ants.map((a, i) => {
          const len = a.br === 0 ? SHORT : SHORT * ratio
          const f = a.prog / len
          const [x, y] = pt(a.br, a.side === 0 ? f : 1 - f)
          return <circle key={i} cx={x} cy={y} r="3.2" fill={a.side === 0 ? '#f8fafc' : '#fbbf24'} />
        })}
        <text x="280" y={150 - bend[0] - 14} textAnchor="middle" fontSize="12" fill="#cbd5e1">{ratio === 1 ? 'branch A' : 'short branch'} · pheromone {fmt(tot[0], 0)}</text>
        <text x="280" y={150 + bend[1] + 24} textAnchor="middle" fontSize="12" fill="#cbd5e1">{ratio === 1 ? 'branch B (same length)' : `long branch (${ratio}× longer)`} · pheromone {fmt(tot[1], 0)}</text>
      </svg>
      <div className="sim-side row">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run'}</Btn>
          <Btn onClick={reset}>Restart the experiment</Btn>
          <Btn small active={ratio === 1} onClick={() => setRatio(1)}>Experiment I: equal branches</Btn>
          <Btn small active={ratio === 2} onClick={() => setRatio(2)}>Experiment II: one branch 2× longer</Btn>
        </div>
        <Stats
          items={[
            { label: `recent choices for the ${ratio === 1 ? 'top' : 'short'} branch`, value: `${Math.round(shareShort * 100)}%`, color: '#5eead4' },
            { label: 'total choices so far (top / bottom)', value: `${s.totals[0]} / ${s.totals[1]}` },
          ]}
        />
        <div className="slider-grid">
          <Slider label="Length ratio (long ÷ short)" value={ratio} min={1} max={3} step={0.25} onChange={setRatio} />
          <Slider label="k" value={k} min={1} max={60} onChange={setK} />
          <Slider label="h" value={h} min={0} max={4} step={0.1} onChange={setH} />
          <Slider label="Evaporation per tick" value={evap} min={0} max={0.02} step={0.001} onChange={setEvap} format={(v) => `${(v * 100).toFixed(1)}%`} hint="Real pheromone fades. This is the negative feedback that lets a colony forget." />
        </div>
      </div>
      <LineChart series={[{ name: `% of recent ants choosing the ${ratio === 1 ? 'top' : 'short'} branch`, color: '#5eead4', data: s.hist.length > 1 ? s.hist : [50, 50] }]} yLabel="%" xLabel="time" height={150} />
    </div>
  )
}

/* ───────────────────────── Transition rule calculator ───────────────────────── */
const OPTIONS = [
  { name: 'B', dist: 2, tau: 1 },
  { name: 'C', dist: 5, tau: 4 },
  { name: 'D', dist: 10, tau: 1 },
]

export function TransitionCalc() {
  const [alpha, setAlpha] = useState(1)
  const [beta, setBeta] = useState(2)
  const [tau, setTau] = useState(OPTIONS.map((o) => o.tau))
  const score = OPTIONS.map((o, i) => tau[i] ** alpha * (1 / o.dist) ** beta)
  const total = score.reduce((a, b) => a + b, 0)
  const cols = ['#5eead4', '#fbbf24', '#f472b6']
  return (
    <div className="sim-grid one">
      <p className="sim-note">An ant is standing at city <b>A</b>. It has three unvisited cities to choose from. Change how much pheromone is on each road and how much the ant cares about pheromone (α) versus distance (β).</p>
      <div className="slider-grid">
        <Slider label="α: how much the ant trusts pheromone" value={alpha} min={0} max={5} step={0.1} onChange={setAlpha} />
        <Slider label="β: how much the ant trusts short distances" value={beta} min={0} max={8} step={0.1} onChange={setBeta} />
        {OPTIONS.map((o, i) => (
          <Slider key={o.name} label={`Pheromone T(A, ${o.name}) on the road to ${o.name} (${o.dist} km away)`} value={tau[i]} min={0.1} max={10} step={0.1} onChange={(v) => setTau(tau.map((t, k) => (k === i ? v : t)))} />
        ))}
      </div>
      <table className="table compact">
        <thead>
          <tr><th>road</th><th>T (pheromone)</th><th>H = 1 ÷ distance</th><th>T^α × H^β</th><th>probability = that ÷ total</th></tr>
        </thead>
        <tbody>
          {OPTIONS.map((o, i) => (
            <tr key={o.name}>
              <td style={{ color: cols[i], fontWeight: 700 }}>A → {o.name}</td>
              <td>{tau[i]}</td>
              <td>1 ÷ {o.dist} = {fmt(1 / o.dist, 2)}</td>
              <td>{tau[i]}^{alpha} × {fmt(1 / o.dist, 2)}^{beta} = {fmt(score[i], 4)}</td>
              <td><b>{((score[i] / total) * 100).toFixed(1)}%</b></td>
            </tr>
          ))}
          <tr><td colSpan="3" /><td>total = {fmt(total, 4)}</td><td>100%</td></tr>
        </tbody>
      </table>
      <div className="probbar">
        {OPTIONS.map((o, i) => (
          <div key={o.name} style={{ width: `${(score[i] / total) * 100}%`, background: cols[i] }}>{o.name}</div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Ant System on the TSP ───────────────────────── */
export function AcoTsp() {
  const [which, setWhich] = useState('20')
  const [seed, setSeed] = useState(0)
  const [m, setM] = useState(20)
  const [alpha, setAlpha] = useState(1)
  const [beta, setBeta] = useState(3)
  const [rho, setRho] = useState(0.7)
  const [running, setRunning] = useState(false)
  const prob = useMemo(() => (which === 'uk' ? ukProblem() : randomProblem(Number(which))), [which, seed])
  const n = prob.pts.length
  const st = useRef(null)
  const force = useForce()

  const reset = () => {
    const scale = mean(prob.dist.flat()) * n // typical tour length, so deposits are on a sensible scale
    st.current = { T: prob.dist.map((r) => r.map(() => 1)), best: null, bestL: Infinity, it: 0, hist: [], itHist: [], scale }
    force()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setRunning(false); reset() }, [prob])

  const buildTour = (s) => {
    const start = randInt(n)
    const tour = [start]
    const visited = new Array(n).fill(false)
    visited[start] = true
    for (let step = 1; step < n; step++) {
      const r = tour[tour.length - 1]
      // transition rule: score every unvisited city, then pick one with probability proportional to its score
      const w = new Array(n).fill(0)
      let total = 0
      for (let c = 0; c < n; c++) {
        if (visited[c]) continue
        w[c] = s.T[r][c] ** alpha * (1 / prob.dist[r][c]) ** beta
        total += w[c]
      }
      let pick = Math.random() * total
      let next = -1
      for (let c = 0; c < n; c++) {
        if (visited[c]) continue
        next = c
        pick -= w[c]
        if (pick <= 0) break
      }
      tour.push(next)
      visited[next] = true
    }
    return tour
  }
  const step = () => {
    const s = st.current
    const tours = Array.from({ length: m }, () => buildTour(s))
    const lens = tours.map((t) => tourLength(t, prob.dist))
    // global pheromone update: evaporate everywhere, then every ant deposits 1/L on its own tour
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s.T[i][j] *= rho
    tours.forEach((t, k) => {
      const add = s.scale / lens[k]
      for (let i = 0; i < n; i++) {
        const a = t[i]
        const b = t[(i + 1) % n]
        s.T[a][b] += add
        s.T[b][a] += add
      }
    })
    const bi = lens.indexOf(Math.min(...lens))
    if (lens[bi] < s.bestL) {
      s.bestL = lens[bi]
      s.best = tours[bi]
    }
    s.it++
    s.hist.push(s.bestL)
    s.itHist.push(mean(lens))
    force()
  }
  useLoop(step, running, 10)
  const s = st.current
  if (!s || s.T.length !== n) return null
  return (
    <div className="sim-grid">
      <div>
        <TourMap pts={prob.pts} tour={s.best} pher={s.T} labels={n <= 12} />
        <div className="map-key">
          <span><i className="k-line" style={{ background: '#5eead4' }} /> pheromone (brighter and thicker = more)</span>
          <span><i className="k-line" style={{ background: '#fbbf24' }} /> best tour found so far</span>
        </div>
      </div>
      <div className="sim-side">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run'}</Btn>
          <Btn onClick={step} disabled={running}>One iteration</Btn>
          <Btn onClick={() => { setRunning(false); reset() }}>Reset pheromone</Btn>
          {which !== 'uk' && <Btn onClick={() => setSeed(seed + 1)}>New cities</Btn>}
        </div>
        <Stats
          items={[
            { label: 'iteration', value: s.it },
            { label: 'best tour length', value: s.best ? `${fmt(s.bestL, 1)} ${prob.unit}` : '–', color: '#fbbf24' },
            { label: 'average tour this iteration', value: s.itHist.length ? fmt(s.itHist[s.itHist.length - 1], 1) : '–' },
          ]}
        />
        <Select label="Cities" value={which} onChange={setWhich} options={[{ value: 'uk', label: 'The 8 UK cities from week 5' }, { value: '20', label: '20 random cities' }, { value: '40', label: '40 random cities' }, { value: '70', label: '70 random cities' }]} />
        <Slider label="m: number of ants" value={m} min={1} max={60} onChange={setM} />
        <Slider label="α: influence of pheromone" value={alpha} min={0} max={5} step={0.1} onChange={setAlpha} hint="0 = ants ignore each other completely." />
        <Slider label="β: influence of distance (the heuristic)" value={beta} min={0} max={8} step={0.1} onChange={setBeta} hint="0 = ants are blind to distance and rely only on pheromone." />
        <Slider label="ρ: fraction of pheromone that survives each iteration" value={rho} min={0.1} max={1} step={0.01} onChange={setRho} format={(v) => `${v.toFixed(2)} (so ${Math.round((1 - v) * 100)}% evaporates)`} />
        <LineChart series={[{ name: 'best so far', color: '#fbbf24', data: s.hist }, { name: 'average of this iteration’s ants', color: '#5eead4', data: s.itHist }]} xLabel="iteration" yLabel="tour length" height={150} />
      </div>
    </div>
  )
}

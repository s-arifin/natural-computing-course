import { useEffect, useMemo, useRef, useState } from 'react'
import Surface3D from '../components/Surface3D'
import { Btn, Slider, Select, Stats, Toggle } from '../components/ui'
import { BENCH, BENCH_LIST } from '../lib/benchmarks'
import { DFO, HillClimbers } from '../lib/algos'
import { fmt, useLoop, useForce } from '../lib/util'

/* ───────────────────────── Search-space size calculator ───────────────────────── */
const UNIVERSE_YEARS = 1.38e10

function bigPow(base, exp) {
  let r = 1n
  for (let i = 0; i < exp; i++) r *= BigInt(base)
  return r
}
function sci(b) {
  const s = b.toString()
  if (s.length <= 7) return Number(s).toLocaleString('en-GB')
  return `${s[0]}.${s.slice(1, 3)} × 10^${s.length - 1}`
}

export function SearchSpaceCalc() {
  const [D, setD] = useState(3)
  const [gran, setGran] = useState(1)
  const [speed, setSpeed] = useState(100)
  const total = bigPow(360 * gran, D)
  const digits = total.toString().length - 1
  const lead = Number(total.toString().slice(0, 4)) / 1000
  const log10secs = Math.log10(lead) + digits - Math.log10(speed)
  const log10years = log10secs - Math.log10(3600 * 24 * 365.25)
  const years = 10 ** log10years
  const timeText =
    log10years > 6
      ? `${(10 ** (log10years - Math.floor(log10years))).toFixed(2)} × 10^${Math.floor(log10years)} years`
      : years >= 1
        ? `${fmt(years, 1)} years`
        : years * 365.25 >= 1
          ? `${fmt(years * 365.25, 1)} days`
          : `${fmt(years * 365.25 * 24 * 3600, 1)} seconds`
  const universes = log10years - Math.log10(UNIVERSE_YEARS)
  return (
    <div className="sim-grid one">
      <div className="slider-grid">
        <Slider label="D: number of angles to choose (dimensionality)" value={D} min={1} max={30} onChange={setD} hint="A protein with n beads has D = n − 2 angles." />
        <Select label="Granularity: how finely each angle is divided" value={String(gran)} onChange={(v) => setGran(Number(v))} options={[{ value: '1', label: 'whole degrees (360 options per angle)' }, { value: '10', label: 'tenths of a degree (3,600 options)' }, { value: '100', label: 'hundredths of a degree (36,000 options)' }]} />
        <Select label="How fast can we test solutions?" value={String(speed)} onChange={(v) => setSpeed(Number(v))} options={[{ value: '100', label: '100 per second (the lecture’s figure)' }, { value: '1000000', label: '1 million per second' }, { value: '1000000000', label: '1 billion per second' }]} />
      </div>
      <div className="bigcalc">
        <div className="bigcalc-eq">
          ({(360 * gran).toLocaleString('en-GB')})<sup>{D}</sup> = <b>{sci(total)}</b> possible solutions
        </div>
        <div className="bigcalc-row">
          Testing every single one would take <b>{timeText}</b>
        </div>
        <div className={`bigcalc-row ${universes > 0 ? 'bad' : 'ok'}`}>
          {universes > 0
            ? universes > 3
              ? `That is about 10^${Math.floor(universes)} times the age of the universe.`
              : `That is about ${fmt(10 ** universes, 1)} times the age of the universe.`
            : 'Brute force is possible here. Nature-inspired search is not needed yet.'}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Protein toy model ───────────────────────── */
const SEQS = { ABBAB: 'ABBAB', AABAB: 'AABAB', ABBABBAB: 'ABBABBAB', ABBABBABABBAB: 'ABBABBABABBAB' }

export function proteinEnergy(anglesDeg, seq) {
  const n = seq.length
  const pts = [[0, 0], [1, 0]]
  let h = 0
  let bend = 0
  for (let i = 0; i < n - 2; i++) {
    const t = (anglesDeg[i] * Math.PI) / 180
    h += t
    bend += (1 - Math.cos(t)) / 4
    const p = pts[pts.length - 1]
    pts.push([p[0] + Math.cos(h), p[1] + Math.sin(h)])
  }
  let lj = 0
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 2; j < n; j++) {
      const r = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1])
      const xi = seq[i] === 'A' ? 1 : -1
      const xj = seq[j] === 'A' ? 1 : -1
      const C = (1 + xi + xj + 5 * xi * xj) / 8
      const rr = Math.max(r, 1e-3)
      lj += 4 * (rr ** -12 - C * rr ** -6)
    }
  }
  return { energy: bend + lj, bend, lj, pts }
}

export function ProteinFold() {
  const [seq, setSeq] = useState('ABBAB')
  const D = seq.length - 2
  const [angles, setAngles] = useState(() => new Array(3).fill(0))
  const [folding, setFolding] = useState(false)
  const dfo = useRef(null)
  const [iter, setIter] = useState(0)

  useEffect(() => {
    setAngles(new Array(D).fill(0))
    setFolding(false)
    dfo.current = null
  }, [seq, D])

  const a = angles.length === D ? angles : new Array(D).fill(0)
  const { energy, bend, lj, pts } = useMemo(() => proteinEnergy(a, seq), [a, seq])

  const fold = () => {
    if (!dfo.current) dfo.current = new DFO({ f: (x) => proteinEnergy(x, seq).energy, D, lo: -180, hi: 180, N: 40, delta: 0.005 })
    setFolding(true)
  }
  useLoop(
    () => {
      for (let k = 0; k < 4; k++) dfo.current.step()
      setAngles(dfo.current.bestPos.slice())
      setIter(dfo.current.iter)
      if (dfo.current.iter >= 600) setFolding(false)
    },
    folding,
    30,
  )

  // fit drawing to view
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 3) + 1.4
  const S = 300 / span
  const P = (p) => [170 + (p[0] - cx) * S, 160 - (p[1] - cy) * S]

  return (
    <div className="sim-grid">
      <div>
        <svg viewBox="0 0 340 320" className="svg-panel">
          {pts.slice(1).map((p, i) => {
            const [x1, y1] = P(pts[i])
            const [x2, y2] = P(p)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="3" />
          })}
          {pts.map((p, i) => {
            const [x, y] = P(p)
            const A = seq[i] === 'A'
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={Math.min(15, S * 0.36)} fill={A ? '#f87171' : '#60a5fa'} stroke="#0b1020" strokeWidth="2" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0b1020">{seq[i]}</text>
              </g>
            )
          })}
        </svg>
        <div className="map-key">
          <span><i className="k-dot" style={{ background: '#f87171' }} /> A = hydrophobic (hides from water)</span>
          <span><i className="k-dot" style={{ background: '#60a5fa' }} /> B = hydrophilic (likes water)</span>
        </div>
      </div>
      <div className="sim-side">
        <Select label="Amino-acid sequence" value={seq} onChange={setSeq} options={Object.keys(SEQS).map((s) => ({ value: s, label: `${s}  (n = ${s.length}, so D = ${s.length - 2} angles)` }))} />
        <Stats
          items={[
            { label: 'Energy = fitness (lower is better)', value: fmt(energy), color: '#fbbf24' },
            { label: 'part 1: bending cost', value: fmt(bend) },
            { label: 'part 2: bead-to-bead attraction / repulsion', value: fmt(lj) },
          ]}
        />
        <div className="slider-grid tight">
          {a.map((v, i) => (
            <Slider key={i} label={`θ${i + 1} (bend at bead ${i + 2})`} value={Math.round(v)} min={-180} max={179} onChange={(nv) => { dfo.current = null; setAngles(a.map((o, k) => (k === i ? nv : o))) }} format={(x) => `${x}°`} />
          ))}
        </div>
        <div className="btn-row">
          <Btn primary onClick={fold} disabled={folding}>{folding ? `DFO folding… iteration ${iter}` : 'Let a swarm (DFO) fold it'}</Btn>
          <Btn onClick={() => { dfo.current = null; setFolding(false); setAngles(a.map(() => Math.round(Math.random() * 360 - 180))) }}>Random guess</Btn>
          <Btn onClick={() => { dfo.current = null; setFolding(false); setAngles(new Array(D).fill(0)) }}>Straighten</Btn>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── 3-D landscape explorer ───────────────────────── */
export function LandscapeExplorer() {
  const [fnKey, setFnKey] = useState('rastrigin')
  const [mode, setMode] = useState(null) // 'hc' | 'dfo'
  const [running, setRunning] = useState(false)
  const [rotate, setRotate] = useState(true)
  const bench = BENCH[fnKey]
  const inst = useRef(null)
  const pointsRef = useRef([])
  const bestRef = useRef(null)
  const force = useForce()

  const start = (m) => {
    const o = { f: bench.f, D: 2, lo: bench.lo, hi: bench.hi, N: 30 }
    inst.current = m === 'hc' ? new HillClimbers({ ...o, sigma: 0.012 }) : new DFO({ ...o, delta: 0.002 })
    pointsRef.current = inst.current.X
    bestRef.current = inst.current.bestPos
    setMode(m)
    setRunning(true)
  }
  useEffect(() => {
    inst.current = null
    pointsRef.current = []
    bestRef.current = null
    setMode(null)
    setRunning(false)
  }, [fnKey])

  useLoop(
    () => {
      const a = inst.current
      a.step()
      pointsRef.current = a.X
      bestRef.current = a.bestPos
      if (a.iter > 400) setRunning(false)
      force()
    },
    running,
    mode === 'hc' ? 30 : 10,
  )

  const a = inst.current
  // "solved" = within a small distance of the true global minimum value (0 for all of these)
  const reached = a ? a.fit.filter((v) => v < (fnKey === 'schwefel' ? 5 : fnKey === 'ackley' ? 0.5 : 0.5)).length : 0

  return (
    <div className="sim-grid one">
      <Surface3D f={bench.f} lo={bench.lo} hi={bench.hi} scale={bench.scale} pointsRef={pointsRef} bestRef={bestRef} autoRotate={rotate} />
      <div className="sim-side row">
        <div className="btn-row">
          {BENCH_LIST.map((b) => (
            <Btn key={b.key} small active={b.key === fnKey} onClick={() => setFnKey(b.key)}>{b.name}</Btn>
          ))}
          <Toggle label="auto-rotate" checked={rotate} onChange={setRotate} />
        </div>
        <p className="sim-note">
          <b>{bench.name}</b>: {bench.kind}. {bench.blurb} Global minimum at {bench.optimum}. Range of each variable: [{bench.lo}, {bench.hi}]. Drag to rotate, scroll to zoom.
        </p>
        <div className="btn-row">
          <Btn primary onClick={() => start('hc')}>Drop 30 greedy hill-climbers</Btn>
          <Btn primary onClick={() => start('dfo')}>Release a swarm of 30 flies (DFO)</Btn>
        </div>
        {a && (
          <Stats
            items={[
              { label: mode === 'hc' ? 'method: each ball only ever steps downhill, alone' : 'method: flies share information (DFO)', value: `step ${a.iter}` },
              { label: 'best fitness found', value: fmt(a.bestFit), color: '#fbbf24' },
              { label: 'agents that reached the global minimum', value: `${reached} / 30`, color: reached > 15 ? '#5eead4' : '#f87171' },
            ]}
          />
        )}
      </div>
    </div>
  )
}

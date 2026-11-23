import { useEffect, useMemo, useRef, useState } from 'react'
import { Btn, Slider, Select, Stats, Toggle } from '../components/ui'
import LineChart from '../components/LineChart'
import TourMap from '../components/TourMap'
import { fmt, randInt, useLoop, useForce, mean, PALETTE } from '../lib/util'
import { ukProblem, randomProblem, tourLength, randomTour, bruteForce, orderCrossover, tourCount, UK } from '../lib/tsp'

/* ───────────────────────── Evolve a sentence ───────────────────────── */
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ '
const rc = () => ALPHA[randInt(ALPHA.length)]

export function EvolveString() {
  const [target, setTarget] = useState('SURVIVAL OF THE FITTEST')
  const [N, setN] = useState(100)
  const [pm, setPm] = useState(0.02)
  const [selection, setSelection] = useState(true)
  const [crossover, setCrossover] = useState(true)
  const [elitism, setElitism] = useState(true)
  const [running, setRunning] = useState(false)
  const st = useRef(null)
  const force = useForce()
  const T = target.toUpperCase().replace(/[^A-Z ]/g, '') || 'A'
  const fitness = (s) => {
    let k = 0
    for (let i = 0; i < T.length; i++) if (s[i] === T[i]) k++
    return k
  }
  const reset = () => {
    const pop = Array.from({ length: N }, () => Array.from({ length: T.length }, rc).join(''))
    st.current = { pop, gen: 0, best: [], avg: [] }
    record()
    force()
  }
  const record = () => {
    const s = st.current
    const f = s.pop.map(fitness)
    s.fit = f
    s.bi = f.indexOf(Math.max(...f))
    s.best.push(f[s.bi])
    s.avg.push(mean(f))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setRunning(false); reset() }, [T, N])

  const pick = (s) => {
    if (!selection) return s.pop[randInt(N)]
    // tournament of 3: pick three at random, the fittest becomes a parent
    let b = randInt(N)
    for (let k = 0; k < 2; k++) {
      const c = randInt(N)
      if (s.fit[c] > s.fit[b]) b = c
    }
    return s.pop[b]
  }
  const step = () => {
    const s = st.current
    if (s.fit[s.bi] === T.length) { setRunning(false); return }
    const next = elitism ? [s.pop[s.bi]] : []
    while (next.length < N) {
      const a = pick(s)
      const b = pick(s)
      let child = a
      if (crossover) {
        const cut = 1 + randInt(T.length - 1)
        child = a.slice(0, cut) + b.slice(cut)
      }
      let out = ''
      for (let i = 0; i < child.length; i++) out += Math.random() < pm ? rc() : child[i]
      next.push(out)
    }
    s.pop = next
    s.gen++
    record()
    force()
  }
  useLoop(step, running, 20)
  const s = st.current
  if (!s) return null
  const best = s.pop[s.bi]
  const sample = s.pop.slice(0, 6)
  return (
    <div className="sim-grid">
      <div>
        <div className="evo-target">target: <span>{T}</span></div>
        <div className="evo-best">
          {best.split('').map((c, i) => (
            <span key={i} className={c === T[i] ? 'hit' : 'miss'}>{c === ' ' ? '␣' : c}</span>
          ))}
        </div>
        <div className="evo-pop">
          <div className="evo-pop-title">six other members of the population right now</div>
          {sample.map((p, k) => (
            <div key={k}>
              {p.split('').map((c, i) => (
                <span key={i} className={c === T[i] ? 'hit' : 'miss'}>{c === ' ' ? '␣' : c}</span>
              ))}
              <em> fitness {fitness(p)}</em>
            </div>
          ))}
        </div>
        <LineChart series={[{ name: 'best in population', color: '#fbbf24', data: s.best }, { name: 'population average', color: '#5eead4', data: s.avg }]} yLabel="letters correct" xLabel="generation" height={160} />
      </div>
      <div className="sim-side">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Evolve'}</Btn>
          <Btn onClick={step} disabled={running}>One generation</Btn>
          <Btn onClick={() => { setRunning(false); reset() }}>Reset</Btn>
        </div>
        <Stats
          items={[
            { label: 'generation', value: s.gen },
            { label: 'best fitness', value: `${s.fit[s.bi]} / ${T.length}`, color: '#fbbf24' },
            { label: 'strings tested so far', value: (s.gen * N + N).toLocaleString('en-GB') },
            { label: 'size of search space', value: `27^${T.length} ≈ 10^${Math.round(T.length * Math.log10(27))}` },
          ]}
        />
        <label className="select">
          <span>Target sentence (letters and spaces)</span>
          <input type="text" value={target} maxLength={40} onChange={(e) => setTarget(e.target.value)} />
        </label>
        <Slider label="Population size" value={N} min={10} max={400} step={10} onChange={setN} />
        <Slider label="Mutation rate (chance each letter changes)" value={pm} min={0} max={0.3} step={0.005} onChange={setPm} format={(v) => `${(v * 100).toFixed(1)}%`} />
        <Toggle label="Selection: fitter strings are more likely to become parents" checked={selection} onChange={setSelection} />
        <Toggle label="Crossover: children mix two parents" checked={crossover} onChange={setCrossover} />
        <Toggle label="Elitism: the best string always survives unchanged" checked={elitism} onChange={setElitism} />
      </div>
    </div>
  )
}

/* ───────────────────────── Roulette wheel ───────────────────────── */
export function Roulette() {
  const [fit, setFit] = useState([10, 20, 5, 40, 25])
  const [counts, setCounts] = useState([0, 0, 0, 0, 0])
  const [angle, setAngle] = useState(0)
  const [last, setLast] = useState(null)
  const total = fit.reduce((a, b) => a + b, 0)
  const probs = fit.map((f) => f / total)
  const spinOnce = () => {
    // the algorithm: pick a random point on the wheel, walk round until you pass it
    let r = Math.random() * total
    let i = 0
    while (r > fit[i]) { r -= fit[i]; i++ }
    return i
  }
  const spin = () => {
    const i = spinOnce()
    const start = probs.slice(0, i).reduce((a, b) => a + b, 0)
    const mid = (start + probs[i] * (0.15 + Math.random() * 0.7)) * 360
    setAngle((a) => Math.ceil(a / 360) * 360 + 720 + (360 - mid))
    setLast(i)
    setCounts((c) => c.map((v, k) => (k === i ? v + 1 : v)))
  }
  const spinMany = () => {
    const c = [...counts]
    for (let k = 0; k < 1000; k++) c[spinOnce()]++
    setCounts(c)
    setLast(null)
  }
  const n = counts.reduce((a, b) => a + b, 0)
  let acc = 0
  const arcs = probs.map((p, i) => {
    const a0 = acc * 2 * Math.PI - Math.PI / 2
    acc += p
    const a1 = acc * 2 * Math.PI - Math.PI / 2
    const large = p > 0.5 ? 1 : 0
    const R = 100
    const d = `M0,0 L${R * Math.cos(a0)},${R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${R * Math.cos(a1)},${R * Math.sin(a1)} Z`
    const am = (a0 + a1) / 2
    return { d, i, tx: 62 * Math.cos(am), ty: 62 * Math.sin(am) }
  })
  return (
    <div className="sim-grid">
      <div>
        <svg viewBox="-125 -130 250 255" className="svg-panel">
          <g style={{ transform: `rotate(${angle}deg)`, transition: 'transform 1.6s cubic-bezier(.2,.8,.2,1)' }}>
            {arcs.map((a) => (
              <g key={a.i}>
                <path d={a.d} fill={PALETTE[a.i]} stroke="#0b1020" strokeWidth="2" opacity={last === null || last === a.i ? 1 : 0.55} />
                <text x={a.tx} y={a.ty + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b1020">c{a.i + 1}</text>
              </g>
            ))}
          </g>
          <polygon points="-9,-126 9,-126 0,-104" fill="#f8fafc" />
        </svg>
        <div className="btn-row center">
          <Btn primary onClick={spin}>Spin (select one parent)</Btn>
          <Btn onClick={spinMany}>Spin 1,000 times</Btn>
          <Btn onClick={() => { setCounts([0, 0, 0, 0, 0]); setLast(null) }}>Clear tally</Btn>
        </div>
      </div>
      <div className="sim-side">
        <table className="table compact">
          <thead>
            <tr><th>chromosome</th><th>fitness f</th><th>p = f ÷ total</th><th>times picked</th></tr>
          </thead>
          <tbody>
            {fit.map((f, i) => (
              <tr key={i}>
                <td style={{ color: PALETTE[i], fontWeight: 700 }}>c{i + 1}</td>
                <td><input className="num" type="number" min="0" max="100" value={f} onChange={(e) => setFit(fit.map((o, k) => (k === i ? Math.max(0, Number(e.target.value)) : o)))} /></td>
                <td>{f} ÷ {total} = <b>{(probs[i] * 100).toFixed(1)}%</b></td>
                <td>{counts[i]}{n > 0 && <em> ({((counts[i] / n) * 100).toFixed(1)}%)</em>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sim-note">Edit the fitness numbers. Try making one chromosome 1000 and the rest 1: it takes almost the whole wheel, and the others almost never reproduce. That is <b>premature convergence</b>, the main weakness of roulette selection.</p>
      </div>
    </div>
  )
}

/* ───────────────────────── Crossover lab (bit strings + order-1 for permutations) ───────────────────────── */
const C0 = [3, 7, 6, 1, 4, 5, 2, 8]
const C1 = [2, 4, 8, 5, 6, 3, 7, 1]

function Genes({ g, colorOf, bad }) {
  return (
    <span className="genes">
      {g.map((v, i) => (
        <span key={i} className={`gene ${bad && bad(i) ? 'bad' : ''}`} style={{ background: colorOf(i) }}>{v === null ? '–' : v}</span>
      ))}
    </span>
  )
}

export function CrossoverLab() {
  const [tab, setTab] = useState('bits')
  const [cut, setCut] = useState(2)
  const [flip, setFlip] = useState(null)
  const [a, setA] = useState(2)
  const [b, setB] = useState(4)
  const pa = [1, 1, 0, 0, 1, 0, 1, 1]
  const pb = [0, 0, 1, 1, 0, 1, 0, 0]
  const A = '#5eead4'
  const Bc = '#fbbf24'
  const childA = pa.map((v, i) => (i < cut ? v : pb[i])).map((v, i) => (flip === i ? 1 - v : v))
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const naive0 = C0.map((v, i) => (i < 5 ? v : C1[i]))
  const dup = (arr) => (i) => arr.indexOf(arr[i]) !== arr.lastIndexOf(arr[i])
  const ox0 = orderCrossover(C0, C1, lo, hi)
  const ox1 = orderCrossover(C1, C0, lo, hi)
  return (
    <div className="sim-grid one">
      <div className="btn-row">
        <Btn small active={tab === 'bits'} onClick={() => setTab('bits')}>Single-point crossover + mutation (bit strings)</Btn>
        <Btn small active={tab === 'naive'} onClick={() => setTab('naive')}>Why it breaks on TSP tours</Btn>
        <Btn small active={tab === 'ox'} onClick={() => setTab('ox')}>Order-1 crossover (the fix)</Btn>
      </div>
      {tab === 'bits' && (
        <div className="xlab">
          <Slider label="Cut point (crossover point)" value={cut} min={1} max={7} onChange={setCut} format={(v) => `after gene ${v}`} />
          <div className="xrow"><span>parent A</span><Genes g={pa} colorOf={() => A} /></div>
          <div className="xrow"><span>parent B</span><Genes g={pb} colorOf={() => Bc} /></div>
          <div className="xrow"><span>child</span>
            <span className="genes">
              {childA.map((v, i) => (
                <span key={i} className={`gene click ${flip === i ? 'mut' : ''}`} style={{ background: i < cut ? A : Bc }} onClick={() => setFlip(flip === i ? null : i)}>{v}</span>
              ))}
            </span>
          </div>
          <p className="sim-note">The child takes everything left of the cut from parent A (teal) and everything right of it from parent B (gold). <b>Click any gene of the child to mutate it</b> (flip 0 ↔ 1): the pink outline marks the mutated gene. Crossover recombines what already exists; mutation is the only way to create a value neither parent had at that position.</p>
        </div>
      )}
      {tab === 'naive' && (
        <div className="xlab">
          <div className="xrow"><span>c0</span><Genes g={C0} colorOf={() => A} /></div>
          <div className="xrow"><span>c1</span><Genes g={C1} colorOf={() => Bc} /></div>
          <div className="xrow"><span>child (cut after 5)</span><Genes g={naive0} colorOf={(i) => (i < 5 ? A : Bc)} bad={dup(naive0)} /></div>
          <p className="sim-note warn">Cities <b>3</b> and <b>7</b> appear twice (outlined in red), and cities 5, 2 and 8 are never visited. This is not a legal tour at all: the lecture calls it an <b>inadmissible solution</b>. A tour is a <i>permutation</i> (every city exactly once), and ordinary crossover does not respect that.</p>
        </div>
      )}
      {tab === 'ox' && (
        <div className="xlab">
          <div className="slider-grid">
            <Slider label="Segment starts at position" value={a} min={0} max={7} onChange={setA} />
            <Slider label="Segment ends at position" value={b} min={0} max={7} onChange={setB} />
          </div>
          <div className="xrow"><span>c0</span><Genes g={C0} colorOf={(i) => (i >= lo && i <= hi ? A : '#334155')} /></div>
          <div className="xrow"><span>c1</span><Genes g={C1} colorOf={(i) => (i >= lo && i <= hi ? Bc : '#334155')} /></div>
          <div className="xrow"><span>step 1: copy c0’s segment</span><Genes g={C0.map((v, i) => (i >= lo && i <= hi ? v : null))} colorOf={(i) => (i >= lo && i <= hi ? A : '#1e293b')} /></div>
          <div className="xrow"><span>step 2: child0</span><Genes g={ox0} colorOf={(i) => (i >= lo && i <= hi ? A : '#a78bfa')} /></div>
          <div className="xrow"><span>child1 (roles swapped)</span><Genes g={ox1} colorOf={(i) => (i >= lo && i <= hi ? Bc : '#a78bfa')} /></div>
          <p className="sim-note">Step 2 fills the purple slots: start just after the segment, read c1 from that same place (wrapping round to the start), and write down each city that is <i>not already in the child</i>. With the default segment (positions 2–4) you get exactly the lecture’s answer: child0 = [8, 5, 6, 1, 4, 3, 7, 2] and child1 = [1, 4, 8, 5, 6, 2, 3, 7]. Every city appears once, and the <b>relative order</b> of the purple cities is inherited from the other parent.</p>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── GA on the Travelling Salesman Problem ───────────────────────── */
export function TspGA() {
  const [which, setWhich] = useState('uk')
  const [N, setN] = useState(60)
  const [pm, setPm] = useState(0.2)
  const [useOX, setUseOX] = useState(true)
  const [running, setRunning] = useState(false)
  const [seed, setSeed] = useState(0)
  const prob = useMemo(() => (which === 'uk' ? ukProblem() : randomProblem(Number(which))), [which, seed])
  const exact = useMemo(() => (prob.pts.length <= 9 ? bruteForce(prob.dist) : null), [prob])
  const st = useRef(null)
  const force = useForce()
  const n = prob.pts.length

  const reset = () => {
    const pop = Array.from({ length: N }, () => randomTour(n))
    st.current = { pop, gen: 0, hist: [], evals: 0 }
    evaluate()
    force()
  }
  const evaluate = () => {
    const s = st.current
    s.fit = s.pop.map((t) => tourLength(t, prob.dist))
    s.evals += s.pop.length
    s.bi = s.fit.indexOf(Math.min(...s.fit))
    s.hist.push(s.fit[s.bi])
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setRunning(false); reset() }, [prob, N])

  const tournament = (s) => {
    const x = randInt(N)
    const y = randInt(N)
    return s.pop[s.fit[x] < s.fit[y] ? x : y]
  }
  const step = () => {
    const s = st.current
    const next = [s.pop[s.bi].slice()] // elitism
    while (next.length < N) {
      const p1 = tournament(s)
      const p2 = tournament(s)
      let child = p1.slice()
      if (useOX) {
        const i = randInt(n)
        const j = randInt(n)
        child = orderCrossover(p1, p2, Math.min(i, j), Math.max(i, j))
      }
      if (Math.random() < pm) {
        // swap mutation: two cities trade places, so the tour stays legal
        const i = randInt(n)
        const j = randInt(n)
        ;[child[i], child[j]] = [child[j], child[i]]
      }
      next.push(child)
    }
    s.pop = next
    s.gen++
    evaluate()
    force()
  }
  useLoop(step, running, 15)
  const s = st.current
  if (!s || s.pop[0].length !== n) return null
  const best = s.pop[s.bi]
  return (
    <div className="sim-grid">
      <div>
        <TourMap pts={prob.pts} tour={best} second={exact?.tour} labels={n <= 12} />
        <div className="map-key">
          <span><i className="k-line" style={{ background: '#fbbf24' }} /> best tour the GA has found</span>
          {exact && <span><i className="k-line dashed" /> true shortest tour (brute force)</span>}
        </div>
        {which === 'uk' && (
          <p className="sim-note">Chromosome of the best tour, using the lecture’s numbering: <b>[{best.map((c) => c + 1).join(', ')}]</b> = {best.map((c) => UK[c].name).join(' → ')} → back to start.</p>
        )}
      </div>
      <div className="sim-side">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Evolve'}</Btn>
          <Btn onClick={step} disabled={running}>One generation</Btn>
          <Btn onClick={() => { setRunning(false); reset() }}>Reset</Btn>
          {which !== 'uk' && <Btn onClick={() => setSeed(seed + 1)}>New cities</Btn>}
        </div>
        <Stats
          items={[
            { label: 'generation', value: s.gen },
            { label: 'best tour length', value: `${fmt(s.fit[s.bi], 1)} ${prob.unit}`, color: '#fbbf24' },
            ...(exact ? [{ label: 'true optimum', value: `${fmt(exact.best, 1)} ${prob.unit}`, color: Math.abs(exact.best - s.fit[s.bi]) < 1e-6 ? '#5eead4' : undefined }] : []),
            { label: 'tours evaluated by the GA', value: s.evals.toLocaleString('en-GB') },
            { label: 'number of different tours that exist', value: tourCount(n) },
          ]}
        />
        <Select label="Cities" value={which} onChange={setWhich} options={[{ value: 'uk', label: 'The lecture’s 8 UK cities' }, { value: '15', label: '15 random cities' }, { value: '30', label: '30 random cities' }, { value: '60', label: '60 random cities' }]} />
        <Slider label="Population size" value={N} min={10} max={300} step={10} onChange={setN} />
        <Slider label="Mutation rate (chance a child gets a swap)" value={pm} min={0} max={1} step={0.05} onChange={setPm} format={(v) => `${Math.round(v * 100)}%`} />
        <Toggle label="Use order-1 crossover (off = children are mutated copies of one parent)" checked={useOX} onChange={setUseOX} />
        <LineChart series={[{ name: 'best tour length', color: '#fbbf24', data: s.hist }]} xLabel="generation" yLabel={prob.unit} height={140} />
      </div>
    </div>
  )
}

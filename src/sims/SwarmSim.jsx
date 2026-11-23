import { useEffect, useRef, useState } from 'react'
import Heatmap, { dot, line } from '../components/Heatmap'
import LineChart from '../components/LineChart'
import { Btn, Slider, Select, Stats, Toggle } from '../components/ui'
import { BENCH, BENCH_LIST } from '../lib/benchmarks'
import { DFO, PSO, DE } from '../lib/algos'
import { fmt, useLoop, useForce } from '../lib/util'

/**
 * One simulator for the three continuous optimisers (DFO, PSO, DE), viewed from above on a 2-D map.
 * The algorithm-specific parameters and overlays change with `algo`.
 */
export default function SwarmSim({ algo = 'dfo', defaultFn = 'rastrigin', defaultN = 20 }) {
  const [fnKey, setFnKey] = useState(defaultFn)
  const [N, setN] = useState(defaultN)
  const [running, setRunning] = useState(false)
  const [fps, setFps] = useState(8)
  // DFO
  const [delta, setDelta] = useState(0.001)
  const [links, setLinks] = useState(false)
  const [focus, setFocus] = useState(true)
  // PSO
  const [chi, setChi] = useState(0.72984)
  const [c1, setC1] = useState(1.49618)
  const [c2, setC2] = useState(1.49618)
  const [topology, setTopology] = useState('global')
  const [arrows, setArrows] = useState(true)
  // DE
  const [F, setF] = useState(0.5)
  const [CR, setCR] = useState(0.5)
  const [strategy, setStrategy] = useState('best1')

  const inst = useRef(null)
  const hist = useRef({ best: [], div: [] })
  const force = useForce()
  const bench = BENCH[fnKey]

  const reset = () => {
    const o = { f: bench.f, D: 2, lo: bench.lo, hi: bench.hi, N }
    if (algo === 'dfo') inst.current = new DFO({ ...o, delta })
    if (algo === 'pso') inst.current = new PSO({ ...o, chi, c1, c2, topology })
    if (algo === 'de') inst.current = new DE({ ...o, F, CR, strategy })
    hist.current = { best: [inst.current.bestFit], div: [inst.current.diversity()] }
    force()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, [fnKey, N, algo, topology, strategy])

  // live-tunable parameters: change them mid-run and watch the swarm react
  useEffect(() => {
    const a = inst.current
    if (!a) return
    Object.assign(a, algo === 'dfo' ? { delta } : algo === 'pso' ? { chi, c1, c2 } : { F, CR })
  }, [algo, delta, chi, c1, c2, F, CR])

  const step = () => {
    const a = inst.current
    a.step()
    hist.current.best.push(a.bestFit)
    hist.current.div.push(a.diversity())
    if (hist.current.best.length > 600) {
      hist.current.best.shift()
      hist.current.div.shift()
    }
    force()
  }
  useLoop(step, running, fps)

  const a = inst.current
  const draw = (ctx, toPx) => {
    if (!a) return
    const { X, N: n } = a
    if (algo === 'dfo') {
      if (links) for (let i = 0; i < n; i++) line(ctx, ...toPx(...X[i]), ...toPx(...X[(i + 1) % n]), 'rgba(255,255,255,0.22)', 1)
      if (focus && n > 2) {
        const i = a.best === 0 ? 1 : 0
        const nb = a.bestNeighbour(i)
        line(ctx, ...toPx(...X[i]), ...toPx(...X[nb]), '#5eead4', 2)
        line(ctx, ...toPx(...X[i]), ...toPx(...X[a.best]), '#fbbf24', 2, [5, 4])
        dot(ctx, ...toPx(...X[nb]), 8, null, '#5eead4')
        dot(ctx, ...toPx(...X[i]), 8, null, '#f472b6')
      }
      for (let i = 0; i < n; i++) dot(ctx, ...toPx(...X[i]), 4, a.restarted.has(i) ? '#f472b6' : '#ffffff', 'rgba(0,0,0,0.6)')
    }
    if (algo === 'pso') {
      for (let i = 0; i < n; i++) {
        const [px, py] = toPx(...X[i])
        dot(ctx, ...toPx(...a.P[i]), 2.5, null, 'rgba(255,255,255,0.55)')
        if (arrows) {
          const [qx, qy] = toPx(X[i][0] + a.V[i][0], X[i][1] + a.V[i][1])
          line(ctx, px, py, qx, qy, 'rgba(255,255,255,0.75)', 1.2)
        }
        dot(ctx, px, py, 4, '#ffffff', 'rgba(0,0,0,0.6)')
      }
    }
    if (algo === 'de') for (let i = 0; i < n; i++) dot(ctx, ...toPx(...X[i]), 4, '#ffffff', 'rgba(0,0,0,0.6)')
    const bp = algo === 'pso' ? a.P[a.best] : X[a.best]
    dot(ctx, ...toPx(...bp), 6, '#fbbf24', '#000')
  }

  return (
    <div className="sim-grid">
      <div>
        <Heatmap f={bench.f} lo={bench.lo} hi={bench.hi} scale={bench.scale} draw={draw} tick={a?.iter} />
        <div className="map-key">
          <span><i className="k-dot" style={{ background: '#fbbf24' }} /> best so far</span>
          <span><i className="k-dot" style={{ background: '#fff' }} /> {algo === 'dfo' ? 'fly' : algo === 'pso' ? 'particle' : 'individual'}</span>
          {algo === 'dfo' && <span><i className="k-dot" style={{ background: '#f472b6' }} /> restarted by Δ</span>}
          {algo === 'pso' && <span><i className="k-ring" /> personal best (memory)</span>}
          <span className="k-note">dark blue = low fitness = good</span>
        </div>
      </div>
      <div className="sim-side">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run'}</Btn>
          <Btn onClick={step} disabled={running}>Step once</Btn>
          <Btn onClick={() => { setRunning(false); reset() }}>Reset</Btn>
        </div>
        <Stats
          items={[
            { label: 'iteration', value: a?.iter ?? 0 },
            { label: 'best fitness', value: fmt(a?.bestFit), color: '#fbbf24' },
            { label: 'spread (diversity)', value: fmt(a ? a.diversity() : 0) },
            { label: 'fitness evaluations', value: a?.evals ?? 0 },
          ]}
        />
        <Select label="Landscape" value={fnKey} onChange={setFnKey} options={BENCH_LIST.map((b) => ({ value: b.key, label: `${b.name} (${b.kind})` }))} />
        <Slider label="Population size N" value={N} min={4} max={80} onChange={setN} />
        {algo === 'dfo' && (
          <>
            <Slider
              label="Disturbance threshold Δ"
              value={delta}
              min={0}
              max={0.2}
              step={0.001}
              onChange={setDelta}
              format={(v) => v.toFixed(3)}
              hint="Chance that each coordinate of each fly is thrown somewhere random. 0 = never."
            />
            <Toggle label="Explain one fly: line to its best neighbour (teal) and to the swarm best (gold, dashed)" checked={focus} onChange={setFocus} />
            <Toggle label="Draw the ring (who is whose neighbour)" checked={links} onChange={setLinks} />
          </>
        )}
        {algo === 'pso' && (
          <>
            <Slider label="χ  (how much old velocity is kept)" value={chi} min={0} max={1.1} step={0.01} onChange={setChi} format={(v) => v.toFixed(2)} hint="Recommended 0.73. Above 1 the swarm explodes." />
            <Slider label="c₁  (pull towards own memory)" value={c1} min={0} max={3} step={0.01} onChange={setC1} format={(v) => v.toFixed(2)} />
            <Slider label="c₂  (pull towards the neighbourhood best)" value={c2} min={0} max={3} step={0.01} onChange={setC2} format={(v) => v.toFixed(2)} />
            <Select label="Who do particles listen to?" value={topology} onChange={setTopology} options={[{ value: 'global', label: 'Everyone (global best)' }, { value: 'ring', label: 'Two ring neighbours (local best)' }]} />
            <Toggle label="Show velocity arrows" checked={arrows} onChange={setArrows} />
          </>
        )}
        {algo === 'de' && (
          <>
            <Slider label="F  (how far to jump along the difference)" value={F} min={0} max={1.5} step={0.01} onChange={setF} format={(v) => v.toFixed(2)} />
            <Slider label="CR  (how much of the mutant is inherited)" value={CR} min={0} max={1} step={0.01} onChange={setCR} format={(v) => v.toFixed(2)} />
            <Select label="Mutation strategy" value={strategy} onChange={setStrategy} options={[{ value: 'best1', label: 'DE/best/1 (start from the best)' }, { value: 'rand1', label: 'DE/rand/1 (start from a random member)' }]} />
          </>
        )}
        <Slider label="Animation speed" value={fps} min={1} max={40} onChange={setFps} format={(v) => `${v} steps/s`} />
      </div>
      <div className="sim-charts">
        <LineChart logY series={[{ name: 'best fitness so far', color: '#fbbf24', data: hist.current.best }]} yLabel="fitness" height={150} />
        <LineChart logY series={[{ name: 'how spread out the population is', color: '#5eead4', data: hist.current.div }]} yLabel="diversity" height={150} />
      </div>
    </div>
  )
}

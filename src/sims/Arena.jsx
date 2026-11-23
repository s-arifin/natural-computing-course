import { useRef, useState } from 'react'
import { Btn, Slider, Select, Toggle } from '../components/ui'
import LineChart from '../components/LineChart'
import { BENCH, BENCH_LIST } from '../lib/benchmarks'
import { ALGOS } from '../lib/algos'
import { fmt, mean, median, std } from '../lib/util'

/**
 * A fair experiment: every algorithm gets the same function, the same number of dimensions,
 * the same population size and the same budget of fitness evaluations, repeated over many
 * independent runs. This is the methodology a marker expects to see in a report.
 */
export default function Arena() {
  const [fnKey, setFnKey] = useState('rastrigin')
  const [D, setD] = useState(10)
  const [N, setN] = useState(30)
  const [budget, setBudget] = useState(15000)
  const [runs, setRuns] = useState(10)
  const [on, setOn] = useState({ dfo: true, pso: true, de: true, ga: true, hc: false, rs: true })
  const [delta, setDelta] = useState(0.001)
  const [res, setRes] = useState(null)
  const [progress, setProgress] = useState(null)
  const cancel = useRef(false)

  const run = async () => {
    cancel.current = false
    const bench = BENCH[fnKey]
    const keys = Object.keys(on).filter((k) => on[k])
    const points = 60
    const out = {}
    for (const k of keys) out[k] = { finals: [], curves: [] }
    const total = keys.length * runs
    let done = 0
    for (let r = 0; r < runs; r++) {
      for (const k of keys) {
        if (cancel.current) { setProgress(null); return }
        const a = ALGOS[k].make({ f: bench.f, D, lo: bench.lo, hi: bench.hi, N, delta, sigma: k === 'hc' ? 0.02 : 0.1 })
        const curve = []
        let nextMark = 0
        while (a.evals < budget) {
          while (a.evals >= nextMark && curve.length < points) {
            curve.push(a.bestFit)
            nextMark += budget / points
          }
          a.step()
        }
        while (curve.length < points) curve.push(a.bestFit)
        curve.push(a.bestFit)
        out[k].finals.push(a.bestFit)
        out[k].curves.push(curve)
        done++
        setProgress(done / total)
        await new Promise((ok) => setTimeout(ok, 0)) // let the page redraw between runs
      }
    }
    for (const k of keys) {
      const c = out[k].curves
      out[k].median = c[0].map((_, i) => median(c.map((run) => run[i])))
    }
    setRes({ out, keys, fnKey, D, budget, runs })
    setProgress(null)
  }

  const ranked = res ? [...res.keys].sort((a, b) => median(res.out[a].finals) - median(res.out[b].finals)) : []
  return (
    <div className="sim-grid one">
      <div className="slider-grid">
        <Select label="Benchmark function" value={fnKey} onChange={setFnKey} options={BENCH_LIST.map((b) => ({ value: b.key, label: `${b.name} (${b.kind})` }))} />
        <Slider label="D: dimensions" value={D} min={2} max={50} onChange={setD} hint="Real problems are rarely 2-D. Watch what happens at 30+." />
        <Slider label="N: population size (same for all)" value={N} min={5} max={100} step={5} onChange={setN} />
        <Slider label="Budget: fitness evaluations per run" value={budget} min={1000} max={60000} step={1000} onChange={setBudget} format={(v) => v.toLocaleString('en-GB')} />
        <Slider label="Independent runs per algorithm" value={runs} min={1} max={30} onChange={setRuns} hint="1 run proves nothing: these algorithms are random." />
        <Slider label="DFO disturbance threshold Δ" value={delta} min={0} max={0.05} step={0.001} onChange={setDelta} format={(v) => v.toFixed(3)} />
      </div>
      <div className="btn-row">
        {Object.keys(ALGOS).map((k) => (
          <Toggle key={k} label={ALGOS[k].name} checked={on[k]} onChange={(v) => setOn({ ...on, [k]: v })} />
        ))}
      </div>
      <div className="btn-row">
        <Btn primary onClick={run} disabled={progress !== null}>{progress !== null ? `Running… ${Math.round(progress * 100)}%` : 'Run the experiment'}</Btn>
        {progress !== null && <Btn onClick={() => { cancel.current = true }}>Stop</Btn>}
      </div>
      {res && (
        <>
          <LineChart
            logY
            height={260}
            xs={res.out[res.keys[0]].median.map((_, i) => (i / (res.out[res.keys[0]].median.length - 1)) * res.budget)}
            xLabel="fitness evaluations"
            yLabel={`median best fitness over ${res.runs} runs`}
            series={res.keys.map((k) => ({ name: ALGOS[k].name, color: ALGOS[k].color, data: res.out[k].median }))}
          />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>rank</th><th>algorithm</th><th>median</th><th>mean</th><th>std. dev.</th><th>best run</th><th>worst run</th></tr>
              </thead>
              <tbody>
                {ranked.map((k, i) => {
                  const f = res.out[k].finals
                  return (
                    <tr key={k}>
                      <td>{i + 1}</td>
                      <td style={{ color: ALGOS[k].color, fontWeight: 700 }}>{ALGOS[k].long}</td>
                      <td><b>{fmt(median(f))}</b></td>
                      <td>{fmt(mean(f))}</td>
                      <td>{fmt(std(f))}</td>
                      <td>{fmt(Math.min(...f))}</td>
                      <td>{fmt(Math.max(...f))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="sim-note">
            Result for <b>{BENCH[res.fnKey].name}</b> in <b>{res.D}</b> dimensions with <b>{res.budget.toLocaleString('en-GB')}</b> evaluations. The true minimum is 0, so smaller is better. Run it again: the numbers change, because every algorithm here uses random numbers. That is exactly why a report needs many runs and a spread (std. dev.), not one lucky result.
          </p>
        </>
      )}
    </div>
  )
}

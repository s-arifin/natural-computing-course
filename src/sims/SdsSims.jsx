import { useEffect, useRef, useState } from 'react'
import { Btn, Slider, Stats } from '../components/ui'
import LineChart from '../components/LineChart'
import { randInt, useLoop, useForce, PALETTE } from '../lib/util'

/* ───────────────────────── The mining game ───────────────────────── */
const HILLS = 6

export function MiningGame() {
  const [M, setM] = useState(60)
  const [rich, setRich] = useState([0.1, 0.25, 0.15, 0.8, 0.3, 0.05])
  const [running, setRunning] = useState(false)
  const st = useRef(null)
  const force = useForce()

  const reset = () => {
    st.current = {
      miners: Array.from({ length: M }, () => ({ hill: randInt(HILLS), happy: false })),
      day: 0,
      phase: 'start',
      hist: Array.from({ length: HILLS }, () => []),
    }
    record()
    force()
  }
  const record = () => {
    const s = st.current
    for (let h = 0; h < HILLS; h++) s.hist[h].push(s.miners.filter((m) => m.hill === h).length)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setRunning(false); reset() }, [M])

  const test = () => {
    // TEST PHASE: each miner digs ONE random seam on their hill. Richer hill => more likely to strike gold.
    const s = st.current
    for (const m of s.miners) m.happy = Math.random() < rich[m.hill]
    s.phase = 'test'
  }
  const diffuse = () => {
    // DIFFUSION PHASE: every unhappy miner asks one random miner.
    const s = st.current
    const snapshot = s.miners.map((m) => ({ ...m }))
    for (const m of s.miners) {
      if (m.happy) continue
      const other = snapshot[randInt(M)]
      m.hill = other.happy ? other.hill : randInt(HILLS)
    }
    s.phase = 'diffusion'
    s.day++
    record()
  }
  const half = () => { st.current.phase === 'test' ? diffuse() : test(); force() }
  useLoop(() => { test(); diffuse(); force() }, running, 6)

  const s = st.current
  if (!s || s.miners.length !== M) return null
  const counts = Array.from({ length: HILLS }, (_, h) => s.miners.filter((m) => m.hill === h))
  const best = rich.indexOf(Math.max(...rich))
  const W = 560
  const colW = W / HILLS
  return (
    <div className="sim-grid one">
      <svg viewBox={`0 0 ${W} 250`} className="svg-panel">
        {rich.map((r, h) => {
          const x = h * colW
          const peak = 60 + (1 - r) * 60
          return (
            <g key={h}>
              <path d={`M${x + 4},210 L${x + colW / 2},${peak} L${x + colW - 4},210 Z`} fill="#1e293b" stroke={PALETTE[h]} strokeWidth="2" />
              <rect x={x + colW / 2 - 16} y={210 - r * 70} width="32" height={r * 70} fill="#fbbf24" opacity="0.85" rx="3" />
              <text x={x + colW / 2} y={228} textAnchor="middle" fontSize="11" fill="#cbd5e1">hill {h + 1} · gold {Math.round(r * 100)}%</text>
              <text x={x + colW / 2} y={243} textAnchor="middle" fontSize="11" fontWeight="700" fill={PALETTE[h]}>{counts[h].length} miners</text>
              {counts[h].map((m, k) => (
                <circle key={k} cx={x + 12 + (k % 8) * ((colW - 24) / 7)} cy={14 + Math.floor(k / 8) * 9} r="3.6" fill={m.happy ? '#5eead4' : '#64748b'} />
              ))}
            </g>
          )
        })}
      </svg>
      <div className="map-key">
        <span><i className="k-dot" style={{ background: '#5eead4' }} /> happy miner = active agent (found gold today)</span>
        <span><i className="k-dot" style={{ background: '#64748b' }} /> unhappy miner = inactive agent</span>
        <span><i className="k-dot" style={{ background: '#fbbf24', borderRadius: 2 }} /> how rich the hill really is (the miners cannot see this)</span>
      </div>
      <div className="sim-side row">
        <div className="btn-row">
          <Btn primary onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run days'}</Btn>
          <Btn onClick={half} disabled={running}>{s.phase === 'test' ? 'Evening: diffusion phase' : 'Next morning: test phase'}</Btn>
          <Btn onClick={() => { setRunning(false); reset() }}>Reset</Btn>
          <Btn onClick={() => setRich((r) => { const c = [...r]; const j = (best + 1 + randInt(HILLS - 1)) % HILLS; [c[best], c[j]] = [c[j], c[best]]; return c })}>Move the gold to another hill</Btn>
        </div>
        <Stats
          items={[
            { label: 'day', value: s.day },
            { label: 'last phase', value: s.phase },
            { label: `miners on the richest hill (hill ${best + 1})`, value: `${counts[best].length} / ${M}`, color: counts[best].length > M / 2 ? '#5eead4' : '#fbbf24' },
            { label: 'happy miners', value: s.miners.filter((m) => m.happy).length },
          ]}
        />
        <div className="slider-grid">
          <Slider label="Number of miners (agents)" value={M} min={10} max={120} step={5} onChange={setM} />
          <Slider label={`Richness of the best hill`} value={rich[best]} min={0.1} max={1} step={0.05} onChange={(v) => setRich(rich.map((o, h) => (h === best ? v : Math.min(o, v - 0.05))))} format={(v) => `${Math.round(v * 100)}%`} hint="Lower it towards the other hills: the cluster becomes smaller and less stable." />
        </div>
      </div>
      <LineChart series={rich.map((_, h) => ({ name: `hill ${h + 1}`, color: PALETTE[h], data: s.hist[h] }))} yLabel="miners on each hill" xLabel="day" height={170} />
    </div>
  )
}

/* ───────────────────────── SDS text search (the lecture example) ───────────────────────── */
export function TextSearch() {
  const [ss, setSs] = useState('XZAVMZSIBVGOLBEH')
  const [model, setModel] = useState('SIB')
  const [A, setA] = useState(4)
  const st = useRef(null)
  const force = useForce()
  const S = ss.toUpperCase()
  const Mo = model.toUpperCase() || 'A'
  const maxPos = Math.max(1, S.length - Mo.length + 1)

  const reset = (lecture) => {
    const start = lecture ? [12, 9, 2, 3] : null
    st.current = {
      agents: Array.from({ length: lecture ? 4 : A }, (_, i) => ({ h: start ? start[i] : randInt(maxPos), pick: null, active: false, note: 'random start' })),
      it: 1,
      phase: 'init',
    }
    force()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => reset(S === 'XZAVMZSIBVGOLBEH' && Mo === 'SIB' && A === 4), [S, Mo, A])

  const test = () => {
    const s = st.current
    for (const a of s.agents) {
      a.pick = randInt(Mo.length) // the "micro-feature": ONE letter, not the whole word
      a.active = S[a.h + a.pick] === Mo[a.pick]
    }
    s.phase = 'test'
    force()
  }
  const diffuse = () => {
    const s = st.current
    const snap = s.agents.map((a) => ({ ...a }))
    s.agents.forEach((a, i) => {
      if (a.active) { a.note = 'active: keeps its hypothesis'; return }
      let j = randInt(snap.length)
      if (snap.length > 1) while (j === i) j = randInt(snap.length)
      if (snap[j].active) { a.h = snap[j].h; a.note = `asked agent ${j + 1} (active) → copied position ${snap[j].h}` }
      else { a.h = randInt(maxPos); a.note = `asked agent ${j + 1} (inactive) → new random position ${a.h}` }
    })
    s.it++
    s.phase = 'diffusion'
    force()
  }
  const s = st.current
  if (!s) return null
  const ans = S.indexOf(Mo)
  const atAns = s.agents.filter((a) => a.h === ans).length
  return (
    <div className="sim-grid one">
      <div className="slider-grid">
        <label className="select"><span>Search space (the long text)</span><input type="text" value={ss} maxLength={40} onChange={(e) => setSs(e.target.value.replace(/[^a-zA-Z]/g, ''))} /></label>
        <label className="select"><span>Model (the word to find)</span><input type="text" value={model} maxLength={8} onChange={(e) => setModel(e.target.value.replace(/[^a-zA-Z]/g, ''))} /></label>
        <Slider label="Number of agents" value={A} min={2} max={12} onChange={setA} />
      </div>
      <div className="sds-strip">
        {S.split('').map((c, i) => {
          const here = s.agents.map((a, k) => ({ a, k })).filter(({ a }) => i >= a.h && i < a.h + Mo.length)
          const tested = s.phase === 'test' && s.agents.some((a) => a.h + a.pick === i)
          return (
            <div key={i} className={`sds-cell ${ans >= 0 && i >= ans && i < ans + Mo.length ? 'ans' : ''} ${tested ? 'tested' : ''}`}>
              <small>{i}</small>
              <b>{c}</b>
              <div className="sds-marks">
                {here.map(({ a, k }) => (
                  <i key={k} style={{ background: a.active ? '#5eead4' : '#64748b' }} title={`agent ${k + 1}`} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <table className="table compact">
        <thead>
          <tr><th>agent</th><th>hypothesis (start position)</th><th>letters there</th><th>letter it tested</th><th>status</th><th>what happened in diffusion</th></tr>
        </thead>
        <tbody>
          {s.agents.map((a, k) => (
            <tr key={k}>
              <td>{k + 1}</td>
              <td>{a.h}</td>
              <td className="mono">{S.slice(a.h, a.h + Mo.length).split('').join('-')}</td>
              <td>{a.pick === null || s.phase !== 'test' ? '–' : `#${a.pick + 1}: is “${S[a.h + a.pick] ?? '∅'}” = “${Mo[a.pick]}”?`}</td>
              <td style={{ color: s.phase === 'init' ? '#94a3b8' : a.active ? '#5eead4' : '#f87171', fontWeight: 700 }}>{s.phase === 'init' ? 'not tested yet' : a.active ? '✓ active' : '✗ inactive'}</td>
              <td>{s.phase === 'diffusion' ? a.note : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="btn-row">
        <Btn primary onClick={test} disabled={s.phase === 'test'}>1. Test phase</Btn>
        <Btn primary onClick={diffuse} disabled={s.phase !== 'test'}>2. Diffusion phase</Btn>
        <Btn onClick={() => reset(false)}>Restart (random)</Btn>
        <Btn onClick={() => { setSs('XZAVMZSIBVGOLBEH'); setModel('SIB'); setA(4); reset(true) }}>Restart from the lecture’s starting state</Btn>
      </div>
      <Stats
        items={[
          { label: 'iteration', value: s.it },
          { label: 'correct position', value: ans >= 0 ? ans : 'model is not in the text' },
          { label: 'agents at the correct position', value: `${atAns} / ${s.agents.length}`, color: atAns === s.agents.length ? '#5eead4' : '#fbbf24' },
        ]}
      />
    </div>
  )
}

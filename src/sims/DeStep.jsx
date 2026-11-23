import { useState } from 'react'
import { Btn, Slider, Stats } from '../components/ui'
import { fmt, rand, randInt } from '../lib/util'

const sphere = (p) => p[0] * p[0] + p[1] * p[1]
const LO = -5
const HI = 5

function draw() {
  const pop = Array.from({ length: 8 }, () => [rand(-4.5, 4.5), rand(-4.5, 4.5)])
  const fit = pop.map(sphere)
  const best = fit.indexOf(Math.min(...fit))
  let i = randInt(8)
  while (i === best) i = randInt(8)
  const others = [0, 1, 2, 3, 4, 5, 6, 7].filter((k) => k !== i)
  const r1 = others.splice(randInt(others.length), 1)[0]
  const r2 = others.splice(randInt(others.length), 1)[0]
  return { pop, best, i, r1, r2, rnd: [Math.random(), Math.random()], jr: randInt(2) }
}

/** One Differential Evolution step for ONE individual, drawn as arrows. */
export default function DeStep() {
  const [s, setS] = useState(draw)
  const [F, setF] = useState(0.5)
  const [CR, setCR] = useState(0.5)
  const { pop, best, i, r1, r2, rnd, jr } = s
  const diff = [pop[r1][0] - pop[r2][0], pop[r1][1] - pop[r2][1]]
  const v = [pop[best][0] + F * diff[0], pop[best][1] + F * diff[1]]
  const take = [0, 1].map((d) => rnd[d] <= CR || d === jr)
  const u = [0, 1].map((d) => (take[d] ? v[d] : pop[i][d]))
  const fx = sphere(pop[i])
  const fu = sphere(u)
  const S = 400
  const P = (p) => [((p[0] - LO) / (HI - LO)) * S, S - ((p[1] - LO) / (HI - LO)) * S]
  const Arrow = ({ a, b, color, dash, w = 2.5 }) => {
    const [x1, y1] = P(a)
    const [x2, y2] = P(b)
    const ang = Math.atan2(y2 - y1, x2 - x1)
    const hx = x2 - 9 * Math.cos(ang)
    const hy = y2 - 9 * Math.sin(ang)
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeDasharray={dash} />
        <polygon points={`${x2},${y2} ${hx - 4 * Math.sin(ang)},${hy + 4 * Math.cos(ang)} ${hx + 4 * Math.sin(ang)},${hy - 4 * Math.cos(ang)}`} fill={color} />
      </g>
    )
  }
  const Dot = ({ p, color, label, r = 7 }) => {
    const [x, y] = P(p)
    return (
      <g>
        <circle cx={x} cy={y} r={r} fill={color} stroke="#0b1020" strokeWidth="2" />
        {label && <text x={x + 10} y={y - 9} fontSize="13" fontWeight="700" fill={color}>{label}</text>}
      </g>
    )
  }
  return (
    <div className="sim-grid">
      <div>
        <svg viewBox={`0 0 ${S} ${S}`} className="svg-panel">
          {[1, 2, 3, 4, 5, 6].map((r) => (
            <circle key={r} cx={S / 2} cy={S / 2} r={(r / 10) * S} fill="none" stroke="#1e293b" />
          ))}
          <text x={S / 2 + 6} y={S / 2 - 6} fontSize="10" fill="#64748b">optimum (0, 0)</text>
          <circle cx={S / 2} cy={S / 2} r="3" fill="#64748b" />
          {pop.map((p, k) => (k === i || k === best || k === r1 || k === r2 ? null : <Dot key={k} p={p} color="#475569" r={5} />))}
          <Arrow a={pop[r2]} b={pop[r1]} color="#a78bfa" dash="5 4" w={2} />
          <Arrow a={pop[best]} b={v} color="#a78bfa" />
          <rect x={Math.min(P(pop[i])[0], P(v)[0])} y={Math.min(P(pop[i])[1], P(v)[1])} width={Math.abs(P(pop[i])[0] - P(v)[0])} height={Math.abs(P(pop[i])[1] - P(v)[1])} fill="none" stroke="#334155" strokeDasharray="3 4" />
          <Dot p={pop[r1]} color="#60a5fa" label="xᵣ₁" />
          <Dot p={pop[r2]} color="#60a5fa" label="xᵣ₂" />
          <Dot p={pop[best]} color="#fbbf24" label="x_best" />
          <Dot p={pop[i]} color="#f472b6" label="x (target)" />
          <Dot p={v} color="#a78bfa" label="v (mutant)" />
          <Dot p={u} color="#5eead4" label="u (trial)" r={5} />
        </svg>
      </div>
      <div className="sim-side">
        <div className="btn-row">
          <Btn primary onClick={() => setS(draw())}>New random population</Btn>
          <Btn onClick={() => setS({ ...s, rnd: [Math.random(), Math.random()], jr: randInt(2) })}>Re-roll the crossover dice</Btn>
        </div>
        <Slider label="F: scale factor" value={F} min={0} max={1.5} step={0.05} onChange={setF} format={(x) => x.toFixed(2)} hint="Stretches or shrinks the purple arrow." />
        <Slider label="CR: crossover rate" value={CR} min={0} max={1} step={0.05} onChange={setCR} format={(x) => x.toFixed(2)} />
        <ol className="steps">
          <li><b>Mutation</b><span>Dashed arrow = xᵣ₁ − xᵣ₂ = ({fmt(diff[0], 2)}, {fmt(diff[1], 2)}). Multiply by F = {F.toFixed(2)} and add it to the best: v = ({fmt(v[0], 2)}, {fmt(v[1], 2)}).</span></li>
          <li><b>Crossover</b><span>
            {[0, 1].map((d) => (
              <span key={d} className="block">dimension {d + 1}: rolled r = {rnd[d].toFixed(2)} {rnd[d] <= CR ? '≤' : '>'} CR{d === jr ? ' (and this is the guaranteed dimension)' : ''} → take from <b style={{ color: take[d] ? '#a78bfa' : '#f472b6' }}>{take[d] ? 'mutant v' : 'target x'}</b></span>
            ))}
            so u = ({fmt(u[0], 2)}, {fmt(u[1], 2)}). The trial can only land on a corner of the dotted rectangle.
          </span></li>
          <li><b>Selection</b><span>f(u) = {fmt(fu, 2)} vs f(x) = {fmt(fx, 2)} → <b style={{ color: fu <= fx ? '#5eead4' : '#f87171' }}>{fu <= fx ? 'the trial is better (or equal): it replaces the target' : 'the trial is worse: the target survives, the trial is thrown away'}</b>.</span></li>
        </ol>
        <Stats items={[{ label: 'target fitness', value: fmt(fx, 2), color: '#f472b6' }, { label: 'trial fitness', value: fmt(fu, 2), color: '#5eead4' }]} />
      </div>
    </div>
  )
}

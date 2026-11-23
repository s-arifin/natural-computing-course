import { fmt, PALETTE } from '../lib/util'

/**
 * Minimal line chart. series: [{ name, color, data: number[] }] (x is the index, or pass xs).
 * logY plots on a logarithmic axis, which is how convergence curves are normally shown:
 * each step down the axis is "10 times better".
 */
export default function LineChart({ series, logY = false, height = 180, xLabel = 'iteration', yLabel = '', xs, floor = 1e-12 }) {
  const W = 520
  const H = height
  const m = { l: 54, r: 12, t: 10, b: 30 }
  const tf = (v) => (logY ? Math.log10(Math.max(v, floor)) : v)
  let n = 0
  let mn = Infinity
  let mx = -Infinity
  for (const s of series) {
    n = Math.max(n, s.data.length)
    for (const v of s.data) {
      if (!Number.isFinite(v)) continue
      const t = tf(v)
      if (t < mn) mn = t
      if (t > mx) mx = t
    }
  }
  if (!Number.isFinite(mn)) {
    mn = 0
    mx = 1
  }
  if (mx - mn < 1e-9) {
    mx += 1
    mn -= logY ? 1 : 0
  }
  const xMax = xs ? xs[xs.length - 1] || 1 : Math.max(1, n - 1)
  const px = (i) => m.l + ((xs ? xs[i] : i) / xMax) * (W - m.l - m.r)
  const py = (v) => m.t + (1 - (tf(v) - mn) / (mx - mn)) * (H - m.t - m.b)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => mn + t * (mx - mn))
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yLabel} over ${xLabel}`}>
        {ticks.map((t, i) => {
          const y = m.t + (1 - (t - mn) / (mx - mn)) * (H - m.t - m.b)
          return (
            <g key={i}>
              <line x1={m.l} x2={W - m.r} y1={y} y2={y} className="grid" />
              <text x={m.l - 6} y={y + 3.5} textAnchor="end" className="tick">
                {fmt(logY ? 10 ** t : t, 2)}
              </text>
            </g>
          )
        })}
        <text x={m.l} y={H - 8} className="tick">
          0
        </text>
        <text x={W - m.r} y={H - 8} textAnchor="end" className="tick">
          {fmt(xMax, 0)} {xLabel}
        </text>
        {series.map((s, si) => {
          if (s.data.length < 2) return null
          let d = ''
          s.data.forEach((v, i) => {
            if (!Number.isFinite(v)) return
            d += `${d ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`
          })
          return <path key={si} d={d} fill="none" stroke={s.color || PALETTE[si % PALETTE.length]} strokeWidth={s.width || 2} strokeDasharray={s.dash} />
        })}
      </svg>
      <div className="chart-legend">
        {yLabel && <span className="chart-y">{yLabel}{logY ? ' (log scale)' : ''}</span>}
        {series.map((s, si) => (
          <span key={si}>
            <i style={{ background: s.color || PALETTE[si % PALETTE.length] }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

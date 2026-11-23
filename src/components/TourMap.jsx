/**
 * Draws cities and (optionally) a tour and pheromone levels.
 *   pts: [{name, x, y}]   tour: array of city indices   pher: N×N matrix (drawn as edge brightness)
 */
export default function TourMap({ pts, tour, pher, labels = true, color = '#fbbf24', second, height = 340 }) {
  const W = 460
  const H = height
  const pad = 34
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const s = Math.min((W - 2 * pad) / (Math.max(...xs) - minX || 1), (H - 2 * pad) / (Math.max(...ys) - minY || 1))
  const ox = (W - (Math.max(...xs) - minX) * s) / 2
  const oy = (H - (Math.max(...ys) - minY) * s) / 2
  const P = (i) => [ox + (pts[i].x - minX) * s, oy + (pts[i].y - minY) * s]
  let maxT = 0
  if (pher) for (const row of pher) for (const v of row) if (v > maxT) maxT = v
  const path = (t) => t.map((c, i) => `${i ? 'L' : 'M'}${P(c)[0].toFixed(1)},${P(c)[1].toFixed(1)}`).join('') + 'Z'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-panel">
      {pher &&
        pts.map((_, i) =>
          pts.map((__, j) => {
            if (j <= i) return null
            const t = pher[i][j] / (maxT || 1)
            if (t < 0.03) return null
            const [x1, y1] = P(i)
            const [x2, y2] = P(j)
            return <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5eead4" strokeOpacity={Math.min(1, t)} strokeWidth={1 + t * 5} strokeLinecap="round" />
          }),
        )}
      {second && <path d={path(second)} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" />}
      {tour && <path d={path(tour)} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />}
      {pts.map((p, i) => {
        const [x, y] = P(i)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={labels ? 6 : 4} fill="#f8fafc" stroke="#0b1020" strokeWidth="2" />
            {labels && (
              <text x={x + 9} y={y - 8} fontSize="11" fill="#e2e8f0">
                {p.name}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

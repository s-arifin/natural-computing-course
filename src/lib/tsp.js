import { rand, shuffle } from './util'

// The lecture's eight UK cities, numbered exactly as on the slides (1-8).
export const UK = [
  { name: 'Brighton', lat: 50.82, lon: -0.14 },
  { name: 'Bristol', lat: 51.45, lon: -2.59 },
  { name: 'Cambridge', lat: 52.21, lon: 0.12 },
  { name: 'Glasgow', lat: 55.86, lon: -4.25 },
  { name: 'Liverpool', lat: 53.41, lon: -2.98 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'Manchester', lat: 53.48, lon: -2.24 },
  { name: 'Oxford', lat: 51.75, lon: -1.26 },
]

/** Straight-line ("as the crow flies") distance in km between two lat/lon points. */
function haversine(a, b) {
  const R = 6371
  const p = Math.PI / 180
  const dLat = (b.lat - a.lat) * p
  const dLon = (b.lon - a.lon) * p
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function ukProblem() {
  const pts = UK.map((c) => ({ name: c.name, x: (c.lon + 5) * 62, y: (56.4 - c.lat) * 100 }))
  const dist = UK.map((a) => UK.map((b) => haversine(a, b)))
  return { pts, dist, unit: 'km' }
}

export function randomProblem(n) {
  const pts = Array.from({ length: n }, (_, i) => ({ name: String(i + 1), x: rand(30, 430), y: rand(30, 330) }))
  const dist = pts.map((a) => pts.map((b) => Math.hypot(a.x - b.x, a.y - b.y)))
  return { pts, dist, unit: 'units' }
}

export function tourLength(tour, dist) {
  let L = 0
  for (let i = 0; i < tour.length; i++) L += dist[tour[i]][tour[(i + 1) % tour.length]]
  return L
}

export const randomTour = (n) => shuffle(Array.from({ length: n }, (_, i) => i))

/** Try every possible tour. Only sane for about 10 cities or fewer. */
export function bruteForce(dist) {
  const n = dist.length
  const rest = Array.from({ length: n - 1 }, (_, i) => i + 1)
  let best = Infinity
  let bestTour = null
  let count = 0
  const rec = (path, left, len) => {
    if (len >= best) return
    if (!left.length) {
      count++
      const total = len + dist[path[path.length - 1]][0]
      if (total < best) {
        best = total
        bestTour = path.slice()
      }
      return
    }
    for (let k = 0; k < left.length; k++) {
      const c = left[k]
      path.push(c)
      rec(path, left.filter((_, j) => j !== k), len + dist[path[path.length - 2]][c])
      path.pop()
    }
  }
  rec([0], rest, 0)
  return { best, tour: bestTour, count }
}

/**
 * Order-1 crossover (OX), exactly as on the lecture slide:
 * copy parent A's segment [a, b] into the child at the same place, then fill the remaining
 * slots (starting just after the segment and wrapping round) with parent B's cities in the
 * order they appear in B (also starting just after the segment), skipping any already used.
 */
export function orderCrossover(pa, pb, a, b) {
  const n = pa.length
  const child = new Array(n).fill(null)
  for (let i = a; i <= b; i++) child[i] = pa[i]
  const used = new Set(child.filter((v) => v !== null))
  let write = (b + 1) % n
  for (let k = 0; k < n; k++) {
    const c = pb[(b + 1 + k) % n]
    if (!used.has(c)) {
      child[write] = c
      used.add(c)
      write = (write + 1) % n
    }
  }
  return child
}

/** n cities -> number of genuinely different round trips = (n−1)!/2, as a string. */
export function tourCount(n) {
  let r = 1n
  for (let i = 2n; i < BigInt(n); i++) r *= i
  r /= 2n
  const s = r.toString()
  return s.length <= 9 ? Number(s).toLocaleString('en-GB') : `${s[0]}.${s.slice(1, 3)} × 10^${s.length - 1}`
}

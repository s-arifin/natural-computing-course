// Small, readable implementations of the optimisers covered in the module.
// All of them MINIMISE f. They share one interface so the simulators can swap them:
//   .X        current positions (N arrays of D numbers)
//   .fit      fitness of each member
//   .best     index of the best member right now
//   .bestFit  best fitness found so far
//   .bestPos  where that best fitness was found
//   .evals    how many times the fitness function has been called (the fair "cost" measure)
//   .iter     iterations / generations completed
//   .step()   advance by one iteration
import { gauss, randInt } from './util'

const B = (b, d) => (Array.isArray(b) ? b[d] : b)

class Base {
  constructor({ f, D = 2, lo = -5, hi = 5, N = 20 }) {
    this.f = f
    this.D = D
    this.lo = lo
    this.hi = hi
    this.N = N
    this.evals = 0
    this.iter = 0
    this.bestFit = Infinity
    this.bestPos = null
  }
  ev(x) {
    this.evals++
    return this.f(x)
  }
  r(d) {
    const lo = B(this.lo, d)
    return lo + Math.random() * (B(this.hi, d) - lo)
  }
  out(v, d) {
    return v < B(this.lo, d) || v > B(this.hi, d)
  }
  randPos() {
    return Array.from({ length: this.D }, (_, d) => this.r(d))
  }
  track() {
    let b = 0
    for (let i = 1; i < this.N; i++) if (this.fit[i] < this.fit[b]) b = i
    this.best = b
    if (this.fit[b] < this.bestFit) {
      this.bestFit = this.fit[b]
      this.bestPos = this.X[b].slice()
    }
  }
  /** Mean distance of the population from its centre: a simple measure of how spread out it is. */
  diversity() {
    const { X, N, D } = this
    const c = new Array(D).fill(0)
    for (const x of X) for (let d = 0; d < D; d++) c[d] += x[d] / N
    let s = 0
    for (const x of X) {
      let q = 0
      for (let d = 0; d < D; d++) q += (x[d] - c[d]) ** 2
      s += Math.sqrt(q)
    }
    return s / N
  }
}

/* ───────────────────────── Dispersive Flies Optimisation ───────────────────────── */
export class DFO extends Base {
  constructor(o) {
    super(o)
    this.delta = o.delta ?? 0.001
    this.dynamic = !!o.dynamic // re-evaluate everything each step (for moving targets)
    this.X = Array.from({ length: this.N }, () => this.randPos())
    this.fit = this.X.map((x) => this.ev(x))
    this.restarted = new Set()
    this.track()
  }
  bestNeighbour(i) {
    const l = (i - 1 + this.N) % this.N
    const r = (i + 1) % this.N
    return this.fit[r] < this.fit[l] ? r : l
  }
  step() {
    const { X, N, D } = this
    if (this.dynamic) {
      this.bestFit = Infinity
      for (let i = 0; i < N; i++) this.fit[i] = this.ev(X[i])
      this.track()
    }
    const s = this.best
    this.restarted = new Set()
    for (let i = 0; i < N; i++) {
      if (i === s) continue // elitism: the best fly is left alone
      const n = this.bestNeighbour(i)
      for (let d = 0; d < D; d++) {
        if (Math.random() < this.delta) {
          X[i][d] = this.r(d) // disturbance: restart this one dimension
          this.restarted.add(i)
          continue
        }
        const u = Math.random()
        const v = X[n][d] + u * (X[s][d] - X[i][d]) // THE update equation
        X[i][d] = this.out(v, d) ? this.r(d) : v
      }
    }
    for (let i = 0; i < N; i++) this.fit[i] = this.ev(X[i])
    this.track()
    this.iter++
  }
}

/* ───────────────────────── Particle Swarm Optimisation (Clerc–Kennedy) ───────────────────────── */
export class PSO extends Base {
  constructor(o) {
    super(o)
    this.chi = o.chi ?? 0.72984
    this.c1 = o.c1 ?? 1.49618
    this.c2 = o.c2 ?? 1.49618
    this.topology = o.topology ?? 'global'
    this.X = Array.from({ length: this.N }, () => this.randPos())
    this.V = this.X.map((x) => x.map((_, d) => (this.r(d) - x[d]) * 0.1))
    this.fit = this.X.map((x) => this.ev(x))
    this.P = this.X.map((x) => x.slice()) // personal best positions (each particle's memory)
    this.pfit = this.fit.slice()
    this.track()
  }
  track() {
    let b = 0
    for (let i = 1; i < this.N; i++) if (this.pfit[i] < this.pfit[b]) b = i
    this.best = b
    if (this.pfit[b] < this.bestFit) {
      this.bestFit = this.pfit[b]
      this.bestPos = this.P[b].slice()
    }
  }
  nbest(i) {
    if (this.topology === 'global') return this.best
    const l = (i - 1 + this.N) % this.N
    const r = (i + 1) % this.N
    let b = i
    if (this.pfit[l] < this.pfit[b]) b = l
    if (this.pfit[r] < this.pfit[b]) b = r
    return b
  }
  step() {
    const { X, V, P, N, D } = this
    for (let i = 0; i < N; i++) {
      const g = P[this.nbest(i)]
      for (let d = 0; d < D; d++) {
        const r1 = Math.random()
        const r2 = Math.random()
        V[i][d] = this.chi * V[i][d] + this.c1 * r1 * (P[i][d] - X[i][d]) + this.c2 * r2 * (g[d] - X[i][d])
        X[i][d] += V[i][d]
        if (this.out(X[i][d], d)) {
          X[i][d] = Math.max(B(this.lo, d), Math.min(B(this.hi, d), X[i][d]))
          V[i][d] = 0
        }
      }
    }
    for (let i = 0; i < N; i++) {
      this.fit[i] = this.ev(X[i])
      if (this.fit[i] < this.pfit[i]) {
        this.pfit[i] = this.fit[i]
        P[i] = X[i].slice()
      }
    }
    this.track()
    this.iter++
  }
}

/* ───────────────────────── Differential Evolution ───────────────────────── */
export class DE extends Base {
  constructor(o) {
    super(o)
    this.F = o.F ?? 0.5
    this.CR = o.CR ?? 0.5
    this.strategy = o.strategy ?? 'best1'
    this.X = Array.from({ length: this.N }, () => this.randPos())
    this.fit = this.X.map((x) => this.ev(x))
    this.track()
  }
  pick(exclude, k) {
    const out = []
    while (out.length < k) {
      const r = randInt(this.N)
      if (r !== exclude && !out.includes(r)) out.push(r)
    }
    return out
  }
  step() {
    const { X, fit, N, D } = this
    const nX = new Array(N)
    const nF = new Array(N)
    const best = X[this.best]
    for (let i = 0; i < N; i++) {
      const [a, b, c] = this.pick(i, 3)
      const jr = randInt(D)
      const u = X[i].slice()
      for (let d = 0; d < D; d++) {
        if (Math.random() <= this.CR || d === jr) {
          // mutant component
          let v
          if (this.strategy === 'rand1') v = X[a][d] + this.F * (X[b][d] - X[c][d])
          else v = best[d] + this.F * (X[a][d] - X[b][d])
          u[d] = this.out(v, d) ? this.r(d) : v
        }
      }
      const fu = this.ev(u)
      if (fu <= fit[i]) {
        nX[i] = u
        nF[i] = fu
      } else {
        nX[i] = X[i]
        nF[i] = fit[i]
      }
    }
    this.X = nX
    this.fit = nF
    this.track()
    this.iter++
  }
}

/* ───────────────────────── Real-valued Genetic Algorithm ───────────────────────── */
export class GA extends Base {
  constructor(o) {
    super(o)
    this.pm = o.pm ?? 0.1 // chance each gene mutates
    this.pc = o.pc ?? 0.9 // chance a pair of parents is crossed over
    this.sigma = o.sigma ?? 0.1 // mutation size, as a fraction of the range
    this.elite = o.elite ?? 1
    this.X = Array.from({ length: this.N }, () => this.randPos())
    this.fit = this.X.map((x) => this.ev(x))
    this.track()
  }
  tournament() {
    const a = randInt(this.N)
    const b = randInt(this.N)
    return this.fit[a] < this.fit[b] ? a : b
  }
  step() {
    const { X, fit, N, D } = this
    const order = fit.map((_, i) => i).sort((a, b) => fit[a] - fit[b])
    const nX = order.slice(0, this.elite).map((i) => X[i].slice())
    while (nX.length < N) {
      const p1 = X[this.tournament()]
      const p2 = X[this.tournament()]
      const child = p1.slice()
      if (Math.random() < this.pc) for (let d = 0; d < D; d++) if (Math.random() < 0.5) child[d] = p2[d]
      for (let d = 0; d < D; d++) {
        if (Math.random() < this.pm) {
          const v = child[d] + gauss() * this.sigma * (B(this.hi, d) - B(this.lo, d))
          child[d] = this.out(v, d) ? this.r(d) : v
        }
      }
      nX.push(child)
    }
    this.X = nX
    this.fit = nX.map((x) => this.ev(x))
    this.track()
    this.iter++
  }
}

/* ───────────────────────── Baselines ───────────────────────── */
/** Pure random search: no intelligence at all. Every good algorithm must beat this. */
export class RandomSearch extends Base {
  constructor(o) {
    super(o)
    this.X = Array.from({ length: this.N }, () => this.randPos())
    this.fit = this.X.map((x) => this.ev(x))
    this.track()
  }
  step() {
    this.X = Array.from({ length: this.N }, () => this.randPos())
    this.fit = this.X.map((x) => this.ev(x))
    this.track()
    this.iter++
  }
}

/** N independent greedy hill-climbers. They never talk to each other and never accept a worse point. */
export class HillClimbers extends Base {
  constructor(o) {
    super(o)
    this.sigma = o.sigma ?? 0.02
    this.X = Array.from({ length: this.N }, () => this.randPos())
    this.fit = this.X.map((x) => this.ev(x))
    this.track()
  }
  step() {
    const { X, fit, N, D } = this
    for (let i = 0; i < N; i++) {
      const y = X[i].map((v, d) => {
        const w = v + gauss() * this.sigma * (B(this.hi, d) - B(this.lo, d))
        return this.out(w, d) ? v : w
      })
      const fy = this.ev(y)
      if (fy < fit[i]) {
        X[i] = y
        fit[i] = fy
      }
    }
    this.track()
    this.iter++
  }
}

export const ALGOS = {
  dfo: { name: 'DFO', long: 'Dispersive Flies Optimisation', make: (o) => new DFO(o), color: '#5eead4' },
  pso: { name: 'PSO', long: 'Particle Swarm Optimisation', make: (o) => new PSO(o), color: '#fbbf24' },
  de: { name: 'DE', long: 'Differential Evolution', make: (o) => new DE(o), color: '#f472b6' },
  ga: { name: 'GA', long: 'Genetic Algorithm', make: (o) => new GA(o), color: '#a78bfa' },
  hc: { name: 'Hill climbers', long: 'Independent greedy hill-climbers', make: (o) => new HillClimbers(o), color: '#60a5fa' },
  rs: { name: 'Random search', long: 'Pure random search', make: (o) => new RandomSearch(o), color: '#94a3b8' },
}

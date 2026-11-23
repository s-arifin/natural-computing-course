// Benchmark ("test") functions. Every one is a MINIMISATION problem.
// x is an array of D numbers; the function returns one number: the fitness (lower = better).

const sphere = (x) => {
  let s = 0
  for (let d = 0; d < x.length; d++) s += x[d] * x[d]
  return s
}

const rastrigin = (x) => {
  let s = 0
  for (let d = 0; d < x.length; d++) s += x[d] * x[d] - 10 * Math.cos(2 * Math.PI * x[d]) + 10
  return s
}

const ackley = (x) => {
  const D = x.length
  let a = 0
  let b = 0
  for (let d = 0; d < D; d++) {
    a += x[d] * x[d]
    b += Math.cos(2 * Math.PI * x[d])
  }
  return -20 * Math.exp(-0.2 * Math.sqrt(a / D)) - Math.exp(b / D) + 20 + Math.E
}

const rosenbrock = (x) => {
  let s = 0
  for (let d = 0; d < x.length - 1; d++) s += 100 * (x[d + 1] - x[d] * x[d]) ** 2 + (1 - x[d]) ** 2
  return s
}

const schwefel = (x) => {
  let s = 0
  for (let d = 0; d < x.length; d++) s += x[d] * Math.sin(Math.sqrt(Math.abs(x[d])))
  return 418.9828872724339 * x.length - s
}

export const BENCH = {
  sphere: {
    key: 'sphere',
    name: 'Sphere',
    f: sphere,
    lo: -5.12,
    hi: 5.12,
    scale: 'linear',
    kind: 'unimodal',
    optimum: 'x = (0, …, 0)',
    blurb: 'One smooth bowl. No traps at all. If an algorithm cannot solve this, it cannot solve anything.',
  },
  rastrigin: {
    key: 'rastrigin',
    name: 'Rastrigin',
    f: rastrigin,
    lo: -5.12,
    hi: 5.12,
    scale: 'linear',
    kind: 'highly multimodal',
    optimum: 'x = (0, …, 0)',
    blurb: 'A bowl covered in an egg-box of regularly spaced dents. Each dent is a local minimum that traps greedy searchers.',
  },
  ackley: {
    key: 'ackley',
    name: 'Ackley',
    f: ackley,
    lo: -32.768,
    hi: 32.768,
    scale: 'linear',
    kind: 'multimodal',
    optimum: 'x = (0, …, 0)',
    blurb: 'A nearly flat, bumpy plain with one deep hole in the middle. Far from the hole there is almost no slope to follow.',
  },
  rosenbrock: {
    key: 'rosenbrock',
    name: 'Rosenbrock',
    f: rosenbrock,
    lo: -2.048,
    hi: 2.048,
    scale: 'log',
    kind: 'unimodal (2D), curved valley',
    optimum: 'x = (1, …, 1)',
    blurb: 'A long, curved, banana-shaped valley. Finding the valley is easy; walking along it to the minimum is slow.',
  },
  schwefel: {
    key: 'schwefel',
    name: 'Schwefel',
    f: schwefel,
    lo: -500,
    hi: 500,
    scale: 'linear',
    kind: 'multimodal, deceptive',
    optimum: 'x ≈ (420.97, …, 420.97)',
    blurb: 'Deceptive: the best valley sits in a far corner, a long way from the second-best valley. Punishes swarms that commit too early.',
  },
}

export const BENCH_LIST = Object.values(BENCH)

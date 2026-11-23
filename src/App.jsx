import { useEffect, useState } from 'react'
import { useStored } from './lib/util'
import W1 from './lessons/W1'
import W2 from './lessons/W2'
import W3 from './lessons/W3'
import W4 from './lessons/W4'
import W5 from './lessons/W5'
import W6 from './lessons/W6'
import W7 from './lessons/W7'
import W8 from './lessons/W8'
import { ArenaPage, Toolkit } from './lessons/Extras'

const PAGES = [
  { id: 'w1', tag: 'Week 1', title: 'Why copy nature?', blurb: 'Hard problems, swarm intelligence, emergence and self-organisation.', C: W1, quiz: true },
  { id: 'w2', tag: 'Week 2', title: 'Optimisation & fitness', blurb: 'Fitness functions, search spaces, protein folding and 3-D benchmark landscapes.', C: W2, quiz: true },
  { id: 'w3', tag: 'Week 3', title: 'Dispersive Flies Optimisation', blurb: 'The update equation, ring topology and the disturbance threshold.', C: W3, quiz: true },
  { id: 'w4', tag: 'Week 4', title: 'DFO in practice', blurb: 'Brightest-spot tracking, designing fitness functions, tuning and reporting.', C: W4, quiz: true },
  { id: 'w5', tag: 'Week 5', title: 'Genetic algorithms', blurb: 'Selection, crossover, mutation and the travelling salesman.', C: W5, quiz: true },
  { id: 'w6', tag: 'Week 6', title: 'Stochastic Diffusion Search', blurb: 'The mining game, partial evaluation and text search.', C: W6, quiz: true },
  { id: 'w7', tag: 'Week 7', title: 'Ant Colony Optimisation', blurb: 'Double-bridge experiment, stigmergy, transition rule and pheromone update.', C: W7, quiz: true },
  { id: 'w8', tag: 'Week 8', title: 'PSO & Differential Evolution', blurb: 'Velocity and memory; mutant, trial and target vectors.', C: W8, quiz: true },
  { id: 'arena', tag: 'Lab', title: 'Algorithm Arena', blurb: 'Compare all the optimisers fairly and read convergence plots.', C: ArenaPage, quiz: true },
  { id: 'toolkit', tag: 'Reference', title: 'Coursework toolkit', blurb: 'Marking scheme map, formula cheat sheet and glossary.', C: Toolkit },
]

function Home({ done, go }) {
  const total = PAGES.filter((p) => p.quiz).length
  const n = PAGES.filter((p) => p.quiz && done[p.id]).length
  return (
    <article className="lesson home">
      <header className="lesson-head">
        <div className="kicker">COMP1805 · Natural Computing</div>
        <h1>Eight weeks of lectures, rebuilt so they make sense</h1>
        <p className="lede">
          Each lesson starts from nothing: where the idea came from, an everyday analogy, the mechanics one step at a time, every formula with
          each symbol labelled, and simulators you can break and fix. Work through them in order. The later weeks lean on the earlier ones.
        </p>
        <div className="progress">
          <div className="progress-bar"><div style={{ width: `${(n / total) * 100}%` }} /></div>
          <span>{n} of {total} quizzes completed</span>
        </div>
      </header>
      <div className="home-how">
        <div><b>1. Read the story first.</b> The history and analogy boxes give you a picture to hang the maths on.</div>
        <div><b>2. Hover the formulas.</b> Every coloured symbol links to a plain-English meaning and a worked example with real numbers.</div>
        <div><b>3. Do the "Try this" experiments.</b> They are designed so that each one shows you a single idea.</div>
        <div><b>4. Take the quiz.</b> Wrong answers explain themselves. A tick appears in the sidebar when you finish.</div>
      </div>
      <div className="cards">
        {PAGES.map((p) => (
          <button key={p.id} className="home-card" onClick={() => go(p.id)}>
            <span className="home-card-tag">{p.tag}{done[p.id] ? ' · done' : ''}</span>
            <b>{p.title}</b>
            <span>{p.blurb}</span>
          </button>
        ))}
      </div>
    </article>
  )
}

export default function App() {
  const read = () => window.location.hash.replace('#/', '') || 'home'
  const [page, setPage] = useState(read)
  const [done, setDone] = useStored('nc-course-done', {})
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const h = () => setPage(read())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  const go = (id) => {
    window.location.hash = `#/${id}`
    setMenu(false)
    window.scrollTo(0, 0)
  }
  useEffect(() => { window.scrollTo(0, 0) }, [page])

  const idx = PAGES.findIndex((p) => p.id === page)
  const cur = PAGES[idx]
  const next = idx >= 0 ? PAGES[idx + 1] : PAGES[0]
  const prev = idx > 0 ? PAGES[idx - 1] : null

  return (
    <div className="app">
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Toggle menu">☰</button>
        <span>Natural Computing</span>
      </header>
      <nav className={`sidebar ${menu ? 'open' : ''}`}>
        <button className="brand" onClick={() => go('home')}>
          <b>Natural Computing</b>
          <span>interactive course</span>
        </button>
        <button className={`nav-item ${page === 'home' ? 'active' : ''}`} onClick={() => go('home')}>
          <span className="nav-tag">Start</span>
          <span className="nav-title">Course map</span>
        </button>
        {PAGES.map((p) => (
          <button key={p.id} className={`nav-item ${page === p.id ? 'active' : ''}`} onClick={() => go(p.id)}>
            <span className="nav-tag">{p.tag}</span>
            <span className="nav-title">{p.title}</span>
            {done[p.id] && <span className="nav-done" aria-label="completed">✓</span>}
          </button>
        ))}
      </nav>
      <main className="main">
        {cur ? <cur.C key={cur.id} onDone={() => setDone((d) => ({ ...d, [cur.id]: true }))} /> : <Home done={done} go={go} />}
        <footer className="pager">
          {prev ? <button className="btn" onClick={() => go(prev.id)}>← {prev.tag}: {prev.title}</button> : <span />}
          {next && <button className="btn primary" onClick={() => go(next.id)}>{next.tag}: {next.title} →</button>}
        </footer>
      </main>
    </div>
  )
}

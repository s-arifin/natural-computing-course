import { Component, useState } from 'react'

/** If one simulator crashes, show a retry box instead of blanking the whole lesson. */
class SimBoundary extends Component {
  state = { err: null }
  static getDerivedStateFromError(err) {
    return { err }
  }
  render() {
    if (!this.state.err) return this.props.children
    return (
      <div className="sim-note warn">
        This simulator hit an error ({String(this.state.err.message || this.state.err)}).{' '}
        <button className="btn small" onClick={() => this.setState({ err: null })}>
          Reload it
        </button>
      </div>
    )
  }
}

export function Lesson({ week, title, subtitle, time, children }) {
  return (
    <article className="lesson">
      <header className="lesson-head">
        <div className="kicker">{week}</div>
        <h1>{title}</h1>
        {subtitle && <p className="lede">{subtitle}</p>}
        {time && <div className="meta">About {time} · read, then play with every simulator</div>}
      </header>
      {children}
    </article>
  )
}

export function Section({ n, title, children }) {
  return (
    <section className="section">
      <h2>
        {n && <span className="sec-n">{n}</span>}
        {title}
      </h2>
      {children}
    </section>
  )
}

const CALLOUT_LABEL = {
  history: 'A bit of history',
  analogy: 'Analogy',
  key: 'Key idea',
  warn: 'Common mistake',
  deep: 'Going deeper than the lecture',
  try: 'Try this',
  cw: 'For your coursework',
  example: 'Worked example',
}

export function Callout({ type = 'key', title, children }) {
  return (
    <aside className={`callout ${type}`}>
      <div className="callout-label">{CALLOUT_LABEL[type]}</div>
      {title && <div className="callout-title">{title}</div>}
      <div className="callout-body">{children}</div>
    </aside>
  )
}

export function Sim({ title, caption, children, wide }) {
  return (
    <figure className={`sim ${wide ? 'wide' : ''}`}>
      <div className="sim-head">
        <span className="sim-tag">Interactive</span>
        <span className="sim-title">{title}</span>
      </div>
      <div className="sim-body">
        <SimBoundary>{children}</SimBoundary>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, format, hint }) {
  return (
    <label className="slider">
      <span className="slider-top">
        <span>{label}</span>
        <b>{format ? format(value) : value}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <span className="slider-hint">{hint}</span>}
    </label>
  )
}

export function Btn({ children, primary, onClick, disabled, small, active }) {
  return (
    <button
      className={`btn ${primary ? 'primary' : ''} ${small ? 'small' : ''} ${active ? 'active' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="select">
      {label && <span>{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Stats({ items }) {
  return (
    <div className="stats">
      {items.map((s) => (
        <div className="stat" key={s.label}>
          <span>{s.label}</span>
          <b style={s.color ? { color: s.color } : null}>{s.value}</b>
        </div>
      ))}
    </div>
  )
}

export function Code({ children, title }) {
  return (
    <div className="code">
      {title && <div className="code-title">{title}</div>}
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  )
}

/** A table that compares things side by side. rows: array of arrays. */
export function Table({ head, rows }) {
  return (
    <div className="table-wrap">
      <table className="table">
        {head && (
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Quiz({ questions, onDone }) {
  const [picked, setPicked] = useState({})
  const answered = Object.keys(picked).length
  const correct = questions.filter((q, i) => picked[i] === q.answer).length
  const pick = (i, j) => {
    if (picked[i] !== undefined) return
    const next = { ...picked, [i]: j }
    setPicked(next)
    if (Object.keys(next).length === questions.length && onDone) onDone()
  }
  return (
    <div className="quiz">
      <div className="quiz-head">
        <h3>Check your understanding</h3>
        <span>
          {answered === questions.length ? `${correct} / ${questions.length} correct` : `${answered} / ${questions.length} answered`}
        </span>
      </div>
      {questions.map((q, i) => (
        <div className="q" key={i}>
          <p className="q-text">
            <b>{i + 1}.</b> {q.q}
          </p>
          <div className="q-opts">
            {q.options.map((o, j) => {
              const done = picked[i] !== undefined
              const cls = !done ? '' : j === q.answer ? 'right' : picked[i] === j ? 'wrong' : 'dim'
              return (
                <button key={j} className={`q-opt ${cls}`} onClick={() => pick(i, j)} disabled={done}>
                  {o}
                </button>
              )
            })}
          </div>
          {picked[i] !== undefined && (
            <p className={`q-why ${picked[i] === q.answer ? 'ok' : 'no'}`}>
              <b>{picked[i] === q.answer ? 'Correct. ' : 'Not quite. '}</b>
              {q.why}
            </p>
          )}
        </div>
      ))}
      {answered === questions.length && (
        <Btn small onClick={() => setPicked({})}>
          Try again
        </Btn>
      )}
    </div>
  )
}

/** Numbered step-by-step list where each step has a short heading. */
export function Steps({ items }) {
  return (
    <ol className="steps">
      {items.map((s, i) => (
        <li key={i}>
          <b>{s[0]}</b>
          <span>{s[1]}</span>
        </li>
      ))}
    </ol>
  )
}

import { createContext, useContext, useState } from 'react'
import { PALETTE } from '../lib/util'

const Ctx = createContext(null)

/**
 * A formula where every symbol is colour-coded and explained.
 *   legend: [{ k: 'u', sym: 'u', name: 'Random step size', desc: '...' }]
 *   children: the formula itself, built from <P k="u">u</P> pieces plus Frac / Sum / Sqrt helpers.
 * Hovering (or tapping) a symbol highlights its explanation, and the other way round.
 */
export function Formula({ title, legend, children, plain, example, number }) {
  const [hot, setHot] = useState(null)
  const colorOf = (k) => {
    const i = legend.findIndex((l) => l.k === k)
    return i < 0 ? 'inherit' : PALETTE[i % PALETTE.length]
  }
  return (
    <figure className="formula">
      <div className="formula-head">
        <span className="formula-title">{title}</span>
        {number && <span className="formula-num">lecture eq. {number}</span>}
      </div>
      <Ctx.Provider value={{ hot, setHot, colorOf }}>
        <div className="formula-line">{children}</div>
      </Ctx.Provider>
      {plain && (
        <p className="formula-plain">
          <b>In plain English: </b>
          {plain}
        </p>
      )}
      <div className="legend-hint">Every coloured symbol is explained below. Hover or tap one to link it to its meaning.</div>
      <ul className="legend">
        {legend.map((l) => (
          <li
            key={l.k}
            className={hot === l.k ? 'hot' : ''}
            onMouseEnter={() => setHot(l.k)}
            onMouseLeave={() => setHot(null)}
            onClick={() => setHot(l.k)}
          >
            <span className="sym" style={{ color: colorOf(l.k), borderColor: colorOf(l.k) }}>
              {l.sym}
            </span>
            <div>
              <b>{l.name}</b>
              <span>{l.desc}</span>
            </div>
          </li>
        ))}
      </ul>
      {example && (
        <div className="formula-example">
          <b>With real numbers: </b>
          {example}
        </div>
      )}
    </figure>
  )
}

/** One labelled piece of a formula. */
export function P({ k, children }) {
  const { hot, setHot, colorOf } = useContext(Ctx)
  return (
    <span
      className={`fpart ${hot === k ? 'hot' : ''}`}
      style={{ color: colorOf(k) }}
      onMouseEnter={() => setHot(k)}
      onMouseLeave={() => setHot(null)}
      onClick={() => setHot(k)}
    >
      {children}
    </span>
  )
}

export const Frac = ({ n, d }) => (
  <span className="frac">
    <span className="frac-n">{n}</span>
    <span className="frac-d">{d}</span>
  </span>
)

export const Sum = ({ from, to }) => (
  <span className="bigop">
    <span className="bigop-to">{to}</span>
    <span className="bigop-sym">Σ</span>
    <span className="bigop-from">{from}</span>
  </span>
)

export const Sqrt = ({ children }) => (
  <span className="sqrt">
    <span className="sqrt-sym">√</span>
    <span className="sqrt-body">{children}</span>
  </span>
)

/** Variable with optional subscript / superscript, in maths italics. */
export const V = ({ children, sub, sup }) => (
  <span className="mv">
    <i>{children}</i>
    {(sub || sup) && (
      <span className="mv-ss">
        <span className="mv-sup">{sup ?? ' '}</span>
        <span className="mv-sub">{sub ?? ' '}</span>
      </span>
    )}
  </span>
)

/** Inline maths (no legend) for use inside sentences. */
export const M = ({ children }) => <span className="m-inline">{children}</span>

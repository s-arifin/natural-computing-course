import { useEffect, useRef, useState, useCallback } from 'react'

export const rand = (a = 0, b = 1) => a + Math.random() * (b - a)
export const randInt = (n) => Math.floor(Math.random() * n)
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const sum = (a) => a.reduce((s, v) => s + v, 0)
export const mean = (a) => (a.length ? sum(a) / a.length : 0)
export const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
export const std = (a) => {
  const m = mean(a)
  return Math.sqrt(mean(a.map((v) => (v - m) ** 2)))
}
export function shuffle(a) {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
export function gauss() {
  let u = 0
  while (u === 0) u = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random())
}

/** Friendly number formatting: small/huge numbers go scientific. */
export function fmt(n, digits = 3) {
  if (n === null || n === undefined || Number.isNaN(n)) return '–'
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '-∞'
  const a = Math.abs(n)
  if (a === 0) return '0'
  if (a < 1e-3 || a >= 1e6) return n.toExponential(2).replace('e+', 'e')
  if (a >= 100) return n.toFixed(1)
  return n.toFixed(digits)
}

/** Run `fn` repeatedly while `running` is true, at roughly `fps` calls per second. */
export function useLoop(fn, running, fps = 30) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (!running) return
    let id
    let last = 0
    const frame = (t) => {
      if (t - last >= 1000 / fps) {
        last = t
        ref.current()
      }
      id = requestAnimationFrame(frame)
    }
    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [running, fps])
}

export function useForce() {
  const [, s] = useState(0)
  return useCallback(() => s((x) => x + 1), [])
}

export function useStored(key, init) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : init
    } catch {
      return init
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* storage unavailable: progress simply isn't remembered */
    }
  }, [key, v])
  return [v, setV]
}

// Colour map (dark blue -> teal -> yellow). t in [0,1]; low values are "good" (dark/cool).
const STOPS = [
  [13, 20, 60],
  [38, 60, 130],
  [30, 120, 150],
  [45, 170, 130],
  [150, 210, 80],
  [250, 225, 70],
]
export function colormap(t) {
  t = clamp(Number.isFinite(t) ? t : 0, 0, 1) * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(t))
  const f = t - i
  const a = STOPS[i]
  const b = STOPS[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

export const PALETTE = ['#5eead4', '#fbbf24', '#f472b6', '#a78bfa', '#60a5fa', '#fb923c', '#a3e635', '#f87171']

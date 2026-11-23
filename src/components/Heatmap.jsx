import { useEffect, useRef } from 'react'
import { colormap } from '../lib/util'

/**
 * Top-down "map" view of a 2-D fitness function: dark blue = low (good), yellow = high (bad),
 * with contour lines like a hiking map. `draw(ctx, toPx, size)` paints agents on top.
 */
export default function Heatmap({ f, lo, hi, scale = 'linear', size = 440, draw, tick, onClick }) {
  const ref = useRef(null)
  const base = useRef({ key: null, canvas: null })

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    if (cv.width !== size * dpr) {
      cv.width = size * dpr
      cv.height = size * dpr
    }
    const key = `${f.name}|${lo}|${hi}|${scale}|${size}`
    if (base.current.key !== key) {
      const res = 180
      const off = document.createElement('canvas')
      off.width = res
      off.height = res
      const octx = off.getContext('2d')
      const img = octx.createImageData(res, res)
      const vals = new Float64Array(res * res)
      let mn = Infinity
      let mx = -Infinity
      for (let j = 0; j < res; j++) {
        for (let i = 0; i < res; i++) {
          const x = lo + ((i + 0.5) / res) * (hi - lo)
          const y = hi - ((j + 0.5) / res) * (hi - lo)
          let v = f([x, y])
          if (scale === 'log') v = Math.log(1 + v)
          vals[j * res + i] = v
          if (v < mn) mn = v
          if (v > mx) mx = v
        }
      }
      for (let k = 0; k < vals.length; k++) {
        const t = Math.max(0, (vals[k] - mn) / (mx - mn || 1))
        let [r, g, b] = colormap(Math.pow(t, 0.75))
        const band = (t * 16) % 1
        if (band < 0.07) {
          r *= 0.72
          g *= 0.72
          b *= 0.72
        }
        img.data[k * 4] = r
        img.data[k * 4 + 1] = g
        img.data[k * 4 + 2] = b
        img.data[k * 4 + 3] = 255
      }
      octx.putImageData(img, 0, 0)
      base.current = { key, canvas: off }
    }
    const ctx = cv.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(base.current.canvas, 0, 0, size, size)
    const toPx = (x, y) => [((x - lo) / (hi - lo)) * size, size - ((y - lo) / (hi - lo)) * size]
    if (draw) draw(ctx, toPx, size)
  })

  const click = (e) => {
    if (!onClick) return
    const r = ref.current.getBoundingClientRect()
    const x = lo + ((e.clientX - r.left) / r.width) * (hi - lo)
    const y = hi - ((e.clientY - r.top) / r.height) * (hi - lo)
    onClick(x, y)
  }

  return (
    <canvas
      ref={ref}
      className="heatmap"
      data-tick={tick}
      style={{ width: '100%', maxWidth: size, aspectRatio: '1 / 1', cursor: onClick ? 'crosshair' : 'default' }}
      onClick={click}
    />
  )
}

export function dot(ctx, x, y, r, fill, stroke) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

export function line(ctx, x1, y1, x2, y2, color, width = 1, dash) {
  ctx.beginPath()
  ctx.setLineDash(dash || [])
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
  ctx.setLineDash([])
}

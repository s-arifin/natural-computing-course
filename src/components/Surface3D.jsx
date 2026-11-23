import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { colormap } from '../lib/util'

/**
 * A 3-D "fitness landscape": the floor is the two variables (x1, x2), the height is f(x1, x2).
 * Drag to rotate, scroll to zoom. `pointsRef.current` (array of [x1, x2]) is drawn as glowing
 * balls resting on the surface and is re-read every frame, so a running algorithm animates live.
 */
export default function Surface3D({ f, lo, hi, scale = 'linear', pointsRef, bestRef, height = 420, autoRotate = true }) {
  const mount = useRef(null)
  const rotateRef = useRef(autoRotate)
  rotateRef.current = autoRotate

  useEffect(() => {
    const el = mount.current
    const W = el.clientWidth || 600
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, W / height, 0.1, 100)
    camera.position.set(7.5, 6.5, 7.5)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    renderer.setSize(W, height)
    el.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 1, 0)
    controls.maxPolarAngle = Math.PI / 2.05
    controls.minDistance = 4
    controls.maxDistance = 22

    scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(4, 10, 6)
    scene.add(sun)

    // Build the surface
    const SEG = 140
    const SIZE = 8
    const HMAX = 3.2
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const raw = new Float64Array(pos.count)
    let mn = Infinity
    let mx = -Infinity
    const tr = (v) => (scale === 'log' ? Math.log(1 + v) : v)
    for (let i = 0; i < pos.count; i++) {
      const x = lo + ((pos.getX(i) + SIZE / 2) / SIZE) * (hi - lo)
      const y = lo + ((-pos.getZ(i) + SIZE / 2) / SIZE) * (hi - lo)
      const v = tr(f([x, y]))
      raw[i] = v
      if (v < mn) mn = v
      if (v > mx) mx = v
    }
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const t = Math.max(0, Math.min(1, (raw[i] - mn) / (mx - mn || 1)))
      pos.setY(i, t * HMAX)
      const [r, g, b] = colormap(Math.pow(t, 0.75))
      colors[i * 3] = r / 255
      colors[i * 3 + 1] = g / 255
      colors[i * 3 + 2] = b / 255
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.75, metalness: 0.05 })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    const grid = new THREE.GridHelper(SIZE, 8, 0x475569, 0x1e293b)
    grid.position.y = -0.02
    scene.add(grid)

    // Agents
    const MAXP = 200
    const ballGeo = new THREE.SphereGeometry(0.075, 12, 12)
    const ballMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const balls = new THREE.InstancedMesh(ballGeo, ballMat, MAXP)
    balls.count = 0
    scene.add(balls)
    const bestBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }))
    bestBall.visible = false
    scene.add(bestBall)
    const dummy = new THREE.Object3D()

    const place = (x, y) => {
      const wx = ((x - lo) / (hi - lo)) * SIZE - SIZE / 2
      const wz = -(((y - lo) / (hi - lo)) * SIZE - SIZE / 2)
      const t = (tr(f([x, y])) - mn) / (mx - mn || 1)
      return [wx, Math.max(0, Math.min(1.05, t)) * HMAX + 0.08, wz]
    }

    let raf
    let angle = Math.PI / 4
    const tick = () => {
      const pts = pointsRef?.current
      if (pts && pts.length) {
        const n = Math.min(MAXP, pts.length)
        for (let i = 0; i < n; i++) {
          const [a, b, c] = place(pts[i][0], pts[i][1])
          dummy.position.set(a, b, c)
          dummy.updateMatrix()
          balls.setMatrixAt(i, dummy.matrix)
        }
        balls.count = n
        balls.instanceMatrix.needsUpdate = true
      } else balls.count = 0
      const bp = bestRef?.current
      if (bp) {
        const [a, b, c] = place(bp[0], bp[1])
        bestBall.position.set(a, b + 0.05, c)
        bestBall.visible = true
      } else bestBall.visible = false
      if (rotateRef.current) {
        angle += 0.0025
        const r = Math.hypot(camera.position.x, camera.position.z)
        camera.position.x = Math.cos(angle) * r
        camera.position.z = Math.sin(angle) * r
      } else {
        angle = Math.atan2(camera.position.z, camera.position.x)
      }
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      if (!w) return
      renderer.setSize(w, height)
      camera.aspect = w / height
      camera.updateProjectionMatrix()
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      geo.dispose()
      mat.dispose()
      ballGeo.dispose()
      ballMat.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [f, lo, hi, scale, height, pointsRef, bestRef])

  return <div ref={mount} className="surface3d" style={{ height }} />
}

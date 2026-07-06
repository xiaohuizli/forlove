import * as THREE from 'three'
import { mulberry32 } from '../core/random'

export class EarthAtmosphereLayer {
  readonly group = new THREE.Group()
  private readonly rings: THREE.Line[]
  private readonly atmosphere: THREE.Mesh
  private readonly outerGlow: THREE.Mesh
  private readonly stars: THREE.Points

  constructor() {
    this.atmosphere = createGlowSphere(2.86, '#43f5ff', 0.06)
    this.outerGlow = createGlowSphere(3.08, '#5b8cff', 0.05)
    this.rings = [
      createOrbitRing({ radiusX: 3.65, radiusY: 0.72, color: '#56f4ff', opacity: 0.46, z: 0.08, tilt: 0.42 }),
      createOrbitRing({ radiusX: 3.85, radiusY: 0.54, color: '#ffffff', opacity: 0.28, z: -0.04, tilt: -0.36 }),
      createOrbitRing({ radiusX: 3.45, radiusY: 0.92, color: '#b77cff', opacity: 0.28, z: 0.18, tilt: 0.78 }),
      createOrbitRing({ radiusX: 3.95, radiusY: 0.62, color: '#ffcf8a', opacity: 0.22, z: -0.12, tilt: -0.7 }),
    ]
    this.stars = createStarField()
    this.group.add(this.stars, this.outerGlow, this.atmosphere, ...this.rings)
    this.group.visible = true
  }

  update(deltaSeconds: number, idleVisible: boolean): void {
    this.group.visible = idleVisible
    if (!idleVisible) return

    this.atmosphere.rotation.y += deltaSeconds * 0.06
    this.outerGlow.rotation.y -= deltaSeconds * 0.035
    this.stars.rotation.z += deltaSeconds * 0.004
    this.rings.forEach((ring, index) => {
      ring.rotation.z += deltaSeconds * (0.08 + index * 0.025)
      ring.rotation.y = Math.sin(performance.now() * 0.00022 + index) * 0.12
    })
  }
}

function createGlowSphere(radius: number, color: string, opacity: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 64, 32)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  })
  return new THREE.Mesh(geometry, material)
}

function createOrbitRing(options: {
  radiusX: number
  radiusY: number
  color: string
  opacity: number
  z: number
  tilt: number
}): THREE.Line {
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= 240; i += 1) {
    const angle = (i / 240) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * options.radiusX, Math.sin(angle) * options.radiusY, options.z))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color: options.color,
    transparent: true,
    opacity: options.opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const line = new THREE.Line(geometry, material)
  line.rotation.x = options.tilt
  line.rotation.z = options.tilt * 0.45
  return line
}

function createStarField(): THREE.Points {
  const count = 1200
  const random = mulberry32(128)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const offset = i * 3
    const angle = random() * Math.PI * 2
    const radius = 4.4 + random() * 5.2
    positions[offset] = Math.cos(angle) * radius
    positions[offset + 1] = (random() - 0.5) * 6.3
    positions[offset + 2] = -2.8 - random() * 2.2
    const warm = random() > 0.72
    colors[offset] = warm ? 1 : 0.78 + random() * 0.22
    colors[offset + 1] = warm ? 0.82 : 0.86 + random() * 0.14
    colors[offset + 2] = warm ? 0.55 : 1
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const material = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  return new THREE.Points(geometry, material)
}

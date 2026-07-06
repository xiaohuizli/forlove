import * as THREE from 'three'
import { hexToRgb } from '../core/color'
import { FireworkLayerModel } from './FireworkLayerModel'

export class FireworkLayer {
  readonly points: THREE.Points
  private readonly model: FireworkLayerModel
  private readonly positions: Float32Array
  private readonly colors: Float32Array
  private readonly sizes: Float32Array
  private readonly material: THREE.PointsMaterial
  private readonly maxParticles: number

  constructor(maxParticles: number) {
    this.maxParticles = maxParticles
    this.model = new FireworkLayerModel({ maxParticles, seed: 91 })
    this.positions = new Float32Array(maxParticles * 3)
    this.colors = new Float32Array(maxParticles * 3)
    this.sizes = new Float32Array(maxParticles)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))

    this.material = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    this.points = new THREE.Points(geometry, this.material)
    this.points.visible = false
  }

  update(deltaSeconds: number, intensity: number): void {
    this.model.update(deltaSeconds, intensity)
    const particles = this.model.snapshot()
    this.points.visible = intensity > 0.03 || particles.length > 0
    this.material.opacity = Math.min(1, intensity)

    for (let i = 0; i < this.maxParticles; i += 1) {
      const particle = particles[i]
      const offset = i * 3
      if (!particle) {
        this.positions[offset] = 0
        this.positions[offset + 1] = -20
        this.positions[offset + 2] = 0
        this.colors[offset] = 0
        this.colors[offset + 1] = 0
        this.colors[offset + 2] = 0
        continue
      }

      const [r, g, b] = hexToRgb(particle.color)
      this.positions[offset] = particle.x
      this.positions[offset + 1] = particle.y
      this.positions[offset + 2] = particle.z
      this.colors[offset] = r * particle.opacity
      this.colors[offset + 1] = g * particle.opacity
      this.colors[offset + 2] = b * particle.opacity
      this.sizes[i] = particle.size
    }

    this.points.geometry.attributes.position.needsUpdate = true
    this.points.geometry.attributes.color.needsUpdate = true
  }
}

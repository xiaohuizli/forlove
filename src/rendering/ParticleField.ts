import * as THREE from 'three'
import type { ParticleTarget } from '../core/targetTypes'

export class ParticleField {
  readonly points: THREE.Points
  private readonly positions: Float32Array
  private readonly colors: Float32Array
  private target: ParticleTarget
  private burst = 0

  constructor(initialTarget: ParticleTarget) {
    this.target = initialTarget
    this.positions = new Float32Array(initialTarget.positions)
    this.colors = new Float32Array(initialTarget.colors)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    this.points = new THREE.Points(geometry, material)
  }

  setTarget(target: ParticleTarget, transition: 'morph' | 'burst' | 'dissolve' | 'snap'): void {
    this.target = target
    this.burst = transition === 'burst' || transition === 'dissolve' ? 1.2 : 0
    if (transition === 'snap') {
      this.positions.set(target.positions)
      this.colors.set(target.colors)
    }
  }

  update(deltaSeconds: number): void {
    const alpha = Math.min(1, deltaSeconds * 3.5)
    for (let i = 0; i < this.positions.length; i += 3) {
      const length = Math.hypot(this.target.positions[i], this.target.positions[i + 1], this.target.positions[i + 2]) || 1
      const push = this.burst / length
      this.positions[i] += (this.target.positions[i] + this.target.positions[i] * push - this.positions[i]) * alpha
      this.positions[i + 1] +=
        (this.target.positions[i + 1] + this.target.positions[i + 1] * push - this.positions[i + 1]) * alpha
      this.positions[i + 2] +=
        (this.target.positions[i + 2] + this.target.positions[i + 2] * push - this.positions[i + 2]) * alpha
      this.colors[i] += (this.target.colors[i] - this.colors[i]) * alpha
      this.colors[i + 1] += (this.target.colors[i + 1] - this.colors[i + 1]) * alpha
      this.colors[i + 2] += (this.target.colors[i + 2] - this.colors[i + 2]) * alpha
    }
    this.burst *= 0.94
    this.points.geometry.attributes.position.needsUpdate = true
    this.points.geometry.attributes.color.needsUpdate = true
  }
}

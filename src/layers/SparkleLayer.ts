import * as THREE from 'three'
import { writeColor } from '../core/color'
import { mulberry32 } from '../core/random'

export class SparkleLayer {
  readonly points: THREE.Points
  private readonly positions: Float32Array
  private readonly colors: Float32Array
  private readonly material: THREE.PointsMaterial

  constructor(count: number) {
    const random = mulberry32(44)
    this.positions = new Float32Array(count * 3)
    this.colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const offset = i * 3
      this.positions[offset] = -5.8 + random() * 11.6
      this.positions[offset + 1] = -3.2 + random() * 6.4
      this.positions[offset + 2] = -1.8 + random() * 2.4
      writeColor(this.colors, i, random() > 0.45 ? '#fff4b8' : '#ffffff')
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.material = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.points = new THREE.Points(geometry, this.material)
  }

  update(now: number, intensity: number): void {
    this.material.opacity = Math.min(0.9, intensity * (0.45 + Math.sin(now * 0.004) * 0.15))
    this.points.rotation.z += 0.0006 * intensity
  }
}

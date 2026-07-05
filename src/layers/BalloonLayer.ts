import * as THREE from 'three'
import { BalloonLayerModel } from './BalloonLayerModel'

export class BalloonLayer {
  readonly group = new THREE.Group()
  private readonly model: BalloonLayerModel
  private readonly balloons: THREE.Mesh[] = []
  private readonly strings: THREE.Line[] = []

  constructor(count: number) {
    this.model = new BalloonLayerModel({ count, seed: 18 })
    const states = this.model.snapshot()
    for (const state of states) {
      const geometry = new THREE.SphereGeometry(1, 18, 18)
      const material = new THREE.MeshBasicMaterial({ color: state.color, transparent: true, opacity: 0 })
      const mesh = new THREE.Mesh(geometry, material)
      this.group.add(mesh)
      this.balloons.push(mesh)

      const stringGeometry = new THREE.BufferGeometry().setFromPoints(createCurvedStringPoints(state.phase, 1.35))
      const line = new THREE.Line(
        stringGeometry,
        new THREE.LineBasicMaterial({ color: 0xf3ecff, transparent: true, opacity: 0 }),
      )
      this.group.add(line)
      this.strings.push(line)
    }
  }

  update(deltaSeconds: number, intensity: number): void {
    this.model.update(deltaSeconds, intensity)
    this.group.visible = intensity > 0.02
    this.model.snapshot().forEach((state, index) => {
      const mesh = this.balloons[index]
      const line = this.strings[index]
      mesh.position.set(state.x, state.y, state.z)
      mesh.scale.set(state.radius * 0.82, state.radius * 1.12, state.radius * 0.82)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = state.opacity * intensity
      line.position.set(state.x, state.y - state.radius, state.z)
      line.scale.setScalar(Math.max(0.75, state.radius * 3.2))
      ;(line.material as THREE.LineBasicMaterial).opacity = state.opacity * intensity * 0.82
    })
  }
}

export function createCurvedStringPoints(phase: number, length: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const segments = 5
  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments
    const sway = Math.sin(phase + progress * Math.PI * 1.4) * 0.08 * progress
    points.push(new THREE.Vector3(sway, -progress * length, 0))
  }
  return points
}

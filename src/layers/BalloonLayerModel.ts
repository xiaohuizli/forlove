import { mulberry32, pick } from '../core/random'

export interface BalloonState {
  x: number
  y: number
  z: number
  radius: number
  color: string
  opacity: number
  speed: number
  phase: number
  drift: number
}

const COLORS = ['#ff2d8f', '#ffd21f', '#00e5ff', '#a855f7', '#ff7a00', '#27f5a8']

export class BalloonLayerModel {
  private readonly balloons: BalloonState[]

  constructor(options: { count: number; seed: number }) {
    const random = mulberry32(options.seed)
    this.balloons = Array.from({ length: options.count }, () => ({
      x: -5.4 + random() * 10.8,
      y: -5.2 + random() * 6.8,
      z: -1.4 + random() * 2.8,
      radius: 0.1 + random() * 0.28,
      color: pick(COLORS, random),
      opacity: 0,
      speed: 0.14 + random() * 0.74,
      phase: random() * Math.PI * 2,
      drift: -0.08 + random() * 0.16,
    }))
  }

  update(deltaSeconds: number, intensity: number): void {
    for (const balloon of this.balloons) {
      balloon.y += balloon.speed * deltaSeconds * Math.max(0.2, intensity)
      balloon.x += balloon.drift * deltaSeconds + Math.sin(balloon.phase + balloon.y * 1.7) * 0.007
      balloon.opacity = Math.min(1, balloon.opacity + deltaSeconds * intensity)
      if (balloon.y > 4.8) {
        balloon.y = -5.2
        balloon.x = -5.4 + ((balloon.x + 8.1) % 10.8)
        balloon.opacity = 0
      }
    }
  }

  snapshot(): BalloonState[] {
    return this.balloons.map((balloon) => ({ ...balloon }))
  }
}

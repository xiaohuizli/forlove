import { mulberry32, pick } from '../core/random'

export interface FireworkParticleState {
  x: number
  y: number
  z: number
  opacity: number
  size: number
  color: string
}

interface Particle extends FireworkParticleState {
  vx: number
  vy: number
  vz: number
  age: number
  life: number
}

const COLORS = ['#ff2d8f', '#ffd21f', '#00e5ff', '#a855f7', '#ff7a00', '#27f5a8', '#fff4b8']

export class FireworkLayerModel {
  private readonly random: () => number
  private readonly maxParticles: number
  private readonly particles: Particle[] = []
  private launchTimer = 0

  constructor(options: { maxParticles: number; seed: number }) {
    this.random = mulberry32(options.seed)
    this.maxParticles = options.maxParticles
  }

  update(deltaSeconds: number, intensity: number): void {
    if (intensity > 0.05) {
      this.launchTimer -= deltaSeconds
      if (this.launchTimer <= 0 || this.particles.length === 0) {
        this.spawnBurst()
        this.launchTimer = 0.28 + this.random() * 0.38
      }
    }

    for (const particle of this.particles) {
      particle.age += deltaSeconds
      particle.vx *= 0.985
      particle.vy = particle.vy * 0.982 - 0.58 * deltaSeconds
      particle.vz *= 0.985
      particle.x += particle.vx * deltaSeconds
      particle.y += particle.vy * deltaSeconds
      particle.z += particle.vz * deltaSeconds
      const progress = Math.min(1, particle.age / particle.life)
      const twinkle = 0.72 + Math.sin((particle.age + particle.x) * 24) * 0.18
      particle.opacity = Math.max(0, (1 - progress) * intensity * twinkle)
      particle.size = 0.038 + (1 - progress) * 0.032
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      if (this.particles[i].age >= this.particles[i].life || this.particles[i].opacity <= 0.01) {
        this.particles.splice(i, 1)
      }
    }
  }

  snapshot(): FireworkParticleState[] {
    return this.particles.map(({ x, y, z, opacity, size, color }) => ({ x, y, z, opacity, size, color }))
  }

  private spawnBurst(): void {
    const centerX = -3.8 + this.random() * 7.6
    const centerY = 0.2 + this.random() * 2.9
    const centerZ = -0.8 + this.random() * 1.6
    const count = 92 + Math.floor(this.random() * 58)
    const color = pick(COLORS, this.random)

    for (let i = 0; i < count && this.particles.length < this.maxParticles; i += 1) {
      const theta = this.random() * Math.PI * 2
      const z = this.random() * 2 - 1
      const ring = Math.sqrt(Math.max(0, 1 - z * z))
      const speed = 1.1 + this.random() * 2.25

      this.particles.push({
        x: centerX,
        y: centerY,
        z: centerZ,
        vx: Math.cos(theta) * ring * speed,
        vy: Math.sin(theta) * ring * speed + 0.12,
        vz: z * speed * 0.55,
        age: 0,
        life: 1.25 + this.random() * 0.9,
        opacity: 1,
        size: 0.085,
        color: this.random() > 0.28 ? color : pick(COLORS, this.random),
      })
    }
  }
}

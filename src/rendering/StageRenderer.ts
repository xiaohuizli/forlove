import * as THREE from 'three'
import { createCloudTarget } from '../targets/cloudTarget'
import { createEyeTarget } from '../targets/eyeTarget'
import { createFilledHeartTarget } from '../targets/filledHeartTarget'
import { createSphereTarget } from '../targets/sphereTarget'
import { createTextTarget } from '../targets/textTarget'
import { BalloonLayer } from '../layers/BalloonLayer'
import { SparkleLayer } from '../layers/SparkleLayer'
import { ParticleField } from './ParticleField'
import { computeSceneRotation } from './stageMotion'
import { DIGIT_TARGET_SIZE, LOVE_BALLOON_COUNT } from './stageTargetConfig'
import type { SceneId } from '../app/SceneDirector'
import type { ParticleTarget } from '../core/targetTypes'

export class StageRenderer {
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  private readonly renderer: THREE.WebGLRenderer
  private readonly particleField: ParticleField
  private readonly balloonLayer = new BalloonLayer(LOVE_BALLOON_COUNT)
  private readonly sparkleLayer = new SparkleLayer(800)
  private readonly targets: Record<SceneId, ParticleTarget>
  private animationId = 0
  private lastFrame = performance.now()
  private currentScene: SceneId = 'idle'
  private onFps: (fps: number) => void = () => {}
  private frameCount = 0
  private lastFpsAt = performance.now()
  private readonly container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setClearColor(0x070811, 1)
    this.camera.position.set(0, 0, 10)
    const count = 18000
    this.targets = {
      idle: createSphereTarget({ count, seed: 2, radius: 2.7, shellJitter: 0.1 }),
      'count-1': createTextTarget({ text: '1', count, ...DIGIT_TARGET_SIZE, seed: 1, color: '#f4d6ff' }),
      'count-2': createTextTarget({ text: '2', count, ...DIGIT_TARGET_SIZE, seed: 2, color: '#f4d6ff' }),
      'count-3': createTextTarget({ text: '3', count, ...DIGIT_TARGET_SIZE, seed: 3, color: '#f4d6ff' }),
      love: createLoveTarget(count),
      dissolve: createCloudTarget({ count, seed: 88, radius: 4.1 }),
      eye: createEyeTarget({ count, seed: 9 }),
    }
    this.particleField = new ParticleField(this.targets.idle)
    this.scene.add(this.particleField.points)
    this.scene.add(this.balloonLayer.group)
    this.scene.add(this.sparkleLayer.points)
    this.container.appendChild(this.renderer.domElement)
    this.resize()
  }

  setFpsCallback(callback: (fps: number) => void): void {
    this.onFps = callback
  }

  setScene(scene: SceneId): void {
    if (scene === this.currentScene) return
    const transition = scene === 'dissolve' ? 'dissolve' : scene === 'love' ? 'burst' : 'morph'
    this.currentScene = scene
    this.particleField.setTarget(this.targets[scene], transition)
  }

  start(): void {
    this.stop()
    this.animate()
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = 0
    }
  }

  resize(): void {
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  private animate = (): void => {
    const now = performance.now()
    const delta = Math.min((now - this.lastFrame) / 1000, 0.05)
    this.lastFrame = now
    const loveIntensity = this.currentScene === 'love' ? 1 : this.currentScene === 'dissolve' ? 0.35 : 0
    const sparkleIntensity = this.currentScene === 'love' ? 1 : this.currentScene === 'eye' ? 0.45 : 0.16
    this.particleField.update(delta)
    this.balloonLayer.update(delta, loveIntensity)
    this.sparkleLayer.update(now, sparkleIntensity)
    const rotation = computeSceneRotation(now, this.currentScene)
    this.scene.rotation.set(rotation.x, rotation.y, rotation.z)
    this.renderer.render(this.scene, this.camera)
    this.emitFps(now)
    this.animationId = requestAnimationFrame(this.animate)
  }

  private emitFps(now: number): void {
    this.frameCount += 1
    if (now - this.lastFpsAt > 700) {
      this.onFps((this.frameCount * 1000) / (now - this.lastFpsAt))
      this.frameCount = 0
      this.lastFpsAt = now
    }
  }
}

function createLoveTarget(count: number): ParticleTarget {
  const iCount = Math.floor(count * 0.16)
  const heartCount = Math.floor(count * 0.28)
  const youCount = count - iCount - heartCount
  const iText = createTextTarget({ text: 'I', count: iCount, width: 260, height: 320, seed: 76, color: '#f7eaff' })
  const heart = createFilledHeartTarget({ count: heartCount, seed: 78 })
  const youText = createTextTarget({ text: 'YOU', count: youCount, width: 760, height: 320, seed: 77, color: '#f7eaff' })
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  let offset = 0
  offset = appendTarget({ source: iText, positions, colors, offset, scale: 0.56, x: -2.72, y: 0.02 })
  offset = appendTarget({ source: heart, positions, colors, offset, scale: 0.5, x: -0.82, y: 0.0 })
  appendTarget({ source: youText, positions, colors, offset, scale: 0.62, x: 1.48, y: 0.02 })

  return {
    positions,
    colors,
    center: { x: 0, y: 0, z: 0 },
    bounds: { minX: -4, maxX: 4, minY: -2, maxY: 2, width: 8, height: 4 },
  }
}

function appendTarget(options: {
  source: ParticleTarget
  positions: Float32Array
  colors: Float32Array
  offset: number
  scale: number
  x: number
  y: number
}): number {
  for (let i = 0; i < options.source.positions.length; i += 3) {
    const targetOffset = options.offset + i
    options.positions[targetOffset] = options.source.positions[i] * options.scale + options.x
    options.positions[targetOffset + 1] = options.source.positions[i + 1] * options.scale + options.y
    options.positions[targetOffset + 2] = options.source.positions[i + 2] * options.scale
    options.colors[targetOffset] = options.source.colors[i]
    options.colors[targetOffset + 1] = options.source.colors[i + 1]
    options.colors[targetOffset + 2] = options.source.colors[i + 2]
  }
  return options.offset + options.source.positions.length
}

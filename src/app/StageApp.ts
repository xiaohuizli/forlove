import { HandTracker } from '../camera/HandTracker'
import { createSceneDirector, type SceneId } from './SceneDirector'
import { createStableGesture } from '../gestures/stableGesture'
import type { GestureSignal } from '../gestures/stableGesture'
import { StageRenderer } from '../rendering/StageRenderer'
import { getStartMode, shouldAutoAdvance, shouldAutoRequestCamera, type StartMode } from './startMode'

export class StageApp {
  private readonly renderer: StageRenderer
  private readonly demoDirector = createSceneDirector({ mode: 'auto' })
  private readonly gestureDirector = createSceneDirector()
  private readonly stableGesture = createStableGesture({ stableMs: 350, cooldownMs: 700 })
  private readonly debug: boolean
  private readonly startMode: StartMode
  private readonly hud: HTMLElement
  private readonly video: HTMLVideoElement
  private handTracker: HandTracker | null = null
  private mode: 'gesture' | 'demo' | 'camera' | 'unavailable'
  private lastScene: SceneId = 'idle'
  private frameId = 0
  private readonly root: HTMLElement

  constructor(root: HTMLElement) {
    this.root = root
    const params = new URLSearchParams(window.location.search)
    this.debug = params.get('debug') === '1'
    this.startMode = getStartMode(params)
    this.mode = this.startMode
    this.root.innerHTML = `
      <main class="stage-shell">
        <div class="stage-canvas" data-role="stage"></div>
        <div class="stage-prompt" data-role="prompt">${initialPrompt(this.startMode)}</div>
        <button class="camera-start" data-role="camera" type="button">Retry camera</button>
        <video class="camera-preview" data-role="video" muted playsinline></video>
        <aside class="debug-hud" data-role="hud"></aside>
      </main>
    `
    const container = this.root.querySelector<HTMLElement>('[data-role="stage"]')
    this.video = this.root.querySelector<HTMLVideoElement>('[data-role="video"]')!
    this.hud = this.root.querySelector<HTMLElement>('[data-role="hud"]')!
    if (!container) throw new Error('Missing stage container')
    this.renderer = new StageRenderer(container)
    this.renderer.setFpsCallback((fps) => this.updateHud({ fps }))
    this.bind()
    this.renderDebugVisibility()
    this.renderer.start()
    if (shouldAutoRequestCamera(this.startMode)) {
      void this.startCamera()
    }
    this.tick()
  }

  private bind(): void {
    window.addEventListener('resize', () => this.renderer.resize())
    this.root.querySelector<HTMLButtonElement>('[data-role="camera"]')?.addEventListener('click', () => {
      void this.startCamera()
    })
  }

  private async startCamera(): Promise<void> {
    this.handTracker?.stop()
    this.handTracker = new HandTracker({
      video: this.video,
      onGesture: (gesture) => this.onGesture(gesture),
      onReady: () => {
        this.mode = 'camera'
        this.updatePrompt('Camera online - show 1, 2, 3, 4, 5')
        this.updateHud({})
      },
      onDenied: () => {
        this.mode = 'unavailable'
        this.updatePrompt('Camera denied - allow camera to use gestures')
        this.updateHud({})
      },
      onError: () => {
        this.mode = 'unavailable'
        this.updatePrompt('Camera error - retry camera to use gestures')
        this.updateHud({})
      },
    })
    await this.handTracker.start()
  }

  private onGesture(gesture: GestureSignal): void {
    const stable = this.stableGesture.update(gesture, performance.now())
    this.updateHud({ gesture: `${gesture.gesture}:${gesture.fingerCount}` })
    if (!stable) return
    const state = this.gestureDirector.handleGesture(stable, performance.now())
    this.applyScene(state.scene)
  }

  private tick = (): void => {
    if (shouldAutoAdvance(this.mode)) {
      const state = this.demoDirector.tick(performance.now())
      this.applyScene(state.scene)
    }
    this.frameId = requestAnimationFrame(this.tick)
  }

  private applyScene(scene: SceneId): void {
    if (scene === this.lastScene) return
    this.lastScene = scene
    this.renderer.setScene(scene)
    this.updatePrompt(promptForScene(scene))
    this.updateHud({ scene })
  }

  private updatePrompt(text: string): void {
    const prompt = this.root.querySelector<HTMLElement>('[data-role="prompt"]')
    if (prompt) prompt.textContent = text
  }

  private updateHud(values: { scene?: SceneId; gesture?: string; fps?: number }): void {
    if (!this.debug) return
    const previous = this.hud.dataset
    if (values.scene) previous.scene = values.scene
    if (values.gesture) previous.gesture = values.gesture
    if (values.fps) previous.fps = `${Math.round(values.fps)}`
    this.hud.innerHTML = `
      <div>mode: ${this.mode}</div>
      <div>scene: ${previous.scene ?? this.lastScene}</div>
      <div>gesture: ${previous.gesture ?? 'none'}</div>
      <div>fps: ${previous.fps ?? '--'}</div>
    `
  }

  private renderDebugVisibility(): void {
    this.root.classList.toggle('debug-enabled', this.debug)
    this.hud.hidden = !this.debug
    this.video.hidden = !this.debug
  }

  destroy(): void {
    cancelAnimationFrame(this.frameId)
    this.handTracker?.stop()
    this.renderer.stop()
  }
}

function initialPrompt(mode: StartMode): string {
  return mode === 'demo' ? 'Demo mode' : 'Starting camera - show 1, 2, 3, 4, 5'
}

function promptForScene(scene: SceneId): string {
  if (scene === 'count-1') return '1'
  if (scene === 'count-2') return '2'
  if (scene === 'count-3') return '3'
  if (scene === 'love') return 'I LOVE YOU'
  if (scene === 'eye') return 'Focus'
  if (scene === 'dissolve') return 'Dissolve'
  return 'Show 1, 2, 3, 4, 5'
}

import { classifyHand } from '../gestures/classifyGesture'
import type { GestureSignal } from '../gestures/stableGesture'
import { resolveHandsConstructor, type HandsConstructor } from './mediapipeAdapter'

export interface HandTrackerOptions {
  video: HTMLVideoElement
  onGesture: (gesture: GestureSignal) => void
  onReady: () => void
  onDenied: () => void
  onError: (error: unknown) => void
}

export class HandTracker {
  private stream: MediaStream | null = null
  private hands: InstanceType<HandsConstructor> | null = null
  private frameId = 0
  private running = false
  private readonly options: HandTrackerOptions

  constructor(options: HandTrackerOptions) {
    this.options = options
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      })
      this.options.video.srcObject = this.stream
      this.options.video.muted = true
      this.options.video.playsInline = true
      await this.options.video.play()

      const module = await import('@mediapipe/hands')
      const Hands = resolveHandsConstructor(module, globalThis as { Hands?: unknown })
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })
      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55,
      })
      this.hands.onResults((results) => {
        const landmarks = results.multiHandLandmarks?.[0]
        if (landmarks) {
          this.options.onGesture(classifyHand(landmarks))
        }
      })

      this.running = true
      this.options.onReady()
      this.tick()
    } catch (error) {
      if (error instanceof DOMException && ['NotAllowedError', 'PermissionDeniedError'].includes(error.name)) {
        this.options.onDenied()
        return
      }
      this.options.onError(error)
    }
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.frameId)
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.hands?.close?.()
    this.hands = null
  }

  private tick = (): void => {
    if (!this.running || !this.hands) {
      return
    }

    void this.hands.send({ image: this.options.video }).finally(() => {
      this.frameId = requestAnimationFrame(this.tick)
    })
  }
}

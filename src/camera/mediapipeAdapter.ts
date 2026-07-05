import type { HandLandmark } from '../gestures/fingerCounter'

export type HandsConstructor = new (config: {
  locateFile: (file: string) => string
}) => {
  setOptions: (options: Record<string, unknown>) => void
  onResults: (callback: (results: HandResults) => void) => void
  send: (input: { image: HTMLVideoElement }) => Promise<void>
  close?: () => void
}

export interface HandResults {
  multiHandLandmarks?: HandLandmark[][]
}

export function resolveHandsConstructor(
  module: { Hands?: unknown; default?: { Hands?: unknown } },
  globalScope: { Hands?: unknown },
): HandsConstructor {
  const candidate = module.Hands ?? module.default?.Hands ?? globalScope.Hands

  if (typeof candidate !== 'function') {
    throw new Error('MediaPipe Hands constructor was not found')
  }

  return candidate as HandsConstructor
}

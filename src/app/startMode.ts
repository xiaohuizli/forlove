export type StartMode = 'gesture' | 'demo'

export function getStartMode(params: URLSearchParams): StartMode {
  return params.get('demo') === '1' ? 'demo' : 'gesture'
}

export function shouldAutoAdvance(mode: string): boolean {
  return mode === 'demo'
}

export function shouldAutoRequestCamera(mode: StartMode): boolean {
  return mode === 'gesture'
}

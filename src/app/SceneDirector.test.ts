import { describe, expect, it } from 'vitest'
import { createSceneDirector } from './SceneDirector'

describe('SceneDirector', () => {
  it('maps stable finger counts into the five-stage gesture flow', () => {
    const director = createSceneDirector()

    expect(director.handleGesture({ fingerCount: 1, gesture: 'count' }, 0).scene).toBe('count-1')
    expect(director.handleGesture({ fingerCount: 2, gesture: 'count' }, 1000).scene).toBe('count-2')
    expect(director.handleGesture({ fingerCount: 3, gesture: 'count' }, 2000).scene).toBe('count-3')
    expect(director.handleGesture({ fingerCount: 4, gesture: 'count' }, 3000).scene).toBe('love')
    expect(director.handleGesture({ fingerCount: 5, gesture: 'open-palm' }, 4000).scene).toBe('idle')
  })

  it('ignores out-of-order gestures instead of jumping ahead', () => {
    const director = createSceneDirector()

    expect(director.handleGesture({ fingerCount: 2, gesture: 'count' }, 0).scene).toBe('idle')
    expect(director.handleGesture({ fingerCount: 1, gesture: 'count' }, 1000).scene).toBe('count-1')
    expect(director.handleGesture({ fingerCount: 3, gesture: 'count' }, 2000).scene).toBe('count-1')
    expect(director.handleGesture({ fingerCount: 2, gesture: 'count' }, 3000).scene).toBe('count-2')
  })

  it('ignores lower numbered gestures so the sequence cannot roll backward', () => {
    const director = createSceneDirector()

    director.handleGesture({ fingerCount: 1, gesture: 'count' }, 0)
    director.handleGesture({ fingerCount: 2, gesture: 'count' }, 1000)
    director.handleGesture({ fingerCount: 3, gesture: 'count' }, 2000)

    expect(director.handleGesture({ fingerCount: 1, gesture: 'count' }, 3000).scene).toBe('count-3')
    expect(director.handleGesture({ fingerCount: 4, gesture: 'count' }, 4000).scene).toBe('love')
    expect(director.handleGesture({ fingerCount: 2, gesture: 'count' }, 5000).scene).toBe('love')
  })

  it('only returns to the opening sphere after the final 5 or fist step', () => {
    const director = createSceneDirector()

    director.handleGesture({ fingerCount: 1, gesture: 'count' }, 0)
    expect(director.handleGesture({ fingerCount: 5, gesture: 'open-palm' }, 1000).scene).toBe('count-1')
    expect(director.handleGesture({ fingerCount: 0, gesture: 'fist' }, 2000).scene).toBe('count-1')
    director.handleGesture({ fingerCount: 2, gesture: 'count' }, 3000)
    director.handleGesture({ fingerCount: 3, gesture: 'count' }, 4000)
    director.handleGesture({ fingerCount: 4, gesture: 'count' }, 5000)

    expect(director.handleGesture({ fingerCount: 5, gesture: 'open-palm' }, 6000).scene).toBe('idle')
  })

  it('auto timeline plays the full demo sequence without camera input', () => {
    const director = createSceneDirector({ mode: 'auto' })
    const scenes = [0, 1200, 2400, 3600, 5200, 12600].map((time) => director.tick(time).scene)

    expect(scenes).toEqual(['idle', 'count-1', 'count-2', 'count-3', 'love', 'idle'])
  })

  it('does not advance without gestures by default', () => {
    const director = createSceneDirector()

    expect(director.tick(5000).scene).toBe('idle')
    expect(director.tick(12600).scene).toBe('idle')
  })

  it('uses fist to return to the opening sphere scene', () => {
    const director = createSceneDirector()

    director.handleGesture({ fingerCount: 4, gesture: 'count' }, 500)

    expect(director.handleGesture({ fingerCount: 0, gesture: 'fist' }, 1000).scene).toBe('idle')
  })
})

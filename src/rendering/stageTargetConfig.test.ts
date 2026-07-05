import { describe, expect, it } from 'vitest'
import { DIGIT_TARGET_SIZE, LOVE_BALLOON_COUNT } from './stageTargetConfig'

describe('stage target config', () => {
  it('uses a larger numeric target scale for prominent 1/2/3 display', () => {
    expect(DIGIT_TARGET_SIZE.width).toBeLessThanOrEqual(280)
    expect(DIGIT_TARGET_SIZE.height).toBeGreaterThanOrEqual(420)
  })

  it('keeps love balloons sparse enough to avoid a dense wall of balloons', () => {
    expect(LOVE_BALLOON_COUNT).toBeLessThanOrEqual(32)
  })
})

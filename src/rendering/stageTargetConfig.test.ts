import { describe, expect, it } from 'vitest'
import { DIGIT_TARGET_SIZE, FIREWORK_MAX_PARTICLES } from './stageTargetConfig'

describe('stage target config', () => {
  it('uses a larger numeric target scale for prominent 1/2/3 display', () => {
    expect(DIGIT_TARGET_SIZE.width).toBeLessThanOrEqual(280)
    expect(DIGIT_TARGET_SIZE.height).toBeGreaterThanOrEqual(420)
  })

  it('keeps firework particle budget bounded for the love scene', () => {
    expect(FIREWORK_MAX_PARTICLES).toBeLessThanOrEqual(900)
    expect(FIREWORK_MAX_PARTICLES).toBeGreaterThanOrEqual(500)
  })
})

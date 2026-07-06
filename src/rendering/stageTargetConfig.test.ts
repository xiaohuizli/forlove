import { describe, expect, it } from 'vitest'
import { DIGIT_PALETTE, DIGIT_TARGET_SIZE, FIREWORK_MAX_PARTICLES, IDLE_EARTH_PALETTE } from './stageTargetConfig'

describe('stage target config', () => {
  it('uses a larger numeric target scale for prominent 1/2/3 display', () => {
    expect(DIGIT_TARGET_SIZE.width).toBeLessThanOrEqual(280)
    expect(DIGIT_TARGET_SIZE.height).toBeGreaterThanOrEqual(420)
  })

  it('keeps firework particle budget bounded for the love scene', () => {
    expect(FIREWORK_MAX_PARTICLES).toBeLessThanOrEqual(900)
    expect(FIREWORK_MAX_PARTICLES).toBeGreaterThanOrEqual(500)
  })

  it('keeps idle earth palette pink-led with multiple accents', () => {
    expect(IDLE_EARTH_PALETTE.slice(0, 4)).toEqual(['#ff8bd9', '#ffc2f0', '#f7a8ff', '#ff6fcb'])
    expect(new Set(IDLE_EARTH_PALETTE).size).toBeGreaterThanOrEqual(12)
  })

  it('uses a multicolor digit palette', () => {
    expect(new Set(DIGIT_PALETTE).size).toBeGreaterThanOrEqual(9)
    expect(DIGIT_PALETTE).toContain('#ff8bd9')
    expect(DIGIT_PALETTE).toContain('#7df7ff')
    expect(DIGIT_PALETTE).toContain('#ffb86b')
    expect(DIGIT_PALETTE).toContain('#82ffc9')
  })
})

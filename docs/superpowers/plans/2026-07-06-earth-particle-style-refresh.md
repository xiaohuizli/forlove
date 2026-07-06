# Earth Particle Style Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把开场粒子球升级为粉色为主、多色点缀的地球模型粒子效果，并让 `I 爱心 YOU` 更靠近，同时让数字粒子也使用多色视觉。

**Architecture:** 继续沿用现有 Three.js + 粒子目标系统，不引入新的渲染框架。新增一个地球粒子 target 负责大陆/海洋/云层色块分布，数字和 LOVE 只调整已有 target 的颜色与布局参数。手势流程、摄像头启动、1->2->3->4->5 顺序控制保持不变。

**Tech Stack:** TypeScript, Vite, Three.js, MediaPipe Hands, Vitest, Playwright.

---

## Scope

本计划只覆盖本轮视觉改版：

- 开始默认场景从普通球体改为地球模型粒子效果。
- 地球粒子缓慢旋转，保持现有手左右挥动加速旋转能力。
- 地球颜色以粉色为主，混入青色、蓝色、紫色、白色、淡黄、橙色、薄荷绿等丰富点缀，形成更有层次的粒子效果。
- 数字 `1`、`2`、`3` 改为更丰富的多色粒子，而不是单一浅色。
- `4` 场景的 `I 爱心 YOU` 更靠近，`I` 到爱心、爱心到 `Y` 的视觉间隔约为两个字符长度，同时避免爱心贴到 `YOU`。
- 现有严格流程 `1 -> 2 -> 3 -> 4 -> 5/握拳` 不改。
- 不恢复气球；`4` 继续使用烟花粒子效果。

## File Structure

- Create: `src/targets/earthTarget.ts`
  - 生成地球粒子坐标和颜色。
  - 提供大陆/海洋/云层/星点式颜色分布。
  - 保持输出 `ParticleTarget`，与现有 `sphereTarget`、`cloudTarget` 一致。
- Create: `src/targets/earthTarget.test.ts`
  - 验证地球 target 点数、边界、颜色多样性、粉色主色占比。
- Modify: `src/rendering/StageRenderer.ts`
  - 将 idle sphere target 替换为 earth target。
  - 数字 target 传入多色 palette。
  - 保持 spread target 和 love/firework 逻辑不变。
- Modify: `src/targets/textTarget.ts`
  - 支持 `palette?: string[]`，让文字/数字粒子可以按 palette 随机上色。
  - 兼容原有 `color?: string`。
- Modify: `src/targets/textTarget.test.ts`
  - 增加 palette 行为测试。
- Modify: `src/rendering/loveLayout.ts`
  - 将 `I`、心形、`YOU` 拉近一点。
- Modify: `src/rendering/loveLayout.test.ts`
  - 将当前视觉边缘等距测试调整为“更靠近但不碰撞”的断言。
- Modify: `src/rendering/stageMotion.ts`
  - 如当前 idle 旋转仍偏快，降低基础旋转速度；保留手势加速上限。
- Modify: `src/rendering/stageMotion.test.ts`
  - 验证 idle 基础旋转比 love/count 更慢，手势 boost 仍能提升速度。

## Visual Rules

- 地球不是写实贴图，而是粒子造型：可看出球体轮廓、类似大陆/海洋的不规则区域、云层/星光点缀。
- 粉色为主：目标视觉中粉色/玫红/浅粉粒子占比约 38%-58%，其他颜色明显可见但不喧宾夺主。
- 辅色更丰富：青色、蓝色、蓝紫、白色、淡黄、橙色、薄荷绿都可以出现，避免只像粉色单色球。
- 数字粒子多色但仍要读得清楚：浅粉、白、青、蓝、紫、薄荷绿、淡黄、橙色混合，亮色比例高一些。
- LOVE 布局要更亲密：`I` 到爱心、爱心到 `Y` 的视觉边缘间距应接近，并控制在约两个字符长度。

## Gesture Motion Rules

- 手向左移动时，开场地球粒子向左旋转。
- 手向右移动时，开场地球粒子向右旋转。
- 手移动速度控制旋转速度，方向由 `handCenterX` 的增减决定。
- 没有检测到手时，地球回到缓慢默认旋转。
- 方向控制只应用于开场 idle 地球场景；数字、LOVE、烟花场景保持现有环境运动。

---

### Task 1: Add Earth Particle Target

**Files:**
- Create: `src/targets/earthTarget.ts`
- Create: `src/targets/earthTarget.test.ts`

- [ ] **Step 1: Write the failing earth target test**

Create `src/targets/earthTarget.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createEarthTarget } from './earthTarget'

function uniqueColorCount(colors: Float32Array): number {
  const unique = new Set<string>()
  for (let i = 0; i < colors.length; i += 3) {
    unique.add(`${colors[i].toFixed(3)},${colors[i + 1].toFixed(3)},${colors[i + 2].toFixed(3)}`)
  }
  return unique.size
}

function pinkishRatio(colors: Float32Array): number {
  let pinkish = 0
  const total = colors.length / 3
  for (let i = 0; i < colors.length; i += 3) {
    const r = colors[i]
    const g = colors[i + 1]
    const b = colors[i + 2]
    if (r > 0.78 && b > 0.55 && g < 0.82) pinkish += 1
  }
  return pinkish / total
}

describe('createEarthTarget', () => {
  it('creates a bounded particle globe', () => {
    const target = createEarthTarget({ count: 2000, seed: 42, radius: 2.7 })

    expect(target.positions).toHaveLength(6000)
    expect(target.colors).toHaveLength(6000)
    expect(target.bounds.width).toBeGreaterThan(4.8)
    expect(target.bounds.width).toBeLessThan(5.8)
    expect(target.bounds.height).toBeGreaterThan(4.8)
    expect(target.bounds.height).toBeLessThan(5.8)
  })

  it('uses pink as the dominant color while keeping multiple accent colors', () => {
    const target = createEarthTarget({ count: 3000, seed: 7, radius: 2.7 })

    expect(uniqueColorCount(target.colors)).toBeGreaterThanOrEqual(9)
    expect(pinkishRatio(target.colors)).toBeGreaterThan(0.36)
    expect(pinkishRatio(target.colors)).toBeLessThan(0.62)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/targets/earthTarget.test.ts
```

Expected: FAIL because `./earthTarget` does not exist.

- [ ] **Step 3: Implement earth target**

Create `src/targets/earthTarget.ts`:

```ts
import { writeColor } from '../core/color'
import { mulberry32, pick } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

const OCEAN_PINKS = ['#ff8bd9', '#ffc2f0', '#f7a8ff', '#ff6fcb', '#ff4fb8', '#ffd6f5']
const LAND_ACCENTS = ['#7df7ff', '#40c9ff', '#9c7bff', '#c084fc', '#fff1a8', '#ffb86b', '#82ffc9']
const CLOUDS = ['#ffffff', '#f7eaff', '#c8fbff', '#fff7c2']

export function createEarthTarget(options: {
  count: number
  seed: number
  radius?: number
  shellJitter?: number
}): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)
  const radius = options.radius ?? 2.7
  const shellJitter = options.shellJitter ?? 0.1

  for (let i = 0; i < options.count; i += 1) {
    const theta = random() * Math.PI * 2
    const z = random() * 2 - 1
    const ring = Math.sqrt(Math.max(0, 1 - z * z))
    const jitteredRadius = radius + (random() - 0.5) * shellJitter * 2
    const offset = i * 3

    positions[offset] = Math.cos(theta) * ring * jitteredRadius
    positions[offset + 1] = Math.sin(theta) * ring * jitteredRadius
    positions[offset + 2] = z * jitteredRadius

    const latitude = Math.asin(z)
    const landNoise =
      Math.sin(theta * 2.1 + latitude * 4.4) +
      Math.sin(theta * 5.2 - latitude * 2.7) * 0.55 +
      Math.cos(theta * 3.6 + latitude * 6.1) * 0.35
    const cloudBand = Math.abs(Math.sin(latitude * 8 + theta * 1.7)) < 0.12 && random() > 0.55
    const polarGlow = Math.abs(z) > 0.78 && random() > 0.42

    if (cloudBand || polarGlow) {
      writeColor(colors, i, pick(CLOUDS, random))
    } else if (landNoise > 0.52 && random() > 0.18) {
      writeColor(colors, i, pick(LAND_ACCENTS, random))
    } else {
      writeColor(colors, i, pick(OCEAN_PINKS, random))
    }
  }

  return { positions, colors, ...computeBounds(positions) }
}
```

- [ ] **Step 4: Run target test to verify it passes**

Run:

```bash
npm test -- src/targets/earthTarget.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/targets/earthTarget.ts src/targets/earthTarget.test.ts
git commit -m "feat: add earth particle target"
```

---

### Task 2: Add Palette Support To Text Targets

**Files:**
- Modify: `src/targets/textTarget.ts`
- Modify: `src/targets/textTarget.test.ts`

- [ ] **Step 1: Write failing palette test**

Add this test to `src/targets/textTarget.test.ts`:

```ts
it('supports multiple colors for text particles', () => {
  const target = createTextTarget({
    text: '2',
    count: 500,
    width: 260,
    height: 320,
    seed: 13,
    palette: ['#ff8bd9', '#ffffff', '#7df7ff', '#9c7bff', '#fff1a8', '#ffb86b'],
  })
  const colors = new Set<string>()

  for (let i = 0; i < target.colors.length; i += 3) {
    colors.add(`${target.colors[i].toFixed(3)},${target.colors[i + 1].toFixed(3)},${target.colors[i + 2].toFixed(3)}`)
  }

  expect(colors.size).toBeGreaterThanOrEqual(5)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/targets/textTarget.test.ts
```

Expected: FAIL because `palette` is not accepted by `createTextTarget`.

- [ ] **Step 3: Update text target options and color selection**

In `src/targets/textTarget.ts`, import `pick`:

```ts
import { mulberry32, pick } from '../core/random'
```

Update both option object types to include palette:

```ts
palette?: string[]
```

In both `createTextTarget` and `createFallbackTextTarget`, replace:

```ts
writeColor(colors, i, options.color ?? '#f7eaff')
```

with:

```ts
writeColor(colors, i, options.palette ? pick(options.palette, random) : options.color ?? '#f7eaff')
```

- [ ] **Step 4: Run text target tests**

Run:

```bash
npm test -- src/targets/textTarget.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/targets/textTarget.ts src/targets/textTarget.test.ts
git commit -m "feat: support multicolor text particles"
```

---

### Task 3: Wire Earth And Multicolor Digits Into Renderer

**Files:**
- Modify: `src/rendering/StageRenderer.ts`
- Modify: `src/rendering/stageTargetConfig.ts` if a shared palette constant is preferred.

- [ ] **Step 1: Write failing renderer-focused test**

If `StageRenderer` is too DOM/WebGL-heavy for unit tests, add palette constants to `src/rendering/stageTargetConfig.ts` and test those constants instead.

Add to `src/rendering/stageTargetConfig.ts`:

```ts
export const IDLE_EARTH_PALETTE = [
  '#ff8bd9',
  '#ffc2f0',
  '#f7a8ff',
  '#ff6fcb',
  '#ff4fb8',
  '#ffd6f5',
  '#7df7ff',
  '#40c9ff',
  '#9c7bff',
  '#c084fc',
  '#ffffff',
  '#fff1a8',
  '#ffb86b',
  '#82ffc9',
]
export const DIGIT_PALETTE = [
  '#ff8bd9',
  '#ffc2f0',
  '#ffffff',
  '#7df7ff',
  '#40c9ff',
  '#b891ff',
  '#c084fc',
  '#fff1a8',
  '#ffb86b',
  '#82ffc9',
]
```

Add tests to `src/rendering/stageTargetConfig.test.ts`:

```ts
import { DIGIT_PALETTE, IDLE_EARTH_PALETTE } from './stageTargetConfig'

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
```

- [ ] **Step 2: Run config test to verify it fails**

Run:

```bash
npm test -- src/rendering/stageTargetConfig.test.ts
```

Expected: FAIL until constants are exported.

- [ ] **Step 3: Update StageRenderer imports**

In `src/rendering/StageRenderer.ts`, add:

```ts
import { createEarthTarget } from '../targets/earthTarget'
```

Update config import:

```ts
import { DIGIT_PALETTE, FIREWORK_MAX_PARTICLES } from './stageTargetConfig'
```

- [ ] **Step 4: Replace idle sphere with earth**

Replace:

```ts
sphere: createSphereTarget({ count, seed: 2, radius: 2.7, shellJitter: 0.1 }),
```

with:

```ts
sphere: createEarthTarget({ count, seed: 2, radius: 2.7, shellJitter: 0.1 }),
```

Keep `spread` as `createCloudTarget(...)`.

- [ ] **Step 5: Apply digit palette**

Replace the three digit targets:

```ts
'count-1': createTextTarget({ text: '1', count, ...DIGIT_TARGET_SIZE, seed: 1, color: '#f4d6ff' }),
'count-2': createTextTarget({ text: '2', count, ...DIGIT_TARGET_SIZE, seed: 2, color: '#f4d6ff' }),
'count-3': createTextTarget({ text: '3', count, ...DIGIT_TARGET_SIZE, seed: 3, color: '#f4d6ff' }),
```

with:

```ts
'count-1': createTextTarget({ text: '1', count, ...DIGIT_TARGET_SIZE, seed: 1, palette: DIGIT_PALETTE }),
'count-2': createTextTarget({ text: '2', count, ...DIGIT_TARGET_SIZE, seed: 2, palette: DIGIT_PALETTE }),
'count-3': createTextTarget({ text: '3', count, ...DIGIT_TARGET_SIZE, seed: 3, palette: DIGIT_PALETTE }),
```

- [ ] **Step 6: Run related tests**

Run:

```bash
npm test -- src/rendering/stageTargetConfig.test.ts src/targets/earthTarget.test.ts src/targets/textTarget.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/rendering/StageRenderer.ts src/rendering/stageTargetConfig.ts src/rendering/stageTargetConfig.test.ts
git commit -m "feat: use earth idle and multicolor digits"
```

---

### Task 4: Tune LOVE Layout Closer

**Files:**
- Modify: `src/rendering/loveLayout.ts`
- Modify: `src/rendering/loveLayout.test.ts`

- [ ] **Step 1: Update layout test first**

Change `src/rendering/loveLayout.test.ts` so it asserts the heart is visually centered but closer:

```ts
it('keeps two-character visual spacing around the heart', () => {
  const visualHalfWidth = {
    i: 0.45,
    heart: 0.95,
    you: 1.45,
  }
  const iRightEdge = LOVE_LAYOUT.i.x + visualHalfWidth.i
  const heartLeftEdge = LOVE_LAYOUT.heart.x - visualHalfWidth.heart
  const heartRightEdge = LOVE_LAYOUT.heart.x + visualHalfWidth.heart
  const yLeftEdge = LOVE_LAYOUT.you.x - visualHalfWidth.you
  const leftGap = heartLeftEdge - iRightEdge
  const rightGap = yLeftEdge - heartRightEdge

  expect(leftGap).toBeGreaterThan(1)
  expect(leftGap).toBeLessThan(1.35)
  expect(rightGap).toBeGreaterThan(1)
  expect(rightGap).toBeLessThan(1.35)
  expect(Math.abs(leftGap - rightGap)).toBeLessThan(0.2)
})
```

- [ ] **Step 2: Run test to verify it fails on current wider layout**

Run:

```bash
npm test -- src/rendering/loveLayout.test.ts
```

Expected: FAIL because current layout is too wide after the previous spacing fix.

- [ ] **Step 3: Update LOVE layout**

Set `src/rendering/loveLayout.ts` to:

```ts
export const LOVE_LAYOUT = {
  i: { x: -3.15, y: 0.02, scale: 0.56 },
  heart: { x: -0.55, y: 0, scale: 0.5 },
  you: { x: 3.05, y: 0.02, scale: 0.68 },
} as const
```

This keeps the heart visually balanced while making the gaps read like roughly two character widths.

- [ ] **Step 4: Run layout test**

Run:

```bash
npm test -- src/rendering/loveLayout.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/rendering/loveLayout.ts src/rendering/loveLayout.test.ts
git commit -m "fix: tighten balanced love layout"
```

---

### Task 5: Directional Idle Earth Rotation Without Breaking Gesture Boost

**Files:**
- Modify: `src/gestures/handMotion.ts`
- Modify: `src/gestures/handMotion.test.ts`
- Modify: `src/app/StageApp.ts`
- Modify: `src/rendering/StageRenderer.ts`
- Modify: `src/rendering/stageMotion.ts`
- Modify: `src/rendering/stageMotion.test.ts`

- [ ] **Step 1: Add failing hand direction test**

Add to `src/gestures/handMotion.test.ts`:

```ts
it('reports wave direction from hand center movement', () => {
  const tracker = createHandWaveTracker()

  expect(tracker.update(0.6, 0)).toMatchObject({ direction: 0 })
  expect(tracker.update(0.35, 100)).toMatchObject({ direction: -1 })
  expect(tracker.update(0.72, 220)).toMatchObject({ direction: 1 })
})
```

- [ ] **Step 2: Run hand motion test to verify it fails**

Run:

```bash
npm test -- src/gestures/handMotion.test.ts
```

Expected: FAIL because `createHandWaveTracker().update()` currently returns only a number.

- [ ] **Step 3: Update hand wave tracker return shape**

In `src/gestures/handMotion.ts`, add:

```ts
export interface HandWaveMotion {
  boost: number
  direction: -1 | 0 | 1
}
```

Change `update(handCenterX, now)` to return `HandWaveMotion`. Direction is based on screen-space hand movement:

```ts
const delta = handCenterX - lastX
const direction: -1 | 0 | 1 = Math.abs(delta) < 0.015 ? 0 : delta < 0 ? -1 : 1
```

When no hand is detected or this is the first sample, return:

```ts
return { boost, direction: 0 }
```

When movement is detected, return:

```ts
return { boost, direction }
```

- [ ] **Step 4: Update StageApp to pass boost and direction**

In `src/app/StageApp.ts`, replace:

```ts
const rotationBoost = this.handWaveTracker.update(gesture.handCenterX, now)
this.renderer.setIdleRotationBoost(rotationBoost)
```

with:

```ts
const handWave = this.handWaveTracker.update(gesture.handCenterX, now)
this.renderer.setIdleRotationBoost(handWave.boost, handWave.direction)
```

- [ ] **Step 5: Add failing directional motion test**

Add to `src/rendering/stageMotion.test.ts`:

```ts
it('rotates the idle earth slowly by default but follows hand wave direction', () => {
  const start = computeSceneRotation(0, 'idle', 0)
  const later = computeSceneRotation(1000, 'idle', 0)
  const left = computeSceneRotation(1000, 'idle', 2, -1)
  const right = computeSceneRotation(1000, 'idle', 2, 1)

  expect(Math.abs(later.y - start.y)).toBeLessThan(0.18)
  expect(left.y).toBeLessThan(start.y)
  expect(right.y).toBeGreaterThan(start.y)
  expect(Math.abs(right.y - start.y)).toBeGreaterThan(Math.abs(later.y - start.y))
})
```

- [ ] **Step 6: Run motion test to verify it fails**

Run:

```bash
npm test -- src/rendering/stageMotion.test.ts
```

Expected: FAIL because `computeSceneRotation` does not yet accept direction.

- [ ] **Step 7: Add direction to renderer and stage motion**

In `src/rendering/StageRenderer.ts`, add direction state:

```ts
private idleRotationBoost = 0
private idleRotationDirection: -1 | 0 | 1 = 0
```

Change the setter:

```ts
setIdleRotationBoost(boost: number, direction: -1 | 0 | 1 = 0): void {
  this.idleRotationBoost = Math.max(0, Math.min(2.4, boost))
  this.idleRotationDirection = direction
}
```

Change the animation call:

```ts
const rotation = computeSceneRotation(now, this.currentScene, this.idleRotationBoost, this.idleRotationDirection)
```

In `src/rendering/stageMotion.ts`, update signatures:

```ts
export function computeIdleSphereRotation(
  nowMs: number,
  handWaveBoost = 0,
  handWaveDirection: -1 | 0 | 1 = 0,
): StageRotation

export function computeSceneRotation(
  nowMs: number,
  scene: string,
  handWaveBoost = 0,
  handWaveDirection: -1 | 0 | 1 = 0,
): StageRotation
```

Use slow default drift when direction is `0`, and directional movement when direction is non-zero:

```ts
const baseSpeed = 0.00011
const directedSpeed = 0.00018 + handWaveBoost * 0.00018
const y = handWaveDirection === 0 ? nowMs * baseSpeed : nowMs * directedSpeed * handWaveDirection
```

- [ ] **Step 8: Run related tests**

Run:

```bash
npm test -- src/gestures/handMotion.test.ts src/rendering/stageMotion.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/gestures/handMotion.ts src/gestures/handMotion.test.ts src/app/StageApp.ts src/rendering/StageRenderer.ts src/rendering/stageMotion.ts src/rendering/stageMotion.test.ts
git commit -m "feat: add directional earth rotation"
```

---

### Task 6: Browser Visual QA

**Files:**
- No source changes expected.
- Output screenshot path: `output/playwright/earth-love-style-refresh.png`

- [ ] **Step 1: Start or reuse local Vite server**

Run:

```bash
try { (Invoke-WebRequest -Uri http://127.0.0.1:5174/ -UseBasicParsing -TimeoutSec 3).StatusCode } catch { 'not-running' }
```

If it prints `not-running`, start:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

- [ ] **Step 2: Capture idle earth and love screenshots**

Use Playwright to load demo mode and capture:

```bash
node -e "const { chromium } = require('playwright'); const path = require('path'); (async () => { const browser = await chromium.launch({ headless: true }); const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); await page.goto('http://127.0.0.1:5174/?debug=1&demo=1', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200); await page.screenshot({ path: path.resolve('output/playwright/earth-idle.png'), fullPage: false }); await page.waitForFunction(() => document.querySelector('[data-role=\"hud\"]')?.textContent?.includes('scene: love'), null, { timeout: 9000 }); await page.waitForTimeout(1800); await page.screenshot({ path: path.resolve('output/playwright/earth-love-style-refresh.png'), fullPage: false }); await browser.close(); })().catch((error) => { console.error(error); process.exit(1); });"
```

- [ ] **Step 3: Inspect screenshots**

Acceptance:

- `earth-idle.png` shows a spherical particle earth, not a flat cloud.
- Earth is pink-led and contains visible cyan, blue, purple, white, yellow, orange, and mint accents.
- Earth must show differentiated density: continent regions are visibly denser while ocean regions stay sparser and pink-led.
- Digit scenes use visibly varied colors while keeping the number readable.
- LOVE scene has `I 爱心 YOU` spaced at roughly two character widths, with heart not touching `Y`.
- Fireworks remain visible in LOVE scene.

- [ ] **Step 4: Run full tests and build**

Run:

```bash
npm test
npm run build
```

Expected:

- Vitest: all files pass.
- Build: exit code 0. Vite chunk-size warning is acceptable if no compilation error appears.

- [ ] **Step 5: Final commit if visual QA required tiny tuning**

If screenshots show minor spacing/color tuning is needed, adjust constants and commit:

```bash
git add src/targets/earthTarget.ts src/rendering/StageRenderer.ts src/rendering/loveLayout.ts src/rendering/stageMotion.ts
git commit -m "chore: tune earth love visuals"
```

---

### Task 7: Push And Deploy

**Files:**
- No source changes expected.

- [ ] **Step 1: Check worktree**

Run:

```bash
git status --short
```

Expected: only ignored/untracked visual QA output may remain, or clean.

- [ ] **Step 2: Push**

Run:

```bash
git push
```

- [ ] **Step 3: Check GitHub Actions**

Run:

```bash
$headers=@{'User-Agent'='Codex'}
$runs = Invoke-RestMethod -Uri 'https://api.github.com/repos/xiaohuizli/forlove/actions/runs?per_page=1' -Headers $headers
$runs.workflow_runs | Select-Object name,status,conclusion,head_sha,html_url,created_at,updated_at | ConvertTo-Json -Depth 5
```

Expected: latest `Deploy to GitHub Pages` run belongs to the pushed commit and eventually has `status: completed`, `conclusion: success`.

- [ ] **Step 4: Confirm Pages URL**

Run:

```bash
Invoke-WebRequest -Uri 'https://xiaohuizli.github.io/forlove/' -Method Head -TimeoutSec 20
```

Expected: status code `200`.

---

## Self-Review

- Spec coverage: 地球粒子、慢速旋转、多色粉色主导、更丰富粒子颜色、数字多色、LOVE 两字符间距、保留流程与烟花、部署验证均有对应任务。
- Placeholder scan: 本文没有未完成占位内容，每个开发步骤包含文件、代码或命令。
- Type consistency: 新增 `createEarthTarget(options)` 返回 `ParticleTarget`，`createTextTarget` 继续兼容 `color` 并新增 `palette`，`StageRenderer` 调用与现有 target API 保持一致。

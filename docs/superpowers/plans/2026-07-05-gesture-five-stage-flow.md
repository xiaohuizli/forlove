# Gesture Five Stage Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the stage match the reference video more closely: auto-request camera on entry, show a rotating particle sphere while idle, and use 1/2/3/4/5 finger gestures as the main progression.

**Architecture:** Keep the existing MediaPipe gesture pipeline and Three.js renderer. Add a sphere particle target for `idle`, extend hand classification and scene direction to include 4/5 finger stages, and start camera automatically from `StageApp` after construction while preserving retry behavior.

**Tech Stack:** TypeScript, Vite, Vitest, Three.js, MediaPipe Hands, Playwright smoke checks.

---

### Task 1: Gesture Classification and Scene Mapping

**Files:**
- Modify: `src/gestures/classifyGesture.ts`
- Modify: `src/gestures/fingerCounter.test.ts`
- Modify: `src/app/SceneDirector.ts`
- Modify: `src/app/SceneDirector.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests proving finger count 4 is recognized and 1/2/3/4/5 map to distinct scenes.

- [ ] **Step 2: Run focused tests**

Run: `npm test -- src/gestures/fingerCounter.test.ts src/app/SceneDirector.test.ts`

- [ ] **Step 3: Implement minimal changes**

Classify 1-4 as `count`, keep 5 as `open-palm`, and map count 4 to `dissolve` while open palm maps to `love`.

- [ ] **Step 4: Verify focused tests pass**

Run: `npm test -- src/gestures/fingerCounter.test.ts src/app/SceneDirector.test.ts`

### Task 2: Particle Sphere Idle Target

**Files:**
- Create: `src/targets/sphereTarget.ts`
- Create: `src/targets/sphereTarget.test.ts`
- Modify: `src/rendering/StageRenderer.ts`

- [ ] **Step 1: Write failing target test**

Test that the sphere target returns all particles near a hollow spherical shell and includes bounds.

- [ ] **Step 2: Run focused target test**

Run: `npm test -- src/targets/sphereTarget.test.ts`

- [ ] **Step 3: Implement sphere target and wire idle**

Use deterministic seeded sampling on a sphere shell, then set `idle` target to the new sphere.

- [ ] **Step 4: Verify target tests pass**

Run: `npm test -- src/targets/sphereTarget.test.ts`

### Task 3: Auto Camera Startup

**Files:**
- Modify: `src/app/StageApp.ts`
- Modify: `src/app/startMode.ts`
- Modify: `src/app/startMode.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests for `shouldAutoRequestCamera`: true in normal gesture mode, false in explicit demo mode.

- [ ] **Step 2: Run focused tests**

Run: `npm test -- src/app/startMode.test.ts`

- [ ] **Step 3: Implement auto camera start**

Call `startCamera()` from the constructor after renderer startup when `shouldAutoRequestCamera(startMode)` is true. Change the button label to `Retry camera`.

- [ ] **Step 4: Verify app mode tests pass**

Run: `npm test -- src/app/startMode.test.ts`

### Task 4: Verification and Docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README behavior**

Document auto camera request, idle sphere, and 1/2/3/4/5 gesture stages.

- [ ] **Step 2: Run full test suite**

Run: `npm test`

- [ ] **Step 3: Run production build**

Run: `npm run build`

- [ ] **Step 4: Browser smoke check**

Use Playwright to verify default mode attempts camera startup, demo mode remains explicit, and the canvas is nonblank.

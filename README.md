# Gesture Love Stage

Full-screen browser particle stage based on `../outputs/新视频效果项目开发文档.md` and the reference video `13427707869323405.mp4`.

## Features

- Full-screen dark WebGL stage without the old side control panel.
- Gesture-first flow: the page requests camera access on entry, then 1/2/3/4/5 fingers drive the display.
- Idle state uses a rotating particle sphere matching the opening feel of the reference video.
- 1/2/3 fingers show large numeric particle targets; 4 fingers enters the `I + heart + YOU` fireworks scene.
- 5 fingers or fist returns to the opening rotating particle sphere.
- Camera mode using MediaPipe Hands.
- Stable gesture pipeline for finger-count, open-palm, and fist signals.
- Particle targets for cloud, countdown numbers, text, heart, dissolve cloud, and eye/ring formation.
- Love scene with colorful rising balloons and sparkle layer.
- Debug HUD and camera preview through `?debug=1`.
- Optional explicit demo timeline through `?demo=1`; the normal page does not auto-play scenes without gestures.
- Camera-denied and camera-error paths stay idle and ask the user to enable/retry camera access.

## Install

```bash
npm install
```

## Run

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174/
```

Debug mode:

```text
http://127.0.0.1:5174/?debug=1
```

Explicit demo mode:

```text
http://127.0.0.1:5174/?demo=1
```

## Test

```bash
npm test
npm run build
```

## Deploy

Repository:

```text
git@github.com:xiaohuizli/forlove.git
```

GitHub Pages URL after the first successful workflow run:

```text
https://xiaohuizli.github.io/forlove/
```

The deployment workflow is in `.github/workflows/deploy.yml`. In GitHub, enable Pages with:

```text
Settings -> Pages -> Build and deployment -> Source: GitHub Actions
```

The current test suite covers:

- finger-count recognition for 1/2/3/4/5 fingers;
- four-finger gesture classification for the main flow;
- stable gesture debounce and cooldown;
- rotating-sphere particle target shape and continuous idle rotation;
- text and numeric particle targets;
- eye/ring particle target;
- gesture scene director behavior, including 4 fingers entering love and 5/fist returning to idle;
- filled heart particle target for the love scene;
- fireworks particle bursts with outward expansion, gravity, twinkle, and fade-out;
- explicit-only demo timeline behavior;
- default startup mode requesting camera while staying gesture-only;
- balloon layer motion and color variety.

## Browser Smoke Checks

Latest smoke checks cover:

- desktop full-screen nonblank WebGL canvas;
- default page starting camera mode when permission is available;
- idle stage rendering a particle sphere instead of a flat control UI;
- explicit `?demo=1` reaching the `I LOVE YOU` scene;
- absence of the previous `.control-panel` UI;
- mobile full-screen layout without overflow;
- fake-camera permission path entering camera mode.

Screenshots are saved in `../outputs/`.

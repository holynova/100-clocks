# Immersive viewer verification — 2026-10-16

- Seven clocks use a full-viewport renderer. Shared navigation overlays the clock; backgrounds and foregrounds follow each clock's theme.
- Every clock uses the same settings dialog, with native controls and a bottom sheet on mobile. Live/demo, speed, start time, pause/restart and fullscreen share one time bridge. Existing clock-specific controls are adapted to their original handlers.
- Kinetic digits use symmetric 3×7 filled glyphs (4×8 contour vertices). Default: 240 dials; optional seconds: 360 dials. Portrait groups digits into HH / MM / SS. Seconds transitions complete in 420 ms; static frames still stop rendering.
- All seven clocks checked at 320×568, 375×812 and 812×375; all actual clock bounds are within the viewport. Measurements: mobile-check.json. Numeric matrix landscape clipping and English word-clock alignment were found and fixed during browser checks.
- Original 06/07 first stylesheets retain their original SHA-256; only embedded layout adapters change their fit.
- Browser interactions verified: kinetic seconds, slider OLED theme, alphabet CLOCK! input/apply, word English/seconds, numeric matrix theme/font/language/week/date. All settings use the same surface.
- Seconds animation sample: 60 fps, mean JS 0.267 ms, P95 frame 18.6 ms, zero style writes per frame. See seconds-performance.json. This is a local Chrome measurement, not a device-independent guarantee.
- npm run check: 9 unit checks plus complete slider geometry/time/transition regressions and seven DOM execution checks passed. npm run build passed.
- Cloudflare deployed version: 74b448ea-61a0-4814-b470-7aa793216ece. Seventeen changed public files read back from the canonical domain match local content. Online UI verified in Chrome.

Screenshots are browser captures. Some intermediate captures show an animation in progress; desktop.jpg and kinetic-seconds-mobile.jpg show the final online viewer.

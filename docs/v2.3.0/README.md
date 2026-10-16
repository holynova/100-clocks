# v2.3.0 verification

- Seven gallery cases: kinetic, whole rails, original dual rails, alphabet rails, numeric matrix, Chinese words, English words. Column rails retired from navigation; its old query URL aliases to whole rails. The old word query aliases to Chinese words.
- Kinetic seconds default on. Assembly starts with every pair of hands at 225° / 135°, runs for 3,000 ms, and targets the current time at completion. Tests verify the aligned start, midpoint, exact endpoint and all final hand angles.
- Focus is available on all three retained rail renderers. The time window occupies exactly 50% of viewport width. Geometry follows viewport resize and changes in seconds / display mode; toggling off restores the full original viewBox. Tested on desktop (720 / 1440 px) and mobile (187.5 / 375 px).
- Startup: whole-digit mask is precomputed from the original generator (equivalence verified); embedded views skip the 300 ms + 1,260 ms opening intro. Renderers notify the host as soon as geometry is ready, without waiting for the settings adapter. Hover/focus prefetch uses the exact embedded URL. Local whole-rail ready sample: 135.4 ms. This is a local browser sample, not a network-independent guarantee.
- Original numeric/word stylesheets retain their original SHA-256. Language cases use the same word renderer with explicit language URLs, overriding saved language preferences.
- The visible interface uses consistent local inline SVG icons, including navigation, settings, focus, replay, fullscreen, pause and the site icon. No icon font or remote icon dependency.
- Browser checks: all seven cases inside bounds at 320×568, 375×812 and 812×375; default seconds, assembly, Focus across all three rail cases, independent language grids (66 / 264), gallery image loading and refreshed real-renderer thumbnails.
- npm run check covers twelve unit checks, rail geometry / all 86,400 readings / 2,809 glyph transitions, embedded startup, and all seven case DOM executions. npm run build generates the static deployment.

Production: https://100-clocks.xiaosang.cc/ — version ac3d6f3d-5fa7-4a9c-85bd-e49973853b44. Twenty-one files read back byte-for-byte. Live English case reports lang=en and 264 cells. Live Focus measures 720 / 1440 px; sampled ready time 835.1 ms over this connection. These timings vary with network / device conditions.

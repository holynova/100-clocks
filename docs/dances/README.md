# Manual choreography — 2026-10-17

- Added six continuous effects: 星旋 (spiral), 波浪 (wave), 涟漪 (ripple), 风车 (pinwheel), 棋盘 (checker), 扇面 (fan). Each click advances one effect; the sequence wraps. Settings and the quick button share the same sequence.
- Each effect plays for 3.6 seconds, blends in over 450 ms and returns to current time. Clicking again switches immediately to the next effect. Assembly, display changes and background visibility recover cleanly.
- The quick dance button sits beside the 44×44 icon-only assembly button. Assembly retains its accessible name and tooltip. Active effect names appear in the button and are announced through a status region.
- Removed the six-second idle pose timer. The only polling interval is the normal 100 ms clock tick. Unchanged time schedules no canvas frames. Ordinary hand updates follow the shortest path and ignore negligible angle noise, so unchanged hands cannot make a spurious full turn.
- Dance geometry writes into reusable typed buffers; it does not write styles per frame. Local desktop Chrome sample: 60 fps, mean JavaScript 0.305 ms/frame, P95 interval 16.8 ms. See performance.json; results depend on device / browser load.
- Unit checks cover all six effects in portrait/landscape, four/six-digit layouts, twelve consecutive clicks (including wrap), exact return to current time, twenty seconds of frozen-time inactivity, shortest hand paths and interruption recovery. Existing three-second assembly and all slider / original-style checks remain in the main check command.
- Browser acceptance: six screenshots reflect the six effects after the entry blend; 320×568 verifies icon-only assembly, non-wrapping dance label and canvas / control separation. Choreography completes and the label returns to 舞蹈.

Deployment: ab2f8230-51fa-4f62-98d5-1c5200fa9d46 on https://100-clocks.xiaosang.cc/. Fourteen changed public files read back byte-for-byte. Live browser confirmed the icon-only 三秒归位 control and the adjacent 舞蹈 · 星旋 button. All sixteen unit checks plus the complete clock/rail regression suite passed before deployment.

# Bounce Animation Audit

- **Goal:** Determine why slot reels still appear to bounce after the bounce animation was supposedly removed.
- **Date:** 2025-10-08T14:52:04Z

## Findings

1. The active JavaScript file is `assets/js/slot-machine.js`. It no longer contains any references to `startBounceAnimation`, `startBounceFlash`, or `.bounce` class manipulation. The spin-completion flow calls `startResultFlash()` immediately after removing the `spin` class from each reel, ensuring the flash-only phase runs without referencing any bounce helpers. 【F:assets/js/slot-machine.js†L1-L165】
2. The CSS still applies `transition: transform 0.3s;` to each `.reel`. When the `spin` animation is removed, the computed transform eases back to its resting state across that transition. This lingering transform transition is what produces the visible post-spin "bounce" effect even though all explicit bounce logic has been deleted. 【F:assets/css/slot-machine.css†L28-L49】

## Root Cause

- The residual `transition: transform 0.3s;` on `.reel` continues to animate the transform value as the spin animation ends, creating an unintended bounce.

## Recommendation

- Remove or scope the transform transition to a different property (or disable it after spin) so the reels snap back instantly. For example, drop the `transition` line or replace it with something like `transition: box-shadow 0.3s;`.


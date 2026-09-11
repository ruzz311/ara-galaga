# Clovie: Neon Dividend

An original Phaser-powered synthwave arcade shooter starring Clovie. Choose either supplied mascot variant, clear escalating formations of original neon enemies, and collect `$` drops to activate the temporary **Cash Cannon**.

## Run locally

No npm install is required. The Phaser runtime is loaded from its public CDN.

```sh
npm start
```

Then open `http://127.0.0.1:4173`.

## Controls

- Move: `A` / `D` or Left / Right arrows
- Fire: `Space`
- Pause/resume: `P`
- Toggle sound: `M`
- Return to the hangar after game over: `R`

## Validation

```sh
npm test
node --check src/main.js
```

## Difficulty tuning

Every wave becomes faster and more aggressive. The full set of caps, starting
values, and per-wave increments is in `WAVE_DIFFICULTY` in
[`src/game-rules.js`](./src/game-rules.js). Adjust that one object to rebalance
enemy shot frequency and speed, formation movement, each phase of the looping
dive route, the maximum `powerUpsPerWave` drop count, and
`powerUpFallSpeed` progression. The same object contains `healthDropEveryWaves`,
`healthDropChancePerEnemy`, and `healthRestoredPerDrop` for the special health
drop that can appear at most once during each eligible wave.

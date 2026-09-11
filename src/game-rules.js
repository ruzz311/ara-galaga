export const CASH_CANNON_DURATION_MS = 8_000;

// Adjust this single object to rebalance how quickly each wave escalates.
export const WAVE_DIFFICULTY = {
  powerUpsPerWave: 2,
  powerUpFallSpeed: { initial: 100, perWave: 14, maximum: 240 },
  healthDropEveryWaves: 3,
  healthDropChancePerEnemy: 24,
  healthRestoredPerDrop: 1,
  entryDelay: { initial: 2_600, perWave: 110, minimum: 1_350 },
  enemyFireDelay: { initial: 1_750, perWave: 95, minimum: 650 },
  enemyFireSpeed: { initial: 240, perWave: 12, maximum: 385 },
  formationDelay: { initial: 1_300, perWave: 65, minimum: 560 },
  formationStep: { initial: 18, perWave: 1.4, maximum: 34 },
  formationDuration: { initial: 850, perWave: 38, minimum: 380 },
  diveDelay: { initial: 2_200, perWave: 115, minimum: 800 },
  diveBankDuration: { initial: 700, perWave: 34, minimum: 360 },
  diveExitDuration: { initial: 1_000, perWave: 46, minimum: 520 },
  diveReturnDuration: { initial: 720, perWave: 32, minimum: 380 },
  diveSettleDuration: { initial: 820, perWave: 34, minimum: 420 },
};

export function waveDifficulty(wave) {
  const level = Math.max(0, wave - 1);
  const faster = ({ initial, perWave, minimum }) => Math.max(minimum, initial - level * perWave);
  const stronger = ({ initial, perWave, maximum }) => Math.min(maximum, initial + level * perWave);
  return {
    powerUpsPerWave: WAVE_DIFFICULTY.powerUpsPerWave,
    powerUpFallSpeed: stronger(WAVE_DIFFICULTY.powerUpFallSpeed),
    healthDropEveryWaves: WAVE_DIFFICULTY.healthDropEveryWaves,
    healthDropChancePerEnemy: WAVE_DIFFICULTY.healthDropChancePerEnemy,
    healthRestoredPerDrop: WAVE_DIFFICULTY.healthRestoredPerDrop,
    entryDelay: faster(WAVE_DIFFICULTY.entryDelay),
    enemyFireDelay: faster(WAVE_DIFFICULTY.enemyFireDelay),
    enemyFireSpeed: stronger(WAVE_DIFFICULTY.enemyFireSpeed),
    formationDelay: faster(WAVE_DIFFICULTY.formationDelay),
    formationStep: stronger(WAVE_DIFFICULTY.formationStep),
    formationDuration: faster(WAVE_DIFFICULTY.formationDuration),
    diveDelay: faster(WAVE_DIFFICULTY.diveDelay),
    diveBankDuration: faster(WAVE_DIFFICULTY.diveBankDuration),
    diveExitDuration: faster(WAVE_DIFFICULTY.diveExitDuration),
    diveReturnDuration: faster(WAVE_DIFFICULTY.diveReturnDuration),
    diveSettleDuration: faster(WAVE_DIFFICULTY.diveSettleDuration),
  };
}

export function waveRows(wave) {
  return Math.min(3 + Math.floor(wave / 2), 5);
}

export function enemyPoints(rows, row) {
  return (rows - row) * 10;
}

export function shotProfile(cashCannonActive) {
  return cashCannonActive
    ? { damage: 2, cooldownMs: 135, velocityY: -530 }
    : { damage: 1, cooldownMs: 230, velocityY: -650 };
}

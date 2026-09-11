export const CASH_CANNON_DURATION_MS = 8_000;
export const STANDARD_SHOT_DAMAGE = 1;
export const CASH_CANNON_DAMAGE_BONUS = .5;
export const DIVIDEND_BURST_DAMAGE_BONUS = 1;

// Adjust this single object to rebalance how quickly each wave escalates.
export const WAVE_DIFFICULTY = {
  enemyBaseHealth: {
    "enemy-a": 2,
    "enemy-b": 1,
    "enemy-c": 3,
  },
  enemyHealthIncreaseEveryWaves: 5,
  powerUpsPerWave: 2,
  powerUpFallSpeed: { initial: 100, perWave: 14, maximum: 240 },
  healthDropEveryWaves: 3,
  healthDropChancePerEnemy: 24,
  healthRestoredPerDrop: 1,
  entryDelay: { initial: 1_200, perWave: 0, minimum: 1_200 },
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

export function enemyHealth(wave, enemyType) {
  const baseHealth = WAVE_DIFFICULTY.enemyBaseHealth[enemyType];
  if (!baseHealth) throw new Error(`Unknown enemy type: ${enemyType}`);
  return baseHealth + Math.floor((Math.max(1, wave) - 1) / WAVE_DIFFICULTY.enemyHealthIncreaseEveryWaves);
}

export function waveRows(wave) {
  return Math.min(3 + Math.floor(wave / 2), 5);
}

export function enemyPoints(rows, row) {
  return (rows - row) * 10;
}

export function shotProfile(cashCannonActive) {
  return cashCannonActive
    ? { damage: STANDARD_SHOT_DAMAGE + CASH_CANNON_DAMAGE_BONUS, cooldownMs: 135, velocityY: -530 }
    : { damage: STANDARD_SHOT_DAMAGE, cooldownMs: 230, velocityY: -650 };
}

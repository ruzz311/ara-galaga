export const CASH_CANNON_DURATION_MS = 8_000;

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

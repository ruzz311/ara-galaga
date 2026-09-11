import { CASH_CANNON_DURATION_MS, enemyPoints, shotProfile, waveRows } from "./game-rules.js";

const WIDTH = 480;
const HEIGHT = 780;
const HORIZON_Y = 590;
const COLORS = { cyan: 0x4bf5ff, pink: 0xf42cff, gold: 0xffdb4b, purple: 0x9f65ff, ink: 0x080316 };
const BEST_SCORE_KEY = "clovie-neon-dividend-best-score";

function bestScore() {
  return Math.max(0, Number.parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10) || 0);
}

function formatScore(score) {
  return String(score).padStart(6, "0");
}

class SoundBank {
  constructor() { this.muted = false; this.context = null; }
  toggle() { this.muted = !this.muted; return this.muted; }
  beep(frequency, duration = 0.06, type = "square", volume = 0.03) {
    if (this.muted) return;
    this.context ??= new AudioContext();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}

const sound = new SoundBank();

class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }
  preload() {
    this.load.image("clovie-hat", "public/assets/clovie-top-hat.png");
    this.load.image("clovie-leaf", "public/assets/clovie-leaf-emblem.png");
  }
  create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(COLORS.cyan, 1).fillRect(0, 0, 8, 24);
    graphics.generateTexture("laser", 8, 24).clear();
    graphics.fillStyle(COLORS.gold, 1).fillCircle(14, 14, 14);
    graphics.lineStyle(2, 0xff8f1f).strokeCircle(14, 14, 12);
    graphics.lineStyle(3, 0x4b2511, 1);
    graphics.lineBetween(14, 4, 14, 24);
    graphics.strokePoints([
      { x: 19, y: 7 }, { x: 10, y: 7 }, { x: 8, y: 11 },
      { x: 10, y: 14 }, { x: 18, y: 15 }, { x: 20, y: 19 },
      { x: 18, y: 22 }, { x: 9, y: 22 },
    ]);
    graphics.generateTexture("money", 28, 28).clear();
    const cashSymbol = this.add.text(0, 0, "$", {
      fontFamily: "Arial Black, sans-serif",
      fontSize: "31px",
      color: "#ffef8a",
      stroke: "#8e3516",
      strokeThickness: 3,
    });
    const cashTexture = this.add.renderTexture(0, 0, 30, 37).setVisible(false);
    cashTexture.draw(cashSymbol);
    cashTexture.saveTexture("cash-symbol");
    cashTexture.destroy();
    cashSymbol.destroy();
    graphics.fillStyle(COLORS.pink, .45).fillCircle(15, 15, 15);
    graphics.fillStyle(0xff571f, 1).fillCircle(15, 15, 11);
    graphics.fillStyle(COLORS.gold, 1).fillCircle(15, 15, 6);
    graphics.fillStyle(0xfffbbe, 1).fillCircle(12, 12, 2);
    graphics.generateTexture("fireball", 30, 30).clear();
    graphics.fillStyle(0x0e4e34).fillRoundedRect(3, 11, 34, 20, 3);
    graphics.fillStyle(0x167a4a).fillRoundedRect(6, 7, 34, 20, 3);
    graphics.fillStyle(0x35bb69).fillRoundedRect(9, 3, 34, 20, 3);
    graphics.lineStyle(2, 0xd7ee80).strokeRoundedRect(9, 3, 34, 20, 3);
    graphics.lineStyle(2, 0x063b27).lineBetween(26, 6, 26, 20);
    graphics.strokePoints([{ x: 31, y: 8 }, { x: 21, y: 8 }, { x: 20, y: 11 }, { x: 30, y: 14 }, { x: 29, y: 18 }, { x: 20, y: 18 }]);
    graphics.generateTexture("cash-stack", 44, 34).clear();
    graphics.fillStyle(0x271047, 1).fillCircle(28, 28, 28);
    graphics.lineStyle(3, COLORS.pink).strokeCircle(28, 28, 25);
    graphics.fillStyle(COLORS.pink).fillTriangle(28, 5, 52, 45, 4, 45);
    graphics.fillStyle(COLORS.gold).fillCircle(28, 27, 9);
    graphics.generateTexture("enemy-a", 56, 56).clear();
    graphics.fillStyle(0x1e1641, 1).fillCircle(28, 28, 26);
    graphics.lineStyle(3, COLORS.cyan).strokeCircle(28, 28, 23);
    graphics.fillStyle(COLORS.cyan).fillTriangle(28, 8, 48, 43, 8, 43);
    graphics.fillStyle(COLORS.ink).fillCircle(28, 28, 8);
    graphics.generateTexture("enemy-b", 56, 56).clear();
    graphics.fillStyle(0x1e1641, 1).fillRoundedRect(3, 8, 50, 40, 12);
    graphics.lineStyle(3, COLORS.gold).strokeRoundedRect(3, 8, 50, 40, 12);
    graphics.fillStyle(COLORS.gold).fillCircle(18, 28, 5).fillCircle(38, 28, 5);
    graphics.generateTexture("enemy-c", 56, 56).clear();
    graphics.fillStyle(0x1e1641).fillPoints([{ x: 28, y: 2 }, { x: 54, y: 28 }, { x: 28, y: 54 }, { x: 2, y: 28 }], true);
    graphics.lineStyle(3, COLORS.purple).strokePoints([{ x: 28, y: 2 }, { x: 54, y: 28 }, { x: 28, y: 54 }, { x: 2, y: 28 }], true);
    graphics.fillStyle(COLORS.purple).fillCircle(28, 28, 8);
    graphics.destroy();
    this.scene.start("menu");
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super("menu"); }
  create() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.ink);
    makeBackdrop(this);
    const style = { fontFamily: "Orbitron", fontStyle: "bold", align: "center" };
    this.add.text(WIDTH / 2, 95, "SELECT YOUR CLOVIE", { ...style, fontSize: "28px", color: "#f7efff" }).setOrigin(.5);
    this.add.text(WIDTH / 2, 132, "NEON DIVIDEND // SHIFT 01", { ...style, fontSize: "13px", color: "#4bf5ff" }).setOrigin(.5);
    const choices = [
      { key: "clovie-hat", label: "THE LUCKY CAPTAIN", accent: "#4bf5ff", x: 125 },
      { key: "clovie-leaf", label: "THE NEON MAVERICK", accent: "#ffdb4b", x: 355 },
    ];
    choices.forEach((choice, index) => {
      const container = this.add.container(choice.x, 350);
      const frame = this.add.rectangle(0, 0, 210, 280, 0x100523, .83).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(choice.accent).color);
      const mascot = this.add.image(0, -35, choice.key).setDisplaySize(130, 130);
      const label = this.add.text(0, 85, choice.label, { ...style, fontSize: "12px", color: choice.accent, wordWrap: { width: 180 } }).setOrigin(.5);
      const prompt = this.add.text(0, 120, `[ ${index + 1} ] DEPLOY`, { ...style, fontSize: "11px", color: "#ffffff" }).setOrigin(.5);
      container.add([frame, mascot, label, prompt]);
      container.setSize(210, 280).setInteractive({ useHandCursor: true });
      container.on("pointerover", () => { frame.setFillStyle(0x2c0b4d, .95); mascot.setScale(1.08); });
      container.on("pointerout", () => { frame.setFillStyle(0x100523, .83); mascot.setScale(1); });
      container.on("pointerdown", () => this.startGame(choice.key));
      this.input.keyboard.once(index === 0 ? "keydown-ONE" : "keydown-TWO", () => this.startGame(choice.key));
      void label; void prompt;
    });
    this.add.text(WIDTH / 2, 665, `BEST DIVIDEND // ${formatScore(bestScore())}`, { ...style, fontSize: "14px", color: "#ffdb4b" }).setOrigin(.5);
    this.add.text(WIDTH / 2, 695, "DEFEND THE VIOLET LEDGER // COLLECT $ DROPS FOR CASH CANNON", { ...style, fontSize: "11px", color: "#bdafda", align: "center", wordWrap: { width: 420 } }).setOrigin(.5);
  }
  startGame(character) { sound.beep(550, .1, "sawtooth"); this.scene.start("battle", { character }); }
}

class BattleScene extends Phaser.Scene {
  constructor() { super("battle"); }
  init(data) { this.character = data.character; }
  create() {
    makeBackdrop(this);
    this.score = 0; this.highScore = bestScore(); this.wave = 1; this.lives = 3; this.cashUntil = 0; this.burstUntil = 0; this.lastShot = 0; this.paused = false; this.transitioningWave = false; this.formationDirection = 1;
    this.player = this.physics.add.sprite(WIDTH / 2, 700, this.character).setDisplaySize(78, 78).setCollideWorldBounds(true);
    this.player.body.setSize(45, 45);
    this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 32, runChildUpdate: true });
    this.enemyShots = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 24, runChildUpdate: true });
    this.enemies = this.physics.add.group();
    this.drops = this.physics.add.group();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("A,D,SPACE,P,M,R");
    this.createHud();
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.enemyShots, this.hitPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.drops, this.collectDrop, undefined, this);
    this.input.keyboard.on("keydown-P", () => this.togglePause());
    this.input.keyboard.on("keydown-M", () => { const muted = sound.toggle(); this.soundText.setText(muted ? "SFX: OFF [M]" : "SFX: ON [M]"); });
    this.input.keyboard.on("keydown-R", () => { if (this.lives <= 0) this.scene.start("menu"); });
    this.spawnWave();
  }
  createHud() {
    const style = { fontFamily: "Orbitron", fontStyle: "bold" };
    this.add.rectangle(WIDTH / 2, 30, WIDTH, 60, 0x080316, .82);
    this.scoreText = this.add.text(22, 17, "SCORE 000000", { ...style, fontSize: "17px", color: "#ffdb4b" });
    this.waveText = this.add.text(WIDTH / 2, 17, "WAVE 01", { ...style, fontSize: "17px", color: "#4bf5ff" }).setOrigin(.5, 0);
    this.bestText = this.add.text(WIDTH - 22, 17, `BEST ${formatScore(this.highScore)}`, { ...style, fontSize: "13px", color: "#ffdb4b" }).setOrigin(1, 0);
    this.lifeText = this.add.text(WIDTH - 22, 39, "CLOVERS x3", { ...style, fontSize: "13px", color: "#f7efff" }).setOrigin(1, 0);
    this.powerText = this.add.text(WIDTH / 2, 47, "", { ...style, fontSize: "11px", color: "#ffdb4b" }).setOrigin(.5, 0);
    this.soundText = this.add.text(WIDTH - 15, HEIGHT - 17, "SFX: ON [M]", { ...style, fontSize: "9px", color: "#bdafda" }).setOrigin(1);
  }
  spawnWave() {
    this.transitioningWave = false;
    const announcement = this.add.text(WIDTH / 2, 95, `WAVE ${String(this.wave).padStart(2, "0")} // INCOMING`, { fontFamily: "Orbitron", fontSize: "20px", color: "#f42cff" })
      .setOrigin(.5).setDepth(3).setScale(.8);
    this.tweens.add({ targets: announcement, alpha: 0, scale: 1.1, duration: 1200, delay: 350, onComplete: () => announcement.destroy() });
    const cols = 7; const rows = waveRows(this.wave);
    const types = ["enemy-a", "enemy-b", "enemy-c"];
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const x = 62 + col * 59; const targetY = 145 + row * 60;
      const enemy = this.enemies.create(x, -50 - row * 40, types[(row + col) % types.length]);
      enemy.setData({ homeX: x, homeY: targetY, points: enemyPoints(rows, row), diving: false });
      enemy.setCircle(22); enemy.setVelocityY(0);
      this.tweens.add({ targets: enemy, y: targetY, duration: 650 + row * 130, ease: "Sine.easeOut", delay: col * 45 });
    }
    this.waveText.setText(`WAVE ${String(this.wave).padStart(2, "0")}`);
    this.time.delayedCall(2600, () => this.beginAttacks());
  }
  beginAttacks() {
    if (this.lives <= 0) return;
    this.attackTimer = this.time.addEvent({ delay: Math.max(900, 2200 - this.wave * 90), loop: true, callback: () => this.sendDiver() });
    this.fireTimer = this.time.addEvent({ delay: Math.max(950, 1750 - this.wave * 55), loop: true, callback: () => this.fireEnemyShot() });
    this.formationTimer = this.time.addEvent({ delay: 1300, loop: true, callback: () => this.sweepFormation() });
  }
  sweepFormation() {
    const formation = this.enemies.getChildren().filter(enemy => enemy.active && !enemy.getData("diving"));
    if (!formation.length || this.lives <= 0 || this.paused) return;
    const step = 18;
    const minX = Math.min(...formation.map(enemy => enemy.getData("homeX")));
    const maxX = Math.max(...formation.map(enemy => enemy.getData("homeX")));
    if (minX + this.formationDirection * step < 45 || maxX + this.formationDirection * step > WIDTH - 45) this.formationDirection *= -1;
    formation.forEach(enemy => {
      const homeX = enemy.getData("homeX") + this.formationDirection * step;
      enemy.setData("homeX", homeX);
      this.tweens.add({ targets: enemy, x: homeX, y: enemy.getData("homeY") + Phaser.Math.Between(-5, 5), duration: 850, ease: "Sine.easeInOut" });
    });
  }
  sendDiver() {
    const candidates = this.enemies.getChildren().filter(enemy => enemy.active && !enemy.getData("diving"));
    if (!candidates.length) return;
    const enemy = Phaser.Utils.Array.GetRandom(candidates);
    enemy.setData("diving", true);
    const bankX = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-135, 135), 55, WIDTH - 55);
    this.tweens.chain({
      targets: enemy,
      tweens: [
        { x: bankX, y: 380, angle: Phaser.Math.Between(-35, 35), duration: 700, ease: "Sine.easeInOut" },
        { x: Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-95, 95), 45, WIDTH - 45), y: HEIGHT + 65, angle: Phaser.Math.Between(-50, 50), duration: 1_000, ease: "Sine.easeIn" },
        { x: enemy.getData("homeX"), y: -65, angle: 0, duration: 720, ease: "Sine.easeOut" },
        { x: enemy.getData("homeX"), y: enemy.getData("homeY"), angle: 0, duration: 820, ease: "Sine.easeInOut" },
      ],
      onComplete: () => { if (enemy.active) enemy.setData("diving", false); },
    });
  }
  fireEnemyShot() {
    const candidates = this.enemies.getChildren().filter(enemy => enemy.active && !enemy.getData("diving"));
    if (!candidates.length || this.lives <= 0 || this.paused) return;
    const enemy = Phaser.Utils.Array.GetRandom(candidates);
    const fireball = this.spawnProjectile(this.enemyShots, "fireball", enemy.x, enemy.y + 28, 4_000);
    if (!fireball) return;
    fireball.setCircle(11).setAngularVelocity(360);
    this.physics.moveToObject(fireball, this.player, 240 + this.wave * 8);
    sound.beep(170, .07, "sawtooth", .025);
  }
  spawnProjectile(group, texture, x, y, lifetimeMs = 1_200) {
    let projectile = group.getFirstDead(false);
    if (!projectile) {
      if (group.maxSize >= 0 && group.getLength() >= group.maxSize) return null;
      projectile = group.create(x, y, texture);
    }
    projectile.enableBody(true, x, y, true, true);
    projectile.setTexture(texture).setScale(1).setAngle(0).setAlpha(1).setTint(0xffffff).setVelocity(0);
    projectile.setData("expiresAt", this.time.now + lifetimeMs);
    return projectile;
  }
  releaseProjectile(projectile) {
    projectile.setVelocity(0).setAngularVelocity(0).setAngle(0).setScale(1);
    projectile.disableBody(true, true);
  }
  update(time) {
    if (this.paused || this.lives <= 0) return;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    this.player.setVelocityX(left ? -380 : right ? 380 : 0);
    const burstActive = this.burstUntil > time;
    const shotCooldown = burstActive ? 120 : shotProfile(this.cashUntil > time).cooldownMs;
    if (this.keys.SPACE.isDown && time - this.lastShot > shotCooldown) this.fire(time);
    this.bullets.getChildren().forEach(bullet => {
      if (bullet.active && (bullet.y < -40 || time >= bullet.getData("expiresAt"))) this.releaseProjectile(bullet);
    });
    this.enemyShots.getChildren().forEach(fireball => {
      if (fireball.active && (
        fireball.y > HEIGHT + 40 || fireball.x < -40 || fireball.x > WIDTH + 40 || time >= fireball.getData("expiresAt")
      )) this.releaseProjectile(fireball);
    });
    this.drops.getChildren().forEach(drop => { if (drop.active && drop.y > HEIGHT + 25) drop.disableBody(true, true); });
    if (burstActive) this.powerText.setText(`DIVIDEND BURST // ${(Math.max(0, this.burstUntil - time) / 1000).toFixed(1)}s`);
    else if (this.cashUntil > time) this.powerText.setText(`CASH CANNON // ${(Math.max(0, this.cashUntil - time) / 1000).toFixed(1)}s`);
    else this.powerText.setText("");
    if (this.enemies.countActive(true) === 0 && !this.transitioningWave) {
      this.transitioningWave = true;
      this.attackTimer?.remove(false); this.fireTimer?.remove(false); this.formationTimer?.remove(false);
      this.wave++; this.time.delayedCall(1000, () => this.spawnWave());
    }
  }
  fire(time) {
    const burst = this.burstUntil > time;
    const cash = this.cashUntil > time;
    const profile = shotProfile(cash);
    const texture = burst ? "cash-stack" : cash ? "cash-symbol" : "laser";
    const bullet = this.spawnProjectile(this.bullets, texture, this.player.x, this.player.y - 45, burst ? 1_700 : cash ? 1_400 : 1_100);
    if (!bullet) return;
    bullet.setVelocityY(burst ? -440 : profile.velocityY);
    bullet.setData("damage", burst ? 2 : profile.damage).setData("splashRadius", burst ? 105 : 0);
    this.lastShot = time; sound.beep(burst ? 110 : cash ? 720 : 340, burst ? .11 : .045, burst ? "sawtooth" : cash ? "triangle" : "square");
  }
  hitEnemy(bullet, enemy) {
    const splashRadius = bullet.getData("splashRadius") ?? 0;
    this.releaseProjectile(bullet);
    const damage = bullet.getData("damage") ?? 1;
    this.damageEnemy(enemy, damage);
    if (splashRadius) this.detonateCashStack(enemy.x, enemy.y, splashRadius);
  }
  damageEnemy(enemy, damage) {
    if (!enemy.active) return;
    const health = (enemy.getData("health") ?? (enemy.texture.key === "enemy-c" ? 2 : 1)) - damage;
    if (health > 0) { enemy.setData("health", health); enemy.setTint(COLORS.gold); this.time.delayedCall(90, () => enemy.clearTint()); return; }
    this.score += enemy.getData("points"); this.scoreText.setText(`SCORE ${formatScore(this.score)}`);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(BEST_SCORE_KEY, String(this.highScore));
      this.bestText.setText(`BEST ${formatScore(this.highScore)}`);
    }
    sound.beep(120, .11, "sawtooth", .05);
    this.add.particles(enemy.x, enemy.y, "laser", { speed: { min: 60, max: 180 }, scale: { start: .9, end: 0 }, lifespan: 380, quantity: 10, tint: [COLORS.cyan, COLORS.pink, COLORS.gold] }).explode(10);
    const dropRoll = Phaser.Math.Between(1, 100);
    if (dropRoll <= 19) {
      const isBurstDrop = dropRoll > 13;
      const drop = this.drops.create(enemy.x, enemy.y, isBurstDrop ? "cash-stack" : "money").setCircle(12).setVelocityY(100);
      drop.setData("kind", isBurstDrop ? "burst" : "cash");
      this.tweens.add({ targets: drop, angle: 360, duration: 800, repeat: -1 });
    }
    enemy.disableBody(true, true);
  }
  detonateCashStack(x, y, radius) {
    this.cameras.main.shake(90, .006);
    this.add.particles(x, y, "money", { speed: { min: 90, max: 240 }, scale: { start: .8, end: 0 }, lifespan: 450, quantity: 16, tint: [0x35bb69, COLORS.gold] }).explode(16);
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) this.damageEnemy(enemy, 1);
    });
  }
  collectDrop(player, drop) {
    const isBurstDrop = drop.getData("kind") === "burst";
    drop.disableBody(true, true);
    if (isBurstDrop) this.burstUntil = this.time.now + CASH_CANNON_DURATION_MS;
    else this.cashUntil = this.time.now + CASH_CANNON_DURATION_MS;
    sound.beep(880, .17, "triangle", .07);
    this.cameras.main.flash(130, 255, 210, 60);
  }
  hitPlayer(player, enemy) {
    if (player.getData("invulnerable")) return;
    if (enemy.texture.key === "fireball") this.releaseProjectile(enemy);
    else enemy.disableBody(true, true);
    this.lives--; this.lifeText.setText(`CLOVERS x${this.lives}`);
    player.setData("invulnerable", true).setTint(0xff7799); sound.beep(90, .3, "sawtooth", .08);
    this.cameras.main.shake(170, .012);
    this.tweens.add({ targets: player, alpha: .2, yoyo: true, repeat: 7, duration: 90, onComplete: () => {
      if (this.lives <= 0) {
        this.add.particles(player.x, player.y, "money", {
          speed: { min: 80, max: 260 },
          scale: { start: .9, end: 0 },
          lifespan: 500,
          quantity: 18,
          tint: [COLORS.pink, COLORS.cyan, COLORS.gold],
        }).explode(18);
        this.tweens.add({
          targets: player,
          scale: 0,
          angle: 540,
          alpha: 0,
          duration: 500,
          ease: "Quad.easeIn",
          onComplete: () => this.endGame(),
        });
      } else {
        player.clearTint().setAlpha(1).setData("invulnerable", false);
      }
    }});
  }
  togglePause() {
    if (this.lives <= 0) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause(); this.tweens.pauseAll();
      this.pauseLabel = this.add.text(WIDTH / 2, HEIGHT / 2, "SYSTEM PAUSED\n[P] TO RESUME", { fontFamily: "Orbitron", fontSize: "24px", align: "center", color: "#ffdb4b" }).setOrigin(.5).setDepth(5);
    } else {
      this.physics.resume(); this.tweens.resumeAll(); this.pauseLabel.destroy();
    }
  }
  endGame() {
    this.attackTimer?.remove(false); this.fireTimer?.remove(false); this.formationTimer?.remove(false); this.physics.pause();
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, 440, 220, 0x100523, .94).setStrokeStyle(2, COLORS.pink).setDepth(5);
    this.add.text(WIDTH / 2, HEIGHT / 2 - 55, "LEDGER CLOSED", { fontFamily: "Orbitron", fontSize: "30px", fontStyle: "bold", color: "#f42cff" }).setOrigin(.5).setDepth(6);
    this.add.text(WIDTH / 2, HEIGHT / 2, `FINAL DIVIDEND  ${formatScore(this.score)}`, { fontFamily: "Orbitron", fontSize: "17px", color: "#ffdb4b" }).setOrigin(.5).setDepth(6);
    this.add.text(WIDTH / 2, HEIGHT / 2 + 30, `BEST DIVIDEND  ${formatScore(this.highScore)}`, { fontFamily: "Orbitron", fontSize: "13px", color: "#4bf5ff" }).setOrigin(.5).setDepth(6);
    this.add.text(WIDTH / 2, HEIGHT / 2 + 65, "[ R ] RETURN TO HANGAR", { fontFamily: "Orbitron", fontSize: "13px", color: "#4bf5ff" }).setOrigin(.5).setDepth(6);
  }
}

function makeBackdrop(scene) {
  const graphics = scene.add.graphics();
  graphics.fillStyle(COLORS.ink).fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 100; i++) graphics.fillStyle(i % 3 ? COLORS.cyan : COLORS.pink, Phaser.Math.FloatBetween(.25, .8)).fillCircle(Phaser.Math.Between(0, WIDTH), Phaser.Math.Between(55, HORIZON_Y - 10), Phaser.Math.Between(1, 2));
  graphics.lineStyle(1, COLORS.pink, .34);
  for (let x = -200; x <= WIDTH + 200; x += 55) graphics.lineBetween(WIDTH / 2, HORIZON_Y, x, HEIGHT);
  for (let y = HORIZON_Y + 10; y < HEIGHT; y += 22) graphics.lineBetween(0, y, WIDTH, y);
  graphics.lineStyle(2, COLORS.cyan, .75).lineBetween(0, HORIZON_Y, WIDTH, HORIZON_Y);
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#080316",
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [BootScene, MenuScene, BattleScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});

import Phaser from 'phaser';

export default class RunnerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RunnerScene' });
    this.player = null;
    this.ground = null;
    this.portals = null;
    this.background = null;
    this.currentSpeed = 200;
    this.speedMultiplier = 1;
    this.lastPortalTime = 0;
    this.portalSpawnInterval = 8000;
    this.gameStartTime = 0;
    this.lastSpeedIncreaseTime = 0;
    this.speedIncreaseInterval = 30000;
    this.isGameActive = false;
    this.onPortalHit = null;
    this.onGameTick = null;
    this.particles = null;
  }

  init(data) {
    this.onPortalHit = data.onPortalHit || (() => {});
    this.onGameTick = data.onGameTick || (() => {});
    this.currentSpeed = data.initialSpeed || 200;
    this.speedMultiplier = 1;
  }

  preload() {
    // Create player sprite (pixel art style running character)
    this.createPlayerSprite();
    
    // Create portal sprite (red glowing rift)
    this.createPortalSprite();
    
    // Create ground texture
    this.createGroundTexture();
    
    // Create particle texture
    this.createParticleTexture();
  }

  createPlayerSprite() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Simple pixel art character - 32x48
    const colors = {
      skin: 0xffcc99,
      hair: 0x4a3728,
      shirt: 0xff4444,
      pants: 0x333366,
      shoes: 0x222222,
    };

    // Hair
    graphics.fillStyle(colors.hair);
    graphics.fillRect(8, 0, 16, 8);
    
    // Face
    graphics.fillStyle(colors.skin);
    graphics.fillRect(8, 8, 16, 12);
    
    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillRect(11, 11, 3, 3);
    graphics.fillRect(18, 11, 3, 3);
    
    // Body/Shirt
    graphics.fillStyle(colors.shirt);
    graphics.fillRect(6, 20, 20, 14);
    
    // Arms
    graphics.fillStyle(colors.skin);
    graphics.fillRect(2, 20, 4, 10);
    graphics.fillRect(26, 20, 4, 10);
    
    // Pants
    graphics.fillStyle(colors.pants);
    graphics.fillRect(8, 34, 7, 10);
    graphics.fillRect(17, 34, 7, 10);
    
    // Shoes
    graphics.fillStyle(colors.shoes);
    graphics.fillRect(6, 44, 9, 4);
    graphics.fillRect(17, 44, 9, 4);

    graphics.generateTexture('player', 32, 48);
    graphics.destroy();
  }

  createPortalSprite() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Outer glow
    graphics.fillStyle(0xff0000, 0.2);
    graphics.fillCircle(40, 50, 40);
    
    // Middle ring
    graphics.fillStyle(0xff0000, 0.4);
    graphics.fillCircle(40, 50, 30);
    
    // Inner core
    graphics.fillStyle(0xff0000, 0.8);
    graphics.fillCircle(40, 50, 20);
    
    // Center void
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(40, 50, 10);
    
    // Rift lines
    graphics.lineStyle(3, 0xff4444, 0.8);
    graphics.beginPath();
    graphics.moveTo(10, 30);
    graphics.lineTo(40, 50);
    graphics.lineTo(70, 20);
    graphics.stroke();
    
    graphics.beginPath();
    graphics.moveTo(15, 70);
    graphics.lineTo(40, 50);
    graphics.lineTo(65, 80);
    graphics.stroke();

    graphics.generateTexture('portal', 80, 100);
    graphics.destroy();
  }

  createGroundTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Dark ground with texture
    graphics.fillStyle(0x1a0505);
    graphics.fillRect(0, 0, 64, 32);
    
    // Add some texture lines
    graphics.lineStyle(1, 0x330000, 0.5);
    for (let i = 0; i < 64; i += 8) {
      graphics.lineBetween(i, 0, i + 4, 32);
    }
    
    // Top edge highlight
    graphics.lineStyle(2, 0x660000, 0.8);
    graphics.lineBetween(0, 0, 64, 0);

    graphics.generateTexture('ground', 64, 32);
    graphics.destroy();
  }

  createParticleTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    graphics.fillStyle(0xff0000, 0.8);
    graphics.fillCircle(4, 4, 4);
    
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
  }

  create() {
    const { width, height } = this.scale;
    
    // Background - dark gradient
    this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x050505);
    
    // Add atmospheric particles
    this.createAtmosphericParticles();
    
    // Create tiled ground
    this.groundTiles = [];
    const groundY = height - 50;
    for (let x = 0; x < width + 128; x += 64) {
      const tile = this.add.tileSprite(x, groundY, 64, 32, 'ground');
      this.groundTiles.push(tile);
    }
    
    // Physics ground
    this.ground = this.physics.add.staticGroup();
    const groundCollider = this.ground.create(width / 2, height - 20, null);
    groundCollider.setSize(width * 2, 40);
    groundCollider.setVisible(false);
    groundCollider.refreshBody();
    
    // Player
    this.player = this.physics.add.sprite(150, height - 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);
    this.player.setGravityY(300);
    
    // Portals group
    this.portals = this.physics.add.group({
      allowGravity: false,
    });
    
    // Collisions
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.overlap(this.player, this.portals, this.handlePortalCollision, null, this);
    
    // Initialize timers
    this.gameStartTime = this.time.now;
    this.lastPortalTime = this.time.now;
    this.lastSpeedIncreaseTime = this.time.now;
    this.isGameActive = true;
    
    // Running animation (bobbing)
    this.tweens.add({
      targets: this.player,
      y: this.player.y - 5,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Add fog layers
    this.createFogLayers();
  }

  createAtmosphericParticles() {
    const { width, height } = this.scale;
    
    // Create floating particles
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const particle = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0xff0000, 0.3);
      
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-100, 100),
        y: particle.y + Phaser.Math.Between(-50, 50),
        alpha: { from: 0.3, to: 0 },
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        yoyo: true,
      });
    }
  }

  createFogLayers() {
    const { width, height } = this.scale;
    
    // Bottom fog
    const fogBottom = this.add.rectangle(width / 2, height - 30, width, 60, 0x000000, 0.5);
    fogBottom.setDepth(5);
    
    // Top fog
    const fogTop = this.add.rectangle(width / 2, 30, width, 60, 0x000000, 0.3);
    fogTop.setDepth(5);
  }

  update(time, delta) {
    if (!this.isGameActive) return;

    const effectiveSpeed = this.currentSpeed * this.speedMultiplier;
    
    // Move ground tiles
    this.groundTiles.forEach(tile => {
      tile.x -= effectiveSpeed * (delta / 1000);
      if (tile.x < -64) {
        tile.x += this.groundTiles.length * 64;
      }
    });
    
    // Move portals
    this.portals.getChildren().forEach(portal => {
      portal.x -= effectiveSpeed * (delta / 1000);
      
      // Remove if off screen
      if (portal.x < -100) {
        portal.destroy();
      }
    });
    
    // Spawn portals
    if (time - this.lastPortalTime > this.portalSpawnInterval) {
      this.spawnPortal();
      this.lastPortalTime = time;
    }
    
    // Increase speed every 30 seconds
    if (time - this.lastSpeedIncreaseTime > this.speedIncreaseInterval) {
      this.currentSpeed += 20;
      this.lastSpeedIncreaseTime = time;
    }
    
    // Call game tick for time updates
    if (this.onGameTick) {
      this.onGameTick(delta / 1000);
    }
  }

  spawnPortal() {
    const { width, height } = this.scale;
    
    const portal = this.portals.create(width + 50, height - 100, 'portal');
    portal.setScale(0.8);
    portal.setSize(40, 80);
    
    // Add glow effect
    this.tweens.add({
      targets: portal,
      scaleX: { from: 0.8, to: 0.9 },
      scaleY: { from: 0.8, to: 0.9 },
      alpha: { from: 0.8, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    
    // Add pulsing tint
    this.tweens.add({
      targets: portal,
      tint: { from: 0xff0000, to: 0xff4444 },
      duration: 300,
      yoyo: true,
      repeat: -1,
    });
  }

  handlePortalCollision(player, portal) {
    if (!this.isGameActive) return;
    
    // Remove the portal
    portal.destroy();
    
    // Trigger portal hit callback
    if (this.onPortalHit) {
      this.onPortalHit();
    }
  }

  pauseGame() {
    this.isGameActive = false;
    this.physics.pause();
    this.tweens.pauseAll();
  }

  resumeGame() {
    this.isGameActive = true;
    this.physics.resume();
    this.tweens.resumeAll();
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
  }

  stopGame() {
    this.isGameActive = false;
    this.physics.pause();
    this.tweens.pauseAll();
  }
}

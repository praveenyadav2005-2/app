import Phaser from 'phaser';
import playerSprite from '../assets/sprites/characters/player.png';

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
    this.ambientParticles = null;
    this.portalParticles = null;
    this.playerGlow = null;
    this.playerShadow = null;
    this.lastHitFlash = 0;
  }

  init(data) {
    this.onPortalHit = data.onPortalHit || (() => {});
    this.onGameTick = data.onGameTick || (() => {});
    this.currentSpeed = data.initialSpeed || 200;
    this.speedMultiplier = 1;
  }

  preload() {
    // Load player sprite sheet (horizontal strip with 8 frames)
    this.load.spritesheet('player', playerSprite, {
      frameWidth: 125,
      frameHeight: 250
    });
    
    // Create player glow sprite
    this.createPlayerGlowSprite();
    
    // Create portal sprite (red glowing rift)
    this.createPortalSprite();
    
    // Create portal glow rings
    this.createPortalGlowRings();
    
    // Create ground texture
    this.createGroundTexture();
    
    // Create particle textures
    this.createParticleTextures();
  }



  createPlayerGlowSprite() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Glow outline around player - 32x48
    graphics.fillStyle(0xff0000, 0);
    graphics.fillRect(0, 0, 32, 48);
    
    // Outer red glow
    graphics.lineStyle(3, 0xff0000, 0.4);
    graphics.strokeRect(2, 2, 28, 44);
    
    // Inner glow edge
    graphics.lineStyle(1, 0xff4444, 0.2);
    graphics.strokeRect(1, 1, 30, 46);

    graphics.generateTexture('player_glow', 32, 48);
    graphics.destroy();
  }

  createPortalGlowRings() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Rotating ring 1 (outer)
    graphics.lineStyle(2, 0xff0000, 0.6);
    graphics.strokeCircle(40, 50, 45);
    
    // Rotating ring 2 (middle)
    graphics.lineStyle(1.5, 0xff3333, 0.4);
    graphics.strokeCircle(40, 50, 30);
    
    // Rotating ring 3 (inner)
    graphics.lineStyle(1, 0xff6666, 0.3);
    graphics.strokeCircle(40, 50, 20);

    graphics.generateTexture('portal_rings', 80, 100);
    graphics.destroy();
  }

  createPortalSprite() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Bright red glowing portal - 80x100
    // Outer glow
    graphics.fillStyle(0xff0000, 0.15);
    graphics.fillCircle(40, 50, 45);
    
    // Middle glow
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillCircle(40, 50, 35);
    
    // Mid ring
    graphics.fillStyle(0xff0000, 0.5);
    graphics.fillCircle(40, 50, 25);
    
    // Inner core
    graphics.fillStyle(0xff2222, 0.8);
    graphics.fillCircle(40, 50, 15);
    
    // Center void
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(40, 50, 8);
    
    // Rift lines - bright red
    graphics.lineStyle(2, 0xff4444, 0.9);
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

  createParticleTextures() {
    // Small red particle
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 0.8);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
    
    // Larger glow particle for portal
    const graphicsGlow = this.make.graphics({ x: 0, y: 0, add: false });
    graphicsGlow.fillStyle(0xff0000, 0.6);
    graphics.fillCircle(6, 6, 6);
    graphicsGlow.generateTexture('particle_glow', 12, 12);
    graphicsGlow.destroy();
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
    
    // Player shadow - use rectangle instead
    this.playerShadow = this.add.rectangle(150, height - 50, 40, 4, 0x000000, 0.5);
    
    // Player
    this.player = this.physics.add.sprite(150, height - 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);
    this.player.setGravityY(300);
    this.player.setScale(0.8); // Adjusted for new frame size
    
    // Create player walk animation
    this.anims.create({
      key: 'player-walk',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 7
      }),
      frameRate: 10,
      repeat: -1
    });
    
    // Play walk animation
    this.player.play('player-walk');
    
    // Player glow layer
    this.playerGlow = this.add.sprite(this.player.x, this.player.y, 'player_glow');
    this.playerGlow.setScale(0.8);
    this.playerGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.playerGlow.alpha = 0.3;
    
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
    
    // Add fog layers
    this.createFogLayers();
    
    // Create particle emitters
    this.createParticleEmitters();
  }

  createAtmosphericParticles() {
    const { width, height } = this.scale;
    
    // Create floating particles - static only, no tweening
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const particle = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0xff0000, 0.2);
      particle.setBlendMode(Phaser.BlendModes.ADD);
      particle.setDepth(1);
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

  createParticleEmitters() {
    // Create ambient particles - static background effect
    this.ambientParticles = [];
    
    // Just add some subtle background particles without tweening
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const particle = this.add.circle(x, y, Phaser.Math.Between(1, 2), 0xff0000, 0.2);
      particle.setBlendMode(Phaser.BlendModes.ADD);
      particle.setDepth(2);
      
      this.ambientParticles.push(particle);
    }
  }



  update(time, delta) {
    if (!this.isGameActive) return;

    const effectiveSpeed = this.currentSpeed * this.speedMultiplier;
    
    // Update player glow and shadow positions
    if (this.playerGlow && this.player) {
      this.playerGlow.setPosition(this.player.x, this.player.y);
    }
    
    if (this.playerShadow && this.player) {
      this.playerShadow.setPosition(this.player.x, this.player.y + 50);
    }
    
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
      
      // Update glow elements position
      if (portal.glowRings) {
        portal.glowRings.setPosition(portal.x, portal.y);
      }
      if (portal.glowCircle) {
        portal.glowCircle.setPosition(portal.x, portal.y);
      }
      
      // Remove if off screen
      if (portal.x < -100) {
        if (portal.glowRings) {
          portal.glowRings.destroy();
        }
        if (portal.glowCircle) {
          portal.glowCircle.destroy();
        }
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
      const deltaSeconds = delta / 1000;
      console.log(`[RunnerScene.update] Calling onGameTick with delta: ${deltaSeconds}s, isGameActive: ${this.isGameActive}`);
      this.onGameTick(deltaSeconds);
    }
  }

  spawnPortal() {
    const { width, height } = this.scale;
    
    const portal = this.portals.create(width + 50, height - 100, 'portal');
    portal.setScale(0.8);
    portal.setSize(40, 80);
    
    // Create portal glow rings
    const rings = this.add.sprite(portal.x, portal.y, 'portal_rings');
    rings.setScale(0.8);
    rings.setBlendMode(Phaser.BlendModes.ADD);
    rings.alpha = 0.5;
    portal.glowRings = rings;
    
    // Portal pulsing glow
    const portalGlow = this.add.circle(portal.x, portal.y, 45, 0xff0000, 0.15);
    portalGlow.setBlendMode(Phaser.BlendModes.ADD);
    portal.glowCircle = portalGlow;
    
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
    
    // Rotate the glow rings
    this.tweens.add({
      targets: rings,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
    });
    
    // Pulse the glow circle (alpha only, no radius tweening)
    this.tweens.add({
      targets: portalGlow,
      alpha: { from: 0.3, to: 0.05 },
      duration: 600,
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
    
    // Clean up glow elements
    if (portal.glowRings) {
      portal.glowRings.destroy();
    }
    if (portal.glowCircle) {
      portal.glowCircle.destroy();
    }
    
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

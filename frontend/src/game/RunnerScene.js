import Phaser from 'phaser';
import playerSprite from '../assets/sprites/characters/player.png';
import demogorgonSprite from '../assets/sprites/characters/demogorgon.png';
import { ParticleMeshBackground } from './ParticleMeshBackground';

export default class RunnerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RunnerScene' });
    this.player = null;
    this.ground = null;
    this.portals = null;
    this.demogorgons = null;
    this.background = null;
    this.particleMeshBackground = null; // Add particle mesh background
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
    this.onDemogorgonHit = null;
    this.particles = null;
    this.ambientParticles = null;
    this.portalParticles = null;
    this.playerGlow = null;
    this.playerShadow = null;
    this.lastHitFlash = 0;
    this.lastEntityDestroyedTime = 0;
    this.entitySpawnDelay = 1500; // Delay before spawning next entity
    this.currentEntityType = null; // Track if 'portal' or 'demogorgon' is active
    this.lastSpawnedType = 'demogorgon'; // Start with portal (alternate from demogorgon)
  }

  init(data) {
    this.onPortalHit = data.onPortalHit || (() => {});
    this.onGameTick = data.onGameTick || (() => {});
    this.onDemogorgonHit = data.onDemogorgonHit || (() => {});
    this.currentSpeed = data.initialSpeed || 200;
    this.speedMultiplier = 1;
  }

  preload() {
    // Load player sprite sheet (horizontal strip with 8 frames)
    this.load.spritesheet('player', playerSprite, {
      frameWidth: 125,
      frameHeight: 250
    });
    
    // Load demogorgon sprite
    this.load.image('demogorgon', demogorgonSprite);
    
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
    
    // Background - dark gradient (set depth -2 so particle mesh can render on top)
    this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x050505);
    this.background.setDepth(-2);
    
    // Create particle mesh background (depth -1, in front of background but behind gameplay)
    this.particleMeshBackground = new ParticleMeshBackground(this, {
      particleCount: Phaser.Math.Between(50, 80),
      connectionThreshold: 100,
      scrollSpeed: 30,
      driftSpeed: 0.5,
      driftAmount: 20,
      particleColor: 0xff0000,
      lineColor: 0xff0000,
      baseAlpha: 0.4,
      lineBaseAlpha: 0.3
    });
    
    // Add atmospheric particles
    this.createAtmosphericParticles();
    
    // Create tiled ground
    this.groundTiles = [];
    const groundY = height - 50;
    for (let x = 0; x < width + 128; x += 64) {
      const tile = this.add.tileSprite(x, groundY, 64, 32, 'ground');
      this.groundTiles.push(tile);
    }
    
    // Physics ground - aligned with visual ground tiles
    this.ground = this.physics.add.staticGroup();
    const groundCollider = this.ground.create(width / 2, height - 45, null);
    groundCollider.body.setSize(width * 2, 50);
    groundCollider.setVisible(false);
    
    // Player shadow - use rectangle instead
    this.playerShadow = this.add.rectangle(150, height - 50, 40, 4, 0x000000, 0.5);
    
    // Player
    this.player = this.physics.add.sprite(150, height - 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);
    this.player.setGravityY(300);
    this.player.setScale(0.8); // Adjusted for new frame size
    
    // Track if player is touching ground for jumping
    this.isPlayerOnGround = false;
    
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
    
    // Demogorgons group
    this.demogorgons = this.physics.add.group({
      allowGravity: false,
    });
    
    // Collisions
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.overlap(this.player, this.portals, this.handlePortalCollision, null, this);
    this.physics.add.collider(this.player, this.demogorgons, this.handleDemogorgonCollision, null, this);
    
    // Setup keyboard input for jumping
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Initialize timers
    this.gameStartTime = this.time.now;
    this.lastPortalTime = this.time.now;
    this.lastSpeedIncreaseTime = this.time.now;
    this.lastEntityDestroyedTime = this.time.now;
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

    // Update particle mesh background
    if (this.particleMeshBackground) {
      this.particleMeshBackground.update(delta);
    }

    // Check if player is touching the ground
    this.isPlayerOnGround = this.player.body.touching.down;
    
    // Handle jumping with space bar - allow jump anytime
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      console.log('🚀 JUMP ACTIVATED - Player Y:', this.player.y.toFixed(2));
      this.player.setVelocityY(-450);
      this.lastJumpTime = time; // Track jump time for collision avoidance
    }

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
        this.currentEntityType = null;
        this.lastEntityDestroyedTime = time;
      }
    });
    
    // Move demogorgons
    this.demogorgons.getChildren().forEach(demogorgon => {
      demogorgon.x -= effectiveSpeed * (delta / 1000);
      
      // Remove if off screen
      if (demogorgon.x < -100) {
        demogorgon.destroy();
        this.currentEntityType = null;
        this.lastEntityDestroyedTime = time;
      }
    });
    
    // Spawn entities (portal or demogorgon) - only one at a time
    if (this.currentEntityType === null && time - this.lastEntityDestroyedTime > this.entitySpawnDelay) {
      // Alternate between portal and demogorgon
      if (this.lastSpawnedType === 'demogorgon') {
        this.spawnPortal();
        this.currentEntityType = 'portal';
        this.lastSpawnedType = 'portal';
      } else {
        this.spawnDemogorgon();
        this.currentEntityType = 'demogorgon';
        this.lastSpawnedType = 'demogorgon';
      }
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
    this.currentEntityType = null;
    this.lastEntityDestroyedTime = this.time.now;
    
    // Trigger portal hit callback
    if (this.onPortalHit) {
      this.onPortalHit();
    }
  }

  spawnDemogorgon() {
    const { width, height } = this.scale;
    
    const demogorgon = this.demogorgons.create(width + 50, height - 120, 'demogorgon');
    demogorgon.setScale(0.2);
    demogorgon.setSize(10, 12);
    
    // Add a pulsing scale effect
    this.tweens.add({
      targets: demogorgon,
      scaleX: { from: 0.2, to: 0.22 },
      scaleY: { from: 0.2, to: 0.22 },
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  handleDemogorgonCollision(player, demogorgon) {
    if (!this.isGameActive) return;
    
    // Check if player jumped recently (within 200ms) to avoid collision
    const currentTime = this.time.now;
    const lastJumpTime = this.lastJumpTime || 0;
    const jumpWindow = 200; // milliseconds
    
    if (currentTime - lastJumpTime < jumpWindow && player.body.velocity.y < 0) {
      // Player successfully jumped to avoid demogorgon - destroy demogorgon
      console.log('✨ JUMPED OVER DEMOGORGON! Collision avoided!');
      demogorgon.destroy();
      this.currentEntityType = null;
      this.lastEntityDestroyedTime = this.time.now;
      return;
    }
    
    // Collision not avoided - reduce score by 2
    console.log('💀 DEMOGORGON HIT! Score reduced by 2');
    demogorgon.destroy();
    this.currentEntityType = null;
    this.lastEntityDestroyedTime = this.time.now;
    
    // Trigger demogorgon hit callback to reduce score in GameContext
    if (this.onDemogorgonHit) {
      this.onDemogorgonHit();
    }
  }

  pauseGame() {
    this.isGameActive = false;
    if (this.particleMeshBackground) {
      this.particleMeshBackground.pause();
    }
    this.physics.pause();
    this.tweens.pauseAll();
  }

  resumeGame() {
    this.isGameActive = true;
    if (this.particleMeshBackground) {
      this.particleMeshBackground.resume();
    }
    this.physics.resume();
    this.tweens.resumeAll();
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
    if (this.particleMeshBackground) {
      this.particleMeshBackground.setSpeedMultiplier(multiplier);
    }
  }

  stopGame() {
    this.isGameActive = false;
    if (this.particleMeshBackground) {
      this.particleMeshBackground.destroy();
    }
    this.physics.pause();
    this.tweens.pauseAll();
  }
}

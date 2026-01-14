import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this.gameScene = null;
    this.gameData = {
      health: 3,
      score: 0,
      portalsCleared: 0,
      difficulty: 'EASY',
      timeLeft: '5:00',
      timeSurvived: '0:00',
    };
    this.updateCallback = null;
    this.healthHearts = [];
    this.scoreText = null;
    this.portalsText = null;
    this.timerText = null;
    this.diffText = null;
  }

  init(data) {
    this.updateCallback = data.updateCallback || (() => {});
    this.gameData = {
      ...this.gameData,
      ...data.gameData,
    };
  }

  preload() {
    this.createAssets();
  }

  createAssets() {
    // Create neon red frame (top)
    this.createTopFrame();
    
    // Create neon red frame (bottom)
    this.createBottomFrame();
    
    // Create health heart icon
    this.createHeartIcon();
    
    // Create score icon (lightning bolt)
    this.createScoreIcon();
    
    // Create portal icon (target)
    this.createPortalIcon();
    
    // Create time icon (clock)
    this.createTimeIcon();
    
    // Create glow texture
    this.createGlowTexture();
  }

  createTopFrame() {
    // Use dynamic width based on game scale
    const width = Math.max(800, this.scale.width);
    const height = 60;
    
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // Background
    graphics.fillStyle(0x000000, 0.9);
    graphics.fillRect(0, 0, width, height);

    // Top border - neon red
    graphics.lineStyle(3, 0xff0000, 1);
    graphics.lineBetween(0, 0, width, 0);

    // Bottom border - darker red
    graphics.lineStyle(2, 0x660000, 0.8);
    graphics.lineBetween(0, height, width, height);

    // Left accent
    graphics.lineStyle(2, 0xff0000, 0.6);
    graphics.lineBetween(0, 5, 40, 25);
    graphics.lineBetween(40, 25, 60, height - 5);

    // Right accent
    graphics.lineBetween(width - 60, height - 5, width - 40, 25);
    graphics.lineBetween(width - 40, 25, width, 5);

    // Corner glow circles
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillCircle(0, 0, 15);
    graphics.fillCircle(width, 0, 15);

    graphics.generateTexture('ui_frame_top', width, height);
    graphics.destroy();
  }

  createBottomFrame() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const width = 1024;
    const height = 50;

    // Background
    graphics.fillStyle(0x000000, 0.95);
    graphics.fillRect(0, 0, width, height);

    // Top border - darker red
    graphics.lineStyle(2, 0x660000, 0.8);
    graphics.lineBetween(0, 0, width, 0);

    // Bottom border - neon red
    graphics.lineStyle(3, 0xff0000, 1);
    graphics.lineBetween(0, height, width, height);

    // Left accent
    graphics.lineStyle(2, 0xff0000, 0.6);
    graphics.lineBetween(0, 5, 40, 25);
    graphics.lineBetween(40, 25, 60, height - 5);

    // Right accent
    graphics.lineBetween(width - 60, height - 5, width - 40, 25);
    graphics.lineBetween(width - 40, 25, width, 5);

    // Corner glow circles
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillCircle(0, height, 15);
    graphics.fillCircle(width, height, 15);

    graphics.generateTexture('ui_frame_bottom', width, height);
    graphics.destroy();
  }

  createHeartIcon() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Heart shape with glow
    graphics.fillStyle(0xff0000, 0.4);
    graphics.fillCircle(6, 6, 6);
    graphics.fillCircle(14, 6, 6);
    graphics.fillStyle(0xff0000, 0.5);
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(6, 4, 14, 4, 10, 15)
    );
    
    graphics.fillStyle(0xff2222, 0.8);
    graphics.fillCircle(6, 5, 4);
    graphics.fillCircle(14, 5, 4);
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(6, 4, 14, 4, 10, 12)
    );

    graphics.generateTexture('icon_heart', 20, 20);
    graphics.destroy();
  }

  createScoreIcon() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Lightning bolt
    graphics.fillStyle(0xffff00, 0.6);
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(10, 0, 6, 10, 10, 10)
    );
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(10, 10, 14, 10, 4, 20)
    );
    
    graphics.fillStyle(0xffff66, 1);
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(10, 2, 8, 9, 10, 9)
    );
    graphics.fillTriangleShape(
      new Phaser.Geom.Triangle(10, 9, 12, 9, 6, 18)
    );

    graphics.generateTexture('icon_score', 20, 20);
    graphics.destroy();
  }

  createPortalIcon() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Target/Portal circle
    graphics.lineStyle(2, 0xff0000, 0.6);
    graphics.strokeCircle(10, 10, 8);
    graphics.lineStyle(1.5, 0xff3333, 0.5);
    graphics.strokeCircle(10, 10, 5);
    
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillCircle(10, 10, 2);

    graphics.generateTexture('icon_portal', 20, 20);
    graphics.destroy();
  }

  createTimeIcon() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Clock circle
    graphics.lineStyle(2, 0xffff00, 0.8);
    graphics.strokeCircle(10, 10, 7);
    
    // Clock hands
    graphics.lineStyle(1.5, 0xffff66, 1);
    graphics.lineBetween(10, 10, 10, 5);
    graphics.lineBetween(10, 10, 14, 10);
    
    // Center dot
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(10, 10, 1.5);

    graphics.generateTexture('icon_time', 20, 20);
    graphics.destroy();
  }

  createGlowTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Radial glow
    for (let i = 10; i > 0; i--) {
      const alpha = (1 - i / 10) * 0.5;
      graphics.fillStyle(0xff0000, alpha);
      graphics.fillCircle(10, 10, i);
    }
    
    graphics.generateTexture('glow_texture', 20, 20);
    graphics.destroy();
  }

  create() {
    const { width, height } = this.scale;
    console.log('[UIScene] Creating with dimensions:', { width, height });

    // Top frame - with proper scaling
    const topFrameWidth = Math.max(800, width);
    const topFrame = this.add.image(0, 0, 'ui_frame_top');
    topFrame.setOrigin(0, 0);
    topFrame.setScrollFactor(0);
    topFrame.setDepth(1000);
    topFrame.setDisplaySize(width, 60);
    console.log('[UIScene] Top frame created:', topFrame);

    // Top HUD elements
    const topY = 15;
    const topX = 30;

    // Health section
    this.createHealthHUD(topX, topY);

    // Score section
    this.createScoreHUD(topX + 180, topY);

    // Portals section
    this.createPortalsHUD(topX + 380, topY);

    // Difficulty section
    this.createDifficultyHUD(topX + 580, topY);

    // Timer section
    this.createTimerHUD(width - 80, topY);

    // Center status text
    const centerStatusY = height / 2 - 10;
    const centerStatus = this.add.text(width / 2, centerStatusY, '// DIMENSION: UPSIDE DOWN // STATUS: UNSTABLE //', {
      fontFamily: 'monospace',
      fontSize: '16px',
      fill: '#ff0000',
      align: 'center',
      stroke: '#660000',
      strokeThickness: 2,
    });
    centerStatus.setOrigin(0.5);
    centerStatus.setScrollFactor(0);
    centerStatus.setDepth(1000);

    // Add glow tween to status text
    this.tweens.add({
      targets: centerStatus,
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Bottom frame
    const bottomFrame = this.add.image(0, height, 'ui_frame_bottom');
    bottomFrame.setOrigin(0, 1);
    bottomFrame.setScrollFactor(0);
    bottomFrame.setDepth(1000);
    bottomFrame.setDisplaySize(width, 50);

    // Bottom status bars
    this.createBottomStatusBars(width, height);

    // Update callback reference
    this.gameScene = this.scene.get('RunnerScene');
    
    // Start update loop
    this.startUpdateLoop();
  }

  createHealthHUD(x, y) {
    const label = this.add.text(x, y - 5, 'HEALTH', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fill: '#888888',
      align: 'left',
    });
    label.setScrollFactor(0);
    label.setDepth(1001);

    const heartContainer = this.add.container(x, y + 8);
    heartContainer.setScrollFactor(0);
    heartContainer.setDepth(1001);

    this.healthHearts = [];
    
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(i * 14, 0, 'icon_heart');
      heart.setDisplaySize(12, 12);
      heart.alpha = i < this.gameData.health ? 1 : 0.3;
      heart.tint = i < this.gameData.health ? 0xff0000 : 0x440000;
      
      if (i < this.gameData.health) {
        // Add glow
        const glow = this.add.image(i * 14, 0, 'glow_texture');
        glow.setDisplaySize(18, 18);
        glow.alpha = 0.3;
        glow.setBlendMode(Phaser.BlendModes.ADD);
        heartContainer.add(glow);
      }
      
      heartContainer.add(heart);
      this.healthHearts.push(heart);
    }
  }

  createScoreHUD(x, y) {
    const label = this.add.text(x, y - 5, 'SCORE', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fill: '#888888',
      align: 'left',
    });
    label.setScrollFactor(0);
    label.setDepth(1001);

    const icon = this.add.image(x, y + 8, 'icon_score');
    icon.setDisplaySize(12, 12);
    icon.setScrollFactor(0);
    icon.setDepth(1001);

    const scoreText = this.add.text(x + 18, y + 8, this.gameData.score.toString(), {
      fontFamily: 'monospace',
      fontSize: '14px',
      fill: '#ffff00',
      align: 'left',
      fontStyle: 'bold',
    });
    scoreText.setOrigin(0, 0.5);
    scoreText.setScrollFactor(0);
    scoreText.setDepth(1001);
    
    this.scoreText = scoreText;
  }

  createPortalsHUD(x, y) {
    const label = this.add.text(x, y - 5, 'PORTALS', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fill: '#888888',
      align: 'left',
    });
    label.setScrollFactor(0);
    label.setDepth(1001);

    const icon = this.add.image(x, y + 8, 'icon_portal');
    icon.setDisplaySize(12, 12);
    icon.setScrollFactor(0);
    icon.setDepth(1001);

    const portalsText = this.add.text(x + 18, y + 8, this.gameData.portalsCleared.toString(), {
      fontFamily: 'monospace',
      fontSize: '14px',
      fill: '#ff4444',
      align: 'left',
      fontStyle: 'bold',
    });
    portalsText.setOrigin(0, 0.5);
    portalsText.setScrollFactor(0);
    portalsText.setDepth(1001);
    
    this.portalsText = portalsText;
  }

  createDifficultyHUD(x, y) {
    const label = this.add.text(x, y - 5, 'DIFFICULTY', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fill: '#888888',
      align: 'left',
    });
    label.setScrollFactor(0);
    label.setDepth(1001);

    const diffColor = this.gameData.difficulty === 'HARD' ? '#ff0000' : 
                      this.gameData.difficulty === 'MEDIUM' ? '#ffaa00' : '#00ff00';

    const diffText = this.add.text(x, y + 8, this.gameData.difficulty, {
      fontFamily: 'monospace',
      fontSize: '14px',
      fill: diffColor,
      align: 'left',
      fontStyle: 'bold',
    });
    diffText.setScrollFactor(0);
    diffText.setDepth(1001);
    
    this.diffText = diffText;
  }

  createTimerHUD(x, y) {
    const icon = this.add.image(x - 20, y + 8, 'icon_time');
    icon.setDisplaySize(12, 12);
    icon.setScrollFactor(0);
    icon.setDepth(1001);

    const timerText = this.add.text(x, y + 8, this.gameData.timeLeft, {
      fontFamily: 'monospace',
      fontSize: '14px',
      fill: '#ffff00',
      align: 'left',
      fontStyle: 'bold',
    });
    timerText.setOrigin(0, 0.5);
    timerText.setScrollFactor(0);
    timerText.setDepth(1001);
    
    this.timerText = timerText;
  }

  createBottomStatusBars(width, height) {
    const bottomY = height - 18;
    const spacing = width / 3;

    // Left: AUTO-RUN ENGAGED
    const autoRunText = this.add.text(spacing / 2, bottomY, '◇ AUTO-RUN ENGAGED', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fill: '#ff0000',
      align: 'center',
      fontStyle: 'bold',
    });
    autoRunText.setOrigin(0.5);
    autoRunText.setScrollFactor(0);
    autoRunText.setDepth(1001);

    // Center: PORTAL ANOMALIES DETECTED
    const anomalyText = this.add.text(width / 2, bottomY, '▲ PORTAL ANOMALIES DETECTED', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fill: '#ff0000',
      align: 'center',
      fontStyle: 'bold',
    });
    anomalyText.setOrigin(0.5);
    anomalyText.setScrollFactor(0);
    anomalyText.setDepth(1001);

    // Right: SURVIVAL MODE ACTIVE
    const survivalText = this.add.text(spacing * 1.5, bottomY, '■ SURVIVAL MODE ACTIVE', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fill: '#ff0000',
      align: 'center',
      fontStyle: 'bold',
    });
    survivalText.setOrigin(0.5);
    survivalText.setScrollFactor(0);
    survivalText.setDepth(1001);

    // Add pulsing glow effect to all
    [autoRunText, anomalyText, survivalText].forEach(text => {
      this.tweens.add({
        targets: text,
        alpha: { from: 0.7, to: 1 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  startUpdateLoop() {
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.updateCallback) {
          this.updateCallback();
        }
        this.updateHUD();
      },
    });
  }

  updateHUD() {
    // This will be called to sync with game data
    // Update will be handled through the updateGameData method
  }

  updateGameData(gameData) {
    this.gameData = { ...this.gameData, ...gameData };
    
    if (this.scoreText) {
      this.scoreText.setText(gameData.score?.toString() || this.gameData.score.toString());
    }
    
    if (this.portalsText) {
      this.portalsText.setText(gameData.portalsCleared?.toString() || this.gameData.portalsCleared.toString());
    }
    
    if (this.timerText) {
      this.timerText.setText(gameData.timeLeft || this.gameData.timeLeft);
    }

    if (this.diffText && gameData.difficulty) {
      const diffColor = gameData.difficulty === 'HARD' ? '#ff0000' : 
                        gameData.difficulty === 'MEDIUM' ? '#ffaa00' : '#00ff00';
      this.diffText.setFill(diffColor);
      this.diffText.setText(gameData.difficulty);
    }
  }

  updateHealth(health) {
    this.gameData.health = health;
    // Health is now updated via updateGameData instead of restart
    if (this.healthHearts) {
      this.healthHearts.forEach((heart, i) => {
        if (i < health) {
          heart.setAlpha(1);
          heart.setTint(0xff0000);
        } else {
          heart.setAlpha(0.3);
          heart.setTint(0x440000);
        }
      });
    }
  }
}

/**
 * ParticleMeshBackground - Dynamic triangular particle mesh background
 * 
 * Features:
 * - 50-80 small moving particles (circles)
 * - Infinite vertical scrolling (wraps at top)
 * - Subtle horizontal sine-wave drift
 * - Lines between particles within threshold distance (100px)
 * - Line opacity decreases with distance
 * - GPU-friendly and non-distracting
 * 
 * This is designed to be integrated into Phaser scenes
 */

export class ParticleMeshBackground {
  constructor(scene, config = {}) {
    this.scene = scene;
    
    // Configuration
    this.particleCount = config.particleCount || Phaser.Math.Between(50, 80);
    this.connectionThreshold = config.connectionThreshold || 100;
    this.scrollSpeed = config.scrollSpeed || 30; // pixels per second
    this.driftSpeed = config.driftSpeed || 0.5; // sine wave frequency
    this.driftAmount = config.driftAmount || 20; // max horizontal offset
    this.particleColor = config.particleColor || 0xff0000;
    this.lineColor = config.lineColor || 0xff0000;
    this.baseAlpha = config.baseAlpha || 0.4;
    this.lineBaseAlpha = config.lineBaseAlpha || 0.3;
    
    // State
    this.particles = [];
    this.lines = [];
    this.canvas = null;
    this.graphics = null;
    this.time = 0;
    this.isActive = true;
    
    this.init();
  }

  init() {
    const { width, height } = this.scene.scale;
    
    // Create a graphics object for rendering the mesh
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(-1); // Render between background and gameplay
    
    // Initialize particles in a grid pattern with some randomness
    this.createParticles(width, height);
  }

  createParticles(width, height) {
    const cols = Math.ceil(Math.sqrt(this.particleCount));
    const rows = Math.ceil(this.particleCount / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    let particleIndex = 0;
    
    for (let row = 0; row < rows && particleIndex < this.particleCount; row++) {
      for (let col = 0; col < cols && particleIndex < this.particleCount; col++) {
        const x = col * cellWidth + Phaser.Math.Between(-cellWidth * 0.3, cellWidth * 0.3);
        const y = row * cellHeight + Phaser.Math.Between(-cellHeight * 0.3, cellHeight * 0.3);
        
        this.particles.push({
          x: Phaser.Math.Clamp(x, 0, width),
          y: Phaser.Math.Clamp(y, 0, height),
          vx: Phaser.Math.Between(-10, 10), // slight horizontal velocity variation
          vy: -this.scrollSpeed, // vertical scroll velocity
          radius: Phaser.Math.Between(2, 4),
          driftPhase: Phaser.Math.Between(0, Math.PI * 2),
          originalX: x
        });
        
        particleIndex++;
      }
    }
  }

  update(delta) {
    if (!this.isActive) return;
    
    const { width, height } = this.scene.scale;
    const deltaSeconds = delta / 1000;
    
    this.time += deltaSeconds;
    
    // Update particle positions
    this.particles.forEach(particle => {
      // Vertical scroll
      particle.y += particle.vy * deltaSeconds;
      
      // Wrap around at top
      if (particle.y < -20) {
        particle.y = height + 20;
      }
      
      // Horizontal sine-wave drift
      const drift = Math.sin(this.time * this.driftSpeed + particle.driftPhase) * this.driftAmount;
      particle.x = particle.originalX + drift;
      
      // Keep within bounds horizontally
      if (particle.x < -20) {
        particle.x = width + 20;
        particle.originalX = particle.x;
      } else if (particle.x > width + 20) {
        particle.x = -20;
        particle.originalX = particle.x;
      }
    });
    
    // Render particles and connections
    this.render(width, height);
  }

  render(width, height) {
    // Clear previous render
    this.graphics.clear();
    
    // Draw connections (lines between particles)
    this.particles.forEach((p1, i) => {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const distance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        
        if (distance < this.connectionThreshold) {
          // Calculate opacity based on distance
          const maxOpacity = this.lineBaseAlpha;
          const opacity = maxOpacity * (1 - distance / this.connectionThreshold);
          
          // Draw line with gradient opacity
          this.graphics.lineStyle(1, this.lineColor, opacity);
          this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
      }
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      this.graphics.fillStyle(this.particleColor, this.baseAlpha);
      this.graphics.fillCircle(particle.x, particle.y, particle.radius);
    });
  }

  pause() {
    this.isActive = false;
  }

  resume() {
    this.isActive = true;
  }

  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
    this.particles = [];
    this.lines = [];
    this.isActive = false;
  }

  setSpeedMultiplier(multiplier) {
    this.particles.forEach(particle => {
      particle.vy = -this.scrollSpeed * multiplier;
    });
  }
}

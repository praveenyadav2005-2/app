# Game Assets Folder Structure

This folder contains all sprite assets for the Enigma game.

## Folder Structure

```
src/assets/
├── sprites/
│   ├── player.png              # Player character sprite (32x48px)
│   ├── player-glow.png         # Player glow/outline (32x48px)
│   ├── portal.png              # Portal sprite (80x100px)
│   ├── portal-rings.png        # Portal rotating rings (80x100px)
│   ├── ground.png              # Ground tile texture (64x32px)
│   │
│   ├── icons/
│   │   ├── heart.png           # Health heart icon (32x32px)
│   │   ├── lightning.png       # Score/energy icon (32x32px)
│   │   ├── portal.png          # Portal counter icon (32x32px)
│   │   └── clock.png           # Timer icon (32x32px)
│   │
│   └── ui/
│       ├── frame-top.png       # Top HUD frame border (variable width x 60px)
│       └── frame-bottom.png    # Bottom status bar frame (variable width x 50px)
```

## Image Specifications

### Character Sprites
- **player.png**: 32x48px, pixel art character
- **player-glow.png**: 32x48px, red glowing outline (additive blend)

### Portal Sprites
- **portal.png**: 80x100px, glowing red portal with inner glow
- **portal-rings.png**: 80x100px, rotating concentric rings

### Environment
- **ground.png**: 64x32px, dark red ground tile (tiles horizontally)

### UI Icons (all 32x32px with transparency)
- **heart.png**: Red glowing heart (health)
- **lightning.png**: Yellow lightning bolt (score)
- **portal.png**: Red target/portal reticle (portals cleared)
- **clock.png**: Yellow clock face (timer)

### UI Frames
- **frame-top.png**: Full width x 60px, neon red border (scales to fit width)
- **frame-bottom.png**: Full width x 50px, neon red border (scales to fit width)

## How to Add Images

1. Create or download your PNG images matching the specifications above
2. Place them in the corresponding folders
3. The game will automatically load them
4. If images are missing, the game falls back to procedurally generated graphics

## Recommended Sources

- **Kenney.nl** - Free game art with sci-fi packs
- **OpenGameArt.org** - Community game art
- **Itch.io** - Search for "sci-fi UI pack" or "neon UI pack"
- **Aseprite/GIMP** - Create custom pixel art

## Notes

- Keep all images as PNG with transparency (alpha channel)
- Use power-of-2 sizes where possible (32, 64, 128, etc.)
- For glowing effects, use additive blending in Phaser
- Icons should have clear edges with some glow/shadow

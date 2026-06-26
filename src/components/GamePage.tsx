import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { PlayerState, Level, AfterImage, Bullet } from '../types';
import { LEVELS } from '../levels';
import { drawPlayer, drawSkeleton, drawBullet } from './sprites';
import {
  drawBackground, drawPlatform, drawDoor, drawTrigger,
  drawCollectible, drawDecoration, drawLighting
} from './worldRenderer';

// ==============================
// Game Constants
// ==============================
const GRAVITY = 1400;
const JUMP_FORCE = -520;
const MOVE_SPEED = 280;
const FRICTION = 0.82;
const TORCH_RADIUS = 220;

// Dash
const DASH_SPEED = 900;
const DASH_DURATION = 0.15; // seconds
const DASH_COOLDOWN = 0.8;

// Animation timing (ms)
const ANIM_IDLE_SPEED = 500;
const ANIM_WALK_SPEED = 120;
const ANIM_DASH_SPEED = 80;

// ==============================
// Chroma-Key Transparency Helper
// ==============================
function processChromaKey(srcUrl: string, targetColorHex: string): Promise<HTMLCanvasElement | HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = srcUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(img);
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Parse hex color
        const rTarget = parseInt(targetColorHex.slice(1, 3), 16);
        const gTarget = parseInt(targetColorHex.slice(3, 5), 16);
        const bTarget = parseInt(targetColorHex.slice(5, 7), 16);
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Color distance threshold (40 to catch compression noise)
          const dist = Math.sqrt((r - rTarget) ** 2 + (g - gTarget) ** 2 + (b - bTarget) ** 2);
          if (dist < 40) {
            data[i + 3] = 0; // Alpha = 0 (transparent)
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas);
      } catch (e) {
        console.error("Failed to process image data: ", e);
        resolve(img);
      }
    };
    img.onerror = () => {
      resolve(img);
    };
  });
}

function cloneLevels(): Level[] {
  return JSON.parse(JSON.stringify(LEVELS));
}

function createPlayer(level: Level): PlayerState {
  return {
    x: level.entrance.x,
    y: level.entrance.y,
    width: 24,
    height: 38,
    vx: 0,
    vy: 0,
    grounded: false,
    direction: 1,
    animState: 'idle',
    animFrame: 0,
    animTimer: 0,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    canAirDash: true,
    dashInvincible: false,
    hasDoubleJumped: false,
    jumpReleased: true,
    bullets: 6,
    afterimages: [],
  };
}

interface GamePageProps {
  onExit: () => void;
}

export default function GamePage({ onExit }: GamePageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'win' | 'lost'>('playing');
  const [levelIndex, setLevelIndex] = useState(0);
  const [collected, setCollected] = useState(0);
  const [showHint, setShowHint] = useState('');
  const [bookOpen, setBookOpen] = useState(false);
  const [bookPage, setBookPage] = useState(1);
  const [transitioning, setTransitioning] = useState(false);

  const bgImagesRef = useRef<{
    far: HTMLImageElement | HTMLCanvasElement | null;
    mid: HTMLImageElement | HTMLCanvasElement | null;
    fore: HTMLImageElement | HTMLCanvasElement | null;
    libFar: HTMLImageElement | HTMLCanvasElement | null;
    libMid: HTMLImageElement | HTMLCanvasElement | null;
    libFore: HTMLImageElement | HTMLCanvasElement | null;
  }>({
    far: null,
    mid: null,
    fore: null,
    libFar: null,
    libMid: null,
    libFore: null,
  });

  const gameRef = useRef({
    player: createPlayer(LEVELS[0]),
    camera: { x: 0, y: 0 },
    keys: {} as Record<string, boolean>,
    levels: cloneLevels(),
    level: null as Level | null,
    totalCollected: 0,
    hintTimer: 0,
    bullets: [] as Bullet[],
    shootCooldown: 0,
    journeyStarted: false,
  });

  // Initialize level ref and preload background assets
  useEffect(() => {
    gameRef.current.level = gameRef.current.levels[0];
    // Show library welcome hint
    setShowHint('Walk to the glowing journal on the desk and pick it up');
    gameRef.current.hintTimer = 6;

    // Standard ruins backgrounds
    const farImg = new Image();
    const baseUrl = import.meta.env.BASE_URL;
    farImg.src = baseUrl + 'bg_far.png';
    farImg.onload = () => { bgImagesRef.current.far = farImg; };
    processChromaKey(baseUrl + 'bg_mid.png', '#ffffff').then((canvas) => { bgImagesRef.current.mid = canvas; });
    processChromaKey(baseUrl + 'bg_fore.png', '#ffffff').then((canvas) => { bgImagesRef.current.fore = canvas; });
  }, []);

  const resetPlayer = useCallback((lvlIndex: number) => {
    const levels = cloneLevels();
    gameRef.current.levels = levels;
    const level = levels[lvlIndex];
    gameRef.current.level = level;
    gameRef.current.player = createPlayer(level);
    gameRef.current.camera = { x: 0, y: 0 };
    gameRef.current.totalCollected = 0;
    gameRef.current.hintTimer = 0;
    gameRef.current.bullets = [];
    gameRef.current.shootCooldown = 0;
    setCollected(0);
    setShowHint('');
  }, []);

  const startGame = useCallback(() => {
    setLevelIndex(0);
    resetPlayer(0);
    setGameState('playing');
    setShowHint('Arrow keys to move, Space to jump/double-jump, L to dash, J to shoot');
    gameRef.current.hintTimer = 5;
  }, [resetPlayer]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      gameRef.current.keys[e.code] = true;
      if (e.code === 'Escape') onExit();
    };
    const up = (e: KeyboardEvent) => { gameRef.current.keys[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [onExit]);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ==============================
  // GAME LOOP
  // ==============================
  useGameLoop((dt) => {
    if (gameState !== 'playing' || bookOpen || transitioning) return;
    const { player, keys, level, camera, bullets } = gameRef.current;
    if (!level) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Hint timer ---
    if (gameRef.current.hintTimer > 0) {
      gameRef.current.hintTimer -= dt;
      if (gameRef.current.hintTimer <= 0) setShowHint('');
    }

    if (gameRef.current.shootCooldown > 0) gameRef.current.shootCooldown -= dt;

    // --- Shooting Logic ---
    if (keys['KeyJ'] && gameRef.current.shootCooldown <= 0 && player.bullets > 0) {
      player.bullets--;
      gameRef.current.shootCooldown = 0.5; // Half second between shots
      bullets.push({
        id: Math.random().toString(36).substr(2, 9),
        x: player.x + (player.direction === 1 ? player.width : 0),
        y: player.y + 12,
        direction: player.direction,
        speed: 1200,
        active: true
      });
      keys['KeyJ'] = false; // Prevent rapid fire
    }

    // --- Update Bullets ---
    bullets.forEach(b => {
      if (!b.active) return;
      b.x += b.speed * b.direction * dt;
      
      // Check walls
      const hitWall = level.platforms.some(p => 
        b.x > p.x && b.x < p.x + p.w && b.y > p.y && b.y < p.y + p.h
      );
      if (hitWall || b.x < camera.x - 100 || b.x > camera.x + 1000) {
        b.active = false;
      }
    });

    // --- Dash cooldown ---
    if (player.dashCooldown > 0) player.dashCooldown -= dt;

    // --- Dash logic ---
    if (player.isDashing) {
      player.dashTimer -= dt;
      if (player.dashTimer <= 0) {
        player.isDashing = false;
        player.dashInvincible = false;
        player.vx = player.direction * MOVE_SPEED * 0.5;
      } else {
        player.vx = player.direction * DASH_SPEED;
        player.vy = 0;
        // Spawn afterimage
        if (player.afterimages.length < 5) {
          player.afterimages.push({
            x: player.x,
            y: player.y,
            direction: player.direction,
            alpha: 0.5,
            animState: 'dash',
            animFrame: player.animFrame,
          });
        }
      }
    } else {
      // --- Normal Movement ---
      const BASE_SPEED = 120; // Starts slow for micro-movements
      const ACCEL = 400;      // Ramps up gradually
      const MAX_SPEED = 320;  // Capped speed to prevent zooming past platforms

      if (keys['ArrowLeft'] || keys['KeyA']) {
        if (player.vx > 0) player.vx *= 0.5; // Responsive snappy turn
        if (player.vx > -BASE_SPEED) {
          player.vx = -BASE_SPEED;
        } else {
          player.vx -= ACCEL * dt;
        }
        if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;
        player.direction = -1;
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
        if (player.vx < 0) player.vx *= 0.5; // Responsive snappy turn
        if (player.vx < BASE_SPEED) {
          player.vx = BASE_SPEED;
        } else {
          player.vx += ACCEL * dt;
        }
        if (player.vx > MAX_SPEED) player.vx = MAX_SPEED;
        player.direction = 1;
      }

      // Jump & Double Jump
      const jumpKeyPressed = keys['ArrowUp'] || keys['Space'] || keys['KeyW'];
      if (!jumpKeyPressed) {
        player.jumpReleased = true;
      }

      if (jumpKeyPressed) {
        if (player.grounded) {
          player.vy = JUMP_FORCE;
          player.grounded = false;
          player.hasDoubleJumped = false;
          player.jumpReleased = false;
          player.canAirDash = true;
        } else if (player.jumpReleased && !player.hasDoubleJumped) {
          player.vy = JUMP_FORCE;
          player.hasDoubleJumped = true;
          player.jumpReleased = false;
        }
      }

      // Dash trigger (L key)
      if (keys['KeyL'] && player.dashCooldown <= 0) {
        const canDash = player.grounded || player.canAirDash;
        if (canDash) {
          player.isDashing = true;
          player.dashTimer = DASH_DURATION;
          player.dashCooldown = DASH_COOLDOWN;
          player.dashInvincible = true;
          if (!player.grounded) player.canAirDash = false;
          player.afterimages = [];
          keys['KeyL'] = false;
        }
      }

      // Gravity
      player.vy += GRAVITY * dt;
    }

    // Friction
    if (!player.isDashing) {
      const isMoving = (keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD']);
      if (!isMoving) player.vx *= FRICTION;
    }

    // Move
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // --- Afterimage fade ---
    player.afterimages = player.afterimages
      .map(a => ({ ...a, alpha: a.alpha - dt * 3 }))
      .filter(a => a.alpha > 0);

    // --- Animation state ---
    const prevAnimState = player.animState;
    if (player.isDashing) {
      player.animState = 'dash';
    } else if (!player.grounded) {
      player.animState = player.vy < 0 ? 'jump_rise' : 'jump_fall';
    } else if (Math.abs(player.vx) > 20) {
      player.animState = 'walk';
    } else {
      player.animState = 'idle';
    }

    if (player.animState !== prevAnimState) {
      player.animFrame = 0;
      player.animTimer = 0;
    }

    player.animTimer += dt * 1000;
    if (player.animState === 'dash') {
      if (player.animTimer > ANIM_DASH_SPEED) {
        player.animFrame = (player.animFrame + 1) % 2;
        player.animTimer = 0;
      }
    } else if (player.animState === 'jump_rise' || player.animState === 'jump_fall') {
      player.animFrame = 0;
    } else if (player.animState === 'walk') {
      if (player.animTimer > ANIM_WALK_SPEED) {
        player.animFrame = (player.animFrame + 1) % 4;
        player.animTimer = 0;
      }
    } else { // idle
      if (player.animTimer > ANIM_IDLE_SPEED) {
        player.animFrame = (player.animFrame + 1) % 2;
        player.animTimer = 0;
      }
    }

    // --- Platform collision ---
    player.grounded = false;

    // Door collision (closed doors act as platforms)
    const allSolids = [
      ...level.platforms.map(p => ({ x: p.x, y: p.y, w: p.w, h: p.h })),
      ...level.doors.filter(d => {
        // Only solid if it's not open AND the player is not currently inside it (failsafe door safety)
        const playerInDoor = player.x < d.x + d.w && player.x + player.width > d.x &&
                             player.y < d.y + d.h && player.y + player.height > d.y;
        return (!d.open || d.openProgress < 0.9) && !playerInDoor;
      }).map(d => {
        const drawH = d.h * (1 - d.openProgress);
        return { x: d.x, y: d.y + (d.h - drawH), w: d.w, h: drawH };
      }),
    ];

    allSolids.forEach(plat => {
      const pRight = player.x + player.width;
      const pBottom = player.y + player.height;
      const platRight = plat.x + plat.w;
      const platBottom = plat.y + plat.h;

      if (player.x < platRight && pRight > plat.x && player.y < platBottom && pBottom > plat.y) {
        const overlapX = Math.min(pRight - plat.x, platRight - player.x);
        const overlapY = Math.min(pBottom - plat.y, platBottom - player.y);

        if (overlapX > overlapY) {
          if (player.vy > 0) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.grounded = true;
            player.canAirDash = true;
            player.hasDoubleJumped = false;
          } else if (player.vy < 0) {
            player.y = plat.y + plat.h;
            player.vy = 0;
          }
        } else {
          if (player.vx > 0) player.x = plat.x - player.width;
          else if (player.vx < 0) player.x = plat.x + plat.w;
          player.vx = 0;
        }
      }
    });

    // --- Fall death ---
    if (player.y > 700) {
      setGameState('lost');
      return;
    }

    // --- Trigger checks ---
    level.triggers.forEach(trigger => {
      const tr = trigger.rect;
      const touching = player.x < tr.x + tr.w && player.x + player.width > tr.x &&
                        player.y < tr.y + tr.h && player.y + player.height > tr.y;

      if (trigger.type === 'pressure_plate') {
        const wasTouching = trigger.activated;
        trigger.activated = touching;
        if (touching && !wasTouching) {
          const door = level.doors.find(d => d.id === trigger.linkedDoorId);
          if (door) door.open = true;
        } else if (!touching && wasTouching && !trigger.persistent) {
          const door = level.doors.find(d => d.id === trigger.linkedDoorId);
          if (door) door.open = false;
        }
      }

      if (trigger.type === 'lever' && touching && !trigger.activated) {
        trigger.activated = true;
        const door = level.doors.find(d => d.id === trigger.linkedDoorId);
        if (door) door.open = true;
        setShowHint('Lever activated!');
        gameRef.current.hintTimer = 2;
      }

      if (trigger.type === 'exit' && touching && !trigger.activated) {
        // Block exit in library until journey is started
        if (level.type === 'library' && !gameRef.current.journeyStarted) {
          setShowHint('Find the journal on the desk first!');
          gameRef.current.hintTimer = 2;
          return;
        }
        trigger.activated = true;
        setTransitioning(true);
        setTimeout(() => {
          setTransitioning(false);
          const nextIdx = levelIndex + 1;
          if (nextIdx < LEVELS.length) {
            setLevelIndex(nextIdx);
            resetPlayer(nextIdx);
            setShowHint(`Level ${nextIdx + 1}: ${LEVELS[nextIdx].name}`);
            gameRef.current.hintTimer = 3;
          } else {
            setGameState('win');
          }
        }, 1500);
      }
    });

    // --- Door animation ---
    level.doors.forEach(door => {
      // Check if player is intersecting the door's bounding box
      const playerInDoor = player.x < door.x + door.w && player.x + player.width > door.x &&
                           player.y < door.y + door.h && player.y + player.height > door.y;
      
      const shouldOpen = door.open || playerInDoor;

      if (shouldOpen && door.openProgress < 1) {
        door.openProgress = Math.min(1, door.openProgress + dt * 2.5);
      } else if (!shouldOpen && door.openProgress > 0) {
        door.openProgress = Math.max(0, door.openProgress - dt * 2.5);
      }
    });

    // --- Collectibles ---
    level.collectibles.forEach(item => {
      if (item.collected) return;
      const dist = Math.hypot(player.x - item.x, player.y - item.y);
      if (dist < 30) {
        item.collected = true;
        if (item.type === 'ammo_refill') {
          player.bullets = Math.min(6, player.bullets + 1);
          setShowHint('Found 1 Bullet');
          gameRef.current.hintTimer = 2;
          return;
        }
        if (item.type === 'journal') {
          setBookOpen(true);
          return;
        }
        gameRef.current.totalCollected++;
        setCollected(gameRef.current.totalCollected);
        const names: Record<string, string> = {
          olive_branch: 'Olive Branch', golden_apple: 'Golden Apple',
          amphora: 'Amphora', golden_fleece: 'THE GOLDEN FLEECE!'
        };
        setShowHint(`Found: ${names[item.type] || item.type}`);
        gameRef.current.hintTimer = 2;
      }
    });

    // --- Enemy movement & collision ---
    level.enemies.forEach(enemy => {
      if (!enemy.alive) return;

      enemy.x += enemy.speed * dt;
      if (enemy.x > enemy.end || enemy.x < enemy.start) enemy.speed *= -1;
      enemy.animTimer += dt * 1000;
      if (enemy.animTimer > 250) {
        enemy.animFrame = (enemy.animFrame + 1) % 4;
        enemy.animTimer = 0;
      }

      // Check bullet collision
      bullets.forEach(b => {
        if (b.active && b.x > enemy.x && b.x < enemy.x + enemy.w && b.y > enemy.y && b.y < enemy.y + enemy.h) {
          b.active = false;
          enemy.alive = false;
        }
      });

      if (!player.dashInvincible && enemy.alive) {
        if (player.x < enemy.x + enemy.w && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.h && player.y + player.height > enemy.y) {
          setGameState('lost');
        }
      }
    });

    // --- Camera ---
    const targetCamX = Math.max(0, player.x - canvas.width / 3);
    camera.x += (targetCamX - camera.x) * 0.08;

    // --- DRAW ---
    draw();
  });

  // ==============================
  // DRAWING
  // ==============================
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { player, camera, level } = gameRef.current;
    if (!level) return;

    const W = canvas.width;
    const H = canvas.height;

    // Scale to fit game world (base height 520)
    const scale = H / 520;
    ctx.save();
    ctx.scale(scale, scale);
    const scaledW = W / scale;
    const scaledH = H / scale;

    // 1. Background
    const bgSet = level.type === 'library' 
      ? { far: bgImagesRef.current.libFar, mid: bgImagesRef.current.libMid, fore: bgImagesRef.current.libFore }
      : { far: bgImagesRef.current.far, mid: bgImagesRef.current.mid, fore: bgImagesRef.current.fore };

    drawBackground(ctx, level, camera.x, scaledW, scaledH, bgSet);

    // 2. Decorations (behind everything)
    level.decorations.forEach(d => drawDecoration(ctx, d, camera.x));

    // 3. Platforms
    level.platforms.forEach(p => drawPlatform(ctx, p, camera.x));

    // 4. Doors
    level.doors.forEach(d => drawDoor(ctx, d, camera.x));

    // 5. Triggers
    level.triggers.forEach(t => {
      if (t.type !== 'exit' || !t.activated) drawTrigger(ctx, t, camera.x);
    });

    // 6. Collectibles
    level.collectibles.forEach(c => drawCollectible(ctx, c, camera.x));

    // 7. Enemies
    level.enemies.forEach(e => {
      if (e.alive) drawSkeleton(ctx, e.x - camera.x, e.y, e.w, e.h, e.animFrame, e.speed);
    });

    // Bullets
    gameRef.current.bullets.forEach(b => drawBullet(ctx, b, camera.x));

    // 8. Player
    drawPlayer(ctx, player, camera.x);

    // 9. Lighting
    drawLighting(ctx, player.x - camera.x, player.y, player.direction, scaledW, scaledH, TORCH_RADIUS);

    ctx.restore();
  };

  // ==============================
  // UI OVERLAYS
  // ==============================
  return (
    <div className="game-fullscreen" style={{ cursor: gameState === 'playing' ? 'none' : 'default' }}>
      <canvas ref={canvasRef} />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className="game-hud">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              background: 'rgba(45, 36, 31, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '10px 18px',
              borderLeft: '3px solid #d4a843',
              fontFamily: '"Cinzel", serif',
            }}>
              <div style={{ fontSize: '9px', color: '#a68b6c', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
                {LEVELS[levelIndex]?.name || 'Unknown'}
              </div>
              <div style={{ fontSize: '11px', color: '#f4e8d8', letterSpacing: '0.1em' }}>
                ✦ {collected} collected | ⌖ {gameRef.current.player.bullets}/6 Bullets
              </div>
            </div>

            {/* Dash cooldown indicator */}
            <div style={{
              background: 'rgba(10, 10, 15, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRight: '3px solid #c45b3c',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px',
              color: gameRef.current.player.dashCooldown <= 0 ? '#6b7c3e' : '#8b3a25',
              letterSpacing: '0.1em',
            }}>
              DASH [{gameRef.current.player.dashCooldown <= 0 ? 'READY' : '...'}]
            </div>
          </div>

          {/* Hint message */}
          {showHint && (
            <div style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10, 10, 15, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '10px 24px',
              border: '1px solid rgba(212, 168, 67, 0.3)',
              fontFamily: '"Cinzel", serif',
              fontSize: '13px',
              color: '#f0d68a',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {showHint}
            </div>
          )}

          {/* Controls hint */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '20px',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: 'rgba(212, 168, 67, 0.25)',
            letterSpacing: '0.1em',
          }}>
            ESC to exit
          </div>
        </div>
      )}

            {/* BOOK OVERLAY */}
      {bookOpen && (
        <div className="game-overlay" style={{ background: 'rgba(12, 8, 4, 0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            maxWidth: bookPage === 2 ? '820px' : '680px',
            width: '90%',
            background: 'linear-gradient(135deg, #2a1a0e 0%, #1a0f06 100%)',
            border: '3px solid #8b6914',
            boxShadow: '0 0 60px rgba(212,168,67,0.25), inset 0 0 40px rgba(0,0,0,0.5)',
            padding: bookPage === 2 ? '28px' : '48px 56px',
            position: 'relative',
          }}>
            {/* Corner ornaments */}
            {(['topLeft','topRight','bottomLeft','bottomRight'] as const).map((pos) => (
              <div key={pos} style={{
                position: 'absolute',
                width: '24px', height: '24px',
                borderColor: '#8b6914',
                borderStyle: 'solid',
                borderWidth: '0',
                borderTopWidth: pos.startsWith('top') ? '2px' : '0',
                borderBottomWidth: pos.startsWith('bottom') ? '2px' : '0',
                borderLeftWidth: pos.endsWith('Left') ? '2px' : '0',
                borderRightWidth: pos.endsWith('Right') ? '2px' : '0',
                top: pos.startsWith('top') ? '10px' : 'auto',
                bottom: pos.startsWith('bottom') ? '10px' : 'auto',
                left: pos.endsWith('Left') ? '10px' : 'auto',
                right: pos.endsWith('Right') ? '10px' : 'auto',
              }} />
            ))}

            {bookPage === 1 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', justifyContent: 'center' }}>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #8b6914)' }} />
                  <span style={{ color: '#8b6914', fontSize: '18px' }}>✦</span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #8b6914, transparent)' }} />
                </div>
                <p style={{ fontFamily: '"Cinzel", serif', fontSize: '11px', color: '#8b6914', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Personal Journal — E. Kaladze
                </p>
                <h2 style={{ fontFamily: '"Cinzel", serif', color: '#f0d68a', fontSize: '34px', marginBottom: '6px', letterSpacing: '0.08em', textShadow: '0 0 20px rgba(212,168,67,0.4)' }}>
                  Tbilisi, 1938
                </h2>
                <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '13px', color: '#8b6914', fontStyle: 'italic', marginBottom: '32px' }}>
                  — University Archives, October 14th —
                </p>
                <div style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '22px',
                  color: '#f4e4c8',
                  lineHeight: '1.85',
                  textAlign: 'justify',
                  textIndent: '2em',
                  borderLeft: '2px solid rgba(139,105,20,0.3)',
                  paddingLeft: '24px',
                }}>
                  <p>The university archives smelled of decaying parchment and forgotten wars. It was here, buried beneath stacks of discarded Ottoman maps, that I found it — a leather-bound journal, its cover etched with the serpent-and-fleece seal of the Argonauts.</p>
                  <br />
                  <p>A journal entry speaking of the Argo. Not as a myth, but as a real expedition. The texts were clear: the ruins of Poseidon's sunken temple still hold it. And the Fleece... it was not gold. It was something else entirely.</p>
                  <br />
                  <p style={{ fontStyle: 'italic', color: '#d4a843' }}>Six bullets. That's all I have. I must make every shot count.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0 0', justifyContent: 'center' }}>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #8b6914)' }} />
                  <span style={{ color: '#8b6914', fontSize: '14px' }}>✦</span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #8b6914, transparent)' }} />
                </div>
                <button
                  onClick={() => setBookPage(2)}
                  style={{ marginTop: '28px', padding: '13px 40px', background: 'transparent', border: '1px solid #8b6914', color: '#d4a843', cursor: 'pointer', fontFamily: '"Cinzel", serif', fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#8b6914'; e.currentTarget.style.color = '#0a0a0f'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d4a843'; }}
                >
                  Turn Page — The Map ›
                </button>
              </div>
            )}

            {bookPage === 2 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: '"Cinzel", serif', fontSize: '11px', color: '#8b6914', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Expedition Route — Georgia to the Aegean
                </p>
                <img
                  src={`${import.meta.env.BASE_URL}journey_map.png`}
                  alt="Journey Map from Georgia to Greece"
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', border: '3px solid #5a3a10', boxShadow: '0 0 30px rgba(0,0,0,0.6)', marginBottom: '22px' }}
                />
                <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', color: '#a08040', fontSize: '15px', marginBottom: '22px' }}>
                  "The ruins lie beneath the Aegean — sunken, guarded, waiting."
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setBookPage(1)}
                    style={{ padding: '11px 28px', background: 'transparent', border: '1px solid #5a3a10', color: '#8b6914', cursor: 'pointer', fontFamily: '"Cinzel", serif', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b6914'; e.currentTarget.style.color = '#d4a843'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#5a3a10'; e.currentTarget.style.color = '#8b6914'; }}
                  >
                    ‹ Back
                  </button>
                  <button
                    onClick={() => {
                      gameRef.current.journeyStarted = true;
                      setBookOpen(false);
                      setBookPage(1);
                      const door = gameRef.current.level?.doors.find(d => d.id === 'door_0');
                      if (door) door.open = true;
                      setShowHint('The path is open — walk through the door!');
                      gameRef.current.hintTimer = 4;
                    }}
                    style={{ padding: '13px 48px', background: 'linear-gradient(135deg, #d4a843, #8b6914)', border: 'none', color: '#0a0a0f', cursor: 'pointer', fontFamily: '"Cinzel", serif', fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(212,168,67,0.4)', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(212,168,67,0.7)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(212,168,67,0.4)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    ⚓ Start Your Journey
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRANSITION OVERLAY */}
      {transitioning && (
        <div className="game-overlay" style={{ background: '#0a0a0f', transition: 'opacity 0.5s', opacity: 1, zIndex: 1000 }}>
          <div style={{ textAlign: 'center', color: '#d4a843' }}>
            <div style={{ animation: 'spin 2s linear infinite', fontSize: '48px', display: 'inline-block' }}>🧭</div>
            <h2 style={{ fontFamily: '"Cinzel", serif', marginTop: '20px', letterSpacing: '0.2em' }}>
              JOURNEYING...
            </h2>
          </div>
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {/* WIN */}
      {gameState === 'win' && (
        <div className="game-overlay" style={{
          background: 'linear-gradient(180deg, rgba(212, 168, 67, 0.95), rgba(196, 127, 23, 0.95))',
        }}>
          <div style={{ textAlign: 'center', color: '#0a0a0f' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
            <h2 style={{
              fontFamily: '"Cinzel", serif', fontSize: '36px', fontWeight: 900,
              marginBottom: '8px', letterSpacing: '0.1em',
            }}>
              FLEECE RECLAIMED
            </h2>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: '18px',
              fontStyle: 'italic', marginBottom: '12px', opacity: 0.8,
            }}>
              The Golden Fleece shines with divine light once more.
            </p>
            <p style={{
              fontFamily: '"Press Start 2P", monospace', fontSize: '10px',
              marginBottom: '40px', opacity: 0.6,
            }}>
              Items collected: {collected}
            </p>
            <button
              onClick={startGame}
              style={{
                padding: '14px 40px', background: 'transparent',
                border: '2px solid #0a0a0f', color: '#0a0a0f',
                fontFamily: '"Cinzel", serif', fontSize: '13px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0a0a0f'; e.currentTarget.style.color = '#d4a843'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0a0a0f'; }}
            >
              ↻ Begin Anew
            </button>
          </div>
        </div>
      )}

      {/* LOST */}
      {gameState === 'lost' && (
        <div className="game-overlay" style={{ background: 'rgba(10, 10, 15, 0.95)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', border: '2px solid rgba(196, 57, 43, 0.3)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
            }}>
              <div style={{
                width: '8px', height: '8px', background: '#c0392b', borderRadius: '50%',
                animation: 'pulse-gold 2s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(196, 57, 43, 0.5)',
              }} />
            </div>
            <h2 style={{
              fontFamily: '"Cinzel", serif', fontSize: '28px', fontWeight: 900,
              color: '#c0392b', marginBottom: '40px', letterSpacing: '0.2em',
            }}>
              LOST TO THE TIDES
            </h2>
            <button
              onClick={() => { resetPlayer(levelIndex); setGameState('playing'); }}
              style={{
                padding: '14px 40px', background: 'transparent',
                border: '2px solid #c0392b', color: '#c0392b',
                fontFamily: '"Cinzel", serif', fontSize: '13px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c0392b'; }}
            >
              ↻ Try Once More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

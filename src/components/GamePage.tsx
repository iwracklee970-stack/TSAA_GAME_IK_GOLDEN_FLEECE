import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { PlayerState, Level, AfterImage, Bullet, NPC, Point } from '../types';
import { LEVELS } from '../levels';
import { drawPlayer, drawSkeleton, drawBullet, drawHarpy, drawWallLurker } from './sprites';
import {
  drawBackground, drawPlatform, drawDoor, drawTrigger,
  drawCollectible, drawDecoration, drawLighting, drawCheckpoint,
  drawLadder, drawNPCLibrarian, drawInteractionTooltip, drawFloatingTextHint,
  drawBoss, drawBossHealthBar,
} from './worldRenderer';

// ==============================
// Game Constants
// ==============================
const GRAVITY = 1400;
const JUMP_FORCE = -520;
const MOVE_SPEED = 280;
const FRICTION = 0.82;
const TORCH_RADIUS = 160;

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
    bullets: level.id > 0 ? 6 : 0,
    hasGun: level.id > 0,
    isClimbing: false,
    floatingHintText: '',
    floatingHintTimer: 0,
    afterimages: [],
    health: 3,
    invincibleTimer: 0,
    hurtTimer: 0,
  };
}

interface GamePageProps {
  onExit: () => void;
}

export default function GamePage({ onExit }: GamePageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'win' | 'lost'>('playing');
  const [levelIndex, setLevelIndex] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(3); // React state so HUD re-renders
  const [collected, setCollected] = useState(0);
  const [showHint, setShowHint] = useState('');
  const [bookOpen, setBookOpen] = useState(false);
  const [bookPage, setBookPage] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [dialogueNpc, setDialogueNpc] = useState<NPC | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  // Force re-render of puzzle UI when sequence changes (since puzzleState lives in a ref)
  const [puzzleRenderTick, setPuzzleRenderTick] = useState(0);
  // Puzzle modal — must be React state so the overlay actually renders
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const puzzleOpenRef = useRef(false); // game-loop-accessible mirror
  // Boss fight — React state drives the health bar HUD
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(6);
  const bossActiveRef = useRef(false); // game-loop-accessible mirror
  // Screen-space position of the NPC when dialogue is opened (for floating box)
  const dialogueScreenPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ref for levelIndex so the game loop always sees the current value
  const levelIndexRef = useRef(0);

  const bgImagesRef = useRef<{
    far: HTMLImageElement | HTMLCanvasElement | null;
    mid: HTMLImageElement | HTMLCanvasElement | null;
    fore: HTMLImageElement | HTMLCanvasElement | null;
    libFar: HTMLImageElement | HTMLCanvasElement | null;
    libMid: HTMLImageElement | HTMLCanvasElement | null;
    libFore: HTMLImageElement | HTMLCanvasElement | null;
    underwaterFar: HTMLImageElement | HTMLCanvasElement | null;
    underwaterMid: HTMLImageElement | HTMLCanvasElement | null;
    underwaterFore: HTMLImageElement | HTMLCanvasElement | null;
    labyrinthFar: HTMLImageElement | HTMLCanvasElement | null;
    labyrinthMid: HTMLImageElement | HTMLCanvasElement | null;
    labyrinthFore: HTMLImageElement | HTMLCanvasElement | null;
    underworldFar: HTMLImageElement | HTMLCanvasElement | null;
    underworldMid: HTMLImageElement | HTMLCanvasElement | null;
    underworldFore: HTMLImageElement | HTMLCanvasElement | null;
  }>({
    far: null,
    mid: null,
    fore: null,
    libFar: null,
    libMid: null,
    libFore: null,
    underwaterFar: null,
    underwaterMid: null,
    underwaterFore: null,
    labyrinthFar: null,
    labyrinthMid: null,
    labyrinthFore: null,
    underworldFar: null,
    underworldMid: null,
    underworldFore: null,
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
    // Checkpoint tracking
    checkpoint: null as { x: number; y: number } | null,
    checkpointBullets: 6,
    checkpointHasGun: false,
    // LEVEL 2 Custom State
    isSailing: false,
    boatX: 60,
    grapplingState: null as { target: { x: number; y: number }; duration: number; elapsed: number; startX: number; startY: number } | null,
    puzzleState: { open: false, sequence: [] as number[], completed: false },
    boulderState: { x: 1120, y: 34, active: false, impactTimer: 0, speedY: 0, speedX: -120 },
    shakeTimer: 0,
    woodPlatformDestroyed: false,
    rainParticles: [] as { x: number; y: number; speed: number; len: number }[],
    // Boss fight state
    bossState: {
      active: false,
      completed: false,
      hp: 6,
      x: 1750,    // centre of arena
      y: 330,     // stands on arena floor (y:400) minus half height
      vx: 140,    // moves right initially
      direction: 1 as 1 | -1,
      animTimer: 0,
      weakSpot: {
        x: 0,       // relative offset from boss centre
        y: -30,
        active: false,
        timer: 0,   // countdown until next state change
        pulseTimer: 0,
      },
      ammoSpawnTimer: 0,
    },
  });

  // Initialize level ref and preload background assets
  useEffect(() => {
    gameRef.current.level = gameRef.current.levels[0];
    // Show library welcome hint
    setShowHint('Walk to the glowing journal on the desk and pick it up');
    gameRef.current.hintTimer = 6;

    const baseUrl = import.meta.env.BASE_URL;

    // Standard ruins backgrounds
    const farImg = new Image();
    farImg.src = baseUrl + 'bg_far.png';
    farImg.onload = () => { bgImagesRef.current.far = farImg; };
    processChromaKey(baseUrl + 'bg_mid.png', '#ffffff').then((canvas) => { bgImagesRef.current.mid = canvas; });
    processChromaKey(baseUrl + 'bg_fore.png', '#ffffff').then((canvas) => { bgImagesRef.current.fore = canvas; });

    // Underwater backgrounds
    const uwFarImg = new Image();
    uwFarImg.src = baseUrl + 'underwater_far.png';
    uwFarImg.onload = () => { bgImagesRef.current.underwaterFar = uwFarImg; };
    processChromaKey(baseUrl + 'underwater_mid.png', '#ffffff').then((canvas) => { bgImagesRef.current.underwaterMid = canvas; });
    processChromaKey(baseUrl + 'underwater_fore.png', '#ffffff').then((canvas) => { bgImagesRef.current.underwaterFore = canvas; });

    // Labyrinth backgrounds
    const labFarImg = new Image();
    labFarImg.src = baseUrl + 'labyrinth_far.png';
    labFarImg.onload = () => { bgImagesRef.current.labyrinthFar = labFarImg; };
    processChromaKey(baseUrl + 'labyrinth_mid.png', '#ffffff').then((canvas) => { bgImagesRef.current.labyrinthMid = canvas; });
    processChromaKey(baseUrl + 'labyrinth_fore.png', '#ffffff').then((canvas) => { bgImagesRef.current.labyrinthFore = canvas; });

    // Underworld backgrounds
    const uwlFarImg = new Image();
    uwlFarImg.src = baseUrl + 'underworld_far.png';
    uwlFarImg.onload = () => { bgImagesRef.current.underworldFar = uwlFarImg; };
    processChromaKey(baseUrl + 'underworld_mid.png', '#ffffff').then((canvas) => { bgImagesRef.current.underworldMid = canvas; });
    processChromaKey(baseUrl + 'underworld_fore.png', '#ffffff').then((canvas) => { bgImagesRef.current.underworldFore = canvas; });
  }, []);

  // Split reset into full/hard reset or soft checkpoint reload
  const resetPlayer = useCallback((lvlIndex: number, softRespawn = false, currentHealth = 3) => {
    if (!softRespawn) {
      // Hard reset (e.g. game over or level transition)
      const levels = cloneLevels();
      gameRef.current.levels = levels;
      const level = levels[lvlIndex];
      gameRef.current.level = level;
      const newPlayer = createPlayer(level);
      // If the gun was already collected in this level run, restore it
      const gunItem = level.collectibles.find(c => c.type === 'gun');
      if (gunItem && gunItem.collected) {
        newPlayer.hasGun = true;
        newPlayer.bullets = 6;
      }
      gameRef.current.player = newPlayer;
      gameRef.current.checkpoint = null;
      gameRef.current.checkpointBullets = lvlIndex > 0 ? 6 : 0;
      gameRef.current.checkpointHasGun = lvlIndex > 0;
      gameRef.current.camera = { x: 0, y: 0 };
      gameRef.current.totalCollected = 0;
      gameRef.current.bullets = [];
      gameRef.current.shootCooldown = 0;
      setPlayerHealth(3);
      setCollected(0);
      setShowHint('');

      // LEVEL 2 Custom Initialization (now index 1)
      gameRef.current.isSailing = (lvlIndex === 1);
      gameRef.current.boatX = 60;
      gameRef.current.woodPlatformDestroyed = false;
      gameRef.current.shakeTimer = 0;
      gameRef.current.boulderState = { x: 1160, y: 60, active: false, impactTimer: 0, speedY: 0, speedX: -120 };
      gameRef.current.puzzleState = { open: false, sequence: [], completed: false };
      gameRef.current.grapplingState = null;

      // LEVEL 4 Custom Initialization (now index 4, id: 4)
      gameRef.current.bossState = {
        active: false,
        completed: false,
        hp: 6,
        x: 1750,
        y: 330,
        vx: 140,
        direction: 1,
        animTimer: 0,
        weakSpot: { x: 0, y: -30, active: false, timer: 2.0, pulseTimer: 0 },
        ammoSpawnTimer: 8,
      };
      bossActiveRef.current = false;
      setBossActive(false);
      setBossHp(6);
    } else {
      // Soft respawn at last checkpoint — preserve gun state
      const { player, level } = gameRef.current;
      if (level) {
        const cp = gameRef.current.checkpoint || level.entrance;
        player.x = cp.x;
        player.y = cp.y;
        player.vx = 0;
        player.vy = 0;
        player.health = currentHealth;
        setPlayerHealth(currentHealth);
        player.invincibleTimer = 1.2;
        player.grounded = false;
        player.isDashing = false;
        player.dashInvincible = false;
        player.hurtTimer = 0;
        player.isClimbing = false;
        player.bullets = gameRef.current.checkpointBullets;
        player.hasGun = gameRef.current.checkpointHasGun; // always restore gun state
        gameRef.current.bullets = [];
        gameRef.current.shootCooldown = 0;
        setShowHint(`Respawned — ${currentHealth} ❤ remaining`);
        gameRef.current.hintTimer = 2;

        // Reset Level 2 specific parts on soft respawn (now id 1)
        if (level.id === 1) {
          gameRef.current.isSailing = false;
          gameRef.current.grapplingState = null;
          gameRef.current.shakeTimer = 0;
          // If checkpoint is reached, puzzle remains completed, but make sure boulder isn't re-running
          if (!gameRef.current.puzzleState.completed) {
            gameRef.current.boulderState = { x: 1160, y: 60, active: false, impactTimer: 0, speedY: 0, speedX: -120 };
            gameRef.current.puzzleState = { open: false, sequence: [], completed: false };
            gameRef.current.woodPlatformDestroyed = false;
          }
        }

        // Reset Level 4 specific parts on soft respawn (id 4)
        if (level.id === 4) {
          gameRef.current.bossState = {
            active: false,
            completed: false,
            hp: 6,
            x: 1750,
            y: 330,
            vx: 140,
            direction: 1,
            animTimer: 0,
            weakSpot: { x: 0, y: -30, active: false, timer: 2.0, pulseTimer: 0 },
            ammoSpawnTimer: 8,
          };
          bossActiveRef.current = false;
          setBossActive(false);
          setBossHp(6);

          // Reset entry/exit doors
          const gate = level.doors.find(d => d.id === 'boss_gate');
          if (gate) {
            gate.open = false;
            gate.openProgress = 0;
          }
          const exitDoor = level.doors.find(d => d.id === 'door_4');
          if (exitDoor) {
            exitDoor.open = false;
            exitDoor.openProgress = 0;
          }

          // Restore right wall
          const hasWall = level.platforms.some(p => p.x === 2300 && p.y === 60);
          if (!hasWall) {
            level.platforms.push({ x: 2300, y: 60, w: 20, h: 340, style: 'stone' });
          }

          // Clean up boss spawned collectibles
          level.collectibles = level.collectibles.filter(c => !c.id.startsWith('boss_ammo_'));
          level.collectibles.forEach(c => {
            if (c.id === 'ammo_4a' || c.id === 'ammo_4b' || c.id === 'fleece') {
              c.collected = false;
            }
          });
        }
      }
    }
  }, []);
  const startGame = useCallback(() => {
    setLevelIndex(0);
    levelIndexRef.current = 0;
    resetPlayer(0, false);
    setGameState('playing');
    setShowHint('Arrow keys to move, Space to jump/double-jump, L to dash, J to shoot');
    gameRef.current.hintTimer = 5;
  }, [resetPlayer]);

  // Keep levelIndexRef in sync with React state
  useEffect(() => {
    levelIndexRef.current = levelIndex;
  }, [levelIndex]);

  // ── takeDamage ──────────────────────────────────────────────────────────────
  // Stored in a ref so the game loop can call it without stale React closures.
  // Called whenever the player is hit by an enemy OR falls into a pit.
  const takeDamageRef = useRef((isFromFall = false, enemyX?: number) => { /* will be set below */ });
  useEffect(() => {
    takeDamageRef.current = (isFromFall = false, enemyX?: number) => {
      const player = gameRef.current.player;
      // Skip if already invincible (unless it's a fall)
      if (!isFromFall && (player.dashInvincible || player.invincibleTimer > 0)) return;

      const newHealth = player.health - 1;
      player.health = newHealth;
      player.invincibleTimer = 1.5;
      setPlayerHealth(newHealth); // update HUD

      if (newHealth <= 0) {
        setGameState('lost');
      } else if (isFromFall) {
        // Soft-respawn preserving remaining health ONLY on fall
        resetPlayer(levelIndexRef.current, true, newHealth);
      } else {
        // Knockback from enemy (Mario/Goomba style)
        player.hurtTimer = 0.4; // lock keyboard inputs for 0.4s
        player.animState = 'hurt';
        player.grounded = false;

        // Push player horizontally away from enemy center
        if (enemyX !== undefined) {
          player.vx = player.x < enemyX ? -350 : 350;
        } else {
          player.vx = -player.direction * 350;
        }
        player.vy = -320; // Hop up slightly in pain
      }
    };
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

  // E key advances / closes dialogue while dialogue box is open
  useEffect(() => {
    if (!dialogueNpc) return;
    const handleDialogueKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        e.preventDefault();
        setDialogueIndex(i => {
          if (i < dialogueNpc.dialogue.length - 1) {
            return i + 1; // advance to next line
          } else {
            setDialogueNpc(null); // last line — close
            return 0;
          }
        });
      }
    };
    window.addEventListener('keydown', handleDialogueKey);
    return () => window.removeEventListener('keydown', handleDialogueKey);
  }, [dialogueNpc]);

  // Resize canvas to fixed 1280x720
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = 1280;
    c.height = 720;
  }, []);

  // ==============================
  // GAME LOOP
  // ==============================
  useGameLoop((dt) => {
    // Decrease shake timer if active
    if (gameRef.current.shakeTimer > 0) {
      gameRef.current.shakeTimer = Math.max(0, gameRef.current.shakeTimer - dt);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Rain System (Level 2 specific) ---
    if (gameRef.current.level?.id === 1) {
      if (gameRef.current.rainParticles.length === 0) {
        for (let i = 0; i < 80; i++) {
          gameRef.current.rainParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 300 + Math.random() * 200,
            len: 10 + Math.random() * 10
          });
        }
      }
      const scale = canvas.height / 520;
      const scaledW = canvas.width / scale;
      gameRef.current.rainParticles.forEach(p => {
        p.y += p.speed * dt;
        p.x -= p.speed * 0.35 * dt;
        if (p.y > 520) {
          p.y = -20;
          p.x = Math.random() * (scaledW + 200);
        }
        if (p.x < -20) {
          p.x = scaledW + 20;
          p.y = Math.random() * 200 - 100;
        }
      });
    }

    if (gameState !== 'playing' || bookOpen || transitioning || dialogueNpc || puzzleOpenRef.current) return;
    const { player, keys, level, camera, bullets } = gameRef.current;
    if (!level) return;

    // --- Sailing Cutscene (Level 2 intro) ---
    if (level.id === 1 && gameRef.current.isSailing) {
      gameRef.current.boatX += dt * 65;
      player.x = gameRef.current.boatX;
      player.y = 382;
      player.vx = 0;
      player.vy = 0;
      player.grounded = true;
      player.animState = 'idle';

      // Camera follow boat
      const scale = canvas.height / 520;
      const scaledW = canvas.width / scale;
      const targetCamX = Math.max(0, player.x - scaledW / 3);
      camera.x += (targetCamX - camera.x) * 0.08;

      if (gameRef.current.boatX >= 310) {
        gameRef.current.isSailing = false;
        // Trigger monologue dialogues
        const monologueNpc = {
          id: 'player_monologue',
          x: player.x,
          y: player.y,
          w: player.width,
          h: player.height,
          name: 'Me',
          dialogue: [
            "The map the librarian gave me seems to point to this very Island...",
            "But... it's not charted on any conventional map...",
            "What was he really after in the past? I must figure it out."
          ]
        };
        const displayScale = canvas.clientHeight / 520;
        const screenX = (player.x + player.width / 2 - camera.x) * displayScale;
        const screenY = (player.y) * displayScale;
        dialogueScreenPos.current = { x: screenX, y: screenY };
        setDialogueNpc(monologueNpc);
        setDialogueIndex(0);
      }

      draw();
      return;
    }

    // --- Grappling Hook Pull Movement ---
    if (level.id === 1 && gameRef.current.grapplingState) {
      const gs = gameRef.current.grapplingState;
      gs.elapsed += dt;
      const t = Math.min(1, gs.elapsed / gs.duration);
      player.x = gs.startX + (gs.target.x - player.width / 2 - gs.startX) * t;
      player.y = gs.startY + (gs.target.y - player.height - gs.startY) * t;
      player.vx = 0;
      player.vy = 0;
      player.grounded = false;
      player.animState = 'jump_rise';

      if (t >= 1) {
        gameRef.current.grapplingState = null;
        player.grounded = true;
      }

      const scale = canvas.height / 520;
      const scaledW = canvas.width / scale;
      const targetCamX = Math.max(0, player.x - scaledW / 3);
      camera.x += (targetCamX - camera.x) * 0.08;
      draw();
      return;
    }

    // --- Boulder Drop & Danger Zone Update ---
    if (level.id === 1 && gameRef.current.boulderState.active) {
      const bs = gameRef.current.boulderState;
      bs.x += bs.speedX * dt;

      if (bs.x > 1020) {
        // Roll horizontally along top platform
        bs.y = 34;
        bs.speedY = 0;
      } else {
        // Fall down after rolling off
        bs.y += bs.speedY * dt;
        bs.speedY += 450 * dt; // Gravity
      }

      // Check collision with destructible wood platform at x: 920, y: 160
      if (bs.x <= 980 && bs.x >= 900 && bs.y >= 140 && bs.y <= 185) {
        bs.active = false;
        gameRef.current.woodPlatformDestroyed = true;
        gameRef.current.shakeTimer = 0.6; // screen shake on impact
      }

      // Check Danger Zone (lethal proximity to rolling/falling boulder)
      const distToBoulder = Math.hypot((player.x + player.width / 2) - bs.x, (player.y + player.height / 2) - bs.y);
      if (distToBoulder < 32) {
        player.health = 0;
        setPlayerHealth(0);
        setGameState('lost');
      }
    }

    // --- Invisible Shore Boundary (water side) ---
    if (level.id === 1 && player.x < 295) {
      player.x = 295;
      player.vx = 0;
    }

    // --- Hint timer ---
    if (gameRef.current.hintTimer > 0) {
      gameRef.current.hintTimer -= dt;
      if (gameRef.current.hintTimer <= 0) setShowHint('');
    }

    // --- Floating hint timer ---
    if (player.floatingHintTimer && player.floatingHintTimer > 0) {
      player.floatingHintTimer -= dt;
      if (player.floatingHintTimer <= 0) {
        player.floatingHintTimer = 0;
        player.floatingHintText = '';
      }
    }

    if (gameRef.current.shootCooldown > 0) gameRef.current.shootCooldown -= dt;

    // --- Shooting Logic ---
    if (keys['KeyJ'] && gameRef.current.shootCooldown <= 0 && player.bullets > 0 && player.hasGun) {
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

    // --- Hurt timer tick ---
    if (player.hurtTimer > 0) {
      player.hurtTimer -= dt;
      if (player.hurtTimer <= 0) {
        player.hurtTimer = 0;
      }
    }

    // --- Fall death ---
    if (player.y > 700) {
      takeDamageRef.current(true);
      return;
    }

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
    } else if (player.hurtTimer > 0) {
      // Controls locked. Just apply gravity
      player.vy += GRAVITY * dt;
    } else {
      // --- Check ladder overlap ---
      let onLadder = false;
      if (level.ladders) {
        for (const ladder of level.ladders) {
          // In Level 1 (Shore of Colchis), the ladder at x: 950 is only revealed/climbable after wood platform is destroyed
          if (level.id === 1 && ladder.x === 950 && !gameRef.current.woodPlatformDestroyed) {
            continue;
          }
          const overlapX = player.x + player.width > ladder.x && player.x < ladder.x + ladder.w;
          const overlapY = player.y + player.height > ladder.y && player.y < ladder.y + ladder.h;
          if (overlapX && overlapY) {
            onLadder = true;
            break;
          }
        }
      }

      if (onLadder && (keys['KeyW'] || keys['ArrowUp'] || keys['KeyS'] || keys['ArrowDown'])) {
        // --- Ladder Climbing ---
        player.isClimbing = true;
        player.vy = 0;
        player.vx *= 0.85; // friction on ladder
        const CLIMB_SPEED = 140;
        if (keys['KeyW'] || keys['ArrowUp']) {
          player.vy = -CLIMB_SPEED;
        } else if (keys['KeyS'] || keys['ArrowDown']) {
          player.vy = CLIMB_SPEED;
        }
        // Allow jumping off ladder
        if (keys['Space'] && player.jumpReleased) {
          player.isClimbing = false;
          player.vy = JUMP_FORCE;
          player.jumpReleased = false;
          player.hasDoubleJumped = false;
          player.canAirDash = true;
        }
      } else {
        player.isClimbing = false;

        // --- Normal Movement ---
        const BASE_SPEED = 120; // Starts slow for micro-movements
        const ACCEL = 400;      // Ramps up gradually
        const MAX_SPEED = 320;  // Capped speed to prevent zooming past platforms

        if (keys['ArrowLeft'] || keys['KeyA']) {
          if (player.vx > 0) player.vx *= 0.5;
          if (player.vx > -BASE_SPEED) {
            player.vx = -BASE_SPEED;
          } else {
            player.vx -= ACCEL * dt;
          }
          if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;
          player.direction = -1;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          if (player.vx < 0) player.vx *= 0.5;
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

        // Gravity (not applied while climbing)
        player.vy += GRAVITY * dt;
      }
    }

    // Friction
    if (!player.isDashing) {
      const isMoving = (keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD']);
      if (!isMoving || player.hurtTimer > 0) player.vx *= FRICTION;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Build solid list BEFORE movement so both passes share the same geometry
    // ─────────────────────────────────────────────────────────────────────────
    const ladderXRanges = (level.ladders || []).map(l => ({ x: l.x, right: l.x + l.w }));
    const isPlatformBlockingLadder = (px: number, pw: number) =>
      player.isClimbing && ladderXRanges.some(l => px < l.right && px + pw > l.x);

    const allSolids = [
      ...level.platforms
        .filter(p => !isPlatformBlockingLadder(p.x, p.w))
        .filter(p => !(level.id === 1 && p.x === 920 && p.y === 160 && gameRef.current.woodPlatformDestroyed))
        .map(p => ({ x: p.x, y: p.y, w: p.w, h: p.h })),
      ...level.doors.filter(d => {
        const isLockedDoor = (level.id === 0 && d.id === 'door_0') ||
                             (level.id === 2 && d.id === 'gate_2');
        if (isLockedDoor) return d.openProgress < 0.9;
        const playerInDoor = player.x < d.x + d.w && player.x + player.width > d.x &&
                             player.y < d.y + d.h && player.y + player.height > d.y;
        return (!d.open || d.openProgress < 0.9) && !playerInDoor;
      }).map(d => {
        const drawH = d.h * (1 - d.openProgress);
        return { x: d.x, y: d.y + (d.h - drawH), w: d.w, h: drawH };
      }),
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // TWO-PASS SWEEP COLLISION
    // Pass 1 — X axis: apply horizontal movement, then push out of walls only
    // ─────────────────────────────────────────────────────────────────────────
    player.x += player.vx * dt;
    allSolids.forEach(plat => {
      const pRight   = player.x + player.width;
      const pBottom  = player.y + player.height;
      const platRight  = plat.x + plat.w;
      const platBottom = plat.y + plat.h;

      // Only handle overlaps where Y was ALREADY overlapping before this move
      // (i.e. there is genuine horizontal penetration, not a corner graze)
      if (player.x >= platRight || pRight <= plat.x) return; // no X overlap
      if (player.y >= platBottom || pBottom <= plat.y) return; // no Y overlap

      const overlapLeft  = pRight  - plat.x;
      const overlapRight = platRight - player.x;

      // Push out on the smaller horizontal penetration side
      if (overlapLeft < overlapRight) {
        player.x = plat.x - player.width;
      } else {
        player.x = platRight;
      }
      player.vx = 0;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Pass 2 — Y axis: apply vertical movement, then land/ceiling only
    // ─────────────────────────────────────────────────────────────────────────
    player.y += player.vy * dt;

    // --- Afterimage fade ---
    player.afterimages = player.afterimages
      .map(a => ({ ...a, alpha: a.alpha - dt * 3 }))
      .filter(a => a.alpha > 0);

    // --- Animation state ---
    const prevAnimState = player.animState;
    if (player.hurtTimer > 0) {
      player.animState = 'hurt';
    } else if (player.isDashing) {
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
    } else if (player.animState === 'hurt') {
      player.animFrame = 0;
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

    player.grounded = false;
    allSolids.forEach(plat => {
      const pRight   = player.x + player.width;
      const pBottom  = player.y + player.height;
      const platRight  = plat.x + plat.w;
      const platBottom = plat.y + plat.h;

      if (player.x >= platRight || pRight <= plat.x) return; // no X overlap
      if (player.y >= platBottom || pBottom <= plat.y) return; // no Y overlap

      const overlapTop    = pBottom - plat.y;    // penetration from above
      const overlapBottom = platBottom - player.y; // penetration from below

      if (overlapTop < overlapBottom) {
        // Player lands on top
        if (player.vy >= 0) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.grounded = true;
          player.canAirDash = true;
          player.hasDoubleJumped = false;
        }
      } else {
        // Player hits ceiling from below
        if (player.vy < 0) {
          player.y = platBottom;
          player.vy = 0;
        }
      }
    });

    // --- Tick invincibility ---
    if (player.invincibleTimer > 0) {
      player.invincibleTimer -= dt;
    }

    // --- Fall death ---
    if (player.y > 700) {
      // Force invincibleTimer to 0 so takeDamage won't skip — fall always hurts
      player.invincibleTimer = 0;
      takeDamageRef.current(true);
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

      // Lever is now E-key activated, not auto-touch
      // (handled below in E-key interaction block)

      if (trigger.type === 'exit' && touching && !trigger.activated) {
        // Block exit in library until journey is started
        if (level.type === 'library' && !gameRef.current.journeyStarted) {
          setShowHint('Find the journal on the desk first!');
          gameRef.current.hintTimer = 2;
          return;
        }

        // Block exit in level 0 until gun has been picked up
        if (level.id === 0 && !player.hasGun) {
          player.floatingHintText = "I need my gun first!";
          player.floatingHintTimer = 4.0;
          return;
        }

        // Find the door at this exact exit spot
        const linkedDoor = level.doors.find(d => d.x === trigger.rect.x && d.y === trigger.rect.y);
        // Only trigger transition if the door is fully open
        if (linkedDoor && linkedDoor.openProgress < 0.95) {
          return;
        }

        trigger.activated = true;
        setTransitioning(true);
        setTimeout(() => {
          setTransitioning(false);
          const nextIdx = levelIndexRef.current + 1;
          if (nextIdx < LEVELS.length) {
            setLevelIndex(nextIdx);
            levelIndexRef.current = nextIdx;
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
      
      // Blue locked doors (door_0 on level 0, gate_2 on level 2) only open via lever — not proximity
      const isLockedDoor = (level.id === 0 && door.id === 'door_0') ||
                           (level.id === 2 && door.id === 'gate_2');
      
      // Exit doors open by proximity; library door requires journey started
      const isExitDoor = (door.id.startsWith('door_')) && !isLockedDoor;
      const playerNear = isExitDoor && (level.type !== 'library' || gameRef.current.journeyStarted) && Math.abs(player.x - door.x) < 100;
      
      const shouldOpen = door.open || playerInDoor || (!isLockedDoor && playerNear);

      if (shouldOpen && door.openProgress < 1) {
        door.openProgress = Math.min(1, door.openProgress + dt * 2.5);
      } else if (!shouldOpen && door.openProgress > 0) {
        door.openProgress = Math.max(0, door.openProgress - dt * 2.5);
      }
    });

    // --- Checkpoint trigger checks ---
    if (level.checkpoints) {
      level.checkpoints.forEach(cp => {
        // Simple bounding box check around the checkpoint (20px width)
        const cpW = 20;
        const cpH = 40;
        const touchingCp = player.x < cp.x + cpW/2 && player.x + player.width > cp.x - cpW/2 &&
                           player.y < cp.y + cpH && player.y + player.height > cp.y;
        if (touchingCp && !cp.activated) {
          cp.activated = true;
          gameRef.current.checkpoint = { x: cp.x, y: cp.y };
          gameRef.current.checkpointBullets = player.bullets;
          setShowHint('Checkpoint reached!');
          gameRef.current.hintTimer = 2;
        }
      });
    }

    // --- E-Key Interactions ---
    if (keys['KeyE']) {
      keys['KeyE'] = false; // consume the key press

      // LEVEL 4: Boss gate interaction
      if (level.id === 4 && !gameRef.current.bossState.active && !gameRef.current.bossState.completed) {
        const gate = level.doors.find(d => d.id === 'boss_gate');
        if (gate && !gate.open && Math.abs(player.x - 1295) < 80 && Math.abs(player.y - 350) < 80) {
          // Start the boss fight
          gameRef.current.bossState.active = true;
          gameRef.current.bossState.hp = 6;
          gameRef.current.bossState.x = 1750;
          gameRef.current.bossState.y = 330;
          gameRef.current.bossState.vx = 140;
          gameRef.current.bossState.animTimer = 0;
          gameRef.current.bossState.weakSpot = { x: 0, y: -30, active: false, timer: 2.0, pulseTimer: 0 };
          gameRef.current.bossState.ammoSpawnTimer = 8;
          bossActiveRef.current = true;
          setBossActive(true);
          setBossHp(6);
          // Seal the entry gate behind the player
          gate.open = false;
          gate.openProgress = 0;
          // Push player into arena
          player.x = 1350;
          setShowHint('The gate seals behind you... defeat the Chimera!');
          gameRef.current.hintTimer = 3;
        }
      }

      // LEVEL 2 custom interactions
      if (level.id === 1) {
        // Grapple Hook check
        if (level.grapples) {
          let nearestAnchor: Point | null = null;
          let nearestDist = 120;
          level.grapples.forEach(anchor => {
            const dist = Math.hypot((player.x + player.width/2) - anchor.x, (player.y + player.height/2) - anchor.y);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestAnchor = anchor;
            }
          });
          if (nearestAnchor) {
            gameRef.current.grapplingState = {
              target: nearestAnchor,
              duration: 1.0,
              elapsed: 0,
              startX: player.x,
              startY: player.y
            };
            return;
          }
        }

        // Ancient Seal Puzzle check
        if (!gameRef.current.puzzleState.completed) {
          const distToPuzzle = Math.abs(player.x - 1080);
          if (distToPuzzle < 60 && Math.abs(player.y - 120) < 60) {
            // Reset sequence each time puzzle opens
            gameRef.current.puzzleState.sequence = [];
            puzzleOpenRef.current = true;
            setPuzzleOpen(true);
            return;
          }
        }
      }

      // Talk to NPC
      if (level.npcs) {
        for (const npc of level.npcs) {
          const dist = Math.abs(player.x - npc.x);
          if (dist < 60 && Math.abs(player.y - npc.y) < 60) {
            // Compute NPC screen position for the floating dialogue box
            const cvs = canvasRef.current;
            if (cvs) {
              const scale = cvs.clientHeight / 520;
              const screenX = (npc.x + npc.w / 2 - camera.x) * scale;
              const screenY = (npc.y) * scale;
              dialogueScreenPos.current = { x: screenX, y: screenY };
            }
            setDialogueNpc(npc);
            setDialogueIndex(0);
            break;
          }
        }
      }

      // Flip lever
      level.triggers.forEach(trigger => {
        if (trigger.type === 'lever' && !trigger.activated) {
          const touching = player.x < trigger.rect.x + trigger.rect.w &&
                           player.x + player.width > trigger.rect.x &&
                           player.y < trigger.rect.y + trigger.rect.h &&
                           player.y + player.height > trigger.rect.y;
          if (touching) {
            trigger.activated = true;
            const door = level.doors.find(d => d.id === trigger.linkedDoorId);
            if (door) door.open = true;
            setShowHint('Lever flipped! The door opens...');
            gameRef.current.hintTimer = 2;
          }
        }
      });

      // Pick up gun (E-key only)
      level.collectibles.forEach(item => {
        if (item.type === 'gun' && !item.collected) {
          const dist = Math.hypot(player.x - item.x, player.y - item.y);
          if (dist < 60) {
            item.collected = true;
            // Write directly to the ref's player to avoid any stale closure issue
            gameRef.current.player.hasGun = true;
            gameRef.current.player.bullets = 6;
            gameRef.current.shootCooldown = 0; // ready to fire immediately
            setShowHint('Revolver acquired! Press J to shoot.');
            gameRef.current.hintTimer = 3;
          }
        }
      });
    }

    // --- Collectibles (auto-collect for non-gun items) ---
    level.collectibles.forEach(item => {
      if (item.collected) return;
      if (item.type === 'gun') return; // gun is E-key only
      // Golden Fleece only collectable after boss is defeated
      if (item.type === 'golden_fleece' && level.id === 4 && !gameRef.current.bossState.completed) return;
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
        if (item.type === 'scroll') {
          setShowHint('Note: Tbilisi university archives, 1938. The Fleece awaits...');
          gameRef.current.hintTimer = 4;
          return;
        }
        if (item.type === 'golden_fleece' && level.id === 4) {
          // Victory!
          setGameState('win');
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

      // Update movement based on enemy type
      if (enemy.type === 'skeleton') {
        enemy.x += enemy.speed * dt;
        if (enemy.x > enemy.end || enemy.x < enemy.start) enemy.speed *= -1;
        enemy.animTimer += dt * 1000;
        if (enemy.animTimer > 250) {
          enemy.animFrame = (enemy.animFrame + 1) % 4;
          enemy.animTimer = 0;
        }
      } else if (enemy.type === 'harpy') {
        // Flying Harpy: horizontal patrol + vertical sine wave bobbing
        enemy.x += enemy.speed * dt;
        if (enemy.x > enemy.end || enemy.x < enemy.start) enemy.speed *= -1;
        enemy.animTimer += dt * 1000;
        if (enemy.animTimer > 150) {
          enemy.animFrame = (enemy.animFrame + 1) % 2;
          enemy.animTimer = 0;
        }
        
        // Initialize base startY to prevent accumulation drift
        if ((enemy as any).baseY === undefined) {
          (enemy as any).baseY = enemy.y;
        }
        const phase = Date.now() / 300 + (enemy.flyOffset || 0);
        // Oscilates smoothly by 16px around base height
        enemy.y = (enemy as any).baseY + Math.sin(phase) * 16;
      } else if (enemy.type === 'wall_lurker') {
        // Wall Lurker state machine: wait -> extend -> hold -> retract
        if (!enemy.lurkerPhase) enemy.lurkerPhase = 'waiting';
        if (enemy.lurkerTimer === undefined) enemy.lurkerTimer = 0;
        if (enemy.lurkerExtend === undefined) enemy.lurkerExtend = 0;

        enemy.lurkerTimer += dt;
        if (enemy.lurkerPhase === 'waiting') {
          enemy.lurkerExtend = 0;
          if (enemy.lurkerTimer >= 2.0) {
            enemy.lurkerPhase = 'extending';
            enemy.lurkerTimer = 0;
          }
        } else if (enemy.lurkerPhase === 'extending') {
          enemy.lurkerExtend = Math.min(enemy.w, enemy.lurkerExtend + enemy.speed * dt);
          if (enemy.lurkerExtend >= enemy.w) {
            enemy.lurkerPhase = 'holding';
            enemy.lurkerTimer = 0;
          }
        } else if (enemy.lurkerPhase === 'holding') {
          enemy.lurkerExtend = enemy.w;
          if (enemy.lurkerTimer >= 1.0) {
            enemy.lurkerPhase = 'retracting';
            enemy.lurkerTimer = 0;
          }
        } else if (enemy.lurkerPhase === 'retracting') {
          enemy.lurkerExtend = Math.max(0, enemy.lurkerExtend - enemy.speed * dt);
          if (enemy.lurkerExtend <= 0) {
            enemy.lurkerPhase = 'waiting';
            enemy.lurkerTimer = 0;
          }
        }
      }

      // Check bullet collision (wall lurkers are unkillable hazards, bullets just deactivate)
      bullets.forEach(b => {
        if (!b.active) return;
        
        // Define hitbox check depending on enemy type
        let isHit = false;
        if (enemy.type === 'wall_lurker') {
          const extendVal = enemy.lurkerExtend || 0;
          if (extendVal > 2) {
            const lurkX = enemy.lurkerSide === 'right' ? enemy.x - extendVal : enemy.x;
            const lurkY = enemy.y;
            const lurkW = enemy.lurkerSide === 'ceiling' ? enemy.w : extendVal;
            const lurkH = enemy.lurkerSide === 'ceiling' ? extendVal : enemy.h;
            if (b.x > lurkX && b.x < lurkX + lurkW && b.y > lurkY && b.y < lurkY + lurkH) {
              isHit = true;
            }
          }
        } else {
          if (b.x > enemy.x && b.x < enemy.x + enemy.w && b.y > enemy.y && b.y < enemy.y + enemy.h) {
            isHit = true;
          }
        }

        if (isHit) {
          b.active = false;
          if (enemy.type !== 'wall_lurker') {
            enemy.alive = false;
          }
        }
      });

      // ── Player contact ─────────────────────────────────────────────────────
      // Works for ALL enemy types: skeleton, harpy, wall_lurker.
      // The invincibility guard lives inside takeDamageRef.
      if (enemy.alive) {
        let isColliding = false;

        if (enemy.type === 'wall_lurker') {
          // Lurker hitbox is the extended portion only
          const extendVal = enemy.lurkerExtend || 0;
          if (extendVal > 2) {
            const lurkX = enemy.lurkerSide === 'right'
              ? enemy.x - extendVal
              : enemy.lurkerSide === 'ceiling'
                ? enemy.x  // ceiling lurker: hitbox is vertical
                : enemy.x;
            // For ceiling lurkers, enemy.y is the ceiling attach point
            const lurkerY = enemy.lurkerSide === 'ceiling' ? enemy.y : enemy.y;
            const lurkerH = enemy.lurkerSide === 'ceiling' ? extendVal : enemy.h;
            const lurkerW = enemy.lurkerSide === 'ceiling' ? enemy.w : extendVal;

            if (player.x < lurkX + lurkerW && player.x + player.width > lurkX &&
                player.y < lurkerY + lurkerH && player.y + player.height > lurkerY) {
              isColliding = true;
            }
          }
        } else {
          // Skeleton & Harpy use their bounding box directly
          if (player.x < enemy.x + enemy.w && player.x + player.width > enemy.x &&
              player.y < enemy.y + enemy.h && player.y + player.height > enemy.y) {
            isColliding = true;
          }
        }

        if (isColliding) {
          takeDamageRef.current(false, enemy.x + enemy.w / 2);
        }
      }
    });

    // --- Boss Fight AI (Level 4) ---
    if (level.id === 4 && gameRef.current.bossState.active) {
      const bs = gameRef.current.bossState;

      // Animation timer
      bs.animTimer += dt;

      // Movement — bounce between arena walls (x: 1320 to x: 2270)
      bs.x += bs.vx * dt;
      if (bs.x > 2220) { bs.x = 2220; bs.vx = -Math.abs(bs.vx); bs.direction = -1; }
      if (bs.x < 1380) { bs.x = 1380; bs.vx = Math.abs(bs.vx); bs.direction = 1; }
      // Face player
      if (player.x > bs.x) { bs.direction = 1; } else { bs.direction = -1; }

      // Weak spot cycling
      const ws = bs.weakSpot;
      ws.timer -= dt;
      if (ws.active) ws.pulseTimer += dt;
      if (ws.timer <= 0) {
        if (ws.active) {
          // Deactivate, hide for 2-4 seconds
          ws.active = false;
          ws.timer = 2.5 + Math.random() * 2;
          ws.pulseTimer = 0;
        } else {
          // Activate at a random spot on the boss
          ws.active = true;
          ws.timer = 3.0 + Math.random() * 1.5; // visible for 3-4.5 seconds
          const positions = [
            { x: 65, y: -24 }, // head
            { x: -20, y: -10 }, // back
            { x: 30, y: 15 },  // body
            { x: -50, y: 0 },  // tail-root
          ];
          const picked = positions[Math.floor(Math.random() * positions.length)];
          ws.x = picked.x;
          ws.y = picked.y;
        }
      }

      // Bullet vs weak-spot collision
      if (ws.active) {
        // Weak spot world position = boss centre + relative offset (accounting for direction flip)
        const wsWorldX = bs.x + ws.x * bs.direction;
        const wsWorldY = bs.y + ws.y;
        const wsRadius = 16;
        bullets.forEach(b => {
          if (!b.active) return;
          const dist = Math.hypot(b.x - wsWorldX, b.y - wsWorldY);
          if (dist < wsRadius) {
            b.active = false;
            ws.active = false;
            ws.timer = 1.5;
            bs.hp -= 1;
            gameRef.current.shakeTimer = 0.25;
            setBossHp(bs.hp);
            if (bs.hp <= 0) {
              // Boss defeated!
              bs.active = false;
              bs.completed = true;
              bossActiveRef.current = false;
              setBossActive(false);
              // Open the exit: remove the right wall block and open door_4
              const exitDoor = level.doors.find(d => d.id === 'door_4');
              if (exitDoor) { exitDoor.open = true; exitDoor.openProgress = 1; }
              // Remove arena right-wall platform so player can walk out
              const wallIdx = level.platforms.findIndex(p => p.x === 2300 && p.y === 60 && p.h === 340);
              if (wallIdx >= 0) level.platforms.splice(wallIdx, 1);
              setShowHint('The Chimera falls! The Golden Fleece awaits...');
              gameRef.current.hintTimer = 4;
            }
          }
        });
      }

      // Player vs boss body collision damage
      const bossHalfW = 60;
      const bossHalfH = 40;
      if (
        player.x < bs.x + bossHalfW && player.x + player.width > bs.x - bossHalfW &&
        player.y < bs.y + bossHalfH && player.y + player.height > bs.y - bossHalfH
      ) {
        takeDamageRef.current(false, bs.x);
      }

      // Ammo spawning — periodically drop an ammo box on a platform during the fight
      bs.ammoSpawnTimer -= dt;
      if (bs.ammoSpawnTimer <= 0) {
        bs.ammoSpawnTimer = 10 + Math.random() * 6;
        // Check if there are any uncollected ammo boxes in the arena
        const arenaAmmo = level.collectibles.filter(c => c.type === 'ammo_refill' && !c.collected && c.x > 1300 && c.x < 2300);
        if (arenaAmmo.length < 2) {
          // Spawn ammo on one of the floating platforms
          const spawnSpots = [
            { x: 1430, y: 258 }, { x: 1650, y: 178 }, { x: 1870, y: 248 },
            { x: 2100, y: 178 }, { x: 2200, y: 278 },
          ];
          const spot = spawnSpots[Math.floor(Math.random() * spawnSpots.length)];
          level.collectibles.push({
            id: `boss_ammo_${Date.now()}`,
            x: spot.x,
            y: spot.y,
            type: 'ammo_refill',
            collected: false,
          });
        }
      }
    }

    // --- Camera ---
    const scaleVal = canvas.height / 520;
    const logicalW = canvas.width / scaleVal;
    const targetCamX = Math.max(0, player.x - logicalW / 2 + player.width / 2);
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
    // Camera shake in game coords
    if (gameRef.current.shakeTimer > 0) {
      const shakeAmt = 8 * (gameRef.current.shakeTimer / 0.6);
      const dx = (Math.random() - 0.5) * shakeAmt;
      const dy = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(dx, dy);
    }
    const scaledW = W / scale;
    const scaledH = H / scale;

    // 1. Background
    const bgSet = level.type === 'library' 
      ? { far: bgImagesRef.current.libFar, mid: bgImagesRef.current.libMid, fore: bgImagesRef.current.libFore }
      : level.type === 'underwater'
      ? { far: bgImagesRef.current.underwaterFar, mid: bgImagesRef.current.underwaterMid, fore: bgImagesRef.current.underwaterFore }
      : level.type === 'labyrinth'
      ? { far: bgImagesRef.current.labyrinthFar, mid: bgImagesRef.current.labyrinthMid, fore: bgImagesRef.current.labyrinthFore }
      : level.type === 'underworld'
      ? { far: bgImagesRef.current.underworldFar, mid: bgImagesRef.current.underworldMid, fore: bgImagesRef.current.underworldFore }
      : { far: bgImagesRef.current.far, mid: bgImagesRef.current.mid, fore: bgImagesRef.current.fore };

    drawBackground(ctx, level, camera.x, scaledW, scaledH, bgSet);

    // 2. Decorations (behind everything)
    level.decorations.forEach(d => drawDecoration(ctx, d, camera.x));

    // 3. Platforms
    level.platforms.forEach(p => {
      if (level.id === 1 && p.x === 920 && p.y === 160 && gameRef.current.woodPlatformDestroyed) {
        return;
      }
      drawPlatform(ctx, p, camera.x);
    });

    // 3.5. Ladders
    if (level.ladders) {
      level.ladders.forEach(l => drawLadder(ctx, l, camera.x));
    }

    // 4. Triggers
    level.triggers.forEach(t => {
      if (t.type !== 'exit' || !t.activated) drawTrigger(ctx, t, camera.x);
    });

    // 5. Doors
    level.doors.forEach(d => drawDoor(ctx, d, camera.x));

    // 6. Collectibles
    level.collectibles.forEach(c => drawCollectible(ctx, c, camera.x));

    // 6.5. Checkpoints
    if (level.checkpoints) {
      level.checkpoints.forEach(cp => drawCheckpoint(ctx, cp, camera.x));
    }

    // 6.6. NPCs
    if (level.npcs) {
      level.npcs.forEach(n => drawNPCLibrarian(ctx, n, camera.x));
    }

    // --- LEVEL 2 Custom Midground Visuals ---
    if (level.id === 1) {
      // Draw Grapple Points
      if (level.grapples) {
        level.grapples.forEach(anchor => {
          const ax = anchor.x - camera.x;
          const ay = anchor.y;
          // Ornate anchor ring
          ctx.fillStyle = '#5c3a21'; // bronze wood backplate
          ctx.fillRect(ax - 7, ay - 7, 14, 14);
          ctx.fillStyle = '#d4a843'; // Golden outer ring
          ctx.beginPath();
          ctx.arc(ax, ay, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b'; // Hole matching dark bg
          ctx.beginPath();
          ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw Grappling Hook Rope
      if (gameRef.current.grapplingState) {
        const gs = gameRef.current.grapplingState;
        ctx.save();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 2]); // Rope texture
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2 - camera.x, player.y + player.height / 2);
        ctx.lineTo(gs.target.x - camera.x, gs.target.y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Greek Statue (Puzzle Anchor point)
      const px = 1080 - camera.x;
      ctx.save();
      
      // Pedestal / Base
      ctx.fillStyle = '#94a3b8'; // Darker grey stone
      ctx.fillRect(px - 10, 148, 20, 12);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(px - 10, 148, 20, 12);

      // Body / Torso
      ctx.fillStyle = '#cbd5e1'; // Marble white/light grey
      ctx.beginPath();
      ctx.moveTo(px - 6, 148);
      ctx.lineTo(px - 4, 132);
      ctx.lineTo(px + 4, 132);
      ctx.lineTo(px + 6, 148);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(px, 126, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden robe sash details
      ctx.strokeStyle = '#d4a843'; 
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 4, 134);
      ctx.lineTo(px + 5, 144);
      ctx.stroke();

      // Floating indicator ring above head
      ctx.strokeStyle = '#d4a843';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, 108, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = gameRef.current.puzzleState.completed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(px, 108, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = gameRef.current.puzzleState.completed ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 8px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gameRef.current.puzzleState.completed ? '✓' : '🜔', px, 108);
      ctx.restore();



      // Draw Boulder
      if (!gameRef.current.woodPlatformDestroyed || gameRef.current.boulderState.active) {
        const bs = gameRef.current.boulderState;
        const bX = bs.x - camera.x;
        const bY = bs.y;
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bX, bY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Boulder cracks
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(bX - 8, bY - 6);
        ctx.lineTo(bX + 6, bY + 8);
        ctx.stroke();
      }

      // Draw Campfire
      const cfx = 420 - camera.x;
      const cfy = 405;
      // Wood logs
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(cfx - 10, cfy + 10, 20, 5);
      ctx.fillRect(cfx - 6, cfy + 7, 12, 5);
      // Flame particles (simple animated triangles)
      const flameHeight = 12 + Math.sin(Date.now() / 80) * 4;
      const grad = ctx.createLinearGradient(cfx, cfy + 10, cfx, cfy + 10 - flameHeight);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cfx - 8, cfy + 10);
      ctx.lineTo(cfx + 8, cfy + 10);
      ctx.lineTo(cfx, cfy + 10 - flameHeight);
      ctx.closePath();
      ctx.fill();
      // Smoke
      ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
      for (let s = 0; s < 3; s++) {
        const sy = cfy - 5 - ((Date.now() / 15 + s * 30) % 60);
        const sx = cfx + Math.sin(Date.now() / 200 + s) * 6;
        const radius = 6 + (cfy - sy) * 0.15;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Enemies (Draw by type)
    level.enemies.forEach(e => {
      if (!e.alive) return;
      if (e.type === 'skeleton') {
        drawSkeleton(ctx, e.x - camera.x, e.y, e.w, e.h, e.animFrame, e.speed);
      } else if (e.type === 'harpy') {
        drawHarpy(ctx, e.x - camera.x, e.y, e.w, e.h, e.animFrame, e.speed);
      } else if (e.type === 'wall_lurker') {
        drawWallLurker(ctx, e.x - camera.x, e.y, e.w, e.h, e.lurkerSide || 'left', e.lurkerExtend || 0);
      }
    });

    // 7.5 Boss (Level 4)
    if (level.id === 4 && (gameRef.current.bossState.active || (gameRef.current.bossState.completed === false && gameRef.current.bossState.hp > 0))) {
      const bs = gameRef.current.bossState;
      if (bs.active) {
        drawBoss(ctx, bs.x, bs.y, camera.x, bs.direction, bs.animTimer, bs.weakSpot, 1);
      }
    }

    // Bullets
    gameRef.current.bullets.forEach(b => drawBullet(ctx, b, camera.x));

    // 8. Player (Inject alpha flash for invincibility frames)
    const isInvincibleFlashing = player.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0;
    if (isInvincibleFlashing) {
      ctx.globalAlpha = 0.3;
    }
    drawPlayer(ctx, player, camera.x);
    ctx.globalAlpha = 1;

    // Draw Boat on top of the player
    if (level.id === 1) {
      const bx = (gameRef.current.isSailing ? gameRef.current.boatX : 310) - camera.x;
      const by = 382;
      // Boat Hull (Bigger: covers from by + 20 to by + 38, width from bx - 36 to bx + 36)
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(bx - 36, by + 20);
      ctx.lineTo(bx + 36, by + 20);
      ctx.lineTo(bx + 24, by + 38);
      ctx.lineTo(bx - 24, by + 38);
      ctx.closePath();
      ctx.fill();
      // Mast (Bigger: goes up to by - 15)
      ctx.strokeStyle = '#431407';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(bx, by + 20);
      ctx.lineTo(bx, by - 15);
      ctx.stroke();
      // Sail (Bigger)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(bx, by - 12);
      ctx.lineTo(bx + 22, by + 2);
      ctx.lineTo(bx, by + 16);
      ctx.closePath();
      ctx.fill();
    }

    // 8.5. Floating Text Hint above Player
    if (player.floatingHintText && player.floatingHintTimer && player.floatingHintTimer > 0) {
      drawFloatingTextHint(ctx, player.x + player.width / 2 - camera.x, player.y, player.floatingHintText);
    }

    // 8.6. Interaction Tooltips
    let promptText: string | null = null;
    let promptX = 0;
    let promptY = 0;

    if (level.npcs) {
      level.npcs.forEach(n => {
        const dist = Math.abs(player.x - n.x);
        if (dist < 60 && Math.abs(player.y - n.y) < 60) {
          promptText = "[E] Speak";
          promptX = n.x + n.w / 2;
          promptY = n.y;
        }
      });
    }

    level.triggers.forEach(t => {
      if (t.type === 'lever' && !t.activated) {
        const touching = player.x < t.rect.x + t.rect.w && player.x + player.width > t.rect.x &&
                         player.y < t.rect.y + t.rect.h && player.y + player.height > t.rect.y;
        if (touching) {
          promptText = "[E] Flip";
          promptX = t.rect.x + t.rect.w / 2;
          promptY = t.rect.y;
        }
      }
    });

    level.collectibles.forEach(c => {
      if (c.type === 'gun' && !c.collected) {
        const dist = Math.abs(player.x - c.x);
        if (dist < 50 && Math.abs(player.y - c.y) < 50) {
          promptText = "[E] Take";
          promptX = c.x + 8;
          promptY = c.y;
        }
      }
    });

    // Level 2 Grapple prompt
    if (level.id === 1 && level.grapples) {
      level.grapples.forEach(anchor => {
        const dist = Math.hypot((player.x + player.width/2) - anchor.x, (player.y + player.height/2) - anchor.y);
        if (dist < 120) {
          promptText = "[E] Grapple";
          promptX = anchor.x;
          promptY = anchor.y;
        }
      });
    }

    // Level 2 Puzzle prompt
    if (level.id === 1 && !gameRef.current.puzzleState.completed) {
      const distToPuzzle = Math.abs(player.x - 1080);
      if (distToPuzzle < 60 && Math.abs(player.y - 120) < 60) {
        promptText = "[E] Inspect Statue";
        promptX = 1080;
        promptY = 120;
      }
    }

    // Level 4 Boss Gate prompt
    if (level.id === 4 && !gameRef.current.bossState.active && !gameRef.current.bossState.completed) {
      if (Math.abs(player.x - 1295) < 80 && Math.abs(player.y - 350) < 80) {
        promptText = "[E] Enter the Arena";
        promptX = 1295;
        promptY = 300;
      }
    }

    if (promptText) {
      drawInteractionTooltip(ctx, promptX - camera.x, promptY, promptText);
    }

    // Level 2: progression door locked hint
    if (level.id === 1) {
      const exitDoor = level.doors.find(d => d.id === 'exit_door_2');
      if (exitDoor && !exitDoor.open) {
        const distToDoor = Math.hypot(player.x - exitDoor.x, player.y - exitDoor.y);
        if (distToDoor < 80) {
          drawFloatingTextHint(ctx, player.x + player.width / 2 - camera.x, player.y - 10, 'I need to find a way to open this');
        }
      }
    }

    // 9. Fog-of-War Lighting
    drawLighting(ctx, player.x - camera.x, player.y, player.direction, scaledW, scaledH, TORCH_RADIUS, null);

    // 10. Level 2 Foreground Rain (drawn after lighting, in scaled space)
    if (level.id === 1) {
      ctx.save();
      gameRef.current.rainParticles.forEach(p => {
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len * 0.35, p.y + p.len);
        ctx.stroke();
      });
      ctx.restore();
    }

    ctx.restore();

    // 11. Boss Health Bar (drawn in canvas pixel space after game transform is restored)
    if (level.id === 4 && gameRef.current.bossState.active) {
      const bs = gameRef.current.bossState;
      const hudScale = H / 520;
      drawBossHealthBar(ctx, bs.hp, 6, W, hudScale);
    }

  };

  // ==============================
  // UI OVERLAYS
  // ==============================
  const renderHearts = () => {
    // Use playerHealth state (not the ref) so React re-renders when health changes
    return (
      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
        {[1, 2, 3].map(heart => (
          <span key={heart} style={{
            fontSize: '18px',
            filter: heart <= playerHealth ? 'drop-shadow(0 0 4px rgba(255,68,68,0.7))' : 'none',
            opacity: heart <= playerHealth ? 1 : 0.3,
            transition: 'opacity 0.2s, filter 0.2s',
          }}>
            {heart <= playerHealth ? '❤️' : '🖤'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="game-fullscreen" style={{ cursor: (gameState === 'playing' && !bookOpen && !dialogueNpc) ? 'none' : 'default' }}>
      <canvas ref={canvasRef} />

      {/* WIN SCREEN */}
      {gameState === 'win' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(30,20,5,0.98) 0%, rgba(5,3,0,1) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9000,
          animation: 'fadeIn 1.2s ease',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
            {/* Golden glow */}
            <div style={{
              fontSize: '72px', marginBottom: '16px',
              filter: 'drop-shadow(0 0 40px rgba(212,168,67,0.9))',
              animation: 'pulse 2s ease infinite',
            }}>🌟</div>
            <div style={{
              fontFamily: '"Cinzel", serif', fontSize: '11px',
              color: '#8b6914', letterSpacing: '0.4em', textTransform: 'uppercase',
              marginBottom: '12px',
            }}>Victory — The Quest is Complete</div>
            <h1 style={{
              fontFamily: '"Cinzel", serif', fontSize: '48px',
              background: 'linear-gradient(135deg, #f0d68a, #d4a843, #8b6914)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 8px', letterSpacing: '0.06em',
              textShadow: '0 0 60px rgba(212,168,67,0.4)',
            }}>
              The Golden Fleece
            </h1>
            <p style={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: '20px',
              color: '#a08040', fontStyle: 'italic', marginBottom: '40px', lineHeight: 1.6,
            }}>
              Against all odds, the ancient guardian has fallen.<br />
              The Golden Fleece is yours, Professor Kaladze.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => { startGame(); }}
                style={{
                  padding: '14px 40px', fontFamily: '"Cinzel", serif',
                  fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, #8b6914, #d4a843)',
                  color: '#0a0a0f', border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(212,168,67,0.4)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 50px rgba(212,168,67,0.8)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(212,168,67,0.4)'}
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

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
              {renderHearts()}
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

      {/* LEVEL 2 PUZZLE OVERLAY — Ancient Seal of the Golden Ram */}
      {puzzleOpen && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(5, 10, 20, 0.92)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 8000,
        }}>
          <div style={{
            background: 'linear-gradient(160deg, #0f172a 0%, #1e1b12 100%)',
            border: '2px solid #8b6914',
            boxShadow: '0 0 60px rgba(212,168,67,0.18), inset 0 0 40px rgba(0,0,0,0.5)',
            padding: '40px 48px',
            maxWidth: '600px',
            width: '92%',
            position: 'relative',
          }}>
            {/* Corner ornaments */}
            {(['tl','tr','bl','br'] as const).map(pos => (
              <div key={pos} style={{
                position: 'absolute', width: '18px', height: '18px',
                borderColor: '#8b6914', borderStyle: 'solid', borderWidth: 0,
                borderTopWidth: pos.startsWith('t') ? '2px' : 0,
                borderBottomWidth: pos.startsWith('b') ? '2px' : 0,
                borderLeftWidth: pos.endsWith('l') ? '2px' : 0,
                borderRightWidth: pos.endsWith('r') ? '2px' : 0,
                top: pos.startsWith('t') ? '10px' : 'auto',
                bottom: pos.startsWith('b') ? '10px' : 'auto',
                left: pos.endsWith('l') ? '10px' : 'auto',
                right: pos.endsWith('r') ? '10px' : 'auto',
              }} />
            ))}

            <p style={{ fontFamily: '"Cinzel", serif', fontSize: '9px', color: '#8b6914', letterSpacing: '0.3em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
              Ancient Seal — Chamber of the Golden Ram
            </p>
            <h2 style={{ fontFamily: '"Cinzel", serif', color: '#f0d68a', fontSize: '20px', textAlign: 'center', marginBottom: '6px', letterSpacing: '0.06em' }}>
              The Legend of the Golden Fleece
            </h2>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginBottom: '28px', fontStyle: 'italic' }}>
              Activate the relics in the correct chronological order to unseal the chamber.
            </p>

            {/* Sequence Progress display */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
              {[0, 1, 2].map(i => {
                const seq = gameRef.current.puzzleState.sequence;
                const filled = seq.length > i;
                const labels = ['①', '②', '③'];
                return (
                  <div key={i} style={{
                    width: '36px', height: '36px',
                    border: `2px solid ${filled ? '#d4a843' : '#334155'}`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: filled ? '#d4a843' : '#475569',
                    fontFamily: '"Cinzel", serif',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    background: filled ? 'rgba(212,168,67,0.12)' : 'transparent',
                  }}>
                    {labels[i]}
                  </div>
                );
              })}
            </div>

            {/* The 3 Pillars */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { id: 0, title: 'Prince Phrixus', icon: '🐏', desc: 'The prince who fled on the Golden Ram to escape sacrifice, bringing the Fleece to Colchis.' },
                { id: 1, title: 'King Aietes', icon: '👑', desc: 'The King of Colchis who received the ram\'s Fleece and hung it in the sacred grove of Ares.' },
                { id: 2, title: "Ares' Sacred Grove", icon: '⚔️', desc: 'The divine grove where the Golden Fleece was guarded by an undying dragon until Jason arrived.' },
              ].map(pillar => {
                const alreadyUsed = gameRef.current.puzzleState.sequence.includes(pillar.id);
                return (
                  <button
                    key={pillar.id}
                    disabled={alreadyUsed}
                    onClick={() => {
                      const ps = gameRef.current.puzzleState;
                      const newSeq = [...ps.sequence, pillar.id];
                      gameRef.current.puzzleState.sequence = newSeq;
                      setPuzzleRenderTick(t => t + 1);

                      if (newSeq.length === 3) {
                        const correct = newSeq[0] === 0 && newSeq[1] === 1 && newSeq[2] === 2;
                        if (correct) {
                          gameRef.current.puzzleState.completed = true;
                          puzzleOpenRef.current = false;
                          setPuzzleOpen(false);
                          // Trigger boulder drop
                          gameRef.current.boulderState.active = true;
                          gameRef.current.boulderState.x = 1120;
                          gameRef.current.boulderState.y = 34;
                          gameRef.current.boulderState.speedY = 0;
                          gameRef.current.shakeTimer = 0.2;
                          setShowHint('The ancient seal breaks — a rumble echoes through the stone...');
                          gameRef.current.hintTimer = 3;
                          setPuzzleRenderTick(t => t + 1);
                        } else {
                          // Wrong order — reset
                          setTimeout(() => {
                            gameRef.current.puzzleState.sequence = [];
                            setShowHint('The ancient magic rejects this order...');
                            gameRef.current.hintTimer = 2.5;
                            gameRef.current.shakeTimer = 0.3;
                            setPuzzleRenderTick(t => t + 1);
                          }, 400);
                        }
                      }
                    }}
                    style={{
                      flex: '1 1 150px',
                      background: alreadyUsed ? 'rgba(212,168,67,0.08)' : 'rgba(15, 23, 42, 0.9)',
                      border: `1px solid ${alreadyUsed ? '#d4a843' : '#334155'}`,
                      padding: '16px 12px',
                      cursor: alreadyUsed ? 'default' : 'pointer',
                      opacity: alreadyUsed ? 0.5 : 1,
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={e => { if (!alreadyUsed) e.currentTarget.style.borderColor = '#d4a843'; }}
                    onMouseLeave={e => { if (!alreadyUsed) e.currentTarget.style.borderColor = '#334155'; }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{pillar.icon}</div>
                    <div style={{ fontFamily: '"Cinzel", serif', color: '#f0d68a', fontSize: '11px', marginBottom: '8px', letterSpacing: '0.08em' }}>{pillar.title}</div>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>{pillar.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { gameRef.current.puzzleState.sequence = []; setPuzzleRenderTick(t => t + 1); }}
                style={{ fontFamily: '"Cinzel", serif', fontSize: '9px', color: '#475569', background: 'transparent', border: '1px solid #334155', padding: '6px 16px', cursor: 'pointer', letterSpacing: '0.1em' }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                Reset
              </button>
              <button
                onClick={() => { puzzleOpenRef.current = false; setPuzzleOpen(false); }}
                style={{ fontFamily: '"Cinzel", serif', fontSize: '9px', color: 'rgba(212,168,67,0.5)', background: 'transparent', border: '1px solid rgba(212,168,67,0.25)', padding: '6px 18px', cursor: 'pointer', letterSpacing: '0.1em' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#d4a843'; e.currentTarget.style.borderColor = '#d4a843'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(212,168,67,0.5)'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.25)'; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NPC DIALOGUE — floating box above NPC, no screen dim */}

      {dialogueNpc && (() => {
        const BOX_W = 380;
        const cvs = canvasRef.current;
        const vw = cvs ? cvs.clientWidth  : window.innerWidth;
        const vh = cvs ? cvs.clientHeight : window.innerHeight;

        // Clamp so box never leaves the viewport
        let left = dialogueScreenPos.current.x - BOX_W / 2;
        let top  = dialogueScreenPos.current.y - 220; // above NPC head
        left = Math.max(8, Math.min(left, vw - BOX_W - 8));
        top  = Math.max(8, top);

        return (
          <div style={{
            position: 'absolute',
            left: `${left}px`,
            top:  `${top}px`,
            width: `${BOX_W}px`,
            background: 'linear-gradient(160deg, #1e1208 0%, #100a03 100%)',
            border: '2px solid #8b6914',
            boxShadow: '0 4px 32px rgba(0,0,0,0.85), 0 0 16px rgba(212,168,67,0.15)',
            padding: '16px 20px 14px',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}>
            {/* Corner ornaments */}
            {(['tl','tr','bl','br'] as const).map(pos => (
              <div key={pos} style={{
                position: 'absolute',
                width: '12px', height: '12px',
                borderColor: '#8b6914', borderStyle: 'solid', borderWidth: 0,
                borderTopWidth:    pos.startsWith('t') ? '1px' : 0,
                borderBottomWidth: pos.startsWith('b') ? '1px' : 0,
                borderLeftWidth:   pos.endsWith('l')   ? '1px' : 0,
                borderRightWidth:  pos.endsWith('r')   ? '1px' : 0,
                top:    pos.startsWith('t') ? '5px' : 'auto',
                bottom: pos.startsWith('b') ? '5px' : 'auto',
                left:   pos.endsWith('l')   ? '5px' : 'auto',
                right:  pos.endsWith('r')   ? '5px' : 'auto',
              }} />
            ))}

            {/* Speaker name */}
            <div style={{
              fontFamily: '"Cinzel", serif',
              fontSize: '9px',
              color: '#d4a843',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              borderBottom: '1px solid rgba(212,168,67,0.2)',
              paddingBottom: '7px',
            }}>
              ✦ {dialogueNpc.name}
            </div>

            {/* Dialogue text */}
            <div style={{
              fontFamily: '"Crimson Text", "Georgia", serif',
              fontSize: '14px',
              color: '#f4e8d8',
              lineHeight: 1.6,
              minHeight: '44px',
              marginBottom: '12px',
            }}>
              "{dialogueNpc.dialogue[dialogueIndex]}"
            </div>

            {/* Counter + buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                fontFamily: '"Cinzel", serif',
                fontSize: '8px',
                color: 'rgba(212,168,67,0.4)',
                letterSpacing: '0.1em',
              }}>
                {dialogueIndex + 1} / {dialogueNpc.dialogue.length}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDialogueNpc(null)} style={{
                  fontFamily: '"Cinzel", serif', fontSize: '9px',
                  color: 'rgba(212,168,67,0.5)', background: 'transparent',
                  border: '1px solid rgba(212,168,67,0.2)', padding: '4px 12px',
                  cursor: 'pointer', letterSpacing: '0.08em',
                }}>Close</button>
                {dialogueIndex < dialogueNpc.dialogue.length - 1 ? (
                  <button onClick={() => setDialogueIndex(i => i + 1)} style={{
                    fontFamily: '"Cinzel", serif', fontSize: '9px',
                    color: '#1a0e05', background: '#d4a843',
                    border: '1px solid #d4a843', padding: '4px 14px',
                    cursor: 'pointer', letterSpacing: '0.08em',
                  }}>Next →</button>
                ) : (
                  <button onClick={() => setDialogueNpc(null)} style={{
                    fontFamily: '"Cinzel", serif', fontSize: '9px',
                    color: '#1a0e05', background: '#d4a843',
                    border: '1px solid #d4a843', padding: '4px 14px',
                    cursor: 'pointer', letterSpacing: '0.08em',
                  }}>Farewell ✦</button>
                )}
              </div>
            </div>

            {/* Speech bubble triangle pointing down toward NPC */}
            <div style={{
              position: 'absolute', bottom: '-10px', left: '50%',
              transform: 'translateX(-50%)', width: 0, height: 0,
              borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
              borderTop: '10px solid #8b6914',
            }} />
            <div style={{
              position: 'absolute', bottom: '-8px', left: '50%',
              transform: 'translateX(-50%)', width: 0, height: 0,
              borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
              borderTop: '8px solid #100a03',
            }} />
          </div>
        );
      })()}


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
                      const door = gameRef.current.level?.doors.find(d => d.id === 'exit_door_0');
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

import { Level } from './types';

export const LEVELS: Level[] = [
  // ============================================
  // LEVEL 0 — The Library (Prologue / Tutorial)
  // Smaller & denser: 3 mini-puzzles teach core
  // mechanics before the real journey begins.
  // ============================================
  {
    id: 0,
    name: 'Tbilisi Archives, 1938',
    type: 'library',
    entrance: { x: 60, y: 350 },
    exit: { x: 870, y: 350 },
    platforms: [
      // Continuous ground floor (no pits)
      { x: -100, y: 430, w: 1100, h: 100, style: 'stone' },
      // ── PUZZLE 1: Bookshelf Hop ──
      // Low shelf the player must jump onto then off
      { x: 240, y: 380, w: 100, h: 20, style: 'moss' },
      // ── Elevated scroll shelf (teaches double-jump / dash) ──
      { x: 440, y: 310, w: 80, h: 14, style: 'moss' },
      // Desk area — slightly raised step
      { x: 700, y: 400, w: 120, h: 30, style: 'stone' },
    ],
    triggers: [
      {
        id: 'exit_0',
        rect: { x: 870, y: 370, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      {
        id: 'door_0',
        x: 820,
        y: 350,
        w: 40,
        h: 80,
        open: false, // Opened when journey starts via book UI
        openProgress: 0,
      },
    ],
    enemies: [],
    collectibles: [
      // Scroll on elevated shelf — lore + hints
      { id: 'scroll_lib', x: 452, y: 282, type: 'scroll', collected: false },
      // Journal on desk — triggers the book overlay
      { id: 'journal_0', x: 740, y: 370, type: 'journal', collected: false },
    ],
    decorations: [
      { x: 80,  y: 390, type: 'torch' },
      { x: 350, y: 390, type: 'torch' },
      { x: 600, y: 390, type: 'torch' },
      { x: 820, y: 390, type: 'torch' },
    ],
    backgrounds: ['#1e140d', '#2c1e13', '#3d2b1a'],
  },

  // ============================================
  // LEVEL 1 — Temple of Athena (Tutorial, NO enemies)
  // Teach: movement, jumping, lever→door puzzle
  // ============================================
  {
    id: 1,
    name: 'Temple of Athena',
    type: 'ruins',
    entrance: { x: 60, y: 320 },
    exit: { x: 2400, y: 280 },
    platforms: [
      // Ground
      { x: -100, y: 400, w: 600, h: 120, style: 'stone' },
      // Stepping stones
      { x: 600, y: 370, w: 120, h: 30, style: 'marble' },
      { x: 780, y: 330, w: 100, h: 30, style: 'marble' },
      { x: 940, y: 290, w: 100, h: 30, style: 'marble' },
      // Upper platform with lever
      { x: 1080, y: 250, w: 200, h: 30, style: 'column_top' },
      // Platform after door
      { x: 1400, y: 400, w: 400, h: 120, style: 'stone' },
      // Bridge platforms
      { x: 1850, y: 350, w: 120, h: 30, style: 'marble' },
      { x: 2020, y: 310, w: 120, h: 30, style: 'marble' },
      // Exit area
      { x: 2180, y: 400, w: 400, h: 120, style: 'stone' },
      // Secret high platform (olive branch)
    ],
    triggers: [
      {
        id: 'exit_1',
        rect: { x: 2400, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [],
    enemies: [
      { x: 1500, y: 368, w: 28, h: 32, start: 1420, end: 1750, speed: 70, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 1950, y: 220, w: 28, h: 24, start: 1850, end: 2100, speed: 80, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 0.5 },
    ],
    collectibles: [
      { id: 'olive_1', x: 930, y: 155, type: 'olive_branch', collected: false },
      { id: 'apple_1', x: 1600, y: 360, type: 'golden_apple', collected: false },
    ],
    decorations: [
      { x: 100, y: 340, type: 'pillar' },
      { x: 350, y: 340, type: 'broken_pillar' },
      { x: 1500, y: 340, type: 'torch' },
      { x: 2250, y: 340, type: 'statue' },
    ],
    checkpoints: [
      { id: 'cp_1a', x: 1450, y: 370, activated: false },
    ],
    backgrounds: ['#1a1005', '#2c1e0f', '#3d2b1a'],
  },

  // ============================================
  // LEVEL 2 — Poseidon's Grotto
  // New: 1 Harpy + checkpoint mid-level
  // ============================================
  {
    id: 2,
    name: "Poseidon's Grotto",
    type: 'underwater',
    entrance: { x: 60, y: 300 },
    exit: { x: 2600, y: 300 },
    platforms: [
      // Start area
      { x: -100, y: 420, w: 400, h: 100, style: 'stone', color: '#1e3a5a' },
      // Pressure plate area
      { x: 400, y: 380, w: 200, h: 30, style: 'marble', color: '#1d4ed8' },
      // Post-door platforms
      { x: 750, y: 420, w: 300, h: 100, style: 'stone', color: '#1e3a5a' },
      // Vertical climb
      { x: 1100, y: 360, w: 100, h: 30, style: 'marble', color: '#1d4ed8' },
      { x: 1250, y: 300, w: 100, h: 30, style: 'marble', color: '#1d4ed8' },
      { x: 1100, y: 240, w: 100, h: 30, style: 'marble', color: '#1d4ed8' },
      // Upper plateau with lever
      { x: 1300, y: 200, w: 250, h: 30, style: 'column_top', color: '#1e3a5a' },
      // Second section
      { x: 1650, y: 420, w: 500, h: 100, style: 'stone', color: '#1e3a5a' },
      // Jump islands
      { x: 2200, y: 370, w: 100, h: 30, style: 'marble', color: '#1d4ed8' },
      // Exit
      { x: 2400, y: 420, w: 400, h: 100, style: 'stone', color: '#1e3a5a' },
    ],
    triggers: [
      {
        id: 'exit_2',
        rect: { x: 2600, y: 340, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [],
    enemies: [
      // Ground skeleton patrol
      { x: 1700, y: 388, w: 28, h: 32, start: 1660, end: 2100, speed: 80, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // ── NEW: Harpy — patrols above the vertical climb section ──
      // Placed at y:160 so the player must jump to reach bullet range
      { x: 1130, y: 160, w: 28, h: 24, start: 1050, end: 1380, speed: 90, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 0 },
    ],
    collectibles: [
      { id: 'olive_2', x: 1150, y: 200, type: 'olive_branch', collected: false },
      { id: 'apple_2', x: 2250, y: 330, type: 'golden_apple', collected: false },
      { id: 'ammo_2', x: 780, y: 390, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 50,   y: 360, type: 'vines' },
      { x: 800,  y: 360, type: 'pillar' },
      { x: 1700, y: 360, type: 'torch' },
      { x: 2500, y: 360, type: 'broken_pillar' },
    ],
    checkpoints: [
      { id: 'cp_2a', x: 800, y: 390, activated: false },
      { id: 'cp_2b', x: 1700, y: 390, activated: false },
    ],
    backgrounds: ['#06101e', '#0c1e36', '#12304e'],
  },

  // ============================================
  // LEVEL 3 — The Labyrinth
  // New: 1 Harpy + 1 Wall Lurker + checkpoint
  // ============================================
  {
    id: 3,
    name: 'The Labyrinth',
    type: 'labyrinth',
    entrance: { x: 60, y: 300 },
    exit: { x: 2800, y: 300 },
    platforms: [
      // Start
      { x: -100, y: 400, w: 500, h: 120, style: 'stone' },
      // Lower path
      { x: 500, y: 400, w: 300, h: 120, style: 'stone' },
      // Mid platforms
      { x: 900, y: 350, w: 150, h: 30, style: 'marble' },
      { x: 1100, y: 290, w: 150, h: 30, style: 'marble' },
      // Upper lever platform
      { x: 1300, y: 230, w: 200, h: 30, style: 'column_top' },
      // Central hub
      { x: 1550, y: 400, w: 400, h: 120, style: 'stone' },
      // Right side climb
      { x: 2000, y: 350, w: 120, h: 30, style: 'marble' },
      { x: 2160, y: 290, w: 120, h: 30, style: 'marble' },
      // Second lever platform
      { x: 2320, y: 230, w: 200, h: 30, style: 'column_top' },
      // Exit area
      { x: 2600, y: 400, w: 400, h: 120, style: 'stone' },
      // Secret upper path
      { x: 1400, y: 130, w: 80, h: 20, style: 'marble' },
    ],
    triggers: [
      {
        id: 'exit_3',
        rect: { x: 2800, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [],
    enemies: [
      // Ground skeletons
      { x: 600, y: 368, w: 28, h: 32, start: 510, end: 780, speed: 90, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 1650, y: 368, w: 28, h: 32, start: 1560, end: 1920, speed: 110, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // ── NEW: Harpy — patrols high above the mid-section ──
      { x: 1000, y: 220, w: 28, h: 24, start: 880, end: 1280, speed: 110, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 1.2 },
      // ── NEW: Wall Lurker — protrudes from the right side of the narrow corridor before door_3a ──
      // x/y = wall attachment point; w = max extend; h = height of hazard
      {
        x: 1518, y: 335, w: 36, h: 50, start: 0, end: 36, speed: 60,
        type: 'wall_lurker', animFrame: 0, animTimer: 0, alive: true,
        lurkerSide: 'left', lurkerPhase: 'waiting', lurkerTimer: 0, lurkerExtend: 0,
      },
    ],
    collectibles: [
      { id: 'olive_3',  x: 1420, y: 100, type: 'olive_branch', collected: false },
      { id: 'amphora_3', x: 1700, y: 360, type: 'amphora', collected: false },
      { id: 'ammo_3',   x: 1600, y: 370, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 200,  y: 340, type: 'torch' },
      { x: 550,  y: 340, type: 'bones' },
      { x: 1600, y: 340, type: 'pillar' },
      { x: 1850, y: 340, type: 'torch' },
      { x: 2650, y: 340, type: 'statue' },
    ],
    checkpoints: [
      { id: 'cp_3a', x: 1600, y: 370, activated: false },
      { id: 'cp_3b', x: 2650, y: 370, activated: false },
    ],
    backgrounds: ['#0f0a15', '#1a1225', '#251a35'],
  },

  // ============================================
  // LEVEL 4 — Hades' Gate (final, all mechanics)
  // New: 2 Harpies + 2 Wall Lurkers + checkpoints
  // ============================================
  {
    id: 4,
    name: "Hades' Gate",
    type: 'underworld',
    entrance: { x: 60, y: 300 },
    exit: { x: 3200, y: 250 },
    platforms: [
      // Entrance
      { x: -100, y: 400, w: 400, h: 120, style: 'stone' },
      // First gap
      { x: 400, y: 370, w: 100, h: 30, style: 'marble' },
      { x: 560, y: 330, w: 100, h: 30, style: 'marble' },
      // Pressure plate section
      { x: 720, y: 400, w: 300, h: 120, style: 'stone' },
      // Post door 1
      { x: 1120, y: 400, w: 300, h: 120, style: 'stone' },
      // Vertical section
      { x: 1480, y: 350, w: 100, h: 30, style: 'marble' },
      { x: 1630, y: 290, w: 100, h: 30, style: 'marble' },
      { x: 1480, y: 230, w: 100, h: 30, style: 'marble' },
      // Lever platform
      { x: 1650, y: 180, w: 200, h: 30, style: 'column_top' },
      // Bridge
      { x: 1900, y: 400, w: 500, h: 120, style: 'stone' },
      // Gauntlet
      { x: 2500, y: 370, w: 120, h: 30, style: 'marble' },
      { x: 2680, y: 330, w: 120, h: 30, style: 'marble' },
      // Final platform with fleece
      { x: 2900, y: 400, w: 500, h: 120, style: 'stone' },
      // Secret
      { x: 1700, y: 80, w: 80, h: 20, style: 'marble' },
    ],
    triggers: [
      {
        id: 'exit_4',
        rect: { x: 3200, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [],
    enemies: [
      // Ground skeletons
      { x: 1200, y: 368, w: 28, h: 32, start: 1130, end: 1400, speed: 100, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 2000, y: 368, w: 28, h: 32, start: 1910, end: 2380, speed: 120, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 2700, y: 298, w: 28, h: 32, start: 2690, end: 2790, speed: 70,  type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // ── NEW: Harpies ──
      // Harpy 1 — above the vertical climb section, very aggressive
      { x: 1500, y: 180, w: 28, h: 24, start: 1400, end: 1750, speed: 130, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 0.5 },
      // Harpy 2 — over the gauntlet platforms (forces aerial fight)
      { x: 2540, y: 260, w: 28, h: 24, start: 2460, end: 2800, speed: 120, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 2.1 },
      // ── NEW: Wall Lurkers ──
      // Lurker 1 — right side of narrow corridor before door_4b
      {
        x: 1858, y: 335, w: 40, h: 50, start: 0, end: 40, speed: 70,
        type: 'wall_lurker', animFrame: 0, animTimer: 0, alive: true,
        lurkerSide: 'right', lurkerPhase: 'waiting', lurkerTimer: 0, lurkerExtend: 0,
      },
      // Lurker 2 — left side of the final bridge approach (tighter timing)
      {
        x: 1900, y: 340, w: 44, h: 50, start: 0, end: 44, speed: 85,
        type: 'wall_lurker', animFrame: 0, animTimer: 0, alive: true,
        lurkerSide: 'left', lurkerPhase: 'waiting', lurkerTimer: 2.2, lurkerExtend: 0,
      },
      // Lurker 3 — Ceiling Lurker in Level 4 (over the final path)
      {
        x: 2150, y: 120, w: 50, h: 120, start: 0, end: 120, speed: 120,
        type: 'wall_lurker', animFrame: 0, animTimer: 0, alive: true,
        lurkerSide: 'ceiling', lurkerPhase: 'waiting', lurkerTimer: 1.0, lurkerExtend: 0,
      },
    ],
    collectibles: [
      { id: 'olive_4',  x: 1720, y: 50,  type: 'olive_branch', collected: false },
      { id: 'fleece',   x: 3100, y: 360, type: 'golden_fleece', collected: false },
      { id: 'ammo_4',   x: 1150, y: 370, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 100,  y: 340, type: 'torch' },
      { x: 500,  y: 330, type: 'bones' },
      { x: 1200, y: 340, type: 'torch' },
      { x: 1950, y: 340, type: 'statue' },
      { x: 2300, y: 340, type: 'torch' },
      { x: 3000, y: 340, type: 'pillar' },
      { x: 3150, y: 340, type: 'torch' },
    ],
    checkpoints: [
      { id: 'cp_4a', x: 1150, y: 370, activated: false },
      { id: 'cp_4b', x: 1950, y: 370, activated: false },
    ],
    backgrounds: ['#100508', '#1a0a10', '#250f18'],
  },
];

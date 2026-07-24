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
    exit: { x: 920, y: 210 },
    platforms: [
      // Continuous ground floor (no pits)
      { x: -100, y: 430, w: 1200, h: 100, style: 'stone' },
      
      // Dividing vertical wall separating left and right sections
      { x: 350, y: 0, w: 20, h: 350, style: 'stone' },

      // Left-side platforms (for puzzle climbing)
      { x: 20, y: 330, w: 100, h: 15, style: 'stone' },   // Platform L1
      { x: 180, y: 270, w: 100, h: 15, style: 'stone' },  // Platform L2
      { x: 20, y: 210, w: 100, h: 15, style: 'stone' },   // Platform L3
      { x: 60, y: 120, w: 290, h: 15, style: 'stone' },   // Platform L4 (top platform)

      // Right-side table for gun and book
      { x: 420, y: 395, w: 120, h: 35, style: 'stone' },

      // Stairway leading up to the exit portal
      { x: 580, y: 410, w: 40, h: 20, style: 'stone' },
      { x: 620, y: 390, w: 40, h: 40, style: 'stone' },
      { x: 660, y: 370, w: 40, h: 60, style: 'stone' },
      { x: 700, y: 350, w: 40, h: 80, style: 'stone' },
      { x: 740, y: 330, w: 40, h: 100, style: 'stone' },
      { x: 780, y: 310, w: 40, h: 120, style: 'stone' },
      { x: 820, y: 290, w: 180, h: 140, style: 'stone' }, // Landing platform
      { x: 1000, y: 0, w: 20, h: 430, style: 'stone' }, // Right boundary wall
    ],
    triggers: [
      {
        id: 'exit_0',
        rect: { x: 920, y: 210, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
      {
        id: 'lever_0',
        rect: { x: 310, y: 80, w: 30, h: 40 },
        type: 'lever',
        activated: false,
        linkedDoorId: 'door_0',
        persistent: true,
      },
    ],
    doors: [
      {
        id: 'door_0',
        x: 350,
        y: 350,
        w: 20,
        h: 80,
        open: false,
        openProgress: 0,
        color: '#2563eb', // Blue locked door — opened by lever
      },
      {
        id: 'exit_door_0',
        x: 920,
        y: 210,
        w: 50,
        h: 80,
        open: false,
        openProgress: 0,
        color: '#d4a843', // Yellow progression door — opened by journal/book
      },
    ],
    enemies: [],
    collectibles: [
      { id: 'journal_0',  x: 425, y: 365, type: 'journal', collected: false },
      { id: 'gun_pickup', x: 505, y: 365, type: 'gun',     collected: false },
    ],
    decorations: [
      { x: 30,  y: 330, type: 'torch' },
      { x: 190, y: 270, type: 'torch' },
      { x: 70,  y: 120, type: 'torch' },
      { x: 280, y: 120, type: 'torch' },
      { x: 440, y: 395, type: 'pillar' },
      { x: 600, y: 410, type: 'urn' },
      { x: 840, y: 290, type: 'torch' },
    ],
    ladders: [
      { x: 80, y: 120, w: 24, h: 90 }, // Connects Platform L3 to L4
    ],
    npcs: [
      {
        id: 'librarian',
        x: 230,
        y: 382,
        w: 24,
        h: 48,
        name: 'Head Librarian',
        dialogue: [
          "Greetings, traveler! Welcome to the Tbilisi Archives.",
          "To survive your expedition, you must master basic movement.",
          "Use A and D (or Arrow Keys) to run left and right.",
          "Press SPACE to jump, and press it again in mid-air to Double Jump!",
          "To climb ladders, stand near them and hold W to go up (or S to descend).",
          "The corridor to the right is locked. Climb up the left platforms to flip the lever at the top.",
          "You must retrieve the expedition Revolver from the table before leaving!",
          "Use the E key to flip levers, talk, and pick up items."
        ]
      }
    ],
    backgrounds: ['#1e140d', '#2c1e13', '#3d2b1a'],
  },

  // ============================================
  // LEVEL 1 — The Shore of Colchis
  // ============================================
  {
    id: 1,
    name: "The Shore of Colchis",
    type: 'shore',
    entrance: { x: 60, y: 380 },
    exit: { x: 1350, y: 180 },
    platforms: [
      // Starting water boundary platform (not solid, but keeps player on land)
      { x: -200, y: 460, w: 500, h: 60, style: 'stone', color: '#1e3a5a' },
      // Land
      { x: 300, y: 420, w: 300, h: 100, style: 'moss', color: '#1b3f1b' },
      // Stairs ascending to Mausoleum closed gate
      { x: 600, y: 400, w: 40, h: 120, style: 'stone' },
      { x: 640, y: 380, w: 40, h: 140, style: 'stone' },
      { x: 680, y: 360, w: 120, h: 160, style: 'stone' },
      // The high vertical wall containing the gate
      { x: 800, y: 160, w: 30, h: 200, style: 'stone' },
      // New platform spanning the gap between wall and wood platform
      { x: 830, y: 160, w: 90, h: 20, style: 'stone' },
      // Wood platform (destructible) - placed at x: 920, y: 160
      { x: 920, y: 160, w: 80, h: 15, style: 'stone', color: '#8b5a2b' }, // Custom color for wood look
      // Cliff on the right with the boulder slope
      { x: 1000, y: 160, w: 100, h: 20, style: 'stone' },
      { x: 1100, y: 140, w: 50, h: 40, style: 'stone' },
      { x: 1150, y: 120, w: 50, h: 60, style: 'stone' },
      { x: 1200, y: 0, w: 200, h: 180, style: 'stone' }, // Right boundary wall / boulder nesting place
      // Platform above the puzzle where the boulder sits
      { x: 1020, y: 50, w: 180, h: 15, style: 'stone' },
      
       { x: 1160, y: 260, w: 240, h: 220, style: 'stone' }, // Exit wall / exit ground
    ],
    triggers: [
      {
        id: 'exit_2',
        rect: { x: 1350, y: 180, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      {
        id: 'exit_door_2',
        x: 1350,
        y: 180,
        w: 50,
        h: 80,
        open: true,
        openProgress: 1.0,
        color: '#d4a843',
      },
      // The Closed Gate at the bottom of mausoleum
      {
        id: 'closed_gate_2',
        x: 800,
        y: 280,
        w: 30,
        h: 80,
        open: false,
        openProgress: 0,
        color: '#2563eb', // Blue gate
      }
    ],
    enemies: [],
    collectibles: [],
    decorations: [
      { x: 350,  y: 420, type: 'brazier' },
      { x: 520,  y: 420, type: 'broken_pillar' },
      { x: 700,  y: 360, type: 'torch' },
      { x: 1020, y: 160, type: 'urn' },
      { x: 1180, y: 260, type: 'brazier' },
    ],
    checkpoints: [
      { id: 'cp_2a', x: 350, y: 370, activated: false },
      { id: 'cp_2b', x: 1170, y: 210, activated: false },
    ],
    ladders: [
      { x: 950, y: 160, w: 20, h: 320 }, // Revealed ladder inside mausoleum (usable after wood breaks)
    ],
    npcs: [
      {
        id: 'npc_level2',
        x: 460,
        y: 372,
        w: 24,
        h: 48,
        name: 'Wandering Scholar',
        dialogue: [
          "Ah, another traveler seeking the Golden Fleece... or what remains of it.",
          "The path ahead is blocked, but this Grappling Hook might help you scale the cliffs.",
          "Simply press 'E' when near an anchor point to launch it.",
          "Beware of the ancient mausoleum... only those who know the legend of the Golden Ram may enter."
        ]
      }
    ],
    grapples: [
      { x: 760, y: 180 }, // Upper grappling hook point on the wall
    ],
    backgrounds: ['#0f172a', '#1e293b', '#334155'],
  },

  // ============================================
  // LEVEL 2 — Temple of Athena (Expanded World with Mobs)
  // Length: ~3600px width. Features double-jump platforms,
  // high terrace ruins, and patrolling skeletons + harpies.
  // ============================================
  {
    id: 2,
    name: 'Temple of Athena',
    type: 'ruins',
    entrance: { x: 60, y: 320 },
    exit: { x: 3500, y: 320 },
    platforms: [
      // Section 1: Entrance ground & introductory ruins
      { x: -100, y: 400, w: 600, h: 120, style: 'stone' },
      { x: 600, y: 370, w: 120, h: 30, style: 'marble' },
      { x: 780, y: 330, w: 100, h: 30, style: 'marble' },
      { x: 940, y: 290, w: 100, h: 30, style: 'marble' },

      // Upper platform with secret olive branch
      { x: 1080, y: 250, w: 200, h: 30, style: 'column_top' },
      { x: 1110, y: 160, w: 80, h: 20, style: 'marble' },

      // Section 2: Middle Courtyard & Colonnade
      { x: 1400, y: 400, w: 500, h: 120, style: 'stone' },
      { x: 1950, y: 350, w: 130, h: 30, style: 'marble' },
      { x: 2120, y: 310, w: 130, h: 30, style: 'marble' },
      { x: 2300, y: 270, w: 180, h: 30, style: 'column_top' },

      // Section 3: High Temple Terraces & Exit Cavern
      { x: 2520, y: 400, w: 600, h: 120, style: 'stone' },
      { x: 3160, y: 350, w: 120, h: 30, style: 'marble' },
      { x: 3320, y: 400, w: 900, h: 120, style: 'stone' }, // Exit ground
      { x: 3320, y: 0, w: 900, h: 240, style: 'stone' }, // Cave ceiling
      { x: 3600, y: 240, w: 600, h: 160, style: 'stone' }, // Cave right boundary
    ],
    triggers: [
      {
        id: 'exit_2',
        rect: { x: 3500, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      {
        id: 'door_2',
        x: 3500,
        y: 320,
        w: 50,
        h: 80,
        open: false,
        openProgress: 0,
        color: '#d4a843',
      },
    ],
    enemies: [
      // 1. Entrance Skeleton
      { x: 300, y: 368, w: 28, h: 32, start: 180, end: 480, speed: 85, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 2. Air Harpy over first stepping stones
      { x: 750, y: 200, w: 28, h: 24, start: 650, end: 950, speed: 90, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 0.5 },
      // 3. Courtyard Skeleton
      { x: 1500, y: 368, w: 28, h: 32, start: 1420, end: 1750, speed: 95, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 4. Upper Air Harpy over central colonnade
      { x: 1950, y: 210, w: 28, h: 24, start: 1800, end: 2150, speed: 105, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 1.1 },
      // 5. Colonnade Guard Skeleton
      { x: 2320, y: 238, w: 28, h: 32, start: 2300, end: 2460, speed: 80, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 6. Terrace Skeleton
      { x: 2700, y: 368, w: 28, h: 32, start: 2560, end: 2950, speed: 110, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 7. Exit Gate Harpy
      { x: 3300, y: 190, w: 28, h: 24, start: 3150, end: 3450, speed: 115, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 0.8 },
    ],
    collectibles: [
      { id: 'olive_1', x: 1130, y: 130, type: 'olive_branch', collected: false },
      { id: 'apple_1', x: 1600, y: 360, type: 'golden_apple', collected: false },
      { id: 'ammo_2a', x: 1420, y: 370, type: 'ammo_refill', collected: false },
      { id: 'ammo_2b', x: 2340, y: 240, type: 'ammo_refill', collected: false },
      { id: 'ammo_2c', x: 2800, y: 370, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 100,  y: 400, type: 'pillar' },
      { x: 350,  y: 400, type: 'broken_pillar' },
      { x: 480,  y: 400, type: 'urn' },
      { x: 1100, y: 250, type: 'torch' },
      { x: 1450, y: 400, type: 'torch' },
      { x: 1650, y: 400, type: 'pillar' },
      { x: 2310, y: 270, type: 'brazier' },
      { x: 2750, y: 400, type: 'pillar' },
      { x: 3350, y: 400, type: 'brazier' },
    ],
    checkpoints: [
      { id: 'cp_2a', x: 1450, y: 362, activated: false },
      { id: 'cp_2b', x: 2550, y: 362, activated: false },
    ],
    npcs: [],
    backgrounds: ['#1a1005', '#2c1e0f', '#3d2b1a'],
  },

  // ============================================
  // LEVEL 3 — The Labyrinth (Expanded Dungeon Complex)
  // Length: ~4000px width. Features multiple maze levels,
  // pit crossings, lever gates, and aggressive mob patrols.
  // ============================================
  {
    id: 3,
    name: 'The Labyrinth',
    type: 'labyrinth',
    entrance: { x: 60, y: 300 },
    exit: { x: 3850, y: 320 },
    platforms: [
      // Section 1: Dungeon Entrance & Lower Catacombs
      { x: -100, y: 400, w: 500, h: 120, style: 'stone' },
      { x: 500, y: 400, w: 300, h: 120, style: 'stone' },
      { x: 900, y: 350, w: 150, h: 30, style: 'marble' },
      { x: 1100, y: 290, w: 150, h: 30, style: 'marble' },
      { x: 1300, y: 230, w: 200, h: 30, style: 'column_top' },

      // Section 2: Central Hub & Secret Upper Chamber
      { x: 1550, y: 400, w: 400, h: 120, style: 'stone' },
      { x: 1400, y: 130, w: 80, h: 20, style: 'marble' },

      // Section 3: The Great Chasm Climb
      { x: 2000, y: 350, w: 130, h: 30, style: 'marble' },
      { x: 2160, y: 290, w: 130, h: 30, style: 'marble' },
      { x: 2320, y: 230, w: 200, h: 30, style: 'column_top' },

      // Section 4: Deep Cavern & Second Labyrinth Hall
      { x: 2600, y: 400, w: 500, h: 120, style: 'stone' },
      { x: 3150, y: 340, w: 130, h: 30, style: 'marble' },
      { x: 3320, y: 280, w: 140, h: 30, style: 'marble' },

      // Section 5: Exit Portal Sanctum
      { x: 3500, y: 400, w: 1000, h: 120, style: 'stone' },
      { x: 3500, y: 0, w: 1000, h: 240, style: 'stone' }, // Ceiling
      { x: 3950, y: 240, w: 550, h: 160, style: 'stone' }, // Wall
    ],
    triggers: [
      {
        id: 'exit_3',
        rect: { x: 3850, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      {
        id: 'door_3',
        x: 3850,
        y: 320,
        w: 50,
        h: 80,
        open: false,
        openProgress: 0,
      },
    ],
    enemies: [
      // 1. Lower Catacomb Skeleton
      { x: 600, y: 368, w: 28, h: 32, start: 510, end: 780, speed: 90, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 2. Mid Air Harpy
      { x: 1000, y: 220, w: 28, h: 24, start: 880, end: 1280, speed: 110, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 1.2 },
      // 3. Central Hub Skeleton
      { x: 1650, y: 368, w: 28, h: 32, start: 1560, end: 1920, speed: 110, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 4. Chasm Air Harpy
      { x: 2100, y: 190, w: 28, h: 24, start: 1950, end: 2350, speed: 120, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 0.7 },
      // 5. Deep Cavern Skeleton 1
      { x: 2750, y: 368, w: 28, h: 32, start: 2620, end: 3050, speed: 105, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 6. Deep Cavern Skeleton 2
      { x: 2950, y: 368, w: 28, h: 32, start: 2700, end: 3080, speed: 125, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // 7. Exit Sanctum Air Harpy
      { x: 3300, y: 180, w: 28, h: 24, start: 3150, end: 3550, speed: 130, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 1.4 },
      // 8. Exit Guard Skeleton
      { x: 3650, y: 368, w: 28, h: 32, start: 3520, end: 3800, speed: 115, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
    ],
    collectibles: [
      { id: 'olive_3',   x: 1420, y: 100, type: 'olive_branch', collected: false },
      { id: 'amphora_3', x: 1700, y: 360, type: 'amphora', collected: false },
      { id: 'ammo_3a',   x: 1600, y: 370, type: 'ammo_refill', collected: false },
      { id: 'ammo_3b',   x: 2340, y: 200, type: 'ammo_refill', collected: false },
      { id: 'ammo_3c',   x: 2800, y: 370, type: 'ammo_refill', collected: false },
      { id: 'ammo_3d',   x: 3400, y: 250, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 200,  y: 400, type: 'torch' },
      { x: 550,  y: 400, type: 'bones' },
      { x: 920,  y: 350, type: 'urn' },
      { x: 1320, y: 230, type: 'torch' },
      { x: 1600, y: 400, type: 'broken_pillar' },
      { x: 1850, y: 400, type: 'torch' },
      { x: 2340, y: 230, type: 'torch' },
      { x: 2750, y: 400, type: 'brazier' },
      { x: 3600, y: 400, type: 'torch' },
    ],
    checkpoints: [
      { id: 'cp_3a', x: 1600, y: 370, activated: false },
      { id: 'cp_3b', x: 2650, y: 370, activated: false },
      { id: 'cp_3c', x: 3550, y: 370, activated: false },
    ],
    backgrounds: ['#0f0a15', '#1a1225', '#251a35'],
  },

  // ============================================
  // LEVEL 4 — Hades' Gate (Expanded Underworld & Boss Gauntlet)
  // Length: ~3600px width. Extended underworld gauntlet with
  // multiple enemy mobs guarding the descent into the Chimera Arena!
  // ============================================
  {
    id: 4,
    name: "Hades' Gate",
    type: 'underworld',
    entrance: { x: 60, y: 350 },
    exit: { x: 3380, y: 360 },
    platforms: [
      // ── Section 1: Underworld Entrance Corridor ──
      { x: -100, y: 400, w: 500, h: 120, style: 'stone' },
      { x: 400, y: 370, w: 110, h: 30, style: 'marble' },
      { x: 560, y: 340, w: 110, h: 30, style: 'marble' },
      { x: 720, y: 400, w: 400, h: 120, style: 'stone' },

      // ── Section 2: Extended Gauntlet & Bridge of Spirits ──
      { x: 1170, y: 350, w: 120, h: 30, style: 'marble' },
      { x: 1340, y: 310, w: 120, h: 30, style: 'marble' },
      { x: 1500, y: 400, w: 450, h: 120, style: 'stone' }, // Pre-arena staging ground

      // ── Section 3: Boss Arena (x: 2000 to x: 3100) ──
      { x: 2000, y: 400, w: 1100, h: 120, style: 'stone' }, // Arena floor
      { x: 2000, y: 0,   w: 1100, h: 60,  style: 'stone' }, // Arena ceiling
      { x: 1980, y: 60,  w: 20,   h: 340, style: 'stone' }, // Arena LEFT wall
      { x: 3100, y: 60,  w: 20,   h: 340, style: 'stone' }, // Arena RIGHT wall

      // Floating arena platforms (for dodging Chimera + weakspot shooting)
      { x: 2080, y: 280, w: 120, h: 20, style: 'marble' },
      { x: 2300, y: 200, w: 120, h: 20, style: 'marble' },
      { x: 2520, y: 270, w: 120, h: 20, style: 'marble' },
      { x: 2750, y: 200, w: 120, h: 20, style: 'marble' },
      { x: 2960, y: 300, w: 100, h: 20, style: 'marble' },

      // ── Section 4: Post-arena Fleece Alcove ──
      { x: 3120, y: 400, w: 400, h: 120, style: 'stone' },
    ],
    triggers: [
      {
        id: 'exit_4',
        rect: { x: 3380, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      // Arena entry gate
      {
        id: 'boss_gate',
        x: 2000,
        y: 60,
        w: 20,
        h: 340,
        open: false,
        openProgress: 0,
        color: '#7f1d1d',
      },
      // Progression exit door
      {
        id: 'door_4',
        x: 3380,
        y: 320,
        w: 50,
        h: 80,
        open: false,
        openProgress: 0,
        color: '#d4a843',
      },
    ],
    enemies: [
      // Entrance Corridor Mob 1 (Skeleton)
      { x: 800, y: 368, w: 28, h: 32, start: 730, end: 1080, speed: 100, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // Entrance Corridor Mob 2 (Skeleton)
      { x: 950, y: 368, w: 28, h: 32, start: 730, end: 1080, speed: 125, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // Gauntlet Air Harpy
      { x: 1250, y: 190, w: 28, h: 24, start: 1100, end: 1450, speed: 115, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 1.0 },
      // Pre-Arena Staging Skeleton 1
      { x: 1600, y: 368, w: 28, h: 32, start: 1520, end: 1900, speed: 110, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // Pre-Arena Staging Skeleton 2
      { x: 1780, y: 368, w: 28, h: 32, start: 1550, end: 1920, speed: 130, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
    ],
    collectibles: [
      { id: 'ammo_4a', x: 760,  y: 370, type: 'ammo_refill', collected: false },
      { id: 'ammo_4b', x: 1000, y: 370, type: 'ammo_refill', collected: false },
      { id: 'ammo_4c', x: 1650, y: 370, type: 'ammo_refill', collected: false },
      { id: 'ammo_4d', x: 1850, y: 370, type: 'ammo_refill', collected: false },
      // The Golden Fleece — spawns after boss defeated
      { id: 'fleece', x: 3280, y: 360, type: 'golden_fleece', collected: false },
    ],
    decorations: [
      { x: 100,  y: 400, type: 'torch' },
      { x: 500,  y: 400, type: 'bones' },
      { x: 900,  y: 400, type: 'brazier' },
      { x: 1080, y: 400, type: 'pillar' },
      { x: 1600, y: 400, type: 'brazier' },
      { x: 2100, y: 280, type: 'torch' },
      { x: 2980, y: 300, type: 'torch' },
      { x: 3200, y: 400, type: 'brazier' },
    ],
    checkpoints: [
      { id: 'cp_4a', x: 1040, y: 362, activated: false },
      { id: 'cp_4b', x: 1800, y: 362, activated: false },
    ],
    backgrounds: ['#100508', '#1a0a10', '#250f18'],
  },

];

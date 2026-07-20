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
      { x: 80,  y: 390, type: 'torch' },
      { x: 300, y: 390, type: 'torch' },
      { x: 600, y: 390, type: 'torch' },
      { x: 820, y: 390, type: 'torch' },
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
      { x: 380, y: 360, type: 'torch' },
      { x: 1200, y: 200, type: 'torch' },
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
  // LEVEL 2 — Temple of Athena (Tutorial, NO enemies)
  // Teach: movement, jumping, lever→door puzzle
  // ============================================
  {
    id: 2,
    name: 'Temple of Athena',
    type: 'ruins',
    entrance: { x: 60, y: 320 },
    exit: { x: 2500, y: 320 },
    platforms: [
      // Ground
      { x: -100, y: 400, w: 600, h: 120, style: 'stone' },
      // Stepping stones
      { x: 600, y: 370, w: 120, h: 30, style: 'marble' },
      { x: 780, y: 330, w: 100, h: 30, style: 'marble' },
      { x: 940, y: 290, w: 100, h: 30, style: 'marble' },
      // Upper platform with lever (accessible via double-jump from stepping stones)
      { x: 1080, y: 250, w: 200, h: 30, style: 'column_top' },
      // High secret platform for olive branch (reachable by double-jumping from lever platform)
      { x: 1110, y: 160, w: 80, h: 20, style: 'marble' },
      // Platform after door
      { x: 1400, y: 400, w: 400, h: 120, style: 'stone' },
      // Bridge platforms
      { x: 1850, y: 350, w: 120, h: 30, style: 'marble' },
      { x: 2020, y: 310, w: 120, h: 30, style: 'marble' },
      // Exit area
      { x: 2180, y: 400, w: 1200, h: 120, style: 'stone' },
      // Cavern tunnel enclosing exit portal (stretched out to block background)
      { x: 2180, y: 0, w: 1200, h: 240, style: 'stone' }, // Cave ceiling
      { x: 2550, y: 240, w: 800, h: 160, style: 'stone' }, // Cave right wall
    ],
    triggers: [
      {
        id: 'exit_2',
        rect: { x: 2500, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      // Golden exit door — opens by proximity when player approaches (shifted right)
      {
        id: 'door_2',
        x: 2500,
        y: 320,
        w: 50,
        h: 80,
        open: false,
        openProgress: 0,
        color: '#d4a843',
      },
    ],
    enemies: [
      { x: 1500, y: 368, w: 28, h: 32, start: 1420, end: 1750, speed: 70, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 1950, y: 220, w: 28, h: 24, start: 1850, end: 2100, speed: 80, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 0.5 },
    ],
    collectibles: [
      // Olive branch placed on the reachable high secret platform above the lever
      { id: 'olive_1', x: 1130, y: 130, type: 'olive_branch', collected: false },
      { id: 'apple_1', x: 1600, y: 360, type: 'golden_apple', collected: false },
    ],
    decorations: [
      { x: 100, y: 340, type: 'pillar' },
      { x: 350, y: 340, type: 'broken_pillar' },
      { x: 1500, y: 340, type: 'torch' },
    ],
    checkpoints: [
      { id: 'cp_2a', x: 1450, y: 362, activated: false },
    ],
    npcs: [],
    backgrounds: ['#1a1005', '#2c1e0f', '#3d2b1a'],
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
    exit: { x: 2850, y: 320 },
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
      { x: 2600, y: 400, w: 1200, h: 120, style: 'stone' },
      // Cavern tunnel enclosing exit portal (blocks background on the right)
      { x: 2600, y: 0, w: 1200, h: 240, style: 'stone' }, // Cave ceiling
      { x: 2900, y: 240, w: 900, h: 160, style: 'stone' }, // Cave right wall
      // Secret upper path
      { x: 1400, y: 130, w: 80, h: 20, style: 'marble' },
    ],
    triggers: [
      {
        id: 'exit_3',
        rect: { x: 2850, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      {
        id: 'door_3',
        x: 2850,
        y: 320,
        w: 50,
        h: 80,
        open: false,
        openProgress: 0,
      },
    ],
    enemies: [
      // Ground skeletons
      { x: 600, y: 368, w: 28, h: 32, start: 510, end: 780, speed: 90, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 1650, y: 368, w: 28, h: 32, start: 1560, end: 1920, speed: 110, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      // ── NEW: Harpy — patrols high above the mid-section ──
      { x: 1000, y: 220, w: 28, h: 24, start: 880, end: 1280, speed: 110, type: 'harpy', animFrame: 0, animTimer: 0, alive: true, flyOffset: 1.2 },
    ],
    collectibles: [
      { id: 'olive_3',  x: 1420, y: 100, type: 'olive_branch', collected: false },
      { id: 'amphora_3', x: 1700, y: 360, type: 'amphora', collected: false },
      { id: 'ammo_3',   x: 1600, y: 370, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 200,  y: 340, type: 'torch' },
      { x: 550,  y: 340, type: 'bones' },
      { x: 1850, y: 340, type: 'torch' },
    ],
    checkpoints: [
      { id: 'cp_3a', x: 1600, y: 370, activated: false },
      { id: 'cp_3b', x: 2650, y: 370, activated: false },
    ],
    backgrounds: ['#0f0a15', '#1a1225', '#251a35'],
  },

  // ============================================
  // LEVEL 4 — Hades' Gate (Boss Fight)
  // ============================================
  {
    id: 4,
    name: "Hades' Gate",
    type: 'underworld',
    entrance: { x: 60, y: 350 },
    exit: { x: 2480, y: 360 },
    platforms: [
      // ── Entrance corridor ──
      { x: -100, y: 400, w: 500, h: 120, style: 'stone' },
      // Step up
      { x: 400, y: 370, w: 100, h: 30, style: 'marble' },
      { x: 560, y: 340, w: 100, h: 30, style: 'marble' },
      // Pre-arena ground
      { x: 720, y: 400, w: 600, h: 120, style: 'stone' },
      // ── Boss Arena (x: 1300 to x: 2300) ──
      // Arena floor
      { x: 1300, y: 400, w: 1000, h: 120, style: 'stone' },
      // Arena ceiling
      { x: 1300, y: 0,   w: 1000, h: 60,  style: 'stone' },
      // Arena LEFT wall (entry side — becomes solid once fight starts)
      { x: 1280, y: 60,  w: 20,   h: 340, style: 'stone' },
      // Arena RIGHT wall (exit side — becomes solid until boss dies, drawn dynamically)
      { x: 2300, y: 60,  w: 20,   h: 340, style: 'stone' },
      // Floating platforms inside arena (for dodging + ammo)
      { x: 1380, y: 280, w: 120,  h: 20,  style: 'marble' },
      { x: 1600, y: 200, w: 120,  h: 20,  style: 'marble' },
      { x: 1820, y: 270, w: 120,  h: 20,  style: 'marble' },
      { x: 2050, y: 200, w: 120,  h: 20,  style: 'marble' },
      { x: 2160, y: 300, w: 100,  h: 20,  style: 'marble' },
      // ── Post-arena: Fleece alcove ──
      { x: 2320, y: 400, w: 300,  h: 120, style: 'stone' },
    ],
    triggers: [
      {
        id: 'exit_4',
        rect: { x: 2480, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      // Arena entry gate (player presses E here to start fight)
      {
        id: 'boss_gate',
        x: 1300,
        y: 60,
        w: 20,
        h: 340,
        open: false,
        openProgress: 0,
        color: '#7f1d1d',
      },
      // Progression exit door (appears after boss death)
      {
        id: 'door_4',
        x: 2480,
        y: 320,
        w: 50,
        h: 80,
        open: false,
        openProgress: 0,
        color: '#d4a843',
      },
    ],
    enemies: [
      // Two skeletons in the entrance corridor to warm up
      { x: 800, y: 368, w: 28, h: 32, start: 730, end: 1080, speed: 100, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 950, y: 368, w: 28, h: 32, start: 730, end: 1080, speed: 120, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
    ],
    collectibles: [
      { id: 'ammo_4a', x: 760,  y: 370, type: 'ammo_refill', collected: false },
      { id: 'ammo_4b', x: 1000, y: 370, type: 'ammo_refill', collected: false },
      // The Golden Fleece — spawns after boss defeated
      { id: 'fleece', x: 2400, y: 360, type: 'golden_fleece', collected: false },
    ],
    decorations: [
      { x: 100,  y: 340, type: 'torch' },
      { x: 500,  y: 330, type: 'bones' },
      { x: 900,  y: 340, type: 'torch' },
      { x: 2380, y: 340, type: 'torch' },
    ],
    checkpoints: [
      { id: 'cp_4a', x: 1150, y: 370, activated: false },
    ],
    backgrounds: ['#100508', '#1a0a10', '#250f18'],
  },

];

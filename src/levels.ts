import { Level } from './types';

export const LEVELS: Level[] = [
  // ============================================
  // LEVEL 0 — The Library (Prologue / Menu)
  // ============================================
  {
    id: 0,
    name: 'Tbilisi Archives, 1938',
    type: 'library',
    entrance: { x: 60, y: 350 },
    exit: { x: 1200, y: 350 },
    platforms: [
      { x: -100, y: 450, w: 1400, h: 100, style: 'stone' },
      { x: 300, y: 410, w: 150, h: 40, style: 'stone' },
    ],
    triggers: [
      {
        id: 'exit_0',
        rect: { x: 1100, y: 370, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      {
        id: 'door_0',
        x: 1050,
        y: 370,
        w: 40,
        h: 80,
        open: false, // Opened by interacting with the journal UI button
        openProgress: 0,
      },
    ],
    enemies: [],
    collectibles: [
      { id: 'journal_0', x: 360, y: 380, type: 'journal', collected: false },
    ],
    decorations: [
      { x: 200, y: 390, type: 'torch' },
      { x: 800, y: 390, type: 'torch' },
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
      { x: 900, y: 150, w: 80, h: 20, style: 'marble' },
    ],
    triggers: [
      {
        id: 'lever_1',
        rect: { x: 1200, y: 210, w: 30, h: 40 },
        type: 'lever',
        activated: false,
        linkedDoorId: 'door_1',
        persistent: true,
      },
      {
        id: 'exit_1',
        rect: { x: 2400, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      {
        id: 'door_1',
        x: 1350,
        y: 320,
        w: 40,
        h: 80,
        open: false,
        openProgress: 0,
      },
    ],
    enemies: [],
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
    backgrounds: ['#1a1005', '#2c1e0f', '#3d2b1a'],
  },

  // ============================================
  // LEVEL 2 — Poseidon's Grotto (pressure plates, 1 enemy mid-level)
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
        id: 'plate_1',
        rect: { x: 480, y: 350, w: 40, h: 30 },
        type: 'pressure_plate',
        activated: false,
        linkedDoorId: 'door_2a',
        persistent: false,
      },
      {
        id: 'lever_2',
        rect: { x: 1450, y: 160, w: 30, h: 40 },
        type: 'lever',
        activated: false,
        linkedDoorId: 'door_2b',
        persistent: true,
      },
      {
        id: 'exit_2',
        rect: { x: 2600, y: 340, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      { id: 'door_2a', x: 700, y: 340, w: 40, h: 80, open: false, openProgress: 0 },
      { id: 'door_2b', x: 1600, y: 340, w: 40, h: 80, open: false, openProgress: 0 },
    ],
    enemies: [
      { x: 1700, y: 388, w: 28, h: 32, start: 1660, end: 2100, speed: 80, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
    ],
    collectibles: [
      { id: 'olive_2', x: 1150, y: 200, type: 'olive_branch', collected: false },
      { id: 'apple_2', x: 2250, y: 330, type: 'golden_apple', collected: false },
      { id: 'ammo_2', x: 780, y: 390, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 50, y: 360, type: 'vines' },
      { x: 800, y: 360, type: 'pillar' },
      { x: 1700, y: 360, type: 'torch' },
      { x: 2500, y: 360, type: 'broken_pillar' },
    ],
    backgrounds: ['#06101e', '#0c1e36', '#12304e'],
  },

  // ============================================
  // LEVEL 3 — The Labyrinth (multi-lever puzzle, skeleton patrol)
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
        id: 'lever_3a',
        rect: { x: 1400, y: 190, w: 30, h: 40 },
        type: 'lever',
        activated: false,
        linkedDoorId: 'door_3a',
        persistent: true,
      },
      {
        id: 'lever_3b',
        rect: { x: 2420, y: 190, w: 30, h: 40 },
        type: 'lever',
        activated: false,
        linkedDoorId: 'door_3b',
        persistent: true,
      },
      {
        id: 'exit_3',
        rect: { x: 2800, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      { id: 'door_3a', x: 1520, y: 320, w: 40, h: 80, open: false, openProgress: 0 },
      { id: 'door_3b', x: 2570, y: 320, w: 40, h: 80, open: false, openProgress: 0 },
    ],
    enemies: [
      { x: 600, y: 368, w: 28, h: 32, start: 510, end: 780, speed: 90, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 1650, y: 368, w: 28, h: 32, start: 1560, end: 1920, speed: 110, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
    ],
    collectibles: [
      { id: 'olive_3', x: 1420, y: 100, type: 'olive_branch', collected: false },
      { id: 'amphora_3', x: 1700, y: 360, type: 'amphora', collected: false },
      { id: 'ammo_3', x: 1600, y: 370, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 200, y: 340, type: 'torch' },
      { x: 550, y: 340, type: 'bones' },
      { x: 1600, y: 340, type: 'pillar' },
      { x: 1850, y: 340, type: 'torch' },
      { x: 2650, y: 340, type: 'statue' },
    ],
    backgrounds: ['#0f0a15', '#1a1225', '#251a35'],
  },

  // ============================================
  // LEVEL 4 — Hades' Gate (final, all mechanics, Golden Fleece)
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
        id: 'plate_4a',
        rect: { x: 850, y: 370, w: 40, h: 30 },
        type: 'pressure_plate',
        activated: false,
        linkedDoorId: 'door_4a',
        persistent: false,
      },
      {
        id: 'lever_4a',
        rect: { x: 1760, y: 140, w: 30, h: 40 },
        type: 'lever',
        activated: false,
        linkedDoorId: 'door_4b',
        persistent: true,
      },
      {
        id: 'exit_4',
        rect: { x: 3200, y: 320, w: 50, h: 80 },
        type: 'exit',
        activated: false,
      },
    ],
    doors: [
      { id: 'door_4a', x: 1070, y: 320, w: 40, h: 80, open: false, openProgress: 0 },
      { id: 'door_4b', x: 1860, y: 320, w: 40, h: 80, open: false, openProgress: 0 },
    ],
    enemies: [
      { x: 1200, y: 368, w: 28, h: 32, start: 1130, end: 1400, speed: 100, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 2000, y: 368, w: 28, h: 32, start: 1910, end: 2380, speed: 120, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
      { x: 2700, y: 298, w: 28, h: 32, start: 2690, end: 2790, speed: 70, type: 'skeleton', animFrame: 0, animTimer: 0, alive: true },
    ],
    collectibles: [
      { id: 'olive_4', x: 1720, y: 50, type: 'olive_branch', collected: false },
      { id: 'fleece', x: 3100, y: 360, type: 'golden_fleece', collected: false },
      { id: 'ammo_4', x: 1150, y: 370, type: 'ammo_refill', collected: false },
    ],
    decorations: [
      { x: 100, y: 340, type: 'torch' },
      { x: 500, y: 330, type: 'bones' },
      { x: 1200, y: 340, type: 'torch' },
      { x: 1950, y: 340, type: 'statue' },
      { x: 2300, y: 340, type: 'torch' },
      { x: 3000, y: 340, type: 'pillar' },
      { x: 3150, y: 340, type: 'torch' },
    ],
    backgrounds: ['#100508', '#1a0a10', '#250f18'],
  },
];

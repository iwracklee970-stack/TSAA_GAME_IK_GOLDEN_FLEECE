export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
}

// --- Animation Types ---
export type AnimationState = 'idle' | 'walk' | 'jump_rise' | 'jump_fall' | 'dash';

export interface SpriteFrame {
  duration: number; // ms per frame
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  grounded: boolean;
  direction: 1 | -1;
  // Animation
  animState: AnimationState;
  animFrame: number;
  animTimer: number;
  // Dash
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  canAirDash: boolean;
  dashInvincible: boolean;
  // Double Jump
  hasDoubleJumped: boolean;
  jumpReleased: boolean;
  // Revolver
  bullets: number;
  // Afterimages for dash trail
  afterimages: AfterImage[];
}

export interface AfterImage {
  x: number;
  y: number;
  direction: 1 | -1;
  alpha: number;
  animState: AnimationState;
  animFrame: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  direction: 1 | -1;
  speed: number;
  active: boolean;
}

// --- Level Types ---
export type LevelType = 'ruins' | 'underwater' | 'labyrinth' | 'underworld' | 'library';

export interface Level {
  id: number;
  name: string;
  type: LevelType;
  platforms: Platform[];
  triggers: Trigger[];
  entrance: Point;
  exit: Point;
  enemies: Enemy[];
  backgrounds: string[];
  collectibles: Collectible[];
  doors: Door[];
  decorations: Decoration[];
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  style?: 'stone' | 'marble' | 'moss' | 'column_top';
}

export interface Trigger {
  id: string;
  rect: { x: number; y: number; w: number; h: number };
  type: 'lever' | 'pressure_plate' | 'treasure' | 'exit';
  activated: boolean;
  linkedDoorId?: string; // connects to a Door
  persistent?: boolean; // stays activated after leaving (lever=true, plate=false)
}

export interface Door {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  open: boolean;
  openProgress: number; // 0-1 for animation
  color?: string;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'olive_branch' | 'golden_apple' | 'amphora' | 'golden_fleece' | 'ammo_refill' | 'journal';
  collected: boolean;
}

export interface Decoration {
  x: number;
  y: number;
  type: 'pillar' | 'broken_pillar' | 'torch' | 'statue' | 'vines' | 'bones';
}

export interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  end: number;
  speed: number;
  type: 'skeleton';
  animFrame: number;
  animTimer: number;
  alive: boolean;
}

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  type?: 'solid' | 'hazard' | 'trigger';
};

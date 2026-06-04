import { PlayerState, AnimationState, AfterImage, Bullet } from '../types';

// ==============================
// Pixel Art Sprite Drawing - 1930s Explorer
// ==============================

const COLORS = {
  skin: '#e8b87a',
  skinDark: '#c4915a',
  hat: '#4a3b32',
  hatDark: '#2d241f',
  hatBand: '#1a1614',
  jacket: '#5c3a21',
  jacketDark: '#3a2212',
  shirt: '#d4cfc5',
  pants: '#8b7355',
  pantsDark: '#5c4d44',
  boots: '#2d241f',
  eye: '#1a1a2e',
  gun: '#3d3d3d',
  gunHandle: '#5c3a21',
};

// Draw a single pixel (scaled)
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

// ==============================
// IDLE frames
// ==============================
function drawIdle(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, frame: number) {
  const s = 2;
  const breathOffset = frame === 0 ? 0 : -1;

  ctx.save();
  if (dir === -1) {
    ctx.translate(x + 12, 0);
    ctx.scale(-1, 1);
    x = -12;
  }

  // Fedora Hat
  px(ctx, x + 1*s, y + breathOffset, 10*s, 1*s, COLORS.hat); // Brim
  px(ctx, x + 3*s, y - 2*s + breathOffset, 6*s, 2*s, COLORS.hat); // Top
  px(ctx, x + 3*s, y - 1*s + breathOffset, 6*s, 1*s, COLORS.hatBand); // Band

  // Face
  px(ctx, x + 3*s, y + 1*s + breathOffset, 5*s, 4*s, COLORS.skin);
  px(ctx, x + 7*s, y + 2*s + breathOffset, 1*s, 1*s, COLORS.eye); // Eye
  px(ctx, x + 6*s, y + 4*s + breathOffset, 2*s, 1*s, COLORS.skinDark); // Mouth

  // Leather Jacket & Shirt
  px(ctx, x + 3*s, y + 5*s, 6*s, 7*s, COLORS.jacket);
  px(ctx, x + 5*s, y + 5*s, 2*s, 6*s, COLORS.shirt); // Open jacket revealing shirt
  
  // Arm & Gun (Resting)
  px(ctx, x + 5*s, y + 6*s, 2*s, 5*s, COLORS.jacketDark); // Arm
  px(ctx, x + 5*s, y + 11*s, 2*s, 2*s, COLORS.skin); // Hand
  px(ctx, x + 4*s, y + 12*s, 3*s, 3*s, COLORS.gun); // Revolver

  // Pants
  px(ctx, x + 3*s, y + 12*s, 3*s, 4*s, COLORS.pants);
  px(ctx, x + 6*s, y + 12*s, 3*s, 4*s, COLORS.pantsDark);

  // Boots
  px(ctx, x + 3*s, y + 16*s, 3*s, 3*s, COLORS.boots);
  px(ctx, x + 6*s, y + 16*s, 3*s, 3*s, COLORS.boots);

  ctx.restore();
}

// ==============================
// WALK frames
// ==============================
function drawWalk(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, frame: number) {
  const s = 2;
  const legOffsets = [
    { l1: 0, l2: 0 },
    { l1: -2, l2: 2 },
    { l1: 0, l2: 0 },
    { l1: 2, l2: -2 },
  ];
  const lo = legOffsets[frame % 4];
  const bob = (frame === 1 || frame === 3) ? -1 : 0;

  ctx.save();
  if (dir === -1) {
    ctx.translate(x + 12, 0);
    ctx.scale(-1, 1);
    x = -12;
  }

  // Fedora
  px(ctx, x + 1*s, y + bob, 10*s, 1*s, COLORS.hat);
  px(ctx, x + 3*s, y - 2*s + bob, 6*s, 2*s, COLORS.hat);
  px(ctx, x + 3*s, y - 1*s + bob, 6*s, 1*s, COLORS.hatBand);

  // Face
  px(ctx, x + 3*s, y + 1*s + bob, 5*s, 4*s, COLORS.skin);
  px(ctx, x + 7*s, y + 2*s + bob, 1*s, 1*s, COLORS.eye);

  // Jacket
  px(ctx, x + 3*s, y + 5*s + bob, 6*s, 7*s, COLORS.jacket);
  px(ctx, x + 5*s, y + 5*s + bob, 2*s, 6*s, COLORS.shirt);

  // Arm swinging
  const armSwing = (frame === 1 || frame === 3) ? 1 : 0;
  px(ctx, x + 5*s + armSwing, y + 6*s + bob, 2*s, 5*s, COLORS.jacketDark);
  px(ctx, x + 5*s + armSwing, y + 11*s + bob, 2*s, 2*s, COLORS.skin);
  px(ctx, x + 5*s + armSwing, y + 12*s + bob, 3*s, 2*s, COLORS.gun);

  // Legs & Boots
  px(ctx, x + 3*s + lo.l1, y + 12*s, 3*s, 4*s, COLORS.pants);
  px(ctx, x + 6*s + lo.l2, y + 12*s, 3*s, 4*s, COLORS.pantsDark);
  px(ctx, x + 3*s + lo.l1, y + 16*s, 3*s, 3*s, COLORS.boots);
  px(ctx, x + 6*s + lo.l2, y + 16*s, 3*s, 3*s, COLORS.boots);

  ctx.restore();
}

// ==============================
// JUMP frames
// ==============================
function drawJump(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, rising: boolean) {
  const s = 2;

  ctx.save();
  if (dir === -1) {
    ctx.translate(x + 12, 0);
    ctx.scale(-1, 1);
    x = -12;
  }

  // Fedora (holding onto it if falling)
  px(ctx, x + 1*s, y, 10*s, 1*s, COLORS.hat);
  px(ctx, x + 3*s, y - 2*s, 6*s, 2*s, COLORS.hat);
  px(ctx, x + 3*s, y - 1*s, 6*s, 1*s, COLORS.hatBand);

  // Face
  px(ctx, x + 3*s, y + 1*s, 5*s, 4*s, COLORS.skin);
  px(ctx, x + 7*s, y + 2*s, 1*s, 1*s, COLORS.eye);

  // Jacket (flapping)
  px(ctx, x + 2*s, y + 5*s, 7*s, 6*s, COLORS.jacket);
  if (!rising) {
    px(ctx, x + 1*s, y + 5*s, 3*s, 4*s, COLORS.jacketDark); // Flap up
  }

  // Arm & Gun (Raised)
  px(ctx, x + 7*s, y + 5*s, 3*s, 2*s, COLORS.jacketDark);
  px(ctx, x + 10*s, y + 5*s, 2*s, 2*s, COLORS.skin);
  px(ctx, x + 11*s, y + 4*s, 3*s, 2*s, COLORS.gun);

  if (rising) {
    // Legs tucked
    px(ctx, x + 3*s, y + 11*s, 3*s, 3*s, COLORS.pants);
    px(ctx, x + 6*s, y + 11*s, 3*s, 3*s, COLORS.pantsDark);
    px(ctx, x + 3*s, y + 14*s, 3*s, 2*s, COLORS.boots);
    px(ctx, x + 6*s, y + 14*s, 3*s, 2*s, COLORS.boots);
  } else {
    // Legs extended
    px(ctx, x + 3*s, y + 11*s, 3*s, 5*s, COLORS.pants);
    px(ctx, x + 6*s, y + 11*s, 3*s, 5*s, COLORS.pantsDark);
    px(ctx, x + 3*s, y + 16*s, 3*s, 3*s, COLORS.boots);
    px(ctx, x + 6*s, y + 16*s, 3*s, 3*s, COLORS.boots);
  }

  ctx.restore();
}

// ==============================
// DASH frames
// ==============================
function drawDash(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, frame: number) {
  const s = 2;

  ctx.save();
  if (dir === -1) {
    ctx.translate(x + 12, 0);
    ctx.scale(-1, 1);
    x = -12;
  }

  const stretch = frame === 0 ? 2 : 4;

  // Fedora (clamped down)
  px(ctx, x + 2*s, y + 2*s, 10*s, 1*s, COLORS.hat);
  px(ctx, x + 4*s, y, 6*s, 2*s, COLORS.hat);

  // Face
  px(ctx, x + 4*s, y + 3*s, 5*s, 3*s, COLORS.skin);

  // Jacket (leaning forward)
  px(ctx, x + 1*s, y + 6*s, 9*s + stretch, 5*s, COLORS.jacket);
  
  // Gun drawn forward
  px(ctx, x + 8*s + stretch, y + 7*s, 3*s, 2*s, COLORS.skin);
  px(ctx, x + 11*s + stretch, y + 6*s, 4*s, 2*s, COLORS.gun);

  // Legs trailing
  px(ctx, x + 2*s, y + 11*s, 3*s, 4*s, COLORS.pants);
  px(ctx, x + 0*s, y + 14*s, 3*s, 3*s, COLORS.boots);

  ctx.restore();
}

// ==============================
// Main draw dispatcher
// ==============================
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  cameraX: number
) {
  const screenX = player.x - cameraX;
  const screenY = player.y;

  player.afterimages.forEach(img => {
    ctx.globalAlpha = img.alpha;
    drawByState(ctx, img.x - cameraX, img.y, img.direction, img.animState, img.animFrame);
  });
  ctx.globalAlpha = 1;

  if (player.dashInvincible && Math.floor(Date.now() / 50) % 2 === 0) {
    ctx.globalAlpha = 0.6;
  }

  drawByState(ctx, screenX, screenY, player.direction, player.animState, player.animFrame);
  ctx.globalAlpha = 1;
}

function drawByState(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  dir: 1 | -1,
  state: AnimationState,
  frame: number
) {
  switch (state) {
    case 'idle': drawIdle(ctx, x, y, dir, frame); break;
    case 'walk': drawWalk(ctx, x, y, dir, frame); break;
    case 'jump_rise': drawJump(ctx, x, y, dir, true); break;
    case 'jump_fall': drawJump(ctx, x, y, dir, false); break;
    case 'dash': drawDash(ctx, x, y, dir, frame); break;
  }
}

// ==============================
// Skeleton Enemy Drawing
// ==============================
export function drawSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number, speed: number) {
  const dir = speed >= 0 ? 1 : -1;
  const s = 2;

  ctx.save();
  if (dir === -1) {
    ctx.translate(x + w/2, 0);
    ctx.scale(-1, 1);
    x = -w/2;
  }

  // Skull
  px(ctx, x + 2*s, y, 5*s, 5*s, '#e8e8e0');
  px(ctx, x + 3*s, y + 1*s, 1*s, 2*s, '#1a0a05');
  px(ctx, x + 5*s, y + 1*s, 1*s, 2*s, '#1a0a05');
  px(ctx, x + 3*s, y + 3*s, 3*s, 1*s, '#c8c8c0');
  px(ctx, x + 3*s, y + 1*s, 1*s, 1*s, '#ff4444');
  px(ctx, x + 5*s, y + 1*s, 1*s, 1*s, '#ff4444');

  // Ribcage
  px(ctx, x + 2*s, y + 5*s, 5*s, 5*s, '#d8d8d0');
  px(ctx, x + 3*s, y + 6*s, 1*s, 3*s, '#1a0a05');
  px(ctx, x + 5*s, y + 6*s, 1*s, 3*s, '#1a0a05');

  // Sword arm
  const swordBob = frame % 2 === 0 ? 0 : -2;
  px(ctx, x + 7*s, y + 5*s + swordBob, 2*s, 2*s, '#e8e8e0');
  px(ctx, x + 8*s, y + 2*s + swordBob, 1*s, 4*s, '#a0a0a0');

  // Legs
  const legAnim = frame % 2 === 0 ? 0 : 2;
  px(ctx, x + 2*s + legAnim, y + 10*s, 2*s, 5*s, '#d8d8d0');
  px(ctx, x + 5*s - legAnim, y + 10*s, 2*s, 5*s, '#d8d8d0');

  ctx.restore();
}

// ==============================
// Bullet Drawing
// ==============================
export function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet, cameraX: number) {
  if (!bullet.active) return;
  const x = bullet.x - cameraX;
  const y = bullet.y;
  
  // Trail
  ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
  ctx.fillRect(x - (bullet.direction * 15), y + 1, 15, 2);
  
  // Projectile
  ctx.fillStyle = '#f0d68a';
  ctx.fillRect(x, y, 4, 4);
}

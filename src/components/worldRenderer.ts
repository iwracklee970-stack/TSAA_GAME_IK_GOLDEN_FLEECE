import { Level, Platform, Door, Trigger, Collectible, Decoration } from '../types';

// ==============================
// Background Rendering
// ==============================
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  level: Level,
  cameraX: number,
  canvasW: number,
  canvasH: number,
  bgImages?: {
    far: HTMLImageElement | HTMLCanvasElement | null;
    mid: HTMLImageElement | HTMLCanvasElement | null;
    fore: HTMLImageElement | HTMLCanvasElement | null;
  }
) {
  // Base fill
  ctx.fillStyle = level.backgrounds[0];
  ctx.fillRect(0, 0, canvasW, canvasH);

  // ── Library: fully procedural pixel-art scene ──
  if (level.type === 'library') {
    drawLibraryBackground(ctx, cameraX, canvasW, canvasH);
    return;
  }

  // ── Shore: fully procedural sea, stormy sky, and parallax cliffs ──
  if (level.type === 'shore') {
    drawShoreBackground(ctx, cameraX, canvasW, canvasH);
    return;
  }

  let customBgDrawn = false;
  if (
    (level.type === 'ruins' ||
     level.type === 'underwater' ||
     level.type === 'labyrinth' ||
     level.type === 'underworld') &&
    bgImages
  ) {
    const drawLayer = (img: HTMLImageElement | HTMLCanvasElement | null, factor: number) => {
      if (!img) return false;
      let imgW = 0;
      let imgH = 0;
      if (img instanceof HTMLImageElement) {
        if (!img.complete || img.naturalWidth === 0) return false;
        imgW = img.naturalWidth;
        imgH = img.naturalHeight;
      } else if (img instanceof HTMLCanvasElement) {
        imgW = img.width;
        imgH = img.height;
      }
      if (imgW === 0 || imgH === 0) return false;

      const scale = canvasH / imgH;
      const drawW = imgW * scale;
      let shift = -(cameraX * factor) % drawW;
      if (shift > 0) shift -= drawW;

      for (let x = shift; x < canvasW; x += drawW) {
        ctx.drawImage(img, 0, 0, imgW, imgH, x, 0, drawW, canvasH);
      }
      return true;
    };

    const farDrawn = drawLayer(bgImages.far, 0.1);
    const midDrawn = drawLayer(bgImages.mid, 0.3);
    const foreDrawn = drawLayer(bgImages.fore, 0.6);

    customBgDrawn = farDrawn || midDrawn || foreDrawn;
  }

  if (!customBgDrawn) {
    level.backgrounds.forEach((bg, i) => {
      if (i === 0) return;
      ctx.fillStyle = bg;
      const parallaxFactor = 0.15 * i;
      for (let x = -400; x < 5000; x += 400) {
        const shift = x - (cameraX * parallaxFactor);
        const layerH = 80 + 40 * i;
        ctx.fillRect(shift, canvasH - layerH, 401, layerH);
      }
    });
  }

  if (level.type !== 'underwater') {
    ctx.fillStyle = 'rgba(212, 168, 67, 0.15)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 137 + 50) % 800) - (cameraX * 0.05) % 800;
      const sy = (i * 73 + 20) % (canvasH - 100);
      ctx.fillRect(sx, sy, 2, 2);
    }
  } else {
    ctx.fillStyle = 'rgba(100, 180, 255, 0.15)';
    for (let i = 0; i < 20; i++) {
      const bx = ((i * 157 + 30) % 800) - (cameraX * 0.08) % 800;
      const by = (i * 97 + 50) % canvasH;
      const r = 2 + (i % 3);
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ==============================
// Library Background (fully procedural pixel-art)
// ==============================
function drawLibraryBackground(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasW: number,
  canvasH: number
) {
  const t = Date.now();

  // ── FAR: Deep archway void ──
  // Dark blue-purple gradient sky/void
  const voidGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
  voidGrad.addColorStop(0, '#0a0718');
  voidGrad.addColorStop(0.5, '#0f0e2a');
  voidGrad.addColorStop(1, '#1a0f0a');
  ctx.fillStyle = voidGrad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Receding archways (parallax far, factor 0.05)
  const archShift = -(cameraX * 0.05);
  const archColors = ['#1a1230', '#231840', '#2d1e50'];
  for (let a = 0; a < 4; a++) {
    const scale = 0.35 + a * 0.18;
    const cx = canvasW / 2 + archShift * (1 - a * 0.2);
    const archW = canvasW * scale;
    const archH = canvasH * scale * 1.3;
    const archY = canvasH * 0.08 + a * 10;
    ctx.fillStyle = archColors[Math.min(a, archColors.length - 1)];
    // Arch body
    ctx.fillRect(cx - archW / 2, archY + archH * 0.5, archW, canvasH);
    // Arch top (rounded using rects for pixel art feel)
    const steps = 18;
    for (let s = 0; s < steps; s++) {
      const ang = (Math.PI * s) / (steps - 1);
      const rx = (archW / 2) * Math.cos(ang);
      const ry = (archH * 0.5) * Math.sin(ang);
      ctx.fillRect(cx + rx - archW / steps, archY + archH * 0.5 - ry, archW / steps + 1, ry + 2);
    }
  }

  // Glowing portal centre
  const portalX = canvasW / 2 + archShift;
  const portalY = canvasH * 0.38;
  const portalGrad = ctx.createRadialGradient(portalX, portalY, 5, portalX, portalY, 80);
  portalGrad.addColorStop(0, 'rgba(140,180,255,0.9)');
  portalGrad.addColorStop(0.3, 'rgba(80,120,220,0.5)');
  portalGrad.addColorStop(1, 'rgba(20,30,80,0)');
  ctx.fillStyle = portalGrad;
  ctx.fillRect(portalX - 90, portalY - 90, 180, 180);

  // Floating blue wisps (animated)
  for (let w = 0; w < 12; w++) {
    const wx = portalX + Math.sin(t / 800 + w * 1.7) * 60 - (cameraX * 0.03) % canvasW;
    const wy = portalY + Math.cos(t / 600 + w * 2.3) * 40 - w * 8;
    const alpha = 0.3 + Math.sin(t / 400 + w) * 0.2;
    ctx.fillStyle = `rgba(100,180,255,${alpha})`;
    ctx.fillRect(wx, wy, 4, 4);
    ctx.fillStyle = `rgba(200,230,255,${alpha * 0.5})`;
    ctx.fillRect(wx - 1, wy - 1, 2, 2);
  }

  // ── MID: Bookshelves (parallax mid, factor 0.25) ──
  const shelfShift = -(cameraX * 0.25);
  const shelfColors = ['#8B4513','#A0522D','#6B3A2A','#5C2E1A'];
  const bookPalette = [
    '#8B0000','#006400','#00008B','#8B6914','#4B0082',
    '#8B4513','#2F4F4F','#B8860B','#556B2F','#8B2252',
    '#D2691E','#4682B4','#CD853F','#708090','#C0392B'
  ];

  // Draw two tall shelf units (left & right), tiling as camera moves
  const shelfUnitW = 220;
  const shelfH = canvasH;
  for (let side = -1; side <= 1; side += 2) {
    for (let rep = -1; rep <= 1; rep++) {
      const baseX = side === -1
        ? shelfShift + rep * shelfUnitW * 2
        : canvasW - shelfUnitW + shelfShift * 0.5 + rep * shelfUnitW * 2;

      // Shelf backing
      ctx.fillStyle = '#3B2010';
      ctx.fillRect(baseX, 0, shelfUnitW, shelfH);

      // Wood grain highlight
      ctx.fillStyle = 'rgba(255,200,120,0.04)';
      for (let g = 0; g < shelfUnitW; g += 20) {
        ctx.fillRect(baseX + g, 0, 1, shelfH);
      }

      // Horizontal shelves + books
      const numShelves = 7;
      for (let shelf = 0; shelf < numShelves; shelf++) {
        const sy = 30 + shelf * (canvasH / numShelves);
        // Shelf plank
        ctx.fillStyle = '#5C3A1A';
        ctx.fillRect(baseX - 4, sy + 38, shelfUnitW + 8, 10);
        ctx.fillStyle = '#7A4A22';
        ctx.fillRect(baseX - 4, sy + 38, shelfUnitW + 8, 3);

        // Books on this shelf
        let bx = baseX + 4;
        let bookIdx = (shelf * 13 + (side === -1 ? 0 : 7) + rep * 5) % bookPalette.length;
        while (bx < baseX + shelfUnitW - 6) {
          const bw = 10 + (bookIdx * 7 + shelf * 3) % 12;
          const bh = 28 + (bookIdx * 5) % 14;
          ctx.fillStyle = bookPalette[bookIdx % bookPalette.length];
          ctx.fillRect(bx, sy + 10, bw, bh);
          // Book spine highlight
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(bx, sy + 10, 2, bh);
          // Book title line
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(bx + 3, sy + 16, bw - 5, 2);
          bx += bw + 2;
          bookIdx = (bookIdx + 1) % bookPalette.length;
        }
      }

      // Outer frame pillars
      ctx.fillStyle = '#6B3A1A';
      ctx.fillRect(baseX - 6, 0, 6, shelfH);
      ctx.fillRect(baseX + shelfUnitW, 0, 6, shelfH);
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(baseX - 6, 0, 2, shelfH);
    }
  }

  // Stone arch frame around the portal (mid layer)
  const archFrameShift = -(cameraX * 0.25);
  const afcx = canvasW / 2 + archFrameShift;
  const afW = 180;
  const afH = canvasH * 0.75;
  const afY = canvasH * 0.12;
  // Arch sides
  ctx.fillStyle = '#6B5A3A';
  ctx.fillRect(afcx - afW / 2 - 18, afY + afH * 0.45, 18, canvasH);
  ctx.fillRect(afcx + afW / 2, afY + afH * 0.45, 18, canvasH);
  // Arch keystone top
  for (let s = 0; s < 14; s++) {
    const ang = (Math.PI * s) / 13;
    const rx = (afW / 2 + 9) * Math.cos(ang);
    const ry = (afH * 0.45) * Math.sin(ang);
    ctx.fillRect(afcx + rx - 9, afY + afH * 0.45 - ry, 18, ry + 2);
  }
  // Highlight
  ctx.fillStyle = '#8B7A5A';
  ctx.fillRect(afcx - afW / 2 - 18, afY + afH * 0.45, 4, canvasH);
  ctx.fillRect(afcx + afW / 2 + 14, afY + afH * 0.45, 4, canvasH);

  // ── FLOOR: tiled stone ──
  const floorY = canvasH * 0.82;
  ctx.fillStyle = '#2C1F10';
  ctx.fillRect(0, floorY, canvasW, canvasH - floorY);
  const tileW = 60;
  const tileH = 20;
  const floorShift = -(cameraX * 0.4) % tileW;
  for (let tx = floorShift - tileW; tx < canvasW + tileW; tx += tileW) {
    for (let ty = 0; ty < canvasH - floorY; ty += tileH) {
      const offset = (ty / tileH) % 2 === 0 ? 0 : tileW / 2;
      ctx.fillStyle = (ty / tileH) % 2 === 0 ? '#3A2A14' : '#352510';
      ctx.fillRect(tx + offset, floorY + ty, tileW - 2, tileH - 1);
      ctx.fillStyle = 'rgba(255,200,100,0.04)';
      ctx.fillRect(tx + offset, floorY + ty, tileW - 2, 2);
    }
  }

  // ── FORE: Desk with lamp (parallax fore, factor 0.5) ──
  const deskShift = -(cameraX * 0.5);
  const deskX = canvasW / 2 - 80 + deskShift;
  const deskY = canvasH * 0.62;
  const deskW = 160;
  const deskH = 16;

  // Lamp glow on ceiling/walls
  const lampCx = deskX + deskW / 2;
  const lampGlow = ctx.createRadialGradient(lampCx, deskY - 30, 5, lampCx, deskY - 30, 140);
  lampGlow.addColorStop(0, 'rgba(255,220,100,0.18)');
  lampGlow.addColorStop(1, 'rgba(255,180,60,0)');
  ctx.fillStyle = lampGlow;
  ctx.fillRect(lampCx - 140, deskY - 160, 280, 200);

  // Desk surface
  ctx.fillStyle = '#5C3A1A';
  ctx.fillRect(deskX, deskY, deskW, deskH);
  ctx.fillStyle = '#7A4A22';
  ctx.fillRect(deskX, deskY, deskW, 4);
  // Desk legs
  ctx.fillStyle = '#4A2E10';
  ctx.fillRect(deskX + 10, deskY + deskH, 12, 30);
  ctx.fillRect(deskX + deskW - 22, deskY + deskH, 12, 30);
  // Desk drawer line
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(deskX + 50, deskY + 6, 60, 2);
  ctx.fillRect(deskX + 78, deskY + 4, 4, 8);

  // Lamp base
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(lampCx - 4, deskY - 50, 8, 50);
  ctx.fillRect(lampCx - 12, deskY - 6, 24, 6);
  // Lampshade
  ctx.fillStyle = '#D4A843';
  ctx.fillRect(lampCx - 20, deskY - 70, 40, 24);
  ctx.fillStyle = '#F0C84A';
  ctx.fillRect(lampCx - 18, deskY - 68, 36, 4);
  // Lamp glow dot (inner light)
  const flicker = Math.sin(t / 200) * 1;
  ctx.fillStyle = `rgba(255,240,160,${0.85 + flicker * 0.1})`;
  ctx.fillRect(lampCx - 8, deskY - 58, 16, 14);

  // Stacked books on desk
  const bookData = [
    { dx: -55, c: '#8B0000', w: 22, h: 10 },
    { dx: -55, c: '#006400', w: 22, h: 8 },
    { dx: -55, c: '#00008B', w: 22, h: 6 },
    { dx: 28,  c: '#4B0082', w: 18, h: 14 },
    { dx: 28,  c: '#8B4513', w: 18, h: 8 },
  ];
  let stackL = 0;
  let stackR = 0;
  bookData.forEach(b => {
    const bx = deskX + deskW / 2 + b.dx;
    const by = deskY - b.h - (b.dx < 0 ? stackL : stackR);
    ctx.fillStyle = b.c;
    ctx.fillRect(bx, by, b.w, b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(bx, by, b.w, 2);
    if (b.dx < 0) stackL += b.h;
    else stackR += b.h;
  });

  // Scattered books on floor
  const floorBooks = [
    { fx: deskX - 60, c: '#8B0000' },
    { fx: deskX - 42, c: '#4B0082' },
    { fx: deskX + deskW + 10, c: '#006400' },
    { fx: deskX + deskW + 28, c: '#8B4513' },
  ];
  floorBooks.forEach(fb => {
    ctx.fillStyle = fb.c;
    ctx.fillRect(fb.fx, floorY - 12, 20, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(fb.fx, floorY - 12, 20, 3);
  });

  // Atmospheric dust motes
  ctx.fillStyle = 'rgba(255,220,120,0.12)';
  for (let p = 0; p < 25; p++) {
    const px = ((p * 173 + 50) % canvasW) - (cameraX * 0.06) % canvasW;
    const py = 60 + ((p * 97 + t / 2000 * 30) % (canvasH - 100));
    ctx.fillRect(px, py, 2, 2);
  }
}

// ==============================
// Platform Drawing (pixel art stone)
// ==============================
export function drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform, cameraX: number) {
  const x = plat.x - cameraX;
  const y = plat.y;
  const w = plat.w;
  const h = plat.h;

  const style = plat.style || 'stone';

  switch (style) {
    case 'marble':
      // Marble white platform
      ctx.fillStyle = '#d4cfc5';
      ctx.fillRect(x, y, w, h);
      // Top highlight
      ctx.fillStyle = '#f5f0e8';
      ctx.fillRect(x, y, w, 3);
      // Bottom shadow
      ctx.fillStyle = '#8a857c';
      ctx.fillRect(x, y + h - 2, w, 2);
      // Marble veins
      ctx.strokeStyle = 'rgba(180, 170, 155, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 30) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + 4);
        ctx.lineTo(x + i + 15, y + h - 3);
        ctx.stroke();
      }
      break;

    case 'column_top':
      // Ornate column top platform
      ctx.fillStyle = plat.color || '#b8a88a';
      ctx.fillRect(x, y, w, h);
      // Top ornamental ridge
      ctx.fillStyle = '#d4c4a0';
      ctx.fillRect(x - 4, y, w + 8, 4);
      ctx.fillRect(x - 2, y + 4, w + 4, 3);
      // Bottom edge
      ctx.fillStyle = '#8a7a5a';
      ctx.fillRect(x, y + h - 2, w, 2);
      // Column lines
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let i = 8; i < w; i += 16) {
        ctx.fillRect(x + i, y + 7, 1, h - 9);
      }
      break;

    case 'moss':
      ctx.fillStyle = plat.color || '#4a4a4a';
      ctx.fillRect(x, y, w, h);
      // Moss on top
      ctx.fillStyle = '#4a6741';
      ctx.fillRect(x, y, w, 3);
      ctx.fillStyle = '#6b7c3e';
      for (let i = 0; i < w; i += 8) {
        const mh = 2 + (i * 3) % 4;
        ctx.fillRect(x + i, y - mh, 6, mh);
      }
      break;

    default: // 'stone'
      ctx.fillStyle = plat.color || '#4a4a4a';
      ctx.fillRect(x, y, w, h);
      // Top edge highlight
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x, y, w, 2);
      // Bottom shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x, y + h - 2, w, 2);
      // Brick lines
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      for (let row = 0; row < h; row += 12) {
        ctx.beginPath();
        ctx.moveTo(x, y + row);
        ctx.lineTo(x + w, y + row);
        ctx.stroke();
        const offset = row % 24 === 0 ? 0 : 20;
        for (let col = offset; col < w; col += 40) {
          ctx.beginPath();
          ctx.moveTo(x + col, y + row);
          ctx.lineTo(x + col, y + row + 12);
          ctx.stroke();
        }
      }
      // Random cracks
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      for (let i = 0; i < 3; i++) {
        const cx = x + ((i * 137 + plat.x) % w);
        const cy = y + ((i * 73) % h);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 8, cy + 6);
        ctx.lineTo(cx + 4, cy + 12);
        ctx.stroke();
      }
      break;
  }
}

// ==============================
// Door Drawing
// ==============================
export function drawDoor(ctx: CanvasRenderingContext2D, door: Door, cameraX: number) {
  const x = door.x - cameraX;
  const drawH = door.h * (1 - door.openProgress);
  const drawY = door.y + (door.h - drawH);

  if (drawH <= 0) return;

  // Door body
  ctx.fillStyle = door.color || '#5a3a1a';
  ctx.fillRect(x, drawY, door.w, drawH);

  // Frame
  ctx.fillStyle = '#8b6914';
  ctx.fillRect(x - 3, door.y, 3, door.h);
  ctx.fillRect(x + door.w, door.y, 3, door.h);
  ctx.fillRect(x - 3, door.y - 3, door.w + 6, 3);

  // Door planks
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < door.w; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + i, drawY);
    ctx.lineTo(x + i, drawY + drawH);
    ctx.stroke();
  }

  // Handle
  if (drawH > 20) {
    ctx.fillStyle = '#d4a843';
    ctx.fillRect(x + door.w - 10, drawY + drawH / 2 - 3, 4, 6);
  }
}

// ==============================
// Trigger Drawing (levers, plates)
// ==============================
export function drawTrigger(ctx: CanvasRenderingContext2D, trigger: Trigger, cameraX: number) {
  const x = trigger.rect.x - cameraX;
  const y = trigger.rect.y;

  switch (trigger.type) {
    case 'lever': {
      // Base
      ctx.fillStyle = '#6b6b6b';
      ctx.fillRect(x + 8, y + 28, 14, 12);
      // Lever arm
      ctx.fillStyle = trigger.activated ? '#4a6741' : '#8b3a25';
      ctx.save();
      ctx.translate(x + 15, y + 28);
      ctx.rotate(trigger.activated ? -0.6 : 0.6);
      ctx.fillRect(-2, -24, 4, 24);
      // Knob
      ctx.fillStyle = trigger.activated ? '#6b7c3e' : '#c45b3c';
      ctx.fillRect(-4, -28, 8, 6);
      ctx.restore();
      break;
    }
    case 'pressure_plate': {
      // Plate
      const pressed = trigger.activated;
      ctx.fillStyle = pressed ? '#6b7c3e' : '#8a857c';
      ctx.fillRect(x, y + (pressed ? 4 : 0), trigger.rect.w, pressed ? 6 : 10);
      // Edge highlight
      ctx.fillStyle = pressed ? '#4a6741' : '#d4cfc5';
      ctx.fillRect(x, y + (pressed ? 4 : 0), trigger.rect.w, 2);
      // Arrows indicator
      if (!pressed) {
        ctx.fillStyle = 'rgba(212, 168, 67, 0.4)';
        ctx.fillRect(x + 12, y - 8, 2, 6);
        ctx.fillRect(x + 26, y - 8, 2, 6);
        // Down arrows
        ctx.fillRect(x + 10, y - 3, 6, 2);
        ctx.fillRect(x + 24, y - 3, 6, 2);
      }
      break;
    }
    case 'exit': {
      // Golden portal
      ctx.fillStyle = 'rgba(212, 168, 67, 0.3)';
      ctx.fillRect(x, y, trigger.rect.w, trigger.rect.h);
      // Shimmer
      const shimmer = Math.sin(Date.now() / 300) * 0.2 + 0.4;
      ctx.fillStyle = `rgba(240, 214, 138, ${shimmer})`;
      ctx.fillRect(x + 5, y + 5, trigger.rect.w - 10, trigger.rect.h - 10);
      // Arrow up
      ctx.fillStyle = '#d4a843';
      ctx.fillRect(x + 20, y + 10, 10, 4);
      ctx.fillRect(x + 23, y + 6, 4, 4);
      break;
    }
  }
}

// ==============================
// Collectible Drawing
// ==============================
export function drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible, cameraX: number) {
  if (item.collected) return;

  const x = item.x - cameraX;
  const y = item.y + Math.sin(Date.now() / 400 + item.x) * 3; // Float effect

  // Glow
  ctx.shadowBlur = 12;

  switch (item.type) {
    case 'olive_branch':
      ctx.shadowColor = '#6b7c3e';
      ctx.fillStyle = '#6b7c3e';
      ctx.fillRect(x, y + 4, 12, 2);
      ctx.fillStyle = '#4a6741';
      ctx.fillRect(x + 2, y, 4, 4);
      ctx.fillRect(x + 8, y, 4, 4);
      ctx.fillRect(x + 4, y + 6, 4, 4);
      break;

    case 'golden_apple':
      ctx.shadowColor = '#d4a843';
      ctx.fillStyle = '#d4a843';
      ctx.fillRect(x + 2, y + 2, 8, 8);
      ctx.fillStyle = '#f0d68a';
      ctx.fillRect(x + 3, y + 3, 4, 4);
      // Stem
      ctx.fillStyle = '#4a6741';
      ctx.fillRect(x + 5, y - 2, 2, 4);
      break;

    case 'amphora':
      ctx.shadowColor = '#c45b3c';
      ctx.fillStyle = '#c45b3c';
      ctx.fillRect(x + 3, y, 6, 2);
      ctx.fillRect(x + 1, y + 2, 10, 8);
      ctx.fillRect(x + 3, y + 10, 6, 2);
      ctx.fillStyle = '#e07b5f';
      ctx.fillRect(x + 4, y + 3, 4, 5);
      break;

    case 'golden_fleece':
      ctx.shadowColor = '#f0d68a';
      ctx.shadowBlur = 25;
      ctx.fillStyle = '#f0d68a';
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = '#d4a843';
      ctx.fillRect(x + 2, y + 2, 12, 12);
      // Fleece texture
      ctx.fillStyle = '#f0d68a';
      ctx.fillRect(x + 4, y + 4, 3, 3);
      ctx.fillRect(x + 9, y + 4, 3, 3);
      ctx.fillRect(x + 6, y + 9, 4, 3);
      break;

    case 'scroll':
      ctx.shadowColor = '#d4cfc5';
      ctx.shadowBlur = 10;
      // Scroll roll (parchment)
      ctx.fillStyle = '#f5f0e8';
      ctx.fillRect(x + 2, y + 2, 12, 8);
      // Ribbon tie
      ctx.fillStyle = '#8b3a25';
      ctx.fillRect(x + 7, y + 1, 2, 10);
      // Wooden roller ends
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(x + 1, y + 2, 1, 8);
      ctx.fillRect(x + 14, y + 2, 1, 8);
      break;

    case 'ammo_refill':
      ctx.shadowColor = '#6b7c3e';
      ctx.fillStyle = '#3e4a2e';
      ctx.fillRect(x + 2, y + 6, 12, 8);
      ctx.fillStyle = '#6b7c3e';
      ctx.fillRect(x + 2, y + 4, 12, 2);
      ctx.fillStyle = '#d4a843';
      ctx.fillRect(x + 6, y + 2, 2, 4);
      ctx.fillStyle = '#8b8b8b';
      ctx.fillRect(x + 6, y, 2, 2);
      break;

    case 'journal': {
      // Glowing open book / journal on the desk
      ctx.shadowColor = '#f0c84a';
      ctx.shadowBlur = 20;
      // Book body
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x, y, 20, 14);
      // Pages
      ctx.fillStyle = '#F5F0E8';
      ctx.fillRect(x + 2, y + 1, 7, 12);
      ctx.fillRect(x + 11, y + 1, 7, 12);
      // Page lines
      ctx.fillStyle = 'rgba(100,80,40,0.4)';
      for (let l = 0; l < 4; l++) {
        ctx.fillRect(x + 3, y + 3 + l * 3, 5, 1);
        ctx.fillRect(x + 12, y + 3 + l * 3, 5, 1);
      }
      // Spine
      ctx.fillStyle = '#5C2E1A';
      ctx.fillRect(x + 9, y, 2, 14);
      // Gold clasp
      ctx.fillStyle = '#D4A843';
      ctx.fillRect(x + 8, y + 5, 4, 4);
      // Floating text hint
      const pulse = Math.sin(Date.now() / 400) * 0.3 + 0.7;
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(240,200,80,${pulse})`;
      ctx.fillRect(x - 2, y - 10, 24, 4);
      ctx.fillStyle = `rgba(240,200,80,${pulse * 0.6})`;
      ctx.fillRect(x + 4, y - 6, 12, 2);
      break;
    }

    case 'gun': {
      // Revolver and Lore Book on the table
      ctx.shadowColor = '#d4a843';
      ctx.shadowBlur = 15;
      
      // Draw Book backdrop
      ctx.fillStyle = '#6b4c2b';
      ctx.fillRect(x, y + 4, 18, 12);
      ctx.fillStyle = '#fdfbf7';
      ctx.fillRect(x + 1, y + 5, 16, 10);
      
      // Draw Revolver on top of book
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3a3a45';
      ctx.fillRect(x + 4, y + 8, 10, 2); // Barrel
      ctx.fillRect(x + 4, y + 10, 3, 2); // Cylinder
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(x + 2, y + 9, 2, 4);  // Grip
      break;
    }
  }

  ctx.shadowBlur = 0;
}

export function drawLadder(ctx: CanvasRenderingContext2D, ladder: { x: number; y: number; w: number; h: number }, cameraX: number) {
  const x = ladder.x - cameraX;
  const y = ladder.y;

  ctx.fillStyle = '#4a2f1b'; // Dark wood
  ctx.strokeStyle = '#2b1a0d';
  ctx.lineWidth = 2;

  // Rails
  ctx.fillRect(x, y, 4, ladder.h);
  ctx.strokeRect(x, y, 4, ladder.h);
  ctx.fillRect(x + ladder.w - 4, y, 4, ladder.h);
  ctx.strokeRect(x + ladder.w - 4, y, 4, ladder.h);

  // Rungs
  ctx.fillStyle = '#664225';
  for (let ry = y + 8; ry < y + ladder.h; ry += 14) {
    ctx.fillRect(x + 4, ry, ladder.w - 8, 3);
    ctx.strokeRect(x + 4, ry, ladder.w - 8, 3);
  }
}

export function drawNPCLibrarian(ctx: CanvasRenderingContext2D, npc: { x: number; y: number; w: number; h: number }, cameraX: number) {
  const x = npc.x - cameraX;
  const y = npc.y;
  const s = 2;
  const frame = Math.floor(Date.now() / 400) % 2;
  const breathOffset = frame === 0 ? 0 : -1;

  // Head/Hair (gray/white scholarly hair)
  ctx.fillStyle = '#d1d5db';
  ctx.fillRect(x + 3 * s, y + breathOffset, 6 * s, 3 * s);

  // Face (skin tone)
  ctx.fillStyle = '#fbcfe8'; // Pale skin
  ctx.fillRect(x + 4 * s, y + 2 * s + breathOffset, 4 * s, 4 * s);

  // Beard (long white beard)
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(x + 4 * s, y + 6 * s + breathOffset, 4 * s, 3 * s);

  // Eyes (dark spectacles look)
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(x + 5 * s, y + 3 * s + breathOffset, 2 * s, 1 * s);

  // Scholar Gown (dark crimson/brown robes)
  ctx.fillStyle = '#3f1f1f'; // Crimson Robes
  ctx.fillRect(x + 2 * s, y + 9 * s, 8 * s, 15 * s);

  // Sleeve decorations / belts
  ctx.fillStyle = '#d4a843'; // Gold belt
  ctx.fillRect(x + 2 * s, y + 14 * s, 8 * s, 1 * s);

  // Book in hands
  ctx.fillStyle = '#78350f'; // Brown book
  ctx.fillRect(x + 3 * s, y + 11 * s + breathOffset, 4 * s, 3 * s);
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(x + 4 * s, y + 11 * s + breathOffset, 2 * s, 3 * s);
}

export function drawInteractionTooltip(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.save();
  ctx.font = '10px "Cinzel", serif';
  const textWidth = ctx.measureText(text).width;
  const paddingX = 8;
  const paddingY = 4;
  const boxW = textWidth + paddingX * 2;
  const boxH = 16;
  const boxX = x - boxW / 2;
  const boxY = y - 28;

  // Pulse opacity
  const alpha = 0.8 + Math.sin(Date.now() / 200) * 0.15;

  ctx.fillStyle = `rgba(30, 20, 15, ${alpha})`;
  ctx.strokeStyle = '#d4a843';
  ctx.lineWidth = 1;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = '#d4a843';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, boxY + 11);
  ctx.restore();
}

export function drawFloatingTextHint(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.save();
  ctx.font = 'bold 11px "Cinzel", serif';
  const textWidth = ctx.measureText(text).width;
  const paddingX = 10;
  const paddingY = 6;
  const boxW = textWidth + paddingX * 2;
  const boxH = 20;
  const boxX = x - boxW / 2;
  const boxY = y - 32;

  // Background box
  ctx.fillStyle = 'rgba(15, 5, 5, 0.9)';
  ctx.strokeStyle = '#ef4444'; // Red alert border
  ctx.lineWidth = 1.5;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Text
  ctx.fillStyle = '#fca5a5';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, boxY + 14);
  ctx.restore();
}

// ==============================
// Decoration Drawing
// ==============================
export function drawDecoration(ctx: CanvasRenderingContext2D, deco: Decoration, cameraX: number) {
  const x = deco.x - cameraX;
  const y = deco.y;

  switch (deco.type) {
    case 'pillar':
      ctx.fillStyle = '#b8a88a';
      ctx.fillRect(x, y - 50, 20, 60);
      ctx.fillStyle = '#d4c4a0';
      ctx.fillRect(x - 4, y - 54, 28, 6);
      ctx.fillRect(x - 2, y + 6, 24, 6);
      // Fluting
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let i = 3; i < 18; i += 5) {
        ctx.fillRect(x + i, y - 48, 1, 54);
      }
      break;

    case 'broken_pillar':
      ctx.fillStyle = '#9a8a6a';
      ctx.fillRect(x, y - 15, 20, 25);
      ctx.fillStyle = '#b8a88a';
      ctx.fillRect(x - 2, y + 6, 24, 6);
      // Broken top
      ctx.fillStyle = '#9a8a6a';
      ctx.fillRect(x + 2, y - 20, 6, 5);
      ctx.fillRect(x + 12, y - 18, 5, 3);
      break;

    case 'torch':
      // Bracket
      ctx.fillStyle = '#5a4a3a';
      ctx.fillRect(x + 4, y - 25, 4, 20);
      ctx.fillRect(x, y - 30, 12, 6);
      // Flame (animated)
      const flicker = Math.sin(Date.now() / 150 + x) * 2;
      ctx.fillStyle = '#ff8c00';
      ctx.fillRect(x + 1 + flicker, y - 40, 10, 10);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(x + 3 + flicker, y - 38, 6, 6);
      ctx.fillStyle = '#fff4cc';
      ctx.fillRect(x + 4 + flicker, y - 36, 4, 3);
      // Torch glow
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(255, 140, 0, 0.3)';
      ctx.fillStyle = 'rgba(255, 200, 0, 0.01)';
      ctx.fillRect(x - 20, y - 60, 50, 50);
      ctx.shadowBlur = 0;
      break;

    case 'statue':
      // Simple Greek statue silhouette
      ctx.fillStyle = '#8a8a7a';
      // Head
      ctx.fillRect(x + 6, y - 50, 8, 8);
      // Body
      ctx.fillRect(x + 4, y - 42, 12, 20);
      // Base
      ctx.fillRect(x, y - 22, 20, 4);
      ctx.fillRect(x - 2, y - 18, 24, 28);
      ctx.fillStyle = '#6a6a5a';
      ctx.fillRect(x + 8, y - 38, 6, 2);
      break;

    case 'vines':
      ctx.fillStyle = '#3a5a30';
      ctx.fillRect(x, y - 30, 2, 40);
      ctx.fillStyle = '#4a6741';
      ctx.fillRect(x - 3, y - 20, 4, 4);
      ctx.fillRect(x + 2, y - 10, 4, 4);
      ctx.fillRect(x - 2, y, 4, 4);
      break;

    case 'bones':
      ctx.fillStyle = '#d8d0c0';
      // Bone 1
      ctx.fillRect(x, y + 2, 12, 2);
      ctx.fillRect(x - 1, y, 3, 2);
      ctx.fillRect(x + 10, y, 3, 2);
      // Bone 2 (crossed)
      ctx.fillRect(x + 4, y - 2, 2, 10);
      // Skull
      ctx.fillRect(x + 14, y - 2, 6, 6);
      ctx.fillStyle = '#1a0a05';
      ctx.fillRect(x + 15, y, 1, 2);
      ctx.fillRect(x + 18, y, 1, 2);
      break;
  }
}

// ==============================
// Fog of War Lighting System
// ==============================
// zoneMask: optional array of screen-space rectangles that form the ONLY
// region where the player's light is allowed to bleed through. Used to
// prevent the mausoleum interior from leaking light to the exterior.
export function drawLighting(
  ctx: CanvasRenderingContext2D,
  playerScreenX: number,
  playerScreenY: number,
  playerDir: 1 | -1,
  canvasW: number,
  canvasH: number,
  radius: number,
  zoneMask?: { x: number; y: number; w: number; h: number } | null
) {
  // ── Step 1: Build the fog layer on an offscreen canvas ──────────────────
  const fogCanvas = document.createElement('canvas');
  fogCanvas.width  = canvasW;
  fogCanvas.height = canvasH;
  const fogCtx = fogCanvas.getContext('2d')!;

  // Start with complete pitch black
  fogCtx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  fogCtx.fillRect(0, 0, canvasW, canvasH);

  // If a zone mask is provided, clear it and fill it with 0.83 (10% reduced fog)
  if (zoneMask) {
    fogCtx.save();
    fogCtx.globalCompositeOperation = 'destination-out';
    fogCtx.fillRect(zoneMask.x, zoneMask.y, zoneMask.w, zoneMask.h);
    
    fogCtx.globalCompositeOperation = 'source-over';
    fogCtx.fillStyle = 'rgba(0, 0, 0, 0.83)';
    fogCtx.fillRect(zoneMask.x, zoneMask.y, zoneMask.w, zoneMask.h);
    fogCtx.restore();
  } else {
    // If no zone mask, fill everything with 0.83
    fogCtx.globalCompositeOperation = 'destination-out';
    fogCtx.fillRect(0, 0, canvasW, canvasH);
    
    fogCtx.globalCompositeOperation = 'source-over';
    fogCtx.fillStyle = 'rgba(0, 0, 0, 0.83)';
    fogCtx.fillRect(0, 0, canvasW, canvasH);
  }

  // ── Step 2: Cut a visibility hole around the player ─────────────────────
  fogCtx.globalCompositeOperation = 'destination-out';

  const lightX = playerScreenX + (playerDir === 1 ? 14 : 10);
  const lightY  = playerScreenY + 18;

  // If a zone mask is provided, only allow the hole inside that rectangle.
  // This stops light bleeding through solid walls into the other zone.
  if (zoneMask) {
    fogCtx.save();
    fogCtx.beginPath();
    fogCtx.rect(zoneMask.x, zoneMask.y, zoneMask.w, zoneMask.h);
    fogCtx.clip();
  }

  // Radial gradient — bright core, sharp falloff at the edge
  const gradient = fogCtx.createRadialGradient(lightX, lightY, 8, lightX, lightY, radius);
  gradient.addColorStop(0,    'rgba(255,255,255,1.0)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.65, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(0.85, 'rgba(255,255,255,0.18)');
  gradient.addColorStop(1,    'rgba(255,255,255,0)');

  fogCtx.fillStyle = gradient;
  fogCtx.beginPath();
  fogCtx.arc(lightX, lightY, radius, 0, Math.PI * 2);
  fogCtx.fill();

  if (zoneMask) fogCtx.restore();

  // ── Step 3: Add a warm amber tint inside the revealed area ─────────────
  fogCtx.globalCompositeOperation = 'source-over';
  if (zoneMask) {
    fogCtx.save();
    fogCtx.beginPath();
    fogCtx.rect(zoneMask.x, zoneMask.y, zoneMask.w, zoneMask.h);
    fogCtx.clip();
  }
  const warmGrad = fogCtx.createRadialGradient(lightX, lightY, 0, lightX, lightY, radius * 0.6);
  warmGrad.addColorStop(0, 'rgba(255,200,100,0.06)');
  warmGrad.addColorStop(1, 'rgba(255,120,40,0)');
  fogCtx.fillStyle = warmGrad;
  fogCtx.fillRect(0, 0, canvasW, canvasH);
  if (zoneMask) fogCtx.restore();

  // ── Step 4: Stamp the fog onto the main canvas ──────────────────────────
  ctx.drawImage(fogCanvas, 0, 0);
}

// ==============================
// Checkpoint Drawing (Pillar of gold/blue flame)
// ==============================
export function drawCheckpoint(
  ctx: CanvasRenderingContext2D,
  checkpoint: { x: number; y: number; activated: boolean },
  cameraX: number
) {
  const x = checkpoint.x - cameraX;
  const y = checkpoint.y; // Base level where player stands

  // Draw base stone pedestal
  ctx.fillStyle = '#6b5a3a';
  ctx.fillRect(x - 8, y + 26, 16, 12);
  ctx.fillStyle = '#8b7a5a';
  ctx.fillRect(x - 10, y + 24, 20, 3);
  ctx.fillStyle = '#4a3d25';
  ctx.fillRect(x - 8, y + 36, 16, 2);

  // Flame / Beacon glow
  const t = Date.now();
  const flicker = Math.sin(t / 100) * 2;
  const activated = checkpoint.activated;

  // Beacon flame colors: bright cyan/blue if activated, soft amber if not
  const colorOuter = activated ? 'rgba(0, 180, 255, 0.4)' : 'rgba(212, 168, 67, 0.3)';
  const colorInner = activated ? '#80e0ff' : '#f0c84a';
  const colorCore = activated ? '#ffffff' : '#fff4cc';
  
  // Outer glow aura
  ctx.shadowBlur = activated ? 20 : 8;
  ctx.shadowColor = activated ? '#00b4ff' : '#d4a843';

  // Draw flame particles
  ctx.fillStyle = colorOuter;
  ctx.fillRect(x - 4 + flicker, y + 4, 8, 20);

  ctx.fillStyle = colorInner;
  ctx.fillRect(x - 2 + flicker * 0.5, y + 8, 4, 16);

  ctx.fillStyle = colorCore;
  ctx.fillRect(x - 1, y + 12, 2, 10);

  ctx.shadowBlur = 0;
}

// ==============================
// Shore Background (stormy sea, night sky, and parallax cliffs)
// ==============================
function drawShoreBackground(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasW: number,
  canvasH: number
) {
  const t = Date.now();

  // 1. Stormy Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
  skyGrad.addColorStop(0, '#0a101f'); // Dark stormy blue
  skyGrad.addColorStop(0.6, '#131c2e'); // Slate blue
  skyGrad.addColorStop(1, '#1b1b22'); // Horizon
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Distant clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 350 - cameraX * 0.02) % (canvasW + 400)) - 200;
    const cy = 40 + i * 20;
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.arc(cx + 40, cy - 10, 85, 0, Math.PI * 2);
    ctx.arc(cx + 90, cy, 65, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Far Mountains/Cliffs (Parallax factor 0.06)
  ctx.fillStyle = '#090f1f';
  ctx.beginPath();
  const startX1 = -(cameraX * 0.06);
  ctx.moveTo(startX1, canvasH);
  for (let x = 0; x <= canvasW + 100; x += 40) {
    const worldX = x + cameraX * 0.06;
    const h = 180 + Math.sin(worldX * 0.003) * 60 + Math.cos(worldX * 0.007) * 20;
    ctx.lineTo(x, canvasH - h);
  }
  ctx.lineTo(canvasW + 100, canvasH);
  ctx.closePath();
  ctx.fill();

  // 3. Mid-ground Cliffs (Parallax factor 0.18)
  ctx.fillStyle = '#111a2e';
  ctx.beginPath();
  const startX2 = -(cameraX * 0.18);
  ctx.moveTo(startX2, canvasH);
  for (let x = 0; x <= canvasW + 100; x += 30) {
    const worldX = x + cameraX * 0.18;
    const h = 120 + Math.sin(worldX * 0.006) * 40 + Math.cos(worldX * 0.015) * 15;
    ctx.lineTo(x, canvasH - h);
  }
  ctx.lineTo(canvasW + 100, canvasH);
  ctx.closePath();
  ctx.fill();

  // 4. Procedural Sea Water Waves on the Left
  ctx.save();
  const waterStart = -400 - cameraX;
  const waterEnd = 300 - cameraX;
  if (waterEnd > 0) {
    const seaGrad = ctx.createLinearGradient(0, 420, 0, canvasH);
    seaGrad.addColorStop(0, '#0d2238');
    seaGrad.addColorStop(1, '#050c14');
    ctx.fillStyle = seaGrad;

    ctx.beginPath();
    ctx.moveTo(waterStart, canvasH);
    for (let wx = waterStart; wx <= waterEnd + 10; wx += 15) {
      const waveOffset = Math.sin((wx + cameraX) * 0.05 + t * 0.003) * 5;
      ctx.lineTo(wx, 420 + waveOffset);
    }
    ctx.lineTo(waterEnd, canvasH);
    ctx.lineTo(waterStart, canvasH);
    ctx.closePath();
    ctx.fill();

    // Wave highlights (foam)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let wx = waterStart; wx <= waterEnd; wx += 12) {
      const waveOffset = Math.sin((wx + cameraX) * 0.05 + t * 0.003) * 5;
      if (wx === waterStart) {
        ctx.moveTo(wx, 420 + waveOffset);
      } else {
        ctx.lineTo(wx, 420 + waveOffset);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ==============================
// Boss: Chimera of Hades
// ==============================
export interface BossWeakSpot {
  x: number;
  y: number;
  active: boolean;
  timer: number;
  pulseTimer: number;
}

export function drawBoss(
  ctx: CanvasRenderingContext2D,
  bossX: number,
  bossY: number,
  cameraX: number,
  direction: number,
  animTimer: number,
  weakSpot: BossWeakSpot,
  scale: number
) {
  const sx = (bossX - cameraX) * scale;
  const sy = bossY * scale;
  const sc = scale;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(direction, 1);

  const bob = Math.sin(animTimer * 3.0) * 2 * sc;

  // Body
  const bw = 100 * sc;
  const bh = 70 * sc;
  const bodyGrad = ctx.createRadialGradient(0, bob, 5 * sc, 0, bob, bw * 0.7);
  bodyGrad.addColorStop(0, '#4a1520');
  bodyGrad.addColorStop(0.6, '#2a0c10');
  bodyGrad.addColorStop(1, '#100508');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, bob, bw / 2, bh / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magma veins
  ctx.strokeStyle = `rgba(239,68,68,${0.4 + Math.sin(animTimer * 5) * 0.2})`;
  ctx.lineWidth = 2 * sc;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI + 0.3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 10 * sc, bob + Math.sin(angle) * 10 * sc);
    ctx.lineTo(Math.cos(angle) * 35 * sc, bob + Math.sin(angle) * 25 * sc);
    ctx.stroke();
  }

  // Spine spikes
  ctx.fillStyle = '#1c0c10';
  for (let i = 0; i < 6; i++) {
    const px = (-40 + i * 14) * sc;
    const py = -bh / 2 - 5 * sc + bob;
    const sh = (10 + Math.sin(i + animTimer * 4) * 4) * sc;
    ctx.beginPath();
    ctx.moveTo(px - 5 * sc, py);
    ctx.lineTo(px, py - sh);
    ctx.lineTo(px + 5 * sc, py);
    ctx.closePath();
    ctx.fill();
  }

  // Neck
  ctx.fillStyle = '#2a0c10';
  ctx.beginPath();
  ctx.ellipse(48 * sc, -10 * sc + bob, 16 * sc, 22 * sc, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headX = 65 * sc;
  const headY = -24 * sc + bob;
  const hw = 36 * sc;
  const hh = 28 * sc;
  const headGrad = ctx.createRadialGradient(headX, headY, 4 * sc, headX, headY, hw);
  headGrad.addColorStop(0, '#3d1218');
  headGrad.addColorStop(1, '#160608');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.fillStyle = '#0a0305';
  [[-12, 0.4], [8, -0.3]].forEach(([ox, tilt]) => {
    ctx.save();
    ctx.translate(headX + ox * sc, headY - hh);
    ctx.rotate(tilt as number);
    ctx.beginPath();
    ctx.moveTo(-4 * sc, 0);
    ctx.lineTo(0, -16 * sc);
    ctx.lineTo(4 * sc, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Eye
  const eyeX = headX + 14 * sc;
  const eyeY = headY - 4 * sc;
  const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, 10 * sc);
  eyeGlow.addColorStop(0, `rgba(255,100,0,${0.9 + Math.sin(animTimer * 8) * 0.1})`);
  eyeGlow.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 10 * sc, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff6400';
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 4 * sc, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.strokeStyle = '#2a0c10';
  ctx.lineWidth = 10 * sc;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-bw / 2, bob);
  ctx.quadraticCurveTo(
    -bw / 2 - 40 * sc,
    bob + 20 * sc + Math.sin(animTimer * 2.5) * 15 * sc,
    -bw / 2 - 70 * sc,
    bob - 10 * sc
  );
  ctx.stroke();
  ctx.fillStyle = '#0a0305';
  ctx.beginPath();
  ctx.moveTo(-bw / 2 - 68 * sc, bob - 8 * sc);
  ctx.lineTo(-bw / 2 - 82 * sc, bob - 20 * sc);
  ctx.lineTo(-bw / 2 - 58 * sc, bob - 18 * sc);
  ctx.closePath();
  ctx.fill();

  // Legs
  ctx.strokeStyle = '#2a0c10';
  ctx.lineWidth = 8 * sc;
  [[-30, 1], [30, -1]].forEach(([ox, flip]) => {
    const legBob = Math.sin(animTimer * 6 + (ox as number)) * 8 * sc * (flip as number);
    ctx.beginPath();
    ctx.moveTo((ox as number) * sc, bh / 2 + bob);
    ctx.lineTo((ox as number) * sc, bh / 2 + 28 * sc + legBob + bob);
    ctx.stroke();
    ctx.fillStyle = '#0a0305';
    ctx.beginPath();
    ctx.ellipse((ox as number) * sc, bh / 2 + 34 * sc + legBob + bob, 10 * sc, 5 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Weak Spot
  if (weakSpot.active) {
    const wsX = weakSpot.x * sc;
    const wsY = weakSpot.y * sc + bob;
    const pulse = 0.6 + Math.sin(weakSpot.pulseTimer * 12) * 0.4;
    const wsr = 14 * sc * pulse;

    const wsGlow = ctx.createRadialGradient(wsX, wsY, 0, wsX, wsY, wsr * 2.5);
    wsGlow.addColorStop(0, `rgba(255,200,50,${0.8 * pulse})`);
    wsGlow.addColorStop(0.5, `rgba(255,120,0,${0.4 * pulse})`);
    wsGlow.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = wsGlow;
    ctx.beginPath();
    ctx.arc(wsX, wsY, wsr * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,230,80,${pulse})`;
    ctx.beginPath();
    ctx.arc(wsX, wsY, wsr, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,200,${0.9 * pulse})`;
    ctx.lineWidth = 2 * sc;
    ctx.beginPath();
    ctx.arc(wsX, wsY, wsr * 1.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,160,0,${0.7 * pulse})`;
    ctx.lineWidth = 1.5 * sc;
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI * 2 + weakSpot.pulseTimer * 2;
      ctx.beginPath();
      ctx.moveTo(wsX + Math.cos(ang) * wsr, wsY + Math.sin(ang) * wsr);
      ctx.lineTo(wsX + Math.cos(ang) * wsr * 1.6, wsY + Math.sin(ang) * wsr * 1.6);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ==============================
// Boss Health Bar HUD
// ==============================
export function drawBossHealthBar(
  ctx: CanvasRenderingContext2D,
  hp: number,
  maxHp: number,
  canvasW: number,
  scale: number
) {
  const blockW = 28 * scale;
  const blockH = 16 * scale;
  const gap = 4 * scale;
  const totalW = maxHp * blockW + (maxHp - 1) * gap;
  const startX = (canvasW - totalW) / 2;
  const y = 18 * scale;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  const padX = 12 * scale;
  const padY = 6 * scale;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(startX - padX, y - padY, totalW + padX * 2, blockH + padY * 2 + 16 * scale, 6 * scale);
  } else {
    ctx.rect(startX - padX, y - padY, totalW + padX * 2, blockH + padY * 2 + 16 * scale);
  }
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.font = `bold ${Math.round(10 * scale)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('\u2694 CHIMERA OF HADES \u2694', canvasW / 2, y + 2 * scale);

  for (let i = 0; i < maxHp; i++) {
    const bx = startX + i * (blockW + gap);
    const by = y + 13 * scale;
    const alive = i < hp;

    ctx.fillStyle = '#1a0a10';
    ctx.fillRect(bx + 2 * scale, by + 2 * scale, blockW, blockH);

    if (alive) {
      const blockGrad = ctx.createLinearGradient(bx, by, bx, by + blockH);
      blockGrad.addColorStop(0, '#dc2626');
      blockGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = blockGrad;
    } else {
      ctx.fillStyle = '#2a1010';
    }
    ctx.fillRect(bx, by, blockW, blockH);

    if (alive) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(bx + 2 * scale, by + 2 * scale, blockW - 4 * scale, blockH * 0.4);
    }

    ctx.strokeStyle = alive ? '#ef4444' : '#4a1520';
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(bx, by, blockW, blockH);
  }
}

export type PixelPalette = {
  skin: string;
  skinShade: string;
  hair: string;
  hairShade: string;
  top: string;
  topShade: string;
  bottom: string;
  outline: string;
};

export type SpriteGender = 'male' | 'female';

export const palettes: Record<SpriteGender, PixelPalette> = {
  male: {
    skin: '#f7d5b6', skinShade: '#dcae8a',
    hair: '#332e38', hairShade: '#1f1b23',
    top: '#86b6dc', topShade: '#5f8fb6',
    bottom: '#3f4c5e', outline: '#241f28',
  },
  female: {
    skin: '#fadfc6', skinShade: '#e3b697',
    hair: '#5d3c2b', hairShade: '#40271c',
    top: '#eaa9a2', topShade: '#cc867f',
    bottom: '#4b4359', outline: '#2b201d',
  },
};

export const FRAME_W = 24;
export const FRAME_H = 32;

type Frame = 'idleA' | 'idleB' | 'walkA' | 'walkB';
export type SpriteFrame = Frame;

const R = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

/* A soft, chibi pixel figure: big head, small body, two hair variants.
   Everything is drawn on a 24 × 32 grid so it stays readable. */
function drawSprite(ctx: CanvasRenderingContext2D, gender: SpriteGender, frame: Frame) {
  const p = palettes[gender];
  const o = p.outline;
  const blink = frame === 'idleB';
  const step = frame === 'walkA' ? 1 : frame === 'walkB' ? -1 : 0;

  ctx.clearRect(0, 0, FRAME_W, FRAME_H);

  // hair back layer (long hair falls behind the shoulders)
  if (gender === 'female') {
    R(ctx, 5, 6, 14, 12, p.hairShade);
    R(ctx, 5, 18, 3, 7, p.hair);
    R(ctx, 16, 18, 3, 7, p.hair);
  }

  // legs
  R(ctx, 9, 26, 3, 5 - (step > 0 ? 1 : 0), o);
  R(ctx, 12, 26, 3, 5 - (step < 0 ? 1 : 0), o);
  R(ctx, 9, 30, 3, 1, o);
  R(ctx, 12, 30, 3, 1, o);

  // body
  R(ctx, 8, 19, 8, 8, o);
  R(ctx, 9, 20, 6, 6, p.top);
  R(ctx, 9, 20, 6, 2, p.topShade);

  // arms
  R(ctx, 6, 20 - (step > 0 ? 1 : 0), 2, 6, o);
  R(ctx, 16, 20 - (step < 0 ? 1 : 0), 2, 6, o);

  // head
  R(ctx, 5, 5, 14, 13, o);
  R(ctx, 6, 6, 12, 11, p.skin);
  R(ctx, 6, 15, 12, 2, p.skinShade);

  // hair front
  R(ctx, 5, 4, 14, 4, o);
  R(ctx, 6, 5, 12, 3, p.hair);
  if (gender === 'male') R(ctx, 6, 7, 4, 2, p.hair);
  else { R(ctx, 6, 7, 3, 3, p.hair); R(ctx, 15, 7, 3, 3, p.hair); }

  // eyes
  if (blink) {
    R(ctx, 9, 11, 2, 1, o);
    R(ctx, 14, 11, 2, 1, o);
  } else {
    R(ctx, 9, 10, 2, 2, o);
    R(ctx, 14, 10, 2, 2, o);
    R(ctx, 9, 10, 1, 1, '#ffffff');
    R(ctx, 14, 10, 1, 1, '#ffffff');
  }

  // cheeks + mouth
  R(ctx, 7, 13, 2, 1, '#e79a92');
  R(ctx, 16, 13, 2, 1, '#e79a92');
  R(ctx, 11, 14, 3, 1, '#c97f76');
}

const cache = new Map<string, HTMLCanvasElement>();

export function spriteCanvas(gender: SpriteGender, frame: Frame, scale = 1) {
  const key = `${gender}-${frame}-${scale}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_W * scale;
  canvas.height = FRAME_H * scale;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawSprite(ctx, gender, frame);
  }
  cache.set(key, canvas);
  return canvas;
}

export const frameOrder: Frame[] = ['idleA', 'idleB'];
export const walkOrder: Frame[] = ['walkA', 'idleA', 'walkB', 'idleA'];

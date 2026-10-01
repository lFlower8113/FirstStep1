import * as THREE from 'three';

export type LabelOptions = {
  width?: number;
  height?: number;
  font?: string;
  color?: string;
  accent?: string;
  align?: 'left' | 'center';
  letterSpacing?: number;
};

export function makeLabelTexture(draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void, options: LabelOptions = {}) {
  const width = options.width ?? 1024;
  const height = options.height ?? 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    draw(ctx, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function trackedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: 'left' | 'center' = 'left') {
  const chars = [...text];
  const total = chars.reduce((sum, char) => sum + ctx.measureText(char).width + tracking, 0) - tracking;
  let cursor = align === 'center' ? x - total / 2 : x;
  for (const char of chars) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + tracking;
  }
}

export const labelDefaults: Required<Pick<LabelOptions, 'width' | 'height' | 'color' | 'accent' | 'align' | 'letterSpacing'>> = {
  width: 1024,
  height: 256,
  color: '#e8eefb',
  accent: '#f5bd87',
  align: 'center',
  letterSpacing: 6,
};

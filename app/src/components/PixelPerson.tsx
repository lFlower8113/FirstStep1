import { useEffect, useRef } from 'react';
import { frameOrder, spriteCanvas, walkOrder, type SpriteGender } from '../data/pixelSprites';

type PixelPersonProps = {
  gender: SpriteGender;
  walking?: boolean;
  scale?: number;
  className?: string;
  label?: string;
};

/* A billboard pixel sprite: always faces the camera, but moves
   through the 3D world with a four-frame walk cycle. */
export function PixelPerson({ gender, walking = false, scale = 3, className, label }: PixelPersonProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = (time: number) => {
      const interval = walking ? 150 : 620;
      if (time - lastRef.current > interval) {
        lastRef.current = time;
        frameRef.current = (frameRef.current + 1) % (walking ? walkOrder.length : frameOrder.length);
        const source = (walking ? walkOrder : frameOrder)[frameRef.current];
        const next = spriteCanvas(gender, source, 1);
        const target = canvasRef.current;
        if (target && next) {
          const ctx = target.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, target.width, target.height);
            ctx.drawImage(next, 0, 0, next.width, next.height);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const initial = spriteCanvas(gender, walking ? walkOrder[0] : frameOrder[0], 1);
    if (canvasRef.current && initial) canvasRef.current.getContext('2d')?.drawImage(initial, 0, 0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gender, walking]);

  return <div className={`pixel-person ${className ?? ''}`} style={{ '--pixel-scale': scale } as React.CSSProperties} aria-label={label}>
    <canvas ref={canvasRef} width={24} height={32} />
    {label && <span>{label}</span>}
  </div>;
}

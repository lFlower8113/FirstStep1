import { useEffect, useRef } from 'react';

type PixelAirplaneProps = {
  scale?: number;
  className?: string;
  label?: string;
};

const PLANE_W = 48;
const PLANE_H = 26;

const R = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

export function PixelAirplane({ scale = 3.5, className, label }: PixelAirplaneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beaconRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const draw = (beaconOn: boolean) => {
      ctx.clearRect(0, 0, PLANE_W, PLANE_H);

      const outline = '#172230';
      const bodyWhite = '#f4f7fc';
      const bodyShade = '#cad7e6';
      const bodyShadow = '#94a7bd';
      const cockpit = '#59a8ec';
      const cockpitHi = '#d2edff';
      const windowColor = '#467ea8';
      const seatWindow = '#f5bd87'; // 16A warm seat window
      const wingColor = '#e2ecf7';
      const wingShade = '#a8bed6';
      const goldAccent = '#f5bd87';
      const engineColor = '#475569';
      const engineIntake = '#1e293b';

      // --- Fuselage outline & body ---
      // Nose cone
      R(ctx, 41, 13, 2, 3, outline);
      R(ctx, 40, 12, 1, 5, outline);
      R(ctx, 42, 14, 1, 1, outline);

      // Main fuselage top & bottom outline
      R(ctx, 10, 10, 30, 1, outline);
      R(ctx, 9, 11, 1, 1, outline);
      R(ctx, 7, 18, 33, 1, outline);

      // Fuselage white fill
      R(ctx, 11, 11, 28, 4, bodyWhite);
      R(ctx, 39, 12, 1, 3, bodyWhite);
      R(ctx, 40, 13, 1, 2, bodyWhite);
      R(ctx, 41, 14, 1, 1, bodyWhite);

      // Fuselage bottom shading
      R(ctx, 10, 15, 29, 2, bodyShade);
      R(ctx, 12, 17, 26, 1, bodyShadow);

      // --- Cockpit window ---
      R(ctx, 35, 11, 3, 2, cockpit);
      R(ctx, 36, 11, 1, 1, cockpitHi);
      R(ctx, 38, 12, 1, 2, cockpit);

      // --- Passenger windows (with 16A highlight) ---
      for (let i = 0; i < 7; i++) {
        const wx = 14 + i * 3;
        // The 4th window corresponds to 16A, illuminated in warm amber
        if (i === 3) {
          R(ctx, wx, 12, 2, 2, seatWindow);
          R(ctx, wx + 1, 12, 1, 1, '#fff5ea');
        } else {
          R(ctx, wx, 12, 2, 2, windowColor);
        }
      }

      // --- Tail fin (vertical stabilizer) ---
      R(ctx, 4, 3, 3, 1, outline);
      R(ctx, 3, 4, 1, 7, outline);
      R(ctx, 7, 4, 1, 7, outline);
      R(ctx, 4, 4, 3, 7, wingColor);
      R(ctx, 4, 6, 3, 2, goldAccent); // Gold airline fin stripe
      R(ctx, 6, 4, 1, 7, wingShade);

      // Tail beacon light
      if (beaconOn) {
        R(ctx, 4, 2, 3, 1, '#ff6b6b');
      }

      // Tail cone back
      R(ctx, 7, 12, 3, 5, bodyShade);
      R(ctx, 5, 13, 2, 3, outline);

      // --- Wings ---
      // Far wing (subtle silhouette on top)
      R(ctx, 21, 8, 8, 2, wingShade);
      R(ctx, 22, 7, 5, 1, wingShade);

      // Near swept wing
      R(ctx, 18, 16, 14, 2, wingColor);
      R(ctx, 16, 18, 14, 2, wingColor);
      R(ctx, 14, 20, 12, 2, wingShade);
      R(ctx, 13, 21, 2, 1, outline);
      R(ctx, 15, 22, 9, 1, outline);

      // Winglet / tip light
      R(ctx, 13, 19, 2, 2, goldAccent);
      if (beaconOn) {
        R(ctx, 13, 18, 2, 1, '#4ade80'); // Green nav light
      }

      // --- Jet Engine pod ---
      R(ctx, 24, 19, 6, 3, engineColor);
      R(ctx, 30, 19, 1, 3, engineIntake);
      R(ctx, 23, 20, 1, 2, '#334155');
    };

    draw(true);

    const interval = setInterval(() => {
      beaconRef.current = !beaconRef.current;
      draw(beaconRef.current);
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`pixel-airplane ${className ?? ''}`}
      style={{ '--plane-scale': scale } as React.CSSProperties}
      aria-label={label ?? '像素小飞机'}
    >
      <canvas ref={canvasRef} width={PLANE_W} height={PLANE_H} />
    </div>
  );
}

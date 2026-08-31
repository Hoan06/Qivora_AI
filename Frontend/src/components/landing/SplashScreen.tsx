import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const burstColors = ["#7c3aed", "#ec4899", "#f97316", "#06b6d4"];

type BurstDot = {
  color: string;
  x: string;
  y: string;
};

export default function SplashScreen() {
  const [done, setDone] = useState(false);
  const [burstDots, setBurstDots] = useState<BurstDot[]>([]);

  useEffect(() => {
    const burstTimer = window.setTimeout(() => {
      setBurstDots(
        Array.from({ length: 30 }, (_, index) => {
          const angle = (Math.PI * 2 * index) / 30;
          const power = 90 + Math.random() * 170;

          return {
            color: burstColors[index % burstColors.length],
            x: `${Math.cos(angle) * power}px`,
            y: `${Math.sin(angle) * power}px`,
          };
        }),
      );
    }, 900);

    const doneTimer = window.setTimeout(() => setDone(true), 1500);

    return () => {
      window.clearTimeout(burstTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`qv-splash ${done ? "is-done" : ""}`}>
      <div>Qivora</div>
      {burstDots.map((dot, index) => (
        <span
          className="qv-burst-dot"
          key={`${dot.x}-${dot.y}-${index}`}
          style={
            {
              "--x": dot.x,
              "--y": dot.y,
              background: dot.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

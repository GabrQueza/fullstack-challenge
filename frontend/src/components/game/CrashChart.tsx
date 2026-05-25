"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store/useGameStore";

export function CrashChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const status = useGameStore((s) => s.status);
  const multiplier = useGameStore((s) => s.multiplier);
  const initialTimeRemaining = useGameStore((s) => s.timeRemaining);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (status === "BETTING" && initialTimeRemaining) {
      setTimeLeft(initialTimeRemaining);
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev !== null && prev > 100 ? prev - 100 : 0));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [status, initialTimeRemaining]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const currentMult = useGameStore.getState().multiplier;
      const currentStatus = useGameStore.getState().status;
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.moveTo(0, (height / 5) * i);
        ctx.lineTo(width, (height / 5) * i);
      }
      ctx.stroke();

      if (currentStatus === "BETTING") {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.beginPath();
      ctx.moveTo(0, height);

      const maxDisplayMult = Math.max(2.0, currentMult * 1.2);
      const timeElapsed = Math.log(currentMult) / 0.00006;
      
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const t = (timeElapsed / steps) * i;
        const m = Math.max(1.0, Math.exp(0.00006 * t));
        
        const x = (i / steps) * width * 0.9;
        const y = height - ((m - 1) / (maxDisplayMult - 1)) * height * 0.8;
        
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = currentStatus === "CRASHED" ? "#ef4444" : "#22c55e";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.shadowBlur = 15;
      ctx.shadowColor = currentStatus === "CRASHED" ? "#ef4444" : "#22c55e";
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (currentStatus !== "CRASHED") {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status]); 

  return (
    <div className="relative w-full h-96 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        {status === "BETTING" && (
          <div className="flex flex-col items-center mb-2">
            <div className="text-zinc-400 text-lg uppercase tracking-widest font-semibold">
              PREPARANDO RODADA
            </div>
            {timeLeft !== null && (
              <div className="text-emerald-400 text-4xl font-black tabular-nums font-mono mt-1">
                {(timeLeft / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        )}
        <div 
          className={`text-6xl md:text-8xl font-black tabular-nums tracking-tighter transition-colors ${
            status === "CRASHED" ? "text-red-500" : status === "IN_PROGRESS" ? "text-white" : "text-zinc-600"
          }`}
        >
          {multiplier.toFixed(2)}x
        </div>
        {status === "CRASHED" && (
          <div className="text-red-500 font-bold text-xl mt-2 tracking-widest uppercase">
            CRASHED
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speed: number;
  hue: number;
}

export default function UniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);

    const count = Math.floor((canvas.width * canvas.height) / 2000);
    starsRef.current = Array.from({ length: Math.max(count, 200) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 3 + 0.5,
      size: Math.random() * 2.2 + 0.3,
      opacity: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.35 + 0.08,
      hue: Math.random() * 60 + 220,
    }));

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isActive = mx > -1000;

      for (const star of starsRef.current) {
        star.x += Math.sin(star.y * 0.005) * star.speed;
        star.y -= Math.cos(star.x * 0.005) * star.speed * 0.6;

        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        if (isActive) {
          const dx = mx - star.x;
          const dy = my - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            const angle = Math.atan2(dy, dx);
            const repel = 1;
            star.x -= Math.cos(angle) * force * 2.5 * repel;
            star.y -= Math.sin(angle) * force * 2.5 * repel;
          }
        }

        const baseAlpha = star.opacity;
        let alpha = baseAlpha;
        if (isActive) {
          const dx = mx - star.x;
          const dy = my - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            alpha = Math.min(1, baseAlpha + (1 - baseAlpha) * ((200 - dist) / 200) * 0.6);
          }
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * star.z, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${star.hue}, 70%, ${isActive ? 80 : 70}%, ${alpha})`;
        ctx.fill();

        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * star.z * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${star.hue}, 60%, 85%, ${alpha * 0.08})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

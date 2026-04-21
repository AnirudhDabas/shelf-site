"use client";

import { useEffect, useRef } from "react";

export default function BackgroundCanvas({ opacity = 0.18 }: { opacity?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof canvas.transferControlToOffscreen !== "function") {
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker("/canvas.worker.js");
    } catch {
      return;
    }

    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage(
      {
        canvas: offscreen,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      [offscreen]
    );

    const handleResize = () => {
      worker.postMessage({
        type: "resize",
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleVisibility = () => {
      worker.postMessage({
        type: "visibility",
        hidden: document.hidden,
      });
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      worker.terminate();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
        zIndex: 0,
      }}
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

type Stat = {
  value: number;
  label: React.ReactNode;
  badge?: string;
};

const STATS: Stat[] = [
  { value: 40, label: "tests passing" },
  { value: 5, label: "scoring providers" },
  { value: 0, label: "API keys required*", badge: "* BYOK — bring your own keys" },
];

function useCountUp(target: number, trigger: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    if (target === 0) {
      setValue(0);
      return;
    }
    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [trigger, target, duration]);

  return value;
}

export default function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const v0 = useCountUp(STATS[0].value, inView);
  const v1 = useCountUp(STATS[1].value, inView);
  const values = [v0, v1, STATS[2].value];

  return (
    <Reveal as="section" className="stats-section">
      <div className="container" ref={sectionRef}>
        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <div className="stat" key={i}>
              <div className="stat-number">{values[i]}</div>
              <div className="stat-label">{stat.label}</div>
              {stat.badge && <div className="stat-badge">{stat.badge}</div>}
            </div>
          ))}
        </div>

        <div className="stack-line">
          TypeScript · Shopify Admin GraphQL 2026-01 · Perplexity Sonar ·
          OpenAI Responses API · Anthropic Claude Sonnet · Next.js 15 · Vitest
        </div>
      </div>
    </Reveal>
  );
}

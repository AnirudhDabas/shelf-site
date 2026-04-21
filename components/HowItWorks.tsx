"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";

type Node = {
  angle: number;
  label: string;
  sub?: string;
  split?: boolean;
};

const NODES: Node[] = [
  { angle: 0, label: "SHOPIFY CATALOG" },
  { angle: 51.4, label: "QUERY\nGENERATOR" },
  { angle: 102.8, label: "AI SCORING", sub: "pplx + openai" },
  { angle: 154.3, label: "HYPOTHESIS", sub: "proposer" },
  { angle: 205.7, label: "APPLY", sub: "change" },
  { angle: 257.1, label: "RE-SCORE", sub: "measure Δ" },
  { angle: 308.6, label: "KEEP / REVERT", sub: "decision", split: true },
];

const LOOP_DURATION = 14000;

export default function HowItWorks() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const start = performance.now();

    const tick = () => {
      const now = performance.now();
      const t = ((now - start) % LOOP_DURATION) / LOOP_DURATION;
      // The dot track rotates 0..360. Find node with closest angle to (t*360).
      const dotAngle = t * 360;
      let closest = 0;
      let best = Infinity;
      for (let i = 0; i < NODES.length; i++) {
        const diff = Math.min(
          Math.abs(NODES[i].angle - dotAngle),
          360 - Math.abs(NODES[i].angle - dotAngle)
        );
        if (diff < best) {
          best = diff;
          closest = i;
        }
      }
      setActiveIdx(closest);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <Reveal as="section" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">the autoresearch loop</h2>
          <p className="section-subtitle">
            inspired by{" "}
            <a
              href="https://github.com/karpathy"
              target="_blank"
              rel="noreferrer"
            >
              @karpathy
            </a>
            &apos;s autoresearch and{" "}
            <a
              href="https://github.com/davebcn87"
              target="_blank"
              rel="noreferrer"
            >
              @davebcn87
            </a>
            &apos;s pi-autoresearch
          </p>
        </div>

        <div className="loop-wrap">
          <div className="loop-ring" aria-hidden="true">
            <div className="loop-dashed" />
            <div className="loop-dot-track">
              <div className="loop-dot" />
            </div>
            {NODES.map((n, i) => (
              <div
                key={i}
                className="node"
                style={{ ["--angle" as string]: `${n.angle}deg` }}
              >
                <div
                  className={
                    "node-inner" +
                    (i === activeIdx ? " active" : "") +
                    (n.split ? " split" : "")
                  }
                >
                  <span className="node-label">{n.label}</span>
                  {n.sub && <span className="node-sub">{n.sub}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="loop-vertical" aria-hidden="true">
            {NODES.map((n, i) => (
              <div key={i}>
                <div className={"v-node" + (i === activeIdx ? " active" : "")}>
                  <span className="v-node-label">{n.label.replace("\n", " ")}</span>
                  {n.sub && <span className="v-node-sub">{n.sub}</span>}
                </div>
                {i < NODES.length - 1 && <div className="v-arrow">↓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="loop-cards">
          <div className="loop-card">
            <div className="loop-card-label">PROPOSE</div>
            <div className="loop-card-body">
              one atomic change at a time
            </div>
          </div>
          <div className="loop-card">
            <div className="loop-card-label">MEASURE</div>
            <div className="loop-card-body">
              real api calls to chatgpt + perplexity
            </div>
          </div>
          <div className="loop-card">
            <div className="loop-card-label">DECIDE</div>
            <div className="loop-card-body">
              keep if score ↑, revert if score ↓
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

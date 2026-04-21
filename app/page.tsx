"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCORES = [
  30, 36, 36, 40, 42, 50, 50, 54, 54, 58, 60, 62, 62, 64, 64, 66, 66, 66, 68,
  68, 68, 68, 68, 68, 68, 68,
];

const LABELED: Record<number, { delta: string; type: string; below?: boolean }> = {
  1: { delta: "+6", type: "title_rewrite" },
  5: { delta: "+8", type: "description_restructure", below: true },
  9: { delta: "+4", type: "metafield_add", below: true },
};

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const [gridOn, setGridOn] = useState(false);
  const [startLabelOn, setStartLabelOn] = useState(false);
  const [lineDrawing, setLineDrawing] = useState(false);
  const [endLabelOn, setEndLabelOn] = useState(false);
  const [bottomOn, setBottomOn] = useState(false);
  const [topOn, setTopOn] = useState(false);

  const [shownPts, setShownPts] = useState<Set<number>>(new Set());
  const [shownLabels, setShownLabels] = useState<Set<number>>(new Set());

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!size.w || !size.h) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    at(100, () => setGridOn(true));
    at(400, () => setStartLabelOn(true));
    at(600, () => setLineDrawing(true));

    for (let i = 1; i <= 25; i++) {
      const t = 600 + i * 100;
      at(t, () => setShownPts((s) => new Set(s).add(i)));
      if (LABELED[i]) {
        at(t + 300, () => setShownLabels((s) => new Set(s).add(i)));
      }
    }

    at(3100, () => setEndLabelOn(true));
    at(3600, () => setBottomOn(true));
    at(3900, () => setTopOn(true));

    return () => timers.forEach(clearTimeout);
  }, [size.w, size.h]);

  const padLeft = isMobile ? 40 : 80;
  const padRight = isMobile ? 20 : 40;
  const padTop = isMobile ? 20 : 40;
  const padBottom = isMobile ? 40 : 60;

  const innerW = Math.max(0, size.w - padLeft - padRight);
  const innerH = Math.max(0, size.h - padTop - padBottom);
  const Y_MIN = 29;
  const Y_MAX = 75;
  const xFor = (i: number) => padLeft + (i / 25) * innerW;
  const yFor = (s: number) =>
    padTop + (1 - (s - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

  let lineD = "";
  if (size.w > 0 && size.h > 0) {
    lineD = `M ${xFor(0)},${yFor(SCORES[0])}`;
    for (let i = 1; i < SCORES.length; i++) {
      lineD += ` L ${xFor(i)},${yFor(SCORES[i - 1])} L ${xFor(i)},${yFor(SCORES[i])}`;
    }
  }
  const handleCopy = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("npx shelf init").catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const ready = size.w > 0 && size.h > 0;

  return (
    <div className="chart-page">
      {/* Top bar */}
      <div className={`chart-topbar${topOn ? " shown" : ""}`}>
        <div className="chart-brand">
          <span className="chart-brand-dot" />
          <span className="chart-brand-name">shelf</span>
        </div>
        <a
          href="https://github.com/AnirudhDabas/shelf"
          target="_blank"
          rel="noreferrer"
          className="chart-top-link"
        >
          github →
        </a>
      </div>

      {/* Chart zone */}
      <div className="chart-zone" ref={containerRef}>
        {ready && (
          <>
            <svg
              width={size.w}
              height={size.h}
              style={{ position: "absolute", inset: 0, display: "block" }}
            >
              <defs>
                <clipPath id="chart-reveal" clipPathUnits="userSpaceOnUse">
                  <rect
                    x={0}
                    y={0}
                    height={size.h}
                    className="chart-reveal-rect"
                    style={{
                      width: `${lineDrawing ? size.w : 0}px`,
                    }}
                  />
                </clipPath>
              </defs>

              {/* Grid + axis labels */}
              <g
                style={{
                  opacity: gridOn ? 1 : 0,
                  transition: "opacity 300ms ease",
                }}
              >
                {[50].map((s) => {
                  const y = yFor(s);
                  return (
                    <line
                      key={s}
                      x1={padLeft}
                      x2={size.w - padRight}
                      y1={y}
                      y2={y}
                      stroke="#21262d"
                      strokeWidth={1}
                    />
                  );
                })}

                {[30, 50, 75].map((s) => {
                  if (isMobile && (s === 30 || s === 75)) return null;
                  return (
                    <text
                      key={s}
                      x={padLeft - 12}
                      y={yFor(s) + 4}
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      fill="#6b7280"
                      textAnchor="end"
                    >
                      {s}
                    </text>
                  );
                })}

                {[0, 5, 10, 15, 20, 25].map((i) => (
                  <text
                    key={i}
                    x={xFor(i)}
                    y={size.h - padBottom + 20}
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    fill="#6b7280"
                    textAnchor="middle"
                  >
                    {i}
                  </text>
                ))}
              </g>

              {/* Line (revealed left → right) */}
              <g clipPath="url(#chart-reveal)">
                <path
                  d={lineD}
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinejoin="miter"
                  strokeLinecap="square"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(34,197,94,0.4))",
                  }}
                />
              </g>

              {/* Kept dots (green) */}
              {SCORES.map((score, i) => {
                if (i === 0) return null;
                if (score <= SCORES[i - 1]) return null;
                const cx = xFor(i);
                const cy = yFor(score);
                const on = shownPts.has(i);
                return (
                  <g
                    key={`dot-${i}`}
                    className={on ? "chart-dot on" : "chart-dot"}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isMobile ? 4 : 5}
                      fill="#22c55e"
                      stroke="#070809"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}

              {/* Flat iter markers (red dash) */}
              {SCORES.map((score, i) => {
                if (i === 0) return null;
                if (score > SCORES[i - 1]) return null;
                const mid = (xFor(i) + xFor(i - 1)) / 2;
                const cy = yFor(score);
                const on = shownPts.has(i);
                return (
                  <line
                    key={`dash-${i}`}
                    x1={mid - 4}
                    x2={mid + 4}
                    y1={cy}
                    y2={cy}
                    stroke="#ef4444"
                    strokeWidth={2}
                    opacity={on ? 0.7 : 0}
                    style={{ transition: "opacity 200ms ease" }}
                  />
                );
              })}
            </svg>

            {/* "30" start label */}
            <div
              className="chart-start-label"
              style={{
                left: xFor(0),
                top: yFor(30),
                opacity: startLabelOn ? 1 : 0,
              }}
            >
              30
            </div>

            {/* Experiment labels */}
            {!isMobile &&
              Object.entries(LABELED).map(([k, info]) => {
                const iter = Number(k);
                const score = SCORES[iter];
                return (
                  <div
                    key={iter}
                    className={`chart-exp-label${info.below ? " below" : ""}`}
                    style={{
                      left: xFor(iter),
                      top: yFor(score),
                      opacity: shownLabels.has(iter) ? 1 : 0,
                    }}
                  >
                    <span style={{ color: "#22c55e" }}>{info.delta}</span>
                    <span style={{ color: "#4b5563" }}>{`  ${info.type}`}</span>
                  </div>
                );
              })}

            {/* plateau label */}
            {!isMobile && (
              <div
                className="chart-plateau-label"
                style={{
                  left: xFor(23),
                  top: yFor(68),
                  opacity: shownPts.has(23) ? 1 : 0,
                }}
              >
                plateau — stopped
              </div>
            )}

            {/* "68" end label */}
            <div
              className={`chart-end-label${endLabelOn ? " shown" : ""}`}
              style={{
                left: xFor(25),
                top: yFor(68),
                opacity: endLabelOn ? 1 : 0,
              }}
            >
              68
            </div>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className={`chart-bottom${bottomOn ? " shown" : ""}`}>
        <div className="chart-bottom-left">
          <div className="chart-bottom-stat">
            <span style={{ color: "#6b7280" }}>30</span>
            <span style={{ color: "#374151" }}>{" → "}</span>
            <span style={{ color: "#22c55e", fontWeight: 600 }}>68</span>
          </div>
          <div className="chart-bottom-meta">
            25 iterations · $2.00 · waterproof rain gear
          </div>
        </div>

        <div className="chart-bottom-center">
          <div className="chart-bottom-brand">shelf</div>
          <div className="chart-bottom-tagline">
            autoresearch for storefronts
          </div>
          <div className="chart-bottom-cmd">
            <span className="chart-bottom-cmd-text">
              <span style={{ color: "#374151" }}>$</span>
              <span style={{ color: "#9ca3af" }}>{" npx "}</span>
              <span style={{ color: "#f0f0f0", fontWeight: 600 }}>shelf</span>
              <span style={{ color: "#22c55e" }}>{" init"}</span>
            </span>
            <button
              type="button"
              className={`chart-bottom-copy${copied ? " copied" : ""}`}
              onClick={handleCopy}
              aria-label="Copy install command"
            >
              {copied ? "✓" : "copy"}
            </button>
          </div>
          <div className="chart-bottom-credits">
            inspired by{" "}
            <a
              href="https://github.com/karpathy/autoresearch"
              target="_blank"
              rel="noreferrer"
              className="chart-credits-link"
            >
              @karpathy
            </a>
            {"'s autoresearch and "}
            <a
              href="https://github.com/davebcn87/pi-autoresearch"
              target="_blank"
              rel="noreferrer"
              className="chart-credits-link"
            >
              @davebcn87
            </a>
            {"'s pi-autoresearch"}
          </div>
          <div className="chart-bottom-sub">
            no data leaves your machine
          </div>
        </div>

        <div className="chart-bottom-right">
          <a
            href="https://github.com/AnirudhDabas/shelf"
            target="_blank"
            rel="noreferrer"
            className="chart-bottom-link"
          >
            github →
          </a>
          <a
            href="https://github.com/AnirudhDabas/shelf#readme"
            target="_blank"
            rel="noreferrer"
            className="chart-bottom-link"
          >
            readme →
          </a>
        </div>
      </div>
    </div>
  );
}

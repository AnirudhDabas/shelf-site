"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Verdict = "kept" | "kept-uncertain" | "reverted" | "failed";

type Experiment = {
  name: string;
  verdict: Verdict;
  delta: number | null;
};

const EXPERIMENTS: Experiment[] = [
  { name: "Vanguard Elite", verdict: "kept", delta: 2.0 },
  { name: "The Tempest", verdict: "kept", delta: 4.0 },
  { name: "Nomad Trail", verdict: "reverted", delta: -2.0 },
  { name: "The Tempest", verdict: "kept", delta: 4.0 },
  { name: "Ridgeline 2.0", verdict: "kept", delta: 4.0 },
  { name: "The Explorer Pro", verdict: "failed", delta: null },
  { name: "Summit Shell", verdict: "kept-uncertain", delta: 2.0 },
  { name: "Phantom Rain", verdict: "reverted", delta: -4.0 },
];

const BASELINE = 30;
const TARGET = 68;

function formatDelta(d: number | null): string {
  if (d === null) return "—";
  if (d > 0) return `+${d.toFixed(2)}`;
  if (d < 0) return d.toFixed(2);
  return "+0.00";
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  if (verdict === "kept")
    return <span className="badge kept">KEPT ↑</span>;
  if (verdict === "kept-uncertain")
    return <span className="badge kept-uncertain">KEPT* ↑</span>;
  if (verdict === "reverted")
    return <span className="badge reverted">REVERTED ↓</span>;
  return <span className="badge failed">CHECKS FAILED</span>;
}

type ChartPoint = { x: number; y: number; verdict: "kept" | "reverted" };

export default function HeroWidget() {
  const [score, setScore] = useState(BASELINE);
  const [iteration, setIteration] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [kept, setKept] = useState(0);
  const [streamStart, setStreamStart] = useState(0);

  // Score animation loop: 30 -> 68 -> pause -> reset
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const step = (current: number) => {
      if (cancelled) return;
      if (current >= TARGET) {
        timer = setTimeout(() => {
          if (cancelled) return;
          setScore(BASELINE);
          setIteration(1);
          setKept(0);
          setElapsed(0);
          timer = setTimeout(() => step(BASELINE), 300);
        }, 3000);
        return;
      }

      // Slower near the target
      const progress = (current - BASELINE) / (TARGET - BASELINE);
      const delay = 250 + progress * 500;
      timer = setTimeout(() => {
        if (cancelled) return;
        setScore((s) => Math.min(TARGET, s + 2));
        setIteration((i) => i + 1);
        setKept((k) => k + (Math.random() > 0.25 ? 1 : 0));
        step(current + 2);
      }, delay);
    };

    step(BASELINE);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Elapsed timer
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => (e >= 34 * 60 + 12 ? 0 : e + 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Experiment stream rotation
  useEffect(() => {
    const id = setInterval(() => {
      setStreamStart((s) => (s + 1) % EXPERIMENTS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const cost = (iteration * 0.08).toFixed(2);
  const deltaFromBaseline = (score - BASELINE).toFixed(1);

  const visibleRows = useMemo(() => {
    const rows: Experiment[] = [];
    for (let i = 0; i < 5; i++) {
      rows.push(EXPERIMENTS[(streamStart + i) % EXPERIMENTS.length]);
    }
    return rows;
  }, [streamStart]);

  // Chart: one point per iteration step, approximating score progress.
  const chartPoints: ChartPoint[] = useMemo(() => {
    const W = 480;
    const H = 110;
    const pts: ChartPoint[] = [];
    const steps = Math.max(1, iteration);
    const maxSteps = Math.ceil((TARGET - BASELINE) / 2);
    for (let i = 0; i < steps; i++) {
      const ratio = i / Math.max(1, maxSteps);
      const x = ratio * W;
      const scoreAt = Math.min(
        TARGET,
        BASELINE + (i / Math.max(1, steps - 1)) * (score - BASELINE)
      );
      const y = H - ((scoreAt - BASELINE) / (100 - BASELINE)) * H * 1.6;
      pts.push({
        x,
        y: Math.max(4, Math.min(H - 4, y)),
        verdict: i % 5 === 2 ? "reverted" : "kept",
      });
    }
    return pts;
  }, [iteration, score]);

  const pathD = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const parts = chartPoints.map(
      (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    );
    return parts.join(" ");
  }, [chartPoints]);

  const areaD = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return (
      `M ${first.x.toFixed(1)} 110 ` +
      chartPoints
        .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ") +
      ` L ${last.x.toFixed(1)} 110 Z`
    );
  }, [chartPoints]);

  return (
    <div className="widget" role="img" aria-label="shelf autoresearch dashboard live demo">
      <div className="widget-header">
        <div className="dots">
          <span style={{ background: "#ff5f57" }} />
          <span style={{ background: "#febc2e" }} />
          <span style={{ background: "#28c840" }} />
        </div>
        <div className="widget-title">shelf — autoresearch dashboard</div>
        <div className="widget-live">
          <span className="dot pulse-dot" />
          <span>live</span>
        </div>
      </div>

      <div className="score-section">
        <div className="score-label">AI Shelf Score</div>
        <div className="score-row">
          <div className="score-number">{score.toFixed(1)}</div>
          <div className="score-stats">
            <span className="sl">iteration</span>
            <span className="sv">{iteration}</span>
            <span className="sl">elapsed</span>
            <span className="sv">{formatElapsed(elapsed)}</span>
            <span className="sl">est. cost</span>
            <span className="sv">${cost}</span>
            <span className="sl">kept</span>
            <span className="sv">{kept}</span>
          </div>
        </div>
        <div className="score-delta">
          +{deltaFromBaseline} from baseline {BASELINE.toFixed(1)}
        </div>
      </div>

      <div className="chart-section">
        <Chart pathD={pathD} areaD={areaD} points={chartPoints} />
      </div>

      <div className="stream">
        {visibleRows.map((row, idx) => (
          <StreamRow
            key={`${streamStart}-${idx}`}
            row={row}
            index={(streamStart + idx) % EXPERIMENTS.length}
          />
        ))}
      </div>
    </div>
  );
}

function Chart({
  pathD,
  areaD,
  points,
}: {
  pathD: string;
  areaD: string;
  points: ChartPoint[];
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setLen(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  return (
    <svg
      viewBox="0 0 480 110"
      preserveAspectRatio="none"
      width="100%"
      height="110"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,197,94,0.18)" />
          <stop offset="100%" stopColor="rgba(34,197,94,0)" />
        </linearGradient>
      </defs>
      {[28, 55, 82].map((y) => (
        <line
          key={y}
          x1={0}
          x2={480}
          y1={y}
          y2={y}
          stroke="var(--border)"
          strokeWidth={0.5}
        />
      ))}
      {areaD && <path d={areaD} fill="url(#chartFill)" />}
      {pathD && (
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="var(--green)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            strokeDasharray: len || undefined,
            strokeDashoffset: 0,
          }}
        />
      )}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={p.verdict === "kept" ? "var(--green)" : "var(--red)"}
          stroke="var(--bg)"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

function StreamRow({ row, index }: { row: Experiment; index: number }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const deltaColor =
    row.delta === null
      ? "var(--text-3)"
      : row.delta > 0
      ? "var(--green)"
      : row.delta < 0
      ? "var(--red)"
      : "var(--text-3)";

  return (
    <div
      className="stream-row"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
      }}
    >
      <span className="stream-iter">
        {(index + 1).toString().padStart(2, "0")}
      </span>
      <span className="stream-name">{row.name}</span>
      <VerdictBadge verdict={row.verdict} />
      <span className="stream-delta" style={{ color: deltaColor }}>
        {formatDelta(row.delta)}
      </span>
    </div>
  );
}

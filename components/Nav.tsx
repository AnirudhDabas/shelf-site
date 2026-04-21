"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      setProgress(pct);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <>
      <div
        className="scroll-progress"
        style={{
          width: `${progress}%`,
          opacity: progress > 5 ? 1 : 0,
        }}
      />
      <nav className="nav">
        <div className="nav-inner">
          <a href="#top" className="nav-brand" aria-label="shelf home">
            <span className="dot" />
            <span>shelf</span>
          </a>
          <div className="nav-links">
            <a
              className="nav-link"
              href="https://github.com/AnirudhDabas/shelf"
              target="_blank"
              rel="noreferrer"
            >
              github
            </a>
            <a
              className="nav-link"
              href="https://github.com/AnirudhDabas/shelf#readme"
              target="_blank"
              rel="noreferrer"
            >
              docs
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}

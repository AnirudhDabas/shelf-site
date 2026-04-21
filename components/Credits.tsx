"use client";

import Reveal from "./Reveal";

export default function Credits() {
  return (
    <Reveal as="section" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">shelf stands on shoulders</h2>
          <p className="section-subtitle">
            shelf doesn&apos;t invent the loop — it ports a great pattern to a
            new domain
          </p>
        </div>

        <div className="credits-grid">
          <div className="credit-card">
            <div className="credit-name">autoresearch</div>
            <div className="credit-author">
              Andrej Karpathy ·{" "}
              <a
                className="handle"
                href="https://x.com/karpathy"
                target="_blank"
                rel="noreferrer"
              >
                @karpathy
              </a>
            </div>
            <div className="credit-quote">&ldquo;the original loop pattern&rdquo;</div>
            <a
              className="credit-link"
              href="https://github.com/karpathy/autoresearch"
              target="_blank"
              rel="noreferrer"
            >
              github.com/karpathy/autoresearch →
            </a>
          </div>

          <div className="credit-card">
            <div className="credit-name">pi-autoresearch</div>
            <div className="credit-author">
              David Cortés ·{" "}
              <a
                className="handle"
                href="https://x.com/davebcn87"
                target="_blank"
                rel="noreferrer"
              >
                @davebcn87
              </a>
              {" + "}
              Tobi Lütke ·{" "}
              <a
                className="handle"
                href="https://x.com/tobi"
                target="_blank"
                rel="noreferrer"
              >
                @tobi
              </a>
            </div>
            <div className="credit-quote">
              &ldquo;shelf.jsonl and shelf.md follow this format exactly&rdquo;
            </div>
            <a
              className="credit-link"
              href="https://github.com/davebcn87/pi-autoresearch"
              target="_blank"
              rel="noreferrer"
            >
              github.com/davebcn87/pi-autoresearch →
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

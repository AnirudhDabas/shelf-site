"use client";

import InstallBlock from "./InstallBlock";
import Reveal from "./Reveal";

export default function CTA() {
  return (
    <Reveal as="section" className="cta-section">
      <div className="container">
        <h2 className="cta-title">start optimizing</h2>
        <p className="cta-sub">
          one command. runs locally. costs ~$2 per session.
        </p>
        <div className="cta-install">
          <InstallBlock />
        </div>
        <div className="cta-links">
          <a
            href="https://github.com/AnirudhDabas/shelf"
            target="_blank"
            rel="noreferrer"
          >
            github.com/AnirudhDabas/shelf →
          </a>
          <a
            href="https://github.com/AnirudhDabas/shelf#readme"
            target="_blank"
            rel="noreferrer"
          >
            read the README →
          </a>
        </div>
      </div>
    </Reveal>
  );
}

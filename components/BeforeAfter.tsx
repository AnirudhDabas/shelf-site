"use client";

import Reveal from "./Reveal";

const META_ROWS: { k: string; v: string }[] = [
  { k: "material", v: "ripstop nylon" },
  { k: "use_case", v: "cycling commute" },
  { k: "weight", v: "285g" },
  { k: "waterproof_rating", v: "20,000mm" },
];

export default function BeforeAfter() {
  return (
    <Reveal as="section" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">what changes in your catalog</h2>
          <p className="section-subtitle">
            atomic edits, one at a time — auditable, reversible
          </p>
        </div>

        <div className="ba-grid">
          {/* Card 1 — title rewrite */}
          <div className="ba-card">
            <div className="ba-before">The Explorer Pro</div>
            <div className="ba-divider">
              <div className="arrow">→</div>
            </div>
            <div className="ba-after">
              Packable Rain Jacket — Men&apos;s Ultralight Waterproof Shell
            </div>
            <div className="ba-footer">
              <span className="type">title_rewrite</span>
              <span className="lift">+6.0 score lift</span>
            </div>
          </div>

          {/* Card 2 — metafield addition */}
          <div className="ba-card">
            <div className="ba-before">// no metafields</div>
            <div className="ba-divider">
              <div className="arrow">→</div>
            </div>
            <div className="ba-after">
              <div className="ba-meta">
                {META_ROWS.map((row) => (
                  <span key={row.k} style={{ display: "contents" }}>
                    <span className="k">{row.k}</span>
                    <span className="v">{row.v}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="ba-footer">
              <span className="type">metafield_add</span>
              <span className="lift">+4.0 score lift</span>
            </div>
          </div>

          {/* Card 3 — description restructure */}
          <div className="ba-card">
            <div className="ba-before">
              Revolutionary outerwear for the modern adventurer who
              refuses to compromise...
            </div>
            <div className="ba-divider">
              <div className="arrow">→</div>
            </div>
            <div className="ba-after">
              3-layer waterproof shell. 285g. Packs into chest pocket.
              20,000mm waterproof rating. Seam-sealed throughout.
              For: trail running, cycling, travel.
            </div>
            <div className="ba-footer">
              <span className="type">description_restructure</span>
              <span className="lift">+8.0 score lift</span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

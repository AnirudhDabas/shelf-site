"use client";

import { useState } from "react";

export default function InstallBlock({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("npx shelf-ai init");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — noop */
    }
  };

  return (
    <div className={`install-block${className ? " " + className : ""}`}>
      <div className="install-cmd">
        <span className="t-dollar">$</span>
        <span className="t-npx">npx</span>
        <span className="t-shelf">shelf-ai</span>
        <span className="t-init">init</span>
      </div>
      <button
        type="button"
        onClick={copy}
        className={`copy-btn${copied ? " copied" : ""}`}
        aria-label="Copy install command"
      >
        {copied ? "✓ copied" : "copy"}
      </button>
    </div>
  );
}

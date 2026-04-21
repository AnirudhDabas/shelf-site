"use client";

import { motion } from "framer-motion";
import HeroWidget from "./HeroWidget";
import InstallBlock from "./InstallBlock";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-grid">
          <div>
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0, ease: "easeOut" }}
            >
              [ autoresearch for storefronts ]
              <span className="blink-cursor" style={{ marginLeft: 4 }}>
                ▌
              </span>
            </motion.div>

            <h1 className="hero-headline">
              <motion.span
                className="l1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              >
                your store
              </motion.span>
              <motion.span
                className="l2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              >
                isn&apos;t showing up
              </motion.span>
            </h1>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
            >
              Shopify connected 5.6M stores to ChatGPT on March 24th.
              shelf is an autonomous agent that tunes your catalog
              until the AI agents actually recommend you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
            >
              <InstallBlock />
            </motion.div>

            <motion.div
              className="install-meta"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            >
              MIT · BYOK · runs locally · no data leaves your machine
            </motion.div>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
            >
              <a
                href="https://github.com/AnirudhDabas/shelf"
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                view on github →
              </a>
              <a
                href="https://github.com/AnirudhDabas/shelf#readme"
                target="_blank"
                rel="noreferrer"
                className="link-plain"
              >
                read the docs →
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <HeroWidget />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

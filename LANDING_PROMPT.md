# shelf landing page — complete build prompt

You are building the landing page for shelf, an open-source CLI 
tool. Read every section of this document before writing a single 
line of code.

---

## CONTEXT — WHAT SHELF IS

shelf is a CLI tool that autonomously optimizes Shopify product 
catalogs until AI shopping agents (ChatGPT, Perplexity, Google 
AI Mode) actually surface those products in search results.

The core loop (the "autoresearch loop"):
1. Generate 50 realistic shopper queries for the store's category
2. Ask those queries to real AI agents via their APIs
3. Score: how many queries surface the store's products?
4. Propose one atomic catalog change (title rewrite, metafield 
   add, description restructure)
5. Apply via Shopify Admin GraphQL API
6. Re-score. Keep if better, revert if not.
7. Loop forever until you stop it.

Every experiment is logged to shelf.jsonl. Every revert is visible.
MAD confidence scoring filters noise from real gains.

Real demo numbers: a test store went from 30/100 to 68/100 
AI Shelf Score in one session, 25 iterations, ~$2 API cost.

GitHub: https://github.com/AnirudhDabas/shelf
Install: npx shelf-ai init

Built by: Anirudh Dabas, CS student at University of Waterloo
Inspired by: Andrej Karpathy's autoresearch (@karpathy) and 
David Cortés's pi-autoresearch (@davebcn87), which Tobi Lütke 
(@tobi, CEO of Shopify) personally contributed 32 commits to.

---

## TECH STACK — USE EXACTLY THESE

- Next.js 15 (App Router)
- TypeScript, strict mode
- Tailwind CSS v4
- Framer Motion for animations
- NO other dependencies

Deploy target: Vercel (static export is fine)

---

## FILE STRUCTURE

```
shelf-site/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── BackgroundCanvas.tsx
│   ├── WorksWith.tsx
│   ├── HowItWorks.tsx
│   ├── BeforeAfter.tsx
│   ├── Stats.tsx
│   ├── Credits.tsx
│   ├── CTA.tsx
│   └── Footer.tsx
├── public/
│   └── canvas.worker.js
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## DESIGN SYSTEM — NON-NEGOTIABLE

### Colors (CSS variables in globals.css)

```css
:root {
  --bg: #070809;
  --surface: #0f1012;
  --surface-2: #141618;
  --border: #1e2124;
  --border-2: #252830;
  --text-1: #f0f0f0;
  --text-2: #9ca3af;
  --text-3: #4b5563;
  --green: #22c55e;
  --green-dim: rgba(34, 197, 94, 0.12);
  --green-border: rgba(34, 197, 94, 0.25);
  --red: #ef4444;
  --red-dim: rgba(239, 68, 68, 0.12);
  --red-border: rgba(239, 68, 68, 0.25);
  --yellow: #eab308;
}
```

### Typography

ONLY use DM Mono from Google Fonts. Load it in layout.tsx:
```
weights: 400, 500, 600
```

Every single element on this page uses DM Mono.
No sans-serif. No exceptions. This is a CLI tool.
The monospace aesthetic IS the brand.

### Spacing and layout

- Max content width: 1200px, centered, padding 0 24px
- Section padding: 96px 0 on desktop, 64px 0 on mobile
- Border radius: 6px for cards, 4px for badges, 0 for inputs
- Never use box-shadows. Use borders instead.

### The critical rule about backgrounds

EVERY section that contains text MUST have an explicit 
background color. The animated canvas is behind everything.
Without solid backgrounds, text is unreadable.

Every section: background: var(--bg)
Every card: background: var(--surface)
Every nested card: background: var(--surface-2)

Do not use rgba with low opacity on sections. Use solid colors.

---

## COMPONENT SPECIFICATIONS

### BackgroundCanvas.tsx

This component renders the animated falling-text background.
It MUST use OffscreenCanvas + Web Worker to avoid blocking 
the main thread. This is why the page was freezing before.

```tsx
'use client'
import { useEffect, useRef } from 'react'

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check for OffscreenCanvas support
    if (!canvas.transferControlToOffscreen) {
      // Fallback: simple static noise, no animation
      return
    }

    const offscreen = canvas.transferControlToOffscreen()
    const worker = new Worker('/canvas.worker.js')
    worker.postMessage(
      { canvas: offscreen, width: window.innerWidth, 
        height: window.innerHeight },
      [offscreen]
    )

    const handleResize = () => {
      worker.postMessage({ 
        type: 'resize',
        width: window.innerWidth, 
        height: window.innerHeight 
      })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      worker.terminate()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.18, zIndex: 0 }}
    />
  )
}
```

### public/canvas.worker.js

The falling text animation. Runs entirely off the main thread.

```javascript
let ctx, width, height, cols, drops, lastTime

const CHARS = [
  '30.0', '36.0', '40.0', '46.0', '52.0', '56.0', '62.0', '68.0',
  'kept', 'reverted', 'noise', 'high', 'medium', 'low',
  '+6.00', '-2.00', '+0.00', '+4.00',
  'title_rewrite', 'metafield_add', 'seo_title',
  '✓', '✗', '↺', '▶', '■',
]

const FONT_SIZE = 13
const FPS_CAP = 30

self.onmessage = function(e) {
  if (e.data.type === 'resize') {
    width = e.data.width
    height = e.data.height
    initCols()
    return
  }

  const canvas = e.data.canvas
  width = e.data.width
  height = e.data.height
  ctx = canvas.getContext('2d')
  initCols()
  requestAnimationFrame(animate)
}

function initCols() {
  cols = Math.floor(width / (FONT_SIZE * 8))
  drops = Array(cols).fill(0).map(() => Math.random() * -100)
}

function animate(timestamp) {
  requestAnimationFrame(animate)
  
  // 30fps cap
  if (!lastTime) lastTime = timestamp
  if (timestamp - lastTime < 1000 / FPS_CAP) return
  lastTime = timestamp

  // Fade trail
  ctx.fillStyle = 'rgba(7, 8, 9, 0.05)'
  ctx.fillRect(0, 0, width, height)

  ctx.font = `400 ${FONT_SIZE}px "DM Mono", monospace`

  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)]
    const x = i * (FONT_SIZE * 8)
    const y = drops[i] * FONT_SIZE

    // Head is bright green, tail fades
    const brightness = Math.random() > 0.95 ? 0.8 : 0.25
    ctx.fillStyle = `rgba(34, 197, 94, ${brightness})`
    ctx.fillText(char, x, y)

    // Reset drop randomly
    if (y > height && Math.random() > 0.97) {
      drops[i] = 0
    }
    drops[i] += 0.4 + Math.random() * 0.3
  }
}
```

---

### Nav.tsx

Sticky nav, 52px tall. Blurs on scroll.

```
Left: ● shelf  (green dot, DM Mono 500, --text-1)
Right: "github" and "docs" links (--text-2, hover --text-1)
       github links to https://github.com/AnirudhDabas/shelf
       docs links to https://github.com/AnirudhDabas/shelf#readme

Background: var(--bg) with backdrop-filter: blur(12px)
Border-bottom: 1px solid var(--border)

Scroll progress bar:
  2px line at very top of page
  Color: var(--green)
  Width grows from 0% to 100% as user scrolls
  Only visible after 5% scroll depth
```

---

### Hero.tsx

Full viewport height. Two column layout on desktop.
Left: text content. Right: animated widget.

#### Left column content (top to bottom):

**Badge:**
```
[ autoresearch for storefronts ]▌
```
Border: 1px solid var(--border)
Background: var(--surface)
Font: DM Mono 400, 11px, --text-2
The ▌ cursor blinks with CSS animation

**Headline:**
```
your store
isn't showing up
```
Font: DM Mono 600
Size: clamp(48px, 6vw, 80px)
Line 1: var(--text-1)
Line 2: var(--green)
Each line is a separate <span> with display: block
NO word wrapping mid-phrase on desktop

**Subtext:**
```
Shopify connected 5.6M stores to ChatGPT on March 24th.
shelf is an autonomous agent that tunes your catalog
until the AI agents actually recommend you.
```
Font: DM Mono 400, 15px, var(--text-2)
Max-width: 480px
Line-height: 1.7

**Install block:**
```
$ npx shelf-ai init          [copy]
```
Background: var(--surface)
Border: 1px solid var(--border)
Border-radius: 6px
Padding: 14px 20px
Font: DM Mono 400

Token colors inside the command:
- "$" → var(--text-3)
- "npx" → var(--text-2)
- "shelf" → var(--text-1), font-weight: 600
- "init" → var(--green)

Copy button: right-aligned, --text-3 normally, 
--green when clicked with "✓ copied!" text

Below the block:
```
MIT · BYOK · runs locally · no data leaves your machine
```
Font: 11px, var(--text-3)

**Action links:**
```
[view on github →]    read the docs →
```
First: outlined button
  background: transparent
  border: 1px solid var(--border)
  color: var(--text-1)
  padding: 10px 20px
  hover: border-color var(--green), color var(--green)
  transition: all 150ms ease

Second: plain text link
  color: var(--text-2)
  hover: color var(--text-1)

#### Right column — Live Demo Widget

This is the centerpiece. Must feel alive.

Widget container:
  background: var(--surface)
  border: 1px solid var(--border)
  border-radius: 8px
  max-width: 520px
  width: 100%

**Widget header:**
  background: var(--bg)
  border-bottom: 1px solid var(--border)
  padding: 10px 16px
  display: flex, align-items: center
  
  Left: three dots — 8px circles
    colors: #ff5f57, #febc2e, #28c840
  Center: "shelf — autoresearch dashboard" 
    DM Mono 400 11px var(--text-3)
  Right: ● live
    green dot 6px + "live" in var(--green) 11px

**Score section:**
  padding: 20px 20px 16px

  Row 1: "AI SHELF SCORE" label
    10px, DM Mono 400, var(--text-3), letter-spacing: 0.12em

  Row 2: score number + stats
    Score: animated counter 30→68→30 on loop
      Font: DM Mono 600 52px var(--text-1)
      Animation: counts up in ~20s, pauses 2s at 68, resets
      Use useEffect + setInterval, not CSS
    
    Stats (right side, stacked):
      ITERATION  [n]
      ELAPSED    [Xm Ys]
      EST. COST  [$X.XX]
      KEPT       [n]
      
      Label: 10px DM Mono var(--text-3)
      Value: 11px DM Mono var(--text-1), text-align: right

  Row 3: "+XX.X from baseline 30.0"
    13px, DM Mono, var(--green)

**Chart section:**
  padding: 0 20px 16px
  height: 80px

  SVG line chart.
  Background: subtle grid lines at y=25,50,75
    stroke: var(--border), stroke-width: 0.5
  
  The line draws itself as score animates:
    Use SVG polyline with stroke-dashoffset
    Color: var(--green), stroke-width: 2
    Fill below line: linearGradient 
      from rgba(34,197,94,0.15) to rgba(34,197,94,0)
  
  Dots on data points:
    kept: r=4, fill: var(--green), stroke: var(--bg) stroke-width: 1.5
    reverted: r=4, fill: var(--red), same stroke

**Experiment stream:**
  border-top: 1px solid var(--border)
  padding: 8px 0

  5 rows. New rows animate in from top every 2-3s.
  Old rows fade out. Loop the sequence:

  Row data (rotate through these):
  ```
  01  Vanguard Elite    [KEPT ↑]          +2.00
  02  The Tempest       [KEPT ↑]          +4.00
  03  Nomad Trail       [REVERTED ↓]      -2.00
  04  The Tempest       [KEPT ↑]          +4.00
  05  Ridgeline 2.0     [KEPT ↑]          +4.00
  06  The Explorer Pro  [CHECKS FAILED]    —
  07  Summit Shell      [KEPT* ↑]         +2.00
  08  Phantom Rain      [REVERTED ↓]      -4.00
  ```

  Row layout: padding 8px 20px
    - iteration number: 2ch min-width, var(--text-3), 11px
    - product name: flex-1, var(--text-1), 12px, font-weight: 500
    - verdict badge (right): see badge specs below
    - delta (rightmost): 5ch, text-align right, 12px
      positive: var(--green)
      negative: var(--red)
      zero: var(--text-3)

  Badge specs:
    KEPT ↑
      bg: var(--green-dim)
      border: 1px solid var(--green-border)
      color: var(--green)
    KEPT* ↑ (uncertain)
      bg: rgba(234,179,8,0.12)
      border: 1px solid rgba(234,179,8,0.25)
      color: var(--yellow)
    REVERTED ↓
      bg: var(--red-dim)
      border: 1px solid var(--red-border)
      color: var(--red)
    CHECKS FAILED
      bg: transparent
      border: 1px solid var(--border)
      color: var(--text-3)
    
    All badges: padding 2px 8px, border-radius 4px,
    font: DM Mono 400 10px, white-space: nowrap

---

### WorksWith.tsx

Thin strip between hero and how-it-works.

```
─────── works with ───────
```

Thin lines on each side using CSS gradients.

Then logos in a row:
  Shopify · ChatGPT · Perplexity · Google AI Mode · Anthropic

Build these as pure SVG inline components.
Do NOT use emoji or Unicode symbols as logos.

Shopify SVG: the shopping bag icon (the real shape)
ChatGPT SVG: OpenAI's circular logo mark
Perplexity SVG: their hexagonal logo mark  
Google: simple "G" in a circle
Anthropic: their "A" mark

ALL logos: monochrome var(--text-2), 
hover: var(--text-1), transition 150ms

Gap between logos: 56px on desktop
Section background: var(--bg)
Border-top and border-bottom: 1px solid var(--border)
Padding: 28px 0

---

### HowItWorks.tsx

Section headline: "the autoresearch loop"
Subtitle: 
  "inspired by @karpathy's autoresearch and 
   @davebcn87's pi-autoresearch"
   (@karpathy and @davebcn87 are links to their GitHub)

**Loop diagram:**

DO NOT use SVG for this. Use CSS + HTML instead.
SVG on a canvas-background page causes z-index hell.

Build it as 7 HTML nodes in a circular arrangement 
using CSS transforms (rotate → translateX → rotate back).

Node structure:
```html
<div class="loop-ring">  <!-- 500px × 500px circle -->
  <div class="node" style="--angle: 0deg">
    <div class="node-inner">
      <span class="node-label">SHOPIFY CATALOG</span>
    </div>
  </div>
  <!-- 6 more nodes at 51.4deg intervals -->
</div>
```

Node CSS:
```css
.node {
  position: absolute;
  top: 50%; left: 50%;
  transform: rotate(var(--angle)) translateX(200px) 
             rotate(calc(-1 * var(--angle)));
  /* This places node at the correct position on the circle */
}

.node-inner {
  width: 88px; height: 88px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
}

.node-inner.active {
  border-color: var(--green);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}
```

The 7 nodes:
  0deg:    SHOPIFY CATALOG
  51.4deg: QUERY GENERATOR  
  102.8deg: AI SCORING (subtitle: pplx + openai)
  154.3deg: HYPOTHESIS (subtitle: proposer)
  205.7deg: APPLY (subtitle: change)
  257.1deg: RE-SCORE (subtitle: measure Δ)
  308.6deg: KEEP / REVERT (subtitle: decision)
  
  The KEEP/REVERT node has a vertical dividing line:
  Left half: var(--green) tinted
  Right half: var(--red) tinted

The dashed ring connecting them:
  CSS border: 2px dashed var(--border-2)
  border-radius: 50%
  position: absolute
  width: 100%; height: 100%

Traveling dot animation:
  A single div with position: absolute, 
  top: 0, left: 50%, transform: translateX(-50%)
  width 10px, height 10px, border-radius 50%
  background: var(--green)
  box-shadow: 0 0 8px var(--green)
  
  CSS animation: rotate 14s linear infinite
  This makes the dot travel around the ring.
  The dot starts at the top and goes clockwise.

Active node highlight:
  Use JavaScript to determine which node is "active" 
  based on the dot's current angle position.
  Add the .active class to the corresponding node.

Below the diagram, three cards:
```
PROPOSE              MEASURE              DECIDE
one atomic change    real api calls       keep if score ↑
at a time            to chatgpt +         revert if score ↓
                     perplexity
```

Cards:
  background: var(--surface)
  border: 1px solid var(--border)
  padding: 20px 24px
  
  Label: DM Mono 600 11px var(--green) letter-spacing 0.12em
  Body: DM Mono 400 13px var(--text-2) line-height 1.6
  Margin-top: 48px

---

### BeforeAfter.tsx

Section headline: "what changes in your catalog"
Subtitle: "atomic edits, one at a time — auditable, reversible"

Three cards side by side (grid on desktop, single column mobile).

Each card:
  background: var(--surface)
  border: 1px solid var(--border)
  border-radius: 6px
  overflow: hidden

Card structure (top to bottom):
  BEFORE section (40% of card height):
    background: rgba(239, 68, 68, 0.04)
    padding: 16px
    content in var(--red), 13px DM Mono
  
  Divider:
    height: 1px
    background: var(--border)
    position: relative
    
    The arrow:
      position: absolute, center of divider
      20px × 20px circle
      background: var(--surface)
      border: 1px solid var(--border)
      content: "→"
      color: var(--text-3)
      font-size: 10px

  AFTER section (60% of card height):
    background: rgba(34, 197, 94, 0.04)
    padding: 16px
    content in var(--green), 13px DM Mono

  Footer:
    border-top: 1px solid var(--border)
    padding: 10px 16px
    display: flex, justify-content: space-between
    
    Left: hypothesis type (title_rewrite, etc.)
      var(--text-3), 11px
    Right: "+X.0 score lift"
      var(--green), 11px

Card 1 — Title rewrite:
  Before: "The Explorer Pro"
  After: "Packable Rain Jacket — Men's Ultralight Waterproof Shell"
  Type: title_rewrite
  Lift: +6.0

Card 2 — Metafield addition:
  Before: "// no metafields"  (styled like a code comment)
  After: 
    material        ripstop nylon
    use_case        cycling commute
    weight          285g
    waterproof_rating  20,000mm
  (key: var(--text-3), value: var(--green))
  Type: metafield_add
  Lift: +4.0

Card 3 — Description restructure:
  Before: "Revolutionary outerwear for the modern adventurer 
           who refuses to compromise..."
  After: "3-layer waterproof shell. 285g. Packs into chest 
          pocket. 20,000mm waterproof rating. Seam-sealed 
          throughout. For: trail running, cycling, travel."
  Type: description_restructure
  Lift: +8.0

---

### Stats.tsx

Three big numbers, centered.

```
   40           5           0
   tests     scoring    API keys
  passing   providers  required*
```

Number font: DM Mono 600, 64px, var(--text-1)
Label font: DM Mono 400, 12px, var(--text-2), text-align center

Count-up animation: each number counts from 0 to final value
when it enters the viewport. Use IntersectionObserver.
Only trigger once. Duration: 1.2s, easeOut curve.

Below "0": small badge
  "* BYOK — bring your own keys"
  background: var(--surface)
  border: 1px solid var(--border)
  padding: 2px 8px
  font: DM Mono 400 10px var(--text-3)
  border-radius: 4px

Below all stats, the tech stack line:
```
TypeScript · Shopify Admin GraphQL 2026-01 · Perplexity Sonar · 
OpenAI Responses API · Anthropic Claude Sonnet · Next.js 15 · Vitest
```
Font: DM Mono 400 11px var(--text-3)
Text-align: center
Max-width: 600px, centered

Section: background var(--bg)
Border-top and border-bottom: 1px solid var(--border)

---

### Credits.tsx

Section headline: "shelf stands on shoulders"
Subtitle: "shelf doesn't invent the loop — it ports a great 
           pattern to a new domain"

Two cards side by side:

Card 1:
  autoresearch
  Andrej Karpathy · @karpathy (link to x.com/karpathy)
  "the original loop pattern"
  github.com/karpathy/autoresearch →

Card 2:
  pi-autoresearch
  David Cortés · @davebcn87 + Tobi Lütke · @tobi
  "shelf.jsonl and shelf.md follow this format exactly"
  github.com/davebcn87/pi-autoresearch →

Card styling:
  background: var(--surface)
  border: 1px solid var(--border)
  padding: 24px 28px
  
  Project name: DM Mono 500 16px var(--text-1)
  Author line: DM Mono 400 13px var(--text-2)
    @handles in var(--green)
  Quote: DM Mono 400 13px var(--text-2) font-style: italic
  Link: DM Mono 400 12px var(--text-3) hover var(--text-1)
  
  All separated by 12px gaps, no inner borders

---

### CTA.tsx

Centered. Large.

```
start optimizing
```
DM Mono 600, clamp(40px, 5vw, 64px), var(--text-1)

```
one command. runs locally. costs ~$2 per session.
```
DM Mono 400 15px var(--text-2)
Margin-top: 12px

Install block (same as hero):
  Max-width: 480px, centered
  Margin-top: 32px

Two links below:
  github.com/AnirudhDabas/shelf →
  read the README →
  
  Both: DM Mono 400 13px var(--text-3)
  Hover: var(--text-1)
  Gap: 24px between them

---

### Footer.tsx

Border-top: 1px solid var(--border)
Padding: 32px 0
Background: var(--bg)

Two columns:
  Left: ● shelf (same as nav brand)
  Right: MIT · github.com/AnirudhDabas/shelf

Both: DM Mono 400 11px var(--text-3)
On mobile: stack and center

---

## ANIMATIONS — RULES AND SPECS

### What to animate:

1. Scroll entrance: every section except hero
   Initial: opacity 0, translateY 20px
   Final: opacity 1, translateY 0
   Trigger: IntersectionObserver, threshold 0.1
   Duration: 500ms, ease-out
   Only trigger once per element

2. Score counter: useEffect loop in Hero widget
   Count from 30 to 68 over 20 seconds
   Each integer step: 200-600ms (variable, slower near 68)
   At 68: pause 3 seconds
   Reset to 30: instant (no animation)
   Loop forever

3. Elapsed timer: useEffect setInterval
   Starts at "0m 00s", increments every second
   Goes up to "34m 12s" then resets

4. Cost counter: tied to iteration count
   Each iteration adds $0.08
   Display: "$X.XX", 2 decimal places

5. Experiment stream: rotate through 8 experiments
   New experiment fades in from top: 
     opacity 0, translateY -8px → opacity 1, translateY 0
     Duration: 300ms ease-out
   Rotate every 2.5 seconds
   Show 5 rows at a time

6. Loop dot: CSS animation only
   rotate 14s linear infinite
   No JavaScript for the dot movement

7. Cursor blink in badge: CSS animation
   opacity 1 → 0 → 1, 1s infinite step-end

### What NOT to animate:

- Do not animate anything on hover with complex keyframes
- Do not use spring animations
- Do not use bounce or elastic easing
- Do not animate color changes (only opacity and transform)
- Do not animate layout properties (width, height, margin)

---

## MOBILE RESPONSIVE RULES

Breakpoint: 768px

### Hero (< 768px):
  - Stack vertically: text column on top, widget below
  - Widget: full width, no max-width
  - Headline: clamp(36px, 8vw, 48px)
  - Remove the widget chart (too small to be useful)
  - Show widget header + score + experiment stream only

### Loop diagram (< 768px):
  - Switch from circular to vertical linear flow
  - Each node: horizontal pill shape
    width: 100%, height: 48px
    display: flex, align-items: center
    padding: 0 20px
    Node label on left, subtitle on right
  - Connecting arrows between pills: ↓ centered
  - The traveling dot: moves down the vertical chain

### Before/after cards (< 768px):
  - Single column, full width

### Works with (< 768px):
  - Overflow-x scroll with momentum
  - -webkit-overflow-scrolling: touch

### Stats (< 768px):
  - Single column, centered

### Credits (< 768px):
  - Single column

---

## PERFORMANCE REQUIREMENTS

1. BackgroundCanvas must use OffscreenCanvas + Worker
   The main thread must NEVER be blocked by canvas drawing

2. Use next/font for DM Mono, not a Google Fonts link
   This ensures font is preloaded correctly

3. All Framer Motion imports must use tree-shaking:
   import { motion, useInView } from 'framer-motion'
   NOT: import * as Motion from 'framer-motion'

4. IntersectionObserver must disconnect after triggering
   (to avoid memory leaks on long pages)

5. All useEffect hooks must have proper cleanup:
   return () => { clearInterval(id) } etc.

6. No images. All logos are inline SVG.
   No external image URLs.

7. The canvas worker must handle visibility:
   Listen for messages from main thread to pause/resume
   when tab is hidden (document.visibilitychange)

---

## META AND SEO

In layout.tsx:

```typescript
export const metadata: Metadata = {
  title: 'shelf — autoresearch for storefronts',
  description: 'An autonomous agent that tunes your Shopify ' +
    'catalog until ChatGPT and Perplexity actually recommend you.',
  openGraph: {
    title: 'shelf',
    description: 'autoresearch for storefronts',
    url: 'https://shelf-site.vercel.app',
    siteName: 'shelf',
  },
  themeColor: '#070809',
}
```

Favicon: inline SVG in layout.tsx
  A green circle on dark background:
  <link rel="icon" href="data:image/svg+xml,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
      <rect width='32' height='32' fill='%23070809'/>
      <circle cx='16' cy='16' r='8' fill='%2322c55e'/>
    </svg>">

---

## WHAT NOT TO DO

Never:
- Purple gradients
- Box shadows (use borders)
- Images or external assets
- Stock photography  
- Marketing fluff copy ("revolutionary", "game-changing")
- Cookie banners
- Email capture forms
- Testimonials
- Pricing section
- Any font other than DM Mono
- Emoji in body copy
- Rounded corners > 8px
- White backgrounds anywhere
- backdrop-filter on section backgrounds 
  (only on nav)

---

## BUILD ORDER

Build in this exact order:

1. package.json + next.config.ts + tsconfig.json + tailwind.config.ts
2. app/globals.css (all CSS variables and base styles)
3. app/layout.tsx (fonts, metadata, favicon)
4. public/canvas.worker.js
5. components/BackgroundCanvas.tsx
6. components/Nav.tsx
7. components/Hero.tsx (most complex — do this carefully)
8. components/WorksWith.tsx
9. components/HowItWorks.tsx
10. components/BeforeAfter.tsx
11. components/Stats.tsx
12. components/Credits.tsx
13. components/CTA.tsx
14. components/Footer.tsx
15. app/page.tsx (imports all components)
16. Test: pnpm dev, verify all sections render
17. Test: pnpm build, verify no TypeScript errors
18. Fix any issues found in steps 16-17

---

## FINAL QUALITY CHECK

Before declaring done, verify:

- [ ] Canvas animation runs in worker, main thread is not blocked
- [ ] All text is readable (dark backgrounds behind every section)
- [ ] Score counter loops correctly 30→68→pause→reset
- [ ] Experiment stream rotates every 2.5 seconds
- [ ] Copy button works and shows "✓ copied!" feedback
- [ ] All GitHub links go to github.com/AnirudhDabas/shelf
- [ ] Mobile layout works at 375px viewport
- [ ] pnpm build succeeds with zero TypeScript errors
- [ ] No console errors in browser
- [ ] Scroll progress bar appears after scrolling 5%
- [ ] Count-up animations trigger on scroll into view
- [ ] Loop diagram dot travels clockwise continuously
- [ ] Section entrance animations work on scroll
- [ ] Nav backdrop blur works
- [ ] DM Mono loaded and rendering correctly

Now build the entire project. All files. Complete implementation.
Do not truncate. Do not leave TODOs. Ship it.

/* eslint-disable */
let ctx = null;
let canvas = null;
let width = 0;
let height = 0;
let drops = [];
let bags = [];
let lastTime = 0;
let rafId = 0;
let paused = false;

const CHARS = [
  "30.0", "36.0", "40.0", "46.0", "52.0", "56.0", "62.0", "68.0",
  "kept", "reverted", "noise", "high", "medium", "low",
  "+6.00", "-2.00", "+0.00", "+4.00",
  "title_rewrite", "metafield_add", "seo_title",
  "✓", "✗", "↺", "▶", "■",
];

const FONT_SIZE = 13;
const COL_WIDTH = FONT_SIZE * 8;
const FPS_CAP = 30;
const NUM_BAGS = 7;
const BAG_W = 18;
const BAG_H = 20;

self.onmessage = function (e) {
  const data = e.data || {};

  if (data.type === "resize") {
    width = data.width;
    height = data.height;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
    initCols();
    initBags();
    return;
  }

  if (data.type === "visibility") {
    paused = data.hidden === true;
    if (!paused && !rafId) {
      rafId = requestAnimationFrame(animate);
    }
    return;
  }

  // Initial setup
  if (data.canvas) {
    canvas = data.canvas;
    width = data.width;
    height = data.height;
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    initCols();
    initBags();
    rafId = requestAnimationFrame(animate);
  }
};

function initCols() {
  const cols = Math.max(1, Math.floor(width / COL_WIDTH));
  drops = new Array(cols).fill(0).map(() => Math.random() * -100);
}

function initBags() {
  bags = [];
  for (let i = 0; i < NUM_BAGS; i++) {
    bags.push({
      x: Math.random() * Math.max(1, width - BAG_W),
      y: Math.random() * height,
      speed: 0.15 + Math.random() * 0.10,
    });
  }
}

function drawBag(x, y) {
  const bodyY = y + 4;
  const bodyH = BAG_H - 4;
  const r = 3;
  const w = BAG_W;

  // body: rounded rectangle, stroke only
  ctx.beginPath();
  ctx.moveTo(x + r, bodyY);
  ctx.lineTo(x + w - r, bodyY);
  ctx.quadraticCurveTo(x + w, bodyY, x + w, bodyY + r);
  ctx.lineTo(x + w, bodyY + bodyH - r);
  ctx.quadraticCurveTo(x + w, bodyY + bodyH, x + w - r, bodyY + bodyH);
  ctx.lineTo(x + r, bodyY + bodyH);
  ctx.quadraticCurveTo(x, bodyY + bodyH, x, bodyY + bodyH - r);
  ctx.lineTo(x, bodyY + r);
  ctx.quadraticCurveTo(x, bodyY, x + r, bodyY);
  ctx.closePath();
  ctx.stroke();

  // handle: arc above body top
  ctx.beginPath();
  ctx.arc(x + w / 2, bodyY, 4, Math.PI, 0, true);
  ctx.stroke();
}

function animate(timestamp) {
  rafId = requestAnimationFrame(animate);

  if (paused) return;
  if (!ctx) return;

  if (!lastTime) lastTime = timestamp;
  if (timestamp - lastTime < 1000 / FPS_CAP) return;
  lastTime = timestamp;

  ctx.fillStyle = "rgba(7, 8, 9, 0.05)";
  ctx.fillRect(0, 0, width, height);

  // bags pass — drawn before text so text sits on top
  ctx.strokeStyle = "rgba(34, 197, 94, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < bags.length; i++) {
    const b = bags[i];
    drawBag(b.x, b.y);
    b.y += b.speed;
    if (b.y > height) {
      b.y = -BAG_H - 5;
      b.x = Math.random() * Math.max(1, width - BAG_W);
    }
  }

  // text pass
  ctx.font = '400 ' + FONT_SIZE + 'px "DM Mono", ui-monospace, monospace';

  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    const x = i * COL_WIDTH;
    const y = drops[i] * FONT_SIZE;

    const brightness = Math.random() > 0.95 ? 0.8 : 0.25;
    ctx.fillStyle = "rgba(34, 197, 94, " + brightness + ")";
    ctx.fillText(char, x, y);

    if (y > height && Math.random() > 0.97) {
      drops[i] = 0;
    }
    drops[i] += 0.4 + Math.random() * 0.3;
  }
}

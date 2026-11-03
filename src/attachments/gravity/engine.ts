// One window pointermove listener and one rAF loop drive every registered
// element. The loop stops once every spring settles, and a resting element
// keeps no inline styles. No top-level DOM access, so it is SSR-safe.

import { fieldTargets } from "./physics.ts";
import {
  advance,
  clamp,
  type SpringState,
  substepCount,
} from "../../motion/spring.ts";
import { GRAVITY_DEFAULTS, type ResolvedGravityParams } from "./types.ts";

type Entry = {
  el: HTMLElement;
  params: ResolvedGravityParams;
  rectDirty: boolean;
  /** Centre in viewport px, half extents in layout px. */
  cx: number;
  cy: number;
  hx: number;
  hy: number;
  rx: SpringState;
  ry: SpringState;
  lift: SpringState;
  hasStyle: boolean;
  /** Settled at zero: skipped until the pointer nears its broad-phase box. */
  resting: boolean;
  lastRx: number;
  lastRy: number;
  lastLift: number;
};

// Settle thresholds: tilt in deg and deg/s, lift in px and px/s.
const EPS_TILT = 0.01;
const EPS_TILT_V = 0.1;
const EPS_LIFT = 0.02;
const EPS_LIFT_V = 0.2;
const BROAD_MARGIN = 1.5;

const registry = new Map<HTMLElement, Entry>();

let pointerX = 0;
let pointerY = 0;
let pointerValid = false;

let rafId: number | null = null;
let lastFrameAt = 0;
let frameCount = 0;
const clock = { acc: 0 };

let infraAttached = false;
let ro: ResizeObserver | null = null;
let reducedMotionMql: MediaQueryList | null = null;
let finePointerMql: MediaQueryList | null = null;

let overlay: HTMLCanvasElement | null = null;

const transitionWarned = new WeakSet<HTMLElement>();

/** Upserts keep the spring state, so a disabled flip mid-hover releases smoothly instead of snapping. */
export function register(
  el: HTMLElement,
  params: ResolvedGravityParams,
): void {
  // SSR, or a partial DOM such as jsdom.
  if (typeof globalThis.matchMedia !== "function") return;

  const existing = registry.get(el);
  if (existing) {
    const p = existing.params;
    const unchanged = p.maxTilt === params.maxTilt &&
      p.reach === params.reach && p.lift === params.lift &&
      p.stiffness === params.stiffness && p.damping === params.damping &&
      p.shape === params.shape && p.disabled === params.disabled &&
      p.debug === params.debug;
    existing.params = params;
    // Inline options re-derive on every render; an identical upsert must not wake the loop.
    if (unchanged) return;
    existing.resting = false;
    syncDebugOverlay();
    wake();
    return;
  }

  const entry: Entry = {
    el,
    params,
    rectDirty: true,
    cx: 0,
    cy: 0,
    hx: 1,
    hy: 1,
    rx: { x: 0, v: 0 },
    ry: { x: 0, v: 0 },
    lift: { x: 0, v: 0 },
    hasStyle: false,
    resting: false,
    lastRx: 0,
    lastRy: 0,
    lastLift: 0,
  };
  registry.set(el, entry);

  if (registry.size === 1) initGates();
  syncInfra();
  ro?.observe(el);
  syncDebugOverlay();
  wake();
}

export function unregister(el: HTMLElement): void {
  const entry = registry.get(el);
  if (!entry) return;
  clearStyle(entry);
  registry.delete(el);
  ro?.unobserve(el);
  syncDebugOverlay();
  if (registry.size === 0) {
    stopLoop();
    syncInfra();
    teardownGates();
    pointerValid = false;
  }
}

// Gates

function initGates(): void {
  reducedMotionMql = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
  finePointerMql = globalThis.matchMedia("(hover: hover) and (pointer: fine)");
  reducedMotionMql.addEventListener("change", onGateChange);
  finePointerMql.addEventListener("change", onGateChange);
}

function teardownGates(): void {
  reducedMotionMql?.removeEventListener("change", onGateChange);
  finePointerMql?.removeEventListener("change", onGateChange);
  reducedMotionMql = null;
  finePointerMql = null;
}

function enabled(): boolean {
  return reducedMotionMql !== null && !reducedMotionMql.matches &&
    finePointerMql !== null && finePointerMql.matches;
}

function onGateChange(): void {
  if (enabled()) {
    syncInfra();
    syncDebugOverlay();
    for (const e of registry.values()) e.rectDirty = true;
    wake();
  } else {
    for (const e of registry.values()) restEntry(e);
    stopLoop();
    pointerValid = false;
    syncInfra();
    syncDebugOverlay();
  }
}

// Listeners

function syncInfra(): void {
  const want = registry.size > 0 && enabled();
  if (want && !infraAttached) {
    globalThis.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });
    globalThis.addEventListener("resize", onWindowResize);
    globalThis.addEventListener("blur", onPointerGone);
    globalThis.addEventListener("pointercancel", onPointerGone);
    // Capture: scroll events in nested containers don't bubble.
    document.addEventListener("scroll", onRectsInvalid, {
      passive: true,
      capture: true,
    });
    document.addEventListener("pointerleave", onPointerGone);
    ro = new ResizeObserver(onElementResize);
    for (const el of registry.keys()) ro.observe(el);
    infraAttached = true;
  } else if (!want && infraAttached) {
    globalThis.removeEventListener("pointermove", onPointerMove);
    globalThis.removeEventListener("resize", onWindowResize);
    globalThis.removeEventListener("blur", onPointerGone);
    globalThis.removeEventListener("pointercancel", onPointerGone);
    document.removeEventListener("scroll", onRectsInvalid, true);
    document.removeEventListener("pointerleave", onPointerGone);
    ro?.disconnect();
    ro = null;
    infraAttached = false;
  }
}

function onPointerMove(ev: PointerEvent): void {
  // A touch on a hybrid device must not leave a phantom hover pointer behind.
  if (ev.pointerType === "touch") {
    if (pointerValid) onPointerGone();
    return;
  }
  pointerX = ev.clientX;
  pointerY = ev.clientY;
  pointerValid = true;
  wake();
}

function onPointerGone(): void {
  pointerValid = false;
  wake();
}

function onRectsInvalid(): void {
  for (const e of registry.values()) e.rectDirty = true;
  wake();
}

function onWindowResize(): void {
  sizeOverlay();
  onRectsInvalid();
}

function onElementResize(entries: ResizeObserverEntry[]): void {
  for (const roe of entries) {
    const e = registry.get(roe.target as HTMLElement);
    if (!e) continue;
    const box = roe.borderBoxSize?.[0];
    if (box) {
      e.hx = Math.max(box.inlineSize / 2, 1);
      e.hy = Math.max(box.blockSize / 2, 1);
    }
    e.rectDirty = true;
    e.resting = false;
  }
  wake();
}

// Loop

function wake(): void {
  if (rafId !== null || registry.size === 0 || !enabled()) return;
  lastFrameAt = performance.now();
  clock.acc = 0;
  rafId = requestAnimationFrame(frame);
}

function stopLoop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function resolveReach(e: Entry): number {
  return e.params.reach ??
    clamp(e.hy * 2, GRAVITY_DEFAULTS.reachMin, GRAVITY_DEFAULTS.reachMax);
}

function frame(t: number): void {
  rafId = null;
  const dt = (t - lastFrameAt) / 1000;
  lastFrameAt = t;
  const n = substepCount(clock, dt);
  frameCount++;

  // A layout shift that moves an element without resizing or scrolling fires
  // no event, so active elements re-measure every 8th frame.
  const remeasure = (frameCount & 7) === 0;
  for (const e of registry.values()) {
    if (e.rectDirty || (remeasure && !e.resting)) refreshRect(e);
  }

  let anyUnsettled = false;
  for (const e of registry.values()) {
    let tRx = 0;
    let tRy = 0;
    let tLift = 0;

    if (pointerValid && !e.params.disabled) {
      const reach = resolveReach(e);
      const px = pointerX - e.cx;
      const py = pointerY - e.cy;
      if (e.resting) {
        const margin = reach * BROAD_MARGIN;
        if (
          Math.abs(px) > e.hx + margin || Math.abs(py) > e.hy + margin
        ) {
          continue;
        }
        e.resting = false;
        e.rectDirty = true;
      }
      const targets = fieldTargets(
        px,
        py,
        e.hx,
        e.hy,
        reach,
        e.params.maxTilt,
        e.params.lift,
        e.params.shape,
      );
      tRx = targets.rx;
      tRy = targets.ry;
      tLift = targets.lift;
    } else if (e.resting) {
      continue;
    }

    // No && short-circuit: every axis must step every frame.
    const { stiffness, damping } = e.params;
    const rxDone = advance(
      e.rx,
      tRx,
      stiffness,
      damping,
      n,
      EPS_TILT,
      EPS_TILT_V,
    );
    const ryDone = advance(
      e.ry,
      tRy,
      stiffness,
      damping,
      n,
      EPS_TILT,
      EPS_TILT_V,
    );
    const liftDone = advance(
      e.lift,
      tLift,
      GRAVITY_DEFAULTS.liftStiffness,
      GRAVITY_DEFAULTS.liftDamping,
      n,
      EPS_LIFT,
      EPS_LIFT_V,
    );

    if (rxDone && ryDone && liftDone) {
      // Rest below the write precision, not at exact zero: a pointer parked
      // just inside the field edge settles at ~0.004°, which must still count
      // as rest or will-change would stay pinned.
      if (Math.abs(tRx) < 0.005 && Math.abs(tRy) < 0.005 && tLift < 0.005) {
        restEntry(e);
        continue;
      }
      writeStyle(e);
    } else {
      anyUnsettled = true;
      writeStyle(e);
    }
  }

  drawOverlay();

  // Safe to sleep without a flag: handlers run between frames, and wake()
  // re-arms whenever rafId is null.
  if (anyUnsettled) {
    rafId = requestAnimationFrame(frame);
  }
}

function refreshRect(e: Entry): void {
  const r = e.el.getBoundingClientRect();
  // The centre survives the centre-pivot transform, so it is safe mid-tilt; a
  // tilted box measures bigger, so extents then come from the ResizeObserver.
  e.cx = r.left + r.width / 2;
  e.cy = r.top + r.height / 2;
  if (!e.hasStyle) {
    e.hx = Math.max(r.width / 2, 1);
    e.hy = Math.max(r.height / 2, 1);
  }
  e.rectDirty = false;
}

// Style

function writeStyle(e: Entry): void {
  const rx = Math.round(e.rx.x * 100) / 100;
  const ry = Math.round(e.ry.x * 100) / 100;
  const lift = Math.round(e.lift.x * 100) / 100;
  if (e.hasStyle && rx === e.lastRx && ry === e.lastRy && lift === e.lastLift) {
    return;
  }
  if (!e.hasStyle) {
    // Checked on first activation, not at mount, so mounting costs no style flush.
    warnOnTransitionedTransform(e.el);
    e.el.style.willChange = "transform";
    e.hasStyle = true;
  }
  // perspective() must come first or the rotations get no depth.
  e.el.style.transform =
    `perspective(${GRAVITY_DEFAULTS.perspective}px) translateZ(${lift}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  e.lastRx = rx;
  e.lastRy = ry;
  e.lastLift = lift;
}

function clearStyle(e: Entry): void {
  if (!e.hasStyle) return;
  e.el.style.removeProperty("transform");
  e.el.style.removeProperty("will-change");
  e.hasStyle = false;
  e.lastRx = 0;
  e.lastRy = 0;
  e.lastLift = 0;
}

function restEntry(e: Entry): void {
  e.rx.x = 0;
  e.rx.v = 0;
  e.ry.x = 0;
  e.ry.v = 0;
  e.lift.x = 0;
  e.lift.v = 0;
  clearStyle(e);
  e.resting = true;
}

// Dev guard

function warnOnTransitionedTransform(el: HTMLElement): void {
  if (transitionWarned.has(el)) return;
  transitionWarned.add(el);
  const cs = getComputedStyle(el);
  // transition-property defaults to "all"; only a nonzero duration or delay makes it real.
  const hasTime = (cs.transitionDuration + "," + cs.transitionDelay)
    .split(",")
    .some((t) => parseFloat(t) > 0);
  if (
    hasTime && /(^|,)\s*(all|transform)\s*($|,)/.test(cs.transitionProperty)
  ) {
    console.warn(
      "[gravity] This element CSS-transitions its `transform`, which double-animates the gravity spring into mush. " +
        "Replace bare `transition` with the DS `transition-interactive` utility (styles/variables.css).",
      el,
    );
  }
}

// Debug overlay

function syncDebugOverlay(): void {
  let want = false;
  if (enabled()) {
    for (const e of registry.values()) {
      if (e.params.debug) {
        want = true;
        break;
      }
    }
  }
  if (want && !overlay) {
    overlay = document.createElement("canvas");
    overlay.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;";
    document.body.appendChild(overlay);
    sizeOverlay();
  } else if (!want && overlay) {
    overlay.remove();
    overlay = null;
  }
}

function sizeOverlay(): void {
  if (!overlay) return;
  const dpr = globalThis.devicePixelRatio || 1;
  overlay.width = Math.round(globalThis.innerWidth * dpr);
  overlay.height = Math.round(globalThis.innerHeight * dpr);
}

function drawOverlay(): void {
  if (!overlay) return;
  const ctx = overlay.getContext("2d");
  if (!ctx) return;
  const dpr = globalThis.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(128,128,128,0.8)";
  ctx.setLineDash([4, 4]);
  for (const e of registry.values()) {
    if (!e.params.debug) continue;
    const reach = resolveReach(e);
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(
        e.cx - e.hx - reach,
        e.cy - e.hy - reach,
        (e.hx + reach) * 2,
        (e.hy + reach) * 2,
        Math.min(reach + 8, e.hy + reach),
      );
    } else {
      ctx.rect(
        e.cx - e.hx - reach,
        e.cy - e.hy - reach,
        (e.hx + reach) * 2,
        (e.hy + reach) * 2,
      );
    }
    ctx.stroke();
  }
  if (pointerValid) {
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(128,128,128,0.9)";
    ctx.beginPath();
    ctx.arc(pointerX, pointerY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

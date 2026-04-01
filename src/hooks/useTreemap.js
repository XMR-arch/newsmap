import { useRef, useCallback } from 'react'
import { prepare, layout } from '@chenglou/pretext'

const LERP = 0.10
const EXPAND_FACTOR = 3.8
const CURSOR_RADIUS = 200
const DETAIL_FONT = '8px DM Sans, system-ui'
const LH = 11

// ── Color utils ────────────────────────────────────────────────────────────

// Pre-parse hex → [r, g, b] once in buildBlocks, never in tick
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

// Fast lerp using precomputed RGB arrays — no string parsing per frame
function lerpRgb(a, b, t) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`
}

// ── Squarified treemap ─────────────────────────────────────────────────────

function calcWorst(row, shorter, rowArea) {
  if (!rowArea || !shorter) return Infinity
  const strip = rowArea / shorter
  const rowW = row.reduce((s, b) => s + b._w, 0)
  let worst = 0
  for (const b of row) {
    const brd = (rowArea * (b._w / rowW)) / strip
    const r = Math.max(strip / brd, brd / strip)
    if (r > worst) worst = r
  }
  return worst
}

function buildFrozenRows(blocks, containerW, containerH) {
  const sorted = [...blocks].sort((a, b) => b._w - a._w)
  const totalW = sorted.reduce((s, b) => s + b._w, 0)
  if (!totalW) return []

  let w = containerW, h = containerH
  const rows = []
  let rem = [...sorted]
  let aLeft = totalW

  while (rem.length > 0) {
    const sh = Math.min(w, h)
    let row = [rem[0]]
    let bw = calcWorst(row, sh, (row[0]._w / aLeft) * w * h)
    let i = 1
    while (i < rem.length) {
      const test = [...row, rem[i]]
      const ta = test.reduce((s, b) => s + b._w, 0) / aLeft * w * h
      const tw = calcWorst(test, sh, ta)
      if (tw <= bw) { row = test; bw = tw; i++ } else break
    }
    const rw2 = row.reduce((s, b) => s + b._w, 0)
    rows.push({ items: row, dir: w >= h ? 'h' : 'v' })
    const frac = rw2 / aLeft
    if (w >= h) w -= w * frac; else h -= h * frac
    aLeft -= rw2
    rem = rem.slice(row.length)
  }
  return rows
}

function layoutFromRows(rows, cW, cH) {
  const res = []
  let x = 0, y = 0, w = cW, h = cH
  const totalW = rows.reduce((s, r) => s + r.items.reduce((s2, b) => s2 + b._w, 0), 0)
  if (!totalW) return res
  let wLeft = totalW

  for (const row of rows) {
    const rw2 = row.items.reduce((s, b) => s + b._w, 0)
    const frac = rw2 / wLeft
    if (row.dir === 'h') {
      const cw = w * frac; let yy = y
      for (const b of row.items) { const ih = h * (b._w / rw2); res.push({ b, x, y: yy, w: cw, h: ih }); yy += ih }
      x += cw; w -= cw
    } else {
      const ch = h * frac; let xx = x
      for (const b of row.items) { const iw = w * (b._w / rw2); res.push({ b, x: xx, y, w: iw, h: ch }); xx += iw }
      y += ch; h -= ch
    }
    wLeft -= rw2
  }
  return res
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTreemap({ containerRef, papers, activeCat }) {
  const blocksRef     = useRef([])
  const frozenRowsRef = useRef([])
  const rafRef        = useRef(null)
  const mouseRef      = useRef({ x: -9999, y: -9999 })
  const hudElRef      = useRef(null)

  // Cached container rect — updated only by ResizeObserver, never read in tick
  const rectRef = useRef({ left: 0, top: 0, width: 0, height: 0 })
  const roRef   = useRef(null)

  const buildBlocks = useCallback((papersData, container) => {
    // Seed the cached rect on first build
    const cr = container.getBoundingClientRect()
    rectRef.current = cr
    const cW = cr.width, cH = cr.height
    if (!cW || !cH) return

    // ResizeObserver updates the cache — tick never calls getBoundingClientRect
    if (!roRef.current) {
      roRef.current = new ResizeObserver(() => {
        rectRef.current = container.getBoundingClientRect()
      })
      roRef.current.observe(container)
    }

    const existingMap = new Map(blocksRef.current.map(b => [b.paper.id, b]))

    const blocks = papersData.map(paper => {
      const existing = existingMap.get(paper.id)
      if (existing) {
        existing.paper = paper
        existing._w = paper.weight
        existing.targetWeight = paper.weight
        existing._tier = -1
        return existing
      }

      const el = document.createElement('div')
      el.className = 'tm-block'
      el.style.cssText = 'position:absolute;left:0;top:0;overflow:hidden;padding:6px 8px;border:0.5px solid rgba(255,255,255,0.07);will-change:transform;contain:layout style paint;'
      el.innerHTML = `
        <div class="bk-region"   style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.35;white-space:nowrap;overflow:hidden;font-family:var(--font-mono)"></div>
        <div class="bk-name"     style="font-size:10px;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--font-display)"></div>
        <div class="bk-readers"  style="font-size:12px;font-weight:700;margin-top:3px;white-space:nowrap;font-family:var(--font-mono)"></div>
        <div class="bk-headline" style="font-size:8px;line-height:1.55;margin-top:4px;opacity:.6;overflow:hidden;font-family:var(--font-body)"></div>
        <div class="bk-city"     style="font-size:7px;margin-top:3px;opacity:.3;white-space:nowrap;overflow:hidden;font-family:var(--font-mono)"></div>
      `
      container.appendChild(el)

      const els  = { region: el.children[0], name: el.children[1], readers: el.children[2], headline: el.children[3], city: el.children[4] }
      const prep = prepare(`${paper.name} ${paper.readers ?? ''} ${paper.headline}`, DETAIL_FONT)

      // Pre-parse category colors once — avoids parseInt on every frame
      const bgRgb      = hexToRgb(paper._cat.bg)
      const bgHoverRgb = hexToRgb(paper._cat.bgHover)

      return {
        paper, el, els, prep,
        bgRgb, bgHoverRgb,
        _w: paper.weight, targetWeight: paper.weight,
        rx: 0, ry: 0, rw: 80, rh: 60,
        _op: 1, _tier: -1, _hover: -1,
      }
    })

    // Remove orphaned elements
    blocksRef.current.forEach(b => { if (!blocks.includes(b)) b.el.remove() })
    blocksRef.current = blocks

    frozenRowsRef.current = buildFrozenRows(blocks, cW, cH)

    // Seed initial positions
    const rects = layoutFromRows(frozenRowsRef.current, cW, cH)
    rects.forEach(({ b, x, y, w, h }) => { b.rx = x; b.ry = y; b.rw = w; b.rh = h })
  }, [])

  const startLoop = useCallback((container, getActiveCat) => {
    const tick = () => {
      const t0 = performance.now()
      const { x: mx, y: my } = mouseRef.current

      // No getBoundingClientRect here — reads the ResizeObserver-updated cache
      const { left, top, width: cW, height: cH } = rectRef.current
      const curActiveCat = getActiveCat()
      let calls = 0

      // ── Weight pass ───────────────────────────────────────────────────────
      for (const b of blocksRef.current) {
        let exp = 1
        const cx = left + b.rx + b.rw / 2
        const cy = top  + b.ry + b.rh / 2
        const dist = Math.hypot(mx - cx, my - cy)
        if (dist < CURSOR_RADIUS) { const f = 1 - dist / CURSOR_RADIUS; exp = 1 + f * f * EXPAND_FACTOR }
        if (curActiveCat) exp = b.paper.cat === curActiveCat ? Math.max(exp, 2.8) : Math.min(exp, 0.3)
        b._w += (b.paper.weight * exp - b._w) * LERP
      }

      // ── Layout + write pass ───────────────────────────────────────────────
      const rects = layoutFromRows(frozenRowsRef.current, cW, cH)

      for (const { b, x, y, w, h } of rects) {
        b.rx += (x - b.rx) * LERP; b.ry += (y - b.ry) * LERP
        b.rw += (w - b.rw) * LERP; b.rh += (h - b.rh) * LERP

        const rx = Math.round(b.rx * 10) / 10
        const ry = Math.round(b.ry * 10) / 10
        const rw = Math.round(b.rw)
        const rh = Math.round(b.rh)

        b.el.style.transform = `translate(${rx}px,${ry}px)`
        b.el.style.width  = rw + 'px'
        b.el.style.height = rh + 'px'

        const tOp = curActiveCat ? (b.paper.cat === curActiveCat ? 1 : 0.07) : 1
        b._op += (tOp - b._op) * 0.15
        b.el.style.opacity = b._op

        // Hover — quantized to skip redundant writes
        const dist2   = Math.hypot(mx - (left + b.rx + b.rw / 2), my - (top + b.ry + b.rh / 2))
        const intense = dist2 < CURSOR_RADIUS ? 1 - dist2 / CURSOR_RADIUS : 0
        const hov     = Math.round(intense * 10)

        if (b._hover !== hov) {
          // lerpRgb uses pre-parsed arrays — no parseInt on this frame
          b.el.style.background   = intense > 0 ? lerpRgb(b.bgRgb, b.bgHoverRgb, intense) : b.paper._cat.bg
          b.el.style.borderColor  = intense > 0 ? b.paper._cat.border + '55' : 'rgba(255,255,255,0.07)'
          b.el.style.zIndex       = intense > 0 ? String(10 + Math.round(intense * 10)) : '0'
          b._hover = hov
        }

        layout(b.prep, Math.max(20, rw - 16), LH)
        calls++

        // Tier — text visibility changes only when bucket changes
        const area = rw * rh
        const tier = area >= 16000 ? 4 : area >= 6000 ? 3 : area >= 2000 ? 2 : area >= 500 ? 1 : 0

        if (b._tier !== tier) {
          const { region, name, readers, headline, city } = b.els
          const cat = b.paper._cat

          name.textContent     = b.paper.name
          readers.textContent  = b.paper.readers ?? ''
          headline.textContent = b.paper.headline
          region.textContent   = cat.label
          city.textContent     = b.paper.city ?? ''

          region.style.display    = tier >= 3 ? '' : 'none'
          name.style.display      = tier >= 1 ? '' : 'none'
          name.style.fontSize     = tier >= 4 ? Math.min(15, 10 + area / 9000) + 'px' : '10px'
          name.style.color        = cat.fg
          readers.style.display   = tier >= 2 ? '' : 'none'
          readers.style.fontSize  = tier >= 4 ? Math.min(20, 12 + area / 6000) + 'px' : '12px'
          readers.style.color     = cat.accent
          headline.style.display  = tier >= 4 ? '' : 'none'
          headline.style.maxHeight = tier >= 4 ? Math.max(0, rh - 56) + 'px' : '0'
          city.style.display      = tier >= 3 ? '' : 'none'

          b._tier = tier
        }
      }

      // ── HUD ───────────────────────────────────────────────────────────────
      const ms = (performance.now() - t0).toFixed(2)
      if (hudElRef.current) {
        hudElRef.current.blocks  = blocksRef.current.length
        hudElRef.current.layouts = calls
        hudElRef.current.ms      = ms
        hudElRef.current.update?.()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      roRef.current?.disconnect()
      roRef.current = null
    }
  }, [])

  return { blocksRef, frozenRowsRef, mouseRef, hudElRef, buildBlocks, startLoop }
}
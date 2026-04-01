import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { REGIONS } from '../data/papers.js'
import { useTreemap } from '../hooks/useTreemap.js'

// Attach region data to each paper for fast lookup in the loop
function enrichPapers(papers) {
  return papers.map(p => ({ ...p, _cat: REGIONS[p.cat] ?? REGIONS.europe }))
}

const Treemap = forwardRef(function Treemap({ papers, activeCat, onHudUpdate }, ref) {
  const containerRef = useRef(null)
  const activeCatRef = useRef(activeCat)
  const { mouseRef, hudElRef, buildBlocks, startLoop } = useTreemap({ containerRef, papers, activeCat })

  useEffect(() => { activeCatRef.current = activeCat }, [activeCat])

  // Mouse tracking
  useEffect(() => {
    const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    const onTouch = e => { mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onTouchEnd = () => setTimeout(() => { mouseRef.current = { x: -9999, y: -9999 } }, 600)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [mouseRef])

  // HUD callback
  useEffect(() => {
    hudElRef.current = { update: onHudUpdate }
  }, [onHudUpdate, hudElRef])

  // Build blocks when papers change
  useEffect(() => {
    const container = containerRef.current
    if (!container || !papers?.length) return
    const enriched = enrichPapers(papers)
    buildBlocks(enriched, container)
  }, [papers, buildBlocks])

  // Start animation loop
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const stop = startLoop(container, () => activeCatRef.current)
    return stop
  }, [startLoop])

  // Rebuild on resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      if (!papers?.length) return
      const enriched = enrichPapers(papers)
      buildBlocks(enriched, container)
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [papers, buildBlocks])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    />
  )
})

export default Treemap

import { useEffect, useRef, useState } from 'react';

/**
 * CursorOrb — Custom magnetic cursor that replaces the native cursor.
 * The orb smoothly follows the mouse using lerp (linear interpolation).
 * It expands when hovering interactive elements and shrinks on click.
 */
export default function CursorOrb() {
  const orbRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  // Smooth position (lerped)
  const pos    = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const raf    = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

      // Trail follows exact cursor
      if (trailRef.current) {
        trailRef.current.style.left = `${e.clientX}px`;
        trailRef.current.style.top  = `${e.clientY}px`;
      }

      // Detect interactive elements
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const interactive = el?.closest('a, button, input, label, [role="button"], .hoverable');
      setHovering(!!interactive);
    };

    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);

    // Lerp animation loop
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.12);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.12);

      if (orbRef.current) {
        orbRef.current.style.left = `${pos.current.x}px`;
        orbRef.current.style.top  = `${pos.current.y}px`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div
        ref={orbRef}
        className={`cursor-orb ${hovering ? 'hovering' : ''} ${clicking ? 'clicking' : ''}`}
      />
      <div ref={trailRef} className="cursor-trail" />
    </>
  );
}

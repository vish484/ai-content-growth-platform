import { useEffect, useRef, useState } from 'react';
import './HeroSection.css';

const PILLS = [
  { label: 'AI Analysis',    color: 'violet', icon: '◈' },
  { label: 'Auto Subtitles', color: 'cyan',   icon: '⬡' },
  { label: 'Viral Scoring',  color: 'amber',  icon: '⚡' },
  { label: 'Smart Edit',     color: 'cyan',   icon: '◇' },
];

/**
 * HeroSection — The platform's opening statement.
 * Features entrance animation, floating feature pills, and a grid overlay.
 */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Subtle parallax on mouse move
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const dx = (e.clientX / innerWidth  - 0.5) * 20;
      const dy = (e.clientY / innerHeight - 0.5) * 10;
      section.style.setProperty('--mx', `${dx}px`);
      section.style.setProperty('--my', `${dy}px`);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`hero section ${visible ? 'hero--visible' : ''}`}
      id="hero"
      aria-label="Hero section"
    >
      {/* Ambient orbs */}
      <div className="hero__orb hero__orb--violet" aria-hidden="true" />
      <div className="hero__orb hero__orb--cyan"   aria-hidden="true" />

      {/* Grid overlay */}
      <div className="hero__grid" aria-hidden="true" />

      <div className="container hero__content">
        {/* Status badge */}
        <div className="hero__badge-row">
          <span className="badge badge-violet hero__status-badge">
            <span className="hero__status-dot" aria-hidden="true" />
            Phase 1 Live
          </span>
          <span className="hero__badge-divider" aria-hidden="true" />
          <span className="badge badge-cyan">YouTube Validator Active</span>
        </div>

        {/* Headline */}
        <h1 className="hero__headline font-display">
          Turn Any YouTube Video
          <br />
          Into&nbsp;
          <span className="shimmer-text">Viral Shorts</span>
        </h1>

        {/* Subtext */}
        <p className="hero__sub">
          ClipSync analyzes your YouTube videos with AI, identifies high-impact moments,
          adds captions, and exports ready-to-post short-form content — automatically.
        </p>

        {/* Feature Pills */}
        <div className="hero__pills" role="list" aria-label="Platform features">
          {PILLS.map((pill, i) => (
            <span
              key={pill.label}
              className={`hero__pill badge badge-${pill.color} hoverable`}
              style={{ animationDelay: `${0.4 + i * 0.08}s` }}
              role="listitem"
            >
              <span aria-hidden="true">{pill.icon}</span>
              {pill.label}
            </span>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="hero__scroll-hint" aria-hidden="true">
          <div className="hero__scroll-line" />
          <span className="hero__scroll-label">Validate your video below</span>
        </div>
      </div>
    </section>
  );
}

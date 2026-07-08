import { useState, useEffect } from 'react';
import './Navbar.css';

/**
 * Navbar — Brand navigation with scroll-aware glass morphism.
 * Shows the ClipSync logo and phase status badge.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar__inner container">
        {/* Logo */}
        <a href="#" className="navbar__logo hoverable" aria-label="ClipSync home">
          <span className="navbar__logo-icon" aria-hidden="true">✦</span>
          <span className="navbar__logo-text">
            Clip<span className="navbar__logo-accent">Sync</span>
          </span>
        </a>

        {/* Nav Links */}
        <div className="navbar__links">
          <a href="#validator" className="navbar__link hoverable">Validate</a>
          <a href="#pipeline" className="navbar__link hoverable">Pipeline</a>
          <a href="#how-it-works" className="navbar__link navbar__link--dim hoverable" aria-label="Pricing - coming soon">
            Pricing
            <span className="badge badge-amber navbar__link-tag">Soon</span>
          </a>
        </div>

        {/* CTA */}
        <a href="#validator" className="navbar__cta hoverable" id="nav-cta" aria-label="Try ClipSync URL validator">
          Try Now
          <span className="navbar__cta-arrow">→</span>
        </a>
      </div>
    </nav>
  );
}

import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__glow" aria-hidden="true" />
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <span className="footer__logo">
            <span className="footer__logo-icon" aria-hidden="true">✦</span>
            Clip<span className="footer__logo-accent">Sync</span>
          </span>
          <p className="footer__tagline">
            AI-powered viral clip extraction — built for the creator economy.
          </p>
          <div className="footer__phase-badge">
            <span className="badge badge-violet">Phase 1 — URL Validator</span>
            <span className="badge badge-amber">Phase 2 — AI Analysis</span>
            <span className="badge badge-cyan">Phase 3 — Auto Export</span>
          </div>
        </div>

        {/* Links */}
        <div className="footer__links">
          <div className="footer__col">
            <h4 className="footer__col-title font-mono">Platform</h4>
            <a href="#validator" className="footer__link hoverable">URL Validator</a>
            <a href="#pipeline"  className="footer__link footer__link--dim hoverable">AI Analysis</a>
            <a href="#pipeline"  className="footer__link footer__link--dim hoverable">Clip Extractor</a>
            <a href="#pipeline"  className="footer__link footer__link--dim hoverable">Auto Subtitles</a>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title font-mono">Status</h4>
            <span className="footer__status">
              <span className="footer__status-dot footer__status-dot--active" />
              Backend API
            </span>
            <span className="footer__status">
              <span className="footer__status-dot footer__status-dot--active" />
              URL Validator
            </span>
            <span className="footer__status footer__status--dim">
              <span className="footer__status-dot" />
              AI Pipeline
            </span>
            <span className="footer__status footer__status--dim">
              <span className="footer__status-dot" />
              Export Engine
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span className="footer__copy font-mono">
            © {year} ClipSync · Built with FastAPI + React · AI Content Growth Platform
          </span>
          <span className="footer__version badge badge-violet font-mono">v0.1.0 — Phase 1</span>
        </div>
      </div>
    </footer>
  );
}

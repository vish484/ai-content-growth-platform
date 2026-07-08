import { useState, useRef, useCallback } from 'react';
import './UrlValidator.css';

// Reads from Vercel Environment Variables. If not set, falls back to a relative path.
// This allows you to host the frontend on Vercel and the backend on Railway.
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = BASE_URL ? `${BASE_URL}/api/validate-url` : '/api/validate-url';


interface VideoMeta {
  valid: boolean;
  video_id?: string;
  title?: string;
  channel?: string;
  duration?: number;
  thumbnail?: string;
  view_count?: number;
  like_count?: number;
  upload_date?: string;
  description_snippet?: string;
  error?: string;
}

function formatDuration(secs?: number): string {
  if (!secs) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatCount(n?: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(dateStr?: string): string {
  if (!dateStr || dateStr.length !== 8) return '—';
  const y = dateStr.slice(0, 4);
  const m = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);
  return new Date(`${y}-${m}-${d}`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * UrlValidator — Phase 1 core feature.
 * Accepts a YouTube URL, sends it to the backend, and displays
 * rich video metadata or a descriptive error.
 */
export default function UrlValidator() {
  const [url, setUrl]         = useState('');
  const [status, setStatus]   = useState<Status>('idle');
  const [meta, setMeta]       = useState<VideoMeta | null>(null);
  const [focused, setFocused] = useState(false);
  const [shake, setShake]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleValidate = useCallback(async () => {
    if (!url.trim()) {
      inputRef.current?.focus();
      triggerShake();
      return;
    }

    setStatus('loading');
    setMeta(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: VideoMeta = await res.json();

      if (data.valid) {
        setStatus('success');
        setMeta(data);
      } else {
        setStatus('error');
        setMeta(data);
        triggerShake();
      }
    } catch (err) {
      setStatus('error');
      setMeta({ valid: false, error: 'Could not connect to the server. Is the backend running?' });
      triggerShake();
    }
  }, [url]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleValidate();
  };

  const handleReset = () => {
    setUrl('');
    setStatus('idle');
    setMeta(null);
    inputRef.current?.focus();
  };

  return (
    <section className="validator section" id="validator" aria-label="YouTube URL Validator">
      <div className="container validator__container">
        {/* Section header */}
        <div className="validator__header">
          <span className="badge badge-violet">Step 1</span>
          <h2 className="validator__title font-display">
            Paste Your YouTube URL
          </h2>
          <p className="validator__subtitle">
            We'll verify the video and pull its metadata instantly — then when ready,
            our AI pipeline will analyze it for viral potential.
          </p>
        </div>

        {/* Input card */}
        <div className={`validator__card glass-card ${shake ? 'validator__card--shake' : ''}`}>
          {/* Animated border */}
          <div className={`validator__border ${focused || status === 'success' ? 'validator__border--active' : ''}`} aria-hidden="true" />

          <div className="validator__input-row">
            {/* YouTube icon */}
            <span className="validator__yt-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58Z"
                  fill="#FF0000"
                />
                <path d="M9.75 15.02 15.5 12 9.75 8.98v6.04Z" fill="#fff" />
              </svg>
            </span>

            <input
              ref={inputRef}
              id="youtube-url-input"
              className="validator__input hoverable"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="YouTube video URL"
              disabled={status === 'loading'}
              autoComplete="url"
              spellCheck={false}
            />

            {url && status !== 'loading' && (
              <button
                className="validator__clear hoverable"
                onClick={handleReset}
                aria-label="Clear input"
              >
                ✕
              </button>
            )}

            <button
              id="validate-btn"
              className={`validator__btn hoverable ${status === 'loading' ? 'validator__btn--loading' : ''}`}
              onClick={handleValidate}
              disabled={status === 'loading'}
              aria-label="Validate URL"
              aria-busy={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className="validator__spinner" aria-hidden="true" />
                  Checking…
                </>
              ) : (
                <>
                  Validate
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>

          {/* Hint */}
          <p className="validator__hint font-mono">
            Supports youtube.com/watch, youtu.be, /shorts, /live · Press ↵ Enter to validate
          </p>
        </div>

        {/* Result */}
        {meta && status === 'success' && (
          <div className="result result--success glass-card" role="status" aria-live="polite">
            {/* Scan line */}
            <div className="result__scan" aria-hidden="true" />

            {/* Header */}
            <div className="result__header">
              <span className="badge badge-green">
                <span aria-hidden="true">✓</span> Valid Video
              </span>
              <span className="badge badge-violet font-mono">
                ID: {meta.video_id}
              </span>
            </div>

            {/* Body */}
            <div className="result__body">
              {/* Thumbnail */}
              {meta.thumbnail && (
                <div className="result__thumb-wrap">
                  <img
                    src={meta.thumbnail}
                    alt={`Thumbnail for ${meta.title}`}
                    className="result__thumb"
                    loading="lazy"
                  />
                  <div className="result__thumb-overlay">
                    <span className="result__duration-badge font-mono">
                      {formatDuration(meta.duration)}
                    </span>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="result__info">
                <h3 className="result__title font-display">{meta.title}</h3>
                <p className="result__channel">
                  <span aria-hidden="true">◈</span> {meta.channel}
                </p>

                {/* Stats grid */}
                <div className="result__stats">
                  <div className="result__stat">
                    <span className="result__stat-label">Views</span>
                    <span className="result__stat-value">{formatCount(meta.view_count)}</span>
                  </div>
                  <div className="result__stat">
                    <span className="result__stat-label">Likes</span>
                    <span className="result__stat-value">{formatCount(meta.like_count)}</span>
                  </div>
                  <div className="result__stat">
                    <span className="result__stat-label">Duration</span>
                    <span className="result__stat-value font-mono">{formatDuration(meta.duration)}</span>
                  </div>
                  <div className="result__stat">
                    <span className="result__stat-label">Published</span>
                    <span className="result__stat-value">{formatDate(meta.upload_date)}</span>
                  </div>
                </div>

                {/* Description snippet */}
                {meta.description_snippet && (
                  <p className="result__desc">{meta.description_snippet}</p>
                )}

                {/* CTA — Phase 2 teaser */}
                <div className="result__cta-row">
                  <button
                    id="analyze-btn"
                    className="result__cta-btn hoverable"
                    disabled
                    aria-label="AI analysis - coming soon"
                  >
                    <span aria-hidden="true">◈</span>
                    Analyse with AI
                    <span className="badge badge-amber result__cta-tag">Coming Soon</span>
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${meta.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="result__yt-link hoverable"
                    aria-label="Open video on YouTube"
                  >
                    Open on YouTube ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {meta && status === 'error' && (
          <div className="result result--error glass-card" role="alert" aria-live="assertive">
            <div className="result__header">
              <span className="badge badge-red">
                <span aria-hidden="true">✕</span> Invalid URL
              </span>
            </div>
            <div className="result__error-body">
              <span className="result__error-icon" aria-hidden="true">◉</span>
              <p className="result__error-msg">{meta.error}</p>
            </div>
            <p className="result__error-hint font-mono">
              Try: <span>https://www.youtube.com/watch?v=dQw4w9WgXcQ</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

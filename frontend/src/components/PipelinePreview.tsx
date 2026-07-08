import { useEffect, useRef, useState } from 'react';
import './PipelinePreview.css';

const STEPS = [
  {
    id: 'download',
    num: '01',
    icon: '↓',
    label: 'Download',
    title: 'YouTube Downloader',
    desc: 'ClipSync fetches the full video in the highest available quality directly from YouTube.',
    tech: ['yt-dlp', 'ffmpeg'],
    active: false,
    live: false,
  },
  {
    id: 'analyse',
    num: '02',
    icon: '◈',
    label: 'AI Analysis',
    title: 'Viral Intelligence',
    desc: 'Our AI model analyses audio, visuals, and engagement signals to score every moment for viral potential.',
    tech: ['Gemini AI', 'Whisper'],
    active: false,
    live: false,
  },
  {
    id: 'extract',
    num: '03',
    icon: '⬡',
    label: 'Clip Extraction',
    title: 'Smart Clip Cutter',
    desc: 'Top-scoring moments are extracted, trimmed to optimal lengths, and prepared for short-form formats.',
    tech: ['ffmpeg', 'ML Segmenter'],
    active: false,
    live: false,
  },
  {
    id: 'export',
    num: '04',
    icon: '↑',
    label: 'Export Shorts',
    title: 'Auto-Subtitle Export',
    desc: 'Each clip gets animated captions, format optimisation for TikTok / Reels / Shorts, and is ready to post.',
    tech: ['Whisper', 'Canvas API'],
    active: false,
    live: false,
  },
];

export default function PipelinePreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`pipeline section ${visible ? 'pipeline--visible' : ''}`}
      id="pipeline"
      aria-label="AI processing pipeline"
    >
      <div className="container pipeline__container">
        {/* Header */}
        <div className="pipeline__header">
          <span className="badge badge-cyan">The Pipeline</span>
          <h2 className="pipeline__title font-display" id="how-it-works">
            From YouTube to Viral — in 4 Steps
          </h2>
          <p className="pipeline__subtitle">
            Each step is a fully autonomous AI agent. No manual editing required.
          </p>
        </div>

        {/* Steps */}
        <div className="pipeline__grid" role="list" aria-label="Pipeline steps">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className="pipeline__step glass-card hoverable"
              style={{ transitionDelay: `${i * 0.1}s` }}
              role="listitem"
              aria-label={`Step ${step.num}: ${step.title}`}
            >
              {/* Lock badge */}
              <div className="pipeline__lock" aria-label="Coming soon">
                <span className="badge badge-amber">Coming Soon</span>
              </div>

              {/* Number */}
              <div className="pipeline__num font-mono" aria-hidden="true">{step.num}</div>

              {/* Icon */}
              <div className="pipeline__icon" aria-hidden="true">{step.icon}</div>

              {/* Content */}
              <div className="pipeline__step-label badge badge-violet">{step.label}</div>
              <h3 className="pipeline__step-title font-display">{step.title}</h3>
              <p className="pipeline__step-desc">{step.desc}</p>

              {/* Tech pills */}
              <div className="pipeline__tech" aria-label="Technologies">
                {step.tech.map(t => (
                  <span key={t} className="badge badge-cyan pipeline__tech-badge">{t}</span>
                ))}
              </div>

              {/* Progress indicator */}
              <div className="pipeline__progress" aria-hidden="true">
                <div className="pipeline__progress-bar" />
              </div>
            </div>
          ))}
        </div>

        {/* Flow connector */}
        <div className="pipeline__flow" aria-hidden="true">
          <div className="pipeline__flow-line" />
          <span className="pipeline__flow-label font-mono">
            Full autonomous pipeline — coming in Phase 2
          </span>
          <div className="pipeline__flow-line" />
        </div>
      </div>
    </section>
  );
}

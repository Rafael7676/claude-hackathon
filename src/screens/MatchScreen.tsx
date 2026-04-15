import { useState } from 'react'

interface Props {
  onSetupChat: () => void
}

// Spec-exact 8 dimensions with weights
const DIMENSIONS = [
  { icon: '🔬', label: 'Curiosity graph',              desc: 'What they want to learn', weight: '30%' },
  { icon: '💥', label: 'Bubble-breaker score',         desc: 'Openness to unlike people', weight: '15%' },
  { icon: '⚡', label: 'Social energy level',          desc: 'Introvert / ambi / extrovert', weight: '12%' },
  { icon: '🗓', label: 'Schedule compatibility',       desc: 'Overlapping free windows', weight: '12%' },
  { icon: '📍', label: 'Proximity patterns',           desc: 'Where they spend time on campus', weight: '10%' },
  { icon: '💬', label: 'Vibe & communication style',   desc: 'Humor, tone, how they text', weight: '8%' },
  { icon: '🎯', label: 'Activity preferences',         desc: 'Active vs chill, food vs outdoors', weight: '8%' },
  { icon: '🔄', label: 'Feedback loop',                desc: 'Smarter after every meetup', weight: '5%' },
]

interface DimScore { label: string; value: number; color: string }

const matches = [
  {
    initials: 'RL', avatarBg: '#e6f1fb', avatarColor: '#0c447c',
    name: 'Rosa L.', major: 'Urban Planning + Geography', score: 94,
    bridge: "She studies how cities shape communities — you build the tech that powers them. Neither of you has the full picture alone.",
    dims: [
      { label: 'Curiosity graph',        value: 92, color: '#1d9e75' },
      { label: 'Proximity patterns',     value: 88, color: '#7f77dd' },
      { label: 'Bubble-breaker score',   value: 71, color: '#d85a30' },
    ] as DimScore[],
    tags: [
      { label: 'Urban design', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
      { label: 'Cooking club', bg: 'var(--warm-light)', color: '#993c1d' },
      { label: 'GIS + data', bg: 'var(--purple-light)', color: '#3c3489' },
    ],
  },
  {
    initials: 'TK', avatarBg: 'var(--warm-light)', avatarColor: '#993c1d',
    name: 'Tyler K.', major: 'Architecture + Art history', score: 87,
    bridge: "His thesis on walkable cities overlaps your urban interest, but he'd push your thinking in ways another CS major never would.",
    dims: [
      { label: 'Curiosity graph',              value: 85, color: '#1d9e75' },
      { label: 'Bubble-breaker score',         value: 84, color: '#d85a30' },
      { label: 'Vibe & communication style',   value: 78, color: '#7f77dd' },
    ] as DimScore[],
    tags: [
      { label: 'Walkable cities', bg: 'var(--purple-light)', color: '#3c3489' },
      { label: '3D modeling', bg: '#e6f1fb', color: '#0c447c' },
    ],
  },
  {
    initials: 'DM', avatarBg: 'var(--pink-light)', avatarColor: '#72243e',
    name: 'Danielle M.', major: 'Theater + Education', score: 79,
    bridge: "You'd never have met otherwise — that's the point. Her improv background could unlock a side of you that problem-set culture hasn't touched.",
    dims: [
      { label: 'Bubble-breaker score',   value: 97, color: '#d85a30' },
      { label: 'Activity preferences',   value: 88, color: '#1d9e75' },
      { label: 'Social energy level',    value: 73, color: '#7f77dd' },
    ] as DimScore[],
    tags: [
      { label: 'Improv', bg: 'var(--pink-light)', color: '#72243e' },
      { label: 'Education', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
      { label: 'Storytelling', bg: 'var(--warm-light)', color: '#993c1d' },
    ],
  },
]

function DimBar({ label, value, color }: DimScore) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '2px' }} />
      </div>
    </div>
  )
}

export default function MatchScreen({ onSetupChat }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [skipped, setSkipped] = useState<Set<string>>(new Set())

  const visible = matches.filter(m => !skipped.has(m.name))

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>

      <div style={{ padding: '8px 24px 12px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>AI matching</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
          The social layer your campus is missing — every match ends in a real-world meetup
        </p>
      </div>

      {/* 8-dimension engine */}
      <div style={{ background: 'var(--accent-light)', borderRadius: '16px', margin: '0 16px 12px', padding: '14px 16px', border: '0.5px solid var(--accent)' }}>
        <button onClick={() => setExpanded(e => !e)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-dark)' }}>8-dimension matching engine</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth={2} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
        </button>

        {expanded ? (
          <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {DIMENSIONS.map(d => (
              <div key={d.label} style={{ background: 'white', borderRadius: '10px', padding: '8px 10px', border: '0.5px solid rgba(15,110,86,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '16px' }}>{d.icon}</div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-dark)', background: 'var(--accent-light)', padding: '1px 5px', borderRadius: '6px' }}>{d.weight}</span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-dark)', lineHeight: 1.3, marginTop: '4px' }}>{d.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px' }}>{d.desc}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--accent-dark)', lineHeight: 1.6, marginTop: '8px' }}>
            Curiosity graph (30%) and bubble-breaker score (15%) are the core differentiators — no competitor matches on either. Every meetup makes the next match smarter via the feedback loop.
          </p>
        )}
      </div>

      {/* Chat bubbles */}
      <div style={{ padding: '0 16px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderBottomLeftRadius: '4px' }}>
          What have you been genuinely curious about lately? Doesn't have to be school stuff.
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--purple-light)', color: '#3c3489', borderBottomRightRadius: '4px', marginLeft: 'auto' }}>
          I'm CS but I keep thinking about urban planning and why some cities feel alive and others don't. Also trying to learn to cook.
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderBottomLeftRadius: '4px' }}>
          Strong curiosity-graph signal across disciplines. I found 3 people who'd genuinely expand your thinking — here's the bridge for each:
        </div>
      </div>

      {/* Match cards */}
      {visible.map((m, i) => (
        <div key={m.name} className="fade-in" style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '0.5px solid var(--border)', animationDelay: `${i * 0.1}s` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '14px', flexShrink: 0, background: m.avatarBg, color: m.avatarColor }}>{m.initials}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.major}</div>
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--accent-dark)', background: 'var(--accent-light)', padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              {m.score}% match
            </span>
          </div>

          {/* The bridge */}
          <div style={{ background: '#f8f7f4', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', borderLeft: '3px solid var(--accent)' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>The bridge</div>
            <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>{m.bridge}</p>
          </div>

          {/* Dimension scores */}
          <div style={{ marginBottom: '10px' }}>
            {m.dims.map(d => <DimBar key={d.label} {...d} />)}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '12px' }}>
            {m.tags.map(t => <span key={t.label} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500, margin: '2px 4px 2px 0', background: t.bg, color: t.color }}>{t.label}</span>)}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onSetupChat} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Set up a meetup</button>
            <button onClick={() => setSkipped(s => new Set([...s, m.name]))} style={{ background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Skip</button>
          </div>
        </div>
      ))}

      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-hint)', fontSize: '13px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌱</div>
          No matches left — check back tomorrow as more people ping in.
        </div>
      )}
    </div>
  )
}

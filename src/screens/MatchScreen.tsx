interface Props {
  onSetupChat: () => void
}

const matches = [
  {
    initials: 'RL',
    avatarBg: '#e6f1fb',
    avatarColor: '#0c447c',
    name: 'Rosa L.',
    major: 'Urban Planning + Geography',
    score: 94,
    bio: "Rosa studies how cities shape communities — she'd love your tech perspective on smart city data. She also runs a cooking club on campus.",
    tags: [
      { label: 'Urban design', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
      { label: 'Cooking club', bg: 'var(--warm-light)', color: '#993c1d' },
      { label: 'GIS + data', bg: 'var(--purple-light)', color: '#3c3489' },
    ],
  },
  {
    initials: 'TK',
    avatarBg: 'var(--warm-light)',
    avatarColor: '#993c1d',
    name: 'Tyler K.',
    major: 'Architecture + Art history',
    score: 87,
    bio: "Tyler's thesis is on walkable cities — overlaps perfectly with your urban planning interest. He's also into 3D modeling which connects to your CS background.",
    tags: [
      { label: 'Walkable cities', bg: 'var(--purple-light)', color: '#3c3489' },
      { label: '3D modeling', bg: '#e6f1fb', color: '#0c447c' },
    ],
  },
]

export default function MatchScreen({ onSetupChat }: Props) {
  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>

      <div style={{ padding: '8px 24px 16px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>AI matching</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
          Claude finds complementary connections based on your curiosity, not just your major
        </p>
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--accent-light)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '0.5px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-dark)' }}>How it works</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--accent-dark)', lineHeight: 1.6 }}>
          Tell us what you're curious about in your own words. Our AI finds people whose interests complement — not just match — yours. An econ student curious about art meets an art student curious about data.
        </p>
      </div>

      {/* Chat bubbles */}
      <div style={{ padding: '0 16px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderBottomLeftRadius: '4px' }}>
          Hey! Tell me what you're curious about lately — doesn't have to be school stuff.
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--purple-light)', color: '#3c3489', borderBottomRightRadius: '4px', marginLeft: 'auto' }}>
          I'm a CS major but honestly I've been really into urban planning and how cities are designed. Also trying to get better at cooking.
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderBottomLeftRadius: '4px' }}>
          Love that combo! I found 3 people you should meet this week. Here's why each one is interesting for you:
        </div>
      </div>

      {/* Match cards */}
      {matches.map((m, i) => (
        <div key={i} className="fade-in" style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '0.5px solid var(--border)', animationDelay: `${i * 0.1}s` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '14px', background: m.avatarBg, color: m.avatarColor }}>{m.initials}</div>
              <div>
                <span style={{ fontWeight: 500, fontSize: '14px' }}>{m.name}</span>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.major}</p>
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--accent-dark)', background: 'var(--accent-light)', padding: '3px 10px', borderRadius: '12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
              {m.score}%
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>{m.bio}</p>
          <div>
            {m.tags.map(t => (
              <span key={t.label} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500, margin: '2px 4px 2px 0', background: t.bg, color: t.color }}>{t.label}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button onClick={onSetupChat} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Set up coffee chat</button>
            <button style={{ background: 'none', color: 'var(--accent-dark)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Skip</button>
          </div>
        </div>
      ))}
    </div>
  )
}

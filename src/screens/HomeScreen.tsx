import { useState } from 'react'

const filters = ['All', 'Coffee', 'Meals', 'Study', 'Activity']

const people = [
  {
    initials: 'JM',
    avatarBg: 'var(--purple-light)',
    avatarColor: '#3c3489',
    name: 'Jordan M.',
    distance: '2 min walk',
    bio: 'Grabbing coffee at Starbucks Memorial Union — want company!',
    tags: [
      { label: 'Philosophy', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
      { label: 'Film', bg: 'var(--warm-light)', color: '#993c1d' },
    ],
  },
  {
    initials: 'SP',
    avatarBg: 'var(--pink-light)',
    avatarColor: '#72243e',
    name: 'Sarah P.',
    distance: '5 min walk',
    bio: 'Open seat at Gordon\'s for lunch — studying for midterms but happy to chat',
    tags: [
      { label: 'CS major', bg: 'var(--purple-light)', color: '#3c3489' },
      { label: 'Hiking', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
    ],
  },
]

interface Props {
  username: string
  onJoin: () => void
}

export default function HomeScreen({ username, onJoin }: Props) {
  const [activeFilter, setActiveFilter] = useState('All')

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
        <span>9:41</span>
      </div>

      <div style={{ padding: '8px 24px 16px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Good morning, {username}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
          {people.length} people nearby are open to connect
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <span
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
              border: '0.5px solid var(--border)',
              background: activeFilter === f ? 'var(--accent-light)' : 'var(--card-bg)',
              color: activeFilter === f ? 'var(--accent-dark)' : 'var(--text-secondary)',
              borderColor: activeFilter === f ? 'var(--accent)' : 'var(--border)',
              cursor: 'pointer',
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* People cards */}
      {people.map((p, i) => (
        <div key={i} className="fade-in" style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '0.5px solid var(--border)', display: 'flex', gap: '14px', alignItems: 'flex-start', animationDelay: `${i * 0.1}s` }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '14px', flexShrink: 0, background: p.avatarBg, color: p.avatarColor }}>
            {p.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--warm)', background: 'var(--warm-light)', padding: '3px 8px', borderRadius: '8px', fontWeight: 500 }}>{p.distance}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px', lineHeight: 1.5 }}>{p.bio}</p>
            <div>
              {p.tags.map(t => (
                <span key={t.label} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500, margin: '2px 4px 2px 0', background: t.bg, color: t.color }}>{t.label}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button onClick={onJoin} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '7px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Join</button>
              <button style={{ background: 'none', color: 'var(--accent-dark)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '7px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Wave</button>
            </div>
          </div>
        </div>
      ))}

      {/* Invite card */}
      <div className="fade-in" style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', border: '0.5px solid var(--border)', overflow: 'hidden', animationDelay: '0.2s' }}>
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #1d9e75 0%, #085041 100%)', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', color: 'white', fontWeight: 500 }}>5 spots left</span>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, fontSize: '14px' }}>Pickup basketball @ Nick</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>4:30 PM</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0' }}>Posted by Marcus T. — need 5 more for full court</p>
          <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginTop: '8px' }}>I'm in</button>
        </div>
      </div>
    </div>
  )
}

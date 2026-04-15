import { useState } from 'react'

const FILTERS = ['All', 'Coffee', 'Meals', 'Study', 'Activity'] as const
type Filter = typeof FILTERS[number]

interface Person {
  initials: string
  avatarBg: string
  avatarColor: string
  name: string
  distance: string
  bio: string
  category: Exclude<Filter, 'All'>
  tags: { label: string; bg: string; color: string }[]
}

const people: Person[] = [
  {
    initials: 'JM',
    avatarBg: 'var(--purple-light)',
    avatarColor: '#3c3489',
    name: 'Jordan M.',
    distance: '2 min walk',
    bio: 'Grabbing coffee at Starbucks Memorial Union — want company!',
    category: 'Coffee',
    tags: [
      { label: 'Philosophy', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
      { label: 'Film', bg: 'var(--warm-light)', color: '#993c1d' },
    ],
  },
  {
    initials: 'PS',
    avatarBg: '#fef3c7',
    avatarColor: '#92400e',
    name: 'Priya S.',
    distance: '6 min walk',
    bio: "Working from Michelangelo's, one seat open — studying CS but happy to chat",
    category: 'Coffee',
    tags: [
      { label: 'Design', bg: 'var(--pink-light)', color: '#72243e' },
      { label: 'Photography', bg: 'var(--purple-light)', color: '#3c3489' },
    ],
  },
  {
    initials: 'SP',
    avatarBg: 'var(--pink-light)',
    avatarColor: '#72243e',
    name: 'Sarah P.',
    distance: '5 min walk',
    bio: "Open seat at Gordon's for lunch — studying for midterms but happy to chat",
    category: 'Meals',
    tags: [
      { label: 'CS major', bg: 'var(--purple-light)', color: '#3c3489' },
      { label: 'Hiking', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
    ],
  },
  {
    initials: 'TR',
    avatarBg: '#dcfce7',
    avatarColor: '#166534',
    name: 'Tom R.',
    distance: '4 min walk',
    bio: 'Econ study group at Memorial Library rm 242 — open to anyone joining',
    category: 'Study',
    tags: [
      { label: 'Econ', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
      { label: 'Tennis', bg: 'var(--warm-light)', color: '#993c1d' },
    ],
  },
  {
    initials: 'AK',
    avatarBg: '#e0f2fe',
    avatarColor: '#075985',
    name: 'Alex K.',
    distance: '3 min walk',
    bio: 'Library 2nd floor grinding OS homework — send me a message if you want to join',
    category: 'Study',
    tags: [
      { label: 'CS major', bg: 'var(--purple-light)', color: '#3c3489' },
      { label: 'Music', bg: 'var(--pink-light)', color: '#72243e' },
    ],
  },
  {
    initials: 'MT',
    avatarBg: '#fef9c3',
    avatarColor: '#854d0e',
    name: 'Marcus T.',
    distance: '8 min walk',
    bio: 'Frisbee on the terrace lawn — casual, all levels welcome, starting in 20 min',
    category: 'Activity',
    tags: [
      { label: 'Sports', bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
      { label: 'Pre-med', bg: 'var(--purple-light)', color: '#3c3489' },
    ],
  },
]

interface Toast {
  id: string
  message: string
  color: string
}

interface Props {
  username: string
  onJoin: () => void
}

export default function HomeScreen({ username }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [waved, setWaved] = useState<Set<string>>(new Set())
  const [joined, setJoined] = useState<Set<string>>(new Set())

  function addToast(message: string, color: string) {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  function handleWave(name: string) {
    if (waved.has(name)) return
    setWaved(prev => new Set([...prev, name]))
    addToast(`👋 You waved at ${name}!`, 'var(--purple)')
  }

  function handleJoin(name: string) {
    setJoined(prev => new Set([...prev, name]))
    addToast(`✅ You've joined ${name.split(' ')[0]}!`, 'var(--accent)')
  }

  function handleBasketballJoin() {
    addToast('🏀 You\'re in! See you at Nick at 4:30 PM', 'var(--accent)')
  }

  const filtered = activeFilter === 'All'
    ? people
    : people.filter(p => p.category === activeFilter)

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)', position: 'relative' }}>
      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', width: '343px', maxWidth: 'calc(100% - 32px)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} className="fade-in" style={{ background: t.color, color: 'white', borderRadius: '12px', padding: '10px 16px', fontSize: '13px', fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
        <span>9:41</span>
      </div>

      <div style={{ padding: '8px 24px 16px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Good morning, {username}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
          {filtered.length} {filtered.length === 1 ? 'person' : 'people'} nearby {activeFilter !== 'All' ? `open to ${activeFilter.toLowerCase()}` : 'are open to connect'}
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <span
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
              border: '0.5px solid',
              borderColor: activeFilter === f ? 'var(--accent)' : 'var(--border)',
              background: activeFilter === f ? 'var(--accent-light)' : 'var(--card-bg)',
              color: activeFilter === f ? 'var(--accent-dark)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* People cards */}
      {filtered.map((p, i) => (
        <div key={p.name} className="fade-in" style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '0.5px solid var(--border)', display: 'flex', gap: '14px', alignItems: 'flex-start', animationDelay: `${i * 0.07}s` }}>
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
              <button
                onClick={() => handleJoin(p.name)}
                disabled={joined.has(p.name)}
                style={{ background: joined.has(p.name) ? 'var(--accent-light)' : 'var(--accent)', color: joined.has(p.name) ? 'var(--accent-dark)' : 'white', border: 'none', borderRadius: '12px', padding: '7px 16px', fontSize: '12px', fontWeight: 500, cursor: joined.has(p.name) ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              >
                {joined.has(p.name) ? 'Joined ✓' : 'Join'}
              </button>
              <button
                onClick={() => handleWave(p.name)}
                disabled={waved.has(p.name)}
                style={{ background: 'none', color: waved.has(p.name) ? 'var(--text-hint)' : 'var(--accent-dark)', border: `1px solid ${waved.has(p.name) ? 'var(--border)' : 'var(--accent)'}`, borderRadius: '12px', padding: '7px 16px', fontSize: '12px', fontWeight: 500, cursor: waved.has(p.name) ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              >
                {waved.has(p.name) ? 'Waved 👋' : 'Wave'}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Pickup basketball invite card */}
      {(activeFilter === 'All' || activeFilter === 'Activity') && (
        <div className="fade-in" style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', border: '0.5px solid var(--border)', overflow: 'hidden', animationDelay: '0.2s' }}>
          <img src="/basketball.svg" alt="Pickup basketball" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>Pickup basketball @ Nick</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>4:30 PM</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0' }}>Posted by Marcus T. — need 5 more for full court</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--warm)', background: 'var(--warm-light)', padding: '3px 8px', borderRadius: '8px', fontWeight: 500 }}>5 spots left</span>
              <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>8 min walk</span>
            </div>
            <button
              onClick={handleBasketballJoin}
              style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
            >
              I'm in
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'

const allCuriosities = [
  'Urban planning', 'Cooking', 'Sustainability', 'Photography', 'Philosophy',
  'Film', 'Music production', 'Rock climbing', 'Behavioral economics', 'AI & ethics',
  'Architecture', 'Creative writing', 'Entrepreneurship', 'Climate tech', 'Linguistics',
]

const allOpenTo = ['Coffee chats', 'Meals together', 'Study sessions', 'Walks', 'Events', 'Activities']

const ENERGY_OPTIONS = [
  { value: 'introvert',  label: 'Introvert',  desc: 'Prefer deep 1-on-1s',      emoji: '🌙' },
  { value: 'ambivert',   label: 'Ambivert',   desc: 'Depends on the day',        emoji: '⚡' },
  { value: 'extrovert',  label: 'Extrovert',  desc: 'Love group hangs',          emoji: '☀️' },
]

const STYLE_OPTIONS = [
  { value: 'casual',    label: 'Casual',    emoji: '😌' },
  { value: 'playful',   label: 'Playful',   emoji: '😄' },
  { value: 'thoughtful',label: 'Thoughtful',emoji: '🤔' },
]

interface JoinedSquad { id: string; name: string; count: number }
interface Props { guestId: string; username: string; joinedSquads?: JoinedSquad[] }

export default function ProfileScreen({ username, joinedSquads = [] }: Props) {
  const [curiosities, setCuriosities] = useState(['Urban planning', 'Cooking', 'Sustainability'])
  const [openTo, setOpenTo] = useState(['Coffee chats', 'Meals together', 'Study sessions', 'Activities'])
  const [socialEnergy, setSocialEnergy] = useState('ambivert')
  const [commStyle, setCommStyle] = useState('casual')
  const [bubbleBreaker, setBubbleBreaker] = useState(true)
  const [saved, setSaved] = useState(false)

  function toggle<T>(arr: T[], setArr: (v: T[]) => void, item: T) {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item])
  }

  async function handleSave() {
    await supabase.from('profiles').upsert({ id: username, username, interests: curiosities, open_to: openTo })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = username.slice(0, 2).toUpperCase()

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>

      <div style={{ padding: '8px 24px 16px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>Your profile</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>This isn't a resume — tell us what makes you curious</p>
      </div>

      {/* Avatar */}
      <div style={{ textAlign: 'center', padding: '0 16px 20px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '24px', background: 'var(--accent-light)', color: 'var(--accent-dark)', margin: '0 auto 10px' }}>{initials}</div>
        <p style={{ fontWeight: 500, fontSize: '16px' }}>{username}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>UW-Madison</p>
      </div>

      {/* Social energy */}
      <div style={{ padding: '0 16px 14px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Social energy</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {ENERGY_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setSocialEnergy(opt.value)} style={{ flex: 1, background: socialEnergy === opt.value ? 'var(--accent-light)' : 'var(--card-bg)', border: `1px solid ${socialEnergy === opt.value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', padding: '10px 6px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '18px', marginBottom: '3px' }}>{opt.emoji}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: socialEnergy === opt.value ? 'var(--accent-dark)' : 'var(--text-primary)' }}>{opt.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px', lineHeight: 1.3 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Communication style */}
      <div style={{ padding: '0 16px 14px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Communication style</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {STYLE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setCommStyle(opt.value)} style={{ flex: 1, background: commStyle === opt.value ? 'var(--purple-light)' : 'var(--card-bg)', border: `1px solid ${commStyle === opt.value ? 'var(--purple)' : 'var(--border)'}`, borderRadius: '12px', padding: '10px 6px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '18px', marginBottom: '3px' }}>{opt.emoji}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: commStyle === opt.value ? '#3c3489' : 'var(--text-primary)' }}>{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bubble-breaker toggle */}
      <div style={{ margin: '0 16px 16px', background: bubbleBreaker ? 'var(--accent-light)' : 'var(--card-bg)', borderRadius: '14px', padding: '14px 16px', border: `1px solid ${bubbleBreaker ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.15s' }} onClick={() => setBubbleBreaker(b => !b)}>
        <div style={{ fontSize: '24px' }}>💥</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: bubbleBreaker ? 'var(--accent-dark)' : 'var(--text-primary)' }}>Bubble-breaker mode</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>Match me across majors, backgrounds, and social circles — not just people like me</p>
        </div>
        <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: bubbleBreaker ? 'var(--accent)' : '#d1d0cc', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: '3px', left: bubbleBreaker ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      {/* Curiosities */}
      <div style={{ padding: '0 16px 8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>What I'm curious about</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px', marginBottom: '16px' }}>
        {allCuriosities.map(item => (
          <span key={item} onClick={() => toggle(curiosities, setCuriosities, item)} style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', border: '0.5px solid', borderColor: curiosities.includes(item) ? 'var(--purple)' : 'var(--border)', background: curiosities.includes(item) ? 'var(--purple-light)' : 'var(--card-bg)', color: curiosities.includes(item) ? '#3c3489' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>
            {item}
          </span>
        ))}
      </div>

      {/* Open to */}
      <div style={{ padding: '0 16px 8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Open to</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px', marginBottom: '16px' }}>
        {allOpenTo.map(item => (
          <span key={item} onClick={() => toggle(openTo, setOpenTo, item)} style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', border: '0.5px solid', borderColor: openTo.includes(item) ? 'var(--purple)' : 'var(--border)', background: openTo.includes(item) ? 'var(--purple-light)' : 'var(--card-bg)', color: openTo.includes(item) ? '#3c3489' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>
            {item}
          </span>
        ))}
      </div>

      {/* Squads joined */}
      <div style={{ padding: '0 16px 8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Squads joined</span>
      </div>
      <div style={{ margin: '0 16px 16px', background: 'var(--card-bg)', borderRadius: '14px', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
        {joinedSquads.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-hint)', fontSize: '12px' }}>
            No squads yet — head to Squad tab to join one
          </div>
        ) : (
          joinedSquads.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: i < joinedSquads.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EEEDFE', color: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, flexShrink: 0 }}>
                {s.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.count} {s.count === 1 ? 'person' : 'people'}</div>
              </div>
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', background: '#E1F5EE', color: '#0F6E56', fontWeight: 500 }}>Joined ✓</span>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '4px 16px 16px', padding: '16px', border: '0.5px solid var(--border)' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>Your stats</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div><span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--accent-dark)' }}>{joinedSquads.length}</span><p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Squads</p></div>
          <div><span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--purple)' }}>0</span><p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Coffee chats</p></div>
          <div><span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--warm)' }}>0</span><p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Activities</p></div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <button onClick={handleSave} style={{ width: '100%', background: saved ? 'var(--accent-dark)' : 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
          {saved ? '✓ Saved' : 'Save profile'}
        </button>
      </div>
    </div>
  )
}

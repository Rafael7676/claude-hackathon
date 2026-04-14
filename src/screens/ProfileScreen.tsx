import { useState } from 'react'
import { supabase } from '../lib/supabase'

const allInterests = ['Urban planning', 'Cooking', 'Sustainability', 'Photography', 'Philosophy', 'Film', 'Music production', 'Rock climbing']
const allOpenTo = ['Coffee chats', 'Meals together', 'Study sessions', 'Walks', 'Events', 'Activities']

interface Props {
  guestId: string
  username: string
}

export default function ProfileScreen({ username }: Props) {
  const [interests, setInterests] = useState(['Urban planning', 'Cooking', 'Sustainability'])
  const [openTo, setOpenTo] = useState(['Coffee chats', 'Meals together', 'Study sessions', 'Activities'])

  function toggleInterest(item: string) {
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  function toggleOpenTo(item: string) {
    setOpenTo(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  async function handleSave() {
    await supabase.from('profiles').upsert({ id: username, username, interests, open_to: openTo })
  }

  const initials = username.slice(0, 2).toUpperCase()

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>

      <div style={{ padding: '8px 24px 16px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>Your profile</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>This isn't a resume — tell us what makes you curious</p>
      </div>

      <div style={{ textAlign: 'center', padding: '0 16px 16px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '24px', background: 'var(--accent-light)', color: 'var(--accent-dark)', margin: '0 auto 10px' }}>
          {initials}
        </div>
        <p style={{ fontWeight: 500, fontSize: '16px' }}>{username}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>UW-Madison</p>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>WHAT I'M CURIOUS ABOUT</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px', marginBottom: '16px' }}>
        {allInterests.map(item => (
          <span
            key={item}
            onClick={() => toggleInterest(item)}
            style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', border: '0.5px solid var(--border)', background: interests.includes(item) ? 'var(--purple-light)' : 'var(--card-bg)', color: interests.includes(item) ? '#3c3489' : 'var(--text-secondary)', borderColor: interests.includes(item) ? 'var(--purple)' : 'var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {item}
          </span>
        ))}
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>OPEN TO</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px', marginBottom: '16px' }}>
        {allOpenTo.map(item => (
          <span
            key={item}
            onClick={() => toggleOpenTo(item)}
            style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', border: '0.5px solid var(--border)', background: openTo.includes(item) ? 'var(--purple-light)' : 'var(--card-bg)', color: openTo.includes(item) ? '#3c3489' : 'var(--text-secondary)', borderColor: openTo.includes(item) ? 'var(--purple)' : 'var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '4px 16px 16px', padding: '16px', border: '0.5px solid var(--border)' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>YOUR STATS</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div><span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--accent-dark)' }}>0</span><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Connections</p></div>
          <div><span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--purple)' }}>0</span><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Coffee chats</p></div>
          <div><span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--warm)' }}>0</span><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Activities</p></div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <button onClick={handleSave} style={{ width: '100%', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Save profile</button>
      </div>
    </div>
  )
}

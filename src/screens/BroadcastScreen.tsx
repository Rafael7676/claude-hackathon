import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Broadcast {
  id: string
  title: string
  description: string
  joined_count: number
  distance_label: string
  icon_color: string
}

const mockLive: Broadcast[] = [
  { id: '1', title: 'Board games @ Union South', description: 'Need 2 more for Settlers of Catan — snacks provided', joined_count: 6, distance_label: '3 min walk', icon_color: 'linear-gradient(135deg, var(--purple), #3c3489)' },
  { id: '2', title: 'Photo walk around campus', description: 'Taking golden hour pics, all skill levels welcome', joined_count: 4, distance_label: '7 min walk', icon_color: 'linear-gradient(135deg, var(--warm), #993c1d)' },
  { id: '3', title: 'Study session — Calc II', description: 'Working through problem set 7, library 3rd floor', joined_count: 3, distance_label: '1 min walk', icon_color: 'linear-gradient(135deg, var(--accent), #085041)' },
]

interface Props {
  guestId: string
  guestName: string
  myLocation: [number, number] | null
}

export default function BroadcastScreen({ guestId, guestName, myLocation }: Props) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(mockLive)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchBroadcasts()
    const channel = supabase
      .channel('broadcasts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcasts' }, fetchBroadcasts)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchBroadcasts() {
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && data.length > 0) {
      const mapped: Broadcast[] = data.map((b, i) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        joined_count: b.joined_count,
        distance_label: '? min walk',
        icon_color: ['linear-gradient(135deg, var(--purple), #3c3489)', 'linear-gradient(135deg, var(--warm), #993c1d)', 'linear-gradient(135deg, var(--accent), #085041)'][i % 3],
      }))
      setBroadcasts(mapped)
    }
  }

  async function handlePost() {
    if (!title.trim() || !myLocation) return
    setPosting(true)
    await supabase.from('broadcasts').insert({
      user_id: guestId,
      username: guestName,
      title: title.trim(),
      description: description.trim(),
      lat: myLocation[0],
      lng: myLocation[1],
      joined_count: 1,
    })
    setTitle('')
    setDescription('')
    setCreating(false)
    setPosting(false)
    fetchBroadcasts()
  }

  async function handleJoin(id: string) {
    await supabase.from('broadcasts').update({ joined_count: supabase.rpc('increment', { x: 1 }) }).eq('id', id)
    fetchBroadcasts()
  }

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>

      <div style={{ padding: '8px 24px 16px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>Broadcast</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>Share an open invitation with people nearby</p>
      </div>

      {/* Create broadcast */}
      {creating ? (
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '1.5px solid var(--accent)' }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What are you up to?"
            style={{ width: '100%', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', marginBottom: '8px' }}
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add details (optional)"
            style={{ width: '100%', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePost} disabled={posting || !title.trim()} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: !title.trim() ? 0.5 : 1 }}>
              {posting ? 'Posting…' : 'Broadcast'}
            </button>
            <button onClick={() => setCreating(false)} style={{ background: 'none', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setCreating(true)} style={{ background: 'var(--accent-light)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '1.5px dashed var(--accent)', cursor: 'pointer' }}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth={1.5} style={{ marginBottom: '8px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-dark)' }}>Create a broadcast</p>
            <p style={{ fontSize: '12px', color: 'var(--accent-dark)', opacity: 0.7, marginTop: '4px' }}>Invite people within walking distance to join you</p>
          </div>
        </div>
      )}

      <div style={{ padding: '0 16px 8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>LIVE NOW NEARBY</span>
      </div>

      {broadcasts.map((b, i) => (
        <div key={b.id} className="fade-in" onClick={() => handleJoin(b.id)} style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '0.5px solid var(--border)', display: 'flex', gap: '14px', cursor: 'pointer', animationDelay: `${i * 0.1}s` }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: b.icon_color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: '13px' }}>{b.title}</span>
              <span className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0' }}>{b.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--warm)', background: 'var(--warm-light)', padding: '3px 8px', borderRadius: '8px', fontWeight: 500 }}>{b.distance_label}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{b.joined_count} joined</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

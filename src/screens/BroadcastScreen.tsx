import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Squad {
  id: string
  name: string
  count: number
  distance: string
  avatarBg: string
  avatarColor: string
  initials: string
  blobColor: string
  blobLeft: number
  blobTop: number
  blobSize: number
  type: 'join' | 'invite'
}

const defaultSquads: Squad[] = [
  { id: '1', name: 'Coffee run crew',  count: 6, distance: '80m away',  avatarBg: '#E1F5EE', avatarColor: '#0F6E56', initials: 'CS', blobColor: 'rgba(29,158,117,0.85)',  blobLeft: 75,  blobTop: 60,  blobSize: 48, type: 'join' },
  { id: '2', name: 'Study break',      count: 3, distance: '140m away', avatarBg: '#FAECE7', avatarColor: '#993C1D', initials: 'ST', blobColor: 'rgba(216,90,48,0.85)',   blobLeft: 220, blobTop: 105, blobSize: 38, type: 'join' },
  { id: '3', name: 'You + 1 friend',   count: 2, distance: 'Your squad', avatarBg: '#EEEDFE', avatarColor: '#534AB7', initials: 'YO', blobColor: 'rgba(83,74,183,0.85)',  blobLeft: 115, blobTop: 195, blobSize: 32, type: 'invite' },
]

interface Props {
  guestId: string
  guestName: string
  myLocation: [number, number] | null
  onLocation: (loc: [number, number]) => void
}

export default function BroadcastScreen({ guestId, guestName, myLocation, onLocation }: Props) {
  const [squads, setSquads] = useState<Squad[]>(defaultSquads)
  const [pinged, setPinged] = useState(false)
  const [pinging, setPinging] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [ringSize, setRingSize] = useState(0)
  const [waves, setWaves] = useState<number[]>([])
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null)
  const [joined, setJoined] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [posting, setPosting] = useState(false)
  const waveId = useRef(0)

  // Get location silently
  useEffect(() => {
    if (myLocation) return
    navigator.geolocation.getCurrentPosition(
      pos => onLocation([pos.coords.latitude, pos.coords.longitude]),
      () => onLocation([43.0766, -89.4125])
    )
  }, [])

  // Fetch real broadcasts and add as squads
  useEffect(() => {
    fetchBroadcasts()
    const channel = supabase
      .channel('broadcasts-rt')
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
      .limit(5)

    if (data && data.length > 0) {
      const liveSquads: Squad[] = data.map((b, i) => ({
        id: b.id,
        name: b.title,
        count: b.joined_count,
        distance: 'nearby',
        avatarBg: ['#E1F5EE', '#FAECE7', '#EEEDFE'][i % 3],
        avatarColor: ['#0F6E56', '#993C1D', '#534AB7'][i % 3],
        initials: b.title.slice(0, 2).toUpperCase(),
        blobColor: ['rgba(29,158,117,0.85)', 'rgba(216,90,48,0.85)', 'rgba(83,74,183,0.85)'][i % 3],
        blobLeft: [90, 200, 130][i % 3],
        blobTop: [70, 110, 200][i % 3],
        blobSize: Math.min(28 + b.joined_count * 4, 56),
        type: 'join' as const,
      }))
      setSquads(liveSquads)
    }
  }

  async function handlePing() {
    if (pinging) return
    setPinging(true)

    // Ripple wave
    const id = waveId.current++
    setWaves(w => [...w, id])
    setTimeout(() => setWaves(w => w.filter(x => x !== id)), 1200)

    // Expand ring
    setRingSize(200)

    // Upsert to squad_members
    if (myLocation) {
      await supabase.from('squad_members').upsert({ id: guestId, username: guestName, lat: myLocation[0], lng: myLocation[1], squad_id: null })
    }

    setTimeout(() => {
      setPinged(true)
      setPinging(false)
      setShowNotif(true)
    }, 800)
  }

  function dismissNotif() { setShowNotif(false) }

  function handleBlobClick(squad: Squad) {
    setSelectedSquad(squad)
    setShowNotif(false)
  }

  function handleJoin(squad: Squad) {
    setJoined(prev => new Set(prev).add(squad.id))
    setSelectedSquad(null)
    // Update count visually
    setSquads(prev => prev.map(s => s.id === squad.id ? { ...s, count: s.count + 1, blobSize: Math.min(s.blobSize + 4, 60) } : s))
  }

  async function handlePost() {
    if (!newTitle.trim()) return
    setPosting(true)
    const loc = myLocation ?? [43.0766, -89.4125]
    await supabase.from('broadcasts').insert({
      user_id: guestId, username: guestName,
      title: newTitle.trim(), description: '',
      lat: loc[0], lng: loc[1], joined_count: 1,
    })
    setNewTitle('')
    setCreating(false)
    setPosting(false)
    fetchBroadcasts()
  }

  const displaySquad = selectedSquad ?? { name: `${squads.length} squads nearby`, count: squads.reduce((a, s) => a + s.count, 0) }

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)', background: 'var(--app-bg)' }}>

      {/* Top bar */}
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 10px' }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 500, color: 'var(--text-primary)' }}>Squad</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Memorial Union area</div>
        </div>
        <button
          onClick={handlePing}
          disabled={pinging}
          style={{ background: '#534AB7', color: '#EEEDFE', border: 'none', borderRadius: '20px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: pinging ? 'default' : 'pointer', opacity: pinging ? 0.7 : 1, fontFamily: 'inherit' }}
        >
          {pinging ? 'Pinging…' : pinged ? 'Re-ping' : 'Ping'}
        </button>
      </div>

      {/* Map area */}
      <div style={{ position: 'relative', width: '100%', height: '280px', background: '#f0ede6', overflow: 'hidden' }}>
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        {/* Roads */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '90px', height: '18px', background: 'rgba(255,255,255,0.7)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '180px', height: '14px', background: 'rgba(255,255,255,0.7)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '80px', width: '16px', background: 'rgba(255,255,255,0.7)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '210px', width: '14px', background: 'rgba(255,255,255,0.7)' }} />
        {/* Buildings */}
        {[
          { top: 20,  left: 20,  w: 50, h: 60 }, { top: 20,  left: 100, w: 80, h: 55 }, { top: 20,  left: 230, w: 60, h: 50 },
          { top: 115, left: 20,  w: 45, h: 52 }, { top: 115, left: 105, w: 70, h: 50 }, { top: 115, left: 230, w: 65, h: 50 },
          { top: 205, left: 20,  w: 55, h: 60 }, { top: 205, left: 100, w: 90, h: 55 }, { top: 205, left: 235, w: 55, h: 55 },
        ].map((b, i) => (
          <div key={i} style={{ position: 'absolute', top: b.top, left: b.left, width: b.w, height: b.h, background: '#d8d4cc', borderRadius: '3px' }} />
        ))}

        {/* Radius ring */}
        <div style={{ position: 'absolute', left: '160px', top: '140px', width: ringSize, height: ringSize, borderRadius: '50%', border: '2px dashed rgba(83,74,183,0.5)', background: 'rgba(83,74,183,0.07)', transform: 'translate(-50%,-50%)', transition: 'all 0.4s ease', pointerEvents: 'none' }} />

        {/* Ping waves */}
        {waves.map(id => (
          <div key={id} style={{ position: 'absolute', left: '160px', top: '140px', borderRadius: '50%', border: '2px solid rgba(83,74,183,0.6)', transform: 'translate(-50%,-50%)', animation: 'pingWave 1.2s ease-out forwards', pointerEvents: 'none' }} />
        ))}

        {/* Squad blobs */}
        {squads.map(s => (
          <div
            key={s.id}
            onClick={() => handleBlobClick(s)}
            style={{ position: 'absolute', left: s.blobLeft, top: s.blobTop, width: s.blobSize, height: s.blobSize, borderRadius: '50%', background: joined.has(s.id) ? 'rgba(29,158,117,0.9)' : s.blobColor, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: selectedSquad?.id === s.id ? '0 0 0 3px white, 0 0 0 5px rgba(83,74,183,0.4)' : 'none' }}
          >
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'white', pointerEvents: 'none' }}>{s.count}</span>
          </div>
        ))}

        {/* You dot */}
        <div style={{ position: 'absolute', left: '160px', top: '140px', width: '14px', height: '14px', background: '#534AB7', borderRadius: '50%', border: '2px solid white', transform: 'translate(-50%,-50%)', zIndex: 10 }} />

        {/* Notification banner */}
        {showNotif && (
          <div style={{ position: 'absolute', top: '8px', left: '10px', right: '10px', background: 'white', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: '8px', zIndex: 20, animation: 'slideDown 0.3s ease' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>📍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                <b style={{ fontWeight: 500 }}>{squads.reduce((a, s) => a + s.count, 0)} people</b> got your ping nearby
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button onClick={dismissNotif} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', border: 'none', background: '#534AB7', color: '#EEEDFE', cursor: 'pointer', fontFamily: 'inherit' }}>Open squad</button>
                <button onClick={dismissNotif} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>Later</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div style={{ borderTop: '0.5px solid var(--border)', padding: '12px 16px', background: 'var(--card-bg)' }}>
        <div style={{ width: '32px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 10px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {selectedSquad ? selectedSquad.name : `${squads.length} squads nearby`}
          </span>
          {selectedSquad && (
            <button onClick={() => setSelectedSquad(null)} style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← All</button>
          )}
        </div>

        {(selectedSquad ? [selectedSquad] : squads).map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, flexShrink: 0, background: s.avatarBg, color: s.avatarColor }}>{s.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{s.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.count} people · {s.distance}</div>
            </div>
            <button
              onClick={() => s.type === 'invite' ? null : handleJoin(s)}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', border: `0.5px solid ${joined.has(s.id) ? '#1d9e75' : s.type === 'invite' ? '#1d9e75' : '#534AB7'}`, background: joined.has(s.id) ? '#E1F5EE' : 'transparent', color: joined.has(s.id) ? '#0F6E56' : s.type === 'invite' ? '#0F6E56' : '#534AB7', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {joined.has(s.id) ? 'Joined ✓' : s.type === 'invite' ? 'Invite' : 'Join'}
            </button>
          </div>
        ))}

        {/* Create broadcast */}
        <div style={{ marginTop: '12px' }}>
          {creating ? (
            <div>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="What's your squad doing?"
                autoFocus
                style={{ width: '100%', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', marginBottom: '8px', background: 'var(--app-bg)' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePost} disabled={posting || !newTitle.trim()} style={{ flex: 1, background: '#534AB7', color: 'white', border: 'none', borderRadius: '12px', padding: '9px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: !newTitle.trim() ? 0.5 : 1 }}>
                  {posting ? 'Posting…' : 'Create squad'}
                </button>
                <button onClick={() => setCreating(false)} style={{ background: 'none', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '9px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              style={{ width: '100%', background: 'none', border: '1px dashed #534AB7', borderRadius: '12px', padding: '9px', fontSize: '13px', fontWeight: 500, color: '#534AB7', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              + Start a squad
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pingWave {
          0%   { width: 14px; height: 14px; opacity: 0.8; }
          100% { width: 120px; height: 120px; opacity: 0; }
        }
        @keyframes slideDown {
          from { transform: translateY(-40px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

interface Broadcast {
  id: string
  title: string
  description: string
  joined_count: number
  distance_label: string
  icon_color: string
}

interface NearbyUser {
  id: string
  username: string
  lat: number
  lng: number
}

const PING_RADIUS_M = 300

const mockLive: Broadcast[] = [
  { id: '1', title: 'Board games @ Union South', description: 'Need 2 more for Settlers of Catan — snacks provided', joined_count: 6, distance_label: '3 min walk', icon_color: 'linear-gradient(135deg, var(--purple), #3c3489)' },
  { id: '2', title: 'Photo walk around campus', description: 'Taking golden hour pics, all skill levels welcome', joined_count: 4, distance_label: '7 min walk', icon_color: 'linear-gradient(135deg, var(--warm), #993c1d)' },
  { id: '3', title: 'Study session — Calc II', description: 'Working through problem set 7, library 3rd floor', joined_count: 3, distance_label: '1 min walk', icon_color: 'linear-gradient(135deg, var(--accent), #085041)' },
]

interface Props {
  guestId: string
  guestName: string
  myLocation: [number, number] | null
  onLocation: (loc: [number, number]) => void
}

export default function BroadcastScreen({ guestId, guestName, myLocation, onLocation }: Props) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(mockLive)
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [pinging, setPinging] = useState(false)
  const [pinged, setPinged] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [posting, setPosting] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  // Get location on mount
  useEffect(() => {
    if (myLocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        onLocation(loc)
        mapRef.current?.setView(loc, 15)
      },
      () => onLocation([43.0766, -89.4125])
    )
  }, [])

  // Center map when location arrives
  useEffect(() => {
    if (myLocation) mapRef.current?.setView(myLocation, 15)
  }, [myLocation])

  // Real-time broadcasts
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
      .limit(10)

    if (data && data.length > 0) {
      setBroadcasts(data.map((b, i) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        joined_count: b.joined_count,
        distance_label: '? min walk',
        icon_color: ['linear-gradient(135deg, var(--purple), #3c3489)', 'linear-gradient(135deg, var(--warm), #993c1d)', 'linear-gradient(135deg, var(--accent), #085041)'][i % 3],
      })))
    }
  }

  async function fetchNearby() {
    if (!myLocation) return
    const { data } = await supabase.rpc('nearby_members', { lat: myLocation[0], lng: myLocation[1], radius_m: PING_RADIUS_M })
    if (data) setNearbyUsers(data)
  }

  async function handlePing() {
    if (!myLocation) return
    setPinging(true)
    await supabase.from('squad_members').upsert({ id: guestId, username: guestName, lat: myLocation[0], lng: myLocation[1], squad_id: null })
    await fetchNearby()
    setPinging(false)
    setPinged(true)
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

  const defaultCenter: [number, number] = myLocation ?? [43.0766, -89.4125]
  const others = nearbyUsers.filter(u => u.id !== guestId)

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>

      <div style={{ padding: '8px 24px 12px' }}>
        <h1 className="fraunces" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>Broadcast</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>See who's nearby and share an open invite</p>
      </div>

      {/* Map card */}
      <div style={{ margin: '0 16px 12px', borderRadius: '16px', overflow: 'hidden', border: '0.5px solid var(--border)', position: 'relative' }}>
        <div style={{ height: '200px' }}>
          <MapContainer
            center={defaultCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {myLocation && (
              <>
                <Circle
                  center={myLocation}
                  radius={PING_RADIUS_M}
                  pathOptions={{ color: '#1d9e75', fillColor: '#1d9e75', fillOpacity: 0.1, weight: 1.5, dashArray: '5' }}
                />
                <Marker position={myLocation}>
                  <Popup>You ({guestName})</Popup>
                </Marker>
              </>
            )}
            {others.map(u => (
              <Marker key={u.id} position={[u.lat, u.lng]}>
                <Popup><strong>{u.username}</strong></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Ping bar overlaid at bottom of map */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 500 }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {pinged ? `${others.length} ${others.length === 1 ? 'person' : 'people'} nearby` : 'Drop a ping to see who\'s around'}
            </p>
            {pinged && others.length > 0 && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>within 300m of you</p>
            )}
          </div>
          <button
            onClick={handlePing}
            disabled={pinging || !myLocation}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 18px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', opacity: (!myLocation || pinging) ? 0.5 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="3" />
              <path d="M6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4" />
            </svg>
            {pinging ? 'Pinging…' : pinged ? 'Re-ping' : 'Ping'}
          </button>
        </div>
      </div>

      {/* Create broadcast */}
      {creating ? (
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '1.5px solid var(--accent)' }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What are you up to?"
            style={{ width: '100%', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', marginBottom: '8px', background: 'var(--app-bg)' }}
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add details (optional)"
            style={{ width: '100%', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px', background: 'var(--app-bg)' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePost} disabled={posting || !title.trim()} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: !title.trim() ? 0.5 : 1 }}>
              {posting ? 'Posting…' : 'Broadcast'}
            </button>
            <button onClick={() => setCreating(false)} style={{ background: 'none', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setCreating(true)} style={{ background: 'var(--accent-light)', borderRadius: '16px', margin: '0 16px 12px', padding: '14px 16px', border: '1.5px dashed var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-dark)' }}>Create a broadcast</p>
            <p style={{ fontSize: '12px', color: 'var(--accent-dark)', opacity: 0.7, marginTop: '2px' }}>Invite people within walking distance</p>
          </div>
        </div>
      )}

      {/* Trending activity cards from pipeline */}
      <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Trending activities</span>
        <span style={{ fontSize: '10px', color: 'var(--accent-dark)', fontWeight: 500 }}>Reels → Claude → campus</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '0 16px', marginBottom: '16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { emoji: '🛍', title: 'Thrift flip', meta: '3–5 people · $10', color: 'var(--warm)' },
          { emoji: '📚', title: 'Study + sunset', meta: '4–8 people · Free', color: 'var(--purple)' },
          { emoji: '🍜', title: '$5 dinner crawl', meta: 'Groups of 4 · ~$5', color: 'var(--accent)' },
          { emoji: '☕', title: 'Coffee roulette', meta: '1-on-1 · Free', color: '#7f77dd' },
        ].map(t => (
          <div key={t.title} style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '12px', minWidth: '130px', flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{t.emoji}</div>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>{t.title}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t.meta}</p>
            <div style={{ marginTop: '8px', height: '3px', borderRadius: '2px', background: t.color, opacity: 0.6 }} />
          </div>
        ))}
      </div>

      {/* Live now */}
      <div style={{ padding: '4px 16px 8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Live now nearby</span>
      </div>

      {broadcasts.map((b, i) => (
        <div key={b.id} className="fade-in" style={{ background: 'var(--card-bg)', borderRadius: '16px', margin: '0 16px 12px', padding: '16px', border: '0.5px solid var(--border)', display: 'flex', gap: '14px', cursor: 'pointer', animationDelay: `${i * 0.1}s` }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: b.icon_color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: '13px' }}>{b.title}</span>
              <span className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', flexShrink: 0 }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0', lineHeight: 1.4 }}>{b.description}</p>
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

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const PING_RADIUS_M = 300

const BLOB_COLORS = [
  'rgba(29,158,117,0.85)',
  'rgba(216,90,48,0.85)',
  'rgba(83,74,183,0.85)',
]
const AVATAR_STYLES = [
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FAECE7', color: '#993C1D' },
  { bg: '#EEEDFE', color: '#534AB7' },
]

interface NearbyUser {
  id: string
  username: string
  lat: number
  lng: number
  squad_id: string | null
}

interface Squad {
  id: string
  name: string
  count: number
  distance: string
  avatarBg: string
  avatarColor: string
  initials: string
  blobColor: string
  lat: number
  lng: number
  blobSize: number
  type: 'join' | 'invite'
}

function blobIcon(color: string, count: number, size: number, selected: boolean) {
  const s = Math.max(size, 28)
  const ring = selected ? `box-shadow:0 0 0 3px white,0 0 0 5px rgba(83,74,183,0.4);` : ''
  return L.divIcon({
    className: '',
    html: `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;cursor:pointer;${ring}transition:all 0.3s;"><span style="font-size:11px;font-weight:500;color:white;">${count}</span></div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  })
}

function youIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:#534AB7;border-radius:50%;border:2px solid white;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function MapCenterOnLoad({ location }: { location: [number, number] }) {
  const map = useMapEvents({})
  useEffect(() => { map.setView(location, 17) }, [location])
  return null
}

interface Props {
  guestId: string
  guestName: string
  myLocation: [number, number] | null
  onLocation: (loc: [number, number]) => void
}

export default function BroadcastScreen({ guestId, guestName, myLocation, onLocation }: Props) {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [squads, setSquads] = useState<Squad[]>([])
  const [pinged, setPinged] = useState(false)
  const [pinging, setPinging] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showRing, setShowRing] = useState(false)
  const [waves, setWaves] = useState<number[]>([])
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null)
  const [joined, setJoined] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [posting, setPosting] = useState(false)
  const waveId = useRef(0)
  const mapRef = useRef<L.Map | null>(null)

  // Get location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        onLocation(loc)
      },
      () => onLocation([43.0766, -89.4125])
    )
  }, [])

  // Center map when location arrives
  useEffect(() => {
    if (myLocation && mapRef.current) mapRef.current.setView(myLocation, 17)
  }, [myLocation])

  // Real-time broadcasts → squads
  useEffect(() => {
    fetchBroadcasts()
    const channel = supabase
      .channel('broadcasts-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcasts' }, fetchBroadcasts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'squad_members' }, () => { if (myLocation) fetchNearby() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [myLocation])

  async function fetchBroadcasts() {
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(6)

    if (data && data.length > 0) {
      const loc = myLocation ?? [43.0766, -89.4125]
      setSquads(data.map((b, i) => ({
        id: b.id,
        name: b.title,
        count: b.joined_count,
        distance: distanceLabel(loc[0], loc[1], b.lat, b.lng),
        avatarBg: AVATAR_STYLES[i % 3].bg,
        avatarColor: AVATAR_STYLES[i % 3].color,
        initials: b.title.slice(0, 2).toUpperCase(),
        blobColor: BLOB_COLORS[i % 3],
        lat: b.lat,
        lng: b.lng,
        blobSize: Math.min(28 + b.joined_count * 4, 56),
        type: 'join' as const,
      })))
    }
  }

  async function fetchNearby() {
    if (!myLocation) return
    const { data } = await supabase.rpc('nearby_members', { lat: myLocation[0], lng: myLocation[1], radius_m: PING_RADIUS_M })
    if (data) setNearbyUsers(data)
  }

  function distanceLabel(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return d < 1000 ? `${Math.round(d)}m away` : `${(d/1000).toFixed(1)}km away`
  }

  async function handlePing() {
    if (pinging || !myLocation) return
    setPinging(true)

    // Ripple waves
    const id = waveId.current++
    setWaves(w => [...w, id])
    setTimeout(() => setWaves(w => w.filter(x => x !== id)), 1200)

    setShowRing(true)

    await supabase.from('squad_members').upsert({
      id: guestId, username: guestName,
      lat: myLocation[0], lng: myLocation[1], squad_id: null,
    })

    await fetchNearby()

    setTimeout(() => {
      setPinged(true)
      setPinging(false)
      setShowNotif(true)
    }, 800)
  }

  async function handleJoin(squad: Squad) {
    setJoined(prev => new Set(prev).add(squad.id))
    setSelectedSquad(null)
    await supabase.from('broadcasts')
      .update({ joined_count: squad.count + 1 })
      .eq('id', squad.id)
    fetchBroadcasts()
  }

  async function handlePost() {
    if (!newTitle.trim() || !myLocation) return
    setPosting(true)
    await supabase.from('broadcasts').insert({
      user_id: guestId, username: guestName,
      title: newTitle.trim(), description: '',
      lat: myLocation[0], lng: myLocation[1], joined_count: 1,
    })
    setNewTitle('')
    setCreating(false)
    setPosting(false)
    fetchBroadcasts()
  }

  const totalNearby = nearbyUsers.filter(u => u.id !== guestId).length + squads.reduce((a, s) => a + s.count, 0)
  const defaultCenter: [number, number] = myLocation ?? [43.0766, -89.4125]

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)', background: 'var(--app-bg)' }}>
      <style>{`
        @keyframes pingWave {
          0%   { stroke-opacity: 0.7; r: 8; }
          100% { stroke-opacity: 0;   r: 80; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 10px' }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 500, color: 'var(--text-primary)' }}>Squad</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {myLocation ? 'Your location' : 'Finding location…'}
          </div>
        </div>
        <button
          onClick={handlePing}
          disabled={pinging || !myLocation}
          style={{ background: '#534AB7', color: '#EEEDFE', border: 'none', borderRadius: '20px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: (pinging || !myLocation) ? 'default' : 'pointer', opacity: (pinging || !myLocation) ? 0.6 : 1, fontFamily: 'inherit' }}
        >
          {pinging ? 'Pinging…' : pinged ? 'Re-ping' : 'Ping'}
        </button>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        <MapContainer
          center={defaultCenter}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

          {myLocation && <MapCenterOnLoad location={myLocation} />}

          {/* Radius ring */}
          {myLocation && showRing && (
            <Circle
              center={myLocation}
              radius={PING_RADIUS_M}
              pathOptions={{ color: '#534AB7', fillColor: '#534AB7', fillOpacity: 0.07, weight: 2, dashArray: '6' }}
            />
          )}

          {/* Ping wave circles */}
          {myLocation && waves.map(id => (
            <Circle
              key={id}
              center={myLocation}
              radius={1}
              pathOptions={{ color: '#534AB7', fillColor: 'transparent', weight: 2, className: `ping-wave-${id}` }}
            />
          ))}

          {/* Your location dot */}
          {myLocation && (
            <Marker position={myLocation} icon={youIcon()} />
          )}

          {/* Nearby users as blobs */}
          {nearbyUsers
            .filter(u => u.id !== guestId)
            .map((u, i) => (
              <Marker
                key={u.id}
                position={[u.lat, u.lng]}
                icon={blobIcon(BLOB_COLORS[i % 3], 1, 32, false)}
              />
            ))}

          {/* Broadcast squads as blobs */}
          {squads.map(s => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={blobIcon(joined.has(s.id) ? 'rgba(29,158,117,0.9)' : s.blobColor, s.count, s.blobSize, selectedSquad?.id === s.id)}
              eventHandlers={{ click: () => setSelectedSquad(s) }}
            />
          ))}
        </MapContainer>

        {/* Notification banner overlay */}
        {showNotif && (
          <div style={{ position: 'absolute', top: '8px', left: '10px', right: '10px', background: 'white', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: '8px', zIndex: 1000, animation: 'slideDown 0.3s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>📍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                <b style={{ fontWeight: 500 }}>{totalNearby > 0 ? `${totalNearby} people` : 'Ping sent!'}</b>{totalNearby > 0 ? ' got your ping nearby' : ' Check back in a moment'}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button onClick={() => setShowNotif(false)} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', border: 'none', background: '#534AB7', color: '#EEEDFE', cursor: 'pointer', fontFamily: 'inherit' }}>Open squad</button>
                <button onClick={() => setShowNotif(false)} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>Later</button>
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
            {selectedSquad ? selectedSquad.name : squads.length > 0 ? `${squads.length} squads nearby` : 'No squads yet — start one!'}
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
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.count} {s.count === 1 ? 'person' : 'people'} · {s.distance}</div>
            </div>
            <button
              onClick={() => !joined.has(s.id) && handleJoin(s)}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', border: `0.5px solid ${joined.has(s.id) ? '#1d9e75' : '#534AB7'}`, background: joined.has(s.id) ? '#E1F5EE' : 'transparent', color: joined.has(s.id) ? '#0F6E56' : '#534AB7', cursor: joined.has(s.id) ? 'default' : 'pointer', fontFamily: 'inherit' }}
            >
              {joined.has(s.id) ? 'Joined ✓' : 'Join'}
            </button>
          </div>
        ))}

        {/* Nearby pinged users (not in squads) */}
        {!selectedSquad && nearbyUsers.filter(u => u.id !== guestId).map((u, i) => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, flexShrink: 0, background: AVATAR_STYLES[i % 3].bg, color: AVATAR_STYLES[i % 3].color }}>
              {u.username.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{u.username}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>nearby · just pinged</div>
            </div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', border: '0.5px solid #534AB7', background: 'transparent', color: '#534AB7', cursor: 'pointer', fontFamily: 'inherit' }}>
              Wave
            </button>
          </div>
        ))}

        {/* Start a squad */}
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
            <button onClick={() => setCreating(true)} style={{ width: '100%', background: 'none', border: '1px dashed #534AB7', borderRadius: '12px', padding: '9px', fontSize: '13px', fontWeight: 500, color: '#534AB7', cursor: 'pointer', fontFamily: 'inherit' }}>
              + Start a squad
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-40px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

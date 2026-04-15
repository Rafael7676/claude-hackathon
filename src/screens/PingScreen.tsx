import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

interface SquadMember {
  id: string
  username: string
  lat: number
  lng: number
}

const PING_RADIUS_M = 300

interface Props {
  guestId: string
  guestName: string
  myLocation: [number, number] | null
  onLocation: (loc: [number, number]) => void
}

export default function PingScreen({ guestId, guestName, myLocation, onLocation }: Props) {
  const [nearbyUsers, setNearbyUsers] = useState<SquadMember[]>([])
  const [pinging, setPinging] = useState(false)
  const [pinged, setPinged] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        onLocation(loc)
        mapRef.current?.setView(loc, 16)
      },
      () => onLocation([43.0766, -89.4125])
    )
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('squad-presence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'squad_members' }, () => fetchNearby())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [myLocation])

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

  const defaultCenter: [number, number] = myLocation ?? [43.0766, -89.4125]
  const others = nearbyUsers.filter(u => u.id !== guestId)

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column' }}>
      {/* Map fills most of screen */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={defaultCenter}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {myLocation && (
            <>
              <Circle center={myLocation} radius={PING_RADIUS_M} pathOptions={{ color: '#1d9e75', fillColor: '#1d9e75', fillOpacity: 0.08, weight: 1.5, dashArray: '6' }} />
              <Marker position={myLocation}><Popup>You ({guestName})</Popup></Marker>
            </>
          )}
          {others.map(u => (
            <Marker key={u.id} position={[u.lat, u.lng]}>
              <Popup><strong>{u.username}</strong></Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom panel */}
      <div style={{ background: 'var(--card-bg)', borderTop: '0.5px solid var(--border)', padding: '12px 16px', paddingBottom: 'calc(var(--nav-height) + 12px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {pinged ? `${others.length} people within 300m` : "Drop a ping to see who's around"}
          </p>
          {pinged && others.length > 0 && (
            <span className="pulse" style={{ fontSize: '11px', background: 'var(--accent-light)', color: 'var(--accent-dark)', padding: '3px 10px', borderRadius: '12px', fontWeight: 500 }}>Live</span>
          )}
        </div>
        <button
          onClick={handlePing}
          disabled={pinging || !myLocation}
          style={{ width: '100%', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: (!myLocation || pinging) ? 0.5 : 1 }}
        >
          {pinging ? 'Pinging…' : pinged ? '📡 Re-ping' : '📡 Ping nearby'}
        </button>
      </div>
    </div>
  )
}

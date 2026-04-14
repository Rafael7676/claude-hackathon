import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'

// Fix leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

interface SquadMember {
  id: string
  username: string
  lat: number
  lng: number
  squad_id: string | null
}

const PING_RADIUS_M = 300

function PingRadiusDisplay({ center }: { center: [number, number] }) {
  return (
    <Circle
      center={center}
      radius={PING_RADIUS_M}
      pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.08, weight: 1.5, dashArray: '6' }}
    />
  )
}

function LocationTracker({ onLocation }: { onLocation: (lat: number, lng: number) => void }) {
  useMapEvents({
    locationfound(e) {
      onLocation(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface Props {
  session: Session
}

export default function MapPage({ session }: Props) {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [nearbyUsers, setNearbyUsers] = useState<SquadMember[]>([])
  const [pinging, setPinging] = useState(false)
  const [pinged, setPinged] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  // Get current location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setMyLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {
        // Fallback: UW-Madison Memorial Union
        setMyLocation([43.0766, -89.4125])
      }
    )
  }, [])

  // Subscribe to real-time presence updates
  useEffect(() => {
    const channel = supabase
      .channel('squad-presence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'squad_members' }, () => {
        fetchNearby()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [myLocation])

  async function fetchNearby() {
    if (!myLocation) return
    const { data } = await supabase.rpc('nearby_members', {
      lat: myLocation[0],
      lng: myLocation[1],
      radius_m: PING_RADIUS_M,
    })
    if (data) setNearbyUsers(data)
  }

  async function handlePing() {
    if (!myLocation) return
    setPinging(true)

    const username = session.user.email?.split('@')[0] ?? 'anon'

    await supabase.from('squad_members').upsert({
      id: session.user.id,
      username,
      lat: myLocation[0],
      lng: myLocation[1],
      squad_id: null,
    })

    await fetchNearby()
    setPinging(false)
    setPinged(true)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  const defaultCenter: [number, number] = myLocation ?? [43.0766, -89.4125]

  return (
    <div className="relative w-full h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">📡</span>
          <span className="text-white font-bold text-lg">Squad Up</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{session.user.email?.split('@')[0]}</span>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 pt-14">
        <MapContainer
          center={defaultCenter}
          zoom={16}
          className="w-full h-full"
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <LocationTracker onLocation={(lat, lng) => setMyLocation([lat, lng])} />

          {/* My location */}
          {myLocation && (
            <>
              <PingRadiusDisplay center={myLocation} />
              <Marker position={myLocation}>
                <Popup>You are here</Popup>
              </Marker>
            </>
          )}

          {/* Nearby users */}
          {nearbyUsers
            .filter(u => u.id !== session.user.id)
            .map(user => (
              <Marker key={user.id} position={[user.lat, user.lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">{user.username}</p>
                    <button
                      className="mt-2 text-xs bg-violet-600 text-white px-3 py-1 rounded-full"
                      onClick={() => {/* TODO: send squad invite */}}
                    >
                      Invite to squad
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-sm">
            {pinged
              ? `${nearbyUsers.filter(u => u.id !== session.user.id).length} people nearby`
              : 'Drop a ping to see who\'s around'}
          </p>
          {pinged && nearbyUsers.filter(u => u.id !== session.user.id).length > 0 && (
            <span className="text-xs bg-violet-700 text-white px-2 py-0.5 rounded-full">
              Live
            </span>
          )}
        </div>
        <button
          onClick={handlePing}
          disabled={pinging || !myLocation}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-2xl py-4 text-lg transition-colors"
        >
          {pinging ? 'Pinging…' : pinged ? '📡 Re-ping' : '📡 Ping'}
        </button>
      </div>
    </div>
  )
}

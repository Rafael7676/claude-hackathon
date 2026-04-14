import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'

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

// Persist a guest ID across page reloads
function getGuestId(): string {
  const key = 'squad_guest_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

function getGuestName(): string {
  const key = 'squad_guest_name'
  let name = localStorage.getItem(key)
  if (!name) {
    const adjectives = ['Swift', 'Bold', 'Chill', 'Rad', 'Cozy', 'Epic', 'Cool', 'Loud']
    const nouns = ['Badger', 'Hawk', 'Fox', 'Bear', 'Wolf', 'Owl', 'Lynx', 'Deer']
    name = adjectives[Math.floor(Math.random() * adjectives.length)] +
           nouns[Math.floor(Math.random() * nouns.length)]
    localStorage.setItem(key, name)
  }
  return name
}

export default function MapPage() {
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [nearbyUsers, setNearbyUsers] = useState<SquadMember[]>([])
  const [pinging, setPinging] = useState(false)
  const [pinged, setPinged] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  const guestId = getGuestId()
  const guestName = getGuestName()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setMyLocation(loc)
        mapRef.current?.setView(loc, 16)
      },
      () => {
        // Fallback: UW-Madison Memorial Union
        setMyLocation([43.0766, -89.4125])
      }
    )
  }, [])

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

    await supabase.from('squad_members').upsert({
      id: guestId,
      username: guestName,
      lat: myLocation[0],
      lng: myLocation[1],
      squad_id: null,
    })

    await fetchNearby()
    setPinging(false)
    setPinged(true)
  }

  const defaultCenter: [number, number] = [43.0766, -89.4125]

  return (
    <div className="relative w-full h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">📡</span>
          <span className="text-white font-bold text-lg">Squad Up</span>
        </div>
        <span className="text-slate-400 text-sm">{guestName}</span>
      </div>

      {/* Map */}
      <div className="flex-1 pt-14">
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
              <Circle
                center={myLocation}
                radius={PING_RADIUS_M}
                pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.08, weight: 1.5, dashArray: '6' }}
              />
              <Marker position={myLocation}>
                <Popup>You ({guestName})</Popup>
              </Marker>
            </>
          )}

          {nearbyUsers
            .filter(u => u.id !== guestId)
            .map(user => (
              <Marker key={user.id} position={[user.lat, user.lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">{user.username}</p>
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
              ? `${nearbyUsers.filter(u => u.id !== guestId).length} people nearby`
              : "Drop a ping to see who's around"}
          </p>
          {pinged && nearbyUsers.filter(u => u.id !== guestId).length > 0 && (
            <span className="text-xs bg-violet-700 text-white px-2 py-0.5 rounded-full">Live</span>
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

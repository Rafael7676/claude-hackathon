import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import MatchScreen from './screens/MatchScreen'
import BroadcastScreen from './screens/BroadcastScreen'
import ChatScreen from './screens/ChatScreen'
import ProfileScreen from './screens/ProfileScreen'
import './index.css'

function getGuestId(): string {
  let id = localStorage.getItem('squad_guest_id')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('squad_guest_id', id) }
  return id
}

function getGuestName(): string {
  let name = localStorage.getItem('squad_guest_name')
  if (!name) {
    const adj = ['Swift', 'Bold', 'Chill', 'Rad', 'Cozy', 'Epic', 'Cool', 'Loud']
    const noun = ['Badger', 'Hawk', 'Fox', 'Bear', 'Wolf', 'Owl', 'Lynx', 'Deer']
    name = adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)]
    localStorage.setItem('squad_guest_name', name)
  }
  return name
}

const guestId = getGuestId()
const guestName = getGuestName()

interface JoinedSquad { id: string; name: string; count: number }

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [joinedSquads, setJoinedSquads] = useState<JoinedSquad[]>([])

  function handleJoinSquad(squad: JoinedSquad) {
    setJoinedSquads(prev => prev.some(s => s.id === squad.id) ? prev : [squad, ...prev])
  }

  return (
    <div style={{ position: 'relative', minHeight: '100svh' }}>
      {tab === 'home' && <HomeScreen username={guestName} onJoin={() => setTab('chat')} />}
      {tab === 'match' && <MatchScreen onSetupChat={() => setTab('chat')} />}
      {tab === 'broadcast' && <BroadcastScreen guestId={guestId} guestName={guestName} myLocation={myLocation} onLocation={setMyLocation} onJoinSquad={handleJoinSquad} />}
      {tab === 'chat' && <ChatScreen onBack={() => setTab('home')} />}
      {tab === 'profile' && <ProfileScreen guestId={guestId} username={guestName} joinedSquads={joinedSquads} />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

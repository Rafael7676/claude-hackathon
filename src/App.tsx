import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import AuthPage from './pages/AuthPage'
import MapPage from './pages/MapPage'
import './index.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/map" replace /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/auth"
          element={session ? <Navigate to="/map" replace /> : <AuthPage />}
        />
        <Route
          path="/map"
          element={session ? <MapPage session={session} /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

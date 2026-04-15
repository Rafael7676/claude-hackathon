import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-3">📡</div>
          <h1 className="text-3xl font-bold text-white">Squad Up</h1>
          <p className="text-slate-400 mt-2">Find your people, right around you</p>
        </div>

        {sent ? (
          <div className="bg-slate-800 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-white font-medium">Check your email</p>
            <p className="text-slate-400 text-sm mt-1">We sent a magic link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@wisc.edu"
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

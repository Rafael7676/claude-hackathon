import { useState } from 'react'

interface Props {
  onBack: () => void
}

function DirectionsSheet({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: '↑', text: 'Head north on Observatory Dr', dist: '0.1 mi' },
    { icon: '←', text: 'Turn left on Langdon St',      dist: '350 ft' },
    { icon: '↑', text: 'Continue past Bascom Hill',    dist: '0.1 mi' },
    { icon: '→', text: 'Turn right toward Memorial Union — Starbucks is on 2nd floor', dist: 'Arrive' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '375px',
        maxWidth: '100%',
        background: 'var(--card-bg)',
        borderRadius: '24px 24px 0 0',
        zIndex: 201,
        paddingBottom: 'calc(var(--nav-height) + 24px)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        animation: 'slideUp 0.28s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }`}</style>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 12px' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Memorial Union Starbucks</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>800 Langdon St, 2nd floor</p>
          </div>
          <button onClick={onClose} style={{ background: '#f0efec', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* ETA bar */}
        <div style={{ display: 'flex', gap: '10px', padding: '0 16px 14px' }}>
          {[
            { label: '4 min', sub: 'walk' },
            { label: '0.3 mi', sub: 'distance' },
            { label: '2nd fl', sub: 'destination' },
          ].map(item => (
            <div key={item.label} style={{ flex: 1, background: 'var(--accent-light)', borderRadius: '12px', padding: '10px 0', textAlign: 'center', border: '0.5px solid var(--accent)' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-dark)' }}>{item.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--accent-dark)', opacity: 0.7, marginTop: '1px' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Mini map */}
        <div style={{ margin: '0 16px 14px', borderRadius: '14px', overflow: 'hidden', border: '0.5px solid var(--border)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 343 160" style={{ display: 'block', width: '100%' }}>
            {/* Sky/ground */}
            <rect width="343" height="160" fill="#f0efe8"/>

            {/* Grid roads */}
            <rect x="0" y="52" width="343" height="14" fill="#e0ddd5"/>
            <rect x="0" y="100" width="343" height="14" fill="#e0ddd5"/>
            <rect x="60" y="0" width="14" height="160" fill="#e0ddd5"/>
            <rect x="160" y="0" width="14" height="160" fill="#e0ddd5"/>
            <rect x="270" y="0" width="14" height="160" fill="#e0ddd5"/>

            {/* Road labels */}
            <text x="95" y="62" fontSize="8" fill="#aaa9a3" fontFamily="sans-serif">Observatory Dr</text>
            <text x="95" y="112" fontSize="8" fill="#aaa9a3" fontFamily="sans-serif">Langdon St</text>
            <text x="62" y="48" fontSize="7" fill="#aaa9a3" fontFamily="sans-serif" writingMode="vertical-rl">Park St</text>

            {/* Buildings (gray blocks) */}
            <rect x="20" y="20" width="38" height="28" rx="3" fill="#d8d6ce"/>
            <rect x="20" y="70" width="38" height="26" rx="3" fill="#d8d6ce"/>
            <rect x="80" y="20" width="76" height="28" rx="3" fill="#d8d6ce"/>
            <rect x="80" y="70" width="76" height="26" rx="3" fill="#d8d6ce"/>
            <rect x="178" y="20" width="86" height="28" rx="3" fill="#d8d6ce"/>
            <rect x="178" y="70" width="52" height="26" rx="3" fill="#d8d6ce"/>
            <rect x="284" y="20" width="50" height="28" rx="3" fill="#d8d6ce"/>
            <rect x="284" y="70" width="50" height="26" rx="3" fill="#d8d6ce"/>
            <rect x="20" y="118" width="38" height="28" rx="3" fill="#d8d6ce"/>
            <rect x="80" y="118" width="76" height="28" rx="3" fill="#d8d6ce"/>
            <rect x="178" y="118" width="52" height="28" rx="3" fill="#d8d6ce"/>
            <rect x="284" y="118" width="50" height="28" rx="3" fill="#d8d6ce"/>

            {/* Destination building (Memorial Union) — highlighted */}
            <rect x="234" y="70" width="32" height="26" rx="3" fill="#b8ead8" stroke="#1d9e75" strokeWidth="1.5"/>
            <text x="238" y="85" fontSize="6.5" fill="#0f6e56" fontFamily="sans-serif" fontWeight="600">M.Union</text>

            {/* Route path */}
            <polyline
              points="90,140 90,107 167,107 167,59 240,59 240,70"
              fill="none"
              stroke="#1d9e75"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="none"
            />

            {/* Route glow */}
            <polyline
              points="90,140 90,107 167,107 167,59 240,59 240,70"
              fill="none"
              stroke="rgba(29,158,117,0.22)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Start pin */}
            <circle cx="90" cy="140" r="7" fill="#7f77dd" stroke="white" strokeWidth="2"/>
            <text x="87" y="144" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="700">A</text>

            {/* End pin */}
            <circle cx="240" cy="70" r="8" fill="#1d9e75" stroke="white" strokeWidth="2"/>
            <text x="237" y="74" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="700">B</text>

            {/* North indicator */}
            <text x="316" y="148" fontSize="9" fill="var(--text-hint)" fontFamily="sans-serif">N ↑</text>
          </svg>
        </div>

        {/* Step-by-step directions */}
        <div style={{ margin: '0 16px 16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Walking directions</p>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '8px 0', borderBottom: i < steps.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent-dark)', flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{s.text}</p>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-hint)', whiteSpace: 'nowrap', paddingTop: '2px' }}>{s.dist}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}

export default function ChatScreen({ onBack }: Props) {
  const [showDirections, setShowDirections] = useState(false)

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + 16px)' }}>
      <div style={{ padding: '12px 24px 4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>9:41</div>

      <div style={{ padding: '8px 24px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth={2} style={{ cursor: 'pointer' }} onClick={onBack}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '12px', background: 'var(--purple-light)', color: '#3c3489' }}>JM</div>
          <div>
            <span style={{ fontWeight: 500, fontSize: '14px' }}>Coffee with Jordan</span>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Memorial Union Starbucks</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderBottomLeftRadius: '4px' }}>
          I set up your coffee chat with Jordan! Here are a few things you two might click on:
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderBottomLeftRadius: '4px' }}>
          <p style={{ fontWeight: 500, marginBottom: '6px' }}>Conversation starters:</p>
          <p style={{ margin: '4px 0' }}>• Jordan just watched a documentary on urban decay — connects to your city planning interest</p>
          <p style={{ margin: '4px 0' }}>• You both follow the same cooking YouTube channel</p>
          <p style={{ margin: '4px 0' }}>• Jordan is curious about CS but intimidated by coding — you could share your journey</p>
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--purple-light)', color: '#3c3489', borderBottomRightRadius: '4px', marginLeft: 'auto' }}>
          That's perfect, the urban decay thing is a great opener
        </div>
        <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5, maxWidth: '85%', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderBottomLeftRadius: '4px' }}>
          Great choice! I'll send Jordan a heads up that you're on your way. Have a great chat!
        </div>
      </div>

      {/* Meeting card with Get Directions */}
      <div style={{ background: 'var(--accent-light)', borderRadius: '16px', margin: '16px 16px 12px', padding: '16px', border: '0.5px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--accent-dark)', fontWeight: 500 }}>Meeting in 15 min</p>
            <p style={{ fontSize: '11px', color: 'var(--accent-dark)', opacity: 0.7 }}>Memorial Union Starbucks, 2nd floor</p>
          </div>
          <button
            onClick={() => setShowDirections(true)}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Get directions
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: '8px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>After your chat</p>
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '16px', border: '0.5px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2}><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /></svg>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500 }}>Rate your connection</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Helps AI improve future matches</p>
          </div>
        </div>
      </div>

      {showDirections && <DirectionsSheet onClose={() => setShowDirections(false)} />}
    </div>
  )
}

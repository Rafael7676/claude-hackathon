interface Props {
  onBack: () => void
}

export default function ChatScreen({ onBack }: Props) {
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

      <div style={{ background: 'var(--accent-light)', borderRadius: '16px', margin: '16px 16px 12px', padding: '16px', border: '0.5px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--accent-dark)', fontWeight: 500 }}>Meeting in 15 min</p>
            <p style={{ fontSize: '11px', color: 'var(--accent-dark)', opacity: 0.7 }}>Memorial Union Starbucks, 2nd floor</p>
          </div>
          <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Get directions</button>
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
    </div>
  )
}

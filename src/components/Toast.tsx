import { useEffect, useState } from 'react'

interface Props {
  message: string
  onDone: () => void
}

export default function Toast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300) }, 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-60px'})`,
      background: '#2c2c2a',
      color: 'white',
      padding: '10px 18px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 500,
      zIndex: 9999,
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      opacity: visible ? 1 : 0,
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      {message}
    </div>
  )
}

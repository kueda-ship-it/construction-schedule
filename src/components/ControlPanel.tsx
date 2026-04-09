import { useCallback } from 'react'

const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

interface Props {
  value: string
  onChange: (dateStr: string) => void
  onOpenSettings: () => void
}

export default function ControlPanel({ value, onChange, onOpenSettings }: Props) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('copy-btn')
      if (!btn) return
      const orig = btn.textContent
      btn.textContent = 'コピー完了'
      setTimeout(() => { if (btn) btn.textContent = orig }, 2000)
    })
  }, [])

  return (
    <div className="no-print" style={{
      background: 'linear-gradient(135deg, #0a1a2e 0%, #0f2440 60%, #162d50 100%)',
      color: '#fff',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
      boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.6)',
        }}>
          工事開始日（1日目）
        </label>
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            padding: '5px 11px',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>
      <button
        onClick={onOpenSettings}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.75)',
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 6,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}
      >
        <IconSettings />
        設定
      </button>
      <button
        id="copy-btn"
        onClick={handleCopy}
        style={{
          background: 'linear-gradient(135deg, #2a5082, #3a6499)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 16px',
          borderRadius: 6,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        ファイルパスをコピー
      </button>
      <button
        onClick={() => window.print()}
        style={{
          marginLeft: 'auto',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.18))',
          border: '1px solid rgba(255,255,255,0.28)',
          color: '#fff',
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 16px',
          borderRadius: 6,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}
      >
        印刷 / PDF出力
      </button>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Bank logos strip — matches the reference design ──────────────────────────

const BANKS = [
  {
    name: 'CHASE',
    color: '#117ACA',
    icon: (
      // Chase octagon shield (simplified)
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 1L25 6V14C25 20.075 20.075 26 14 27C7.925 26 3 20.075 3 14V6L14 1Z" fill="#117ACA"/>
        <rect x="9" y="14" width="5" height="5" fill="white"/>
        <rect x="14" y="9" width="5" height="5" fill="white"/>
        <rect x="9" y="9" width="5" height="5" fill="white" opacity="0.4"/>
        <rect x="14" y="14" width="5" height="5" fill="white" opacity="0.4"/>
      </svg>
    ),
  },
  {
    name: 'BANK OF\nAMERICA',
    color: '#E31837',
    icon: (
      // BofA flag — diagonal stripes
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="4" fill="#E31837"/>
        <line x1="4" y1="24" x2="14" y2="4"  stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <line x1="10" y1="24" x2="20" y2="4" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <line x1="16" y1="24" x2="26" y2="4" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'WELLS\nFARGO',
    color: '#ffffff',
    icon: (
      // Wells Fargo — red box with yellow bar
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="4" fill="#C8102E"/>
        <rect y="20" width="28" height="8" rx="0" fill="#FFCD00"/>
        <text x="14" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">WELLS</text>
        <text x="14" y="23" textAnchor="middle" fill="#C8102E" fontSize="6" fontWeight="bold" fontFamily="sans-serif">FARGO</text>
      </svg>
    ),
  },
  {
    name: 'citi',
    color: '#0066CC',
    icon: (
      // Citi — blue text + red arc
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <text x="14" y="17" textAnchor="middle" fill="#0066CC" fontSize="11" fontWeight="bold" fontFamily="sans-serif" letterSpacing="-0.5">citi</text>
        <path d="M9 8 Q14 4 19 8" stroke="#E31837" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'US BANK',
    color: '#E31837',
    icon: (
      // US Bank — red text logo
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <text x="14" y="13" textAnchor="middle" fill="#E31837" fontSize="9" fontWeight="bold" fontFamily="sans-serif">us</text>
        <text x="14" y="22" textAnchor="middle" fill="#E31837" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">bank.</text>
      </svg>
    ),
  },
  {
    name: 'PNC\nBANK',
    color: '#F58025',
    icon: (
      // PNC — orange chevron
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polygon points="4,8 14,4 24,8 20,20 14,24 8,20" fill="none" stroke="#F58025" strokeWidth="2.5"/>
        <polygon points="10,12 14,10 18,12 16,18 14,20 12,18" fill="#F58025"/>
      </svg>
    ),
  },
]

function BankLogosStrip() {
  return (
    <div
      className="max-w-sm mx-auto rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex items-stretch">
        {BANKS.map((bank, i) => (
          <div key={bank.name} className="flex items-stretch" style={{ flex: 1 }}>
            <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-1 w-full">
              {bank.icon}
              <span
                className="text-center leading-tight font-semibold"
                style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-line' }}
              >
                {bank.name}
              </span>
            </div>
            {i < BANKS.length - 1 && (
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const SCAN_STEPS = [
  'Reading transactions...',
  'Detecting subscriptions...',
  'Analyzing spending habits...',
  'Calculating your leaks...',
  'Building your dashboard...',
]

const LEAKS_PREVIEW = [
  { label: 'Shopping',      amount: '$468/mo', color: '#A78BFA' },
  { label: 'Eating Out',    amount: '$448/mo', color: '#F87171' },
  { label: 'Food Delivery', amount: '$304/mo', color: '#34D399' },
]

// ConnectPage serves two roles:
//   1. Landing (public, prop `scanning` absent) — pitch + CTA → /auth
//   2. Scan flow (protected, prop `scanning` present) — connecting → scanning → dashboard
export default function ConnectPage({ scanning = false }) {
  const navigate = useNavigate()
  const { isAuthed, markScanned } = useAuth()
  // If opened as the scan flow, skip straight to connecting
  const [step, setStep] = useState(scanning ? 'connecting' : 'landing')
  const [progress, setProgress] = useState(0)
  const [scanLabel, setScanLabel] = useState(SCAN_STEPS[0])
  const [scanLeaksVisible, setScanLeaksVisible] = useState(0)

  // Auto-start scan when arriving via /connect route
  useEffect(() => {
    if (scanning) startScan()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Landing CTA — gate behind auth
  function handleCTA() {
    if (!isAuthed) {
      navigate('/auth')
      return
    }
    startScan()
  }

  function startScan() {
    setStep('connecting')
    setTimeout(() => {
      setStep('scanning')
      let stepIdx = 0
      const interval = setInterval(() => {
        stepIdx++
        const prog = Math.min((stepIdx / SCAN_STEPS.length) * 100, 95)
        setProgress(prog)
        setScanLabel(SCAN_STEPS[Math.min(stepIdx, SCAN_STEPS.length - 1)])
        setScanLeaksVisible(Math.ceil((prog / 100) * LEAKS_PREVIEW.length))
        if (stepIdx >= SCAN_STEPS.length) {
          clearInterval(interval)
          setProgress(100)
          markScanned?.()
          setTimeout(() => navigate('/dashboard'), 400)
        }
      }, 600)
    }, 800)
  }

  // ── Connecting state ──────────────────────────────────────────────────────
  if (step === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              boxShadow: '0 0 50px rgba(124,58,237,0.5)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <p className="text-white text-xl font-bold mb-2">Connecting securely</p>
          <p className="text-white/50 text-sm mb-6">Bank-level 256-bit encryption · Read-only</p>
          <button
            onClick={() => navigate('/manual-entry')}
            className="text-white/35 text-xs underline underline-offset-2"
          >
            My bank isn't listed — enter manually
          </button>
        </div>
      </div>
    )
  }

  // ── Scanning state ────────────────────────────────────────────────────────
  if (step === 'scanning') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h2 className="text-white text-2xl font-bold mb-1">Scanning your accounts</h2>
            <p className="text-white/50 text-sm">6 months of transactions</p>
          </div>

          <div className="rounded-full overflow-hidden mb-3" style={{ height: 4, background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
            />
          </div>
          <p className="text-white/40 text-sm text-center mb-8">{scanLabel}</p>

          <div className="space-y-3">
            {LEAKS_PREVIEW.slice(0, scanLeaksVisible).map(leak => (
              <div
                key={leak.label}
                className="glass rounded-2xl px-4 py-3 flex items-center justify-between"
              >
                <span className="text-white/80 text-sm font-medium">{leak.label}</span>
                <span className="font-bold text-sm" style={{ color: leak.color }}>{leak.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Landing ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
          >
            $
          </div>
          <span className="text-white font-bold text-lg tracking-tight">SubDoom</span>
        </div>
        <span className="text-xs text-white/40 glass rounded-full px-3 py-1.5">Free Beta</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6 text-center">

        {/* Stat card */}
        <div className="glass rounded-3xl px-8 py-6 max-w-xs w-full mb-7">
          <p className="text-white/50 text-sm mb-2">On their first scan, most people find</p>
          <p
            className="text-5xl font-black tracking-tight mb-1"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #F472B6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            $200–$600
            <span className="text-2xl">/month</span>
          </p>
          <p className="text-white/40 text-sm">they didn't realize they were spending</p>
        </div>

        {/* Headline */}
        <h1 className="text-white text-[2rem] font-black leading-tight mb-3 max-w-xs">
          You might be leaking money{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #F472B6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            every month
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-white/50 text-base max-w-xs leading-relaxed mb-8">
          We scan your last 6 months and show every subscription, habit, and
          hidden spend. Takes 60 seconds. Free.
        </p>

        {/* Primary CTA */}
        <button
          onClick={handleCTA}
          className="w-full max-w-xs text-white font-bold text-base py-4 rounded-2xl mb-4 transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.45)',
          }}
        >
          Find My Leaks
        </button>

        {/* Trust text */}
        <p className="text-white/35 text-xs mb-8">
          Free · Takes 60 seconds · Read-only access
        </p>
      </main>

      {/* Bank logos strip — inline, no image file needed */}
      <div className="px-4 pb-8">
        <BankLogosStrip />
      </div>

    </div>
  )
}

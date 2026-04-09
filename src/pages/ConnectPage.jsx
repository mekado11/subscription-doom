import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function ConnectPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('landing')
  const [progress, setProgress] = useState(0)
  const [scanLabel, setScanLabel] = useState(SCAN_STEPS[0])
  const [scanLeaksVisible, setScanLeaksVisible] = useState(0)

  function handleDemoConnect() {
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
          <p className="text-white/50 text-sm">Bank-level 256-bit encryption</p>
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
          onClick={handleDemoConnect}
          className="w-full max-w-xs text-white font-bold text-base py-4 rounded-2xl mb-4 transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.45)',
          }}
        >
          Find My Leaks
        </button>

        {/* Trust text */}
        <p className="text-white/35 text-xs mb-2">
          Secured by Plaid · Read-only · No data selling
        </p>

        {/* Manual entry fallback */}
        <button
          onClick={() => navigate('/manual-entry')}
          className="text-white/40 text-xs underline underline-offset-2 mb-8"
        >
          My bank isn't listed — enter manually
        </button>
      </main>

      {/* Bank logos banner — drop banks.png into public/ folder */}
      <div className="px-4 pb-8">
        <img
          src="/banks.png"
          alt="Works with Chase, Bank of America, Wells Fargo, Citi, US Bank, PNC and more"
          className="w-full max-w-sm mx-auto block rounded-2xl"
          style={{ opacity: 0.9 }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </div>

    </div>
  )
}

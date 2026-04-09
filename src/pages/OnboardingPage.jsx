import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GRAD     = 'linear-gradient(135deg, #7C3AED, #EC4899)'
const GRAD_TXT = 'linear-gradient(135deg, #A78BFA, #F472B6)'

const TRACK_OPTIONS = [
  { id: 'subscriptions', label: 'Subscriptions',   desc: 'Netflix, Spotify, Adobe…',    color: '#A78BFA' },
  { id: 'eating',        label: 'Eating Out',       desc: 'Restaurants, takeout, bars',  color: '#F87171' },
  { id: 'delivery',      label: 'Food Delivery',    desc: 'DoorDash, Uber Eats…',        color: '#34D399' },
  { id: 'coffee',        label: 'Coffee',           desc: 'Daily Starbucks habit',       color: '#FBBF24' },
  { id: 'shopping',      label: 'Shopping',         desc: 'Amazon, Zara, impulse buys',  color: '#60A5FA' },
  { id: 'rideshare',     label: 'Rideshare',        desc: 'Uber, Lyft, taxis',           color: '#F97316' },
  { id: 'travel',        label: 'Travel & Hotels',  desc: 'Flights, Airbnb, hotels',     color: '#818CF8' },
  { id: 'alcohol',       label: 'Alcohol',          desc: 'Bars, delivery, bottle shops', color: '#C084FC' },
]

function ProgressDots({ total, current }) {
  return (
    <div className="flex gap-1.5 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i <= current
              ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
              : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  )
}

// Step 1: Welcome
function StepWelcome({ onNext }) {
  return (
    <div className="flex flex-col items-center text-center px-6 pt-12 pb-8">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-white text-3xl mb-6"
        style={{ background: GRAD, boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}
      >
        $
      </div>
      <h1 className="text-white text-3xl font-black leading-tight mb-3">
        Time to face<br />
        <span style={{ background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          your money doom
        </span>
      </h1>
      <p className="text-white/50 text-base leading-relaxed mb-6 max-w-xs">
        We'll scan your spending, expose every leak, and show you exactly where your money disappears.
      </p>

      {/* Stat card */}
      <div className="glass rounded-2xl px-6 py-5 w-full max-w-xs mb-8">
        <p className="text-white/40 text-xs mb-1">Average person finds</p>
        <p className="font-black text-4xl" style={{ background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          $340/mo
        </p>
        <p className="text-white/40 text-xs mt-1">they had no idea they were spending</p>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-xs text-white font-bold text-base py-4 rounded-2xl transition-transform active:scale-95"
        style={{ background: GRAD, boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}
      >
        Let's Go →
      </button>
    </div>
  )
}

// Step 2: What to track
function StepTrack({ selected, setSelected, onNext, onBack }) {
  function toggle(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="px-4">
      <h2 className="text-white text-2xl font-black mb-1 text-center">What do you spend on?</h2>
      <p className="text-white/40 text-sm text-center mb-6">Select all that apply — we'll focus your report</p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {TRACK_OPTIONS.map(opt => {
          const on = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className="text-left p-3.5 rounded-2xl transition-all"
              style={{
                background: on ? `${opt.color}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? opt.color + '50' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-white text-sm font-semibold">{opt.label}</p>
                {on && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: opt.color }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs">{opt.desc}</p>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="py-4 px-5 rounded-2xl text-white/50 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          ←
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-sm transition-all active:scale-95"
          style={{ background: GRAD, opacity: selected.length > 0 ? 1 : 0.4, boxShadow: '0 6px 24px rgba(124,58,237,0.4)' }}
        >
          Continue ({selected.length} selected)
        </button>
      </div>
    </div>
  )
}

// Step 3: Budget goal
function StepBudget({ budget, setBudget, onNext, onBack }) {
  return (
    <div className="px-4">
      <h2 className="text-white text-2xl font-black mb-1 text-center">Set your budget goal</h2>
      <p className="text-white/40 text-sm text-center mb-8">We'll alert you when you're creeping over</p>

      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white text-sm">Monthly spending limit</p>
          <span className="font-black text-2xl" style={{ background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ${budget.toLocaleString()}
          </span>
        </div>
        <input
          type="range" min={500} max={5000} step={100}
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className="w-full accent-violet-500 mb-2"
        />
        <div className="flex justify-between text-white/30 text-xs">
          <span>$500</span><span>$5,000</span>
        </div>
      </div>

      {/* Context hints */}
      <div className="space-y-2 mb-6">
        {[
          { range: [500, 1200],  label: 'Very tight — you track every dollar', color: '#34D399' },
          { range: [1200, 2500], label: 'Moderate — room for some fun', color: '#FBBF24' },
          { range: [2500, 5000], label: 'Generous — watch for creeping habits', color: '#F97316' },
        ].map(hint => {
          const active = budget >= hint.range[0] && budget < hint.range[1]
          return (
            <div key={hint.label} className="flex items-center gap-2 px-1">
              <span className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: active ? hint.color : 'rgba(255,255,255,0.12)' }} />
              <p className="text-xs transition-all" style={{ color: active ? hint.color : 'rgba(255,255,255,0.25)' }}>{hint.label}</p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="py-4 px-5 rounded-2xl text-white/50 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)' }}>←</button>
        <button onClick={onNext}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-sm transition-transform active:scale-95"
          style={{ background: GRAD, boxShadow: '0 6px 24px rgba(124,58,237,0.4)' }}>
          Set Budget →
        </button>
      </div>
    </div>
  )
}

// Step 4: Connect / Start
function StepConnect({ onDemo, onUpload, onBack }) {
  return (
    <div className="px-4">
      <h2 className="text-white text-2xl font-black mb-1 text-center">How do we get your data?</h2>
      <p className="text-white/40 text-sm text-center mb-8">Choose how you want to start</p>

      <div className="space-y-3 mb-8">
        {/* Bank connect - coming soon */}
        <div className="glass rounded-2xl p-4 opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.12)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">Connect your bank</p>
              <p className="text-white/40 text-xs">Instant, read-only via Plaid</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
              Soon
            </span>
          </div>
        </div>

        {/* Upload statement */}
        <button onClick={onUpload}
          className="glass rounded-2xl p-4 w-full text-left transition-all hover:bg-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(96,165,250,0.12)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Upload bank statement</p>
              <p className="text-white/40 text-xs">CSV, PDF, or OFX from your bank</p>
            </div>
          </div>
        </button>

        {/* Demo */}
        <button onClick={onDemo}
          className="rounded-2xl p-4 w-full text-left transition-all"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(167,139,250,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Try with demo data</p>
              <p className="text-white/40 text-xs">See exactly what SubDoom shows — instant</p>
            </div>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="w-full py-3 rounded-2xl text-white/40 text-sm font-semibold"
        style={{ background: 'rgba(255,255,255,0.04)' }}>← Back</button>
    </div>
  )
}

// ── Main Onboarding ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { markScanned } = useAuth()

  const [step, setStep] = useState(0)
  const [tracking, setTracking] = useState(['subscriptions', 'eating', 'shopping'])
  const [budget, setBudget] = useState(2000)

  function goNext() { setStep(s => s + 1) }
  function goBack() { setStep(s => s - 1) }

  function handleDemo() {
    markScanned?.()
    navigate('/connect')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-white text-xs"
            style={{ background: GRAD }}>$</div>
          <span className="text-white font-bold">SubDoom</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-white/30 text-xs hover:text-white/60 transition-colors">
          Skip →
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        <ProgressDots total={4} current={step} />

        {step === 0 && <StepWelcome onNext={goNext} />}
        {step === 1 && <StepTrack selected={tracking} setSelected={setTracking} onNext={goNext} onBack={goBack} />}
        {step === 2 && <StepBudget budget={budget} setBudget={setBudget} onNext={goNext} onBack={goBack} />}
        {step === 3 && (
          <StepConnect
            onDemo={handleDemo}
            onUpload={() => navigate('/manual-entry')}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  )
}

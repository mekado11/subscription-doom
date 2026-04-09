import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const GRAD     = 'linear-gradient(135deg, #7C3AED, #EC4899)'
const GRAD_TXT = 'linear-gradient(135deg, #A78BFA, #F472B6)'

const FREE_FEATURES = [
  'Spending overview & top leaks',
  'Subscription tracker',
  'Cancel guides (manual)',
  'What If calculator',
  '6-month history',
]

const PRO_FEATURES = [
  { text: 'Everything in Free', highlight: false },
  { text: 'Real-time spending alerts', highlight: true },
  { text: 'Auto-cancel subscriptions', highlight: true },
  { text: '12-month history', highlight: true },
  { text: 'Export CSV & PDF reports', highlight: true },
  { text: 'Doom Score tracking over time', highlight: true },
  { text: 'Friend comparisons (opt-in)', highlight: true },
  { text: 'Priority support', highlight: false },
]

function Check({ color = '#A78BFA' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function X() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function SubscribePage() {
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly') // 'monthly' | 'yearly'
  const [loading, setLoading] = useState(false)

  const price = billing === 'yearly' ? 3.99 : 4.99
  const savings = billing === 'yearly' ? 'Save $12/year' : null

  function handleSubscribe() {
    setLoading(true)
    // TODO: Integrate Stripe / payment provider
    setTimeout(() => {
      setLoading(false)
      alert('Payment integration coming soon! You\'ll be first to know when Pro launches.')
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="text-white/40 text-sm flex items-center gap-1 hover:text-white/70 transition-colors">
          ← Back
        </button>
        <span className="text-white font-bold">Upgrade to Pro</span>
        <div className="w-12" />
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-4"
            style={{ background: GRAD, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}>
            ✦
          </div>
          <h1 className="text-white text-2xl font-black mb-2">SubDoom Pro</h1>
          <p className="text-white/50 text-sm">Stop tracking manually. Let us handle the cancellations.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 mb-6">
          <div className="glass rounded-2xl p-1 flex gap-1">
            {[
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly',  label: 'Yearly' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setBilling(opt.id)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: billing === opt.id ? GRAD : 'transparent',
                  color: billing === opt.id ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {savings && (
            <span className="text-xs px-2 py-1 rounded-full ml-2 font-bold"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}>
              {savings}
            </span>
          )}
        </div>

        {/* Price card */}
        <div className="rounded-3xl p-6 mb-6 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))', border: '1px solid rgba(167,139,250,0.3)' }}>
          <p className="text-white/50 text-sm mb-2">SubDoom Pro</p>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-white font-black text-5xl">${price}</span>
            <span className="text-white/40 text-base">/mo</span>
          </div>
          {billing === 'yearly' && (
            <p className="text-white/40 text-xs mb-1">Billed ${(price * 12).toFixed(0)}/year</p>
          )}
          <p className="text-white/40 text-xs">Cancel anytime</p>
        </div>

        {/* Pro features */}
        <div className="glass rounded-2xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-white font-bold text-sm">What you get</p>
          </div>
          {PRO_FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <Check color={f.highlight ? '#A78BFA' : 'rgba(255,255,255,0.3)'} />
              <span className={`text-sm ${f.highlight ? 'text-white' : 'text-white/50'}`}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Free vs Pro comparison */}
        <div className="glass rounded-2xl overflow-hidden mb-6">
          <div className="grid grid-cols-3 text-center">
            <div className="py-3 border-b border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-white/40 text-xs font-semibold">Feature</p>
            </div>
            <div className="py-3 border-b border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-white/40 text-xs font-semibold">Free</p>
            </div>
            <div className="py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="font-semibold text-xs" style={{ background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro</p>
            </div>
          </div>
          {[
            ['Spending overview',    true,  true ],
            ['Subscription tracker', true,  true ],
            ['Cancel guide',         true,  true ],
            ['Auto-cancel',          false, true ],
            ['Real-time alerts',     false, true ],
            ['12-month history',     false, true ],
            ['Export reports',       false, true ],
            ['Friend compare',       false, true ],
          ].map(([label, free, pro]) => (
            <div key={label} className="grid grid-cols-3 text-center border-b last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="py-3 border-r flex items-center px-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-white/60 text-xs text-left">{label}</p>
              </div>
              <div className="py-3 border-r flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {free ? <Check color="rgba(255,255,255,0.35)" /> : <X />}
              </div>
              <div className="py-3 flex items-center justify-center">
                {pro ? <Check color="#A78BFA" /> : <X />}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full text-white font-bold text-base py-4 rounded-2xl mb-4 transition-all active:scale-95"
          style={{ background: GRAD, boxShadow: '0 8px 32px rgba(124,58,237,0.45)', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Processing…' : `Start Pro — $${price}/mo`}
        </button>
        <p className="text-white/25 text-xs text-center mb-2">Cancel anytime · No surprise charges</p>

        {/* Testimonial */}
        <div className="glass rounded-2xl p-4 mt-4">
          <p className="text-white/70 text-sm italic leading-relaxed mb-3">
            "Found $280/mo in subscriptions I forgot about. The auto-cancel handled Netflix and Adobe in 2 minutes. Worth every cent."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
              style={{ background: GRAD }}>J</div>
            <div>
              <p className="text-white text-xs font-semibold">Jordan M.</p>
              <p className="text-white/40 text-xs">Pro subscriber</p>
            </div>
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateMockTransactions } from '../utils/mockTransactions'
import { analyzeTransactions } from '../utils/analyzer'
import { futureValue, formatCurrency } from '../utils/calculator'
import { CategoryIcon, BrandAvatar } from '../components/Icons'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  return '$' + Math.round(n).toLocaleString()
}
function fmtCompact(n) {
  return n >= 1000 ? '$' + Math.round(n / 1000) + 'k' : '$' + Math.round(n)
}

const GRAD = 'linear-gradient(135deg, #A78BFA, #F472B6)'
const GRAD_CTA = 'linear-gradient(135deg, #7C3AED, #EC4899)'

// ── Icon resolver — works for both subscriptions and habits ───────────────────

function ItemIcon({ item, size = 40 }) {
  if (item.type === 'subscription') {
    return <BrandAvatar letter={item.letter} color={item.color} size={size} />
  }
  return <CategoryIcon category={item.category} color={item.color} size={size} />
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LeakCard({ item }) {
  const fv10 = futureValue(item.monthlyAvg, 10)
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <ItemIcon item={item} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {item.label ?? item.merchant}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {item.type === 'subscription' ? 'Subscription' : 'Habit spending'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold text-sm">
            <span className="text-violet-400">{fmt(item.monthlyAvg)}</span>
            <span className="text-white/40 text-xs">/mo</span>
          </p>
          <p className="text-white/40 text-xs">– {fmtCompact(item.yearlyTotal)}/yr</p>
        </div>
      </div>
      {/* Investment projection pill */}
      <div
        className="rounded-xl px-3 py-2 flex items-center gap-1.5"
        style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}
      >
        <span className="text-emerald-400 text-xs">→</span>
        <span className="text-emerald-400 font-bold text-sm">{fmtCompact(fv10)}</span>
        <span className="text-white/35 text-xs">if invested over 10 years</span>
      </div>
    </div>
  )
}

function SubscriptionRow({ sub }) {
  return (
    <div
      className="flex items-center gap-3 py-3.5 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <BrandAvatar letter={sub.letter} color={sub.color} size={36} />
      <span className="text-white text-sm flex-1">{sub.merchant}</span>
      <div className="text-right">
        <span className="text-white font-semibold text-sm">{fmt(sub.monthlyAvg)}</span>
        <span className="text-white/40 text-xs">/mo</span>
      </div>
    </div>
  )
}

function HabitBar({ habit, maxAmount }) {
  const pct = Math.round((habit.monthlyAvg / maxAmount) * 100)
  return (
    <div
      className="py-3.5 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <CategoryIcon category={habit.category} color={habit.color} size={32} />
          <span className="text-white text-sm">{habit.label}</span>
        </div>
        <span className="font-bold text-sm" style={{ color: habit.color }}>
          {fmt(habit.monthlyAvg)}/mo
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${habit.color}66, ${habit.color})`,
          }}
        />
      </div>
    </div>
  )
}

function WhatIfRow({ habit, enabled, onToggle }) {
  const s5 = futureValue(habit.monthlyAvg, 5)
  const s10 = futureValue(habit.monthlyAvg, 10)
  return (
    <div
      className="py-3.5 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(habit.category)}
          className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
          style={{
            background: enabled ? GRAD_CTA : 'rgba(255,255,255,0.06)',
            border: enabled ? 'none' : '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {enabled && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">{habit.label}</span>
            <span className="text-white/40 text-xs">{fmt(habit.monthlyAvg)}/mo</span>
          </div>
          {enabled && (
            <div className="flex gap-3 mt-1">
              <span className="text-emerald-400 text-xs">
                → <strong>{fmtCompact(s5)}</strong> in 5yr
              </span>
              <span className="text-emerald-400 text-xs">
                → <strong>{fmtCompact(s10)}</strong> in 10yr
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()

  const analysis = useMemo(() => {
    const txns = generateMockTransactions()
    return analyzeTransactions(txns)
  }, [])

  const { subscriptions, habits, topLeaks, summary } = analysis

  const [enabledHabits, setEnabledHabits] = useState(
    new Set(habits.map(h => h.category))
  )

  function toggleHabit(category) {
    setEnabledHabits(prev => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  const maxHabitAmount = Math.max(...habits.map(h => h.monthlyAvg), 1)
  const activeHabits = habits.filter(h => enabledHabits.has(h.category))
  const whatIfMonthly = activeHabits.reduce((s, h) => s + h.monthlyAvg, 0)
  const whatIfFv10 = futureValue(whatIfMonthly, 10)

  return (
    <div className="min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-white/40 text-sm flex items-center gap-1 transition-colors hover:text-white/70"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-white text-xs"
            style={{ background: GRAD_CTA }}
          >
            $
          </div>
          <span className="text-white font-bold text-base">SubDoom</span>
        </div>
        {/* Settings icon → Profile */}
        <button onClick={() => navigate('/profile')} className="text-white/40 hover:text-white/70 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </header>

      {/* ── Hero total ─────────────────────────────────────────────── */}
      <div
        className="px-6 py-10 text-center"
        style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.18) 0%, transparent 100%)' }}
      >
        <p className="text-white/50 text-sm mb-2 tracking-wide uppercase text-xs">Leaving your account</p>
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <h1 className="text-6xl font-black text-white tracking-tight">
            {fmt(summary.totalMonthly)}
          </h1>
          <span className="text-violet-400 text-xl font-semibold">/ mo</span>
        </div>
        <p className="text-white/50 text-base">
          <span
            className="font-black text-2xl"
            style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {fmt(summary.totalYearly)}
          </span>
          {' '}per year
        </p>
      </div>

      <div className="px-4 pb-6 max-w-lg mx-auto space-y-8">

        {/* ── TOP LEAKS ────────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-white font-bold text-base">Your Top Leaks</h2>
            <p className="text-white/40 text-xs mt-0.5">Where the money actually goes</p>
          </div>
          <div className="space-y-3">
            {topLeaks.map(item => (
              <LeakCard key={item.merchant ?? item.category} item={item} />
            ))}
          </div>
        </section>

        {/* ── SUBSCRIPTIONS ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-bold text-base">Subscriptions</h2>
            <span className="text-white/40 text-xs">{fmt(summary.subMonthly)}/mo</span>
          </div>
          <p className="text-white/40 text-xs mb-4">
            {formatCurrency(summary.subMonthly * 12)} quietly leaving every year
          </p>
          <div className="glass rounded-2xl px-4">
            {subscriptions.map(sub => (
              <SubscriptionRow key={sub.merchant} sub={sub} />
            ))}
          </div>
        </section>

        {/* ── HABITS ───────────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-white font-bold text-base">Spending Habits</h2>
            <p className="text-white/40 text-xs mt-0.5">This is where it really adds up</p>
          </div>
          <div className="glass rounded-2xl px-4">
            {habits.map(h => (
              <HabitBar key={h.category} habit={h} maxAmount={maxHabitAmount} />
            ))}
          </div>
        </section>

        {/* ── INVESTMENT IMPACT ─────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-white font-bold text-base">Investment Impact</h2>
            <p className="text-white/40 text-xs mt-0.5">If this money worked for you instead</p>
          </div>
          <div className="space-y-3">
            {habits.slice(0, 4).map(h => {
              const fv10 = futureValue(h.monthlyAvg, 10)
              return (
                <div key={h.category} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon category={h.category} color={h.color} size={32} />
                      <span className="text-white text-sm font-semibold">{h.label}</span>
                    </div>
                    <span className="text-white/40 text-xs">{fmt(h.monthlyAvg)}/mo</span>
                  </div>
                  <p className="text-white/35 text-xs mb-3 ml-10">{fmt(h.yearlyTotal)}/yr</p>
                  <div
                    className="rounded-xl px-3.5 py-3"
                    style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}
                  >
                    <p className="text-white/40 text-xs mb-0.5">Invested at 7% for 10 years</p>
                    <p className="text-emerald-400 font-black text-2xl">→ {fmtCompact(fv10)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── WHAT IF ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-base">What If</h2>
              <p className="text-white/40 text-xs mt-0.5">Toggle habits to see your savings</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">You keep</p>
              <p
                className="font-black text-sm"
                style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {fmt(whatIfMonthly)}/mo
              </p>
            </div>
          </div>
          <div className="glass rounded-2xl px-4 mb-4">
            {habits.map(h => (
              <WhatIfRow
                key={h.category}
                habit={h}
                enabled={enabledHabits.has(h.category)}
                onToggle={toggleHabit}
              />
            ))}
          </div>
          {activeHabits.length > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}
            >
              <p className="text-emerald-400 font-semibold text-sm mb-1">
                You'd keep {fmt(whatIfMonthly)}/month
              </p>
              <p className="text-white/50 text-sm mb-2">
                → {fmt(whatIfMonthly * 12)}/year freed up
              </p>
              <p className="text-white font-black text-2xl">
                → {fmtCompact(whatIfFv10)}
                <span className="text-white/40 font-normal text-sm"> in 10 years at 7%</span>
              </p>
            </div>
          )}
        </section>

        {/* ── FOOTER CTA ────────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-white/40 text-xs mb-2">Want alerts when spending spikes?</p>
          <h3 className="text-white font-black text-xl mb-1">Upgrade to Doom Pro</h3>
          <p className="text-white/50 text-sm mb-5 leading-relaxed">
            Real-time alerts · Export reports · Deep insights · 12-month history
          </p>
          <button
            className="w-full text-white font-bold py-4 rounded-2xl text-sm transition-transform active:scale-95"
            style={{
              background: GRAD_CTA,
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            }}
          >
            Start Free Trial
          </button>
          <p className="text-white/25 text-xs mt-3">Cancel anytime. No doom surprises.</p>
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}

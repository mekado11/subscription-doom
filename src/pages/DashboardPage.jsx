import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts'
import { generateMockTransactions } from '../utils/mockTransactions'
import { analyzeTransactions } from '../utils/analyzer'
import { futureValue, formatCurrency } from '../utils/calculator'
import { CategoryIcon, BrandAvatar } from '../components/Icons'
import BottomNav from '../components/BottomNav'

const GRAD    = 'linear-gradient(135deg, #A78BFA, #F472B6)'
const GRAD_CTA = 'linear-gradient(135deg, #7C3AED, #EC4899)'

function fmt(n)       { return '$' + Math.round(n).toLocaleString() }
function fmtCompact(n){ return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + Math.round(n) }

// ── Doom Score ring gauge ─────────────────────────────────────────────────────

const DOOM_COLORS = {
  chill:    '#34D399',
  moderate: '#FBBF24',
  high:     '#F97316',
  critical: '#F87171',
}

function doomLabel(score) {
  if (score > 75) return { text: 'Financially Chill', color: DOOM_COLORS.chill }
  if (score > 50) return { text: 'Moderate Doom',     color: DOOM_COLORS.moderate }
  if (score > 25) return { text: 'High Doom',          color: DOOM_COLORS.high }
  return             { text: 'Critical Doom',           color: DOOM_COLORS.critical }
}

function DoomRing({ score }) {
  const R   = 46
  const size = 120
  const circ = 2 * Math.PI * R
  const scoreArc = (score / 100) * circ
  const { text, color } = doomLabel(score)
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9"/>
        <circle
          cx={size/2} cy={size/2} r={R}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${scoreArc} ${circ - scoreArc}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}
        />
        <text x={size/2} y={size/2 + 7} textAnchor="middle" fill="white" fontSize="24" fontWeight="900">{score}</text>
        <text x={size/2} y={size/2 + 20} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">/ 100</text>
      </svg>
      <p className="text-xs font-bold mt-2" style={{ color }}>{text}</p>
    </div>
  )
}

// ── Cancel Guide modal ────────────────────────────────────────────────────────

function CancelModal({ sub, onClose, onUpgrade }) {
  const info = sub.cancelInfo
  const difficultyColor = { Easy: '#34D399', Medium: '#FBBF24', Hard: '#F87171' }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-24 pt-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}>
      <div className="glass rounded-3xl w-full max-w-sm overflow-auto max-h-full">
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 mb-1">
            <BrandAvatar letter={sub.letter} color={sub.color} size={40} />
            <div className="flex-1">
              <p className="text-white font-bold text-base">{sub.merchant}</p>
              <p className="text-white/40 text-xs">{fmt(sub.monthlyAvg)}/mo · {fmt(sub.yearlyTotal)}/yr</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {info && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${difficultyColor[info.difficulty]}20`, color: difficultyColor[info.difficulty] }}>
                {info.difficulty} to cancel
              </span>
            </div>
          )}
        </div>

        {info ? (
          <div className="p-5">
            {info.warning && (
              <div className="rounded-xl px-3 py-2 mb-4 flex items-start gap-2"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <span className="text-amber-400 text-xs mt-0.5">⚠</span>
                <p className="text-amber-300 text-xs">{info.warning}</p>
              </div>
            )}
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">How to cancel</p>
            <ol className="space-y-3 mb-5">
              {info.steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>{i + 1}</span>
                  <p className="text-white/70 text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
            <button
              onClick={onUpgrade}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-transform active:scale-95"
              style={{ background: GRAD_CTA, boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
            >
              Auto-Cancel with Pro — $4.99/mo
            </button>
            <p className="text-white/25 text-xs text-center mt-2">We'll handle the whole cancellation for you</p>
          </div>
        ) : (
          <div className="p-5 text-center">
            <p className="text-white/50 text-sm mb-4">We don't have cancel steps for this service yet.</p>
            <button onClick={onClose} className="text-white/40 text-sm underline">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({ analysis }) {
  const { subscriptions, habits, summary, doomScore } = analysis
  const [activeIndex, setActiveIndex] = useState(null)

  const pieData = useMemo(() => {
    const subs = { name: 'Subscriptions', value: summary.subMonthly, color: '#A78BFA' }
    const habitSlices = habits.map(h => ({ name: h.label, value: h.monthlyAvg, color: h.color }))
    return [subs, ...habitSlices].filter(d => d.value > 0)
  }, [subscriptions, habits, summary])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div className="glass rounded-xl px-3 py-2">
        <p className="text-white text-xs font-bold">{d.name}</p>
        <p className="text-white/60 text-xs">{fmt(d.value)}/mo</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Doom Score + Pie split */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <DoomRing score={doomScore} />
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={true}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      stroke="transparent"
                      opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-white/50 text-xs">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Monthly total',    value: fmt(summary.totalMonthly),  sub: fmt(summary.totalYearly) + '/yr',    color: '#A78BFA' },
          { label: 'Subscriptions',    value: fmt(summary.subMonthly),    sub: subscriptions.length + ' active',    color: '#F472B6' },
          { label: 'Habits',           value: fmt(summary.habitMonthly),  sub: habits.length + ' categories',       color: '#F97316' },
          { label: 'Biggest leak',     value: fmt(analysis.topLeaks[0]?.monthlyAvg ?? 0), sub: analysis.topLeaks[0]?.label ?? analysis.topLeaks[0]?.merchant ?? '—', color: '#F87171' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-4">
            <p className="text-white/40 text-xs mb-1">{stat.label}</p>
            <p className="font-black text-xl text-white">{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: stat.color }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Top leaks */}
      <div>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2 px-1">Top Leaks</p>
        <div className="glass rounded-2xl overflow-hidden">
          {analysis.topLeaks.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {item.type === 'subscription'
                ? <BrandAvatar letter={item.letter} color={item.color} size={36} />
                : <CategoryIcon category={item.category} color={item.color} size={36} />}
              <span className="text-white text-sm flex-1">{item.label ?? item.merchant}</span>
              <div className="text-right">
                <p className="text-white font-bold text-sm">{fmt(item.monthlyAvg)}<span className="text-white/40 font-normal text-xs">/mo</span></p>
                <p className="text-white/30 text-xs">{fmtCompact(item.yearlyTotal)}/yr</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Habits ───────────────────────────────────────────────────────────────

const HEALTH_META = {
  okay:     { label: 'Worth it',      color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  watch:    { label: 'Adds up',       color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  creeping: { label: 'Creeping up',   color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  bleeding: { label: 'Bleeding',      color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
}

function HabitsTab({ habits }) {
  const radarData = habits.map(h => ({
    category: h.label.length > 8 ? h.label.slice(0, 7) + '…' : h.label,
    value: Math.min(100, Math.round((h.monthlyAvg / (h.benchmark * 2)) * 100)),
    fullMark: 100,
  }))

  const groups = {
    okay:     habits.filter(h => h.health === 'okay'),
    watch:    habits.filter(h => h.health === 'watch'),
    creeping: habits.filter(h => h.health === 'creeping'),
    bleeding: habits.filter(h => h.health === 'bleeding'),
  }

  return (
    <div className="space-y-5">
      {/* Radar chart */}
      <div className="glass rounded-2xl p-4">
        <p className="text-white font-bold text-sm mb-3">Spending Profile</p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
            />
            <Radar
              name="Spending"
              dataKey="value"
              stroke="#A78BFA"
              fill="#A78BFA"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <p className="text-white/30 text-xs text-center mt-1">Higher = further over healthy benchmark</p>
      </div>

      {/* Categories grouped by health */}
      {Object.entries(groups).map(([health, items]) => {
        if (!items.length) return null
        const meta = HEALTH_META[health]
        return (
          <div key={health}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{meta.label}</p>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              {items.map(h => {
                const pct = Math.min(100, Math.round((h.monthlyAvg / (h.benchmark * 1.5)) * 100))
                const overBudget = h.monthlyAvg > h.benchmark
                return (
                  <div key={h.category} className="px-4 py-3.5 border-b last:border-0"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={h.category} color={h.color} size={32} />
                        <div>
                          <p className="text-white text-sm font-medium">{h.label}</p>
                          <p className="text-xs" style={{ color: overBudget ? meta.color : 'rgba(255,255,255,0.3)' }}>
                            {overBudget ? `+${fmt(h.monthlyAvg - h.benchmark)} over budget` : `${fmt(h.benchmark)} budget`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{fmt(h.monthlyAvg)}<span className="text-white/40 font-normal text-xs">/mo</span></p>
                        <p className="text-white/30 text-xs">{h.monthlyTxnCount}×/mo</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${h.color}88, ${h.color})` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Tab: Subscriptions ────────────────────────────────────────────────────────

function SubsTab({ subscriptions, onNavigate }) {
  const [cancelSub, setCancelSub] = useState(null)

  return (
    <div className="space-y-5">
      {cancelSub && (
        <CancelModal
          sub={cancelSub}
          onClose={() => setCancelSub(null)}
          onUpgrade={() => { setCancelSub(null); onNavigate('/subscribe') }}
        />
      )}

      <div className="glass rounded-2xl overflow-hidden">
        {subscriptions.map(sub => (
          <div key={sub.merchant} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <BrandAvatar letter={sub.letter} color={sub.color} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{sub.merchant}</p>
              <p className="text-white/40 text-xs mt-0.5">Recurring · every month</p>
            </div>
            <div className="text-right mr-3">
              <p className="text-white font-bold text-sm">{fmt(sub.monthlyAvg)}</p>
              <p className="text-white/30 text-xs">{fmtCompact(sub.yearlyTotal)}/yr</p>
            </div>
            <button
              onClick={() => setCancelSub(sub)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all active:scale-95"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              Cancel
            </button>
          </div>
        ))}
      </div>

      {/* Annual cost summary */}
      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs">Annual subscription cost</p>
          <p className="text-white font-black text-2xl mt-0.5">
            {fmt(subscriptions.reduce((s, x) => s + x.yearlyTotal, 0))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs">Active subs</p>
          <p className="font-black text-3xl" style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {subscriptions.length}
          </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate('/subscribe')}
        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-transform active:scale-95"
        style={{ background: GRAD_CTA, boxShadow: '0 6px 24px rgba(124,58,237,0.35)' }}
      >
        Auto-Cancel with Pro — $4.99/mo
      </button>
    </div>
  )
}

// ── Tab: What If ──────────────────────────────────────────────────────────────

function WhatIfTab({ habits }) {
  const [enabled, setEnabled] = useState(new Set(habits.map(h => h.category)))

  function toggle(cat) {
    setEnabled(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const active = habits.filter(h => enabled.has(h.category))
  const monthly = active.reduce((s, h) => s + h.monthlyAvg, 0)
  const fv10 = futureValue(monthly, 10)

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4">
        <p className="text-white font-bold text-sm mb-1">What if you cut these habits?</p>
        <p className="text-white/40 text-xs mb-4">Toggle spending categories to see investment potential</p>
        <div className="space-y-0">
          {habits.map(h => {
            const on = enabled.has(h.category)
            const s5 = futureValue(h.monthlyAvg, 5)
            const s10 = futureValue(h.monthlyAvg, 10)
            return (
              <div key={h.category} className="py-3.5 border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(h.category)}
                    className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                    style={{ background: on ? GRAD_CTA : 'rgba(255,255,255,0.06)', border: on ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>
                    {on && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{h.label}</span>
                      <span className="text-white/40 text-xs">{fmt(h.monthlyAvg)}/mo</span>
                    </div>
                    {on && (
                      <div className="flex gap-3 mt-1">
                        <span className="text-emerald-400 text-xs">→ <strong>{fmtCompact(s5)}</strong> in 5yr</span>
                        <span className="text-emerald-400 text-xs">→ <strong>{fmtCompact(s10)}</strong> in 10yr</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {active.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}>
          <p className="text-emerald-400 font-semibold text-sm mb-1">You'd keep {fmt(monthly)}/month</p>
          <p className="text-white/50 text-sm mb-3">{fmt(monthly * 12)}/year freed up</p>
          <p className="text-emerald-400 font-black text-3xl">
            → {fmtCompact(fv10)}
            <span className="text-white/40 font-normal text-sm"> in 10yr at 7%</span>
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'habits',         label: 'Habits' },
  { id: 'subscriptions',  label: 'Subs' },
  { id: 'whatif',         label: 'What If' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const analysis = useMemo(() => {
    const txns = generateMockTransactions()
    return analyzeTransactions(txns)
  }, [])

  const { subscriptions, habits, summary, doomScore } = analysis
  const { text: doomText, color: doomColor } = doomLabel(doomScore)

  return (
    <div className="min-h-screen">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-white text-xs"
            style={{ background: GRAD_CTA }}>$</div>
          <span className="text-white font-bold text-base">SubDoom</span>
        </div>
        <button onClick={() => navigate('/subscribe')}
          className="relative flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7C3AED22, #EC489922)', border: '1px solid rgba(167,139,250,0.25)', color: '#A78BFA' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Pro
        </button>
      </header>

      {/* Hero */}
      <div className="px-6 py-8 text-center"
        style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.15) 0%, transparent 100%)' }}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Total leaking monthly</p>
        <h1 className="text-5xl font-black text-white tracking-tight mb-1">{fmt(summary.totalMonthly)}</h1>
        <p className="text-white/50 text-sm">
          <span className="font-black text-xl" style={{ color: doomColor }}>{fmt(summary.totalYearly)}</span>
          {' '}per year · {' '}
          <span style={{ color: doomColor }}>{doomText}</span>
        </p>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-30 px-4 pb-3 pt-1"
        style={{ background: 'rgba(6,4,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="flex gap-1 glass rounded-2xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(167,139,250,0.2)' : 'transparent',
                color: activeTab === tab.id ? '#A78BFA' : 'rgba(255,255,255,0.4)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 pb-6 max-w-lg mx-auto">
        {activeTab === 'overview'       && <OverviewTab analysis={analysis} />}
        {activeTab === 'habits'         && <HabitsTab habits={habits} />}
        {activeTab === 'subscriptions'  && <SubsTab subscriptions={subscriptions} onNavigate={navigate} />}
        {activeTab === 'whatif'         && <WhatIfTab habits={habits} />}
      </div>

      <BottomNav />
    </div>
  )
}

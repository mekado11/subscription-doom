import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const GRAD = 'linear-gradient(135deg, #7C3AED, #EC4899)'

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0 overflow-hidden"
      style={{ background: enabled ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'rgba(255,255,255,0.12)' }}
    >
      <span
        className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
        style={{ transform: enabled ? 'translateX(25px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="glass rounded-2xl overflow-hidden divide-y" style={{ borderColor: 'transparent', '--tw-divide-opacity': 1 }}>
        {children}
      </div>
    </div>
  )
}

function Row({ icon, label, value, chevron = false, danger = false, onClick, children }) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
      onClick={onClick}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {icon && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)' }}
        >
          <span style={{ color: danger ? '#EF4444' : 'rgba(255,255,255,0.5)' }}>{icon}</span>
        </div>
      )}
      <span className={`flex-1 text-sm ${danger ? 'text-red-400' : 'text-white'}`}>{label}</span>
      {value && <span className="text-white/40 text-sm">{value}</span>}
      {children}
      {chevron && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </button>
  )
}

function DeleteModal({ onClose, onConfirm }) {
  const [typed, setTyped] = useState('')
  const match = typed.toLowerCase() === 'delete my account'
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl p-6 w-full max-w-sm">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </div>
        <h3 className="text-white font-bold text-lg text-center mb-1">Delete Account</h3>
        <p className="text-white/50 text-sm text-center mb-5">This permanently deletes your data. Type <span className="text-red-400 font-mono">delete my account</span> to confirm.</p>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-400/50 mb-4 font-mono"
          placeholder="delete my account"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-white/60 text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.06)' }}>
            Cancel
          </button>
          <button
            onClick={match ? onConfirm : undefined}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: match ? '#EF4444' : 'rgba(239,68,68,0.2)', opacity: match ? 1 : 0.5, cursor: match ? 'pointer' : 'not-allowed' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [name, setName] = useState(user?.name ?? 'Your Name')
  const [editingName, setEditingName] = useState(false)
  const [budget, setBudget] = useState(2000)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [notifs, setNotifs] = useState({
    weeklyReport: true,
    spendingAlert: true,
    newSubscription: false,
    monthlyWrapup: true,
  })

  const connectedAccounts = [
    { bank: 'Chase', type: 'Checking ••4829', color: '#117ACA' },
  ]

  function handleDeleteConfirm() {
    signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white/40 text-sm flex items-center gap-1 hover:text-white/70 transition-colors"
        >
          ← Back
        </button>
        <span className="text-white font-bold text-base">Profile</span>
        <div className="w-12" />
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-black text-white text-2xl mb-3"
            style={{ background: GRAD, boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
          >
            {name.trim()[0]?.toUpperCase() ?? 'Y'}
          </div>
          {editingName ? (
            <input
              className="bg-transparent text-white text-center text-lg font-bold border-b border-violet-400 outline-none pb-1 mb-1"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => setEditingName(false)}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-white text-lg font-bold mb-0.5"
            >
              {name}
            </button>
          )}
          <p className="text-white/40 text-xs">Tap name to edit</p>
          {user?.email && (
            <p className="text-white/30 text-xs mt-0.5">{user.email}</p>
          )}
        </div>

        {/* Connected Accounts */}
        <Section title="Connected Accounts">
          {connectedAccounts.map(acct => (
            <div
              key={acct.bank}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: acct.color }}
              >
                {acct.bank[0]}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{acct.bank}</p>
                <p className="text-white/40 text-xs">{acct.type}</p>
              </div>
              <div
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}
              >
                Connected
              </div>
            </div>
          ))}
          <Row
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
            label="Add another account"
            chevron
          />
          <Row
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            }
            label="Upload bank statement manually"
            chevron
            onClick={() => navigate('/manual-entry')}
          />
        </Section>

        {/* Monthly Budget Goal */}
        <Section title="Monthly Budget Goal">
          <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm">Spending limit</span>
              <span
                className="font-black text-lg"
                style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                ${budget.toLocaleString()}/mo
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={100}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-white/30 text-xs mt-1">
              <span>$500</span>
              <span>$10,000</span>
            </div>
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-white text-sm">Tracking period</p>
              <p className="text-white/40 text-xs mt-0.5">How far back we scan</p>
            </div>
            <span className="text-white/60 text-sm">6 months</span>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          {[
            { key: 'weeklyReport',     label: 'Weekly Doom Report',       desc: 'Every Sunday morning' },
            { key: 'spendingAlert',    label: 'Spending spike alerts',    desc: 'When a category jumps 20%+' },
            { key: 'newSubscription',  label: 'New subscription detected',desc: 'When we spot a new recurring charge' },
            { key: 'monthlyWrapup',    label: 'Monthly wrap-up',          desc: 'Your month in review' },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex-1">
                <p className="text-white text-sm">{label}</p>
                <p className="text-white/40 text-xs mt-0.5">{desc}</p>
              </div>
              <Toggle
                enabled={notifs[key]}
                onChange={val => setNotifs(prev => ({ ...prev, [key]: val }))}
              />
            </div>
          ))}
        </Section>

        {/* Coming Soon */}
        <Section title="Coming Soon">
          {[
            { label: 'Friend comparisons', desc: 'See how you compare (opt-in)' },
            { label: 'Share your doom',    desc: 'Shareable spending card' },
            { label: 'AI advisor',         desc: 'Personalized money coaching' },
          ].map(({ label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', opacity: 0.5 }}
            >
              <div className="flex-1">
                <p className="text-white text-sm">{label}</p>
                <p className="text-white/40 text-xs mt-0.5">{desc}</p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}
              >
                Soon
              </span>
            </div>
          ))}
        </Section>

        {/* Data & Privacy */}
        <Section title="Data & Privacy">
          <Row
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            }
            label="Export my data"
            chevron
          />
          <Row
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            }
            label="Privacy policy"
            chevron
          />
          <Row
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            }
            label="Delete my account"
            danger
            onClick={() => setShowDeleteModal(true)}
          />
        </Section>

        {/* Sign out */}
        <button
          onClick={() => { signOut(); navigate('/') }}
          className="w-full glass rounded-2xl py-4 text-white/60 font-semibold text-sm mb-4"
        >
          Sign Out
        </button>

        <p className="text-white/20 text-xs text-center mb-2">SubDoom v0.1 · Free Beta</p>
      </div>
      <BottomNav />
    </div>
  )
}

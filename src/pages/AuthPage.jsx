import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GRAD = 'linear-gradient(135deg, #7C3AED, #EC4899)'

function Input({ label, type = 'text', placeholder, value, onChange, autoComplete }) {
  return (
    <div>
      <label className="text-white/40 text-xs mb-1.5 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-white/20"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [mode, setMode] = useState('signup') // 'signup' | 'signin'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    if (mode === 'signup' && !name.trim()) return 'Please enter your name'
    if (!email.includes('@')) return 'Please enter a valid email'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    // Simulate async auth — replace with Firebase call later
    setTimeout(() => {
      const user = signIn(name, email)
      setLoading(false)
      // New user → onboarding. Returning user → dashboard
      navigate(user.hasScanned ? '/dashboard' : '/onboarding')
    }, 700)
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate('/')}
          className="text-white/40 text-sm flex items-center gap-1 hover:text-white/70 transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
            style={{ background: GRAD }}
          >
            $
          </div>
          <span className="text-white font-bold tracking-tight">SubDoom</span>
        </div>
        <div className="w-12" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10">

        {/* Heading */}
        <div className="text-center mb-8 max-w-xs">
          <h1 className="text-white text-2xl font-black mb-2">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-white/40 text-sm">
            {mode === 'signup'
              ? 'Free to start. See your money leaks in 60 seconds.'
              : 'Sign in to view your spending dashboard.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="glass rounded-2xl p-1 flex w-full max-w-xs mb-6">
          {[
            { id: 'signup', label: 'Sign Up' },
            { id: 'signin', label: 'Sign In' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setMode(t.id); setError('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                mode === t.id
                  ? { background: GRAD, color: 'white' }
                  : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">

          {mode === 'signup' && (
            <Input
              label="Your name"
              placeholder="First name is fine"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />

          {error && (
            <p className="text-red-400 text-xs px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60"
            style={{ background: GRAD, boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
          >
            {loading
              ? 'One moment...'
              : mode === 'signup' ? 'Create Account — Free' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-white/25 text-xs">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Google — coming soon */}
          <button
            type="button"
            onClick={() => setError('Google sign-in coming soon — use email for now')}
            className="w-full glass text-white/60 font-semibold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2.5 transition-colors hover:text-white/80"
          >
            {/* Google "G" SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

        </form>

        {/* Fine print */}
        <p className="text-white/25 text-xs text-center mt-8 max-w-xs leading-relaxed">
          By continuing you agree to our Terms of Service and Privacy Policy.
          Your data is encrypted and never sold.
        </p>

      </main>
    </div>
  )
}

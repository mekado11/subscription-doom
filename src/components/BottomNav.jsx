import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#A78BFA' : 'rgba(255,255,255,0.35)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    path: '/manual-entry',
    label: 'Upload',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#A78BFA' : 'rgba(255,255,255,0.35)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#A78BFA' : 'rgba(255,255,255,0.35)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <>
      {/* Spacer so page content isn't hidden behind nav */}
      <div className="h-20" />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(6,4,15,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex max-w-lg mx-auto">
          {TABS.map(tab => {
            const active = pathname === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-opacity"
                style={{ opacity: active ? 1 : 0.7 }}
              >
                {tab.icon(active)}
                <span
                  className="text-xs font-medium"
                  style={{ color: active ? '#A78BFA' : 'rgba(255,255,255,0.35)' }}
                >
                  {tab.label}
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

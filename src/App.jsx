import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ConnectPage from './pages/ConnectPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ManualEntryPage from './pages/ManualEntryPage'

// Redirect to /auth if not signed in
function RequireAuth({ children }) {
  const { isAuthed } = useAuth()
  const location = useLocation()
  if (!isAuthed) return <Navigate to="/auth" state={{ from: location }} replace />
  return children
}

function AppBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(109,40,217,0.5) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-[350px] h-[350px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}

function AppRoutes() {
  return (
    <div className="relative min-h-screen" style={{ background: '#06040F' }}>
      <AppBackground />
      <div className="relative z-10">
        <Routes>
          {/* Public */}
          <Route path="/"            element={<ConnectPage />} />
          <Route path="/auth"        element={<AuthPage />} />

          {/* Protected — must be signed in */}
          <Route path="/connect"     element={<RequireAuth><ConnectPage scanning /></RequireAuth>} />
          <Route path="/dashboard"   element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/profile"     element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/manual-entry"element={<RequireAuth><ManualEntryPage /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

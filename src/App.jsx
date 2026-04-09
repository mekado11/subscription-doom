import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ConnectPage from './pages/ConnectPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ManualEntryPage from './pages/ManualEntryPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen" style={{ background: '#06040F' }}>
        {/* Ambient gradient orbs — fixed so they stay behind scrolling content */}
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

        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<ConnectPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/manual-entry" element={<ManualEntryPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

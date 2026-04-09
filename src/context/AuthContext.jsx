import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const saved = localStorage.getItem('subdoom_user')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  function signIn(name, email) {
    const existing = loadUser()
    // Preserve hasScanned flag if returning user
    const u = {
      name: name || existing?.name || email.split('@')[0],
      email,
      joinedAt: existing?.joinedAt ?? new Date().toISOString(),
      hasScanned: existing?.hasScanned ?? false,
    }
    localStorage.setItem('subdoom_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  function markScanned() {
    setUser(prev => {
      const updated = { ...prev, hasScanned: true }
      localStorage.setItem('subdoom_user', JSON.stringify(updated))
      return updated
    })
  }

  function signOut() {
    localStorage.removeItem('subdoom_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, signIn, signOut, markScanned }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

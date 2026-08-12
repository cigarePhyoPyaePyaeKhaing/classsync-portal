import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AppShell from './pages/AppShell'

export type Role = 'student' | 'cr'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://classsync-portal-production.up.railway.app'

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'app'>('landing')
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<Role>('student')

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme !== null) {
      return savedTheme === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [lang, setLang] = useState<'en' | 'mm'>('en')

  // Google redirects back with a short-lived API token in the URL fragment.
  // Fragments are never sent to Vercel, so the token is not exposed in server logs.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const googleToken = params.get('auth_token')

    if (params.has('auth_error')) {
      window.history.replaceState({}, document.title, window.location.pathname)
      setInitialAuthMode('login')
      setScreen('login')
      return
    }

    if (googleToken) {
      window.history.replaceState({}, document.title, window.location.pathname)
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${googleToken}` },
      })
        .then(async (response) => {
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'Google sign-in could not be completed.')
          const authenticatedRole: Role = data.user.role === 'cr' ? 'cr' : 'student'
          localStorage.setItem('classsync_user', JSON.stringify({
            ...data.user,
            role: authenticatedRole,
            isLoggedIn: true,
            token: googleToken,
          }))
          setRole(authenticatedRole)
          setScreen('app')
        })
        .catch(() => {
          localStorage.removeItem('classsync_user')
          setInitialAuthMode('login')
          setScreen('login')
        })
      return
    }

    const savedUser = localStorage.getItem('classsync_user')
    if (!savedUser) return
    try {
      const user = JSON.parse(savedUser)
      if (user.isLoggedIn && user.token) {
        fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${user.token}` } })
          .then(async (response) => {
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)
            const verifiedRole: Role = data.user.role === 'cr' ? 'cr' : 'student'
            localStorage.setItem('classsync_user', JSON.stringify({ ...data.user, role: verifiedRole, isLoggedIn: true, token: user.token }))
            setRole(verifiedRole)
            setScreen('app')
          })
          .catch(() => localStorage.removeItem('classsync_user'))
      }
    } catch {
      localStorage.removeItem('classsync_user')
    }
  }, [])

  // ⚡ Theme ပြောင်းလဲမှုတိုင်းကို HTML class ရော LocalStorage ထဲပါ မှန်ကန်စွာ သိမ်းဆည်းပေးခြင်း
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light') // Light Mode အတွက် LocalStorage တွင် ပြန်သိမ်းရန်
    }
  }, [isDarkMode])

  const handleNavigateLogin = (mode: 'login' | 'register') => {
    setInitialAuthMode(mode)
    setScreen('login')
  }

  if (screen === 'landing') {
    return (
      <Landing
        onNavigateLogin={handleNavigateLogin}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        lang={lang}
        setLang={setLang}
      />
    )
  }

  if (screen === 'login') {
    return (
      <Login
        initialMode={initialAuthMode}
        onLogin={(r) => {
          setRole(r)
          setScreen('app')
        }}
        onBack={() => setScreen('landing')}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        lang={lang}
        setLang={setLang}
      />
    )
  }

  return (
    <AppShell
      role={role}
      onLogout={() => {
        localStorage.removeItem('classsync_user')
        setScreen('landing')
      }}
      onSwitchRole={() => undefined}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      lang={lang}
      setLang={setLang}
    />
  )
}

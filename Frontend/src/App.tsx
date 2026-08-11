import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AppShell from './pages/AppShell'

export type Role = 'student' | 'cr'

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
      onLogout={() => setScreen('landing')}
      onSwitchRole={() => setRole((r) => (r === 'student' ? 'cr' : 'student'))}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      lang={lang}
      setLang={setLang}
    />
  )
}
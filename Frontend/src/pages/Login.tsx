import { useState, useRef, useEffect } from 'react'
import type { Role } from '../App'

interface Props {
  onLogin: (role: Role) => void
  onBack: () => void
  initialMode?: 'login' | 'register'
  isDarkMode?: boolean
  setIsDarkMode?: (val: boolean | ((prev: boolean) => boolean)) => void
  lang?: 'en' | 'mm'
  setLang?: (lang: 'en' | 'mm') => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://classsync-portal-production.up.railway.app';

export default function Login({
  onLogin,
  onBack,
  initialMode = 'login',
  isDarkMode = false,
}: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(initialMode)
  const [role, setRole] = useState<Role>('student')

  // Login Form States
  const [tntOrEmail, setTntOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loginErrors, setLoginErrors] = useState<{ identifier?: string; password?: string }>({})

  // Register Form States
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [tntNo, setTntNo] = useState('')
  const [semester, setSemester] = useState('Semester 1')
  const [section, setSection] = useState('A')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Real-time Password Rules state
  const [passRules, setPassRules] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  })

  // Verification OTP States
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // UI / Feedback States
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetEmailOrTnt, setResetEmailOrTnt] = useState('')

  // Dynamic Theme Classes
  const bgClass = isDarkMode ? 'bg-slate-950 text-gray-100' : 'bg-slate-50 text-slate-800'
  const cardBgClass = isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
  const formAreaBgClass = isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'
  const inputBgClass = isDarkMode
    ? 'bg-slate-800/80 text-gray-100 placeholder-gray-500 border-slate-700/80'
    : 'bg-slate-100 text-slate-800 placeholder-slate-400 border-slate-300'
  const textMutedClass = isDarkMode ? 'text-gray-400' : 'text-slate-500'
  const textLabelClass = isDarkMode ? 'text-gray-300' : 'text-slate-700'
  const roleBgClass = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-200/80 border-slate-300'

  useEffect(() => {
    setPassRules({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }, [password])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (mode === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [mode, resendTimer])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const validateLoginForm = (identifier: string, pwd: string) => {
    const nextErrors: { identifier?: string; password?: string } = {}
    const trimmedIdentifier = identifier.trim()
    const isValidGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(trimmedIdentifier)
    const isValidTnt = /^TNT-\d{4}$/i.test(trimmedIdentifier)

    if (!trimmedIdentifier) {
      nextErrors.identifier = 'Please enter a valid Gmail address or TNT No.'
    } else if (!isValidGmail && !isValidTnt) {
      nextErrors.identifier = 'Please enter a valid Gmail address or TNT No.'
    }

    if (!pwd.trim() || pwd.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long'
    }

    return nextErrors
  }

  const isValidName = (name: string) => /^[a-zA-Z\s]+$/.test(name.trim())
  const isValidEmail = (emailStr: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr)
  const isValidTNT = (tnt: string) => /^TNT-\d{4}$/i.test(tnt.trim())

  const handleQuickDemo = (demoRole: Role) => {
    setRole(demoRole)
    setTntOrEmail(demoRole === 'student' ? 'student@gmail.com' : 'cr@gmail.com')
    setPassword('Demo@1234')
    setErrorMessage('')
    showToast(`Loaded Credentials for ${demoRole === 'student' ? 'Student' : 'Class Rep'}`)
  }

  // --- Main Authentication Fetch Call ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (mode === 'login') {
      const nextErrors = validateLoginForm(tntOrEmail, password)
      setLoginErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) return

      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: tntOrEmail, password })
        })
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.error)

        localStorage.setItem(
          'classsync_user',
          JSON.stringify({
            id: data.user?.id,
            name: data.user?.name,
            email: data.user?.email || tntOrEmail,
            tntNo: data.user?.tnt_no,
            semester: data.user?.semester,
            section: data.user?.section,
            major: data.user?.major,
            phone: data.user?.phone,
            address: data.user?.address,
            bio: data.user?.bio,
            avatarUrl: data.user?.avatarUrl,
            role,
            isLoggedIn: true,
            token: data.token,
          })
        )
        onLogin(role)
      } catch (err: any) {
        setErrorMessage(err.message || 'Login failed. Please try again.')
      } finally {
        setIsLoading(false)
      }

    } else if (mode === 'register') {
      if (!isValidName(fullName)) return setErrorMessage('နာမည်တွင် ဂဏန်းများနှင့် Special Characters များ မရပါ')
      if (!isValidTNT(tntNo)) return setErrorMessage('TNT နံပါတ် မှားယွင်းနေပါသည် (e.g. TNT-1234)')
      if (!isValidEmail(email)) return setErrorMessage('မှန်ကန်သော Email လိပ်စာ ရိုက်ထည့်ပါ')
      if (!Object.values(passRules).every(Boolean)) return setErrorMessage('စကားဝှက် သတ်မှတ်ချက်များနှင့် မပြည့်စုံပါ')
      if (password !== confirmPassword) return setErrorMessage('Passwords တူညီမှု မရှိပါ')

      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, tntNo, password, semester, section })
        })
        const data = await response.json()

        if (!response.ok) throw new Error(data.error)

        setMode('verify')
        setResendTimer(30)
        showToast('Verification code sent to ' + email)
      } catch (err: any) {
        setErrorMessage(err.message || 'Registration failed.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d
      })
      setOtp(newOtp)
      inputRefs.current[Math.min(digits.length, 5)]?.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
    else if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    else if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const enteredCode = otp.join('')

    if (enteredCode.length < 6) {
      setErrorMessage('ဂဏန်း ၆ လုံးပါဝင်သော Verification Code ကို အပြည့်အစုံထည့်ပါ')
      return
    }

    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: enteredCode })
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setIsLoading(false)
      showToast('အကောင့်ဖွင့်လှစ်ခြင်း အောင်မြင်ပါသည်။')

      setTimeout(() => {
        setMode('login')
        setOtp(['', '', '', '', '', ''])
      }, 1200)

    } catch (err: any) {
      setIsLoading(false)
      setErrorMessage(err.message || 'Verification failed. Please try again.')
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmailOrTnt) return

    if (resetEmailOrTnt.includes('@') && !isValidEmail(resetEmailOrTnt)) {
      setErrorMessage('ကျေးဇူးပြု၍ မှန်ကန်သော Email လိပ်စာ ရိုက်ထည့်ပါ')
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)

    showToast('Password reset link sent to your email!')
    setShowForgotModal(false)
    setResetEmailOrTnt('')
  }

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-y-auto transition-colors duration-200 ${bgClass}`}>
      
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-300 animate-bounce">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      <header className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 text-xs font-semibold ${textMutedClass} hover:text-[#007782] transition-colors cursor-pointer`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 11.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-md bg-[#007782]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-[#007782]">ClassSync Portal</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto flex items-center justify-center my-auto py-2">
        <div className={`w-full rounded-3xl border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-md transition-colors ${cardBgClass}`}>
          
          <div className="lg:col-span-5 p-8 flex flex-col justify-between text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #007782 0%, #004d55 100%)' }}>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] font-medium backdrop-blur-md mb-4 border border-white/20">
                Academic Hub v2.4
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
                Welcome to <br /> ClassSync Portal
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Stay connected with your classmates and representatives. Access real-time schedules, course materials, and notices seamlessly.
              </p>
            </div>

            <div className="space-y-4 my-6">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-xs font-semibold text-white">Live Timetables</p>
                  <p className="text-[11px] text-white/70">Automatic lecture highlights based on your local clock.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Official Announcements</p>
                  <p className="text-[11px] text-white/70">Instant notices pushed directly from Class Reps.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-[11px] text-white/80 mb-2 font-medium">⚡ Quick Demo Login:</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleQuickDemo('student')} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white transition-all border border-white/20 cursor-pointer">
                  As Student
                </button>
                <button type="button" onClick={() => handleQuickDemo('cr')} className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-semibold text-amber-200 transition-all border border-amber-400/30 cursor-pointer">
                  As Class Rep
                </button>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center transition-colors ${formAreaBgClass}`}>
            
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Account'}
                {mode === 'verify' && 'Security Verification'}
              </h1>
              <p className={`text-xs mt-1 ${textMutedClass}`}>
                {mode === 'login' && 'Sign in to access your portal session'}
                {mode === 'register' && 'Register to join your classroom network'}
                {mode === 'verify' && `Enter the 6-digit code sent to ${email || 'your email'}`}
              </p>
            </div>

            {mode !== 'verify' && (
              <div className={`flex rounded-2xl p-1 mb-4 border w-full ${roleBgClass}`}>
                {(['student', 'cr'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setErrorMessage(''); }}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      background: role === r ? '#007782' : 'transparent',
                      color: role === r ? '#fff' : isDarkMode ? '#9CA3AF' : '#4B5563',
                      boxShadow: role === r ? '0 4px 12px rgba(0,119,130,0.3)' : 'none',
                    }}
                  >
                    {r === 'student' ? 'Student' : 'Class Rep (CR)'}
                  </button>
                ))}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2 animate-shake">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-red-400">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {mode === 'verify' ? (
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <div>
                  <label className={`block text-xs font-semibold mb-2 ${textLabelClass}`}>6-Digit Security Code</label>
                  <div className="flex gap-2 sm:gap-3 justify-between">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-10 h-12 sm:w-11 sm:h-12 text-center font-bold text-lg rounded-2xl border outline-none focus:ring-2 focus:ring-[#007782] focus:border-[#007782] transition-all ${inputBgClass}`}
                      />
                    ))}
                  </div>
                </div>

                <div className={`flex items-center justify-between text-xs ${textMutedClass}`}>
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (resendTimer === 0) {
                        setResendTimer(30)
                        showToast('New verification code sent!')
                      }
                    }}
                    disabled={resendTimer > 0}
                    className={`font-semibold cursor-pointer ${resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : 'text-[#007782] hover:underline'}`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMessage(''); }}
                    className={`w-1/3 py-2.5 rounded-2xl border font-semibold text-xs transition-colors cursor-pointer ${isDarkMode ? 'border-slate-700 text-gray-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-2.5 rounded-2xl text-white font-semibold text-xs transition-all hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#007782]"
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify & Proceed'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'login' ? (
                  <>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>TNT No / Gmail Address</label>
                      <input
                        type="text"
                        required
                        value={tntOrEmail}
                        onChange={(e) => {
                          setTntOrEmail(e.target.value)
                          setLoginErrors((prev) => ({ ...prev, identifier: undefined }))
                        }}
                        placeholder={role === 'student' ? 'TNT-1234 or student@gmail.com' : 'cr@gmail.com'}
                        className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 transition-all ${inputBgClass} ${loginErrors.identifier ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {loginErrors.identifier && <p className="mt-1 text-[11px] text-red-500">{loginErrors.identifier}</p>}
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setLoginErrors((prev) => ({ ...prev, password: undefined }))
                          }}
                          placeholder="Enter password"
                          className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 transition-all ${inputBgClass} ${loginErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold cursor-pointer ${textMutedClass}`}>
                          {showPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {loginErrors.password && <p className="mt-1 text-[11px] text-red-500">{loginErrors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className={`flex items-center gap-2 cursor-pointer ${textMutedClass}`}>
                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded accent-[#007782]" />
                        Keep me signed in
                      </label>
                      <button type="button" onClick={() => setShowForgotModal(true)} className="font-semibold text-[#007782] hover:underline cursor-pointer">
                        Forgot password?
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Full Name <span className="text-red-500">*</span></label>
                      <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Letters only (e.g. Aung Aung)" className={`w-full px-3.5 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>TNT No <span className="text-red-500">*</span></label>
                        <input type="text" required value={tntNo} onChange={(e) => setTntNo(e.target.value.toUpperCase())} placeholder="TNT-1234" className={`w-full px-3.5 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Gmail <span className="text-red-500">*</span></label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@gmail.com" className={`w-full px-3.5 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Semester</label>
                        <select value={semester} onChange={(e) => setSemester(e.target.value)} className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 cursor-pointer ${inputBgClass}`}>
                          {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Section</label>
                        <select value={section} onChange={(e) => setSection(e.target.value)} className={`w-full px-3 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 cursor-pointer ${inputBgClass}`}>
                          {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Password</label>
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create strong password" className={`w-full px-3.5 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`} />
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                        <span className={`flex items-center gap-1 ${passRules.minLength ? 'text-emerald-500 font-semibold' : textMutedClass}`}>{passRules.minLength ? '✓' : '○'} Min 8 chars</span>
                        <span className={`flex items-center gap-1 ${passRules.hasUpper ? 'text-emerald-500 font-semibold' : textMutedClass}`}>{passRules.hasUpper ? '✓' : '○'} Uppercase (A-Z)</span>
                        <span className={`flex items-center gap-1 ${passRules.hasLower ? 'text-emerald-500 font-semibold' : textMutedClass}`}>{passRules.hasLower ? '✓' : '○'} Lowercase (a-z)</span>
                        <span className={`flex items-center gap-1 ${passRules.hasNumber ? 'text-emerald-500 font-semibold' : textMutedClass}`}>{passRules.hasNumber ? '✓' : '○'} Number (0-9)</span>
                        <span className={`flex items-center gap-1 col-span-2 ${passRules.hasSpecial ? 'text-emerald-500 font-semibold' : textMutedClass}`}>{passRules.hasSpecial ? '✓' : '○'} Special char (@$!%*?)</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Confirm Password</label>
                      <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-type password" className={`w-full px-3.5 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`} />
                    </div>
                  </>
                )}

                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-2xl text-white font-bold text-xs transition-all hover:opacity-95 shadow-lg mt-3 flex items-center justify-center gap-2 cursor-pointer bg-[#007782]">
                  {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === 'login' ? `Sign in as ${role === 'student' ? 'Student' : 'Class Rep'}` : `Proceed to Verification`}
                </button>
              </form>
            )}

            {mode !== 'verify' && (
              <div className="mt-3">
                <div className="relative flex py-1 items-center">
                  <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
                  <span className={`flex-shrink mx-4 text-[11px] ${textMutedClass}`}>Or continue with</span>
                  <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
                </div>

                <a href={`${API_BASE_URL}/auth/google`} className={`w-full py-2.5 px-4 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-gray-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.14C3.17 21.36 7.24 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.61H1.2C.44 8.15 0 9.88 0 12s.44 3.85 1.2 5.39l4.08-3.14z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.24 0 3.17 2.64 1.2 6.61l4.08 3.14c.95-2.84 3.6-4.95 6.72-4.95z"/>
                  </svg>
                  {mode === 'login' ? 'Sign in with Google' : 'Register with Google'}
                </a>
              </div>
            )}

            {mode !== 'verify' && (
              <div className={`mt-4 text-xs text-center sm:text-left ${textMutedClass}`}>
                {mode === 'login' ? (
                  <p>Don't have an account? <button type="button" onClick={() => { setMode('register'); setErrorMessage(''); }} className="font-bold text-[#007782] hover:underline cursor-pointer">Register</button></p>
                ) : (
                  <p>Already have an account? <button type="button" onClick={() => { setMode('login'); setErrorMessage(''); }} className="font-bold text-[#007782] hover:underline cursor-pointer">Sign In</button></p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`py-2 text-center text-[11px] ${textMutedClass}`}>
        ClassSync Academic Portal System • Powered by LMS Engine
      </footer>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl border ${cardBgClass}`}>
            <h3 className="text-sm font-bold mb-1">Reset Password</h3>
            <p className={`text-xs mb-4 ${textMutedClass}`}>Enter your registered Gmail address below.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>TNT No / Gmail</label>
                <input type="text" required value={resetEmailOrTnt} onChange={(e) => setResetEmailOrTnt(e.target.value)} placeholder="name@gmail.com" className={`w-full px-3.5 py-2 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForgotModal(false)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${isDarkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Cancel</button>
                <button type="submit" disabled={isLoading} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#007782] hover:opacity-90 flex items-center gap-2 cursor-pointer">{isLoading ? 'Sending...' : 'Send Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
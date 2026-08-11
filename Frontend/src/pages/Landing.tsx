interface Props {
  onNavigateLogin: (mode: 'login' | 'register') => void
  isDarkMode: boolean
  setIsDarkMode: (val: boolean) => void
  lang: 'en' | 'mm'
  setLang: (lang: 'en' | 'mm') => void
}

export default function Landing({
  onNavigateLogin,
  isDarkMode,
  setIsDarkMode,
  lang,
  setLang,
}: Props) {

  const content = {
    en: {
      brand: 'ClassSync',
      login: 'Sign In',
      register: 'Register',
      heroTitle: 'Your Digital Campus & Academic Portal',
      heroSub: 'Easily track daily timetables, study materials, and official announcements — all in one centralized workspace.',
      getStarted: 'Get Started',
      exploreMajors: 'Explore Majors',
      aboutTitle: 'About Our University Platform',
      aboutDesc: 'ClassSync is built for Computer Science & Technology students to stay synced with class schedules, lecture files, and class representative announcements.',
      majorsTitle: 'Academic Majors & Tracks',
      majorsDesc: 'Discover the specialized fields offered in our curriculum.',
      majors: [
        { title: 'Software Engineering (SE)', desc: 'Focuses on modern web application development, software design patterns, and full-stack frameworks.' },
        { title: 'Knowledge Engineering (KE)', desc: 'Specializes in AI, data mining, database management systems, and intelligent agent systems.' },
        { title: 'Cyber Security (CS)', desc: 'Covers network security, ethical hacking, cryptography, and defense against digital threats.' },
        { title: 'High Performance Computing (HPC)', desc: 'Explores parallel computing, computer architecture, systems programming, and hardware integration.' }
      ],
      stats: [
        { label: 'Active Students', val: '1,250+' },
        { label: 'Semesters Covered', val: 'Sem 1 - Sem 8' },
        { label: 'Class Reps', val: '40+' }
      ]
    },
    mm: {
      brand: 'ClassSync',
      login: 'အကောင့်ဝင်ရန်',
      register: 'အကောင့်သစ်ဖွင့်ရန်',
      heroTitle: 'ကွန်ပျူတာတက္ကသိုလ် အတန်းချိန်နှင့် သင်ကြားရေး ပေါ်တယ်',
      heroSub: 'နေ့စဉ် အတန်းချိန်ဇယားများ၊ သင်ကြားရေး စာအုပ်စာတမ်းများနှင့် အရေးကြီး အသိပေးစာများကို တစ်နေရာတည်းမှာ လွယ်ကူစွာ ကြည့်ရှုနိုင်ပါသည်။',
      getStarted: 'စတင်အသုံးပြုမည်',
      exploreMajors: 'မေဂျာများကို ကြည့်ရန်',
      aboutTitle: 'ကျောင်းတော်ကြီးနှင့် စနစ်အကြောင်း',
      aboutDesc: 'ClassSync ကို ကွန်ပျူတာတက္ကသိုလ် ကျောင်းသား/သူများအတွက် နေ့စဉ် အတန်းချိန်ဇယားများ စစ်ဆေးရန်၊ စာအုပ်စာတမ်းများ ဒေါင်းလုဒ်ဆွဲရန်နှင့် CR မှ ပေးပို့သော အရေးကြီး စာများကို တိုက်ရိုက် ကြည့်ရှုနိုင်ရန် ရည်ရွယ် ပြုလုပ်ထားပါသည်။',
      majorsTitle: 'သင်ကြားပေးလျက်ရှိသော မေဂျာများ',
      majorsDesc: 'မိမိ စိတ်ပါဝင်စားရာ အထူးပြု ဘာသာရပ်ဆိုင်ရာ နယ်ပယ်များ',
      majors: [
        { title: 'Software Engineering (SE)', desc: 'Software ရေးသားခြင်း၊ Web/Mobile Application များ တည်ဆောက်ခြင်းနှင့် UI/UX ဒီဇိုင်း ပိုင်းကို သင်ကြားရမည်။' },
        { title: 'Knowledge Engineering (KE)', desc: 'Artificial Intelligence, Data Mining နှင့် Database Management စသည့် အချက်အလက်ဆိုင်ရာ နည်းပညာများ။' },
        { title: 'Cyber Security (CS)', desc: 'ကွန်ပျူတာ ကွန်ရက် လုံခြုံရေး၊ Cryptography နှင့် Cyber တိုက်ခိုက်မှုများ ကာကွယ်ခြင်း ဆိုင်ရာ ဘာသာရပ်များ။' },
        { title: 'High Performance Computing (HPC)', desc: 'Computer Architecture, Embedded Systems နှင့် Micro-controller ပိုင်းဆိုင်ရာ ဟာ့ဒ်ဝဲ/ဆော့ဖ်ဝဲ သင်ခန်းစာများ။' }
      ],
      stats: [
        { label: 'ကျောင်းသား ဦးရေ', val: '၁,၂၅၀+' },
        { label: 'သင်ကြားသည့် Semesters', val: 'Sem 1 မှ Sem 8 အထိ' },
        { label: 'CR ဦးရေ', val: '၄၀+' }
      ]
    }
  }

  const t = content[lang]

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 overflow-x-hidden ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-gray-800'}`}>
      
      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105" style={{ background: '#007782' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight" style={{ color: isDarkMode ? '#38bdf8' : '#007782' }}>
              {t.brand}
            </span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'mm' : 'en')}
              className={`h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1 text-[11px] sm:text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                  : 'border-gray-300 hover:bg-gray-100 text-gray-700'
              }`}
              title="Change Language"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{lang === 'en' ? 'MM' : 'ENG'}</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`h-8 sm:h-9 w-8 sm:w-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'border-slate-700 hover:bg-slate-800 text-amber-400' 
                  : 'border-gray-300 hover:bg-gray-100 text-slate-700'
              }`}
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Login Button */}
            <button
              onClick={() => onNavigateLogin('login')}
              className={`h-8 sm:h-9 px-2.5 sm:px-4 flex items-center justify-center rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-200/60'
              }`}
            >
              {t.login}
            </button>

            {/* Register Button */}
            <button
              onClick={() => onNavigateLogin('register')}
              className="h-8 sm:h-9 px-2.5 sm:px-4 flex items-center justify-center rounded-xl text-[11px] sm:text-xs font-semibold text-white transition-all shadow-md hover:opacity-90 cursor-pointer"
              style={{ background: '#007782' }}
            >
              {t.register}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 sm:mb-6">
            {t.heroTitle}
          </h1>

          <p className={`text-xs sm:text-sm lg:text-base mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {t.heroSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigateLogin('register')}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ background: '#007782' }}
            >
              {t.getStarted}
            </button>
            <a
              href="#majors"
              className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-all ${
                isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t.exploreMajors}
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-4xl mx-auto">
          {t.stats.map((stat, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-6 rounded-2xl border text-center transition-all ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200/80 shadow-sm'
              }`}
            >
              <div className="text-xl sm:text-2xl font-bold" style={{ color: '#007782' }}>{stat.val}</div>
              <div className={`text-[11px] sm:text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className={`py-12 sm:py-16 border-t ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200/60'}`}>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t.aboutTitle}</h2>
          <p className={`text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {t.aboutDesc}
          </p>
        </div>
      </section>

      {/* Majors Section */}
      <section id="majors" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{t.majorsTitle}</h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.majorsDesc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {t.majors.map((m, idx) => (
            <div
              key={idx}
              className={`p-5 sm:p-6 rounded-2xl border transition-all hover:shadow-md ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:border-[#007782]' : 'bg-white border-gray-200 hover:border-[#007782]'
              }`}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs sm:text-sm mb-3 sm:mb-4" style={{ background: '#007782' }}>
                0{idx + 1}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm mb-2">{m.title}</h3>
              <p className={`text-[11px] sm:text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-6 sm:py-8 border-t text-center text-[11px] sm:text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-100 border-gray-200 text-gray-500'}`}>
        <p>© 2026 ClassSync Academic Portal. All rights reserved.</p>
      </footer>
    </div>
  )
}
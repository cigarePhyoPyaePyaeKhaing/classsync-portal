import { useState } from 'react'
import StudentDashboard from './StudentDashboard'
import CRDashboard from './CRDashboard'
import Subjects from "./Subjects";
import Announcements from "./Announcements";
import Assignments from "./Assignments";
import Calendar from "./Calendar";
import Profile from "./Profile";
import Settings from "./Settings";

import { useTheme } from './ThemeContext'
import { useLanguage } from './LanguageContext'

import { translations } from '../translations'
interface Props {
  initialRole?: 'student' | 'cr'
  onLogout: () => void
}

export default function Dashboard({ initialRole = 'student', onLogout }: Props) {
  const [role, setRole] = useState<'student' | 'cr'>(initialRole)
  const [activePage, setActivePage] = useState<'dashboard'|'subjects'|'announcements'|'assignments'|'calendar'|'profile'|'settings'>('dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 2. Context မှ Theme နဲ့ Language logic များကို ဆွဲထုတ်သုံးပါ
  const { isDarkMode, toggleTheme } = useTheme()
  const { language, changeLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d19] text-gray-800 dark:text-gray-100 flex transition-colors duration-200">
      
      {/* Sidebar */}
      <aside 
        className={`bg-white dark:bg-[#0f172a] border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand / Logo */}
          <div 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <div className="w-9 h-9 rounded-xl bg-[#007782] flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm">
              🎓
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-sm text-gray-800 dark:text-white leading-none">ClassSync</h1>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">BSCS 3-1</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <button
              type="button"
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-3 p-3 rounded-xl ${activePage === 'dashboard' ? 'bg-[#007782]/10 text-[#007782] dark:bg-[#007782]/20 dark:text-[#33a8b5]' : ''} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-base">📊</span> {!isCollapsed && <span>{language === 'MM' ? 'ဒက်ရှ်ဘုတ်' : 'Dashboard'}</span>}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('announcements')}
              className={`flex items-center justify-between p-3 rounded-xl ${activePage === 'announcements' ? 'bg-[#007782]/10 text-[#007782] dark:bg-[#007782]/20 dark:text-[#33a8b5]' : 'hover:bg-gray-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🔔</span> {!isCollapsed && <span>{language === 'MM' ? 'ကြေညာချက်များ' : 'Announcements'}</span>}
              </div>
              {!isCollapsed && <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">3</span>}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('assignments')}
              className={`flex items-center gap-3 p-3 rounded-xl ${activePage === 'assignments' ? 'bg-[#007782]/10 text-[#007782] dark:bg-[#007782]/20 dark:text-[#33a8b5]' : 'hover:bg-gray-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-base">📝</span> {!isCollapsed && <span>{language === 'MM' ? 'အိမ်စာများ' : 'Assignments'}</span>}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('calendar')}
              className={`flex items-center gap-3 p-3 rounded-xl ${activePage === 'calendar' ? 'bg-[#007782]/10 text-[#007782] dark:bg-[#007782]/20 dark:text-[#33a8b5]' : 'hover:bg-gray-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-base">📅</span> {!isCollapsed && <span>{language === 'MM' ? 'ပြက္ခဒိန်' : 'Calendar'}</span>}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('subjects')}
              className={`flex items-center gap-3 p-3 rounded-xl ${activePage === 'subjects' ? 'bg-[#007782]/10 text-[#007782] dark:bg-[#007782]/20 dark:text-[#33a8b5]' : 'hover:bg-gray-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-base">📖</span> {!isCollapsed && <span>{language === 'MM' ? 'ဘာသာရပ်များ' : 'Subjects'}</span>}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-3 p-3 rounded-xl ${isCollapsed ? 'justify-center' : ''} hover:bg-gray-50 dark:hover:bg-slate-800`}
            >
              <span className="text-base">🔍</span> {!isCollapsed && <span>{language === 'MM' ? 'ရှာဖွေရန်' : 'Search'}</span>}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('profile')}
              className={`flex items-center gap-3 p-3 rounded-xl ${activePage === 'profile' ? 'bg-[#007782]/10 text-[#007782] dark:bg-[#007782]/20 dark:text-[#33a8b5]' : 'hover:bg-gray-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-base">👤</span> {!isCollapsed && <span>{language === 'MM' ? 'ပရိုဖိုင်' : 'Profile'}</span>}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('settings')}
              className={`flex items-center gap-3 p-3 rounded-xl ${activePage === 'settings' ? 'bg-[#007782]/10 text-[#007782] dark:bg-[#007782]/20 dark:text-[#33a8b5]' : 'hover:bg-gray-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-base">⚙️</span> {!isCollapsed && <span>{language === 'MM' ? 'ပြင်ဆင်ချက်များ' : 'Settings'}</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${role === 'cr' ? 'bg-amber-500' : 'bg-[#007782]'}`} />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Viewing as {role === 'cr' ? 'CR' : 'Student'}
                </span>
              </div>
              <button
                onClick={() => setRole(role === 'cr' ? 'student' : 'cr')}
                className="text-[#007782] dark:text-[#33a8b5] font-semibold hover:underline cursor-pointer text-[11px]"
              >
                switch
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setRole(role === 'cr' ? 'student' : 'cr')}
                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-[#007782] dark:text-[#33a8b5] cursor-pointer"
                title={`Switch to ${role === 'cr' ? 'Student' : 'CR'}`}
              >
                {role === 'cr' ? 'CR' : 'ST'}
              </button>
            </div>
          )}

          <button
            onClick={onLogout}
            className={`flex items-center gap-2 text-red-500 text-xs font-semibold px-2 py-1.5 hover:opacity-80 w-full cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <span className="text-base">🚪</span> {!isCollapsed && <span>{language === 'MM' ? 'ထွက်မည်' : 'Logout'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between transition-colors">
          <div className="relative w-72">
            <input
              type="text"
              placeholder={language === 'MM' ? "ရှာဖွေရန်..." : "Search..."}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-[#007782]/20 dark:text-white"
            />
            <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
          </div>

          <div className="flex items-center gap-3">
            
            {/* 3. Language Switcher Button (ENG / MM) */}
            <button
              onClick={() => changeLanguage(language === 'ENG' ? 'MM' : 'ENG')}
              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Change Language"
            >
              {language === 'ENG' ? 'MM' : 'ENG'}
            </button>

            {/* 4. Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs transition-colors cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm cursor-pointer ml-1">🔔</button>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm cursor-pointer">💬</button>
            
            <div className="w-8 h-8 rounded-full bg-[#007782] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {role === 'cr' ? 'J' : 'M'}
            </div>
          </div>
        </header>

        {/* Dynamic Content Switching */}
        <main className="p-6 flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#070d19] transition-colors">
          {activePage === 'dashboard' ? (
            role === 'cr' ? <CRDashboard /> : <StudentDashboard />
          ) : activePage === 'subjects' ? (
            <Subjects />
          ) : activePage === 'announcements' ? (
            <Announcements />
          ) : activePage === 'assignments' ? (
            <Assignments />
          ) : activePage === 'calendar' ? (
            <Calendar />
          ) : activePage === 'profile' ? (
            <Profile />
          ) : activePage === 'settings' ? (
            <Settings />
          ) : (
            role === 'cr' ? <CRDashboard /> : <StudentDashboard />
          )}
        </main>
      </div>
    </div>
  )
}
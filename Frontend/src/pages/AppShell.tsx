import { useState, useEffect } from 'react'
import type { Role } from '../App'
import Subjects from './Subjects'
import Announcements from './Announcements'
import Assignments from './Assignments'
import Calendar from './Calendar'
import Profile from './Profile'
import Settings from './Settings'
import Attendance from './Attendance' 

type Screen = 'dashboard' | 'subjects' | 'attendance' | 'announcements' | 'assignments' | 'calendar' | 'profile' | 'settings'

interface Props {
  role: Role
  onLogout: () => void
  onSwitchRole: () => void
  isDarkMode: boolean
  setIsDarkMode: (val: boolean) => void
  lang: 'en' | 'mm'
  setLang: (lang: 'en' | 'mm') => void
}

const Icon = {
  grid: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  bell: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>,
  clip: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>,
  cal: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  book: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>,
  attendance: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  user: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  cog: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
  logout: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>,
  plus: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
  edit: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>,
  trash: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
  upload: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>,
  check: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
}

const translations = {
  en: {
    sidebar: {
      expand: 'Expand Sidebar',
      collapse: 'Collapse Sidebar',
      title: 'ClassSync',
      subtitle: 'BSCS 3-1',
      loggedInAs: 'Logged in as',
      roleStudent: 'Student',
      roleCr: 'Class Representative',
      logout: 'Logout',
      searchPlaceholder: 'Search...',
      switchLanguage: 'မြန်မာ',
      switchToEnglish: 'ENG',
      themeLabel: 'Dark',
      themeLabelLight: 'Light',
      themeTitle: 'Toggle Theme',
      roleBadgeStudent: 'ST',
      roleBadgeCr: 'CR',
    },
    nav: {
      dashboard: 'Dashboard',
      subjects: 'Subjects',
      attendance: 'Attendance',
      announcements: 'Announcements',
      assignments: 'Assignments',
      calendar: 'Calendar',
      profile: 'Profile',
      settings: 'Settings',
    },
    studentDashboard: {
      recentAnnouncements: 'Recent Announcements',
      viewAll: 'View all',
      nextDeadline: 'Next Deadline',
      todaysSchedule: "Today's Schedule",
      clickAssignment: 'Click to view assignment →',
    },
    crDashboard: {
      greeting: 'Good morning, Class Rep!',
      subtitle: 'Class Representative — BSCS 3-1 · Tuesday, Nov 12',
      newAnnouncement: 'New Announcement',
      quickActions: 'Quick Actions',
      recentPosts: 'Recent Posts',
      draftsPending: '2 drafts pending',
      totalPosts: 'Total Posts',
      assignments: 'Assignments',
      upcomingEvents: 'Upcoming Events',
      pendingDeadlines: 'Pending Deadlines',
    },
  },
  mm: {
    sidebar: {
      expand: 'ဘေးဖယ်ကိုချဲ့မည်',
      collapse: 'ဘေးဖယ်ကိုဝှက်မည်',
      title: 'ClassSync',
      subtitle: 'BSCS 3-1',
      loggedInAs: 'ဝင်ရောက်ထားသူ',
      roleStudent: 'ကျောင်းသား',
      roleCr: 'အတန်းကိုယ်စားလှယ်',
      logout: 'ထွက်မည်',
      searchPlaceholder: 'ရှာဖွေရန်...',
      switchLanguage: 'ENG',
      switchToEnglish: 'မြန်မာ',
      themeLabel: 'မှောင်မဲ',
      themeLabelLight: 'အလင်း',
      themeTitle: 'အရောင်ပြောင်းမည်',
      roleBadgeStudent: 'ကျ',
      roleBadgeCr: 'CR',
    },
    nav: {
      dashboard: 'ဒက်ရှ်ဘုတ်',
      subjects: 'ဘာသာရပ်များ',
      attendance: 'ကျောင်းတက်မှန်ကန်မှု', 
      announcements: 'ကြေညာချက်များ',
      assignments: 'အိမ်စာများ',
      calendar: 'ပြက္ခဒိန်',
      profile: 'ပရိုဖိုင်',
      settings: 'ဆက်တင်များ',
    },
    studentDashboard: {
      recentAnnouncements: 'နောက်ဆုံးကြေညာချက်များ',
      viewAll: 'အားလုံးကြည့်မည်',
      nextDeadline: 'နောက်တစ်ကြိမ်သက်တမ်း',
      todaysSchedule: 'ယနေ့အစီအစဉ်',
      clickAssignment: 'အိမ်စာကိုကြည့်ရန် နှိပ်ပါ →',
    },
    crDashboard: {
      greeting: 'မင်္ဂလာပါ၊ အတန်းကိုယ်စားလှယ်!',
      subtitle: 'အတန်းကိုယ်စားလှယ် — BSCS 3-1 · အင်္ဂါနေ့၊ နိုဝင်ဘာ 12',
      newAnnouncement: 'ကြေညာချက်အသစ်',
      quickActions: 'အမြန်လုပ်ဆောင်မှုများ',
      recentPosts: 'နောက်ဆုံးပို့စ်များ',
      draftsPending: 'မူကြမ်း ၂ ခုစောင့်နေသည်',
      totalPosts: 'ပို့စ်စုစုပေါင်း',
      assignments: 'အိမ်စာများ',
      upcomingEvents: 'မကြာခင်ဖြစ်မည့်အဖြစ်အပျက်များ',
      pendingDeadlines: 'စောင့်ဆိုင်းနေသောသက်တမ်း',
    },
  },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ color, background: bg }}>
      {label}
    </span>
  )
}

function StatCard({ label, value, sub, color, bg, icon, isDarkMode }: { label: string; value: string; sub?: string; color: string; bg: string; icon: React.ReactNode; isDarkMode: boolean }) {
  return (
    <div className={`rounded-2xl p-5 flex items-start justify-between border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
      <div>
        <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
        {sub && <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
        {icon}
      </div>
    </div>
  )
}

function StudentDashboard({ onNavigate, isDarkMode, lang }: { onNavigate: (screen: Screen) => void; isDarkMode: boolean; lang: 'en' | 'mm' }) {
  const t = translations[lang].studentDashboard
  const announcements = [
    { title: 'Finals Exam Schedule Released', category: 'Exam', subject: 'All Subjects', author: 'Dr. Reyes', date: 'Nov 12', urgent: true },
    { title: 'Thesis Defense — BSCS 3-1 (Batch A)', category: 'Event', subject: 'Capstone Project', author: 'Prof. Santos', date: 'Nov 10', urgent: false },
    { title: 'No Class on Nov 1 — All Saints Day', category: 'Holiday', subject: 'All Subjects', author: 'Admin Office', date: 'Oct 28', urgent: false },
    { title: 'Data Structures Quiz — Chapter 6–8', category: 'Quiz', subject: 'BSCS 201', author: 'Prof. Cruz', date: 'Oct 26', urgent: true },
  ]

  const schedule = [
    { time: '7:30 AM', subject: 'Data Structures & Algo', room: 'CS Lab 2', color: '#007782' },
    { time: '9:00 AM', subject: 'Computer Networks', room: 'Room 301', color: '#7C3AED' },
    { time: '1:00 PM', subject: 'Software Engineering', room: 'Room 215', color: '#059669' },
    { time: '3:30 PM', subject: 'Technical Writing', room: 'Room 104', color: '#D97706' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border shadow-sm flex justify-between items-start ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>3</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>2 urgent</div>
          </div>
          <span className="p-2 bg-[#007782]/10 text-[#007782] rounded-xl text-sm">🔔</span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm flex justify-between items-start ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>2</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Midnight deadline</div>
          </div>
          <span className={`p-2.5 rounded-xl text-sm transition-colors ${isDarkMode ? 'bg-amber-950/60 border border-amber-800/50 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
            📝
          </span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm flex justify-between items-start ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>8</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>This week</div>
          </div>
          <span className={`p-2.5 rounded-xl text-sm transition-colors ${isDarkMode ? 'bg-purple-950/60 border border-purple-800/50 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            📖
          </span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm flex justify-between items-start ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>14</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>This month</div>
          </div>
          <span className={`p-2.5 rounded-xl text-sm transition-colors ${isDarkMode ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            ✅
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-8 p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{t.recentAnnouncements}</h2>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-medium text-[#007782] hover:underline cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
            {announcements.map((a) => (
              <div
                key={a.title}
                onClick={() => onNavigate('announcements')}
                className={`py-3.5 flex items-start justify-between cursor-pointer rounded-xl px-2 transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${a.urgent ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{a.title}</span>
                  </div>
                  <div className="flex items-center gap-2 pl-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#007782]/10 text-[#007782] text-[10px] font-semibold">
                      {a.category}
                    </span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{a.subject} • {a.author}</span>
                  </div>
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{a.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div
            onClick={() => onNavigate('assignments')}
            className="bg-[#007782] p-6 rounded-3xl text-white shadow-xl cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-[#0A8A93]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">{t.nextDeadline}</p>
                <h3 className="text-base font-bold mt-1">Data Structures Quiz</h3>
              </div>
              <span className="text-xl">⏰</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ['01', 'Day'],
                ['14', 'Hrs'],
                ['32', 'Min'],
                ['09', 'Sec'],
              ].map(([num, label]) => (
                <div
                  key={label}
                  className="bg-white/20 border border-white/20 p-3 rounded-2xl backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                >
                  <div className="text-lg font-extrabold">{num}</div>
                  <div className="text-[10px] opacity-80 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center text-xs font-medium bg-white/10 rounded-xl py-2">
              {t.clickAssignment}
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{t.todaysSchedule}</h3>

            <div className={`space-y-4 border-l-2 pl-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
              {schedule.map((s) => (
                <div
                  key={s.subject}
                  onClick={() => onNavigate('calendar')}
                  className={`relative pl-2 border-l-2 cursor-pointer rounded-lg py-1 transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
                  style={{ borderColor: s.color }}
                >
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{s.subject}</p>
                  <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{s.time} • {s.room}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CRDashboardProps {
  setActiveScreen: (screen: Screen) => void
  isDarkMode: boolean
}

function CRDashboard({ setActiveScreen, isDarkMode, lang }: CRDashboardProps & { lang: 'en' | 'mm' }) {
  const t = translations[lang].crDashboard
  const posts = [
    { title: 'Finals Exam Schedule Released', subject: 'All Subjects', status: 'Published', date: 'Nov 12', views: 142 },
    { title: 'Thesis Defense Announcement', subject: 'Capstone', status: 'Published', date: 'Nov 10', views: 98 },
    { title: 'Midterm Grades Available', subject: 'All Subjects', status: 'Draft', date: 'Nov 9', views: 0 },
    { title: 'Chapter 6–8 Quiz — Data Structures', subject: 'BSCS 201', status: 'Published', date: 'Oct 26', views: 210 },
    { title: 'Semestral Break Reminder', subject: 'All Subjects', status: 'Draft', date: 'Oct 20', views: 0 },
  ]
  const quickActions = [
    { label: 'Create Announcement', color: '#005BAC', bg: '#EBF4FF', icon: Icon.plus },
    { label: 'Upload Materials', color: '#7C3AED', bg: '#F5F3FF', icon: Icon.upload },
    { label: 'Create Assignment', color: '#059669', bg: '#ECFDF5', icon: Icon.clip },
    { label: 'Manage Categories', color: '#D97706', bg: '#FFFBEB', icon: Icon.cog },
  ]
  return (
    <div className="p-6 space-y-6 fade-up max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{t.greeting} 👋</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.subtitle}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg cursor-pointer" style={{ background: '#005BAC', fontFamily: 'Poppins, sans-serif' }}>
          {Icon.plus} {t.newAnnouncement}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.totalPosts} value="28" sub="+3 this week" color="#005BAC" bg="#EBF4FF" icon={Icon.bell} isDarkMode={isDarkMode} />
        <StatCard label={t.assignments} value="12" sub="4 due this week" color="#7C3AED" bg="#F5F3FF" icon={Icon.clip} isDarkMode={isDarkMode} />
        <StatCard label={t.upcomingEvents} value="4" sub="Next: Nov 15" color="#059669" bg="#ECFDF5" icon={Icon.cal} isDarkMode={isDarkMode} />
        <StatCard label={t.pendingDeadlines} value="3" sub="Nearest: 2 days" color="#D97706" bg="#FFFBEB" icon={Icon.check} isDarkMode={isDarkMode} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{t.quickActions}</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(a => (
              <button
                key={a.label}
                onClick={() => setActiveScreen('announcements')}
                className="rounded-xl p-4 text-left flex flex-col gap-2 border transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                style={{ background: isDarkMode ? '#1e293b' : a.bg, borderColor: `${a.color}22` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fff', color: a.color }}>
                  {a.icon}
                </div>
                <span className="text-xs font-semibold leading-tight" style={{ color: a.color, fontFamily: 'Poppins, sans-serif' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{t.recentPosts}</h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: '#FEF3C7', color: '#D97706' }}>{t.draftsPending}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
                  {['Title', 'Subject', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
                {posts.map(p => (
                  <tr key={p.title} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium truncate max-w-[200px] ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{p.title}</p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{p.views > 0 ? `${p.views} views` : 'Not published'}</p>
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{p.subject}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={p.status}
                        color={p.status === 'Published' ? '#059669' : '#D97706'}
                        bg={p.status === 'Published' ? '#ECFDF5' : '#FFFBEB'}
                      />
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{p.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer" style={{ color: '#005BAC' }}>{Icon.edit}</button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" style={{ color: '#EF4444' }}>{Icon.trash}</button>
                        {p.status === 'Draft' && (
                          <button className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors cursor-pointer" style={{ color: '#059669' }}>Publish</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ role, onLogout, isDarkMode, setIsDarkMode, lang, setLang }: Props) {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')
  const t = translations[lang].sidebar

  // LocalStorage မှ Real Profile Picture ကို ဖတ်ယူရန်
  useEffect(() => {
    try {
      const stored = localStorage.getItem('classsync_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.avatarUrl) {
          setAvatarUrl(parsed.avatarUrl)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [activeScreen])

  const navItems: Array<{ id: Screen; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: translations[lang].nav.dashboard, icon: Icon.grid },
    { id: 'subjects', label: translations[lang].nav.subjects, icon: Icon.book },
    { id: 'attendance', label: translations[lang].nav.attendance, icon: Icon.attendance },
    { id: 'announcements', label: translations[lang].nav.announcements, icon: Icon.bell, badge: '3' },
    { id: 'assignments', label: translations[lang].nav.assignments, icon: Icon.clip },
    { id: 'calendar', label: translations[lang].nav.calendar, icon: Icon.cal },
    { id: 'profile', label: translations[lang].nav.profile, icon: Icon.user },
    { id: 'settings', label: translations[lang].nav.settings, icon: Icon.cog },
  ]

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#f8fafc] text-gray-800'}`}>
      <aside
        className={`border-r flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div>
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-5 flex items-center gap-3 border-b cursor-pointer transition-colors ${
              isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/80'
            }`}
            title={isCollapsed ? t.expand : t.collapse}
          >
            <div className="w-9 h-9 rounded-xl bg-[#007782] flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm">
              🎓
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className={`font-bold text-sm leading-none ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{t.title}</h1>
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{t.subtitle}</span>
              </div>
            )}
          </div>

          <nav className="p-3 space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const active = activeScreen === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    active
                      ? 'bg-[#007782]/10 text-[#007782]'
                      : isDarkMode
                      ? 'hover:bg-slate-700/50 text-slate-300'
                      : 'hover:bg-gray-50 text-gray-600'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <span className="text-base">{item.icon}</span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{item.badge}</span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className={`p-3 border-t space-y-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          {!isCollapsed ? (
            <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <span
                className={`w-2 h-2 rounded-full ${
                  role === 'cr' ? 'bg-amber-500' : 'bg-[#007782]'
                }`}
              />

              <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                {t.loggedInAs}{" "}
                <span className="text-[#007782] font-semibold">
                  {role === 'cr' ? t.roleCr : t.roleStudent}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-[#007782] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}
                title={role === 'cr' ? t.roleCr : t.roleStudent}
              >
                {role === 'cr' ? t.roleBadgeCr : t.roleBadgeStudent}
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className={`flex items-center gap-2 text-red-500 text-xs font-semibold px-2 py-1.5 hover:opacity-80 w-full cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={t.logout}
          >
            <span className="text-base">{Icon.logout}</span>
            {!isCollapsed && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-16 border-b px-6 flex items-center justify-between ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className="relative w-72">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#007782]/20 border ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}
            />
            <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setLang(lang === 'en' ? 'mm' : 'en')}
              className={`h-8 px-2.5 flex items-center justify-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span>{lang === 'en' ? 'မြန်မာ' : 'EN'}</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`h-8 px-2.5 flex items-center justify-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-700 text-yellow-400' : 'border-gray-200 hover:bg-gray-100 text-gray-600'
              }`}
              title={t.themeTitle}
            >
              <span>{isDarkMode ? t.themeLabel : t.themeLabelLight}</span>
            </button>

            <button className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">🔔</button>
            <button className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">💬</button>
            
            {/* Real Profile Picture ကို M/J အစား ပြသခြင်း */}
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-[#007782] shadow-sm cursor-pointer"
              onClick={() => setActiveScreen('profile')}
            />
          </div>
        </header>

        <main className="p-6 flex-1 overflow-y-auto">
          {/* Dashboard Screen */}
          {activeScreen === 'dashboard' && (
            role === 'cr'
              ? <CRDashboard setActiveScreen={setActiveScreen} isDarkMode={isDarkMode} lang={lang} />
              : <StudentDashboard lang={lang} onNavigate={setActiveScreen} isDarkMode={isDarkMode} />
          )}

          {/* Subjects Screen */}
          {activeScreen === 'subjects' && <Subjects />}

          {/* Attendance Component */}
          {activeScreen === 'attendance' && (
            <Attendance role={role} isDarkMode={isDarkMode} />
          )}

          {/* Announcements Component */}
          {activeScreen === 'announcements' && (
            <Announcements role={role} isDarkMode={isDarkMode} lang={lang} />
          )}

          {/* Assignments Component */}
          {activeScreen === 'assignments' && (
            <Assignments role={role} isDarkMode={isDarkMode} />
          )}

          {/* Calendar Screen */}
          {activeScreen === 'calendar' && (
            <Calendar role={role} isDarkMode={isDarkMode} />
          )}

          {/* Profile Screen */}
          {activeScreen === 'profile' && (
            <Profile role={role} isDarkMode={isDarkMode} />
          )}

          {/* Settings Screen */}
          {activeScreen === 'settings' && (
            <Settings role={role} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} lang={lang} />
          )}

          {activeScreen !== 'dashboard' && 
           activeScreen !== 'subjects' && 
           activeScreen !== 'attendance' && 
           activeScreen !== 'announcements' && 
           activeScreen !== 'assignments' && 
           activeScreen !== 'calendar' && 
           activeScreen !== 'profile' && 
           activeScreen !== 'settings' && (
             <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
               <h2 className={`text-lg font-bold mb-2 capitalize ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{activeScreen} Screen</h2>
               <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Content for {activeScreen} is under development.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  )
}
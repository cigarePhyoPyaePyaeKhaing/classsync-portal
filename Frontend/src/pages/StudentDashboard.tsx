import React from 'react';
const translations = {
  en: {
    urgent: "2 urgent",
    midnightDeadline: "Midnight deadline",
    thisWeek: "This week",
    thisMonth: "This month",
    recentAnnouncements: "Recent Announcements",
    viewAll: "View all",
    nextDeadline: "Next Deadline",
    day: "Day",
    hrs: "Hrs",
    min: "Min",
    sec: "Sec",
    todaysSchedule: "Today's Schedule",
    // Announcements
    announcement1: "Finals Exam Schedule Released",
    announcement2: "Thesis Defense — BSCS 3-1 (Batch A)",
    announcement3: "No Class on Nov 1 — All Saints Day",
    announcement4: "Data Structures Quiz — Chapter 6–8",
    allSubjects: "All Subjects",
    capstone: "Capstone Project",
    adminOffice: "Admin Office",
    exam: "Exam",
    event: "Event",
    holiday: "Holiday",
    quiz: "Quiz",
    // Schedule
    dataStructures: "Data Structures & Algo",
    computerNetworks: "Computer Networks",
    softwareEng: "Software Engineering",
    techWriting: "Technical Writing",
  },
  mm: {
    urgent: "အရေးကြီး ၂ ခု",
    midnightDeadline: "ညသန်းခေါင် နောက်ဆုံးရက်",
    thisWeek: "ဒီတစ်ပတ်",
    thisMonth: "ဒီလအတွင်း",
    recentAnnouncements: "လတ်တလော အသိပေးချက်များ",
    viewAll: "အားလုံးကြည့်ရန်",
    nextDeadline: "နောက်ထပ် နောက်ဆုံးရက်",
    day: "ရက်",
    hrs: "နာရီ",
    min: "မိနစ်",
    sec: "စက္ကန့်",
    todaysSchedule: "ယနေ့ အချိန်စာရင်း",
    // Announcements
    announcement1: "နောက်ဆုံးပိတ် စာမေးပွဲအချိန်စာရင်း ထွက်ပြီ",
    announcement2: "ကျမ်းစာကာကွယ်ပွဲ — BSCS 3-1 (အသုတ် A)",
    announcement3: "နိုဝင်ဘာ ၁ ရက်နေ့ အတန်းပိတ်သည် — အားလပ်ရက်",
    announcement4: "ဒေတာဆထရက်ချာ ကွစ်ဇ် — အခန်း ၆-၈",
    allSubjects: "ဘာသာရပ်အားလုံး",
    capstone: "ကက်ပ်စတုန်း ပရောဂျက်",
    adminOffice: "ရုံးအဖွဲ့",
    exam: "စာမေးပွဲ",
    event: "ပွဲလမ်းသဘင်",
    holiday: "အားလပ်ရက်",
    quiz: "ကွစ်ဇ်",
    // Schedule
    dataStructures: "ဒေတာဆထရက်ချာနှင့် အယ်လ်ဂိုရီသမ်",
    computerNetworks: "ကွန်ပျူတာ နွန်ဝက်ခ်",
    softwareEng: "ဆော့ဖ်ဝဲလ် အင်ဂျင်နီယာရင်း",
    techWriting: "နည်းပညာဆိုင်ရာ စာရေးသားခြင်း",
  }
};

interface StudentDashboardProps {
  lang?: 'en' | 'mm';
}

export default function StudentDashboard({ lang = 'en' }: StudentDashboardProps) {
  // lang prop အရ သက်ဆိုင်ရာ စာသားများကို စစ်ယူခြင်း
  const t = translations[lang] || translations.en;

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Urgent Notification Card */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm flex justify-between items-start transition-colors">
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">3</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.urgent}</div>
          </div>
          <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-transparent dark:border-blue-800/50 rounded-xl text-sm transition-colors">
            🔔
          </span>
        </div>

        {/* Box 1: Midnight deadline */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm flex justify-between items-start transition-colors">
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">2</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.midnightDeadline}</div>
          </div>
          <span className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-transparent dark:border-amber-800/50 rounded-xl text-sm transition-colors">
            📝
          </span>
        </div>

        {/* Box 2: This week */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm flex justify-between items-start transition-colors">
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">8</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.thisWeek}</div>
          </div>
          <span className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-transparent dark:border-purple-800/50 rounded-xl text-sm transition-colors">
            📖
          </span>
        </div>

        {/* Box 3: This month */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm flex justify-between items-start transition-colors">
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">14</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.thisMonth}</div>
          </div>
          <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-800/50 rounded-xl text-sm transition-colors">
            ✅
          </span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Announcements List (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-slate-100">{t.recentAnnouncements}</h2>
            <button className="text-xs font-medium text-[#007782] dark:text-teal-400 hover:underline cursor-pointer">
              {t.viewAll}
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {/* Announcement 1 */}
            <div className="py-3.5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.announcement1}</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-semibold">
                    {t.exam}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-slate-400">{t.allSubjects} • Dr. Reyes</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">Nov 12</span>
            </div>

            {/* Announcement 2 */}
            <div className="py-3.5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.announcement2}</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                    {t.event}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-slate-400">{t.capstone} • Prof. Santos</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">Nov 10</span>
            </div>

            {/* Announcement 3 */}
            <div className="py-3.5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.announcement3}</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                    {t.holiday}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-slate-400">{t.allSubjects} • {t.adminOffice}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">Oct 28</span>
            </div>

            {/* Announcement 4 */}
            <div className="py-3.5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.announcement4}</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
                    {t.quiz}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-slate-400">BSCS 201 • Prof. Cruz</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">Oct 26</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Countdown Card */}
          <div className="bg-[#007782] dark:bg-teal-900/80 p-6 rounded-2xl text-white shadow-md border border-transparent dark:border-teal-700/50 transition-colors">
            <p className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">{t.nextDeadline}</p>
            <h3 className="text-base font-bold mt-1 mb-4">{t.announcement4}</h3>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/20 border border-white/20 p-2.5 rounded-xl hover:bg-white/30 transition-all duration-300">
                <div className="text-base font-bold">01</div>
                <div className="text-[10px] opacity-80">{t.day}</div>
              </div>
              <div className="bg-white/15 border border-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                <div className="text-base font-bold">14</div>
                <div className="text-[10px] opacity-80">{t.hrs}</div>
              </div>
              <div className="bg-white/15 border border-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                <div className="text-base font-bold">32</div>
                <div className="text-[10px] opacity-80">{t.min}</div>
              </div>
              <div className="bg-white/15 border border-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                <div className="text-base font-bold">09</div>
                <div className="text-[10px] opacity-80">{t.sec}</div>
              </div>
            </div>
          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-4">{t.todaysSchedule}</h3>
            
            <div className="space-y-4 border-l-2 border-gray-100 dark:border-slate-700 pl-3">
              <div className="relative pl-2 border-l-2 border-[#007782]">
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.dataStructures}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-400">7:30 AM • CS Lab 2</p>
              </div>

              <div className="relative pl-2 border-l-2 border-purple-500">
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.computerNetworks}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-400">9:00 AM • Room 301</p>
              </div>

              <div className="relative pl-2 border-l-2 border-emerald-500">
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.softwareEng}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-400">1:00 PM • Room 215</p>
              </div>

              <div className="relative pl-2 border-l-2 border-amber-500">
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.techWriting}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-400">3:30 PM • Room 104</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
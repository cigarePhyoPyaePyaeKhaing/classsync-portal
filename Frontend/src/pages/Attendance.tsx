import React, { useState } from 'react'

interface AttendanceRecord {
  id: string
  date: string
  subjectCode: string
  subjectName: string
  status: 'present' | 'absent' | 'late' | 'leave'
  lecturer: string
}

interface StudentAttendance {
  studentId: string
  name: string
  tntNo: string
  status: 'present' | 'absent' | 'late' | 'leave'
}

interface AttendanceProps {
  role?: 'student' | 'cr'
  isDarkMode?: boolean
}

// Time Slot ကို ဖြုတ်ပြီး Data Standardize လုပ်ထားပါသည်
const mockStudentRecords: AttendanceRecord[] = [
  {
    id: 'rec-1',
    date: '2026-08-03',
    subjectCode: 'CST-4104',
    subjectName: 'Artificial Intelligence',
    status: 'present',
    lecturer: 'Daw Ei Ei Moe',
  },
  {
    id: 'rec-2',
    date: '2026-08-03',
    subjectCode: 'CST-4204',
    subjectName: 'Linear Algebra',
    status: 'present',
    lecturer: 'Dr. Sandar Win',
  },
  {
    id: 'rec-3',
    date: '2026-08-02',
    subjectCode: 'CST-4306',
    subjectName: 'Management Principles and Engineering Economics',
    status: 'late',
    lecturer: 'Daw Khin Ei Ei Chaw',
  },
  {
    id: 'rec-4',
    date: '2026-08-01',
    subjectCode: 'CST-4404',
    subjectName: 'Network Design and Engineering',
    status: 'absent',
    lecturer: 'Dr. Thiri Thitsar Khaing',
  },
  {
    id: 'rec-5',
    date: '2026-07-31',
    subjectCode: 'CST-4405',
    subjectName: 'Computer Architecture and Organization',
    status: 'leave',
    lecturer: 'Dr. Tha Pyay Win',
  },
]

const initialClassStudents: StudentAttendance[] = [
  { studentId: '1', name: 'Aung Kyaw Kyaw', tntNo: 'TNT-2024-089', status: 'present' },
  { studentId: '2', name: 'Mya Mya Thaw', tntNo: 'TNT-2024-090', status: 'present' },
  { studentId: '3', name: 'Kyaw Zin Htet', tntNo: 'TNT-2024-091', status: 'absent' },
  { studentId: '4', name: 'Su Su Hlaing', tntNo: 'TNT-2024-092', status: 'late' },
  { studentId: '5', name: 'Thura Soe', tntNo: 'TNT-2024-093', status: 'present' },
  { studentId: '6', name: 'Htet Htet Aung', tntNo: 'TNT-2024-094', status: 'leave' },
]

export default function Attendance({ role = 'student', isDarkMode = false }: AttendanceProps) {
  const [records] = useState<AttendanceRecord[]>(mockStudentRecords)
  const [classStudents, setClassStudents] = useState<StudentAttendance[]>(initialClassStudents)
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [markingDate, setMarkingDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Theme Styling
  const bgClass = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-800'
  const cardBgClass = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/70 shadow-sm'
  const inputBgClass = isDarkMode
    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
  const textMutedClass = isDarkMode ? 'text-slate-400' : 'text-slate-500'

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Stats
  const totalClasses = records.length
  const presentCount = records.filter((r) => r.status === 'present').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const absentCount = records.filter((r) => r.status === 'absent').length
  const leaveCount = records.filter((r) => r.status === 'leave').length

  const attendancePercentage = Math.round(((presentCount + lateCount * 0.5) / totalClasses) * 100) || 0

  const filteredRecords = selectedSubject === 'ALL'
    ? records
    : records.filter((r) => r.subjectCode === selectedSubject)

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    setClassStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    )
  }

  const handleSaveAttendanceSheet = () => {
    showToast(`Attendance saved successfully for ${markingDate}!`)
  }

  // Real-world UI Status Badge Rendering with fixed dimensions and dot indicator
  const renderStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center justify-center gap-1.5 w-24 py-1 rounded-full text-[11px] font-semibold capitalize tracking-wide transition-all border"
    
    switch (status) {
      case 'present':
        return (
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Present
          </span>
        )
      case 'late':
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Late
          </span>
        )
      case 'absent':
        return (
          <span className={`${baseClasses} bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Absent
          </span>
        )
      case 'leave':
        return (
          <span className={`${baseClasses} bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20`}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            On Leave
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${bgClass}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-medium text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Attendance Log</h1>
            <p className={`text-xs mt-1 ${textMutedClass}`}>
              {role === 'cr'
                ? 'Mark and manage daily lecture attendance for your section'
                : 'Overview of your class attendance record and academic eligibility'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Exporting attendance report as CSV...')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${inputBgClass}`}
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <span className={`text-xs font-medium ${textMutedClass}`}>Overall Rate</span>
            <div className="text-2xl font-semibold mt-1.5 text-cyan-600 dark:text-cyan-400">{attendancePercentage}%</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">≥ 75% Requirement met</p>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <span className={`text-xs font-medium ${textMutedClass}`}>Present</span>
            <div className="text-2xl font-semibold mt-1.5 text-slate-800 dark:text-slate-100">{presentCount}</div>
            <p className={`text-[10px] mt-1 ${textMutedClass}`}>Lectures attended</p>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <span className={`text-xs font-medium ${textMutedClass}`}>Late</span>
            <div className="text-2xl font-semibold mt-1.5 text-amber-600 dark:text-amber-400">{lateCount}</div>
            <p className={`text-[10px] mt-1 ${textMutedClass}`}>Half credit calculated</p>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <span className={`text-xs font-medium ${textMutedClass}`}>Absent</span>
            <div className="text-2xl font-semibold mt-1.5 text-rose-600 dark:text-rose-400">{absentCount}</div>
            <p className={`text-[10px] mt-1 ${textMutedClass}`}>Unexcused absences</p>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass} col-span-2 sm:col-span-1`}>
            <span className={`text-xs font-medium ${textMutedClass}`}>On Leave</span>
            <div className="text-2xl font-semibold mt-1.5 text-purple-600 dark:text-purple-400">{leaveCount}</div>
            <p className={`text-[10px] mt-1 ${textMutedClass}`}>Approved requests</p>
          </div>

        </div>

        {/* ROLE 1: CLASS REP (CR) ATTENDANCE MARKER SHEET */}
        {role === 'cr' && (
          <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${cardBgClass}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-semibold">Class Roll Call</h2>
                <p className={`text-xs ${textMutedClass}`}>Section A • Computer Technology</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={markingDate}
                  onChange={(e) => setMarkingDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs outline-none ${inputBgClass}`}
                />
                <button
                  type="button"
                  onClick={handleSaveAttendanceSheet}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save Attendance
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="pb-3 font-medium">Student Name</th>
                    <th className="pb-3 font-medium">TNT No.</th>
                    <th className="pb-3 font-medium text-center">Mark Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {classStudents.map((s) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-medium">{s.name}</td>
                      <td className="py-3.5 font-mono text-slate-400">{s.tntNo}</td>
                      <td className="py-3.5">
                        <div className="flex justify-center gap-1.5">
                          {(['present', 'late', 'absent', 'leave'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.studentId, st)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-medium capitalize transition-all cursor-pointer ${
                                s.status === st
                                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                                  : isDarkMode
                                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLE 2: STUDENT PERSONAL ATTENDANCE HISTORY LOG */}
        <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${cardBgClass}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <h2 className="text-base font-semibold">Attendance History</h2>

            <div className="flex items-center gap-2">
              <span className={`text-xs ${textMutedClass}`}>Filter Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs outline-none cursor-pointer transition-colors ${inputBgClass}`}
              >
                <option value="ALL">All Subjects</option>
                <option value="CST-4104">CST-4104 (Artificial Intelligence)</option>
                <option value="CST-4204">CST-4204 (Linear Algebra)</option>
                <option value="CST-4306">CST-4306 (Management & Economics)</option>
                <option value="CST-4404">CST-4404 (Network Design)</option>
                <option value="CST-4405">CST-4405 (Computer Architecture)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="pb-3 font-medium w-32">Date</th>
                  <th className="pb-3 font-medium w-32">Course Code</th>
                  <th className="pb-3 font-medium">Course & Lecturer</th>
                  <th className="pb-3 font-medium text-right w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-mono text-slate-500 dark:text-slate-400">{r.date}</td>
                    <td className="py-3.5 font-mono font-semibold text-cyan-600 dark:text-cyan-400">{r.subjectCode}</td>
                    <td className="py-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{r.subjectName}</div>
                      <div className={`text-[11px] mt-0.5 ${textMutedClass}`}>{r.lecturer}</div>
                    </td>
                    <td className="py-3.5 text-right">
                      {renderStatusBadge(r.status)}
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
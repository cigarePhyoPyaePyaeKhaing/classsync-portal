import React, { useState, useRef } from 'react'

interface ProfileUser {
  id: string | number
  name: string
  studentId: string
  email: string
  role: 'student' | 'cr'
  department: string
  academicYear: string
  semester: string
  section: string
  major: string | null
  avatarUrl: string
  phone: string
  address: string
  emergencyContact: string
  bio: string
}

interface ProfileProps {
  role?: 'student' | 'cr'
  isDarkMode?: boolean
}

export default function Profile({ role: initialRole = 'student', isDarkMode = false }: ProfileProps) {
  const [user, setUser] = useState<ProfileUser>(() => {
    let realData: ProfileUser = {
      id: '1',
      name: 'User',
      studentId: 'TNT-2464',
      email: '',
      role: initialRole,
      department: 'Computer Technology',
      academicYear: 'Semester 4 • Section B',
      semester: 'Semester 4',
      section: 'B',
      major: null,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: 'Not provided',
      address: 'Not provided',
      emergencyContact: 'Not provided',
      bio: 'Not provided',
    }

    try {
      const stored = localStorage.getItem('classsync_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        
        const id = parsed.id || realData.id
        const name = parsed.name || parsed.fullName || realData.name
        const studentId = parsed.tntNo || parsed.tnt_no || parsed.studentId || parsed.tnt || 'TNT-2464'
        const email = parsed.email || realData.email
        const role = parsed.role || initialRole
        
        const semStr = parsed.semester || parsed.sem || parsed.academicYear || 'Semester 4'
        const secStr = parsed.section || parsed.sec || 'B'
        const semNum = parseInt(semStr.replace(/[^0-9]/g, '') || '4', 10)
        
        realData = {
          ...realData,
          id,
          name,
          studentId,
          email,
          role,
          semester: semStr,
          section: secStr,
          academicYear: `${semStr.includes('Semester') ? semStr : `Semester ${semStr}`} • Section ${secStr}`,
          major: semNum >= 5 ? (parsed.major || 'Software Engineering') : null,
          avatarUrl: parsed.avatarUrl || parsed.avatar || realData.avatarUrl,
          phone: parsed.phone || 'Not provided',
          address: parsed.address || 'Not provided',
          emergencyContact: parsed.emergencyContact || 'Not provided',
          bio: parsed.bio || 'Not provided',
        }
      }
    } catch (e) {
      console.error(e)
    }
    return realData
  })

  const [isEditing, setIsEditing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [draft, setDraft] = useState({
    name: user.name,
    studentId: user.studentId,
    semester: user.semester,
    section: user.section,
    phone: user.phone === 'Not provided' ? '' : user.phone,
    email: user.email,
    address: user.address === 'Not provided' ? '' : user.address,
    bio: user.bio === 'Not provided' ? '' : user.bio,
    major: user.major || '',
  })

  const bgClass = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
  const cardBgClass = isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
  const inputBgClass = isDarkMode
    ? 'bg-slate-800/80 text-gray-100 placeholder-gray-500 border-slate-700'
    : 'bg-slate-100 text-slate-800 placeholder-slate-400 border-slate-300'
  const textMutedClass = isDarkMode ? 'text-slate-400' : 'text-slate-500'
  const textLabelClass = isDarkMode ? 'text-slate-300' : 'text-slate-700'
  const tabActiveBg = isDarkMode ? 'bg-[#007782] text-white' : 'bg-[#007782] text-white'

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Real Profile Picture Upload via Backend API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB!')
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const stored = localStorage.getItem('classsync_user')
      const parsed = stored ? JSON.parse(stored) : {}
      formData.append('userId', String(user.id || parsed.id || '1'))

      const response = await fetch('http://localhost:5000/auth/upload-avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Upload failed')

      setUser((prev) => ({ ...prev, avatarUrl: data.avatarUrl }))

      localStorage.setItem('classsync_user', JSON.stringify({
        ...parsed,
        avatarUrl: data.avatarUrl,
      }))

      showToast('Profile picture uploaded successfully!')
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Image upload failed!')
    }
  }

  // Handle Save Profile and Sync with Database
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const semNum = parseInt(draft.semester.replace(/[^0-9]/g, '') || '1', 10)
    const calculatedMajor = semNum >= 5 ? (draft.major.trim() || 'Software Engineering') : null

    const updatedUser: ProfileUser = {
      ...user,
      name: draft.name,
      studentId: draft.studentId.trim() || 'TNT-2464',
      semester: draft.semester,
      section: draft.section,
      academicYear: `${draft.semester} • Section ${draft.section}`,
      major: calculatedMajor,
      phone: draft.phone.trim() || 'Not provided',
      email: draft.email,
      address: draft.address.trim() || 'Not provided',
      bio: draft.bio.trim() || 'Not provided',
    }

    try {
      const response = await fetch('http://localhost:5000/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: draft.name,
          studentId: draft.studentId,
          semester: draft.semester,
          section: draft.section,
          major: calculatedMajor,
          phone: draft.phone,
          address: draft.address,
          bio: draft.bio,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update in database')

      setUser(updatedUser)

      const stored = localStorage.getItem('classsync_user')
      const parsed = stored ? JSON.parse(stored) : {}
      localStorage.setItem('classsync_user', JSON.stringify({
        ...parsed,
        name: draft.name,
        tntNo: draft.studentId,
        semester: draft.semester,
        section: draft.section,
        major: calculatedMajor,
        phone: draft.phone,
        address: draft.address,
        bio: draft.bio,
      }))

      setIsEditing(false)
      showToast('Profile updated & saved to database successfully!')
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to save changes to database!')
    }
  }

  const draftSemNum = parseInt(draft.semester.replace(/[^0-9]/g, '') || '1', 10)

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${bgClass}`}>
      
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        <div className={`rounded-3xl border overflow-hidden transition-colors ${cardBgClass}`}>
          <div className="h-32 sm:h-40 bg-gradient-to-r from-[#007782] via-teal-700 to-slate-800 relative">
            <span className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white/90 text-[11px] px-3 py-1 rounded-full border border-white/20 font-medium">
              Academic ID Verified
            </span>
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative group">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-1.5 bg-[#007782] text-white rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer"
                    title="Upload Real Profile Picture"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                      user.role === 'cr' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-[#007782]/20 text-[#007782] border border-[#007782]/30'
                    }`}>
                      {user.role === 'cr' ? 'Class Rep' : 'Student'}
                    </span>
                  </div>
                  <p className={`text-xs font-mono ${textMutedClass}`}>
                    {user.studentId}{user.major ? ` • ${user.major}` : ''}
                  </p>
                  <p className={`text-xs ${textMutedClass}`}>{user.academicYear}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-2xl bg-[#007782] hover:bg-[#006069] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>

            </div>
          </div>
        </div>

        <div className={`rounded-3xl border p-5 sm:p-6 transition-colors ${cardBgClass}`}>
          <div className="flex items-center gap-2 border-b border-slate-700/40 pb-4 mb-6">
            <button
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${tabActiveBg}`}
            >
              Personal Information
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMutedClass}`}>Contact Email</span>
                <p className="text-sm font-medium mt-1">{user.email}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMutedClass}`}>Phone Number</span>
                <p className="text-sm font-medium mt-1">{user.phone}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMutedClass}`}>Residential Address</span>
                <p className="text-sm font-medium mt-1">{user.address}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMutedClass}`}>Emergency Contact</span>
                <p className="text-sm font-medium mt-1">{user.emergencyContact}</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMutedClass}`}>Biography</span>
              <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${textLabelClass}`}>{user.bio}</p>
            </div>
          </div>
        </div>

      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl transition-colors ${cardBgClass}`}>
            
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3 mb-4">
              <h3 className="text-base font-bold">Update Profile Details</h3>
              <button
                onClick={() => setIsEditing(false)}
                className={`p-1 rounded-xl text-xs ${textMutedClass} hover:text-white cursor-pointer`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Full Name</label>
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>TNT No (Student ID)</label>
                  <input
                    type="text"
                    required
                    value={draft.studentId}
                    onChange={(e) => setDraft((prev) => ({ ...prev, studentId: e.target.value.toUpperCase() }))}
                    placeholder="e.g. TNT-2464"
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Email</label>
                  <input
                    type="email"
                    required
                    value={draft.email}
                    onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Semester</label>
                  <select
                    value={draft.semester}
                    onChange={(e) => setDraft((prev) => ({ ...prev, semester: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                  >
                    {['1', '2', '3', '4', '5', '6', '7', '8'].map((s) => (
                      <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Section</label>
                  <select
                    value={draft.section}
                    onChange={(e) => setDraft((prev) => ({ ...prev, section: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                  >
                    {['A', 'B', 'C', 'D'].map((sec) => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {draftSemNum >= 5 && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Major / Specialization</label>
                  <input
                    type="text"
                    value={draft.major}
                    onChange={(e) => setDraft((prev) => ({ ...prev, major: e.target.value }))}
                    placeholder="e.g. Software Engineering, CS, CT"
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Phone Number</label>
                <input
                  type="text"
                  value={draft.phone}
                  onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +95 9..."
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Residential Address</label>
                <input
                  type="text"
                  value={draft.address}
                  onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Yangon"
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textLabelClass}`}>Biography</label>
                <textarea
                  rows={2}
                  value={draft.bio}
                  onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Write something about yourself..."
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-[#007782]/50 ${inputBgClass}`}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#007782] hover:opacity-90 shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
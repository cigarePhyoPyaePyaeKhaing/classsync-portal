interface Props {
  setActiveScreen: (screen: any) => void
}

export default function CRDashboard({ setActiveScreen }: Props) {
  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-gray-800">28</div>
            <div className="text-xs text-gray-500 mt-1">+3 this week</div>
          </div>
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-sm">📢</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-gray-800">12</div>
            <div className="text-xs text-gray-500 mt-1">4 due this week</div>
          </div>
          <span className="p-2 bg-purple-50 text-purple-600 rounded-xl text-sm">📂</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-gray-800">4</div>
            <div className="text-xs text-gray-500 mt-1">Next: Nov 15</div>
          </div>
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm">📊</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-gray-800">3</div>
            <div className="text-xs text-gray-500 mt-1">Nearest: 2 days</div>
          </div>
          <span className="p-2 bg-amber-50 text-amber-600 rounded-xl text-sm">📝</span>
        </div>
      </div>

      {/* Main CR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveScreen('announcements')}
              className="p-4 rounded-2xl bg-blue-50/60 hover:bg-blue-50 transition-all text-left border border-blue-100/50 cursor-pointer"
            >              <span className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center text-sm font-bold mb-3">+</span>
              <p className="text-xs font-bold text-blue-900 leading-tight">Create Announcement</p>
            </button>

<button
  onClick={() => setActiveScreen('subjects')}
  className="p-4 rounded-2xl bg-purple-50/60 hover:bg-purple-50 transition-all text-left border border-purple-100/50 cursor-pointer"
>              <span className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center text-sm mb-3">📤</span>
              <p className="text-xs font-bold text-purple-900 leading-tight">Upload Materials</p>
            </button>

            <button
              onClick={() => setActiveScreen('assignments')}
              className="p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 transition-all text-left border border-emerald-100/50 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm mb-3">📋</span>
              <p className="text-xs font-bold text-emerald-900 leading-tight">Create Assignment</p>
            </button>

            <button
              onClick={() => setActiveScreen('subjects')}
              className="p-4 rounded-2xl bg-amber-50/60 hover:bg-amber-50 transition-all text-left border border-amber-100/50 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm mb-3">⚙️</span>
              <p className="text-xs font-bold text-amber-900 leading-tight">Manage Categories</p>
            </button>
          </div>
        </div>

        {/* Recent Posts Management Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Recent Posts</h2>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">2 drafts pending</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-medium">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr
                  onClick={() => setActiveScreen('announcements')}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="py-3">
                    <p className="font-semibold text-gray-800">Finals Exam Schedule Released</p>
                    <p className="text-[10px] text-gray-400">142 views</p>
                  </td>
                  <td className="py-3 text-gray-500">All Subjects</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-semibold text-[10px]">Published</span></td>
                  <td className="py-3 text-gray-400">Nov 12</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveScreen('announcements')
                      }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert('Delete post')
                      }}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>

                <tr
                  onClick={() => setActiveScreen('announcements')}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="py-3">
                    <p className="font-semibold text-gray-800">Thesis Defense Announcement</p>
                    <p className="text-[10px] text-gray-400">98 views</p>
                  </td>
                  <td className="py-3 text-gray-500">Capstone</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-semibold text-[10px]">Published</span></td>
                  <td className="py-3 text-gray-400">Nov 10</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveScreen('announcements')
                      }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert('Delete post')
                      }}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>

                <tr
                  onClick={() => setActiveScreen('announcements')}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="py-3">
                    <p className="font-semibold text-gray-800">Midterm Grades Available</p>
                    <p className="text-[10px] text-gray-400">Not published</p>
                  </td>
                  <td className="py-3 text-gray-500">All Subjects</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 font-semibold text-[10px]">Draft</span></td>
                  <td className="py-3 text-gray-400">Nov 9</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveScreen('announcements')
                      }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert('Delete post')
                      }}
  className="text-red-500 hover:underline cursor-pointer"
>
  🗑️
</button>
<button
  onClick={(e) => {
    e.stopPropagation()
    alert('Published successfully')
  }}
  className="text-[#007782] font-semibold hover:underline ml-1 cursor-pointer"
>
  Publish
</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
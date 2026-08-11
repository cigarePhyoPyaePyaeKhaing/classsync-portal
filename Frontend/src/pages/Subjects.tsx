import { useState } from 'react'
import { useTheme } from './ThemeContext'

type SubjectTab = 'lectures' | 'announcements'

interface LectureItem {
  title: string
  duration: string
  description: string
  pdf: string
  slides: string
  video: string
}

interface ScheduleItem {
  day: string
  time: string
  room: string
  type: string
}

interface AnnouncementItem {
  title: string
  message: string
  date: string
  priority: 'High' | 'Medium' | 'Low'
}

interface Subject {
  code: string
  name: string
  lecturer: string
  room: string
  description: string
  progress: number
  badge: string
  lectures: LectureItem[]
  schedule: ScheduleItem[]
  announcements: AnnouncementItem[]
}

const SUBJECTS: Subject[] = [
  {
    code: 'CST-4104',
    name: 'Artificial Intelligence',
    lecturer: 'Daw Ei Ei Moe',
    room: 'Room 324',
    description: 'Foundational concepts in AI, search strategies, and intelligent systems.',
    progress: 82,
    badge: 'Live',
    lectures: [
      {
        title: 'Lecture 1: Introduction to AI',
        duration: '12 min',
        description: 'Overview of AI, machine learning, and real-world applications.',
        pdf: 'AI_Intro.pdf',
        slides: 'AI_Intro_Presentation.pptx',
        video: 'Watch lecture recording',
      },
      {
        title: 'Lecture 2: Core Concepts & Search',
        duration: '18 min',
        description: 'Explores state-space search, heuristics, and problem-solving.',
        pdf: 'Search_Strategies.pdf',
        slides: 'Search_Strategies.pptx',
        video: 'Watch lecture recording',
      },
    ],
    schedule: [
      { day: 'Monday', time: '8:30 - 9:30', room: 'Room 324', type: 'Lecture' },
      { day: 'Thursday', time: '1:50 - 2:50', room: 'Room 324', type: 'Lecture' },
    ],
    announcements: [
      { title: 'Assignment Reminder', message: 'The AI mini-project is due next Friday.', date: 'Today', priority: 'High' },
      { title: 'New Reading Material', message: 'A new chapter on search algorithms has been uploaded.', date: 'Yesterday', priority: 'Medium' },
    ],
  },
  {
    code: 'CST-4204',
    name: 'Linear Algebra',
    lecturer: 'Dr. Sandar Win',
    room: 'Room 426',
    description: 'Core linear algebra topics for computation and engineering problem-solving.',
    progress: 76,
    badge: 'In Progress',
    lectures: [
      {
        title: 'Lecture 1: Matrices & Vectors',
        duration: '15 min',
        description: 'Covers vectors, matrices, and matrix operations.',
        pdf: 'Matrices.pdf',
        slides: 'Matrices.pptx',
        video: 'Watch lecture recording',
      },
      {
        title: 'Lecture 2: Transformations',
        duration: '14 min',
        description: 'Introduces linear transformations and geometric interpretations.',
        pdf: 'Transformations.pdf',
        slides: 'Transformations.pptx',
        video: 'Watch lecture recording',
      },
    ],
    schedule: [
      { day: 'Tuesday', time: '9:40 - 10:40', room: 'Room 325', type: 'Lecture' },
      { day: 'Wednesday', time: '1:50 - 2:50', room: 'Room 426', type: 'Tutorial' },
    ],
    announcements: [
      { title: 'Quiz Posted', message: 'A short quiz on matrices is now available.', date: 'Today', priority: 'Medium' },
    ],
  },
  {
    code: 'CST-4306',
    name: 'Management Principles and Engineering Economics',
    lecturer: 'Daw Khin Ei Ei Chaw',
    room: 'Room 422',
    description: 'Business management concepts blended with engineering economics.',
    progress: 68,
    badge: 'Upcoming',
    lectures: [
      {
        title: 'Lecture 1: Planning & Organizing',
        duration: '11 min',
        description: 'Discusses organizational behavior and planning techniques.',
        pdf: 'Planning.pdf',
        slides: 'Planning.pptx',
        video: 'Watch lecture recording',
      },
    ],
    schedule: [
      { day: 'Monday', time: '3:00 - 4:00', room: 'Room 324', type: 'Lecture' },
      { day: 'Tuesday', time: '10:50 - 11:50', room: 'Room 422', type: 'Tutorial' },
    ],
    announcements: [
      { title: 'Case Study Posted', message: 'Please review the engineering economics case before class.', date: 'Yesterday', priority: 'Low' },
    ],
  },
  {
    code: 'CST-4404',
    name: 'Network Design and Engineering',
    lecturer: 'Dr. Thiri Thitsar Khaing',
    room: 'Room 422',
    description: 'Principles of network architecture, planning, and implementation.',
    progress: 90,
    badge: 'Popular',
    lectures: [
      {
        title: 'Lecture 1: Network Topologies',
        duration: '16 min',
        description: 'Introduces LAN, WAN, and design considerations.',
        pdf: 'Network_Topologies.pdf',
        slides: 'Network_Topologies.pptx',
        video: 'Watch lecture recording',
      },
      {
        title: 'Lecture 2: Routing Basics',
        duration: '17 min',
        description: 'Explains routing concepts and protocol fundamentals.',
        pdf: 'Routing_Basics.pdf',
        slides: 'Routing_Basics.pptx',
        video: 'Watch lecture recording',
      },
    ],
    schedule: [
      { day: 'Monday', time: '10:50 - 11:50', room: 'Room 422', type: 'Lecture' },
      { day: 'Friday', time: '1:50 - 2:50', room: 'Room 324', type: 'Lecture' },
    ],
    announcements: [
      { title: 'Lab Session Updated', message: 'The packet tracer lab has been moved to Friday.', date: 'Today', priority: 'High' },
    ],
  },
  {
    code: 'CST-4405',
    name: 'Computer Architecture and Organization',
    lecturer: 'Dr. Tha Pyay Win',
    room: 'Room 335',
    description: 'Hardware organization, instruction sets, and internal computer design.',
    progress: 73,
    badge: 'On Track',
    lectures: [
      {
        title: 'Lecture 1: CPU Fundamentals',
        duration: '13 min',
        description: 'Introduction to instruction cycles and CPU components.',
        pdf: 'CPU_Fundamentals.pdf',
        slides: 'CPU_Fundamentals.pptx',
        video: 'Watch lecture recording',
      },
    ],
    schedule: [
      { day: 'Monday', time: '8:30 - 9:30', room: 'Room 426', type: 'Lecture' },
      { day: 'Thursday', time: '3:00 - 4:00', room: 'Room 335', type: 'Lecture' },
    ],
    announcements: [
      { title: 'Midterm Review', message: 'A review sheet for computer architecture is now available.', date: 'Yesterday', priority: 'Medium' },
    ],
  },
  {
    code: 'CST-4503',
    name: 'IELTS Academic Skills and Strategies',
    lecturer: 'Daw Khin Cho Latt',
    room: 'Room 244',
    description: 'Academic English preparation with emphasis on reading and writing.',
    progress: 85,
    badge: 'Active',
    lectures: [
      {
        title: 'Lecture 1: Reading Strategies',
        duration: '10 min',
        description: 'Examines skimming, scanning, and effective reading techniques.',
        pdf: 'Reading_Strategies.pdf',
        slides: 'Reading_Strategies.pptx',
        video: 'Watch lecture recording',
      },
      {
        title: 'Lecture 2: Writing Task 1',
        duration: '12 min',
        description: 'Focuses on academic writing structure and coherence.',
        pdf: 'Writing_Task1.pdf',
        slides: 'Writing_Task1.pptx',
        video: 'Watch lecture recording',
      },
    ],
    schedule: [
      { day: 'Monday', time: '1:50 - 2:50', room: 'Room 324', type: 'Lecture' },
      { day: 'Friday', time: '10:50 - 11:50', room: 'Room 244', type: 'Workshop' },
    ],
    announcements: [
      { title: 'Speaking Practice', message: 'Speaking practice sessions will start next week.', date: 'Today', priority: 'Low' },
    ],
  },
  {
    code: 'CST-4105',
    name: 'Enterprise Applications Development using Java (Keystone Project)',
    lecturer: 'Dr. Dim Em Nyaung',
    room: 'Room 233',
    description: 'Hands-on software engineering project development using Java.',
    progress: 79,
    badge: 'Project',
    lectures: [
      {
        title: 'Lecture 1: Java Fundamentals',
        duration: '20 min',
        description: 'Covers classes, methods, inheritance, and object-oriented design.',
        pdf: 'Java_Fundamentals.pdf',
        slides: 'Java_Fundamentals.pptx',
        video: 'Watch lecture recording',
      },
      {
        title: 'Lecture 2: Building the Keystone Project',
        duration: '19 min',
        description: 'Shows how to plan and structure the project milestone.',
        pdf: 'Keystone_Project.pdf',
        slides: 'Keystone_Project.pptx',
        video: 'Watch lecture recording',
      },
    ],
    schedule: [
      { day: 'Wednesday', time: '8:30 - 9:30', room: 'Room 233', type: 'Lab' },
      { day: 'Friday', time: '3:00 - 4:00', room: 'Room 235', type: 'Project Session' },
    ],
    announcements: [
      { title: 'Milestone 2 Posted', message: 'Please submit the controller and service layer this week.', date: 'Today', priority: 'High' },
    ],
  },
]

export default function Subjects() {
  // isDarkMode ကို CSS အတွက်မသုံးတော့ဘဲ Tailwind ရဲ့ dark: class တွေကိုပဲ အသုံးပြုထားပါတယ်
  const { isDarkMode } = useTheme() 
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [activeTab, setActiveTab] = useState<SubjectTab>('lectures')

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    setActiveTab('lectures')
  }

  return (
    <div className="w-full">
      {selectedSubject ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span>←</span>
            <span>Back to Subjects</span>
          </button>

          {/* Details Header Card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                  {selectedSubject.code}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{selectedSubject.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{selectedSubject.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Lecturer: {selectedSubject.lecturer}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Room: {selectedSubject.room}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
                  Join Live Session
                </button>
                <button type="button" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                  Download Materials
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Area */}
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'lectures', label: 'Lectures & Materials' },
                { key: 'announcements', label: 'Announcements & Notes' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as SubjectTab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              {activeTab === 'lectures' && (
                <div className="space-y-4">
                  {selectedSubject.lectures.map((lecture, index) => (
                    <div key={`${selectedSubject.code}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{lecture.title}</h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lecture.description}</p>
                          <p className="mt-2 text-sm font-medium text-cyan-600 dark:text-cyan-400">Duration: {lecture.duration}</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          Recorded
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" className="rounded-full bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                          Download PDF
                        </button>
                        <button type="button" className="rounded-full bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                          View Presentation
                        </button>
                      </div>

                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-900">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Video Lecture</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lecture.video}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-3">
                  {selectedSubject.announcements.map((item, index) => (
                    <div key={`${selectedSubject.code}-notice-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.priority === 'High' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' : item.priority === 'Medium' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.message}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{item.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Learning Platform</h2>
              </div>
              <div className="rounded-full bg-cyan-600 px-3 py-1 text-sm font-medium text-white">
                {SUBJECTS.length} Active Subjects
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.code}
                type="button"
                onClick={() => handleSelectSubject(subject)}
                className="rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">{subject.code}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{subject.name}</h3>
                  </div>
                  <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    {subject.badge}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{subject.description}</p>

                <div className="mt-5 rounded-2xl border border-gray-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Lecturer</span>
                    <span className="font-medium text-slate-900 dark:text-white">{subject.lecturer}</span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${subject.progress}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
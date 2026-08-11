import React, { useMemo, useState } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'Exam' | 'Assignment' | 'Holiday' | 'Lecture' | 'Event';
  description?: string;
  location?: string;
}

interface CalendarProps {
  role?: 'student' | 'cr';
  isDarkMode?: boolean;
}

interface CalendarEventDraft {
  title: string;
  date: string;
  time: string;
  category: 'Exam' | 'Assignment' | 'Holiday' | 'Lecture' | 'Event';
  description: string;
  location: string;
}

const initialEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Midterm Exam',
    date: '2026-08-15',
    time: '10:00 AM - 12:00 PM',
    category: 'Exam',
    description: 'Computer Architecture midterm exam in the main hall.',
    location: 'Room 302',
  },
  {
    id: 'e2',
    title: 'Data Structures Assignment Due',
    date: '2026-08-10',
    time: '11:59 PM',
    category: 'Assignment',
    description: 'Submit the linked list implementation project.',
    location: 'Online Submission',
  },
  {
    id: 'e3',
    title: 'Holiday Break',
    date: '2026-08-17',
    time: 'All Day',
    category: 'Holiday',
    description: 'Campus will be closed for the national holiday.',
    location: 'Campus',
  },
  {
    id: 'e4',
    title: 'Web Development Lecture',
    date: '2026-08-20',
    time: '02:00 PM - 04:00 PM',
    category: 'Lecture',
    description: 'Session on responsive design principles and accessibility.',
    location: 'Lab 4',
  },
  {
    id: 'e5',
    title: 'Student Club Meetup',
    date: '2026-08-22',
    time: '06:30 PM - 08:00 PM',
    category: 'Event',
    description: 'Networking and project showcase with club members.',
    location: 'Student Lounge',
  },
];

const categories: Array<CalendarEvent['category']> = ['Exam', 'Assignment', 'Holiday', 'Lecture', 'Event'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const emptyDraft = (): CalendarEventDraft => ({
  title: '',
  date: '',
  time: '',
  category: 'Event',
  description: '',
  location: '',
});

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCategoryClasses = (category: CalendarEvent['category'], isDarkMode: boolean) => {
  switch (category) {
    case 'Exam':
      return isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700';
    case 'Assignment':
      return isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700';
    case 'Holiday':
      return isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700';
    case 'Lecture':
      return isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700';
    default:
      return isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700';
  }
};

const Calendar: React.FC<CalendarProps> = ({ role = 'cr', isDarkMode = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1));
  const [selectedDate, setSelectedDate] = useState('2026-08-15');
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [filter, setFilter] = useState<'All' | CalendarEvent['category']>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<CalendarEventDraft>(emptyDraft());

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesFilter = filter === 'All' || event.category === filter;
      const sameMonth = event.date.startsWith(`${currentMonth.getFullYear()}-${`${currentMonth.getMonth() + 1}`.padStart(2, '0')}`);
      return matchesFilter && sameMonth;
    });
  }, [currentMonth, events, filter]);

  const selectedDayEvents = useMemo(() => {
    return visibleEvents.filter((event) => event.date === selectedDate);
  }, [selectedDate, visibleEvents]);

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startsOn = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    for (let i = 0; i < startsOn; i += 1) {
      const prevDate = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - startsOn + i);
      cells.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), isCurrentMonth: true });
    }

    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day += 1) {
      cells.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day), isCurrentMonth: false });
    }

    return cells;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDateKey(today));
  };

  const handleAddEvent = (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.date || !draft.time.trim()) {
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: draft.title.trim(),
      date: draft.date,
      time: draft.time.trim(),
      category: draft.category,
      description: draft.description.trim() || undefined,
      location: draft.location.trim() || undefined,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setSelectedDate(draft.date);
    setIsModalOpen(false);
    setDraft(emptyDraft());
  };

  const containerClasses = isDarkMode
    ? 'min-h-screen bg-slate-950 text-slate-100'
    : 'min-h-screen bg-slate-50 text-slate-900';
  const cardClasses = isDarkMode
    ? 'border border-slate-700 bg-slate-900/80 shadow-slate-900/40'
    : 'border border-gray-100 bg-white shadow-slate-100';
  const inputClasses = isDarkMode
    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-cyan-500'
    : 'border-gray-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const mutedText = isDarkMode ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={containerClasses}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className={`rounded-3xl border p-6 shadow-sm ${cardClasses}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${secondaryText}`}>ClassSync</p>
              <h1 className="mt-2 text-3xl font-semibold">Academic Calendar</h1>
              <p className={`mt-2 max-w-2xl text-sm sm:text-base ${mutedText}`}>
                View your month at a glance, jump to specific days, and keep important campus events organized.
              </p>
            </div>
            {role === 'cr' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                + Add Event
              </button>
            )}
          </div>
        </header>

        <section className={`rounded-3xl border p-4 shadow-sm ${cardClasses}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className={`rounded-full px-3 py-2 text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                ← Previous
              </button>
              <button
                onClick={goToToday}
                className={`rounded-full px-3 py-2 text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className={`rounded-full px-3 py-2 text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Next →
              </button>
            </div>
            <div className="text-xl font-semibold">{monthLabel}</div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as 'All' | CalendarEvent['category'])}
              className={`rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.8fr_0.95fr]">
          <section className={`rounded-3xl border p-3 shadow-sm ${cardClasses}`}>
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              {dayNames.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, index) => {
                const dateKey = formatDateKey(cell.date);
                const isSelected = selectedDate === dateKey;
                const dayEvents = visibleEvents.filter((event) => event.date === dateKey);

                return (
                  <button
                    key={`${dateKey}-${index}`}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`flex min-h-[92px] flex-col rounded-2xl border p-2 text-left transition ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-sm'
                        : cell.isCurrentMonth
                          ? isDarkMode
                            ? 'border-slate-700 bg-slate-900/40 hover:bg-slate-800'
                            : 'border-gray-100 bg-white hover:bg-slate-50'
                          : isDarkMode
                            ? 'border-slate-800 bg-slate-950/50 text-slate-500'
                            : 'border-gray-50 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-semibold">{cell.date.getDate()}</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCategoryClasses(event.category, isDarkMode)}`}
                        >
                          {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className={`rounded-3xl border p-5 shadow-sm ${cardClasses}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedDate}</h2>
                <p className={`mt-1 text-sm ${secondaryText}`}>Events for this day</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => (
                  <div key={event.id} className={`rounded-2xl border p-3 ${isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-slate-50'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getCategoryClasses(event.category, isDarkMode)}`}>
                        {event.category}
                      </span>
                      <span className={`text-xs ${secondaryText}`}>{event.time}</span>
                    </div>
                    <h3 className="mt-2 font-semibold">{event.title}</h3>
                    {event.description && <p className={`mt-1 text-sm ${mutedText}`}>{event.description}</p>}
                    {event.location && <p className={`mt-1 text-sm ${secondaryText}`}>📍 {event.location}</p>}
                  </div>
                ))
              ) : (
                <div className={`rounded-2xl border border-dashed p-4 text-center ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-slate-500'}`}>
                  No events on this date.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl ${cardClasses}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Add New Event</h3>
                <p className={`mt-1 text-sm ${secondaryText}`}>Schedule a new exam, lecture, event, or holiday.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className={`rounded-full px-3 py-1.5 text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                Close
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Title</span>
                  <input
                    required
                    value={draft.title}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder="Event title"
                  />
                </label>
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Category</span>
                  <select
                    value={draft.category}
                    onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value as CalendarEvent['category'] }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Date</span>
                  <input
                    required
                    type="date"
                    value={draft.date}
                    onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                  />
                </label>
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Time</span>
                  <input
                    required
                    value={draft.time}
                    onChange={(event) => setDraft((prev) => ({ ...prev, time: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder="10:00 AM - 12:00 PM"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Description</span>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder="Optional details"
                  />
                </label>
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Location</span>
                  <input
                    value={draft.location}
                    onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder="Room 302 or Online"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;

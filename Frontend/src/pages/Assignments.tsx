import React, { useMemo, useState } from 'react';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  points: number;
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  attachmentUrl?: string;
}

interface AssignmentsProps {
  role?: 'student' | 'cr';
  isDarkMode?: boolean;
}

interface AssignmentDraft {
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  points: number;
  priority: 'High' | 'Medium' | 'Low';
}

const initialAssignments: Assignment[] = [
  {
    id: 'a1',
    title: 'Linked List Implementation',
    subject: 'Data Structures',
    description: 'Write a Java implementation of singly linked lists with insertion and traversal methods.',
    dueDate: '2026-08-10',
    points: 50,
    status: 'Pending',
    priority: 'High',
    attachmentUrl: 'https://example.com/linked-list.pdf',
  },
  {
    id: 'a2',
    title: 'Responsive Landing Page',
    subject: 'Web Development',
    description: 'Create a responsive landing page using HTML, CSS, and a small amount of JavaScript.',
    dueDate: '2026-08-06',
    points: 40,
    status: 'Submitted',
    priority: 'Medium',
  },
  {
    id: 'a3',
    title: 'Process Scheduling Report',
    subject: 'Operating Systems',
    description: 'Submit a short report comparing FCFS, SJF, and Round Robin scheduling algorithms.',
    dueDate: '2026-08-03',
    points: 30,
    status: 'Overdue',
    priority: 'High',
  },
  {
    id: 'a4',
    title: 'Database ER Diagram',
    subject: 'Database Systems',
    description: 'Design an ER diagram for a library management system and explain the relationships.',
    dueDate: '2026-08-15',
    points: 35,
    status: 'Graded',
    priority: 'Low',
  },
  {
    id: 'a5',
    title: 'Logic Design Quiz Practice',
    subject: 'Digital Logic',
    description: 'Complete the practice worksheet and upload your answers before the next lecture.',
    dueDate: '2026-08-08',
    points: 25,
    status: 'Pending',
    priority: 'Medium',
  },
];

const priorityOptions: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];
const statusFilters: Array<'All' | 'Pending' | 'Submitted' | 'Overdue'> = ['All', 'Pending', 'Submitted', 'Overdue'];

const emptyDraft = (): AssignmentDraft => ({
  title: '',
  subject: '',
  description: '',
  dueDate: '',
  points: 0,
  priority: 'Medium',
});

const getDeadlineInfo = (assignment: Assignment) => {
  const today = new Date();
  const due = new Date(assignment.dueDate);
  const diffInDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (assignment.status === 'Overdue' || diffInDays < 0) {
    return {
      label: 'Overdue',
      tone: 'bg-rose-500/15 text-rose-600 border-rose-200 dark:border-rose-500/30 dark:text-rose-400',
    };
  }

  if (diffInDays <= 3) {
    return {
      label: 'Due Soon',
      tone: 'bg-amber-500/15 text-amber-600 border-amber-200 dark:border-amber-500/30 dark:text-amber-400',
    };
  }

  return {
    label: 'On Track',
    tone: 'bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:border-emerald-500/30 dark:text-emerald-400',
  };
};

const getEffectiveStatus = (assignment: Assignment) => {
  const today = new Date();
  const due = new Date(assignment.dueDate);
  const isPastDue = due.getTime() < today.setHours(0, 0, 0, 0);

  if (assignment.status === 'Overdue' || isPastDue) {
    return 'Overdue' as const;
  }

  return assignment.status;
};

const Assignments: React.FC<AssignmentsProps> = ({ role = 'cr', isDarkMode = false }) => {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Overdue'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AssignmentDraft>(emptyDraft());

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return assignments.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || getEffectiveStatus(item) === statusFilter;
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [assignments, priorityFilter, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter((item) => getEffectiveStatus(item) === 'Pending').length;
    const submitted = assignments.filter((item) => getEffectiveStatus(item) === 'Submitted').length;
    const overdue = assignments.filter((item) => getEffectiveStatus(item) === 'Overdue').length;

    return { total, pending, submitted, overdue };
  }, [assignments]);

  const openCreateModal = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setIsModalOpen(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setDraft({
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description,
      dueDate: assignment.dueDate,
      points: assignment.points,
      priority: assignment.priority,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.subject.trim() || !draft.description.trim() || !draft.dueDate) {
      return;
    }

    if (editingId) {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: draft.title.trim(),
                subject: draft.subject.trim(),
                description: draft.description.trim(),
                dueDate: draft.dueDate,
                points: draft.points,
                priority: draft.priority,
              }
            : item,
        ),
      );
    } else {
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: draft.title.trim(),
        subject: draft.subject.trim(),
        description: draft.description.trim(),
        dueDate: draft.dueDate,
        points: draft.points,
        status: 'Pending',
        priority: draft.priority,
      };
      setAssignments((prev) => [newAssignment, ...prev]);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this assignment?')) {
      setAssignments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleGrade = (id: string) => {
    setAssignments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Graded' } : item)),
    );
  };

  const handleSubmitAssignment = (id: string) => {
    setAssignments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Submitted' } : item)),
    );
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${secondaryText}`}>ClassSync</p>
              <h1 className="mt-2 text-3xl font-semibold">Assignments</h1>
              <p className={`mt-2 max-w-2xl text-sm sm:text-base ${mutedText}`}>
                Track deadlines, submission progress, and grading updates in one streamlined workspace.
              </p>
            </div>
            {role === 'cr' && (
              <button
                onClick={openCreateModal}
                className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                + Create Assignment
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>Total</p>
              <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>Pending</p>
              <p className="mt-1 text-2xl font-semibold">{stats.pending}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>Submitted</p>
              <p className="mt-1 text-2xl font-semibold">{stats.submitted}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>Overdue</p>
              <p className="mt-1 text-2xl font-semibold">{stats.overdue}</p>
            </div>
          </div>
        </header>

        <section className={`rounded-3xl border p-4 shadow-sm ${cardClasses}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title or subject"
                className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none transition sm:w-72 ${inputClasses}`}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'All' | 'Pending' | 'Submitted' | 'Overdue')}
                className={`rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
              >
                {statusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as 'All' | 'High' | 'Medium' | 'Low')}
                className={`rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
              >
                <option value="All">All Priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => {
              const deadlineInfo = getDeadlineInfo(assignment);
              const effectiveStatus = getEffectiveStatus(assignment);

              return (
                <article key={assignment.id} className={`rounded-3xl border p-5 shadow-sm ${cardClasses}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${deadlineInfo.tone}`}>
                          {deadlineInfo.label}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          assignment.priority === 'High'
                            ? 'bg-rose-500/15 text-rose-500'
                            : assignment.priority === 'Medium'
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {assignment.priority} Priority
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-semibold">{assignment.title}</h2>
                      <p className={`mt-1 text-sm ${secondaryText}`}>{assignment.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${secondaryText}`}>{assignment.dueDate}</p>
                      <p className={`mt-1 text-sm font-semibold ${mutedText}`}>{assignment.points} pts</p>
                    </div>
                  </div>

                  <p className={`mt-4 text-sm leading-6 ${mutedText}`}>{assignment.description}</p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-slate-700">
                    <div>
                      <p className={`text-sm font-medium ${mutedText}`}>Status: {effectiveStatus}</p>
                      {assignment.attachmentUrl && (
                        <a
                          href={assignment.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex text-sm font-medium text-cyan-600 hover:underline"
                        >
                          View attachment
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {role === 'student' ? (
                        <button
                          onClick={() => handleSubmitAssignment(assignment.id)}
                          className="rounded-full bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-cyan-700"
                        >
                          {assignment.status === 'Submitted' ? 'Submitted' : 'Submit Assignment'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditModal(assignment)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleGrade(assignment.id)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                          >
                            Grade
                          </button>
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="rounded-full bg-rose-500/15 px-3 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-500/25"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className={`col-span-full rounded-3xl border p-8 text-center ${cardClasses}`}>
              <p className="text-lg font-medium">No assignments match these filters.</p>
              <p className={`mt-2 text-sm ${secondaryText}`}>Adjust the search query or try a different status and priority.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl ${cardClasses}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{editingId ? 'Edit Assignment' : 'Create Assignment'}</h3>
                <p className={`mt-1 text-sm ${secondaryText}`}>Add the details students need to stay on track.</p>
              </div>
              <button onClick={closeModal} className={`rounded-full px-3 py-1.5 text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Title</span>
                  <input
                    required
                    value={draft.title}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder="Assignment title"
                  />
                </label>
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Subject</span>
                  <input
                    required
                    value={draft.subject}
                    onChange={(event) => setDraft((prev) => ({ ...prev, subject: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder="Data Structures"
                  />
                </label>
              </div>

              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Description</span>
                <textarea
                  required
                  rows={4}
                  value={draft.description}
                  onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                  className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                  placeholder="Describe the assignment details"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Due Date</span>
                  <input
                    required
                    type="date"
                    value={draft.dueDate}
                    onChange={(event) => setDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                  />
                </label>
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Points</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={draft.points}
                    onChange={(event) => setDraft((prev) => ({ ...prev, points: Number(event.target.value) }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                  />
                </label>
              </div>

              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${mutedText}`}>Priority</span>
                <select
                  value={draft.priority}
                  onChange={(event) => setDraft((prev) => ({ ...prev, priority: event.target.value as 'High' | 'Medium' | 'Low' }))}
                  className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">
                  {editingId ? 'Save Changes' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;

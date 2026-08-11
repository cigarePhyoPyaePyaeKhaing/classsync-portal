import React, { useMemo, useState } from 'react';

export type AnnouncementCategory = 'Exam' | 'Event' | 'Holiday' | 'General' | 'Quiz';

export interface Announcement {
  id: string;
  title_en: string;
  title_mm: string;
  content_en: string;
  content_mm: string;
  category: AnnouncementCategory;
  author_en: string;
  author_mm: string;
  date: string;
  urgent: boolean;
  isPinned: boolean;
  targetSubject: string;
  isRead?: boolean;
}

interface AnnouncementsProps {
  role?: 'student' | 'cr';
  isDarkMode?: boolean;
  lang?: 'en' | 'mm';
}

interface AnnouncementDraft {
  title: string;
  category: AnnouncementCategory;
  content: string;
  urgent: boolean;
  isPinned: boolean;
  targetSubject: string;
}

const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    title_en: 'Midterm Exam Schedule Revised',
    title_mm: 'အလယ်တန်းစာမေးပွဲ အချိန်ဇယား ပြန်လည်ပြင်ဆင်ထားသည်',
    content_en:
      'The midterm exam schedule for BSCS 3-1 has been revised. Detailed times and room numbers can be viewed on the portal.',
    content_mm:
      'BSCS 3-1 အတွက် အလယ်တန်းစာမေးပွဲ အချိန်ဇယားကို ပြန်လည်ပြင်ဆင်ထားပြီး၊ အချိန်နှင့် အခန်းအမည်အသေးစိတ်ကို ပေါ်လွင်သော ဝင်ပေါက်မှ ကြည့်ရှုနိုင်ပါသည်။',
    category: 'Exam',
    author_en: 'Class Representative',
    author_mm: 'အတန်းတာဝန်ခံ',
    date: '2026-08-01',
    urgent: true,
    isPinned: true,
    targetSubject: 'BSCS 3-1',
    isRead: false,
  },
  {
    id: '2',
    title_en: 'Data Structures Lab Workshop',
    title_mm: 'Data Structures Lab Workshop ကျင်းပမည်',
    content_en:
      'A hands-on workshop on linked lists and trees will be held in the Computer Lab this Wednesday. Attendance is highly recommended.',
    content_mm:
      'Linked list နှင့် tree များအပေါ် hands-on workshop ကို ဒီဗုဒ္ဓဟူးနေ့တွင် ကွန်ပျူတာ Lab မှာ ကျင်းပမည်ဖြစ်ပြီး၊ တက်ရောက်ရန် အကြံပြုပါသည်။',
    category: 'Event',
    author_en: 'Department Office',
    author_mm: 'ဌာနရုံး',
    date: '2026-08-02',
    urgent: false,
    isPinned: false,
    targetSubject: 'Data Structures',
    isRead: true,
  },
  {
    id: '3',
    title_en: 'Holiday Announcement',
    title_mm: 'အားလပ်ရက်ကြေညာချက်',
    content_en:
      'School will be closed on Sunday for National Holiday, and classes will resume on Tuesday.',
    content_mm:
      'အမျိုးသားအားလပ်ရက်အတွက် တနင်္ဂနွေနေ့တွင် ကျောင်းပိတ်မည်ဖြစ်ပြီး၊ အင်္ဂါနေ့မှ ပြန်လည်တက်ရောက်နိုင်ပါမည်။',
    category: 'Holiday',
    author_en: 'Planning Department',
    author_mm: 'စီမံကိန်းဌာန',
    date: '2026-08-03',
    urgent: false,
    isPinned: true,
    targetSubject: 'All Subjects',
    isRead: false,
  },
  {
    id: '4',
    title_en: 'Weekly Quiz Reminder',
    title_mm: 'အပတ်စဉ် Quiz သတိပေးချက်',
    content_en:
      'A quiz on arrays and recursion will be conducted during the next theory class. Please bring a calculator if needed.',
    content_mm:
      'Arrays နှင့် recursion အပေါ် နောက်တစ်ကြိမ် theory class တွင် Quiz ကို ဆောင်ရွက်မည်ဖြစ်ပြီး၊ လိုအပ်ပါက calculator ကို ယူဆောင်လာရန် လိုအပ်ပါသည်။',
    category: 'Quiz',
    author_en: 'Course Instructor',
    author_mm: 'သင်ကြားရေးဆရာ',
    date: '2026-08-04',
    urgent: true,
    isPinned: false,
    targetSubject: 'Algorithms',
    isRead: false,
  },
  {
    id: '5',
    title_en: 'Campus Information Notice',
    title_mm: 'ကျောင်းအခြေအနေ သတင်းအချက်အလက်',
    content_en:
      'Please update your profile and contact details before the next student council meeting.',
    content_mm:
      'နောက်တစ်ကြိမ် student council meeting မတိုင်မီ profile နှင့် contact details ကို အပ်ဒိတ်လုပ်ထားရန် လိုအပ်ပါသည်။',
    category: 'General',
    author_en: 'Student Affairs',
    author_mm: 'ကျောင်းသားရေးရာဌာန',
    date: '2026-08-05',
    urgent: false,
    isPinned: false,
    targetSubject: 'All Subjects',
    isRead: true,
  },
];

const categories: AnnouncementCategory[] = ['Exam', 'Event', 'Holiday', 'General', 'Quiz'];

const emptyDraft = (): AnnouncementDraft => ({
  title: '',
  category: 'General',
  content: '',
  urgent: false,
  isPinned: false,
  targetSubject: 'All Subjects',
});

const translations = {
  en: {
    announcements: 'Announcements',
    subHeader: 'Keep everyone informed with updates, reminders, and urgent notices in one modern feed.',
    createBtn: '+ Create Announcement',
    total: 'Total',
    urgent: 'Urgent',
    pinned: 'Pinned',
    unread: 'Unread',
    tabAll: 'All',
    tabUrgent: 'Urgent',
    tabPinned: 'Pinned',
    searchPlaceholder: 'Search announcements...',
    allCategories: 'All Categories',
    allSubjects: 'All Subjects',
    noAnnouncements: 'No announcements found.',
    noAnnouncementsSub: 'Try another search term, category, or subject filter.',
    read: 'Read',
    by: 'By',
    pin: 'Pin',
    unpin: 'Unpin',
    markRead: 'Mark Read',
    markUnread: 'Mark Unread',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Delete this announcement?',
    createModalTitle: 'Create Announcement',
    editModalTitle: 'Edit Announcement',
    modalSub: 'Share updates with your class quickly and clearly.',
    close: 'Close',
    fieldTitle: 'Title',
    titlePlaceholder: 'Enter announcement title',
    fieldCategory: 'Category',
    fieldContent: 'Content',
    contentPlaceholder: 'Write the announcement details here',
    fieldSubject: 'Target Subject',
    markUrgent: 'Mark as urgent',
    pinToTop: 'Pin to top',
    cancel: 'Cancel',
    publish: 'Publish Announcement',
    saveChanges: 'Save Changes',
    categoryNames: {
      Exam: 'Exam',
      Event: 'Event',
      Holiday: 'Holiday',
      General: 'General',
      Quiz: 'Quiz',
    },
  },
  mm: {
    announcements: 'ကြေညာချက်များ',
    subHeader: 'သတင်းအချက်အလက်များ၊ သတိပေးချက်များနှင့် အရေးကြီး အကြောင်းကြားစာများကို တစ်နေရာတည်းတွင် ကြည့်ရှုပါ။',
    createBtn: '+ ကြေညာချက်အသစ်ပြုလုပ်ရန်',
    total: 'စုစုပေါင်း',
    urgent: 'အရေးကြီး',
    pinned: 'ထိပ်ဆုံးတင်ထားသည်',
    unread: 'မဖတ်ရသေးပါ',
    tabAll: 'အားလုံး',
    tabUrgent: 'အရေးကြီး',
    tabPinned: 'ထိပ်ဆုံးတင်ထားသည်',
    searchPlaceholder: 'ကြေညာချက်များ ရှာဖွေရန်...',
    allCategories: 'အမျိုးအစား အားလုံး',
    allSubjects: 'ဘာသာရပ် အားလုံး',
    noAnnouncements: 'မည်သည့် ကြေညာချက်မျှ မရှိပါ။',
    noAnnouncementsSub: 'အခြား စာလုံး၊ အမျိုးအစား သို့မဟုတ် ဘာသာရပ်ဖြင့် ပြန်လည်ရှာဖွေကြည့်ပါ။',
    read: 'ဖတ်ပြီး',
    by: 'ရေးသားသူ -',
    pin: 'ထိပ်ဆုံးတင်မည်',
    unpin: 'ထိပ်ဆုံးမှဖြုတ်မည်',
    markRead: 'ဖတ်ပြီးအဖြစ်မှတ်မည်',
    markUnread: 'မဖတ်ရသေးအဖြစ်မှတ်မည်',
    edit: 'ပြင်ဆင်မည်',
    delete: 'ဖျက်မည်',
    confirmDelete: 'ဒီကြေညာချက်ကို ဖျက်မှာ သေချာပါသလား?',
    createModalTitle: 'ကြေညာချက်အသစ် ဖန်တီးရန်',
    editModalTitle: 'ကြေညာချက် ပြင်ဆင်ရန်',
    modalSub: 'သင့်အတန်းအတွက် သတင်းအချက်အလက်များကို လျှင်မြန်စွာ မျှဝေပါ။',
    close: 'ပိတ်မည်',
    fieldTitle: 'ခေါင်းစဉ်',
    titlePlaceholder: 'ကြေညာချက် ခေါင်းစဉ်ထည့်ပါ',
    fieldCategory: 'အမျိုးအစား',
    fieldContent: 'အကြောင်းအရာ',
    contentPlaceholder: 'ကြေညာချက် အသေးစိတ်ကို ဒီမှာ ရေးပါ',
    fieldSubject: 'သက်ဆိုင်ရာ ဘာသာရပ်',
    markUrgent: 'အရေးကြီးအဖြစ် မှတ်သားမည်',
    pinToTop: 'ထိပ်ဆုံးတွင် ပင်တွယ်မည်',
    cancel: 'မလုပ်တော့ပါ',
    publish: 'ကြေညာချက် တင်မည်',
    saveChanges: 'ပြင်ဆင်ချက်များ သိမ်းမည်',
    categoryNames: {
      Exam: 'စာမေးပွဲ',
      Event: 'ပွဲလမ်းသဘင်',
      Holiday: 'ကျောင်းပိတ်ရက်',
      General: 'အထွေထွေ',
      Quiz: 'Quiz စာမေးပွဲ',
    },
  },
};

const Announcements: React.FC<AnnouncementsProps> = ({ role = 'cr', isDarkMode = false, lang = 'en' }) => {
  const t = translations[lang] || translations.en;

  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | AnnouncementCategory>('All');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'pinned'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AnnouncementDraft>(emptyDraft());

  const subjectOptions = useMemo(() => {
    const values = new Set(announcements.map((item) => item.targetSubject));
    return ['All Subjects', ...Array.from(values).filter((item) => item !== 'All Subjects')];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const search = searchQuery.toLowerCase();

    return announcements.filter((item) => {
      const title = lang === 'mm' ? item.title_mm : item.title_en;
      const content = lang === 'mm' ? item.content_mm : item.content_en;

      const matchesSearch =
        title.toLowerCase().includes(search) || content.toLowerCase().includes(search);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSubject = selectedSubject === 'All Subjects' || item.targetSubject === selectedSubject;

      if (activeTab === 'urgent') {
        return matchesSearch && matchesCategory && matchesSubject && item.urgent;
      }

      if (activeTab === 'pinned') {
        return matchesSearch && matchesCategory && matchesSubject && item.isPinned;
      }

      return matchesSearch && matchesCategory && matchesSubject;
    });
  }, [activeTab, announcements, searchQuery, selectedCategory, selectedSubject, lang]);

  const stats = useMemo(() => {
    const unreadCount = announcements.filter((item) => !item.isRead).length;
    const urgentCount = announcements.filter((item) => item.urgent).length;
    const pinnedCount = announcements.filter((item) => item.isPinned).length;

    return { total: announcements.length, unreadCount, urgentCount, pinnedCount };
  }, [announcements]);

  const openCreateModal = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setIsModalOpen(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setDraft({
      title: lang === 'mm' ? announcement.title_mm : announcement.title_en,
      category: announcement.category,
      content: lang === 'mm' ? announcement.content_mm : announcement.content_en,
      urgent: announcement.urgent,
      isPinned: announcement.isPinned,
      targetSubject: announcement.targetSubject,
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

    if (!draft.title.trim() || !draft.content.trim()) {
      return;
    }

    const date = new Date().toISOString().slice(0, 10);
    const authorEn = role === 'student' ? 'Student' : 'Class Representative';
    const authorMm = role === 'student' ? 'ကျောင်းသား' : 'အတန်းတာဝန်ခံ';

    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title_en: draft.title.trim(),
                title_mm: draft.title.trim(),
                content_en: draft.content.trim(),
                content_mm: draft.content.trim(),
                category: draft.category,
                urgent: draft.urgent,
                isPinned: draft.isPinned,
                targetSubject: draft.targetSubject.trim() || 'All Subjects',
                date,
                author_en: authorEn,
                author_mm: authorMm,
              }
            : item,
        ),
      );
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title_en: draft.title.trim(),
        title_mm: draft.title.trim(),
        content_en: draft.content.trim(),
        content_mm: draft.content.trim(),
        category: draft.category,
        author_en: authorEn,
        author_mm: authorMm,
        date,
        urgent: draft.urgent,
        isPinned: draft.isPinned,
        targetSubject: draft.targetSubject.trim() || 'All Subjects',
        isRead: false,
      };

      setAnnouncements((prev) => [newAnnouncement, ...prev]);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const togglePin = (id: string) => {
    setAnnouncements((prev) => prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item)));
  };

  const toggleRead = (id: string) => {
    setAnnouncements((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item)));
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
              <h1 className="mt-2 text-3xl font-semibold">{t.announcements}</h1>
              <p className={`mt-2 max-w-2xl text-sm sm:text-base ${mutedText}`}>
                {t.subHeader}
              </p>
            </div>
            {role === 'cr' && (
              <button
                onClick={openCreateModal}
                className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                {t.createBtn}
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>{t.total}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>{t.urgent}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.urgentCount}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>{t.pinned}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.pinnedCount}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${cardClasses}`}>
              <p className={`text-sm ${secondaryText}`}>{t.unread}</p>
              <p className="mt-1 text-2xl font-semibold">{stats.unreadCount}</p>
            </div>
          </div>
        </header>

        <section className={`rounded-3xl border p-4 shadow-sm ${cardClasses}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'urgent', 'pinned'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const label = tab === 'all' ? t.tabAll : tab === 'urgent' ? t.tabUrgent : t.tabPinned;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-cyan-600 text-white'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none transition sm:w-64 ${inputClasses}`}
              />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value as 'All' | AnnouncementCategory)}
                className={`rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
              >
                <option value="All">{t.allCategories}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t.categoryNames[category] || category}
                  </option>
                ))}
              </select>
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                className={`rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
              >
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === 'All Subjects' ? t.allSubjects : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <article key={announcement.id} className={`rounded-3xl border p-5 shadow-sm ${cardClasses}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {announcement.urgent && (
                        <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-500">
                          {t.urgent}
                        </span>
                      )}
                      {announcement.isPinned && (
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-500">
                          {t.pinned}
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {t.categoryNames[announcement.category] || announcement.category}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold">
                      {lang === 'mm' ? announcement.title_mm : announcement.title_en}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${secondaryText}`}>{announcement.date}</p>
                    <p className={`mt-1 text-xs font-medium ${secondaryText}`}>{announcement.targetSubject === 'All Subjects' ? t.allSubjects : announcement.targetSubject}</p>
                  </div>
                </div>

                <p className={`mt-4 text-sm leading-6 ${mutedText}`}>
                  {lang === 'mm' ? announcement.content_mm : announcement.content_en}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-slate-700">
                  <div>
                    <p className={`text-sm font-medium ${mutedText}`}>
                      {t.by} {lang === 'mm' ? announcement.author_mm : announcement.author_en}
                    </p>
                    <p className={`text-xs ${secondaryText}`}>{announcement.isRead ? t.read : t.unread}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => togglePin(announcement.id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                        announcement.isPinned
                          ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {announcement.isPinned ? t.unpin : t.pin}
                    </button>
                    <button
                      onClick={() => toggleRead(announcement.id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                        announcement.isRead
                          ? isDarkMode
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-emerald-500/15 text-emerald-600'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {announcement.isRead ? t.markUnread : t.markRead}
                    </button>
                    {role === 'cr' && (
                      <>
                        <button
                          onClick={() => openEditModal(announcement)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="rounded-full bg-rose-500/15 px-3 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-500/25"
                        >
                          {t.delete}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className={`col-span-full rounded-3xl border p-8 text-center ${cardClasses}`}>
              <p className="text-lg font-medium">{t.noAnnouncements}</p>
              <p className={`mt-2 text-sm ${secondaryText}`}>{t.noAnnouncementsSub}</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl ${cardClasses}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{editingId ? t.editModalTitle : t.createModalTitle}</h3>
                <p className={`mt-1 text-sm ${secondaryText}`}>{t.modalSub}</p>
              </div>
              <button onClick={closeModal} className={`rounded-full px-3 py-1.5 text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                {t.close}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>{t.fieldTitle}</span>
                  <input
                    required
                    value={draft.title}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder={t.titlePlaceholder}
                  />
                </label>
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>{t.fieldCategory}</span>
                  <select
                    value={draft.category}
                    onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value as AnnouncementCategory }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {t.categoryNames[category] || category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${mutedText}`}>{t.fieldContent}</span>
                <textarea
                  required
                  rows={5}
                  value={draft.content}
                  onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
                  className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                  placeholder={t.contentPlaceholder}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={`mb-2 block text-sm font-medium ${mutedText}`}>{t.fieldSubject}</span>
                  <input
                    value={draft.targetSubject}
                    onChange={(event) => setDraft((prev) => ({ ...prev, targetSubject: event.target.value }))}
                    className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
                    placeholder="BSCS 3-1 or All Subjects"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      checked={draft.urgent}
                      onChange={(event) => setDraft((prev) => ({ ...prev, urgent: event.target.checked }))}
                    />
                    {t.markUrgent}
                  </label>
                  <label className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      checked={draft.isPinned}
                      onChange={(event) => setDraft((prev) => ({ ...prev, isPinned: event.target.checked }))}
                    />
                    {t.pinToTop}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                >
                  {t.cancel}
                </button>
                <button type="submit" className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">
                  {editingId ? t.saveChanges : t.publish}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
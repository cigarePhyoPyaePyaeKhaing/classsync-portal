import React, { useEffect, useMemo, useState } from 'react';

interface SettingsProps {
  role?: 'student' | 'cr';
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  lang?: string; // AppShell/Navbar ကနေ လာမည့် ဘာသာစကား state
}

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  pushNotifications: boolean;
  emailAlerts: boolean;
  announcementReminders: boolean;
  examAlerts: boolean;
  passwordProtected: boolean;
  privacyVisible: boolean;
  syncStatus: 'Synced' | 'Pending' | 'Offline';
}

// 🇲🇲 Translations Dictionary
const translations = {
  en: {
    appTitle: 'ClassSync',
    title: 'Settings',
    subtitle: 'Personalize your learning workspace, manage notifications, and keep your account secure.',
    role: 'Role',
    savedToast: 'Settings saved successfully',
    cacheClearedToast: 'Cache cleared successfully',
    exportToast: 'Export started',

    // General Settings
    generalSettings: 'General Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    systemDefault: 'System Default',
    fontSize: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',

    // Notifications
    notificationPreferences: 'Notification Preferences',
    pushNotifications: 'Push Notifications',
    emailAlerts: 'Email Alerts for Assignments',
    announcementReminders: 'Announcement Reminders',
    examAlerts: 'Exam Alerts',
    stayUpdated: 'Stay updated without missing key moments.',

    // Privacy & Security
    privacyAndSecurity: 'Privacy & Security',
    passwordProtection: 'Password Protection',
    secureAccount: 'Secure your account with password checks.',
    activeDevices: 'Active Devices',
    manageSignedDevices: 'Manage where your account is signed in.',
    review: 'Review',
    chromeOnWindows: 'Chrome on Windows • Active now',
    safariOnIphone: 'Safari on iPhone • 2 hours ago',
    profileVisibility: 'Profile Visibility',
    controlVisibility: 'Control how visible your profile is to others.',

    // Data & Storage
    dataAndStorage: 'Data & Storage',
    syncDataStatus: 'Sync Data Status',
    synced: 'Synced',
    pending: 'Pending',
    offline: 'Offline',
    syncNow: 'Sync Now',
    clearCache: 'Clear Cache',
    exportData: 'Export Data',

    // About & Support
    aboutAndSupport: 'About & Support',
    appVersion: 'App Version',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    reportBug: 'Report a Bug',
    contactSupport: 'Contact Support',
  },
  mm: {
    appTitle: 'ClassSync',
    title: 'ဆက်တင်များ',
    subtitle: 'သင်၏ သင်ကြားရေးနေရာကို စိတ်ကြိုက်ပြင်ဆင်ပါ၊ အသိပေးချက်များကို စီမံပါ၊ နှင့် အကောင့်လုံခြုံရေး ထိန်းသိမ်းပါ။',
    role: 'ရာထူး',
    savedToast: 'ဆက်တင်များ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ',
    cacheClearedToast: 'Cache များကို အောင်မြင်စွာ ရှင်းလင်းပြီးပါပြီ',
    exportToast: 'ဒေတာ ထုတ်ယူခြင်း စတင်ပါပြီ',

    // General Settings
    generalSettings: 'အထွေထွေ ဆက်တင်များ',
    theme: 'သီးမ် (Theme)',
    light: 'အလင်း (Light)',
    dark: 'အမှောင် (Dark)',
    systemDefault: 'စနစ် မူလအတိုင်း',
    fontSize: 'စာလုံးအရွယ်အစား',
    small: 'သေး',
    medium: 'လတ်',
    large: 'ကြီး',

    // Notifications
    notificationPreferences: 'အသိပေးချက် ဆက်တင်များ',
    pushNotifications: 'Push အသိပေးချက်များ',
    emailAlerts: 'အိမ်စာ အီးမေးလ် သတိပေးချက်များ',
    announcementReminders: 'ကြေညာချက် သတိပေးချက်များ',
    examAlerts: 'စာမေးပွဲ သတိပေးချက်များ',
    stayUpdated: 'အရေးကြီးသည့် အရာများကို မလွတ်စေရန် အသိပေးချက် ရယူပါ။',

    // Privacy & Security
    privacyAndSecurity: 'သီးသန့်တည်ရှိမှုနှင့် လုံခြုံရေး',
    passwordProtection: 'စကားဝှက်ဖြင့် ကာကွယ်ခြင်း',
    secureAccount: 'စကားဝှက် စစ်ဆေးမှုဖြင့် အကောင့်ကို လုံခြုံအောင် ပြုလုပ်ပါ။',
    activeDevices: 'အသုံးပြုနေသော စက်ပစ္စည်းများ',
    manageSignedDevices: 'သင့်အကောင့် ဝင်ရောက်ထားသည့် စက်များကို စီမံပါ။',
    review: 'စစ်ဆေးမည်',
    chromeOnWindows: 'Chrome (Windows) • လက်ရှိ အသုံးပြုနေသည်',
    safariOnIphone: 'Safari (iPhone) • ၂ နာရီအကြာက',
    profileVisibility: 'Profile မြင်တွေ့နိုင်စွမ်း',
    controlVisibility: 'သင့် Profile ကို အခြားသူများ မည်မျှမြင်နိုင်သည်ကို ထိန်းချုပ်ပါ။',

    // Data & Storage
    dataAndStorage: 'ဒေတာနှင့် သိမ်းဆည်းမှု',
    syncDataStatus: 'ဒေတာ စင့်ခ်လုပ်မှု အခြေအနေ',
    synced: 'စင့်ခ်လုပ်ပြီးပါပြီ',
    pending: 'လုပ်ဆောင်နေဆဲ',
    offline: 'အော့ဖ်လိုင်း',
    syncNow: 'ယခု စင့်ခ်လုပ်မည်',
    clearCache: 'Cache ရှင်းလင်းမည်',
    exportData: 'ဒေတာ ထုတ်ယူမည်',

    // About & Support
    aboutAndSupport: 'အက်ပ်အကြောင်းနှင့် အကူအညီ',
    appVersion: 'အက်ပ်ဗားရှင်း',
    termsOfService: 'ဝန်ဆောင်မှု စည်းကမ်းချက်များ',
    privacyPolicy: 'သီးသန့်လုံခြုံရေး မူဝါဒ',
    reportBug: 'ပြဿနာ (Bug) သတင်းပို့မည်',
    contactSupport: 'အကူအညီတောင်းခံရန်',
  },
};

const Settings: React.FC<SettingsProps> = ({
  role = 'student',
  isDarkMode = false,
  setIsDarkMode,
  lang = 'en',
}) => {
  const [settings, setSettings] = useState<SettingsState>({
    theme: isDarkMode ? 'dark' : 'light',
    fontSize: 'medium',
    pushNotifications: true,
    emailAlerts: true,
    announcementReminders: true,
    examAlerts: true,
    passwordProtected: true,
    privacyVisible: true,
    syncStatus: 'Synced',
  });

  const [toast, setToast] = useState<string | null>(null);

  // အပေါ် App/Navbar ကလာတဲ့ lang အပေါ်မူတည်ပြီး အလိုအလျောက် Translation ယူခြင်း
  const currentLangKey = (lang === 'mm' || lang === 'Myanmar') ? 'mm' : 'en';
  const t = translations[currentLangKey];

  // ⚡ Font Size ပြောင်းလဲမှုကို Root Element (HTML) ပေါ် တိုက်ရိုက် သက်ရောက်စေရန် ပြုလုပ်ခြင်း
  useEffect(() => {
    const root = document.documentElement;
    if (settings.fontSize === 'small') {
      root.style.fontSize = '14px';
    } else if (settings.fontSize === 'medium') {
      root.style.fontSize = '16px';
    } else if (settings.fontSize === 'large') {
      root.style.fontSize = '18px';
    }
  }, [settings.fontSize]);

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(null), 1800);
      return () => window.clearTimeout(timer);
    }
  }, [toast]);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const nextDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setSettings((prev) => ({ ...prev, theme }));
    if (setIsDarkMode) {
      setIsDarkMode(nextDark);
    }
  };

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setToast(t.savedToast);
  };

  const containerClasses = isDarkMode
    ? 'min-h-screen bg-slate-950 text-slate-100'
    : 'min-h-screen bg-slate-50 text-slate-900';
  const cardClasses = isDarkMode
    ? 'border border-slate-700 bg-slate-900/80 shadow-slate-900/40'
    : 'border border-gray-100 bg-white shadow-slate-100';
  const inputClasses = isDarkMode
    ? 'border-slate-700 bg-slate-800 text-slate-100 focus:border-cyan-500'
    : 'border-gray-200 bg-white text-slate-900 focus:border-cyan-500';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const mutedText = isDarkMode ? 'text-slate-300' : 'text-slate-600';

  const sections = useMemo(
    () => [
      {
        title: t.generalSettings,
        icon: '⚙️',
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={`mb-2 block text-sm font-medium ${mutedText}`}>{t.theme}</span>
              <select
                value={settings.theme}
                onChange={(event) => applyTheme(event.target.value as 'light' | 'dark' | 'system')}
                className={`w-full rounded-2xl border px-3 py-2.5 text-sm outline-none ${inputClasses}`}
              >
                <option value="light">{t.light}</option>
                <option value="dark">{t.dark}</option>
                <option value="system">{t.systemDefault}</option>
              </select>
            </label>
            <label className="block">
              <span className={`mb-2 block text-sm font-medium ${mutedText}`}>{t.fontSize}</span>
              <div className="flex flex-wrap gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateSetting('fontSize', size)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      settings.fontSize === size
                        ? 'bg-cyan-600 text-white'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {size === 'small' ? t.small : size === 'medium' ? t.medium : t.large}
                  </button>
                ))}
              </div>
            </label>
          </div>
        ),
      },
      {
        title: t.notificationPreferences,
        icon: '🔔',
        content: (
          <div className="space-y-3">
            {[
              ['pushNotifications', t.pushNotifications],
              ['emailAlerts', t.emailAlerts],
              ['announcementReminders', t.announcementReminders],
              ['examAlerts', t.examAlerts],
            ].map(([key, label]) => {
              const checked = settings[key as keyof SettingsState] as boolean;
              return (
                <div
                  key={label}
                  className={`flex items-center justify-between rounded-2xl border p-3 ${
                    isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className={`text-sm ${secondaryText}`}>{t.stayUpdated}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting(key as keyof SettingsState, !checked)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      checked ? 'bg-cyan-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        ),
      },
      {
        title: t.privacyAndSecurity,
        icon: '🔒',
        content: (
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between rounded-2xl border p-3 ${
                isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-slate-50'
              }`}
            >
              <div>
                <p className="text-sm font-medium">{t.passwordProtection}</p>
                <p className={`text-sm ${secondaryText}`}>{t.secureAccount}</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('passwordProtected', !settings.passwordProtected)}
                className={`relative h-6 w-11 rounded-full transition ${
                  settings.passwordProtected ? 'bg-cyan-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition ${
                    settings.passwordProtected ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div
              className={`rounded-2xl border p-3 ${
                isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.activeDevices}</p>
                  <p className={`text-sm ${secondaryText}`}>{t.manageSignedDevices}</p>
                </div>
                <button type="button" className="rounded-full bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white">
                  {t.review}
                </button>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="rounded-xl bg-cyan-500/10 px-3 py-2 text-cyan-700 dark:text-cyan-300">
                  {t.chromeOnWindows}
                </li>
                <li className="rounded-xl bg-violet-500/10 px-3 py-2 text-violet-700 dark:text-violet-300">
                  {t.safariOnIphone}
                </li>
              </ul>
            </div>
            <div
              className={`flex items-center justify-between rounded-2xl border p-3 ${
                isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-slate-50'
              }`}
            >
              <div>
                <p className="text-sm font-medium">{t.profileVisibility}</p>
                <p className={`text-sm ${secondaryText}`}>{t.controlVisibility}</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('privacyVisible', !settings.privacyVisible)}
                className={`relative h-6 w-11 rounded-full transition ${
                  settings.privacyVisible ? 'bg-cyan-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition ${
                    settings.privacyVisible ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ),
      },
      {
        title: t.dataAndStorage,
        icon: '💾',
        content: (
          <div className="space-y-3">
            <div
              className={`rounded-2xl border p-3 ${
                isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.syncDataStatus}</p>
                  <p className={`text-sm ${secondaryText}`}>
                    {t[settings.syncStatus.toLowerCase() as 'synced' | 'pending' | 'offline']}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    settings.syncStatus === 'Synced'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : settings.syncStatus === 'Pending'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {t[settings.syncStatus.toLowerCase() as 'synced' | 'pending' | 'offline']}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => updateSetting('syncStatus', 'Pending')}
                className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {t.syncNow}
              </button>
              <button
                type="button"
                onClick={() => setToast(t.cacheClearedToast)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                  isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t.clearCache}
              </button>
              <button
                type="button"
                onClick={() => setToast(t.exportToast)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                  isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t.exportData}
              </button>
            </div>
          </div>
        ),
      },
      {
        title: t.aboutAndSupport,
        icon: '💬',
        content: (
          <div className="space-y-3">
            <div
              className={`rounded-2xl border p-3 ${
                isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-slate-50'
              }`}
            >
              <p className="text-sm font-medium">{t.appVersion}</p>
              <p className={`mt-1 text-sm ${secondaryText}`}>v1.0.0</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[t.termsOfService, t.privacyPolicy, t.reportBug, t.contactSupport].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ),
      },
    ],
    [inputClasses, isDarkMode, mutedText, secondaryText, settings, t]
  );

  return (
    <div className={containerClasses}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className={`rounded-3xl border p-6 shadow-sm ${cardClasses}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${secondaryText}`}>
                {t.appTitle}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
              <p className={`mt-2 max-w-2xl text-sm sm:text-base ${mutedText}`}>
                {t.subtitle}
              </p>
            </div>
            <div
              className={`rounded-2xl border px-3 py-2 text-sm ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-300'
                  : 'border-gray-200 bg-slate-50 text-slate-600'
              }`}
            >
              {t.role}: <span className="font-semibold capitalize">{role}</span>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className={`rounded-3xl border p-5 shadow-sm ${cardClasses}`}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{section.icon}</div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <div className="mt-4">{section.content}</div>
            </section>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Settings;
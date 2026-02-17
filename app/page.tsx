'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { translations, dailyQuotes, Lang, CITIES, CityKey } from './translations';
import Link from 'next/link';

// ==================== CONSTANTS ====================
// Ramadan 2026: Feb 18 - Mar 19 (confirmed via Aladhan API, Hijri 1-30 Ramadan 1447)
const RAMADAN_START = new Date('2026-02-18T00:00:00+04:00');
const RAMADAN_END = new Date('2026-03-20T00:00:00+04:00');
const TOTAL_DAYS = 30;


type Theme = 'dark' | 'light';

// Helper: add minutes to HH:MM string
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
const PRAYER_TIMES_DATA = [
  { fajr: '06:12', sunrise: '07:36', dhuhr: '13:00', asr: '16:00', maghrib: '18:25', isha: '19:44' },
  { fajr: '06:10', sunrise: '07:34', dhuhr: '13:00', asr: '16:01', maghrib: '18:26', isha: '19:45' },
  { fajr: '06:09', sunrise: '07:33', dhuhr: '13:00', asr: '16:01', maghrib: '18:27', isha: '19:46' },
  { fajr: '06:07', sunrise: '07:31', dhuhr: '13:00', asr: '16:02', maghrib: '18:28', isha: '19:47' },
  { fajr: '06:05', sunrise: '07:30', dhuhr: '13:00', asr: '16:02', maghrib: '18:29', isha: '19:48' },
  { fajr: '06:04', sunrise: '07:28', dhuhr: '13:00', asr: '16:03', maghrib: '18:30', isha: '19:50' },
  { fajr: '06:02', sunrise: '07:26', dhuhr: '13:00', asr: '16:04', maghrib: '18:31', isha: '19:51' },
  { fajr: '06:00', sunrise: '07:25', dhuhr: '12:59', asr: '16:04', maghrib: '18:33', isha: '19:52' },
  { fajr: '05:59', sunrise: '07:23', dhuhr: '12:59', asr: '16:05', maghrib: '18:34', isha: '19:53' },
  { fajr: '05:57', sunrise: '07:21', dhuhr: '12:59', asr: '16:05', maghrib: '18:35', isha: '19:54' },
  { fajr: '05:55', sunrise: '07:20', dhuhr: '12:59', asr: '16:06', maghrib: '18:36', isha: '19:55' },
  { fajr: '05:54', sunrise: '07:18', dhuhr: '12:59', asr: '16:06', maghrib: '18:37', isha: '19:56' },
  { fajr: '05:52', sunrise: '07:16', dhuhr: '12:59', asr: '16:07', maghrib: '18:38', isha: '19:58' },
  { fajr: '05:50', sunrise: '07:15', dhuhr: '12:58', asr: '16:08', maghrib: '18:39', isha: '19:59' },
  { fajr: '05:49', sunrise: '07:13', dhuhr: '12:58', asr: '16:08', maghrib: '18:40', isha: '20:00' },
  { fajr: '05:47', sunrise: '07:11', dhuhr: '12:58', asr: '16:09', maghrib: '18:41', isha: '20:01' },
  { fajr: '05:45', sunrise: '07:10', dhuhr: '12:58', asr: '16:09', maghrib: '18:42', isha: '20:02' },
  { fajr: '05:44', sunrise: '07:08', dhuhr: '12:57', asr: '16:10', maghrib: '18:43', isha: '20:03' },
  { fajr: '05:42', sunrise: '07:06', dhuhr: '12:57', asr: '16:10', maghrib: '18:44', isha: '20:05' },
  { fajr: '05:40', sunrise: '07:05', dhuhr: '12:57', asr: '16:11', maghrib: '18:45', isha: '20:06' },
  { fajr: '05:39', sunrise: '07:03', dhuhr: '12:57', asr: '16:11', maghrib: '18:46', isha: '20:07' },
  { fajr: '05:37', sunrise: '07:01', dhuhr: '12:56', asr: '16:12', maghrib: '18:47', isha: '20:08' },
  { fajr: '05:35', sunrise: '07:00', dhuhr: '12:56', asr: '16:12', maghrib: '18:49', isha: '20:09' },
  { fajr: '05:34', sunrise: '06:58', dhuhr: '12:56', asr: '16:13', maghrib: '18:50', isha: '20:10' },
  { fajr: '05:32', sunrise: '06:56', dhuhr: '12:56', asr: '16:13', maghrib: '18:51', isha: '20:11' },
  { fajr: '05:30', sunrise: '06:55', dhuhr: '12:55', asr: '16:14', maghrib: '18:52', isha: '20:13' },
  { fajr: '05:29', sunrise: '06:53', dhuhr: '12:55', asr: '16:14', maghrib: '18:53', isha: '20:14' },
  { fajr: '05:27', sunrise: '06:52', dhuhr: '12:55', asr: '16:15', maghrib: '18:54', isha: '20:15' },
  { fajr: '05:26', sunrise: '06:50', dhuhr: '12:54', asr: '16:15', maghrib: '18:55', isha: '20:16' },
  { fajr: '05:25', sunrise: '06:49', dhuhr: '12:54', asr: '16:16', maghrib: '18:57', isha: '20:17' },
];

const DHIKR_LIST = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ ٱللَّٰهِ', target: 33 },
  { id: 'alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', target: 33 },
  { id: 'allahuakbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', target: 33 },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', target:100 },
  { id: 'laIlahaIllallah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', target: 100 },
];

// ==================== HELPERS ====================
function getRamadanDay(): number {
  const now = new Date();
  if (now < RAMADAN_START) return 0;
  if (now >= RAMADAN_END) return 31;
  const diff = now.getTime() - RAMADAN_START.getTime();
  return Math.min(Math.floor(diff / (1000 * 60 * 60 * 24)) + 1, 30);
}

function getHijriDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(new Date());
  } catch {
    return 'Ramazan 1447';
  }
}

function formatDate(lang: Lang): string {
  const localeMap: Record<Lang, string> = { az: 'az-AZ', en: 'en-US', ru: 'ru-RU' };
  return new Date().toLocaleDateString(localeMap[lang], {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function getCountdown() {
  const now = new Date();
  const diff = RAMADAN_START.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    started: false,
  };
}

function getTodayPrayerTimes(cityOffset = 0) {
  const dayIdx = Math.max(0, getRamadanDay() - 1);
  const base = PRAYER_TIMES_DATA[Math.min(dayIdx, 29)];
  if (cityOffset === 0) return base;
  return {
    fajr: addMinutes(base.fajr, cityOffset),
    sunrise: addMinutes(base.sunrise, cityOffset),
    dhuhr: addMinutes(base.dhuhr, cityOffset),
    asr: addMinutes(base.asr, cityOffset),
    maghrib: addMinutes(base.maghrib, cityOffset),
    isha: addMinutes(base.isha, cityOffset),
  };
}

function getTimeToNextPrayer(prayerTimes: ReturnType<typeof getTodayPrayerTimes>): string {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const times = [prayerTimes.fajr, prayerTimes.sunrise, prayerTimes.dhuhr, prayerTimes.asr, prayerTimes.maghrib, prayerTimes.isha];
  for (const t of times) {
    if (t > hhmm) {
      const [h1, m1] = t.split(':').map(Number);
      const diffMin = (h1 * 60 + m1) - (now.getHours() * 60 + now.getMinutes());
      const hh = Math.floor(diffMin / 60);
      const mm = diffMin % 60;
      return `${hh}h ${mm}m`;
    }
  }
  return '—';
}

// ==================== STARS COMPONENT ====================
function Stars() {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; delay: string; duration: string; opacity: number; size: number }>>([]);

  useEffect(() => {
    const s = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 70}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 4}s`,
      opacity: 0.3 + Math.random() * 0.7,
      size: 1 + Math.random() * 2,
    }));
    setStars(s);
  }, []);

  return (
    <div className="stars-container">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            '--delay': star.delay,
            '--duration': star.duration,
            '--max-opacity': star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ==================== MOON COMPONENT ====================
function Moon() {
  return (
    <div className="moon-container">
      <div className="moon" />
    </div>
  );
}

// ==================== MOSQUE SILHOUETTE ====================
function MosqueSilhouette() {
  return (
    <div className="mosque-silhouette">
      <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M0 200V160H60V140C60 120 80 100 100 90C110 85 115 75 115 65C115 55 110 45 100 40L120 20L140 40C130 45 125 55 125 65C125 75 130 85 140 90C160 100 180 120 180 140V160H240V140C240 120 260 100 280 90C290 85 295 75 295 65C295 55 290 45 280 40L300 20L320 40C310 45 305 55 305 65C305 75 310 85 320 90C340 100 360 120 360 140V160H420V180H480V160H540V140C560 100 580 80 600 70C610 60 615 45 615 35C615 20 605 10 600 5L620 -20L640 5C635 10 625 20 625 35C625 45 630 60 640 70C660 80 680 100 700 140V160H760V180H820V160H880V140C880 120 900 100 920 90C930 85 935 75 935 65C935 55 930 45 920 40L940 20L960 40C950 45 945 55 945 65C945 75 950 85 960 90C980 100 1000 120 1000 140V160H1060V140C1060 120 1080 100 1100 90C1110 85 1115 75 1115 65C1115 55 1110 45 1100 40L1120 20L1140 40C1130 45 1125 55 1125 65C1125 75 1130 85 1140 90C1160 100 1180 120 1180 140V160H1240V180H1300V160H1360V180H1440V200H0Z"
          className="mosque-path" />
      </svg>
    </div>
  );
}

// ==================== RETRO GRID ====================
function RetroGrid() {
  return <div className="retro-grid" />;
}

// ==================== PROGRESS RING ====================
function ProgressRing({ progress, size = 80, strokeWidth = 6, color = '#c9a84c', children }: {
  progress: number; size?: number; strokeWidth?: number; color?: string; children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="progress-ring-circle-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <circle
          className="progress-ring-circle"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', inset: 0 }}>
        {children}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
type Tab = 'home' | 'prayer' | 'tasbih' | 'tracker' | 'fasting' | 'settings';

export default function RamadanApp() {
  const [lang, setLang] = useState<Lang>('az');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [countdown, setCountdown] = useState(getCountdown());
  const [theme, setTheme] = useState<Theme>('dark');
  const [city, setCity] = useState<CityKey>('baku');
  const [isLoaded, setIsLoaded] = useState(false);
  const t = translations[lang];

  // Fasting data
  const [fastingDays, setFastingDays] = useState<Record<number, 'fasted' | 'missed' | null>>({});

  // Tasbih
  const [selectedDhikr, setSelectedDhikr] = useState(DHIKR_LIST[0]);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [dailyTasbihTotal, setDailyTasbihTotal] = useState(0);
  const [tasbihRipples, setTasbihRipples] = useState<number[]>([]);

  // Habits
  const [habits, setHabits] = useState<Record<string, boolean>>({
    prayer: false, quran: false, water: false, work: false, exercise: false,
  });

  // Email
  const [email, setEmail] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [notifiedPrayers, setNotifiedPrayers] = useState<string[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Streak
  const [streak, setStreak] = useState(0);

  const mainRef = useRef<HTMLDivElement>(null);

  // Load from localStorage — restore ALL state on refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ramadan-app-data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.fastingDays) setFastingDays(data.fastingDays);
        if (data.habits) setHabits(data.habits);
        if (typeof data.tasbihCount === 'number') setTasbihCount(data.tasbihCount);
        if (typeof data.dailyTasbihTotal === 'number') setDailyTasbihTotal(data.dailyTasbihTotal);
        if (data.selectedDhikrId) {
          const found = DHIKR_LIST.find(d => d.id === data.selectedDhikrId);
          if (found) setSelectedDhikr(found);
        }
        if (data.lang) setLang(data.lang);
        if (typeof data.streak === 'number') setStreak(data.streak);
        if (data.subscribedEmail) {
          setSubscribedEmail(data.subscribedEmail);
          setEmailSent(true);
        }
        if (data.notifiedPrayers) setNotifiedPrayers(data.notifiedPrayers);
        if (data.activeTab) setActiveTab(data.activeTab);
        if (data.theme) setTheme(data.theme);
        if (data.city) setCity(data.city);
        if (data.lastDate) {
          const today = new Date().toDateString();
          if (data.lastDate !== today) {
            setHabits({ prayer: false, quran: false, water: false, work: false, exercise: false });
            setTasbihCount(0);
            setDailyTasbihTotal(0);
            setNotifiedPrayers([]);
          }
        }
      }
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  // Apply theme to html
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  // Save ALL state to localStorage on every change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('ramadan-app-data', JSON.stringify({
        fastingDays,
        habits,
        tasbihCount,
        dailyTasbihTotal,
        selectedDhikrId: selectedDhikr.id,
        lang,
        streak,
        activeTab,
        theme,
        city,
        subscribedEmail,
        notifiedPrayers,
        lastDate: new Date().toDateString(),
      }));
    } catch { /* ignore */ }
  }, [fastingDays, habits, tasbihCount, dailyTasbihTotal, selectedDhikr, lang, streak, activeTab, theme, city, isLoaded, subscribedEmail, notifiedPrayers]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate streak
  useEffect(() => {
    let s = 0;
    const today = getRamadanDay();
    for (let i = today; i >= 1; i--) {
      if (fastingDays[i] === 'fasted') s++;
      else break;
    }
    setStreak(s);
  }, [fastingDays]);

  const toggleFasting = (day: number) => {
    setFastingDays(prev => {
      const current = prev[day];
      let next: 'fasted' | 'missed' | null;
      if (!current) next = 'fasted';
      else if (current === 'fasted') next = 'missed';
      else next = null;
      return { ...prev, [day]: next };
    });
  };

  const handleTasbihClick = useCallback(() => {
    setTasbihCount(c => c + 1);
    setDailyTasbihTotal(t => t + 1);
    setTasbihRipples(prev => [...prev, Date.now()]);
    // Vibration
    if (navigator.vibrate) navigator.vibrate(30);
    setTimeout(() => setTasbihRipples(prev => prev.slice(1)), 800);
  }, []);

  const resetTasbih = () => {
    setTasbihCount(0);
  };

  const toggleHabit = (key: string) => {
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSending(true);
    try {
      // Send notification to app owner
      await fetch('https://formsubmit.co/ajax/arzuuimammadova@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          _subject: 'Ramadan App - Yeni Abunəçi / New Subscriber',
          _replyto: email,
          _template: 'table',
          subscriber_email: email,
          language: lang,
          date: new Date().toISOString(),
          message: `Yeni abunəçi: ${email}`,
        }),
      });
      // Send confirmation to subscriber via formsubmit.co
      // formsubmit.co sends auto-reply when _autoresponse is set
      await fetch('https://formsubmit.co/ajax/arzuuimammadova@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          _subject: 'Ramadan Mubarak! ✨ Abunəliyiniz təsdiqləndi',
          _replyto: email,
          _autoresponse: lang === 'az'
            ? `Salam! 🌙 Ramadan App-a abunə olduğunuz üçün təşəkkür edirik! Gündəlik Ramazan xatırlatmaları və motivasiya mesajları alacaqsınız. Ramazan Mübarək! ✨`
            : lang === 'ru'
              ? `Здравствуйте! 🌙 Спасибо за подписку на Ramadan App! Вы будете получать ежедневные напоминания и мотивационные сообщения. Рамадан Мубарак! ✨`
              : `Hello! 🌙 Thank you for subscribing to Ramadan App! You will receive daily Ramadan reminders and motivational messages. Ramadan Mubarak! ✨`,
          _template: 'table',
          subscriber_email: email,
          message: 'Subscription confirmation',
        }),
      });
      setEmailSent(true);
      setSubscribedEmail(email);
      setEmail('');
      setTimeout(() => setEmailSent(false), 8000);
    } catch { /* ignore */ }
    setEmailSending(false);
  };

  const prayerTimes = getTodayPrayerTimes(CITIES[city].offset);
  const ramadanDay = getRamadanDay();

  // Check for prayer times and send notification
  useEffect(() => {
    if (!subscribedEmail) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const times: { key: string; time: string }[] = [
      { key: 'Fajr', time: prayerTimes.fajr },
      { key: 'Sunrise', time: prayerTimes.sunrise },
      { key: 'Dhuhr', time: prayerTimes.dhuhr },
      { key: 'Asr', time: prayerTimes.asr },
      { key: 'Maghrib', time: prayerTimes.maghrib },
      { key: 'Isha', time: prayerTimes.isha },
    ];

    const match = times.find(t => t.time === currentTime);
    if (match && !notifiedPrayers.includes(match.key)) {
      setNotifiedPrayers(prev => [...prev, match.key]);

      const msg = lang === 'az' ? `Namaz vaxtıdır: ${match.key}` : `It's time for ${match.key}`;
      // Send Alert (Mock Email)
      alert(`📧 [EMAIL SENT TO: ${subscribedEmail}]\n\n🔔 ${msg}\n⏰ ${match.time}`);
    }
  }, [countdown, subscribedEmail, notifiedPrayers, prayerTimes, lang]);

  const todayQuote = dailyQuotes[lang][ramadanDay > 0 ? (ramadanDay - 1) % 30 : new Date().getDate() % 30];
  const fastedCount = Object.values(fastingDays).filter(v => v === 'fasted').length;
  const missedCount = Object.values(fastingDays).filter(v => v === 'missed').length;
  const fastingProgress = (fastedCount / TOTAL_DAYS) * 100;
  const habitsCompleted = Object.values(habits).filter(Boolean).length;
  const habitsTotal = Object.keys(habits).length;
  const habitsProgress = (habitsCompleted / habitsTotal) * 100;

  const navItems: { key: Tab; icon: string; label: string }[] = [
    { key: 'home', icon: '🏠', label: t.navHome },
    { key: 'prayer', icon: '🕌', label: t.navPrayer },
    { key: 'tasbih', icon: '📿', label: t.navTasbih },
    { key: 'tracker', icon: '📊', label: t.navTracker },
    { key: 'fasting', icon: '🌙', label: t.navFasting },
    { key: 'settings', icon: '⚙️', label: t.settings },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Background layers */}
      <div className="bg-islamic-pattern" />
      <Stars />
      <Moon />
      <MosqueSilhouette />
      <RetroGrid />

      {/* Top Header */}
      <header className="top-header" style={{ justifyContent: 'space-between', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.6rem' }}>☪</span>
          <span className="neon-text" style={{ fontFamily: "'Amiri', serif", fontSize: '1.3rem', fontWeight: 700 }}>{t.appTitle}</span>
        </div>

        {/* Language Switcher */}
        <div className="lang-switcher">
          {(['az', 'en', 'ru'] as Lang[]).map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main ref={mainRef} style={{ position: 'relative', zIndex: 10, paddingTop: 70, paddingBottom: 80 }}>
        {/* ===== HOME TAB ===== */}
        {activeTab === 'home' && (
          <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
            {/* Hero Section */}
            <section className="fade-in-up" style={{ textAlign: 'center', padding: '40px 0 30px' }}>
              <h1 style={{ fontFamily: "'Amiri', serif", fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
                <span className="neon-text">{t.heroTitle}</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                {t.heroSubtitle}
              </p>
            </section>

            {/* Date Info */}
            <section className="glass-card fade-in-up fade-in-up-delay-1" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.today}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{formatDate(lang)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.hijriDate}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{getHijriDate()}</div>
                </div>
              </div>
              {ramadanDay > 0 && ramadanDay <= 30 && (
                <div style={{ marginTop: 12, padding: '8px 16px', borderRadius: 10, background: 'rgba(201,168,76,0.08)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>🌙 {t.day} {ramadanDay} / {TOTAL_DAYS}</span>
                </div>
              )}
            </section>

            {/* Countdown or Ramadan Status */}
            {!countdown.started ? (
              <section className="glass-card fade-in-up fade-in-up-delay-2" style={{ padding: 24, marginBottom: 20 }}>
                <h2 className="section-title" style={{ fontSize: '1.3rem', marginBottom: 16 }}>{t.countdownTitle}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { val: countdown.days, label: t.countdownDays },
                    { val: countdown.hours, label: t.countdownHours },
                    { val: countdown.minutes, label: t.countdownMinutes },
                    { val: countdown.seconds, label: t.countdownSeconds },
                  ].map(item => (
                    <div key={item.label} className="countdown-box">
                      <span className="countdown-number">{String(item.val).padStart(2, '0')}</span>
                      <span className="countdown-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="glass-card fade-in-up fade-in-up-delay-2" style={{ padding: 24, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🌙</div>
                <h2 className="neon-text" style={{ fontSize: '1.5rem', fontFamily: "'Amiri', serif" }}>{t.ramadanMubarak}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>{t.ramadanStarted}</p>
              </section>
            )}

            {/* Iftar / Sahur Times */}
            <section className="fade-in-up fade-in-up-delay-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🌅</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.sahurTime}</div>
                <div className="neon-text" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{prayerTimes.fajr}</div>
              </div>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🌇</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.iftarTime}</div>
                <div className="neon-text-teal" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{prayerTimes.maghrib}</div>
              </div>
            </section>

            {/* Daily Progress Summary */}
            <section className="glass-card fade-in-up fade-in-up-delay-4" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>{t.todayProgress}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <ProgressRing progress={habitsProgress} size={90} color="#00d4aa">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4aa' }}>{habitsCompleted}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/{habitsTotal}</div>
                  </div>
                </ProgressRing>
                <ProgressRing progress={fastingProgress} size={90} color="#c9a84c">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c9a84c' }}>{fastedCount}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/{TOTAL_DAYS}</div>
                  </div>
                </ProgressRing>
                <div style={{ textAlign: 'center' }}>
                  <div className="streak-badge active">
                    <span>🔥</span>
                    <span>{streak}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6 }}>{t.streak}</div>
                </div>
              </div>
            </section>

            {/* Daily Motivation */}
            <section className="glass-card fade-in-up fade-in-up-delay-5" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>
                ✨ {t.dailyVerse}
              </h3>
              <p className="quote-text">{todayQuote}</p>
            </section>

            {/* Features Grid */}
            <section style={{ marginBottom: 20 }}>
              <h2 className="section-title" style={{ fontSize: '1.3rem' }}>{t.features}</h2>
              <p className="section-subtitle" style={{ fontSize: '0.8rem' }}>{t.heroSubtitle}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: '⏳', title: t.featureCountdown, desc: t.featureCountdownDesc, tab: 'home' as Tab },
                  { icon: '🕌', title: t.featurePrayer, desc: t.featurePrayerDesc, tab: 'prayer' as Tab },
                  { icon: '📿', title: t.featureTasbih, desc: t.featureTasbihDesc, tab: 'tasbih' as Tab },
                  { icon: '📊', title: t.featureTracker, desc: t.featureTrackerDesc, tab: 'tracker' as Tab },
                  { icon: '🌙', title: t.featureFasting, desc: t.featureFastingDesc, tab: 'fasting' as Tab },
                  { icon: '📧', title: t.featureEmail, desc: t.featureEmailDesc, tab: 'home' as Tab },
                ].map(f => (
                  <div
                    key={f.title}
                    className="glass-card"
                    style={{ padding: 18, cursor: 'pointer' }}
                    onClick={() => setActiveTab(f.tab)}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{f.icon}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4, color: 'var(--foreground)' }}>{f.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                ))}
                {/* Calendar page link card */}
                <Link href="/calendar" style={{ textDecoration: 'none', gridColumn: '1 / -1' }}>
                  <div className="glass-card" style={{ padding: 18, cursor: 'pointer', textAlign: 'center', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <span style={{ fontSize: '1.4rem', marginRight: 8 }}>🗓</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {lang === 'az' ? '30 Günlük Namaz Təqvimi' : lang === 'ru' ? '30-дневный календарь намаза' : '30-Day Prayer Calendar'}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-faint)' }}>→</span>
                  </div>
                </Link>
              </div>
            </section>

            {/* Email Subscribe */}
            <section className="glass-card" style={{ padding: 24, marginBottom: 30 }}>
              <h3 className="neon-text" style={{ fontSize: '1.1rem', fontFamily: "'Amiri', serif", marginBottom: 6, textAlign: 'center' }}>
                {t.stayConnected}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: 16 }}>
                {t.subscribeDesc}
              </p>
              {emailSent ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                  <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 6 }}>{t.subscribeSuccess}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {lang === 'az' ? '📧 Təsdiq mesajı email adresinizə göndərildi' : lang === 'ru' ? '📧 Письмо с подтверждением отправлено на ваш email' : '📧 A confirmation email has been sent to your inbox'}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="email"
                    className="email-input"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={emailSending} style={{ whiteSpace: 'nowrap', opacity: emailSending ? 0.6 : 1 }}>
                    {emailSending ? '...' : t.subscribe}
                  </button>
                </form>
              )}
            </section>

            {/* footer */}
            <footer style={{ textAlign: 'center', padding: '20px 0 10px', borderTop: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{t.footer}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>{t.madeWith} ❤️</p>
            </footer>
          </div>
        )}

        {/* ===== PRAYER TAB ===== */}
        {activeTab === 'prayer' && (
          <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
            <section style={{ textAlign: 'center', padding: '30px 0 20px' }}>
              <h1 className="section-title">{t.prayerTimes}</h1>
              <p className="section-subtitle">{formatDate(lang)}</p>
            </section>

            {/* Iftar / Sahur Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🌅</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.sahurTime}</div>
                <div className="neon-text" style={{ fontSize: '1.6rem', fontWeight: 700 }}>{prayerTimes.fajr}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 8 }}>{t.sahurCountdown}</div>
              </div>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🌇</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.iftarTime}</div>
                <div className="neon-text-teal" style={{ fontSize: '1.6rem', fontWeight: 700 }}>{prayerTimes.maghrib}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 8 }}>{t.iftarCountdown}</div>
              </div>
            </div>

            {/* Time to next prayer */}
            <div className="glass-card" style={{ padding: 16, marginBottom: 24, textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.timeRemaining}: </span>
              <span className="neon-text-purple" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{getTimeToNextPrayer(prayerTimes)}</span>
            </div>

            {/* Prayer Times List */}
            <div className="glass-card" style={{ padding: 6, marginBottom: 20 }}>
              {[
                { name: t.fajr, time: prayerTimes.fajr, icon: '🌙' },
                { name: t.sunrise, time: prayerTimes.sunrise, icon: '🌅' },
                { name: t.dhuhr, time: prayerTimes.dhuhr, icon: '☀️' },
                { name: t.asr, time: prayerTimes.asr, icon: '🌤' },
                { name: t.maghrib, time: prayerTimes.maghrib, icon: '🌇' },
                { name: t.isha, time: prayerTimes.isha, icon: '🌃' },
              ].map((prayer, idx) => {
                const now = new Date();
                const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                const isNext = (() => {
                  const times = [prayerTimes.fajr, prayerTimes.sunrise, prayerTimes.dhuhr, prayerTimes.asr, prayerTimes.maghrib, prayerTimes.isha];
                  let nextIdx = times.findIndex(t => t > hhmm);
                  return nextIdx === idx;
                })();
                return (
                  <div
                    key={prayer.name}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', borderRadius: 14,
                      background: isNext ? 'rgba(201,168,76,0.08)' : 'transparent',
                      borderLeft: isNext ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: '1.3rem' }}>{prayer.icon}</span>
                      <span style={{ fontWeight: isNext ? 700 : 500, color: isNext ? 'var(--primary)' : 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                        {prayer.name}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums', color: isNext ? 'var(--primary)' : 'rgba(255,255,255,0.8)' }}>
                      {prayer.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Motivation */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 10, fontWeight: 600 }}>✨ {t.dailyVerse}</h3>
              <p className="quote-text" style={{ fontSize: '1.05rem' }}>{todayQuote}</p>
            </div>

            {/* Calendar Page Link */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Link href="/calendar" className="btn-glass" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', fontSize: '0.9rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 600 }}>
                🗓 {lang === 'az' ? '30 Günlük Namaz Təqvimi' : lang === 'ru' ? '30-дневный календарь намаза' : '30-Day Prayer Calendar'}
              </Link>
            </div>
          </div>
        )}

        {/* ===== TASBIH TAB ===== */}
        {activeTab === 'tasbih' && (
          <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
            <section style={{ textAlign: 'center', padding: '30px 0 10px' }}>
              <h1 className="section-title">{t.tasbih}</h1>
              <p className="section-subtitle">{t.selectDhikr}</p>
            </section>

            {/* Dhikr Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 24 }}>
              {DHIKR_LIST.map(dhikr => (
                <div
                  key={dhikr.id}
                  className={`dhikr-option ${selectedDhikr.id === dhikr.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedDhikr(dhikr); setTasbihCount(0); }}
                >
                  <div style={{ fontSize: '1.1rem', fontFamily: "'Amiri', serif", marginBottom: 2 }}>{dhikr.arabic}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t[dhikr.id as keyof typeof t]}</div>
                </div>
              ))}
            </div>

            {/* Tasbih Counter */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
              {/* Arabic name */}
              <div style={{ fontSize: '1.8rem', fontFamily: "'Amiri', serif", color: 'var(--primary)', marginBottom: 6 }}>
                {selectedDhikr.arabic}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                {t[selectedDhikr.id as keyof typeof t]}
              </div>

              {/* Counter Button */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                {tasbihRipples.map(r => (
                  <div key={r} className="tasbih-ripple" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                ))}
                <div className="tasbih-button" onClick={handleTasbihClick}>
                  <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{tasbihCount}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 4 }}>/ {selectedDhikr.target}</div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div style={{ width: '100%', maxWidth: 300, marginBottom: 20 }}>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%', borderRadius: 3,
                      background: tasbihCount >= selectedDhikr.target
                        ? 'linear-gradient(90deg, var(--success), #00b894)'
                        : 'linear-gradient(90deg, var(--primary), var(--primary-glow))',
                      width: `${Math.min((tasbihCount / selectedDhikr.target) * 100, 100)}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                {tasbihCount >= selectedDhikr.target && (
                  <div style={{ textAlign: 'center', marginTop: 8, color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                    ✅ {t.completed}!
                  </div>
                )}
              </div>

              {/* Reset button */}
              <button className="btn-glass" onClick={resetTasbih} style={{ fontSize: '0.85rem' }}>
                🔄 {t.tasbihReset}
              </button>
            </div>

            {/* Daily Total */}
            <div className="glass-card" style={{ padding: 20, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>{t.dailyTotal}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                <span className="neon-text">{dailyTasbihTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== TRACKER TAB ===== */}
        {activeTab === 'tracker' && (
          <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
            <section style={{ textAlign: 'center', padding: '30px 0 20px' }}>
              <h1 className="section-title">{t.habitTracker}</h1>
              <p className="section-subtitle">{formatDate(lang)}</p>
            </section>

            {/* Progress Summary */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24, textAlign: 'center' }}>
              <ProgressRing progress={habitsProgress} size={120} strokeWidth={8} color="#00d4aa">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00d4aa' }}>{habitsCompleted}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {habitsTotal}</div>
                </div>
              </ProgressRing>
              <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {t.todayProgress}
              </div>
              {habitsCompleted === habitsTotal && (
                <div style={{ marginTop: 12, color: 'var(--success)', fontWeight: 700, fontSize: '1rem' }}>
                  🎉 {t.completed}!
                </div>
              )}
            </div>

            {/* Habit Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { key: 'prayer', icon: '🕌', label: t.prayerDone, color: '#c9a84c' },
                { key: 'quran', icon: '📖', label: t.quranRead, color: '#9b59b6' },
                { key: 'water', icon: '💧', label: t.waterDrink, color: '#3498db' },
                { key: 'work', icon: '💼', label: t.workStudy, color: '#e67e22' },
                { key: 'exercise', icon: '🏃', label: t.exercise, color: '#00d4aa' },
              ].map(habit => (
                <div key={habit.key} className="habit-row" onClick={() => toggleHabit(habit.key)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: '1.3rem' }}>{habit.icon}</span>
                    <span style={{ fontWeight: 500, color: habits[habit.key] ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', fontSize: '0.95rem', textDecoration: habits[habit.key] ? 'line-through' : 'none' }}>
                      {habit.label}
                    </span>
                  </div>
                  <div
                    className={`habit-check ${habits[habit.key] ? 'checked' : ''}`}
                    style={{ borderColor: habits[habit.key] ? habit.color : undefined, background: habits[habit.key] ? habit.color : undefined }}
                  >
                    {habits[habit.key] && <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Streak */}
            <div className="glass-card" style={{ padding: 20, textAlign: 'center', marginBottom: 20 }}>
              <div className="streak-badge active" style={{ fontSize: '1rem', padding: '10px 20px' }}>
                🔥 {t.streak}: {streak} {t.countdownDays}
              </div>
            </div>

            {/* Motivation */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 10, fontWeight: 600 }}>✨ {t.dailyMotivation}</h3>
              <p className="quote-text" style={{ fontSize: '1rem' }}>{todayQuote}</p>
            </div>
          </div>
        )}

        {/* ===== FASTING TAB ===== */}
        {activeTab === 'fasting' && (
          <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
            <section style={{ textAlign: 'center', padding: '30px 0 20px' }}>
              <h1 className="section-title">{t.fastingTracker}</h1>
              <p className="section-subtitle">{t.dayChallenge}</p>
            </section>

            {/* Overall Progress */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 }}>
                <ProgressRing progress={fastingProgress} size={100} strokeWidth={8} color="#c9a84c">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c9a84c' }}>{fastedCount}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/{TOTAL_DAYS}</div>
                  </div>
                </ProgressRing>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.totalFasted}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)' }}>{fastedCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.totalMissed}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--danger)' }}>{missedCount}</div>
                  </div>
                  <div className="streak-badge active">
                    <span>🔥</span>
                    <span>{streak}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.progress}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{Math.round(fastingProgress)}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: 'linear-gradient(90deg, var(--primary), var(--neon-gold))',
                    width: `${fastingProgress}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* 30 Day Calendar Grid */}
            <div className="glass-card" style={{ padding: 18, marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)' }}>
                🗓 {t.dayChallenge}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, justifyItems: 'center' }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const status = fastingDays[day];
                  const isToday = day === ramadanDay;
                  return (
                    <div
                      key={day}
                      className={`calendar-day ${status === 'fasted' ? 'completed' : status === 'missed' ? 'missed' : ''} ${isToday ? 'today' : ''}`}
                      onClick={() => toggleFasting(day)}
                      title={`${t.day} ${day}`}
                    >
                      {status === 'fasted' ? '✓' : status === 'missed' ? '✗' : day}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>✓ {t.fasted}</span>
                <span>✗ {t.missed}</span>
                <span>○ —</span>
              </div>
            </div>

            {/* Day by Day List */}
            <div className="glass-card" style={{ padding: 6, marginBottom: 20 }}>
              {Array.from({ length: Math.min(ramadanDay || 5, 30) }, (_, i) => {
                const day = i + 1;
                const status = fastingDays[day];
                const pt = PRAYER_TIMES_DATA[i];
                return (
                  <div key={day} className="fasting-day-card" style={{ margin: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: status === 'fasted' ? 'rgba(0,212,170,0.15)' : status === 'missed' ? 'rgba(255,71,87,0.15)' : 'rgba(255,255,255,0.04)',
                        color: status === 'fasted' ? 'var(--success)' : status === 'missed' ? 'var(--danger)' : 'rgba(255,255,255,0.4)',
                        fontWeight: 700, fontSize: '0.85rem',
                      }}>
                        {day}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--foreground)' }}>{t.day} {day}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                          {t.sahurTime}: {pt.fajr} | {t.iftarTime}: {pt.maghrib}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`toggle-switch ${status === 'fasted' ? 'active' : ''}`}
                      onClick={() => toggleFasting(day)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto', paddingTop: 20 }}>
            {/* Theme Setting */}
            <section className="glass-card fade-in-up" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎨</span> {t.themeLabel}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  className={`btn-glass ${theme === 'dark' ? 'active-setting' : ''}`}
                  onClick={() => setTheme('dark')}
                  style={{ padding: '12px', textAlign: 'center', background: theme === 'dark' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: theme === 'dark' ? '#fff' : 'inherit', border: theme === 'dark' ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                >
                  🌙 {t.darkMode}
                </button>
                <button
                  className={`btn-glass ${theme === 'light' ? 'active-setting' : ''}`}
                  onClick={() => setTheme('light')}
                  style={{ padding: '12px', textAlign: 'center', background: theme === 'light' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: theme === 'light' ? '#fff' : 'inherit', border: theme === 'light' ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                >
                  ☀️ {t.lightMode}
                </button>
              </div>
            </section>

            {/* Location Setting */}
            <section className="glass-card fade-in-up fade-in-up-delay-1" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📍</span> {t.locationLabel}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.keys(CITIES) as CityKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setCity(key)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: city === key ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                      border: city === key ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                      color: city === key ? 'var(--primary)' : 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{CITIES[key].name[lang]}</span>
                    {city === key && <span>✓</span>}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 500, margin: '0 auto' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.7rem' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

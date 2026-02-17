'use client';

import { useState, useEffect } from 'react';
import { translations, Lang } from '../translations';
import Link from 'next/link';

// Exact Ramadan 2026 prayer times for Baku (from Aladhan API, Diyanet method)
const RAMADAN_CALENDAR = [
    { day: 1, date: '18 Feb', greg: '18-02-2026', imsak: '05:49', fajr: '05:59', sunrise: '07:23', dhuhr: '13:00', asr: '15:56', maghrib: '18:26', isha: '19:45' },
    { day: 2, date: '19 Feb', greg: '19-02-2026', imsak: '05:48', fajr: '05:58', sunrise: '07:22', dhuhr: '12:59', asr: '15:57', maghrib: '18:27', isha: '19:46' },
    { day: 3, date: '20 Feb', greg: '20-02-2026', imsak: '05:47', fajr: '05:57', sunrise: '07:21', dhuhr: '12:59', asr: '15:58', maghrib: '18:29', isha: '19:47' },
    { day: 4, date: '21 Feb', greg: '21-02-2026', imsak: '05:46', fajr: '05:56', sunrise: '07:19', dhuhr: '12:59', asr: '15:58', maghrib: '18:30', isha: '19:48' },
    { day: 5, date: '22 Feb', greg: '22-02-2026', imsak: '05:44', fajr: '05:54', sunrise: '07:18', dhuhr: '12:59', asr: '15:59', maghrib: '18:31', isha: '19:49' },
    { day: 6, date: '23 Feb', greg: '23-02-2026', imsak: '05:43', fajr: '05:53', sunrise: '07:17', dhuhr: '12:59', asr: '16:00', maghrib: '18:32', isha: '19:51' },
    { day: 7, date: '24 Feb', greg: '24-02-2026', imsak: '05:42', fajr: '05:52', sunrise: '07:15', dhuhr: '12:59', asr: '16:01', maghrib: '18:33', isha: '19:52' },
    { day: 8, date: '25 Feb', greg: '25-02-2026', imsak: '05:40', fajr: '05:50', sunrise: '07:14', dhuhr: '12:59', asr: '16:02', maghrib: '18:34', isha: '19:53' },
    { day: 9, date: '26 Feb', greg: '26-02-2026', imsak: '05:39', fajr: '05:49', sunrise: '07:12', dhuhr: '12:58', asr: '16:02', maghrib: '18:35', isha: '19:54' },
    { day: 10, date: '27 Feb', greg: '27-02-2026', imsak: '05:37', fajr: '05:47', sunrise: '07:11', dhuhr: '12:58', asr: '16:03', maghrib: '18:37', isha: '19:55' },
    { day: 11, date: '28 Feb', greg: '28-02-2026', imsak: '05:36', fajr: '05:46', sunrise: '07:09', dhuhr: '12:58', asr: '16:04', maghrib: '18:38', isha: '19:56' },
    { day: 12, date: '1 Mar', greg: '01-03-2026', imsak: '05:34', fajr: '05:44', sunrise: '07:08', dhuhr: '12:58', asr: '16:05', maghrib: '18:39', isha: '19:57' },
    { day: 13, date: '2 Mar', greg: '02-03-2026', imsak: '05:33', fajr: '05:43', sunrise: '07:06', dhuhr: '12:58', asr: '16:05', maghrib: '18:40', isha: '19:58' },
    { day: 14, date: '3 Mar', greg: '03-03-2026', imsak: '05:31', fajr: '05:41', sunrise: '07:05', dhuhr: '12:58', asr: '16:06', maghrib: '18:41', isha: '19:59' },
    { day: 15, date: '4 Mar', greg: '04-03-2026', imsak: '05:30', fajr: '05:40', sunrise: '07:03', dhuhr: '12:57', asr: '16:07', maghrib: '18:42', isha: '20:00' },
    { day: 16, date: '5 Mar', greg: '05-03-2026', imsak: '05:28', fajr: '05:38', sunrise: '07:02', dhuhr: '12:57', asr: '16:08', maghrib: '18:43', isha: '20:01' },
    { day: 17, date: '6 Mar', greg: '06-03-2026', imsak: '05:27', fajr: '05:37', sunrise: '07:00', dhuhr: '12:57', asr: '16:08', maghrib: '18:44', isha: '20:03' },
    { day: 18, date: '7 Mar', greg: '07-03-2026', imsak: '05:25', fajr: '05:35', sunrise: '06:58', dhuhr: '12:57', asr: '16:09', maghrib: '18:46', isha: '20:04' },
    { day: 19, date: '8 Mar', greg: '08-03-2026', imsak: '05:24', fajr: '05:34', sunrise: '06:57', dhuhr: '12:56', asr: '16:10', maghrib: '18:47', isha: '20:05' },
    { day: 20, date: '9 Mar', greg: '09-03-2026', imsak: '05:22', fajr: '05:32', sunrise: '06:55', dhuhr: '12:56', asr: '16:10', maghrib: '18:48', isha: '20:06' },
    { day: 21, date: '10 Mar', greg: '10-03-2026', imsak: '05:20', fajr: '05:30', sunrise: '06:54', dhuhr: '12:56', asr: '16:11', maghrib: '18:49', isha: '20:07' },
    { day: 22, date: '11 Mar', greg: '11-03-2026', imsak: '05:19', fajr: '05:29', sunrise: '06:52', dhuhr: '12:56', asr: '16:12', maghrib: '18:50', isha: '20:08' },
    { day: 23, date: '12 Mar', greg: '12-03-2026', imsak: '05:17', fajr: '05:27', sunrise: '06:51', dhuhr: '12:55', asr: '16:12', maghrib: '18:51', isha: '20:09' },
    { day: 24, date: '13 Mar', greg: '13-03-2026', imsak: '05:15', fajr: '05:25', sunrise: '06:49', dhuhr: '12:55', asr: '16:13', maghrib: '18:52', isha: '20:10' },
    { day: 25, date: '14 Mar', greg: '14-03-2026', imsak: '05:14', fajr: '05:24', sunrise: '06:47', dhuhr: '12:55', asr: '16:13', maghrib: '18:53', isha: '20:11' },
    { day: 26, date: '15 Mar', greg: '15-03-2026', imsak: '05:12', fajr: '05:22', sunrise: '06:46', dhuhr: '12:55', asr: '16:14', maghrib: '18:54', isha: '20:13' },
    { day: 27, date: '16 Mar', greg: '16-03-2026', imsak: '05:10', fajr: '05:20', sunrise: '06:44', dhuhr: '12:54', asr: '16:15', maghrib: '18:55', isha: '20:14' },
    { day: 28, date: '17 Mar', greg: '17-03-2026', imsak: '05:09', fajr: '05:19', sunrise: '06:42', dhuhr: '12:54', asr: '16:15', maghrib: '18:56', isha: '20:15' },
    { day: 29, date: '18 Mar', greg: '18-03-2026', imsak: '05:07', fajr: '05:17', sunrise: '06:41', dhuhr: '12:54', asr: '16:16', maghrib: '18:57', isha: '20:16' },
    { day: 30, date: '19 Mar', greg: '19-03-2026', imsak: '05:05', fajr: '05:15', sunrise: '06:39', dhuhr: '12:53', asr: '16:16', maghrib: '18:58', isha: '20:17' },
];

// Azerbaijan cities with minute offsets from Baku
type CityKey = 'baku' | 'sumgait' | 'ganja' | 'lankaran' | 'sheki' | 'mingachevir' | 'shirvan' | 'nakhchivan' | 'quba' | 'shamakhi';

const CITIES: Record<CityKey, { name: Record<Lang, string>; offset: number }> = {
    baku: { name: { az: 'Bakı', en: 'Baku', ru: 'Баку' }, offset: 0 },
    sumgait: { name: { az: 'Sumqayıt', en: 'Sumgait', ru: 'Сумгаит' }, offset: 1 },
    ganja: { name: { az: 'Gəncə', en: 'Ganja', ru: 'Гянджа' }, offset: 14 },
    lankaran: { name: { az: 'Lənkəran', en: 'Lankaran', ru: 'Ленкорань' }, offset: 4 },
    sheki: { name: { az: 'Şəki', en: 'Sheki', ru: 'Шеки' }, offset: 11 },
    mingachevir: { name: { az: 'Mingəçevir', en: 'Mingachevir', ru: 'Мингечевир' }, offset: 11 },
    shirvan: { name: { az: 'Şirvan', en: 'Shirvan', ru: 'Ширван' }, offset: 4 },
    nakhchivan: { name: { az: 'Naxçıvan', en: 'Nakhchivan', ru: 'Нахчыван' }, offset: 18 },
    quba: { name: { az: 'Quba', en: 'Quba', ru: 'Куба' }, offset: 5 },
    shamakhi: { name: { az: 'Şamaxı', en: 'Shamakhi', ru: 'Шамахы' }, offset: 5 },
};

function addMinutes(time: string, mins: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export default function CalendarPage() {
    const [lang, setLang] = useState<Lang>('az');
    const [city, setCity] = useState<CityKey>('baku');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Load lang/city/theme from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('ramadan-app-data');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.lang) setLang(data.lang);
                if (data.city) setCity(data.city);
                if (data.theme === 'light') document.body.classList.add('light-mode');
            }
        } catch { /* ignore */ }
    }, []);

    const t = translations[lang];

    const calT: Record<Lang, Record<string, string>> = {
        az: {
            title: 'Ramazan 2026 Namaz Təqvimi',
            subtitle: 'Bakı, Azərbaycan — 30 Günlük Namaz Vaxtları',
            backHome: '← Ana Səhifə',
            dayLabel: 'Gün',
            dateLabel: 'Tarix',
            imsakLabel: 'İmsak',
            fajrLabel: 'Sübh',
            sunriseLabel: 'Günəş',
            dhuhrLabel: 'Zöhr',
            asrLabel: 'Əsr',
            maghribLabel: 'Məğrib',
            ishaLabel: 'İşa',
            sahurLabel: 'Sahur',
            iftarLabel: 'İftar',
            fastingDuration: 'Oruc müddəti',
            lailatulQadr: 'Qədr gecəsi',
            selectDay: 'Gün seçin',
            detailTitle: 'Namaz Detalları',
            allTimes: 'Bütün vaxtlar',
            eidAlFitr: 'Ramazan bayramı: 20 Mart 2026',
            location: '📍 Bakı, Azərbaycan',
            method: 'Hesablama: Diyanet İşləri Başkanlığı',
        },
        en: {
            title: 'Ramadan 2026 Prayer Calendar',
            subtitle: 'Baku, Azerbaijan — 30 Day Prayer Timetable',
            backHome: '← Home',
            dayLabel: 'Day',
            dateLabel: 'Date',
            imsakLabel: 'Imsak',
            fajrLabel: 'Fajr',
            sunriseLabel: 'Sunrise',
            dhuhrLabel: 'Dhuhr',
            asrLabel: 'Asr',
            maghribLabel: 'Maghrib',
            ishaLabel: 'Isha',
            sahurLabel: 'Sahur',
            iftarLabel: 'Iftar',
            fastingDuration: 'Fasting duration',
            lailatulQadr: 'Lailat-ul-Qadr',
            selectDay: 'Select a day',
            detailTitle: 'Prayer Details',
            allTimes: 'All times',
            eidAlFitr: 'Eid al-Fitr: March 20, 2026',
            location: '📍 Baku, Azerbaijan',
            method: 'Calculation: Diyanet İşleri Başkanlığı',
        },
        ru: {
            title: 'Рамадан 2026 Календарь Намаза',
            subtitle: 'Баку, Азербайджан — 30-дневное расписание',
            backHome: '← Главная',
            dayLabel: 'День',
            dateLabel: 'Дата',
            imsakLabel: 'Имсак',
            fajrLabel: 'Фаджр',
            sunriseLabel: 'Восход',
            dhuhrLabel: 'Зухр',
            asrLabel: 'Аср',
            maghribLabel: 'Магриб',
            ishaLabel: 'Иша',
            sahurLabel: 'Сухур',
            iftarLabel: 'Ифтар',
            fastingDuration: 'Продолж. поста',
            lailatulQadr: 'Ляйлят-уль-Кадр',
            selectDay: 'Выберите день',
            detailTitle: 'Детали намаза',
            allTimes: 'Все время',
            eidAlFitr: 'Ид аль-Фитр: 20 марта 2026',
            location: '📍 Баку, Азербайджан',
            method: 'Расчёт: Diyanet İşleri Başkanlığı',
        },
    };

    const ct = calT[lang];
    const offset = CITIES[city].offset;

    // Apply offset to all times
    const adjustedCalendar = RAMADAN_CALENDAR.map(d => ({
        ...d,
        imsak: addMinutes(d.imsak, offset),
        fajr: addMinutes(d.fajr, offset),
        sunrise: addMinutes(d.sunrise, offset),
        dhuhr: addMinutes(d.dhuhr, offset),
        asr: addMinutes(d.asr, offset),
        maghrib: addMinutes(d.maghrib, offset),
        isha: addMinutes(d.isha, offset),
    }));

    // Calculate fasting duration
    const getFastingDuration = (fajr: string, maghrib: string) => {
        const [fh, fm] = fajr.split(':').map(Number);
        const [mh, mm] = maghrib.split(':').map(Number);
        const totalMin = (mh * 60 + mm) - (fh * 60 + fm);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${h}h ${m}m`;
    };

    // Lailat-ul-Qadr nights (odd nights in last 10 days)
    const qadrNights = [21, 23, 25, 27, 29];

    const getRamadanDay = () => {
        const now = new Date();
        const start = new Date('2026-02-18T00:00:00+04:00');
        const end = new Date('2026-03-20T00:00:00+04:00');
        if (now < start) return 0;
        if (now >= end) return 31;
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };

    const today = getRamadanDay();
    const detail = selectedDay !== null ? adjustedCalendar[selectedDay - 1] : null;

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <div className="bg-islamic-pattern" />

            {/* Header */}
            <header className="top-header">
                <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                    {ct.backHome}
                </Link>
                <div className="lang-switcher">
                    {(['az', 'en', 'ru'] as Lang[]).map(l => (
                        <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>{l}</button>
                    ))}
                </div>
            </header>

            <main style={{ position: 'relative', zIndex: 10, paddingTop: 80, paddingBottom: 40, maxWidth: 900, margin: '0 auto', padding: '80px 16px 40px' }}>
                {/* Title */}
                <section className="fade-in-up" style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h1 className="section-title" style={{ fontSize: '1.8rem' }}>🗓 {ct.title}</h1>
                    <p className="section-subtitle" style={{ marginBottom: 4 }}>{ct.subtitle}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>📍 {CITIES[city].name[lang]}, Azerbaijan • {ct.method}</p>
                </section>

                {/* Eid notice */}
                <div className="glass-card fade-in-up fade-in-up-delay-1" style={{ padding: 16, marginBottom: 20, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--success)' }}>🎉 {ct.eidAlFitr}</span>
                </div>

                {/* Day Detail Card (if selected) */}
                {detail && (
                    <div className="glass-card fade-in-up" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {ct.detailTitle} — {ct.dayLabel} {detail.day}
                            </h2>
                            <button className="btn-glass" onClick={() => setSelectedDay(null)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>✕</button>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{detail.date} 2026</div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                            {[
                                { label: ct.imsakLabel, time: detail.imsak, icon: '🌑', color: '#9b59b6' },
                                { label: ct.fajrLabel, time: detail.fajr, icon: '🌙', color: '#c9a84c' },
                                { label: ct.sunriseLabel, time: detail.sunrise, icon: '🌅', color: '#e67e22' },
                                { label: ct.dhuhrLabel, time: detail.dhuhr, icon: '☀️', color: '#f1c40f' },
                                { label: ct.asrLabel, time: detail.asr, icon: '🌤', color: '#e74c3c' },
                                { label: ct.maghribLabel, time: detail.maghrib, icon: '🌇', color: '#00d4aa' },
                                { label: ct.ishaLabel, time: detail.isha, icon: '🌃', color: '#3498db' },
                            ].map(p => (
                                <div key={p.label} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{p.icon}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{p.label}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: p.color }}>{p.time}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{ct.sahurLabel}: </span>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{detail.imsak}</span>
                            </div>
                            <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{ct.iftarLabel}: </span>
                                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{detail.maghrib}</span>
                            </div>
                            <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.15)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{ct.fastingDuration}: </span>
                                <span style={{ fontWeight: 700, color: '#9b59b6' }}>{getFastingDuration(detail.fajr, detail.maghrib)}</span>
                            </div>
                        </div>

                        {qadrNights.includes(detail.day) && (
                            <div style={{ marginTop: 14, textAlign: 'center', padding: '8px 16px', borderRadius: 10, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
                                <span style={{ color: 'var(--neon-gold)', fontWeight: 600, fontSize: '0.85rem' }}>✨ {ct.lailatulQadr}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Calendar Table */}
                <div className="glass-card fade-in-up fade-in-up-delay-2" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(201,168,76,0.08)' }}>
                                    {[ct.dayLabel, ct.dateLabel, ct.imsakLabel, ct.fajrLabel, ct.sunriseLabel, ct.dhuhrLabel, ct.asrLabel, ct.maghribLabel, ct.ishaLabel, ct.fastingDuration].map(h => (
                                        <th key={h} style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '0.72rem', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {adjustedCalendar.map(row => {
                                    const isToday = row.day === today;
                                    const isQadr = qadrNights.includes(row.day);
                                    const isSelected = row.day === selectedDay;
                                    return (
                                        <tr
                                            key={row.day}
                                            onClick={() => setSelectedDay(row.day)}
                                            style={{
                                                cursor: 'pointer',
                                                background: isSelected ? 'rgba(201,168,76,0.12)' : isToday ? 'rgba(0,212,170,0.06)' : isQadr ? 'rgba(255,215,0,0.04)' : 'transparent',
                                                borderLeft: isToday ? '3px solid var(--success)' : isQadr ? '3px solid var(--neon-gold)' : '3px solid transparent',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={e => { if (!isToday && !isSelected) (e.currentTarget.style.background = 'rgba(255,255,255,0.03)'); }}
                                            onMouseLeave={e => { if (!isToday && !isSelected) (e.currentTarget.style.background = isQadr ? 'rgba(255,215,0,0.04)' : 'transparent'); }}
                                        >
                                            <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: isToday ? 'var(--success)' : isQadr ? 'var(--neon-gold)' : 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                {row.day} {isQadr ? '✨' : ''}
                                            </td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.date}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: '#9b59b6', fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.imsak}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: 'var(--primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.fajr}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: '#e67e22', fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.sunrise}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: '#f1c40f', fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.dhuhr}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: '#e74c3c', fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.asr}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: 'var(--success)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.maghrib}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: '#3498db', fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.isha}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{getFastingDuration(row.fajr, row.maghrib)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div style={{ marginTop: 16, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    <span>🟢 {lang === 'az' ? 'Bu gün' : lang === 'en' ? 'Today' : 'Сегодня'}</span>
                    <span>✨ {ct.lailatulQadr}</span>
                    <span style={{ color: '#9b59b6' }}>● {ct.imsakLabel}/{ct.sahurLabel}</span>
                    <span style={{ color: 'var(--success)' }}>● {ct.maghribLabel}/{ct.iftarLabel}</span>
                </div>

                {/* Footer */}
                <footer style={{ textAlign: 'center', padding: '30px 0 10px' }}>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>{ct.method}</p>
                </footer>
            </main>
        </div>
    );
}

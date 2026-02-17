'use client';

import { useState, useEffect } from 'react';
import { translations, Lang, CITIES, CityKey } from '../translations';
import Link from 'next/link';

export default function SettingsPage() {
    const [lang, setLang] = useState<Lang>('az');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [city, setCity] = useState<CityKey>('baku');

    // Load settings
    useEffect(() => {
        try {
            const saved = localStorage.getItem('ramadan-app-data');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.lang) setLang(data.lang);
                if (data.theme) setTheme(data.theme);
                if (data.city) setCity(data.city);
                if (data.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
            }
        } catch { /* ignore */ }
    }, []);

    // Save/Apply settings
    const updateSettings = (key: string, value: any) => {
        try {
            const saved = localStorage.getItem('ramadan-app-data');
            const data = saved ? JSON.parse(saved) : {};
            const newData = { ...data, [key]: value };
            localStorage.setItem('ramadan-app-data', JSON.stringify(newData));

            if (key === 'lang') setLang(value);
            if (key === 'city') setCity(value);
            if (key === 'theme') {
                setTheme(value);
                if (value === 'light') document.documentElement.setAttribute('data-theme', 'light');
                else document.documentElement.removeAttribute('data-theme');
            }
        } catch { /* ignore */ }
    };

    const t = translations[lang];

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <div className="bg-islamic-pattern" />

            {/* Header */}
            <header className="top-header" style={{ justifyContent: 'center', position: 'relative' }}>
                <Link href="/" style={{ position: 'absolute', left: 20, color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>‹</span> {t.back}
                </Link>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.settingsTitle}</span>
            </header>

            <main style={{ position: 'relative', zIndex: 10, paddingTop: 90, paddingBottom: 40, maxWidth: 600, margin: '0 auto', paddingLeft: 20, paddingRight: 20 }}>

                {/* Theme Setting */}
                <section className="glass-card fade-in-up" style={{ padding: 20, marginBottom: 16 }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🎨</span> {t.themeLabel}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            className={`btn-glass ${theme === 'dark' ? 'active-setting' : ''}`}
                            onClick={() => updateSettings('theme', 'dark')}
                            style={{ padding: '12px', textAlign: 'center', background: theme === 'dark' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: theme === 'dark' ? '#fff' : 'inherit', border: theme === 'dark' ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                        >
                            🌙 {t.darkMode}
                        </button>
                        <button
                            className={`btn-glass ${theme === 'light' ? 'active-setting' : ''}`}
                            onClick={() => updateSettings('theme', 'light')}
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
                                onClick={() => updateSettings('city', key)}
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

                {/* Language Setting */}
                <section className="glass-card fade-in-up fade-in-up-delay-2" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🌐</span> {t.languageLabel}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        {(['az', 'en', 'ru'] as Lang[]).map(l => (
                            <button
                                key={l}
                                className={`btn-glass`}
                                onClick={() => updateSettings('lang', l)}
                                style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    background: lang === l ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: lang === l ? '#fff' : 'inherit',
                                    textTransform: 'uppercase',
                                    border: lang === l ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}

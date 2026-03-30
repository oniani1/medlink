import React from 'react';
import { FiGlobe, FiCalendar } from 'react-icons/fi';

interface TopBarProps {
  lang: 'ka' | 'en';
  onToggleLang: () => void;
}

export function TopBar({ lang, onToggleLang }: TopBarProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <FiCalendar className="text-slate-400" />
        <span>{dateStr}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <FiGlobe className="text-sm" />
          {lang === 'ka' ? 'EN' : 'KA'}
        </button>
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
          GA
        </div>
      </div>
    </header>
  );
}

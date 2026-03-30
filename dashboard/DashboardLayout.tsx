import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

export function DashboardLayout() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar
        lang={lang}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar lang={lang} onToggleLang={() => setLang(l => (l === 'ka' ? 'en' : 'ka'))} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ lang }} />
        </main>
      </div>
    </div>
  );
}

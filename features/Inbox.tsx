import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiSearchLine, RiStarFill, RiMessage3Line, RiUserSearchLine, RiRefreshLine } from 'react-icons/ri';
import { useStore } from '../store';
import { translations } from '../utils';
import { Avatar } from '../components/UI';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

export const InboxScreen = () => {
  const { currentUser, conversations, users, language } = useStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const navigate = useNavigate();
  const t = translations[language];

  // G7 — Pull-to-refresh handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollContainerRef.current || scrollContainerRef.current.scrollTop > 0) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && diff < 120) {
      setPullDistance(diff);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      setRefreshing(true);
      setPullDistance(0);
      setTimeout(() => setRefreshing(false), 1000);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!currentUser) return null;

  const getPartner = (c: any) => {
    const partnerId = currentUser.role === 'patient' ? c.doctorUid : (c.patientUid === currentUser.uid ? c.doctorUid : c.patientUid);
    return users.find(u => u.uid === partnerId);
  };

  const filtered = conversations
    .filter(c => c.doctorUid === currentUser.uid || c.patientUid === currentUser.uid || (currentUser.role === 'assistant' && c.doctorUid === 'doc-1'))
    .filter(c => {
      if (filter === 'starred') return c.isStarred;
      if (filter === 'unread') {
        const count = currentUser.role === 'patient' ? c.unreadCounts.patient : c.unreadCounts.doctor;
        return count > 0;
      }
      return true;
    })
    .filter(c => {
      const partner = getPartner(c);
      if (!partner) return false;
      const name = partner.displayName[language as 'ka'] || partner.displayName['en'];
      return name?.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const dateLocale = language === 'ka' ? { locale: ka } : {};

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      <div className="px-4 py-3 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-sm">
        <div className="flex justify-between items-center mb-3">
             <h1 className="text-2xl font-bold text-slate-900">{t.inbox}</h1>
             {currentUser.role === 'doctor' && (
                 <button
                    onClick={() => navigate('/doctor-directory')}
                    className="p-2 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 flex items-center gap-2 px-4 shadow-sm border border-teal-100"
                 >
                     <RiUserSearchLine size={18} /> <span className="text-[10px] font-bold uppercase tracking-wide">{t.colleagues}</span>
                 </button>
             )}
        </div>

        <div className="relative mb-3">
          <RiSearchLine className="absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full bg-slate-100/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'unread', 'starred'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors border ${filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {t[f as keyof typeof t] || f}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto pb-24 pt-2"
      >
        {(pullDistance > 0 || refreshing) && (
          <div className="flex justify-center py-3" style={{ height: refreshing ? 48 : pullDistance * 0.5 }}>
            <RiRefreshLine size={20} className={`text-teal-500 transition-transform ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
          </div>
        )}
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <RiMessage3Line size={24} className="opacity-50"/>
             </div>
             <p className="font-medium text-sm">{t.no_conversations}</p>
           </div>
        ) : (
          filtered.map(c => {
            const partner = getPartner(c);
            const unread = currentUser.role === 'patient' ? c.unreadCounts.patient : c.unreadCounts.doctor;
            const name = partner?.displayName[language as 'ka'] || partner?.displayName['en'];

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/chat/${c.id}`)}
                className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer ${unread > 0 ? 'bg-teal-50/30' : ''}`}
              >
                <div className="relative">
                  <Avatar name={name || 'User'} color={partner?.avatarColor} src={partner?.avatarUrl} />
                  {unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                      {unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`truncate ${unread > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{name}</h3>
                    <span className={`text-[10px] whitespace-nowrap ml-2 ${unread > 0 ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>
                      {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true, ...dateLocale })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-4 ${unread > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                      {c.lastMessagePreview}
                    </p>
                    {c.isStarred && <RiStarFill className="text-amber-400 text-xs shrink-0" />}
                  </div>
                  {c.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {c.tags.map(tag => {
                        const tagMap: Record<string, string> = {
                          'Urgent': t.tag_urgent,
                          'Follow-up': t.tag_followup,
                          'Chronic': t.tag_chronic,
                          'Lab Results': t.tag_lab,
                          'New Patient': t.tag_new,
                        };
                        return (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
                            {tagMap[tag] || tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

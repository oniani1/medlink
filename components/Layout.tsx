import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMessage3Line, RiUserHeartLine, RiStethoscopeLine, RiSettings4Line, RiUserLine } from 'react-icons/ri';
import { useStore } from '../store';
import { translations } from '../utils';
import { Toast } from './UI';

export const PhoneFrame = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-100 sm:flex sm:items-center sm:justify-center sm:p-4">
    <div className="w-full sm:max-w-[390px] h-[100dvh] sm:h-[844px] bg-white sm:rounded-[3rem] sm:border-[8px] sm:border-slate-900 sm:shadow-2xl overflow-hidden relative flex flex-col">
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50"></div>
      <div className="hidden sm:block h-4 shrink-0"></div>
      {children}
      <Toast />
    </div>
  </div>
);

export const TopBar = ({ title, left, right, transparent = false }: any) => (
  <div className={`h-16 flex items-center justify-between px-4 z-20 shrink-0 ${transparent ? 'bg-transparent' : 'bg-white border-b border-slate-100'}`}>
    <div className="w-10 flex justify-center">{left}</div>
    <h1 className="font-bold text-lg text-slate-800 truncate flex-1 text-center">{title}</h1>
    <div className="w-auto min-w-10 flex justify-end gap-1">{right}</div>
  </div>
);

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, language } = useStore();
  const t = translations[language];

  if (!currentUser) return null;

  const hiddenRoutes = ['/chat/', '/call-active', '/anamnesis-wizard'];
  if (hiddenRoutes.some(r => location.pathname.startsWith(r))) return null;

  const isActive = (path: string) => {
    if (path === '/inbox') return location.pathname === '/inbox' || location.pathname.startsWith('/chat/');
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-around pb-4 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      <button onClick={() => navigate('/inbox')} className={itemClass(isActive('/inbox'))}>
        <RiMessage3Line size={24} />
        <span className="text-[10px] font-bold">{t.inbox}</span>
      </button>

      {currentUser.role === 'patient' && (
        <button onClick={() => navigate('/connect')} className={itemClass(isActive('/connect'))}>
          <RiUserHeartLine size={24} />
          <span className="text-[10px] font-bold">{t.connections}</span>
        </button>
      )}

      {currentUser.role === 'doctor' && (
        <button onClick={() => navigate('/requests')} className={itemClass(isActive('/requests'))}>
           <RiUserHeartLine size={24} />
           <span className="text-[10px] font-bold">{t.requests}</span>
        </button>
      )}

      {currentUser.role === 'patient' ? (
        <button onClick={() => navigate('/anamnesis-view')} className={itemClass(isActive('/anamnesis-view'))}>
          <RiStethoscopeLine size={24} />
          <span className="text-[10px] font-bold">{t.anamnesis}</span>
        </button>
      ) : (
         <button onClick={() => navigate('/doctor-profile')} className={itemClass(isActive('/doctor-profile'))}>
          <RiUserLine size={24} />
          <span className="text-[10px] font-bold">{t.doctor}</span>
        </button>
      )}

      <button onClick={() => navigate('/settings')} className={itemClass(isActive('/settings'))}>
        <RiSettings4Line size={24} />
        <span className="text-[10px] font-bold">{t.settings}</span>
      </button>
    </div>
  );
};

export const RoleSwitcher = () => {
  const { users, currentUser, setCurrentUser } = useStore();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Position above BottomNav when visible, near bottom when hidden
  const hiddenRoutes = ['/chat/', '/call-active', '/anamnesis-wizard'];
  const isNavHidden = hiddenRoutes.some(r => location.pathname.startsWith(r));

  return (
    <div className={`absolute left-4 z-50 ${isNavHidden ? 'bottom-4' : 'bottom-24'}`}>
      {open && (
        <div className="mb-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col w-48 max-h-64 overflow-y-auto">
          <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 uppercase">Dev Switcher</div>
          {users.map(u => (
            <button
              key={u.uid}
              onClick={() => {
                setCurrentUser(u.uid);
                setOpen(false);
                navigate('/inbox');
              }}
              className={`text-left px-4 py-3 text-sm hover:bg-teal-50 border-b border-slate-50 last:border-0 ${currentUser?.uid === u.uid ? 'font-bold text-teal-600' : 'text-slate-700'}`}
            >
              {u.displayName.ka} <span className="text-xs opacity-50 block">{u.role}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-5 h-5 bg-slate-300/70 rounded-full active:scale-90 transition-transform"
        title="Dev switcher"
      />
    </div>
  );
};

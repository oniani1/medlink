import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TopBar } from '../components/Layout';
import { Avatar, Modal, Button } from '../components/UI';
import { translations } from '../utils';
import { RiShieldKeyholeLine, RiNotification3Line, RiGlobalLine, RiInformationLine, RiDeleteBinLine } from 'react-icons/ri';

export const SettingsScreen = () => {
  const { currentUser, language, setLanguage, logout, deleteAccount, showToast } = useStore();
  const [showDelete, setShowDelete] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const navigate = useNavigate();
  const t = translations[language];

  if (!currentUser) return null;

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    setShowDelete(false);
    navigate('/');
  };

  const handleSavePin = () => {
    if (pin.every(d => d !== '')) {
      setShowPin(false);
      setPin(['', '', '', '']);
      showToast(t.save_pin);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full">
       <TopBar title={t.settings} />
       <div className="flex-1 overflow-y-auto p-6 pb-24">
         <div className="flex items-center gap-4 mb-8">
            <Avatar name={currentUser.displayName[language as 'ka'] || currentUser.displayName.en} color={currentUser.avatarColor} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{currentUser.displayName[language as 'ka']}</h2>
              <p className="text-teal-600 font-medium capitalize">{t[currentUser.role as 'doctor'] || currentUser.role}</p>
              <p className="text-xs text-slate-400 mt-1">{currentUser.phone}</p>
            </div>
         </div>

         <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2">{t.preferences}</h3>
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-50">
               <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium text-sm">
                   <RiGlobalLine className="text-teal-500" size={18} /> {t.language}
               </div>
               <div className="flex bg-slate-100 rounded-lg p-1">
                 {(['ka', 'en'] as const).map(l => (
                   <button
                     key={l}
                     onClick={() => setLanguage(l)}
                     className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${language === l ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500'}`}
                   >
                     {l.toUpperCase()}
                   </button>
                 ))}
               </div>
            </div>

            <button className="w-full p-4 text-left border-b border-slate-50 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700">
                <RiNotification3Line className="text-teal-500" size={18} /> {t.notifications} <span className="ml-auto text-xs text-slate-400">{t.on}</span>
            </button>
         </div>

         <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2">{t.security}</h3>
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
             <button onClick={() => setShowPin(true)} className="w-full p-4 text-left border-b border-slate-50 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700">
                <RiShieldKeyholeLine className="text-teal-500" size={18} /> {t.change_pin}
            </button>
             <button onClick={() => setShowPrivacy(true)} className="w-full p-4 text-left hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700">
                <RiInformationLine className="text-teal-500" size={18} /> {t.privacy_policy}
            </button>
         </div>

         <button onClick={handleLogout} className="w-full p-4 rounded-xl bg-slate-200 text-slate-600 font-bold mb-4 text-sm hover:bg-slate-300 transition-colors">
            {t.logout}
         </button>

         <button onClick={() => setShowDelete(true)} className="w-full p-4 text-red-500 font-medium text-xs flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-colors">
            <RiDeleteBinLine /> {t.delete_account}
         </button>

         <div className="text-center text-xs text-slate-300 mt-6">MedLink v1.0.0 (Build 42)</div>
       </div>

       {/* PIN Modal */}
       <Modal isOpen={showPin} onClose={() => { setShowPin(false); setPin(['', '', '', '']); }} title={t.change_pin}>
           <p className="text-sm text-slate-500 mb-4">{t.enter_new_pin}</p>
           <div className="flex justify-center gap-4 mb-6">
               {[0, 1, 2, 3].map(i => (
                 <input
                   key={i}
                   ref={pinRefs[i]}
                   type="text"
                   inputMode="numeric"
                   maxLength={1}
                   value={pin[i]}
                   onChange={(e) => handlePinChange(i, e.target.value)}
                   onKeyDown={(e) => handlePinKeyDown(i, e)}
                   className="w-12 h-12 border-2 rounded-xl text-center text-xl font-bold bg-slate-50 focus:border-teal-500 focus:outline-none transition-colors"
                 />
               ))}
           </div>
           <Button fullWidth onClick={handleSavePin} disabled={pin.some(d => d === '')}>{t.save}</Button>
       </Modal>

       {/* Privacy Policy Modal */}
       <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title={t.privacy_policy}>
           <div className="max-h-60 overflow-y-auto text-sm text-slate-600 leading-relaxed whitespace-pre-line">
             {t.privacy_policy_text}
           </div>
           <Button fullWidth onClick={() => setShowPrivacy(false)} variant="secondary" className="mt-4">{t.back}</Button>
       </Modal>

       {/* Delete Account Modal */}
       <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title={t.delete_account}>
           <div className="text-center">
               <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <RiDeleteBinLine size={32} />
               </div>
               <p className="text-slate-600 mb-6 font-medium">{t.delete_confirm}</p>
               <div className="flex flex-col gap-3">
                   <Button variant="danger" fullWidth onClick={handleDeleteAccount}>{t.yes_delete}</Button>
                   <Button variant="ghost" fullWidth onClick={() => setShowDelete(false)}>{t.cancel}</Button>
               </div>
           </div>
       </Modal>
    </div>
  );
};

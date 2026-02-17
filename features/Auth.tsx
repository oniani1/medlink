import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiHeartPulseFill, RiStethoscopeFill, RiUserHeartFill } from 'react-icons/ri';
import { useStore } from '../store';
import { Button, Input } from '../components/UI';
import { TopBar } from '../components/Layout';
import { translations } from '../utils';

export const Splash = () => {
  const navigate = useNavigate();
  const { setLanguage } = useStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-teal-600 text-white p-8">
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-teal-600 mb-8 shadow-2xl animate-bounce">
        <RiHeartPulseFill size={48} />
      </div>
      <h1 className="text-4xl font-bold mb-2 tracking-tight">MedLink</h1>
      <p className="text-teal-100 mb-12">{translations.ka.app_tagline}</p>

      <div className="flex gap-4">
        {(['ka', 'en'] as const).map(lang => (
          <button
            key={lang}
            onClick={() => { setLanguage(lang); navigate('/auth/login'); }}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold uppercase backdrop-blur-sm border border-white/20 transition-all"
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Login = () => {
  const [phone, setPhone] = useState('+995 ');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language } = useStore();
  const t = translations[language];

  const handleSendCode = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1000);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/auth/role'); }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <TopBar title={t.app_name} left={<button onClick={() => step === 2 ? setStep(1) : navigate('/')} className="text-slate-400">{t.back}</button>} />
      <div className="p-6 flex-1">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.welcome_back}</h2>
            <p className="text-slate-500 mb-8">{t.enter_phone}</p>
            <Input label={t.emergency_phone} value={phone} onChange={(e: any) => setPhone(e.target.value)} inputMode="tel" />
            <Button fullWidth onClick={handleSendCode} disabled={loading}>{loading ? '...' : t.send_code}</Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.enter_code}</h2>
            <p className="text-slate-500 mb-8">{t.code_sent_to} {phone}</p>
            <Input label={t.six_digit_code} value={otp} onChange={(e: any) => setOtp(e.target.value)} placeholder="000000" className="text-center text-2xl tracking-widest" inputMode="numeric" />
            <Button fullWidth onClick={handleVerify} disabled={loading}>{loading ? '...' : t.verify}</Button>
          </>
        )}
      </div>
    </div>
  );
};

export const RoleSelect = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser, language } = useStore();
  const t = translations[language];

  const loginAs = (role: 'doctor' | 'patient') => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user.uid);
      if (role === 'doctor') navigate('/inbox');
      else navigate('/anamnesis-wizard');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 mt-4 text-center">{t.i_am_a}</h2>

      <button onClick={() => loginAs('doctor')} className="bg-white p-6 rounded-3xl shadow-sm mb-4 flex items-center gap-4 hover:shadow-md transition-all border border-transparent hover:border-teal-500">
        <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
          <RiStethoscopeFill size={32} />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-lg text-slate-900">{t.doctor}</h3>
          <p className="text-sm text-slate-500">{t.manage_patients}</p>
        </div>
      </button>

      <button onClick={() => loginAs('patient')} className="bg-white p-6 rounded-3xl shadow-sm mb-4 flex items-center gap-4 hover:shadow-md transition-all border border-transparent hover:border-teal-500">
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500">
          <RiUserHeartFill size={32} />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-lg text-slate-900">{t.patient}</h3>
          <p className="text-sm text-slate-500">{t.find_doctors}</p>
        </div>
      </button>

      <div className="mt-8 text-center text-xs text-slate-400">
        {t.terms_of_service}
      </div>
    </div>
  );
};

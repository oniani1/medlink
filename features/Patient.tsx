import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiQrCodeLine, RiSearchLine, RiHospitalLine, RiMapPinLine, RiUserAddLine, RiCheckLine, RiCameraLine } from 'react-icons/ri';
import { useStore } from '../store';
import { TopBar } from '../components/Layout';
import { Button, Input, Avatar } from '../components/UI';
import { translations } from '../utils';

export const ConnectToDoctor = () => {
  const { users, currentUser, connections, createConnectionRequest, language } = useStore();
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'not-found' | 'success' | 'scanning'>('idle');
  const navigate = useNavigate();
  const t = translations[language];

  const handleSearch = () => {
    if (!searchId) return;
    setStatus('searching');
    setTimeout(() => {
      const doctor = users.find(u =>
        u.role === 'doctor' &&
        ((u as any).doctorId.toLowerCase() === searchId.toLowerCase() ||
         u.displayName.en?.toLowerCase().includes(searchId.toLowerCase()) ||
         u.displayName.ka.includes(searchId))
      );

      if (doctor) {
        setResult(doctor);
        setStatus('found');
      } else {
        setStatus('not-found');
      }
    }, 800);
  };

  const handleConnect = () => {
    if (result && currentUser) {
      createConnectionRequest(result.uid, currentUser.uid);
      setStatus('success');
      setTimeout(() => navigate('/inbox'), 2000);
    }
  };

  const handleScanQR = () => {
    setStatus('scanning');
    setTimeout(() => {
      const firstDoctor = users.find(u => u.role === 'doctor');
      if (firstDoctor) {
        setSearchId((firstDoctor as any).doctorId || 'ML-1001');
        setResult(firstDoctor);
        setStatus('found');
      }
    }, 2500);
  };

  const existingConnection = result && connections.find(c =>
    c.doctorUid === result.uid && c.patientUid === currentUser?.uid
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      <TopBar title={t.request_connection} left={<button onClick={() => navigate('/inbox')} className="text-slate-400">{t.back}</button>} />

      <div className="p-6 flex-1 overflow-y-auto pb-24">
        <button
          onClick={handleScanQR}
          className="w-full bg-teal-50 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 border border-teal-100 hover:bg-teal-100 transition-colors active:scale-[0.98]"
        >
           <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm mb-4">
             <RiQrCodeLine size={32} />
           </div>
           <p className="text-center text-teal-800 text-sm font-medium">{t.scan_qr}</p>
           <p className="text-center text-teal-600 text-xs mt-1">{t.ask_doctor_id}</p>
        </button>

        {status === 'scanning' && (
          <div className="mb-6 rounded-2xl overflow-hidden relative bg-slate-900 aspect-square max-h-48 w-full flex items-center justify-center animate-slide-up">
            <div className="absolute inset-4 border-2 border-teal-400 rounded-xl opacity-60"></div>
            <div className="absolute left-4 right-4 h-0.5 bg-teal-400 animate-bounce" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full">
                <RiCameraLine className="text-teal-400" />
                <span className="text-teal-400 text-sm font-medium">{t.scanning}</span>
              </div>
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Input
                    placeholder={t.enter_doctor_id_placeholder}
                    value={searchId}
                    onChange={(e: any) => setSearchId(e.target.value)}
                    className="mb-0"
                    onKeyDown={(e: any) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <button
                onClick={handleSearch}
                disabled={!searchId}
                className="h-[50px] w-[50px] mb-4 bg-slate-900 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
            >
                <RiSearchLine size={24} />
            </button>
          </div>
        </div>

        {status === 'searching' && (
            <div className="text-center text-slate-400 py-8 animate-pulse">{t.search_directory}</div>
        )}

        {status === 'not-found' && (
            <div className="text-center py-8">
                <p className="text-slate-900 font-bold mb-1">{t.doctor_not_found}</p>
                <p className="text-slate-500 text-sm">{t.check_id_try_again}</p>
            </div>
        )}

        {status === 'found' && result && (
            <div className="border border-slate-200 rounded-2xl p-4 shadow-lg animate-slide-up">
                <div className="flex items-start gap-4 mb-4 border-b border-slate-100 pb-4">
                    <Avatar name={result.displayName.en} color={result.avatarColor} size="lg" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{result.displayName[language] || result.displayName.en}</h2>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {result.specialties.map((s: string) => (
                                <span key={s} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {result.clinics.map((c: any, i: number) => (
                        <div key={i} className="flex gap-3 text-sm text-slate-600">
                            <RiHospitalLine className="shrink-0 mt-0.5 text-slate-400" />
                            <div>
                                <p className="font-medium text-slate-900">{c.name}</p>
                                <p className="text-xs">{c.address}, {c.city}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {existingConnection ? (
                     <div className="bg-slate-100 text-slate-600 p-3 rounded-xl text-center font-medium text-sm">
                        {existingConnection.status === 'pending' ? t.request_pending : t.already_connected}
                     </div>
                ) : (
                    <Button fullWidth onClick={handleConnect}>
                        <RiUserAddLine /> {t.request_connection}
                    </Button>
                )}
            </div>
        )}

        {status === 'success' && (
            <div className="text-center py-8 animate-slide-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiCheckLine size={32} />
                </div>
                <h3 className="font-bold text-lg text-slate-900">{t.request_sent}</h3>
                <p className="text-slate-500 text-sm">{t.wait_for_approval}</p>
            </div>
        )}
      </div>
    </div>
  );
};

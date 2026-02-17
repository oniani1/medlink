import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/Layout';
import { Button, Avatar, Input, Modal } from '../components/UI';
import { RiCheckLine, RiCloseLine, RiTimeLine, RiSettings3Line, RiUserLine, RiAddLine, RiDeleteBinLine, RiQrCodeLine, RiWallet3Line, RiSearchLine, RiChat1Line, RiProhibitedLine, RiCalendarEventLine } from 'react-icons/ri';
import { format } from 'date-fns';
import { Doctor } from '../types';
import { formatCurrency, translations } from '../utils';
import { useNavigate } from 'react-router-dom';

export const ConnectionRequests = () => {
    const { currentUser, connections, updateConnectionStatus, users, language } = useStore();
    const t = translations[language];

    if (!currentUser || currentUser.role !== 'doctor') return null;

    const reqs = connections.filter(c => c.doctorUid === currentUser.uid && c.status === 'pending');

    return (
        <div className="flex-1 bg-white flex flex-col">
            <TopBar title={t.requests} left={<button onClick={() => window.history.back()} className="text-slate-400">{t.back}</button>} />
            <div className="flex-1 p-4 overflow-y-auto pb-24">
                {reqs.length === 0 ? <p className="text-center text-slate-400 mt-10">{t.no_pending_requests}</p> : (
                    reqs.map(r => {
                        const pat = users.find(u => u.uid === r.patientUid);
                        return (
                            <div key={r.id} className="border rounded-2xl p-4 mb-4 shadow-sm bg-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar name={pat?.displayName.en || 'P'} color={pat?.avatarColor} />
                                    <div>
                                        <h3 className="font-bold text-slate-900 truncate">{pat?.displayName[language] || pat?.displayName.ka}</h3>
                                        <p className="text-xs text-slate-500">{format(new Date(r.createdAt), 'MMM d, HH:mm')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1 py-2 text-sm" onClick={() => updateConnectionStatus(r.id, 'declined')}>{t.decline}</Button>
                                    <Button className="flex-1 py-2 text-sm" onClick={() => updateConnectionStatus(r.id, 'accepted')}>{t.accept}</Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export const DoctorDirectory = () => {
    const { users, currentUser, createConversation, language } = useStore();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const t = translations[language];

    const doctors = users.filter(u => u.role === 'doctor' && u.uid !== currentUser?.uid);
    const filtered = doctors.filter(d =>
        d.displayName.ka.toLowerCase().includes(search.toLowerCase()) ||
        d.displayName.en?.toLowerCase().includes(search.toLowerCase()) ||
        (d as any).specialties?.join(' ').toLowerCase().includes(search.toLowerCase())
    );

    const handleChat = (docId: string) => {
        if (!currentUser) return;
        const convId = createConversation(currentUser.uid, docId);
        navigate(`/chat/${convId}`);
    };

    return (
        <div className="flex-1 bg-white flex flex-col">
            <TopBar title={t.colleagues} left={<button onClick={() => navigate('/inbox')} className="text-slate-400">{t.back}</button>} />
            <div className="p-4 flex-1 overflow-y-auto pb-24">
                <div className="relative mb-6">
                    <RiSearchLine className="absolute left-3 top-3 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t.search_doctors}
                        className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <div className="space-y-4">
                    {filtered.map(doc => (
                         <div key={doc.uid} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                             <Avatar name={doc.displayName.en} color={doc.avatarColor} />
                             <div className="flex-1 min-w-0">
                                 <h3 className="font-bold text-slate-900 truncate">{doc.displayName[language] || doc.displayName.ka}</h3>
                                 <p className="text-xs text-teal-600 font-medium truncate">{(doc as any).specialties?.join(', ')}</p>
                                 <p className="text-xs text-slate-400 mt-1">{(doc as any).clinics?.[0]?.name}</p>
                             </div>
                             <button
                                onClick={() => handleChat(doc.uid)}
                                className="p-3 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100"
                             >
                                 <RiChat1Line size={20} />
                             </button>
                         </div>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-8">{t.no_colleagues}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScheduleEditor = ({ doctor, onUpdate }: { doctor: Doctor, onUpdate: (d: Partial<Doctor>) => void }) => {
    const { addDoctorException, language } = useStore();
    const [showException, setShowException] = useState(false);
    const [exData, setExData] = useState({ start: '', end: '', label: '' });
    const t = translations[language];

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const toggleDay = (day: string) => {
        const current = doctor.workingHours[day];
        onUpdate({
            workingHours: {
                ...doctor.workingHours,
                [day]: { ...current, enabled: !current.enabled }
            }
        });
    };

    const updateTime = (day: string, type: 'start' | 'end', val: string) => {
        const current = doctor.workingHours[day];
        onUpdate({
            workingHours: {
                ...doctor.workingHours,
                [day]: { ...current, [type]: val }
            }
        });
    };

    const handleAddException = () => {
        if(exData.start && exData.end) {
            addDoctorException(doctor.uid, exData);
            setShowException(false);
            setExData({ start: '', end: '', label: '' });
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-bold text-slate-900 mb-4 text-lg">{t.weekly_schedule}</h3>
                <div className="space-y-4">
                    {days.map(day => {
                        const schedule = doctor.workingHours[day];
                        const isEnabled = schedule?.enabled ?? false;

                        return (
                            <div key={day} className={`p-3 rounded-2xl border transition-all ${isEnabled ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3" onClick={() => toggleDay(day)}>
                                        <div
                                            className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${isEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? 'translate-x-4' : ''}`} />
                                        </div>
                                        <span className="font-bold text-sm uppercase text-slate-700">{day}</span>
                                    </div>
                                    {!isEnabled && <span className="text-xs text-slate-400 font-medium italic">{t.closed}</span>}
                                </div>

                                {isEnabled && (
                                    <div className="flex items-center gap-2 mt-2 ml-[52px]">
                                        <input
                                            type="time"
                                            value={schedule.start}
                                            onChange={(e) => updateTime(day, 'start', e.target.value)}
                                            className="flex-1 min-w-0 bg-slate-100 rounded-lg px-2 py-1.5 text-sm text-slate-900 font-medium focus:ring-1 focus:ring-teal-500 outline-none"
                                        />
                                        <span className="text-slate-400 text-xs">—</span>
                                        <input
                                            type="time"
                                            value={schedule.end}
                                            onChange={(e) => updateTime(day, 'end', e.target.value)}
                                            className="flex-1 min-w-0 bg-slate-100 rounded-lg px-2 py-1.5 text-sm text-slate-900 font-medium focus:ring-1 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 text-lg">{t.vacations}</h3>
                    <button onClick={() => setShowException(true)} className="text-teal-600 text-xs font-bold uppercase flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100"><RiAddLine size={16} /> {t.add_new}</button>
                </div>
                {showException && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 animate-slide-up shadow-inner">
                        <Input type="date" label={t.start_date} value={exData.start} onChange={(e: any) => setExData({...exData, start: e.target.value})} />
                        <Input type="date" label={t.end_date} value={exData.end} onChange={(e: any) => setExData({...exData, end: e.target.value})} />
                        <Input label={t.reason_optional} value={exData.label} onChange={(e: any) => setExData({...exData, label: e.target.value})} />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowException(false)} className="text-slate-500 text-sm font-bold px-4 py-2 hover:bg-slate-100 rounded-lg">{t.cancel}</button>
                            <Button onClick={handleAddException} className="py-2 text-sm">{t.save}</Button>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {doctor.exceptions.map((ex, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl flex items-center gap-3 w-full sm:w-auto">
                            <RiCalendarEventLine className="text-amber-500" size={20} />
                            <div>
                                <p className="text-sm font-bold text-amber-900">{format(new Date(ex.start), 'MMM d')} - {format(new Date(ex.end), 'MMM d')}</p>
                                {ex.label && <p className="text-xs text-amber-700 mt-0.5">{ex.label}</p>}
                            </div>
                        </div>
                    ))}
                     {doctor.exceptions.length === 0 && <div className="w-full text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">{t.no_exceptions}</div>}
                </div>
            </div>
        </div>
    );
};

const ProfileEditor = ({ doctor, onUpdate }: { doctor: Doctor, onUpdate: (d: Partial<Doctor>) => void }) => {
    const { language, payments } = useStore();
    const [newClinic, setNewClinic] = useState(false);
    const [tempClinic, setTempClinic] = useState({ name: '', address: '', city: 'Tbilisi' });
    const [showSpecialtyInput, setShowSpecialtyInput] = useState(false);
    const [newSpecialty, setNewSpecialty] = useState('');
    const t = translations[language];

    const balance = payments
        .filter(p => p.doctorUid === doctor.uid)
        .reduce((sum, p) => sum + p.amountGEL, 0);

    const addClinic = () => {
        if (tempClinic.name) {
            onUpdate({ clinics: [...doctor.clinics, tempClinic] });
            setNewClinic(false);
            setTempClinic({ name: '', address: '', city: 'Tbilisi' });
        }
    };

    const removeClinic = (idx: number) => {
        const next = [...doctor.clinics];
        next.splice(idx, 1);
        onUpdate({ clinics: next });
    };

    const addSpecialty = () => {
        if (newSpecialty.trim()) {
            onUpdate({ specialties: [...doctor.specialties, newSpecialty.trim()] });
            setNewSpecialty('');
            setShowSpecialtyInput(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-xl shadow-teal-900/20">
                <div className="flex items-center gap-3 mb-2 opacity-80">
                    <RiWallet3Line size={20} />
                    <span className="text-sm font-medium uppercase tracking-wider">{t.current_balance}</span>
                </div>
                <div className="text-3xl font-bold mb-6">{formatCurrency(balance)}</div>
                <div className="flex gap-3">
                    <button className="flex-1 bg-white text-teal-900 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors shadow-lg">{t.withdraw}</button>
                    <button className="flex-1 bg-teal-700/50 py-3 rounded-xl font-bold text-sm hover:bg-teal-700/70 transition-colors">{t.history}</button>
                </div>
            </div>

            <div>
                <Input label={t.full_name_ka} value={doctor.displayName.ka} onChange={(e: any) => onUpdate({ displayName: { ...doctor.displayName, ka: e.target.value } })} />
                <Input label={t.full_name_en} value={doctor.displayName.en || ''} onChange={(e: any) => onUpdate({ displayName: { ...doctor.displayName, en: e.target.value } })} />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 ml-1">{t.specialties}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {doctor.specialties.map((s, i) => (
                        <div key={i} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                            {s}
                            <button onClick={() => {
                                const next = [...doctor.specialties];
                                next.splice(i, 1);
                                onUpdate({ specialties: next });
                            }}><RiCloseLine /></button>
                        </div>
                    ))}
                    {showSpecialtyInput ? (
                        <div className="flex items-center gap-1">
                            <input
                                autoFocus
                                value={newSpecialty}
                                onChange={e => setNewSpecialty(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') addSpecialty(); if (e.key === 'Escape') { setShowSpecialtyInput(false); setNewSpecialty(''); } }}
                                placeholder={t.specialties}
                                className="bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button onClick={addSpecialty} className="p-1 text-teal-600"><RiCheckLine size={18} /></button>
                            <button onClick={() => { setShowSpecialtyInput(false); setNewSpecialty(''); }} className="p-1 text-slate-400"><RiCloseLine size={18} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setShowSpecialtyInput(true)} className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors">
                            <RiAddLine /> {t.add_new}
                        </button>
                    )}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">{t.clinics}</label>
                    <button onClick={() => setNewClinic(true)} className="text-teal-600 text-xs font-bold uppercase flex items-center gap-1 bg-teal-50 px-2 py-1 rounded hover:bg-teal-100"><RiAddLine /> {t.add_new}</button>
                </div>

                {newClinic && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-slide-up">
                        <input className="w-full bg-white border p-3 rounded-xl mb-3 text-sm text-slate-900" placeholder={t.name} value={tempClinic.name} onChange={e => setTempClinic({...tempClinic, name: e.target.value})} />
                        <input className="w-full bg-white border p-3 rounded-xl mb-3 text-sm text-slate-900" placeholder={t.address} value={tempClinic.address} onChange={e => setTempClinic({...tempClinic, address: e.target.value})} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setNewClinic(false)} className="text-slate-500 text-xs font-bold px-3">{t.cancel}</button>
                            <button onClick={addClinic} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-xs font-bold">{t.save}</button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {doctor.clinics.map((c, i) => (
                        <div key={i} className="flex justify-between items-start bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                            <div>
                                <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{c.address}, {c.city}</div>
                            </div>
                            <button onClick={() => removeClinic(i)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><RiDeleteBinLine size={18} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SettingsEditor = ({ doctor, onUpdate }: { doctor: Doctor, onUpdate: (d: Partial<Doctor>) => void }) => {
    const { language, showToast } = useStore();
    const [showAssistantsModal, setShowAssistantsModal] = useState(false);
    const t = translations[language];

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(doctor.doctorId);
            showToast(t.copied_id);
        } catch {
            showToast(t.copied_id);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'MedLink',
            text: `${doctor.displayName[language] || doctor.displayName.ka} — ${doctor.specialties.join(', ')}`,
            url: `https://medlink.ge/doctor/${doctor.doctorId}`,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                showToast(t.copied_id);
            }
        } catch {
            // user cancelled share
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col items-center text-center shadow-lg">
                <RiQrCodeLine size={64} className="mb-4 text-teal-400" />
                <div className="font-mono text-2xl font-bold tracking-widest mb-2">{doctor.doctorId}</div>
                <p className="text-slate-400 text-sm mb-6">{t.ask_doctor_id}</p>
                <div className="flex gap-3 w-full">
                    <button onClick={handleCopyId} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-sm font-bold backdrop-blur-md transition-colors">{t.copy_id}</button>
                    <button onClick={handleShare} className="flex-1 bg-white text-slate-900 hover:bg-slate-100 py-3 rounded-xl text-sm font-bold shadow-lg transition-colors">{t.share_profile}</button>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900">{t.after_hours_paging}</h3>
                         <p className="text-xs text-slate-500 mt-1 max-w-[200px]">{t.after_hours_desc}</p>
                    </div>
                    <div
                        onClick={() => onUpdate({ afterHoursEnabled: !doctor.afterHoursEnabled })}
                        className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${doctor.afterHoursEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${doctor.afterHoursEnabled ? 'translate-x-6' : ''}`} />
                    </div>
                </div>

                {doctor.afterHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4 animate-slide-up mt-6 border-t border-slate-200 pt-6">
                        <Input
                            label={t.msg_price}
                            type="number"
                            value={doctor.afterHoursPricing.messageGEL}
                            onChange={(e: any) => onUpdate({ afterHoursPricing: { ...doctor.afterHoursPricing, messageGEL: parseInt(e.target.value) } })}
                        />
                         <Input
                            label={t.call_price}
                            type="number"
                            value={doctor.afterHoursPricing.callGEL}
                            onChange={(e: any) => onUpdate({ afterHoursPricing: { ...doctor.afterHoursPricing, callGEL: parseInt(e.target.value) } })}
                        />
                    </div>
                )}
            </div>

             <div>
                <h3 className="font-bold text-slate-900 mb-2 ml-1">{t.assistants}</h3>
                <div className="border border-slate-200 rounded-2xl p-6 text-center bg-white shadow-sm">
                     <p className="text-sm text-slate-500 mb-4">{doctor.assistants.length} {t.assistant_count}</p>
                     <Button variant="outline" fullWidth className="text-sm py-2" onClick={() => setShowAssistantsModal(true)}>{t.manage_assistants}</Button>
                </div>
             </div>

            <Modal isOpen={showAssistantsModal} onClose={() => setShowAssistantsModal(false)} title={t.manage_assistants}>
                {doctor.assistants.length === 0 ? (
                    <p className="text-center text-slate-400 py-6">{t.no_items_added}</p>
                ) : (
                    <div className="space-y-3">
                        {doctor.assistants.map((aUid, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                                    <RiUserLine size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-slate-800">{t.assistant} {i + 1}</p>
                                    <p className="text-xs text-slate-400">{aUid}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Button fullWidth onClick={() => setShowAssistantsModal(false)} variant="secondary" className="mt-4">{t.back}</Button>
            </Modal>
        </div>
    );
};

export const DoctorProfile = () => {
  const { currentUser, updateDoctorSettings, language } = useStore();
  const [tab, setTab] = useState<'profile' | 'schedule' | 'settings'>('profile');
  const t = translations[language];

  if (!currentUser || currentUser.role !== 'doctor') return null;

  const doctor = currentUser as Doctor;

  const handleUpdate = (data: Partial<Doctor>) => {
      updateDoctorSettings(doctor.uid, data);
  };

  const tabLabels: Record<string, string> = {
      profile: t.tab_profile,
      schedule: t.tab_schedule,
      settings: t.tab_settings,
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      <div className="px-6 pt-6 pb-2 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-6">
              <Avatar name={doctor.displayName.en} color={doctor.avatarColor} size="lg" />
              <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-slate-900 truncate">{doctor.displayName[language] || doctor.displayName.ka}</h1>
                  <p className="text-teal-600 font-medium text-sm truncate">{doctor.specialties.join(', ')}</p>
              </div>
          </div>

          <div className={`flex items-center justify-between p-4 rounded-xl mb-6 transition-colors border shadow-sm ${doctor.isManuallyBusy ? 'bg-amber-50 border-amber-200' : 'bg-teal-50 border-teal-200'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${doctor.isManuallyBusy ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}`}>
                    {doctor.isManuallyBusy ? <RiProhibitedLine size={20} /> : <RiTimeLine size={20} />}
                </div>
                <div>
                    <h3 className={`font-bold text-sm ${doctor.isManuallyBusy ? 'text-amber-900' : 'text-teal-900'}`}>
                        {doctor.isManuallyBusy ? t.status_busy : t.status_active}
                    </h3>
                    <p className={`text-[10px] ${doctor.isManuallyBusy ? 'text-amber-700' : 'text-teal-700'}`}>
                        {doctor.isManuallyBusy ? t.patients_see_away : t.based_on_schedule}
                    </p>
                </div>
            </div>
            <div
                onClick={() => handleUpdate({ isManuallyBusy: !doctor.isManuallyBusy })}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${doctor.isManuallyBusy ? 'bg-amber-500' : 'bg-slate-300'}`}
            >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${doctor.isManuallyBusy ? 'translate-x-5' : ''}`} />
            </div>
         </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['profile', 'schedule', 'settings'] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    onClick={() => setTab(tabKey)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === tabKey ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      {tabLabels[tabKey]}
                  </button>
              ))}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
          {tab === 'profile' && <ProfileEditor doctor={doctor} onUpdate={handleUpdate} />}
          {tab === 'schedule' && <ScheduleEditor doctor={doctor} onUpdate={handleUpdate} />}
          {tab === 'settings' && <SettingsEditor doctor={doctor} onUpdate={handleUpdate} />}
      </div>
    </div>
  );
};

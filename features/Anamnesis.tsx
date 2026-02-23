import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Button, Input, Avatar, Modal } from '../components/UI';
import { TopBar } from '../components/Layout';
import { RiEdit2Line, RiAddLine, RiCloseLine, RiDeleteBinLine, RiHistoryLine, RiArrowLeftLine } from 'react-icons/ri';
import { format, formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { translations, translateValue } from '../utils';

const SECTIONS = [
  'Demographics', 'Emergency', 'Allergies', 'Medications', 'Conditions', 'Surgeries', 'Habits', 'Notes'
];

const DynamicList = ({ items, onAdd, onRemove, renderItem, placeholder }: any) => {
    const [temp, setTemp] = useState('');
    const { language } = useStore();
    const t = translations[language];

    const handleAdd = () => {
        if (temp.trim()) {
            onAdd(temp);
            setTemp('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={placeholder}
                    value={temp}
                    onChange={e => setTemp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button onClick={handleAdd} className="bg-slate-900 text-white w-12 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                    <RiAddLine size={24} />
                </button>
            </div>
            {items && items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm animate-slide-up">
                            <span className="text-slate-800 font-medium">{renderItem ? renderItem(item) : item}</span>
                            <button onClick={() => onRemove(i)} className="text-red-400 p-2 hover:bg-red-50 rounded-full transition-colors"><RiDeleteBinLine /></button>
                        </div>
                    ))}
                </div>
            )}
            {(items || []).length === 0 && <div className="text-center text-slate-400 text-sm py-4 border-2 border-dashed border-slate-100 rounded-xl">{t.no_items_added}</div>}
        </div>
    );
};

export const AnamnesisWizard = () => {
  const navigate = useNavigate();
  const { updateAnamnesis, currentUser, language } = useStore();
  const [step, setStep] = useState(0);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const t = translations[language];

  if (!currentUser || currentUser.role !== 'patient') return null;

  const anamnesis = (currentUser as any).anamnesis;

  const update = (data: any) => updateAnamnesis(currentUser.uid, data);

  const handleNext = () => {
    if (step < SECTIONS.length - 1) setStep(step + 1);
    else navigate('/connect');
  };

  const getSectionTitle = (sec: string) => {
    const key = sec.toLowerCase();
    return t[key as keyof typeof t] || sec;
  }

  const handleAddMedication = () => {
    if (medName.trim()) {
      update({ medications: [...(anamnesis.medications || []), { name: medName, dose: medDose, frequency: medFreq }] });
      setMedName('');
      setMedDose('');
      setMedFreq('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      <div className="h-1.5 bg-slate-100 w-full">
         <div className="h-full bg-teal-500 transition-all duration-300 ease-out" style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}></div>
      </div>
      <TopBar
        title={getSectionTitle(SECTIONS[step])}
        left={<button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} className="text-slate-500 p-2"><RiArrowLeftLine size={24}/></button>}
      />

      <div className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 border-b border-slate-100">
        {SECTIONS.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-teal-500 scale-125' : i < step ? 'bg-teal-300' : 'bg-slate-200'}`} />
        ))}
        <span className="ml-2 text-xs text-slate-400 font-medium">{t.step_of} {step + 1} {SECTIONS.length}{t.of}</span>
      </div>

      <div className="flex-1 p-6 overflow-y-auto pb-24">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{getSectionTitle(SECTIONS[step])}</h2>
        <p className="text-slate-500 mb-8">{t.fill_accurately}</p>

        {step === 0 && (
          <div className="space-y-4 animate-slide-up">
             <Input label={t.dob} type="date" value={anamnesis.demographics.dob} onChange={(e: any) => update({ demographics: {...anamnesis.demographics, dob: e.target.value} })} />
             <Input label={t.sex} placeholder={t.sex_placeholder} value={anamnesis.demographics.sex} onChange={(e: any) => update({ demographics: {...anamnesis.demographics, sex: e.target.value} })} />
          </div>
        )}
        {step === 1 && (
           <div className="space-y-4 animate-slide-up">
             <Input label={t.blood_type} placeholder="A+" value={anamnesis.emergencyCard?.bloodType} onChange={(e: any) => update({ emergencyCard: {...anamnesis.emergencyCard, bloodType: e.target.value} })} />
             <Input label={t.emergency_contact} value={anamnesis.emergencyCard?.emergencyContactName} onChange={(e: any) => update({ emergencyCard: {...anamnesis.emergencyCard, emergencyContactName: e.target.value} })} />
             <Input label={t.emergency_phone} value={anamnesis.emergencyCard?.emergencyContactPhone} onChange={(e: any) => update({ emergencyCard: {...anamnesis.emergencyCard, emergencyContactPhone: e.target.value} })} />
           </div>
        )}
        {step === 2 && (
            <div className="animate-slide-up">
                <DynamicList
                    placeholder={t.add_allergy}
                    items={anamnesis.allergies || []}
                    onAdd={(item: string) => update({ allergies: [...(anamnesis.allergies || []), item] })}
                    onRemove={(i: number) => { const n = [...(anamnesis.allergies || [])]; n.splice(i, 1); update({ allergies: n }); }}
                />
            </div>
        )}
        {step === 3 && (
            <div className="space-y-4 animate-slide-up">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">{t.add_medication}</p>
                    <input
                        className="w-full mb-2 p-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white"
                        placeholder={t.name}
                        value={medName}
                        onChange={e => setMedName(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <input
                            className="flex-1 p-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white"
                            placeholder={t.dose}
                            value={medDose}
                            onChange={e => setMedDose(e.target.value)}
                        />
                        <input
                            className="flex-1 p-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white"
                            placeholder={t.freq}
                            value={medFreq}
                            onChange={e => setMedFreq(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddMedication}
                        className="mt-3 w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold shadow-lg"
                    >
                        {t.add_medication}
                    </button>
                 </div>

                 <div className="space-y-2">
                    {(anamnesis.medications || []).map((m: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                            <div>
                                <div className="font-bold text-sm text-slate-900">{m.name}</div>
                                <div className="text-xs text-slate-500">{m.dose} {m.dose && m.frequency ? '•' : ''} {m.frequency}</div>
                            </div>
                            <button onClick={() => { const n = [...anamnesis.medications]; n.splice(i, 1); update({ medications: n }); }} className="text-red-400 p-2 hover:bg-red-50 rounded-full"><RiDeleteBinLine /></button>
                        </div>
                    ))}
                 </div>
            </div>
        )}
        {step === 4 && (
             <div className="animate-slide-up">
                 <DynamicList
                    placeholder={t.add_condition}
                    items={anamnesis.chronicConditions || []}
                    onAdd={(item: string) => update({ chronicConditions: [...(anamnesis.chronicConditions || []), item] })}
                    onRemove={(i: number) => { const n = [...(anamnesis.chronicConditions || [])]; n.splice(i, 1); update({ chronicConditions: n }); }}
                />
             </div>
        )}
        {step === 5 && (
             <div className="animate-slide-up">
                 <DynamicList
                    placeholder={t.add_surgery}
                    items={(anamnesis.surgeries || []).map((s: any) => s.name)}
                    onAdd={(item: string) => update({ surgeries: [...(anamnesis.surgeries || []), { name: item, date: 'Unknown' }] })}
                    onRemove={(i: number) => { const n = [...(anamnesis.surgeries || [])]; n.splice(i, 1); update({ surgeries: n }); }}
                />
             </div>
        )}
        {step === 6 && (
            <div className="space-y-4 animate-slide-up">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.smoking}</label>
                    <select
                        className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                        value={anamnesis.smokingAlcohol.smoking}
                        onChange={(e) => update({ smokingAlcohol: { ...anamnesis.smokingAlcohol, smoking: e.target.value } })}
                    >
                        <option value="never">{t.never}</option>
                        <option value="former">{t.former}</option>
                        <option value="current">{t.current}</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.alcohol}</label>
                    <select
                        className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                        value={anamnesis.smokingAlcohol.alcohol}
                        onChange={(e) => update({ smokingAlcohol: { ...anamnesis.smokingAlcohol, alcohol: e.target.value } })}
                    >
                        <option value="never">{t.never}</option>
                        <option value="socially">{t.socially}</option>
                        <option value="frequently">{t.frequently}</option>
                    </select>
                </div>
            </div>
        )}
        {step === 7 && (
            <textarea
                className="w-full h-40 border rounded-xl p-4 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 animate-slide-up"
                placeholder={t.notes}
                value={anamnesis.freeNotes}
                onChange={(e) => update({ freeNotes: e.target.value })}
            ></textarea>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-md z-30">
         <button onClick={handleNext} className="text-slate-400 font-medium text-sm px-4">{t.skip}</button>
         <Button onClick={handleNext} className="px-8 shadow-xl">{step === SECTIONS.length - 1 ? t.finish : t.next_step}</Button>
      </div>
    </div>
  );
};

export const AnamnesisView = () => {
  const { currentUser, users, anamnesisHistory, language } = useStore();
  const { uid } = useParams();
  const navigate = useNavigate();
  const [historySection, setHistorySection] = useState<string | null>(null);
  const t = translations[language];

  const targetUser = uid ? users.find(u => u.uid === uid) : currentUser;
  const isReadOnly = uid && uid !== currentUser?.uid;
  const anamnesis = (targetUser as any)?.anamnesis;

  if (!anamnesis) return <div className="p-6 text-center text-slate-500">{t.none_recorded}</div>;

  const getSectionHistory = (sec: string) => {
      return anamnesisHistory.filter(h => h.patientUid === targetUser?.uid && h.section === sec);
  };

  const camelToSnake = (s: string) => s.replace(/([A-Z])/g, '_$1').toLowerCase();

  const keyMap: Record<string, string> = {
    bloodType: 'blood_type',
    emergencyContactName: 'emergency_contact',
    emergencyContactPhone: 'emergency_phone',
    emergencyCard: 'emergency',
    chronicConditions: 'conditions',
    smokingAlcohol: 'habits',
    freeNotes: 'notes',
    familyHistory: 'family_history',
    obgyn: 'obgyn',
    vaccines: 'vaccines',
    lastPeriod: 'last_period',
    pregnancies: 'pregnancies',
  };

  const getTranslatedKey = (key: string) => {
      const mapped = keyMap[key] || camelToSnake(key);
      return t[mapped as keyof typeof t] || t[key.toLowerCase() as keyof typeof t] || key;
  }

  const dateLocale = language === 'ka' ? { locale: ka } : {};
  const lastUpdated = (targetUser as any)?.anamnesisLastUpdatedAt;
  const lastUpdatedText = lastUpdated
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true, ...dateLocale })
    : t.today;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
       <div className={`bg-teal-600 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg mb-[-2rem] relative z-10 transition-colors ${isReadOnly ? 'bg-indigo-600' : ''}`}>
         <div className="flex justify-between items-start">
             {isReadOnly ? (
                 <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><RiCloseLine/></button>
                    <div>
                        <h1 className="text-xl font-bold">{targetUser?.displayName?.[language] || targetUser?.displayName?.ka || t.patient}</h1>
                        <p className="opacity-80 text-sm">{targetUser?.phone}</p>
                    </div>
                 </div>
             ) : (
                <h1 className="text-2xl font-bold">{t.my_anamnesis}</h1>
             )}

             {!isReadOnly && (
                <button onClick={() => navigate('/anamnesis-wizard')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-sm"><RiEdit2Line /></button>
             )}
         </div>
         {!isReadOnly && <p className="opacity-80 text-sm mt-1">{t.last_updated}: {lastUpdatedText}</p>}
       </div>

       <div className="flex-1 overflow-y-auto px-4 pb-24 pt-12 space-y-3">
         {Object.entries(anamnesis).map(([key, val]: any) => {
           // R3 — Hide obgyn section if enabled===false
           if (key === 'obgyn' && val && val.enabled === false) return null;

           // Y9 — Hide empty string values at top level
           if (val === '' || val === null || val === undefined) return null;

           return (
           <div key={key} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative">
             <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold text-slate-800 capitalize text-sm">{getTranslatedKey(key)}</h3>
               <button onClick={() => setHistorySection(key)} className="text-slate-300 hover:text-teal-500"><RiHistoryLine /></button>
             </div>
             <div className="text-sm text-slate-600">
               {Array.isArray(val) ? (
                 val.length ? val.map((v: any, i: number) => (
                   <div key={i} className="mb-1 pb-1 border-b border-slate-50 last:border-0 last:pb-0 last:mb-0">
                     {typeof v === 'string' ? translateValue(v, language) : (
                         <div className="flex justify-between">
                             <span className="font-medium">{translateValue(v.name, language)}</span>
                             {v.dose && <span className="text-slate-400 text-xs">{v.dose}</span>}
                             {v.frequency && <span className="text-slate-400 text-xs">{translateValue(v.frequency, language)}</span>}
                             {v.date && <span className="text-slate-400 text-xs">{v.date}</span>}
                         </div>
                     )}
                   </div>
                 )) : <span className="text-slate-400 italic">{t.none_recorded}</span>
               ) : (
                 typeof val === 'object' && val !== null ?
                 <div className="space-y-2">
                     {Object.entries(key === 'obgyn' && val.data ? val.data : val).map(([k, v]: any) => {
                         // R3 — Skip boolean/enabled fields and nested objects
                         if (typeof v === 'boolean' || typeof v === 'object' || k === 'enabled' || k === 'data') return null;
                         // Y9 — Skip empty values
                         if (v === '' || v === null || v === undefined) return null;
                         return (
                            <div key={k} className="flex justify-between items-baseline gap-2">
                                <span className="text-xs text-slate-400 uppercase shrink-0">{getTranslatedKey(k)}</span>
                                <span className="font-medium text-right truncate">{translateValue(v?.toString(), language)}</span>
                            </div>
                         );
                     })}
                 </div>
                 : typeof val === 'string' ? translateValue(val, language) : val?.toString()
               )}
             </div>
           </div>
           );
         })}
       </div>

       <Modal isOpen={!!historySection} onClose={() => setHistorySection(null)} title={t.edit_history}>
           <div className="max-h-60 overflow-y-auto">
               {historySection && getSectionHistory(historySection).length === 0 ? (
                   <p className="text-center text-slate-400 py-4">{t.none_recorded}</p>
               ) : (
                   historySection && getSectionHistory(historySection).map((h, i) => (
                       <div key={i} className="mb-3 pb-3 border-b border-slate-100 last:border-0">
                           <p className="text-sm font-bold text-slate-800">{h.changeDescription}</p>
                           <div className="flex justify-between text-xs text-slate-500 mt-1">
                               <span>{h.editedByRole}</span>
                               <span>{format(new Date(h.createdAt), 'HH:mm')}</span>
                           </div>
                       </div>
                   ))
               )}
           </div>
           <Button fullWidth onClick={() => setHistorySection(null)} variant="secondary" className="mt-4">{t.back}</Button>
       </Modal>
    </div>
  );
};

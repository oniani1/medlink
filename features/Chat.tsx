import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  RiSendPlaneFill, RiAttachment2, RiMicFill, RiPhoneFill, RiMore2Fill,
  RiMoonClearLine, RiFileTextFill, RiCloseLine, RiTimeLine, RiPriceTag3Line,
  RiDownloadLine, RiReplyLine, RiCheckDoubleLine, RiShareForwardLine,
  RiMicOffLine, RiVolumeUpLine, RiUser3Line, RiAddLine, RiArrowLeftLine,
  RiCapsuleFill, RiMentalHealthFill, RiStickyNoteFill, RiCalendarEventFill,
  RiImageLine, RiPlayFill, RiPauseFill, RiStopFill
} from 'react-icons/ri';
import { format, isSameDay } from 'date-fns';
import { useStore } from '../store';
import { translations, isAfterHours, formatCurrency } from '../utils';
import { Avatar, Modal, Button, Input } from '../components/UI';
import { TopBar } from '../components/Layout';

const TimelineView = ({ patientId, doctorUid, onClose }: { patientId: string, doctorUid: string, onClose: () => void }) => {
    const { anamnesisHistory, messages, timelineEvents, addTimelineEvent, currentUser, language } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ type: 'note', title: '', description: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
    const t = translations[language];

    const files = messages.filter(m => (m.type === 'file' || m.type === 'image') && (m.senderUid === patientId || m.senderUid === doctorUid));

    const events = [
        ...anamnesisHistory.filter(h => h.patientUid === patientId).map(h => ({ source: 'anamnesis', date: h.createdAt, data: h })),
        ...files.map(f => ({ source: 'file', date: f.createdAt, data: f })),
        ...timelineEvents.filter(e => e.patientUid === patientId).map(e => ({ source: 'manual', date: e.date, data: e }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAdd = () => {
        if(!newEvent.title) return;
        addTimelineEvent({
            patientUid: patientId,
            creatorUid: currentUser!.uid,
            creatorRole: currentUser!.role as any,
            type: newEvent.type as any,
            title: newEvent.title,
            description: newEvent.description,
            date: newEvent.date || new Date().toISOString()
        });
        setShowAddModal(false);
        setNewEvent({ type: 'note', title: '', description: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'medication': return <RiCapsuleFill className="text-white"/>;
            case 'symptom': return <RiMentalHealthFill className="text-white"/>;
            case 'appointment': return <RiCalendarEventFill className="text-white"/>;
            default: return <RiStickyNoteFill className="text-white"/>;
        }
    };

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'medication': return 'bg-pink-500';
            case 'symptom': return 'bg-orange-500';
            case 'appointment': return 'bg-blue-500';
            default: return 'bg-indigo-500';
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-slide-up">
            <TopBar
                title={t.timeline}
                left={
                    <button onClick={onClose} className="flex items-center gap-1 text-slate-500">
                        <RiArrowLeftLine size={24}/> <span className="text-sm font-medium">{t.back}</span>
                    </button>
                }
            />
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative pb-24">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                {events.length === 0 ? <p className="text-center text-slate-400 mt-10 ml-6">{t.none_recorded}</p> : events.map((e, i) => (
                    <div key={i} className="flex gap-4 mb-6 relative z-10">
                        <div className={`w-8 h-8 rounded-full border-4 border-slate-50 shadow-sm shrink-0 flex items-center justify-center -ml-3.5
                            ${e.source === 'anamnesis' ? 'bg-amber-400' : e.source === 'file' ? 'bg-teal-500' : getTypeColor((e.data as any).type)}`}>
                                {e.source === 'manual' && getTypeIcon((e.data as any).type)}
                        </div>
                        <div className="flex-1">
                            <span className="text-xs text-slate-400 font-medium">{format(new Date(e.date), 'MMM d, HH:mm')}</span>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm mt-1">
                                {e.source === 'anamnesis' && (
                                    <>
                                        <p className="font-bold text-sm text-slate-800">{(e.data as any).changeDescription}</p>
                                        <p className="text-xs text-slate-500 capitalize">{t.assistant}: {(e.data as any).editedByRole}</p>
                                    </>
                                )}
                                {e.source === 'file' && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center"><RiFileTextFill /></div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{(e.data as any).content || t.file}</p>
                                            <p className="text-xs text-slate-500">{(e.data as any).type === 'image' ? t.image : t.document}</p>
                                        </div>
                                    </div>
                                )}
                                {e.source === 'manual' && (
                                    <>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase px-1.5 rounded text-white ${getTypeColor((e.data as any).type)}`}>{t[(e.data as any).type as keyof typeof t] || (e.data as any).type}</span>
                                            <span className="text-xs text-slate-400">{(e.data as any).creatorRole}</span>
                                        </div>
                                        <p className="font-bold text-sm text-slate-800">{(e.data as any).title}</p>
                                        {(e.data as any).description && <p className="text-sm text-slate-600 mt-1">{(e.data as any).description}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowAddModal(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-teal-700 active:scale-95 transition-all z-20"
            >
                <RiAddLine size={28} />
            </button>

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t.add_event}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{t.event_type}</label>
                        <div className="flex gap-2">
                            {['symptom', 'medication', 'note', 'appointment'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNewEvent({...newEvent, type})}
                                    className={`p-2 rounded-lg text-xs font-bold uppercase transition-colors flex-1 ${newEvent.type === type ? getTypeColor(type) + ' text-white' : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {t[type as keyof typeof t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input label={t.title} value={newEvent.title} onChange={(e: any) => setNewEvent({...newEvent, title: e.target.value})} placeholder="" />

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t.date_time}</label>
                        <input
                            type="datetime-local"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={newEvent.date}
                            onChange={(e: any) => setNewEvent({...newEvent, date: e.target.value})}
                        />
                    </div>

                    <textarea
                        className="w-full h-24 border rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm text-slate-900"
                        placeholder={t.description}
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    ></textarea>

                    <Button fullWidth onClick={handleAdd}>{t.save}</Button>
                </div>
            </Modal>
        </div>
    );
};

export const ExportPreview = ({ conversation, onClose }: { conversation: any, onClose: () => void }) => {
    const { messages, users, language } = useStore();
    const msgs = messages.filter(m => m.conversationId === conversation.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const doc = users.find(u => u.uid === conversation.doctorUid);
    const pat = users.find(u => u.uid === conversation.patientUid);
    const t = translations[language];

    return (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-slide-up">
            <TopBar title={t.export_chat} left={<button onClick={onClose}><RiCloseLine size={24}/></button>} right={<button className="text-teal-600"><RiShareForwardLine size={24} /></button>} />
            <div className="flex-1 overflow-y-auto p-8 font-mono text-xs text-slate-800 bg-white pb-24">
                <div className="text-center border-b border-slate-200 pb-4 mb-6">
                    <h1 className="text-lg font-bold mb-2">{t.medlink_transcript}</h1>
                    <p>{t.doctor}: {doc?.displayName[language] || doc?.displayName.ka}</p>
                    <p>{t.patient}: {pat?.displayName[language] || pat?.displayName.ka}</p>
                    <p>{format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
                <div className="space-y-4">
                    {msgs.map(m => (
                        <div key={m.id}>
                            <div className="flex gap-2 text-slate-400 mb-1">
                                <span>[{format(new Date(m.createdAt), 'HH:mm')}]</span>
                                <span className="font-bold text-slate-600 uppercase">{m.senderRole}:</span>
                            </div>
                            <p className="pl-14">{m.content} {m.attachment ? `[${t.file}: ${m.attachment.name}]` : ''}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center text-slate-400 pt-4 border-t border-slate-200">
                    {t.end_of_transcript}
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
                <Button fullWidth onClick={() => { alert(t.pdf_saved); onClose(); }}><RiDownloadLine /> PDF</Button>
            </div>
        </div>
    );
};

// Memoized waveform bars so they don't re-randomize on every render
const VoiceWaveform = React.memo(({ duration }: { duration?: string }) => {
    const bars = useMemo(() => Array.from({ length: 16 }, () => 20 + Math.random() * 80), []);
    const [playing, setPlaying] = useState(false);

    return (
        <div className="flex items-center gap-2 min-w-[140px]">
            <button
                onClick={() => setPlaying(!playing)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
            >
                {playing ? <RiPauseFill size={14} /> : <RiPlayFill size={14} className="ml-0.5" />}
            </button>
            <div className="h-6 flex-1 flex items-end gap-[2px] opacity-70">
               {bars.map((h, i) => <div key={i} className="w-1 bg-current rounded-full transition-all" style={{height: `${h}%`}}></div>)}
            </div>
            <span className="text-xs shrink-0">{duration || '0:14'}</span>
        </div>
    );
});

export const CallScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useStore();
  const t = translations[language];
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  const partnerName = (location.state as any)?.partnerName || t.doctor;

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-slate-900 text-white flex flex-col items-center justify-between py-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
         <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-teal-500/20">
            <RiUser3Line size={64} className="text-slate-400" />
         </div>
         <h2 className="text-2xl font-bold mb-2">{partnerName}</h2>
         <p className="text-teal-400 font-mono text-xl tracking-widest">{formatTime(duration)}</p>
         <p className="text-slate-500 text-sm mt-2">{t.secure_call}</p>
      </div>

      <div className="flex gap-6 items-center mb-12">
       <button
         onClick={() => setMuted(!muted)}
         className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
       >
         <RiMicOffLine size={24} />
       </button>
        <button
          onClick={() => setSpeaker(!speaker)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${speaker ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
         <RiVolumeUpLine size={24} />
       </button>
       <button
         onClick={() => navigate(-1)}
         className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transform active:scale-95 transition-all"
       >
         <RiPhoneFill size={32} className="rotate-[135deg]" />
       </button>
     </div>
   </div>
 );
};

// Extracted PaymentModal to avoid remounting on every ChatScreen render
const PaymentModal = ({ isOpen, onClose, doctor, onPay, language }: {
    isOpen: boolean;
    onClose: () => void;
    doctor: any;
    onPay: (amount: number, type: 'msg' | 'call') => void;
    language: 'ka' | 'en';
}) => {
    const [processing, setProcessing] = useState(false);
    const t = translations[language];

    const msgPrice = doctor?.afterHoursPricing?.messageGEL || 5;
    const callPrice = doctor?.afterHoursPricing?.callGEL || 20;

    const pay = (amount: number, type: 'msg' | 'call') => {
      setProcessing(true);
      setTimeout(() => {
        onPay(amount, type);
        setProcessing(false);
      }, 1500);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t.urgent_response}>
        <p className="text-slate-500 mb-6 text-sm">{t.doc_away_msg}</p>
        <div className="space-y-3">
          <button
             onClick={() => pay(msgPrice, 'msg')}
             className="w-full p-4 border rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors"
             disabled={processing}
          >
             <span className="font-medium">{t.urgent_msg}</span>
             <span className="font-bold text-teal-600">{formatCurrency(msgPrice)}</span>
          </button>
           <button
             onClick={() => pay(callPrice, 'call')}
             className="w-full p-4 border rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors"
             disabled={processing}
          >
             <span className="font-medium">{t.urgent_call}</span>
             <span className="font-bold text-teal-600">{formatCurrency(callPrice)}</span>
          </button>
        </div>
        {processing && <div className="text-center mt-4 text-sm text-teal-600 animate-pulse">{t.processing_payment}</div>}
      </Modal>
    );
};

export const ChatScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, conversations, messages, users, sendMessage, markRead, language, toggleTag, setReminder, purchaseExport } = useStore();
  const [text, setText] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const t = translations[language];

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c.id === id);
  if (!conversation || !currentUser) return null;

  const partnerUid = currentUser.role === 'patient' ? conversation.doctorUid : conversation.patientUid;
  const partner = users.find(u => u.uid === partnerUid);
  const doctor = users.find(u => u.uid === conversation.doctorUid) as any;

  // Use conversation.patientUid for timeline, not partnerUid
  const timelinePatientId = conversation.patientUid;

  const convMessages = messages.filter(m => m.conversationId === id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const isDoctorAfterHours = doctor ? isAfterHours(doctor) : false;
  const isPatient = currentUser.role === 'patient';
  const showBanner = isPatient && isDoctorAfterHours && !conversation.isBlocked;

  const partnerDisplayName = partner?.displayName[language] || partner?.displayName?.ka || partner?.displayName?.en || 'U';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    markRead(conversation.id, currentUser.role);
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, id]);

  const handleSend = (type = 'text', content = text, extra = {}) => {
    if (!content.trim() && type === 'text') return;
    sendMessage({
      conversationId: conversation.id,
      senderUid: currentUser.uid,
      senderRole: currentUser.role,
      type: type as any,
      content,
      replyToMessageId: replyTo?.id,
      ...extra
    });
    setText('');
    setReplyTo(null);
    setShowAttach(false);
    setShowPay(false);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handlePayment = (amount: number, type: 'msg' | 'call') => {
    handleSend(type === 'msg' ? 'text' : 'call_log', type === 'msg' ? text : 'Call started', {
      afterHoursPaid: true,
      afterHoursAmount: amount
    });
    if (type === 'call') navigate('/call-active', { state: { partnerName: partnerDisplayName } });
  };

  const handleExport = () => {
      setShowMenu(false);
      if (conversation.exportPurchased) {
          setShowExport(true);
      } else {
          setShowExportConfirm(true);
      }
  };

  const confirmExport = () => {
      purchaseExport(conversation.id);
      setShowExportConfirm(false);
      setShowExport(true);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      const durations = ['0:03', '0:07', '0:12', '0:18', '0:24', '0:31'];
      const randomDuration = durations[Math.floor(Math.random() * durations.length)];
      handleSend('voice', `Voice message (${randomDuration})`);
    } else {
      setIsRecording(true);
    }
  };

  const handleSendFile = () => {
    handleSend('file', 'Lab_Results_2024.pdf', {
      attachment: { name: 'Lab_Results_2024.pdf', size: '2.4 MB', type: 'application/pdf' }
    });
  };

  const handleSendImage = () => {
    handleSend('image', 'Medical scan', {
      attachment: { name: 'scan_001.jpg', size: '1.8 MB', type: 'image/jpeg' }
    });
  };

  // Generate date separators
  const renderMessages = () => {
    const elements: React.ReactNode[] = [];
    let lastDate: Date | null = null;

    convMessages.forEach((msg, i) => {
      const msgDate = new Date(msg.createdAt);

      // Insert date separator if different day
      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        const isToday = isSameDay(msgDate, new Date());
        const isYesterday = isSameDay(msgDate, new Date(Date.now() - 86400000));
        const dateLabel = isToday ? t.today : isYesterday ? t.yesterday : format(msgDate, 'MMM d, yyyy');

        elements.push(
          <div key={`date-${msg.id}`} className="flex justify-center my-4">
            <span className="bg-white text-slate-500 text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-slate-100">{dateLabel}</span>
          </div>
        );
        lastDate = msgDate;
      }

      const isMe = msg.senderUid === currentUser.uid;
      const showAvatar = !isMe && (i === 0 || convMessages[i - 1].senderUid !== msg.senderUid);
      const replyMsg = msg.replyToMessageId ? convMessages.find(m => m.id === msg.replyToMessageId) : null;

      if (msg.type === 'system') {
        elements.push(
          <div key={msg.id} className="flex justify-center my-4">
            <span className="bg-slate-100 text-slate-500 text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full">{msg.content}</span>
          </div>
        );
        return;
      }

      elements.push(
        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
          {showAvatar && !isMe && (
             <div className="mr-2 mt-auto">
               <Avatar name={partner?.displayName?.en || 'U'} color={partner?.avatarColor} size="sm" />
             </div>
          )}
          <div
             className={`max-w-[80%] p-3.5 rounded-2xl text-sm relative group shadow-sm ${isMe ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}
             onContextMenu={(e) => { e.preventDefault(); setReplyTo(msg); }}
          >
            {replyMsg && (
                <div className={`text-xs mb-2 p-2 rounded-lg border-l-2 ${isMe ? 'bg-white/10 border-white' : 'bg-slate-100 border-teal-500'}`}>
                    <p className="font-bold opacity-80">{replyMsg.senderRole}</p>
                    <p className="truncate opacity-70">{replyMsg.content}</p>
                </div>
            )}

            {msg.afterHoursPaid && (
              <div className="flex items-center gap-1 mb-1 opacity-80 text-[10px] font-bold uppercase tracking-wider border-b border-white/20 pb-1">
                <span>{t.urgent_badge} {msg.afterHoursAmount} GEL</span>
              </div>
            )}
            {msg.silent && (
               <div className="flex items-center gap-1 mb-1 opacity-80 text-[10px] font-bold uppercase tracking-wider border-b border-white/20 pb-1">
                <RiMoonClearLine /> <span>{t.silent_badge}</span>
              </div>
            )}

            {msg.type === 'voice' && <VoiceWaveform />}

            {msg.type === 'file' && (
              <div className="flex items-center gap-3 min-w-[160px]">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-teal-50 text-teal-600'}`}>
                  <RiFileTextFill size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{msg.attachment?.name || msg.content}</p>
                  <p className="text-[10px] opacity-70">{msg.attachment?.size || '2.4 MB'}</p>
                </div>
              </div>
            )}

            {msg.type === 'image' && (
              <div className="min-w-[160px]">
                <div className={`w-full h-32 rounded-lg mb-1 flex items-center justify-center ${isMe ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <RiImageLine size={32} className="opacity-40" />
                </div>
                <p className="text-[10px] opacity-70">{msg.attachment?.name || msg.content}</p>
              </div>
            )}

            {msg.type === 'text' && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

            <div className="flex items-center justify-end gap-1 mt-1 opacity-80">
                <p className="text-[10px]">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                </p>
                {isMe && <RiCheckDoubleLine className="text-[10px]" />}
            </div>

            <button
                onClick={() => setReplyTo(msg)}
                className="absolute -right-2 -top-2 p-1.5 bg-slate-200 text-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Reply"
            >
                <RiReplyLine size={14}/>
            </button>
          </div>
        </div>
      );
    });

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 h-full relative">
      <TopBar
        left={<button onClick={() => navigate('/inbox')} className="p-2 text-slate-500"><RiArrowLeftLine size={24}/></button>}
        title={
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => currentUser.role === 'doctor' && partner?.role === 'patient' && navigate(`/patient-history/${partner.uid}`)}>
            <Avatar name={partner?.displayName.en || 'U'} color={partner?.avatarColor} size="sm" />
            <div className="flex flex-col items-start">
                 <span className="text-sm font-bold text-slate-800 truncate max-w-[160px]">{partnerDisplayName}</span>
                 {currentUser.role === 'doctor' && partner?.role === 'patient' && (
                     <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 rounded">{t.view_history}</span>
                 )}
            </div>
          </div>
        }
        right={
          <div className="flex gap-2 text-teal-600 relative" ref={menuRef}>
             <button onClick={() => isPatient && isDoctorAfterHours ? setShowPay(true) : navigate('/call-active', { state: { partnerName: partnerDisplayName } })} className="p-2"><RiPhoneFill size={20} /></button>
             <button onClick={() => setShowMenu(!showMenu)} className="p-2"><RiMore2Fill size={20} /></button>
             {showMenu && (
                 <div className="absolute top-12 right-0 bg-white shadow-xl rounded-xl w-48 py-2 z-30 border border-slate-100 animate-slide-up">
                     <button onClick={() => { setShowMenu(false); setShowTimeline(true); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex items-center gap-2"><RiTimeLine /> {t.timeline}</button>
                     {!isPatient && <button onClick={() => { setShowMenu(false); setShowTagsModal(true); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex items-center gap-2"><RiPriceTag3Line /> {t.manage_tags}</button>}
                     {!isPatient && <button onClick={() => { setShowMenu(false); setShowReminderModal(true); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex items-center gap-2"><RiTimeLine /> {t.set_reminder}</button>}
                     <button onClick={handleExport} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm flex items-center gap-2 text-slate-900 font-medium"><RiDownloadLine /> {t.export_chat}</button>
                 </div>
             )}
          </div>
        }
      />

      {showBanner && (
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-start gap-2 z-10">
           <RiMoonClearLine className="text-amber-500 mt-1 shrink-0" />
           <div className="flex-1">
             <p className="text-xs text-amber-800 leading-tight mb-2">
               {t.outside_hours_banner}
             </p>
             <div className="flex gap-2">
               <button onClick={() => handleSend('text', text, { silent: true })} disabled={!text.trim()} className={`text-[10px] bg-white border border-amber-200 px-2 py-1 rounded shadow-sm text-amber-700 font-medium uppercase ${!text.trim() ? 'opacity-50' : ''}`}>
                 {t.send_silent}
               </button>
               <button onClick={() => setShowPay(true)} className="text-[10px] bg-amber-500 text-white px-2 py-1 rounded shadow-sm font-medium uppercase">
                 {t.pay_urgent}
               </button>
             </div>
           </div>
        </div>
      )}

      {conversation.isBlocked && (
         <div className="bg-red-500 text-white text-center py-2 text-xs font-bold uppercase tracking-wide">
           {t.chat_blocked}
         </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {renderMessages()}
        <div ref={scrollRef} />
      </div>

      {!conversation.isBlocked && (
        <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2 shrink-0 relative z-20">
          {replyTo && (
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border-l-4 border-teal-500 animate-slide-up">
                  <div className="text-xs">
                      <p className="font-bold text-teal-700">{t.replying_to} {replyTo.senderRole}</p>
                      <p className="text-slate-500 truncate max-w-[250px]">{replyTo.content}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="p-1"><RiCloseLine/></button>
              </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-3 bg-red-50 p-2 rounded-lg border border-red-100 animate-slide-up">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700 font-medium flex-1">{t.recording}</span>
              <button onClick={() => setIsRecording(false)} className="p-1 text-red-400"><RiCloseLine size={18}/></button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button onClick={() => setShowAttach(!showAttach)} className="p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors">
                <RiAttachment2 size={24} />
            </button>
            <div className="flex-1 bg-slate-100 rounded-2xl flex items-center border border-transparent focus-within:border-teal-500 focus-within:bg-white transition-all">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    placeholder={t.type_message}
                    className="w-full bg-transparent border-none focus:ring-0 p-3 max-h-32 text-sm text-slate-900 resize-none overflow-y-auto"
                    rows={1}
                />
            </div>
            {text ? (
                <button onClick={() => handleSend()} className="p-3 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-600/30 transform active:scale-95 transition-all">
                <RiSendPlaneFill size={20} />
                </button>
            ) : (
                <button
                  onClick={handleVoiceRecord}
                  className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-50 text-teal-600'}`}
                >
                  {isRecording ? <RiStopFill size={20} /> : <RiMicFill size={20} />}
                </button>
            )}
          </div>
        </div>
      )}

      {showAttach && (
         <div className="absolute bottom-20 left-4 bg-white rounded-xl shadow-xl border border-slate-100 p-2 flex flex-col gap-1 w-40 z-20 animate-slide-up">
           <button onClick={() => { handleSendFile(); setShowAttach(false); }} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-sm text-slate-700">
             <RiFileTextFill className="text-teal-500"/> {t.document}
           </button>
           <button onClick={() => { handleSendImage(); setShowAttach(false); }} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-sm text-slate-700">
             <RiImageLine className="text-purple-500"/> {t.gallery}
           </button>
         </div>
      )}

      <PaymentModal
        isOpen={showPay}
        onClose={() => setShowPay(false)}
        doctor={doctor}
        onPay={handlePayment}
        language={language}
      />

      {showTimeline && <TimelineView patientId={timelinePatientId} doctorUid={conversation.doctorUid} onClose={() => setShowTimeline(false)} />}
      {showExport && <ExportPreview conversation={conversation} onClose={() => setShowExport(false)} />}

      {/* Export confirmation modal - replaces window.confirm */}
      <Modal isOpen={showExportConfirm} onClose={() => setShowExportConfirm(false)} title={t.export_confirm_title}>
          <p className="text-slate-500 mb-6 text-sm">{t.export_confirm}</p>
          <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowExportConfirm(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={confirmExport}>{t.export_confirm_yes}</Button>
          </div>
      </Modal>

      {!isPatient && <Modal isOpen={showTagsModal} onClose={() => setShowTagsModal(false)} title={t.manage_tags}>
          <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: 'Urgent', label: t.tag_urgent },
                { key: 'Follow-up', label: t.tag_followup },
                { key: 'Chronic', label: t.tag_chronic },
                { key: 'Lab Results', label: t.tag_lab },
                { key: 'New Patient', label: t.tag_new }
              ].map(tag => (
                  <button
                    key={tag.key}
                    onClick={() => toggleTag(conversation.id, tag.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${conversation.tags.includes(tag.key) ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                      {tag.label}
                  </button>
              ))}
          </div>
          <Button fullWidth onClick={() => setShowTagsModal(false)}>{t.save}</Button>
      </Modal>}

      {!isPatient && <Modal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} title={t.set_reminder}>
          <Input type="datetime-local" label={t.date_time} value={reminderDate} onChange={(e:any) => setReminderDate(e.target.value)} />
          <Button fullWidth onClick={() => { setReminder(conversation.id, reminderDate); setShowReminderModal(false); }}>{t.save}</Button>
      </Modal>}
    </div>
  );
};

import { create } from 'zustand';
import { User, Conversation, Message, Connection, Doctor, Patient, Payment, AnamnesisEdit, TimelineEvent } from './types';
import { seedMockData } from './data/mockData';
import { generateId } from './utils';

seedMockData();

const load = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

interface AppState {
  currentUser: User | null;
  users: User[];
  conversations: Conversation[];
  messages: Message[];
  connections: Connection[];
  payments: Payment[];
  language: 'ka' | 'en';
  anamnesisHistory: AnamnesisEdit[];
  timelineEvents: TimelineEvent[];
  toastMessage: string | null;

  setCurrentUser: (uid: string) => void;
  setLanguage: (lang: 'ka' | 'en') => void;
  logout: () => void;
  deleteAccount: () => void;
  showToast: (msg: string) => void;

  // Actions
  sendMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => void;
  createConnectionRequest: (doctorUid: string, patientUid: string) => void;
  updateConnectionStatus: (id: string, status: Connection['status']) => void;
  updateDoctorSettings: (uid: string, data: Partial<Doctor>) => void;
  updateAnamnesis: (uid: string, data: Partial<Patient['anamnesis']>) => void;
  markRead: (conversationId: string, role: string) => void;
  createConversation: (user1Id: string, user2Id: string) => string;

  // New Actions
  toggleTag: (conversationId: string, tag: string) => void;
  setReminder: (conversationId: string, date: string) => void;
  addDoctorException: (doctorUid: string, exception: { start: string, end: string, label: string }) => void;
  purchaseExport: (conversationId: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: load('medlink_users'),
  conversations: load('medlink_conversations'),
  messages: load('medlink_messages'),
  connections: load('medlink_connections'),
  payments: load('medlink_payments'),
  anamnesisHistory: [],
  timelineEvents: load('medlink_timeline_events'),
  language: (localStorage.getItem('medlink_lang') as any) || 'ka',
  toastMessage: null,

  setCurrentUser: (uid) => {
    const user = get().users.find(u => u.uid === uid) || null;
    set({ currentUser: user });
  },

  setLanguage: (lang) => {
    localStorage.setItem('medlink_lang', lang);
    set({ language: lang });
  },

  logout: () => {
    set({ currentUser: null });
  },

  deleteAccount: () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('medlink_'));
    keys.forEach(k => localStorage.removeItem(k));
    set({
      currentUser: null,
      users: [],
      conversations: [],
      messages: [],
      connections: [],
      payments: [],
      anamnesisHistory: [],
      timelineEvents: [],
    });
  },

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 2500);
  },

  sendMessage: (msgData) => {
    const newMsg: Message = {
      ...msgData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const msgs = [...get().messages, newMsg];

    const convs = get().conversations.map(c => {
      if (c.id === msgData.conversationId) {
        const isSenderDoctor = msgData.senderRole === 'doctor' || msgData.senderRole === 'assistant';
        return {
          ...c,
          lastMessageAt: newMsg.createdAt,
          lastMessagePreview: newMsg.content.substring(0, 50),
          unreadCounts: {
            doctor: isSenderDoctor ? c.unreadCounts.doctor : c.unreadCounts.doctor + 1,
            patient: !isSenderDoctor ? c.unreadCounts.patient : c.unreadCounts.patient + 1,
          }
        };
      }
      return c;
    });

    save('medlink_messages', msgs);
    save('medlink_conversations', convs);
    set({ messages: msgs, conversations: convs });
  },

  createConnectionRequest: (doctorUid, patientUid) => {
    const newConn: Connection = {
      id: generateId(),
      doctorUid,
      patientUid,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const nextConns = [...get().connections, newConn];
    save('medlink_connections', nextConns);
    set({ connections: nextConns });
  },

  updateConnectionStatus: (id, status) => {
    const nextConns = get().connections.map(c => {
        if (c.id === id) {
            if (status === 'accepted' && !c.conversationId) {
                const newConv: Conversation = {
                    id: generateId(),
                    doctorUid: c.doctorUid,
                    patientUid: c.patientUid,
                    lastMessageAt: new Date().toISOString(),
                    lastMessagePreview: 'System: Connection accepted',
                    unreadCounts: { doctor: 0, patient: 0 },
                    isBlocked: false,
                    isStarred: false,
                    tags: [],
                };
                const nextConvs = [...get().conversations, newConv];
                save('medlink_conversations', nextConvs);
                set({ conversations: nextConvs });
                return { ...c, status, approvedAt: new Date().toISOString(), conversationId: newConv.id };
            }
            return { ...c, status };
        }
        return c;
    });
    save('medlink_connections', nextConns);
    set({ connections: nextConns });
  },

  updateDoctorSettings: (uid, data) => {
    const nextUsers = get().users.map(u => u.uid === uid ? { ...u, ...data } : u);
    save('medlink_users', nextUsers);
    set({ users: nextUsers, currentUser: nextUsers.find(u => u.uid === uid) || null });
  },

  updateAnamnesis: (uid, data) => {
      const currentUser = get().currentUser;
      const historyEntry: AnamnesisEdit = {
          id: generateId(),
          patientUid: uid,
          editedByUid: currentUser?.uid || 'unknown',
          editedByRole: (currentUser?.role as any) || 'patient',
          section: Object.keys(data)[0],
          changeDescription: `Updated ${Object.keys(data)[0]}`,
          createdAt: new Date().toISOString()
      };

      const nextUsers = get().users.map(u => {
          if (u.uid === uid) {
              return { ...u, anamnesis: { ...((u as Patient).anamnesis), ...data }, anamnesisLastUpdatedAt: new Date().toISOString() };
          }
          return u;
      });
      save('medlink_users', nextUsers);
      set({ users: nextUsers, anamnesisHistory: [historyEntry, ...get().anamnesisHistory] });
  },

  markRead: (convId, role) => {
      const nextConvs = get().conversations.map(c => {
          if (c.id === convId) {
              return {
                  ...c,
                  unreadCounts: {
                      doctor: role === 'doctor' || role === 'assistant' ? 0 : c.unreadCounts.doctor,
                      patient: role === 'patient' ? 0 : c.unreadCounts.patient
                  }
              };
          }
          return c;
      });
      set({ conversations: nextConvs });
  },

  createConversation: (user1Id, user2Id) => {
    const existing = get().conversations.find(c =>
      (c.doctorUid === user1Id && c.patientUid === user2Id) ||
      (c.doctorUid === user2Id && c.patientUid === user1Id)
    );

    if (existing) return existing.id;

    const newConv: Conversation = {
      id: generateId(),
      doctorUid: user1Id,
      patientUid: user2Id,
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: 'Start of conversation',
      unreadCounts: { doctor: 0, patient: 0 },
      isBlocked: false,
      isStarred: false,
      tags: [],
    };

    const nextConvs = [...get().conversations, newConv];
    save('medlink_conversations', nextConvs);
    set({ conversations: nextConvs });
    return newConv.id;
  },

  toggleTag: (conversationId, tag) => {
      const nextConvs = get().conversations.map(c => {
          if (c.id === conversationId) {
              const tags = c.tags.includes(tag) ? c.tags.filter(t => t !== tag) : [...c.tags, tag];
              return { ...c, tags };
          }
          return c;
      });
      save('medlink_conversations', nextConvs);
      set({ conversations: nextConvs });
  },

  setReminder: (conversationId, date) => {
      const nextConvs = get().conversations.map(c => {
          if (c.id === conversationId) {
              return { ...c, reminderAt: date, reminderTriggered: false };
          }
          return c;
      });
      save('medlink_conversations', nextConvs);
      set({ conversations: nextConvs });
  },

  addDoctorException: (doctorUid, exception) => {
      const nextUsers = get().users.map(u => {
          if (u.uid === doctorUid) {
              const doc = u as Doctor;
              return { ...doc, exceptions: [...doc.exceptions, exception] };
          }
          return u;
      });
      save('medlink_users', nextUsers);
      set({ users: nextUsers, currentUser: nextUsers.find(u => u.uid === doctorUid) || null });
  },

  purchaseExport: (conversationId) => {
      const nextConvs = get().conversations.map(c => {
          if (c.id === conversationId) {
              return { ...c, exportPurchased: true };
          }
          return c;
      });
      save('medlink_conversations', nextConvs);
      set({ conversations: nextConvs });
  },

  addTimelineEvent: (event) => {
    const newEvent: TimelineEvent = {
        ...event,
        id: generateId(),
    };
    const nextEvents = [newEvent, ...get().timelineEvents];
    save('medlink_timeline_events', nextEvents);
    set({ timelineEvents: nextEvents });
  }
}));

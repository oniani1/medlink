export interface User {
  uid: string;
  role: 'doctor' | 'patient' | 'assistant';
  phone: string;
  displayName: { ka: string; ru?: string; en?: string };
  languagePreference: 'ka' | 'ru' | 'en';
  avatarColor: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Doctor extends User {
  doctorId: string;
  specialties: string[];
  clinics: { name: string; address: string; city: string }[];
  languages: string[];
  workingHours: Record<string, { start: string; end: string; enabled: boolean }>;
  exceptions: { start: string; end: string; label: string }[];
  afterHoursEnabled: boolean;
  afterHoursPricing: { messageGEL: number; callGEL: number };
  acceptingNewConnections: boolean;
  assistants: string[];
  isManuallyBusy: boolean;
}

export interface Patient extends User {
  anamnesis: Anamnesis;
  anamnesisLastUpdatedAt: string;
}

export interface Anamnesis {
  demographics: { dob: string; sex: string };
  emergencyCard: {
    bloodType: string;
    allergies: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
  allergies: string[];
  medications: { name: string; dose: string; frequency: string }[];
  chronicConditions: string[];
  surgeries: { name: string; date?: string }[];
  familyHistory: string;
  obgyn: { enabled: boolean; data?: Record<string, string> };
  smokingAlcohol: { smoking: string; alcohol: string; notes: string };
  vaccines: { name: string; date: string }[];
  freeNotes: string;
}

export interface Connection {
  id: string;
  doctorUid: string;
  patientUid: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: string;
  approvedAt?: string;
  blockedAt?: string;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  doctorUid: string;
  patientUid: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCounts: { doctor: number; patient: number };
  isBlocked: boolean;
  isStarred: boolean;
  tags: string[];
  reminderAt?: string;
  reminderTriggered?: boolean;
  exportPurchased?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  senderRole: 'doctor' | 'patient' | 'assistant';
  type: 'text' | 'voice' | 'file' | 'image' | 'call_log' | 'system';
  content: string;
  createdAt: string;
  replyToMessageId?: string;
  attachment?: { name: string; size: string; type: string; thumbnailUrl?: string };
  afterHoursPaid?: boolean;
  afterHoursAmount?: number;
  silent?: boolean;
}

export interface Payment {
  id: string;
  payerUid: string;
  doctorUid: string;
  conversationId: string;
  type: 'after_hours_message' | 'after_hours_call' | 'export_chat';
  amountGEL: number;
  status: 'succeeded' | 'refunded';
  createdAt: string;
  refundEligibleAt: string;
  doctorRespondedIn30Min: boolean;
}

export interface AnamnesisEdit {
  id: string;
  patientUid: string;
  editedByUid: string;
  editedByRole: 'doctor' | 'patient';
  section: string;
  changeDescription: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  patientUid: string;
  creatorUid: string;
  creatorRole: 'doctor' | 'patient' | 'assistant';
  type: 'symptom' | 'medication' | 'note' | 'appointment';
  title: string;
  description?: string;
  date: string;
}

export interface Appointment {
  id: string;
  conversationId: string;
  patientUid: string;
  doctorUid: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  title: string;
}
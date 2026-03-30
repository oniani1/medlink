export interface DashboardDoctor {
  id: string;
  name: { ka: string; en: string };
  specialty: string;
  specialtyEn: string;
  department: string;
  activePatients: number;
  totalPatients: number;
  messagesThisWeek: number;
  messagesLastWeek: number;
  avgResponseTimeMin: number;
  satisfactionRating: number;
  efficiencyScore: number;
  afterHoursRevenue: number;
  anamnesisCompletionRate: number;
  status: 'active' | 'away' | 'inactive';
  joinedDate: string;
  avatarSeed: string;
  weeklyMessageHistory: number[];
  monthlyRevenue: number[];
  resolvedRate: number;
  pendingRequests: number;
  unreadOver24h: number;
}

export interface PatientStats {
  total: number;
  newThisMonth: number;
  newLastMonth: number;
  activeThisWeek: number;
  engagementFunnel: {
    new: number;
    connected: number;
    active: number;
    dormant: number;
    churned: number;
  };
  demographics: {
    ageGroups: { label: string; labelKa: string; count: number }[];
    genderSplit: { male: number; female: number };
    topConditions: { name: string; nameKa: string; count: number }[];
  };
  anamnesisCompletion: {
    complete: number;
    partial: number;
    notStarted: number;
  };
  satisfactionDistribution: number[];
  monthlyNewPatients: { month: string; monthKa: string; count: number }[];
  weeklyEngagement: number[];
}

export interface AnalyticsData {
  dailyMessages: { date: string; sent: number; received: number }[];
  peakHours: number[][];
  visitReasons: { reason: string; reasonKa: string; count: number; color: string }[];
  responseTimeTrend: { week: string; avgMinutes: number }[];
  appointmentStats: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    rescheduled: number;
  };
  appointmentTrend: { month: string; monthKa: string; completed: number; cancelled: number; noShow: number }[];
}

export interface FinancialData {
  roi: {
    anamnesisSavings: number;
    noShowReduction: number;
    afterHoursRevenue: number;
    chronicCareRecovery: number;
    adminSavings: number;
    totalMonthlySavings: number;
    subscriptionCost: number;
  };
  monthlyROI: { month: string; monthKa: string; savings: number; revenue: number }[];
  doctorRevenue: { doctorId: string; name: string; revenue: number; patients: number }[];
  afterHoursBreakdown: {
    totalEarnings: number;
    messageEarnings: number;
    callEarnings: number;
    exportEarnings: number;
    weeklyTrend: number[];
  };
  projectedVsActual: { month: string; monthKa: string; projected: number; actual: number }[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
}

import { AnalyticsData } from '../types';
import { generateDailyMessages, generatePeakHours, seededRandom } from './generators';

const rand = seededRandom(99);

export const mockAnalytics: AnalyticsData = {
  dailyMessages: generateDailyMessages(120, rand),
  peakHours: generatePeakHours(rand),
  visitReasons: [
    { reason: 'New Symptom', reasonKa: 'ახალი სიმპტომი', count: 1240, color: '#0d9488' },
    { reason: 'Follow-up', reasonKa: 'კონტროლი', count: 980, color: '#3b82f6' },
    { reason: 'Lab Results', reasonKa: 'ანალიზები', count: 720, color: '#8b5cf6' },
    { reason: 'Medication', reasonKa: 'მედიკამენტი', count: 650, color: '#f59e0b' },
    { reason: 'Appointment', reasonKa: 'ვიზიტის ჩაწერა', count: 480, color: '#ec4899' },
    { reason: 'Other', reasonKa: 'სხვა', count: 330, color: '#94a3b8' },
  ],
  responseTimeTrend: [
    { week: 'W1', avgMinutes: 32 },
    { week: 'W2', avgMinutes: 29 },
    { week: 'W3', avgMinutes: 31 },
    { week: 'W4', avgMinutes: 27 },
    { week: 'W5', avgMinutes: 25 },
    { week: 'W6', avgMinutes: 28 },
    { week: 'W7', avgMinutes: 23 },
    { week: 'W8', avgMinutes: 22 },
    { week: 'W9', avgMinutes: 24 },
    { week: 'W10', avgMinutes: 20 },
    { week: 'W11', avgMinutes: 19 },
    { week: 'W12', avgMinutes: 21 },
    { week: 'W13', avgMinutes: 18 },
    { week: 'W14', avgMinutes: 17 },
    { week: 'W15', avgMinutes: 19 },
    { week: 'W16', avgMinutes: 18 },
  ],
  appointmentStats: {
    total: 3840,
    completed: 2920,
    cancelled: 345,
    noShow: 420,
    rescheduled: 155,
  },
  appointmentTrend: [
    { month: 'Dec', monthKa: 'დეკ', completed: 680, cancelled: 82, noShow: 110 },
    { month: 'Jan', monthKa: 'იან', completed: 710, cancelled: 88, noShow: 105 },
    { month: 'Feb', monthKa: 'თებ', completed: 740, cancelled: 85, noShow: 102 },
    { month: 'Mar', monthKa: 'მარ', completed: 790, cancelled: 90, noShow: 103 },
  ],
};

import { FinancialData } from '../types';
import { mockDoctors } from './mockDoctors';

export const mockFinancial: FinancialData = {
  roi: {
    anamnesisSavings: 12500,
    noShowReduction: 8200,
    afterHoursRevenue: 15800,
    chronicCareRecovery: 6500,
    adminSavings: 4500,
    totalMonthlySavings: 47500,
    subscriptionCost: 2500,
  },
  monthlyROI: [
    { month: 'Dec', monthKa: 'დეკ', savings: 38200, revenue: 11400 },
    { month: 'Jan', monthKa: 'იან', savings: 41800, revenue: 13200 },
    { month: 'Feb', monthKa: 'თებ', savings: 44100, revenue: 14800 },
    { month: 'Mar', monthKa: 'მარ', savings: 47500, revenue: 15800 },
  ],
  doctorRevenue: mockDoctors
    .filter(d => d.afterHoursRevenue > 0)
    .sort((a, b) => b.afterHoursRevenue - a.afterHoursRevenue)
    .slice(0, 15)
    .map(d => ({
      doctorId: d.id,
      name: d.name.ka,
      revenue: d.afterHoursRevenue,
      patients: d.activePatients,
    })),
  afterHoursBreakdown: {
    totalEarnings: 15800,
    messageEarnings: 8400,
    callEarnings: 5600,
    exportEarnings: 1800,
    weeklyTrend: [720, 810, 780, 850, 920, 880, 960, 1010, 970, 1050, 1020, 1080, 1100, 1060, 1120, 1150],
  },
  projectedVsActual: [
    { month: 'Dec', monthKa: 'დეკ', projected: 42000, actual: 38200 },
    { month: 'Jan', monthKa: 'იან', projected: 44000, actual: 41800 },
    { month: 'Feb', monthKa: 'თებ', projected: 46000, actual: 44100 },
    { month: 'Mar', monthKa: 'მარ', projected: 48000, actual: 47500 },
  ],
};

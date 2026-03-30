import { PatientStats } from '../types';

export const mockPatientStats: PatientStats = {
  total: 4200,
  newThisMonth: 180,
  newLastMonth: 165,
  activeThisWeek: 1850,
  engagementFunnel: {
    new: 320,
    connected: 280,
    active: 1850,
    dormant: 1200,
    churned: 550,
  },
  demographics: {
    ageGroups: [
      { label: '0-17', labelKa: '0-17', count: 380 },
      { label: '18-30', labelKa: '18-30', count: 720 },
      { label: '31-45', labelKa: '31-45', count: 1250 },
      { label: '46-60', labelKa: '46-60', count: 1100 },
      { label: '61+', labelKa: '61+', count: 750 },
    ],
    genderSplit: { male: 1850, female: 2350 },
    topConditions: [
      { name: 'Hypertension', nameKa: 'ჰიპერტენზია', count: 680 },
      { name: 'Type 2 Diabetes', nameKa: 'შაქრიანი დიაბეტი (ტიპი 2)', count: 420 },
      { name: 'Asthma', nameKa: 'ასთმა', count: 310 },
      { name: 'Hypothyroidism', nameKa: 'ჰიპოთირეოზი', count: 280 },
      { name: 'Arthritis', nameKa: 'ართრიტი', count: 245 },
      { name: 'GERD', nameKa: 'გერბ', count: 195 },
      { name: 'Depression', nameKa: 'დეპრესია', count: 170 },
      { name: 'Hyperlipidemia', nameKa: 'ჰიპერლიპიდემია', count: 160 },
    ],
  },
  anamnesisCompletion: {
    complete: 2800,
    partial: 900,
    notStarted: 500,
  },
  satisfactionDistribution: [45, 120, 380, 1450, 2205],
  monthlyNewPatients: [
    { month: 'Dec', monthKa: 'დეკ', count: 142 },
    { month: 'Jan', monthKa: 'იან', count: 155 },
    { month: 'Feb', monthKa: 'თებ', count: 165 },
    { month: 'Mar', monthKa: 'მარ', count: 180 },
  ],
  weeklyEngagement: [1620, 1680, 1710, 1650, 1740, 1690, 1780, 1720, 1800, 1760, 1830, 1790, 1810, 1850, 1820, 1850],
};

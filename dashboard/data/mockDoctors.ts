import { DashboardDoctor } from '../types';
import { seededRandom, randomInt, randomFloat, generateWeeklyHistory, generateMonthlyValues } from './generators';

const firstNames = [
  'გიორგი', 'ნიკა', 'დავით', 'ლევან', 'ალექსანდრე', 'თორნიკე', 'ზურაბ', 'ბექა', 'გოჩა', 'მამუკა',
  'ნინო', 'ანა', 'მარიამ', 'თამარ', 'ეკა', 'ლალი', 'ნათია', 'მაკა', 'ხატია', 'თეა',
  'გიგი', 'ვახტანგ', 'ირაკლი', 'შოთა', 'ოთარ', 'კახა', 'ნანა', 'ლია', 'მანანა', 'ქეთი',
  'ტატო', 'რევაზ', 'ნოდარ', 'ბადრი', 'სოფო',
];
const firstNamesEn = [
  'Giorgi', 'Nika', 'Davit', 'Levan', 'Alexandre', 'Tornike', 'Zurab', 'Beka', 'Gocha', 'Mamuka',
  'Nino', 'Ana', 'Mariam', 'Tamar', 'Eka', 'Lali', 'Natia', 'Maka', 'Khatia', 'Tea',
  'Gigi', 'Vakhtang', 'Irakli', 'Shota', 'Otar', 'Kakha', 'Nana', 'Lia', 'Manana', 'Keti',
  'Tato', 'Revaz', 'Nodar', 'Badri', 'Sopho',
];
const lastNames = [
  'ბერიძე', 'კვარაცხელია', 'მაისურაძე', 'ჯანელიძე', 'ხარაიშვილი', 'გელაშვილი', 'ცხვედიანი',
  'დავითაშვილი', 'ნოზაძე', 'გიორგაძე', 'თურქიაშვილი', 'კობალაძე', 'მჭედლიშვილი', 'ლომიძე',
  'ჩხაიძე', 'კაპანაძე', 'ბაქრაძე', 'ჭანტურია', 'წიკლაური', 'ტაბიძე', 'მელაძე', 'პაპიაშვილი',
  'ჩიქოვანი', 'შარაშენიძე', 'გოგოლაძე', 'ჯავახიშვილი', 'თავაძე', 'ბარამიძე', 'ხუციშვილი',
  'ნაკაშიძე', 'გვარამია', 'ხმალაძე', 'ზედგინიძე', 'ქობულაძე', 'სულაქველიძე',
];
const lastNamesEn = [
  'Beridze', 'Kvaratskhelia', 'Maisuradze', 'Janelidze', 'Kharaishvili', 'Gelashvili', 'Tskhvediani',
  'Davitashvili', 'Nozadze', 'Giorgadze', 'Turkiashvili', 'Kobaladze', 'Mchedlishvili', 'Lomidze',
  'Chkhaidze', 'Kapanadze', 'Bakradze', 'Chanturia', 'Tsiklauri', 'Tabidze', 'Meladze', 'Papiashvili',
  'Chikovani', 'Sharashenidze', 'Gogoladze', 'Javakhishvili', 'Tavadze', 'Baramidze', 'Khutsishvili',
  'Nakashidze', 'Gvaramia', 'Khmaladze', 'Zedginidze', 'Kobuladze', 'Sulakvelidze',
];

const specialties: { ka: string; en: string; dept: string }[] = [
  { ka: 'კარდიოლოგია', en: 'Cardiology', dept: 'cardiac' },
  { ka: 'ნევროლოგია', en: 'Neurology', dept: 'neuro' },
  { ka: 'ორთოპედია', en: 'Orthopedics', dept: 'surgical' },
  { ka: 'გინეკოლოგია', en: 'Gynecology', dept: 'womens' },
  { ka: 'პედიატრია', en: 'Pediatrics', dept: 'pediatric' },
  { ka: 'ენდოკრინოლოგია', en: 'Endocrinology', dept: 'internal' },
  { ka: 'დერმატოლოგია', en: 'Dermatology', dept: 'outpatient' },
  { ka: 'ოფთალმოლოგია', en: 'Ophthalmology', dept: 'outpatient' },
  { ka: 'უროლოგია', en: 'Urology', dept: 'surgical' },
  { ka: 'გასტროენტეროლოგია', en: 'Gastroenterology', dept: 'internal' },
  { ka: 'ონკოლოგია', en: 'Oncology', dept: 'oncology' },
  { ka: 'პულმონოლოგია', en: 'Pulmonology', dept: 'internal' },
  { ka: 'რევმატოლოგია', en: 'Rheumatology', dept: 'internal' },
  { ka: 'თერაპია', en: 'General Practice', dept: 'internal' },
];

const rand = seededRandom(42);

export const mockDoctors: DashboardDoctor[] = Array.from({ length: 35 }, (_, i) => {
  const spec = specialties[i % specialties.length];
  const isGoodPerformer = i < 25;
  const isMidPerformer = i >= 25 && i < 30;

  const efficiency = isGoodPerformer
    ? randomInt(80, 98, rand)
    : isMidPerformer
      ? randomInt(60, 79, rand)
      : randomInt(40, 59, rand);

  const avgResponse = isGoodPerformer
    ? randomFloat(3, 18, rand)
    : isMidPerformer
      ? randomFloat(20, 45, rand)
      : randomFloat(50, 180, rand);

  const satisfaction = isGoodPerformer
    ? randomFloat(4.0, 5.0, rand)
    : isMidPerformer
      ? randomFloat(3.2, 4.0, rand)
      : randomFloat(2.1, 3.2, rand);

  const activePatients = randomInt(8, 85, rand);
  const totalPatients = activePatients + randomInt(10, 120, rand);
  const messagesThisWeek = randomInt(15, 140, rand);

  const statuses: DashboardDoctor['status'][] = ['active', 'active', 'active', 'active', 'away', 'inactive'];

  const yearsAgo = randomFloat(0.2, 3, rand);
  const joinDate = new Date();
  joinDate.setFullYear(joinDate.getFullYear() - Math.floor(yearsAgo));
  joinDate.setMonth(joinDate.getMonth() - randomInt(0, 11, rand));

  return {
    id: `doc-d${String(i + 1).padStart(2, '0')}`,
    name: {
      ka: `დრ. ${firstNames[i]} ${lastNames[i]}`,
      en: `Dr. ${firstNamesEn[i]} ${lastNamesEn[i]}`,
    },
    specialty: spec.ka,
    specialtyEn: spec.en,
    department: spec.dept,
    activePatients,
    totalPatients,
    messagesThisWeek,
    messagesLastWeek: messagesThisWeek + randomInt(-30, 20, rand),
    avgResponseTimeMin: Math.round(avgResponse),
    satisfactionRating: satisfaction,
    efficiencyScore: efficiency,
    afterHoursRevenue: randomInt(0, 800, rand),
    anamnesisCompletionRate: randomFloat(0.4, 1.0, rand),
    status: statuses[i % statuses.length] || 'active',
    joinedDate: joinDate.toISOString().split('T')[0],
    avatarSeed: `${firstNamesEn[i]}-${lastNamesEn[i]}`,
    weeklyMessageHistory: generateWeeklyHistory(16, messagesThisWeek, 15, rand),
    monthlyRevenue: generateMonthlyValues(4, randomInt(200, 1500, rand), randomInt(50, 200, rand), rand),
    resolvedRate: isGoodPerformer ? randomFloat(80, 96, rand) : isMidPerformer ? randomFloat(55, 79, rand) : randomFloat(35, 54, rand),
    pendingRequests: randomInt(0, 8, rand),
    unreadOver24h: isGoodPerformer ? randomInt(0, 2, rand) : randomInt(3, 12, rand),
  };
});

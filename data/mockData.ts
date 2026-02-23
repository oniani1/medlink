import { Doctor, Patient, User, Conversation, Message, Connection, Anamnesis, Payment, TimelineEvent } from '../types';
import { generateId } from '../utils';

const SCHEMA_VERSION = 5;

const makeDate = (daysAgo: number, hours = 10, mins = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
};

export const seedMockData = () => {
  const currentVersion = parseInt(localStorage.getItem('medlink_schema_version') || '0');
  if (currentVersion >= SCHEMA_VERSION) return;

  // Clear old data for clean re-seed
  const keys = Object.keys(localStorage).filter(k => k.startsWith('medlink_'));
  keys.forEach(k => localStorage.removeItem(k));

  const doctor1: Doctor = {
    uid: 'doc-1',
    role: 'doctor',
    phone: '+995555000001',
    displayName: { ka: 'დრ. გიორგი ბერიძე', en: 'Dr. Giorgi Beridze' },
    languagePreference: 'ka',
    avatarColor: 'bg-teal-600',
    avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=GiorgiB&backgroundColor=0d9488',
    createdAt: makeDate(90),
    doctorId: 'ML-1001',
    specialties: ['Cardiology', 'Therapy'],
    clinics: [{ name: 'MediClub', address: 'ჭავჭავაძის 5', city: 'თბილისი' }],
    languages: ['Georgian', 'English', 'Russian'],
    workingHours: {
      mon: { start: '09:00', end: '17:00', enabled: true },
      tue: { start: '09:00', end: '17:00', enabled: true },
      wed: { start: '09:00', end: '17:00', enabled: true },
      thu: { start: '09:00', end: '17:00', enabled: true },
      fri: { start: '09:00', end: '15:00', enabled: true },
      sat: { start: '10:00', end: '14:00', enabled: true },
      sun: { start: '00:00', end: '00:00', enabled: false },
    },
    exceptions: [],
    afterHoursEnabled: true,
    afterHoursPricing: { messageGEL: 5, callGEL: 20 },
    acceptingNewConnections: true,
    assistants: ['asst-1'],
    isManuallyBusy: false,
  };

  const doctor2: Doctor = {
    uid: 'doc-2',
    role: 'doctor',
    phone: '+995555000002',
    displayName: { ka: 'დრ. ნინო მაისურაძე', en: 'Dr. Nino Maisuradze' },
    languagePreference: 'en',
    avatarColor: 'bg-indigo-600',
    avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=NinoM&backgroundColor=4f46e5',
    createdAt: makeDate(60),
    doctorId: 'ML-1002',
    specialties: ['Pediatrics'],
    clinics: [{ name: 'Curatio', address: 'საბურთალო, ვაჟა-ფშაველას 71', city: 'თბილისი' }],
    languages: ['Georgian', 'English'],
    workingHours: {
      mon: { start: '10:00', end: '16:00', enabled: true },
      tue: { start: '10:00', end: '16:00', enabled: true },
      wed: { start: '10:00', end: '16:00', enabled: true },
      thu: { start: '10:00', end: '16:00', enabled: true },
      fri: { start: '10:00', end: '16:00', enabled: true },
      sat: { start: '00:00', end: '00:00', enabled: false },
      sun: { start: '00:00', end: '00:00', enabled: false },
    },
    exceptions: [],
    afterHoursEnabled: false,
    afterHoursPricing: { messageGEL: 8, callGEL: 25 },
    acceptingNewConnections: true,
    assistants: [],
    isManuallyBusy: false,
  };

  const assistant1: User = {
    uid: 'asst-1',
    role: 'assistant',
    phone: '+995555000003',
    displayName: { ka: 'ანა გელაშვილი (ასისტენტი)', en: 'Ana Gelashvili (Assistant)' },
    languagePreference: 'ka',
    avatarColor: 'bg-pink-500',
    avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=AnaG&backgroundColor=ec4899',
    createdAt: makeDate(85),
  };

  const avatarColors = ['bg-slate-600', 'bg-slate-700', 'bg-slate-500', 'bg-slate-800', 'bg-slate-400'];
  const avatarSeeds = ['TamarJ', 'LevanM', 'NatoK', 'DavidK', 'MariamT'];

  const patientData: Array<{ name_ka: string; name_en: string; phone: string; color: string; avatarUrl: string; anamnesis: Anamnesis; anamnesisDate: string }> = [
    {
      name_ka: 'თამარ ჯანელიძე', name_en: 'Tamar Janelidze', phone: '+995599100001', color: 'bg-slate-600',
      avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=TamarJ&backgroundColor=475569',
      anamnesisDate: makeDate(14),
      anamnesis: {
        demographics: { dob: '1985-03-15', sex: 'მდედრობითი' },
        emergencyCard: { bloodType: 'A+', allergies: 'პენიცილინი', emergencyContactName: 'გიორგი ჯანელიძე', emergencyContactPhone: '+995599200001' },
        allergies: ['პენიცილინი', 'არაქისი'],
        medications: [{ name: 'ლიზინოპრილი', dose: '10მგ', frequency: 'ყოველდღიურად' }, { name: 'ასპირინი', dose: '100მგ', frequency: 'ყოველდღიურად' }],
        chronicConditions: ['ჰიპერტენზია', 'მსუბუქი ასთმა'],
        surgeries: [{ name: 'აპენდექტომია', date: '2010-05-20' }],
        familyHistory: 'მამას აქვს დიაბეტი. დედას აქვს ჰიპერტენზია.',
        obgyn: { enabled: true, data: { lastPeriod: '2026-01-20', pregnancies: '1' } },
        smokingAlcohol: { smoking: 'never', alcohol: 'socially', notes: '' },
        vaccines: [{ name: 'COVID-19 (Pfizer)', date: '2021-06-15' }, { name: 'გრიპი', date: '2025-10-01' }],
        freeNotes: 'ურჩევნია დილის ვიზიტები. პენიცილინზე ალერგიული რეაქცია — გამონაყარი.',
      }
    },
    {
      name_ka: 'ლევან მიქელაძე', name_en: 'Levan Mikeladze', phone: '+995599100002', color: 'bg-slate-700',
      avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=LevanM&backgroundColor=334155',
      anamnesisDate: makeDate(30),
      anamnesis: {
        demographics: { dob: '1972-11-08', sex: 'მამრობითი' },
        emergencyCard: { bloodType: 'O-', allergies: 'არცერთი', emergencyContactName: 'ნინო მიქელაძე', emergencyContactPhone: '+995599200002' },
        allergies: [],
        medications: [{ name: 'მეტფორმინი', dose: '500მგ', frequency: 'დღეში ორჯერ' }],
        chronicConditions: ['ტიპი 2 დიაბეტი'],
        surgeries: [{ name: 'მუხლის ართროსკოპია', date: '2018-03-12' }],
        familyHistory: 'ორივე მშობელს ჰქონდა გულ-სისხლძარღვთა დაავადება.',
        obgyn: { enabled: false },
        smokingAlcohol: { smoking: 'former', alcohol: 'socially', notes: 'თამბაქო მოთიშა 2015 წელს' },
        vaccines: [{ name: 'COVID-19 (Sinopharm)', date: '2021-08-20' }],
        freeNotes: 'რეგულარული შემოწმება 3 თვეში ერთხელ დიაბეტის მართვისთვის.',
      }
    },
    {
      name_ka: 'ნატო კვარაცხელია', name_en: 'Nato Kvaratskhelia', phone: '+995599100003', color: 'bg-slate-500',
      avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=NatoK&backgroundColor=64748b',
      anamnesisDate: makeDate(45),
      anamnesis: {
        demographics: { dob: '1998-07-22', sex: 'მდედრობითი' },
        emergencyCard: { bloodType: 'B+', allergies: 'სულფა პრეპარატები', emergencyContactName: 'მარიამ კვარაცხელია', emergencyContactPhone: '+995599200003' },
        allergies: ['სულფა პრეპარატები', 'ლატექსი'],
        medications: [],
        chronicConditions: [],
        surgeries: [],
        familyHistory: 'მნიშვნელოვანი ოჯახის ანამნეზი არ არის.',
        obgyn: { enabled: true, data: { lastPeriod: '2026-02-01' } },
        smokingAlcohol: { smoking: 'never', alcohol: 'never', notes: '' },
        vaccines: [{ name: 'COVID-19 (Pfizer)', date: '2021-07-10' }, { name: 'HPV', date: '2016-03-15' }],
        freeNotes: '',
      }
    },
    {
      name_ka: 'დავით ხარაიშვილი', name_en: 'Davit Kharaishvili', phone: '+995599100004', color: 'bg-slate-800',
      avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=DavidK&backgroundColor=1e293b',
      anamnesisDate: makeDate(7),
      anamnesis: {
        demographics: { dob: '1955-01-30', sex: 'მამრობითი' },
        emergencyCard: { bloodType: 'AB+', allergies: 'იბუპროფენი', emergencyContactName: 'ელენე ხარაიშვილი', emergencyContactPhone: '+995599200004' },
        allergies: ['იბუპროფენი', 'ზღვის პროდუქტები'],
        medications: [{ name: 'ამლოდიპინი', dose: '5მგ', frequency: 'ყოველდღიურად' }, { name: 'ატორვასტატინი', dose: '20მგ', frequency: 'ყოველდღიურად' }, { name: 'ომეპრაზოლი', dose: '20მგ', frequency: 'ყოველდღიურად' }],
        chronicConditions: ['ჰიპერტენზია', 'ჰიპერლიპიდემია', 'GERD (რეფლუქსი)'],
        surgeries: [{ name: 'კორონარული შუნტირება', date: '2019-11-15' }, { name: 'ქოლეცისტექტომია', date: '2005-06-10' }],
        familyHistory: 'მამა გარდაიცვალა მიოკარდიუმის ინფარქტით 62 წლის ასაკში. დედას ჰქონდა ინსულტი.',
        obgyn: { enabled: false },
        smokingAlcohol: { smoking: 'former', alcohol: 'never', notes: 'თამბაქო მოთიშა შუნტირების შემდეგ' },
        vaccines: [{ name: 'COVID-19 (Pfizer x3)', date: '2021-12-01' }, { name: 'პნევმოკოკური', date: '2023-03-15' }],
        freeNotes: 'პოსტ-შუნტირების პაციენტი. საჭიროებს წლიურ კარდიოლოგიურ კონტროლს. ურჩევნია საღამოს ვიზიტები.',
      }
    },
    {
      name_ka: 'მარიამ ცხვედიანი', name_en: 'Mariam Tskhvediani', phone: '+995599100005', color: 'bg-slate-400',
      avatarUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=MariamT&backgroundColor=94a3b8',
      anamnesisDate: makeDate(3),
      anamnesis: {
        demographics: { dob: '2015-09-12', sex: 'მდედრობითი' },
        emergencyCard: { bloodType: 'A-', allergies: 'არცერთი', emergencyContactName: 'ქეთი ცხვედიანი (დედა)', emergencyContactPhone: '+995599200005' },
        allergies: [],
        medications: [],
        chronicConditions: [],
        surgeries: [],
        familyHistory: 'მნიშვნელოვანი ოჯახის ანამნეზი არ არის.',
        obgyn: { enabled: false },
        smokingAlcohol: { smoking: 'never', alcohol: 'never', notes: '' },
        vaccines: [{ name: 'MMR (წითელა-წითურა-ყბაყურა)', date: '2016-09-12' }, { name: 'DTaP (დიფტერია-ტეტანუსი)', date: '2020-09-12' }, { name: 'COVID-19 (Pfizer პედიატრიული)', date: '2022-02-15' }],
        freeNotes: 'პედიატრიული პაციენტი. მშობელი: ქეთი ცხვედიანი.',
      }
    },
  ];

  const patients: Patient[] = patientData.map((p, i) => ({
    uid: `pat-${i + 1}`,
    role: 'patient',
    phone: p.phone,
    displayName: { ka: p.name_ka, en: p.name_en },
    languagePreference: 'ka',
    avatarColor: p.color,
    avatarUrl: p.avatarUrl,
    createdAt: makeDate(60 - i * 5),
    anamnesis: p.anamnesis,
    anamnesisLastUpdatedAt: p.anamnesisDate,
  }));

  const conversations: Conversation[] = [
    {
      id: 'conv-1',
      doctorUid: 'doc-1',
      patientUid: 'pat-1',
      lastMessageAt: makeDate(0, 11, 30),
      lastMessagePreview: 'გმადლობთ ექიმო, წამალს მივიღებ.',
      unreadCounts: { doctor: 1, patient: 0 },
      isBlocked: false,
      isStarred: true,
      tags: ['Chronic'],
    },
    {
      id: 'conv-2',
      doctorUid: 'doc-1',
      patientUid: 'pat-2',
      lastMessageAt: makeDate(1, 15, 20),
      lastMessagePreview: 'ხვალ შეიძლება მოვიდე?',
      unreadCounts: { doctor: 0, patient: 2 },
      isBlocked: false,
      isStarred: false,
      tags: ['Follow-up'],
    },
    {
      id: 'conv-blocked',
      doctorUid: 'doc-1',
      patientUid: 'pat-3',
      lastMessageAt: makeDate(12, 9, 0),
      lastMessagePreview: 'ეს საუბარი დახურულია.',
      unreadCounts: { doctor: 0, patient: 0 },
      isBlocked: true,
      isStarred: false,
      tags: [],
    },
    {
      id: 'conv-3',
      doctorUid: 'doc-1',
      patientUid: 'pat-4',
      lastMessageAt: makeDate(0, 9, 15),
      lastMessagePreview: 'ანალიზის შედეგები მზადაა.',
      unreadCounts: { doctor: 2, patient: 0 },
      isBlocked: false,
      isStarred: false,
      tags: ['Lab Results', 'Urgent'],
    },
    {
      id: 'conv-4',
      doctorUid: 'doc-2',
      patientUid: 'pat-5',
      lastMessageAt: makeDate(2, 14, 0),
      lastMessagePreview: 'ვაქცინაციის გრაფიკი განახლდა.',
      unreadCounts: { doctor: 0, patient: 1 },
      isBlocked: false,
      isStarred: true,
      tags: ['New Patient'],
    },
  ];

  const messages: Message[] = [
    // conv-1: doc-1 <-> pat-1 (Tamar) — multi-day conversation
    { id: generateId(), conversationId: 'conv-1', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'გამარჯობა, თამარ. როგორ ბრძანდებით? წინა ვიზიტის შემდეგ როგორ გრძნობთ თავს?', createdAt: makeDate(3, 10, 0) },
    { id: generateId(), conversationId: 'conv-1', senderUid: 'pat-1', senderRole: 'patient', type: 'text', content: 'გამარჯობა, ექიმო. ზოგადად უკეთესად ვარ, მაგრამ ზოგჯერ წნევა კვლავ მაღლა მიდის.', createdAt: makeDate(3, 10, 15) },
    { id: generateId(), conversationId: 'conv-1', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'რა ციფრებს აჩვენებს? დილით და საღამოს გაზომეთ და ჩაინიშნეთ.', createdAt: makeDate(3, 10, 20) },
    { id: generateId(), conversationId: 'conv-1', senderUid: 'pat-1', senderRole: 'patient', type: 'text', content: 'დილით 140/90, საღამოს 135/85 იყო. ეს ნორმალურია?', createdAt: makeDate(2, 9, 0) },
    { id: generateId(), conversationId: 'conv-1', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'ცოტა მაღალია. Lisinopril-ის დოზა 10mg-დან 15mg-ზე გავზარდოთ. ერთი კვირის შემდეგ ისევ გამომიგზავნეთ მაჩვენებლები.', createdAt: makeDate(2, 9, 30) },
    { id: generateId(), conversationId: 'conv-1', senderUid: 'pat-1', senderRole: 'patient', type: 'text', content: 'კარგი, გავზრდი. გვერდითი ეფექტი რამე ხომ არ იქნება?', createdAt: makeDate(2, 9, 35) },
    { id: generateId(), conversationId: 'conv-1', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'იშვიათად თავბრუსხვევა შეიძლება იყოს, მაგრამ ჩვეულებრივ კარგად ატანენ. თუ რამე შეგაწუხებთ, მაშინვე დამიკავშირდით.', createdAt: makeDate(2, 9, 40) },
    { id: generateId(), conversationId: 'conv-1', senderUid: 'pat-1', senderRole: 'patient', type: 'text', content: 'გმადლობთ ექიმო, წამალს მივიღებ.', createdAt: makeDate(0, 11, 30) },

    // conv-2: doc-1 <-> pat-2 (Levan)
    { id: generateId(), conversationId: 'conv-2', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'ლევან, შაქრის ანალიზი მზადაა. HbA1c 7.2%-ია, წინა ჯერზე 7.8% იყო. კარგი პროგრესია!', createdAt: makeDate(3, 14, 0) },
    { id: generateId(), conversationId: 'conv-2', senderUid: 'pat-2', senderRole: 'patient', type: 'text', content: 'რა კარგი! ნიშნავს რომ დიეტა მუშაობს?', createdAt: makeDate(3, 14, 20) },
    { id: generateId(), conversationId: 'conv-2', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'ზუსტად! გაგრძელეთ ასე. Metformin-ს იმავე დოზით მიიღეთ. შემდეგი კონტროლი 3 თვეში.', createdAt: makeDate(3, 14, 30) },
    { id: generateId(), conversationId: 'conv-2', senderUid: 'pat-2', senderRole: 'patient', type: 'text', content: 'კარგი. სხვათაშორის, ხვალ შეიძლება მოვიდე? მუხლი ცოტა მაწუხებს.', createdAt: makeDate(1, 15, 20) },

    // conv-blocked: doc-1 <-> pat-3 (Nato) — old, blocked conversation
    { id: generateId(), conversationId: 'conv-blocked', senderUid: 'pat-3', senderRole: 'patient', type: 'text', content: 'ექიმო, კონსულტაცია მინდოდა.', createdAt: makeDate(14, 10, 0) },
    { id: generateId(), conversationId: 'conv-blocked', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'რა გაწუხებთ?', createdAt: makeDate(14, 10, 5) },
    { id: generateId(), conversationId: 'conv-blocked', senderUid: 'pat-3', senderRole: 'patient', type: 'text', content: 'მადლობა, უკვე მოვაგვარე. სხვა ექიმთან მივედი.', createdAt: makeDate(12, 9, 0) },

    // conv-3: doc-1 <-> pat-4 (Davit) — urgent, lab results
    { id: generateId(), conversationId: 'conv-3', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'დავით, კარდიოლოგიური შემოწმების შედეგები მივიღე.', createdAt: makeDate(1, 16, 0) },
    { id: generateId(), conversationId: 'conv-3', senderUid: 'doc-1', senderRole: 'doctor', type: 'text', content: 'EKG ნორმალურია, ექო-კარდიოგრამაზე მცირე ცვლილებებია, მაგრამ შემაშფოთებელი არაფერია.', createdAt: makeDate(1, 16, 5) },
    { id: generateId(), conversationId: 'conv-3', senderUid: 'pat-4', senderRole: 'patient', type: 'text', content: 'გმადლობთ, ექიმო. ანალიზის შედეგები მზადაა, ატვირთვა შემიძლია?', createdAt: makeDate(0, 9, 10) },
    { id: generateId(), conversationId: 'conv-3', senderUid: 'pat-4', senderRole: 'patient', type: 'text', content: 'ანალიზის შედეგები მზადაა.', createdAt: makeDate(0, 9, 15) },

    // conv-4: doc-2 <-> pat-5 (Mariam — pediatric)
    { id: generateId(), conversationId: 'conv-4', senderUid: 'pat-5', senderRole: 'patient', type: 'text', content: 'გამარჯობა, ექიმო. მარიამის ვაქცინაციის გრაფიკი როდის განახლდება?', createdAt: makeDate(4, 11, 0) },
    { id: generateId(), conversationId: 'conv-4', senderUid: 'doc-2', senderRole: 'doctor', type: 'text', content: 'გამარჯობა! მოდით შევამოწმოთ. მარიამი 10 წლისაა, DTaP ბუსტერი საჭიროა.', createdAt: makeDate(4, 11, 30) },
    { id: generateId(), conversationId: 'conv-4', senderUid: 'pat-5', senderRole: 'patient', type: 'text', content: 'კარგი, როდის მოვიდეთ?', createdAt: makeDate(3, 9, 0) },
    { id: generateId(), conversationId: 'conv-4', senderUid: 'doc-2', senderRole: 'doctor', type: 'text', content: 'ვაქცინაციის გრაფიკი განახლდა. ნებისმიერ სამუშაო დღეს მობრძანდით 10:00-დან 15:00-მდე.', createdAt: makeDate(2, 14, 0) },
  ];

  const connections: Connection[] = [
    { id: 'conn-1', doctorUid: 'doc-1', patientUid: 'pat-1', status: 'accepted', createdAt: makeDate(50), conversationId: 'conv-1', approvedAt: makeDate(50) },
    { id: 'conn-2', doctorUid: 'doc-1', patientUid: 'pat-2', status: 'accepted', createdAt: makeDate(40), conversationId: 'conv-2', approvedAt: makeDate(40) },
    { id: 'conn-3', doctorUid: 'doc-1', patientUid: 'pat-3', status: 'accepted', createdAt: makeDate(30), conversationId: 'conv-blocked', approvedAt: makeDate(30) },
    { id: 'conn-4', doctorUid: 'doc-1', patientUid: 'pat-4', status: 'accepted', createdAt: makeDate(20), conversationId: 'conv-3', approvedAt: makeDate(20) },
    { id: 'conn-5', doctorUid: 'doc-2', patientUid: 'pat-5', status: 'accepted', createdAt: makeDate(15), conversationId: 'conv-4', approvedAt: makeDate(15) },
    { id: 'conn-req-1', doctorUid: 'doc-1', patientUid: 'pat-5', status: 'pending', createdAt: makeDate(1) },
  ];

  const timelineEvents: TimelineEvent[] = [
    { id: generateId(), patientUid: 'pat-1', creatorUid: 'doc-1', creatorRole: 'doctor', type: 'appointment', title: 'კარდიოლოგიური კონსულტაცია', description: 'პირველადი შემოწმება. წნევა მაღალი, დაინიშნა Lisinopril 10mg.', date: makeDate(30, 10, 0) },
    { id: generateId(), patientUid: 'pat-1', creatorUid: 'pat-1', creatorRole: 'patient', type: 'symptom', title: 'თავის ტკივილი', description: 'დილით ძლიერი თავის ტკივილი, წნევა 150/95.', date: makeDate(20, 8, 0) },
    { id: generateId(), patientUid: 'pat-1', creatorUid: 'doc-1', creatorRole: 'doctor', type: 'medication', title: 'Lisinopril დოზის ცვლილება', description: '10mg-დან 15mg-ზე გაიზარდა.', date: makeDate(2, 9, 30) },
    { id: generateId(), patientUid: 'pat-1', creatorUid: 'doc-1', creatorRole: 'doctor', type: 'note', title: 'ანალიზის შედეგები', description: 'ქოლესტერინი ნორმაშია, შაქარი 5.2.', date: makeDate(15, 11, 0) },
    { id: generateId(), patientUid: 'pat-4', creatorUid: 'doc-1', creatorRole: 'doctor', type: 'appointment', title: 'პოსტ-ოპერაციული შემოწმება', description: 'წლიური კარდიოლოგიური კონტროლი.', date: makeDate(10, 14, 0) },
    { id: generateId(), patientUid: 'pat-4', creatorUid: 'pat-4', creatorRole: 'patient', type: 'symptom', title: 'გულის არითმია', description: 'უჩვეულო გულისცემა, 2-3 წუთი გაგრძელდა.', date: makeDate(5, 20, 0) },
  ];

  const payments: Payment[] = [
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(25, 22, 0), refundEligibleAt: makeDate(24), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(18, 21, 0), refundEligibleAt: makeDate(17), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(15, 23, 0), refundEligibleAt: makeDate(14), doctorRespondedIn30Min: false },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(10, 20, 30), refundEligibleAt: makeDate(9), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(8, 19, 0), refundEligibleAt: makeDate(7), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'export_chat', amountGEL: 25, status: 'succeeded', createdAt: makeDate(5, 12, 0), refundEligibleAt: makeDate(4), doctorRespondedIn30Min: false },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(3, 22, 0), refundEligibleAt: makeDate(2), doctorRespondedIn30Min: true },
    // Total for doc-1: 5+20+5+5+20+25+5 = 85... need more to reach ~485
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(45, 21, 0), refundEligibleAt: makeDate(44), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(40, 20, 0), refundEligibleAt: makeDate(39), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(38, 23, 0), refundEligibleAt: makeDate(37), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(35, 22, 30), refundEligibleAt: makeDate(34), doctorRespondedIn30Min: false },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(32, 21, 0), refundEligibleAt: makeDate(31), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(28, 20, 0), refundEligibleAt: makeDate(27), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(22, 22, 0), refundEligibleAt: makeDate(21), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(20, 19, 0), refundEligibleAt: makeDate(19), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(16, 23, 0), refundEligibleAt: makeDate(15), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(14, 21, 0), refundEligibleAt: makeDate(13), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(12, 22, 30), refundEligibleAt: makeDate(11), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(9, 20, 0), refundEligibleAt: makeDate(8), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(7, 23, 0), refundEligibleAt: makeDate(6), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'export_chat', amountGEL: 25, status: 'succeeded', createdAt: makeDate(6, 10, 0), refundEligibleAt: makeDate(5), doctorRespondedIn30Min: false },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(4, 21, 0), refundEligibleAt: makeDate(3), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(2, 19, 30), refundEligibleAt: makeDate(1), doctorRespondedIn30Min: true },
    // Running total: 85 + 20+20+5+20+5+20+5+20+5+20+5+25+5+20 = 85+195 = 280... need more
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(55, 21, 0), refundEligibleAt: makeDate(54), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(52, 20, 0), refundEligibleAt: makeDate(51), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(48, 22, 0), refundEligibleAt: makeDate(47), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(46, 23, 0), refundEligibleAt: makeDate(45), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(42, 21, 30), refundEligibleAt: makeDate(41), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(36, 22, 0), refundEligibleAt: makeDate(35), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(33, 20, 0), refundEligibleAt: makeDate(32), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(26, 23, 0), refundEligibleAt: makeDate(25), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(24, 21, 0), refundEligibleAt: makeDate(23), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_message', amountGEL: 5, status: 'succeeded', createdAt: makeDate(11, 22, 0), refundEligibleAt: makeDate(10), doctorRespondedIn30Min: true },
    // Total now: 280 + 20+20+20+5+20+5+20+5+20+5 = 280+140 = 420... need ~65 more
    { id: generateId(), payerUid: 'pat-4', doctorUid: 'doc-1', conversationId: 'conv-3', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(60, 21, 0), refundEligibleAt: makeDate(59), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-1', doctorUid: 'doc-1', conversationId: 'conv-1', type: 'after_hours_call', amountGEL: 20, status: 'succeeded', createdAt: makeDate(58, 20, 0), refundEligibleAt: makeDate(57), doctorRespondedIn30Min: true },
    { id: generateId(), payerUid: 'pat-2', doctorUid: 'doc-1', conversationId: 'conv-2', type: 'export_chat', amountGEL: 25, status: 'succeeded', createdAt: makeDate(50, 10, 0), refundEligibleAt: makeDate(49), doctorRespondedIn30Min: false },
    // Total: 420 + 20+20+25 = 485
  ];

  localStorage.setItem('medlink_users', JSON.stringify([doctor1, doctor2, assistant1, ...patients]));
  localStorage.setItem('medlink_conversations', JSON.stringify(conversations));
  localStorage.setItem('medlink_messages', JSON.stringify(messages));
  localStorage.setItem('medlink_connections', JSON.stringify(connections));
  localStorage.setItem('medlink_timeline_events', JSON.stringify(timelineEvents));
  localStorage.setItem('medlink_payments', JSON.stringify(payments));
  localStorage.setItem('medlink_schema_version', SCHEMA_VERSION.toString());
};

import { mockDoctors } from './mockDoctors';
import { seededRandom, randomInt, pickRandom } from './generators';

const rand = seededRandom(77);

// Realistic medications used in Georgian clinics
const medications: { name: string; nameKa: string; category: string; categoryKa: string }[] = [
  { name: 'Lisinopril', nameKa: 'ლიზინოპრილი', category: 'Cardiovascular', categoryKa: 'კარდიოვასკულარული' },
  { name: 'Amlodipine', nameKa: 'ამლოდიპინი', category: 'Cardiovascular', categoryKa: 'კარდიოვასკულარული' },
  { name: 'Atorvastatin', nameKa: 'ატორვასტატინი', category: 'Cardiovascular', categoryKa: 'კარდიოვასკულარული' },
  { name: 'Aspirin', nameKa: 'ასპირინი', category: 'Cardiovascular', categoryKa: 'კარდიოვასკულარული' },
  { name: 'Clopidogrel', nameKa: 'კლოპიდოგრელი', category: 'Cardiovascular', categoryKa: 'კარდიოვასკულარული' },
  { name: 'Metformin', nameKa: 'მეტფორმინი', category: 'Endocrine', categoryKa: 'ენდოკრინული' },
  { name: 'Insulin Glargine', nameKa: 'ინსულინ გლარგინი', category: 'Endocrine', categoryKa: 'ენდოკრინული' },
  { name: 'Levothyroxine', nameKa: 'ლევოთიროქსინი', category: 'Endocrine', categoryKa: 'ენდოკრინული' },
  { name: 'Omeprazole', nameKa: 'ომეპრაზოლი', category: 'GI', categoryKa: 'გასტროენტეროლოგიური' },
  { name: 'Pantoprazole', nameKa: 'პანტოპრაზოლი', category: 'GI', categoryKa: 'გასტროენტეროლოგიური' },
  { name: 'Ibuprofen', nameKa: 'იბუპროფენი', category: 'Pain/Anti-inflammatory', categoryKa: 'ტკივილგამაყუჩებელი' },
  { name: 'Paracetamol', nameKa: 'პარაცეტამოლი', category: 'Pain/Anti-inflammatory', categoryKa: 'ტკივილგამაყუჩებელი' },
  { name: 'Diclofenac', nameKa: 'დიკლოფენაკი', category: 'Pain/Anti-inflammatory', categoryKa: 'ტკივილგამაყუჩებელი' },
  { name: 'Amoxicillin', nameKa: 'ამოქსიცილინი', category: 'Antibiotics', categoryKa: 'ანტიბიოტიკები' },
  { name: 'Azithromycin', nameKa: 'აზითრომიცინი', category: 'Antibiotics', categoryKa: 'ანტიბიოტიკები' },
  { name: 'Ciprofloxacin', nameKa: 'ციპროფლოქსაცინი', category: 'Antibiotics', categoryKa: 'ანტიბიოტიკები' },
  { name: 'Prednisolone', nameKa: 'პრედნიზოლონი', category: 'Corticosteroids', categoryKa: 'კორტიკოსტეროიდები' },
  { name: 'Salbutamol', nameKa: 'სალბუტამოლი', category: 'Respiratory', categoryKa: 'რესპირატორული' },
  { name: 'Montelukast', nameKa: 'მონტელუკასტი', category: 'Respiratory', categoryKa: 'რესპირატორული' },
  { name: 'Loratadine', nameKa: 'ლორატადინი', category: 'Allergy', categoryKa: 'ალერგიის საწინააღმდეგო' },
  { name: 'Cetirizine', nameKa: 'ცეტირიზინი', category: 'Allergy', categoryKa: 'ალერგიის საწინააღმდეგო' },
  { name: 'Metoprolol', nameKa: 'მეტოპროლოლი', category: 'Cardiovascular', categoryKa: 'კარდიოვასკულარული' },
  { name: 'Gabapentin', nameKa: 'გაბაპენტინი', category: 'Neurological', categoryKa: 'ნევროლოგიური' },
  { name: 'Sertraline', nameKa: 'სერტრალინი', category: 'Neurological', categoryKa: 'ნევროლოგიური' },
];

// Lab tests & analyses
const labTests: { name: string; nameKa: string; category: string; categoryKa: string }[] = [
  { name: 'Complete Blood Count', nameKa: 'სრული სისხლის ანალიზი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Blood Glucose', nameKa: 'სისხლის შაქარი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'HbA1c', nameKa: 'გლიკირებული ჰემოგლობინი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Lipid Panel', nameKa: 'ლიპიდური პანელი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Thyroid Panel (TSH, T3, T4)', nameKa: 'ფარისებრი ჯირკვლის პანელი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Liver Function Tests', nameKa: 'ღვიძლის ფუნქციის ტესტი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Kidney Function (Creatinine)', nameKa: 'თირკმლის ფუნქცია (კრეატინინი)', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Urinalysis', nameKa: 'შარდის ანალიზი', category: 'Urine', categoryKa: 'შარდის' },
  { name: 'Chest X-Ray', nameKa: 'გულმკერდის რენტგენი', category: 'Imaging', categoryKa: 'ვიზუალიზაცია' },
  { name: 'Abdominal Ultrasound', nameKa: 'მუცლის ულტრაბგერა', category: 'Imaging', categoryKa: 'ვიზუალიზაცია' },
  { name: 'ECG', nameKa: 'ელექტროკარდიოგრამა', category: 'Cardiac', categoryKa: 'კარდიოლოგიური' },
  { name: 'Echocardiography', nameKa: 'ეხოკარდიოგრაფია', category: 'Cardiac', categoryKa: 'კარდიოლოგიური' },
  { name: 'CT Scan', nameKa: 'კომპიუტერული ტომოგრაფია', category: 'Imaging', categoryKa: 'ვიზუალიზაცია' },
  { name: 'MRI', nameKa: 'მაგნიტურ-რეზონანსული ტომოგრაფია', category: 'Imaging', categoryKa: 'ვიზუალიზაცია' },
  { name: 'Allergy Panel', nameKa: 'ალერგიის პანელი', category: 'Immunology', categoryKa: 'იმუნოლოგიური' },
  { name: 'Vitamin D', nameKa: 'ვიტამინი D', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Iron Studies', nameKa: 'რკინის ანალიზი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'PSA Test', nameKa: 'PSA ტესტი', category: 'Blood', categoryKa: 'სისხლის' },
  { name: 'Bone Densitometry', nameKa: 'ძვლის დენსიტომეტრია', category: 'Imaging', categoryKa: 'ვიზუალიზაცია' },
  { name: 'Spirometry', nameKa: 'სპირომეტრია', category: 'Pulmonary', categoryKa: 'პულმონოლოგიური' },
];

// Generate prescriptions per doctor (top 20 active doctors)
const activeDoctors = mockDoctors.filter(d => d.status === 'active').slice(0, 20);

export interface DoctorPrescription {
  doctorId: string;
  doctorName: { ka: string; en: string };
  specialty: string;
  specialtyEn: string;
  medication: string;
  medicationKa: string;
  category: string;
  categoryKa: string;
  count: number;
}

export interface DoctorLabOrder {
  doctorId: string;
  doctorName: { ka: string; en: string };
  specialty: string;
  specialtyEn: string;
  test: string;
  testKa: string;
  category: string;
  categoryKa: string;
  count: number;
}

export interface PrescriptionTrend {
  month: string;
  monthKa: string;
  prescriptions: number;
  labOrders: number;
}

// Generate prescription records
export const mockDoctorPrescriptions: DoctorPrescription[] = [];
activeDoctors.forEach(doc => {
  // Each doctor prescribes 4-10 different medications
  const numMeds = randomInt(4, 10, rand);
  const usedIndices = new Set<number>();
  for (let j = 0; j < numMeds; j++) {
    let idx: number;
    do { idx = Math.floor(rand() * medications.length); } while (usedIndices.has(idx));
    usedIndices.add(idx);
    const med = medications[idx];
    mockDoctorPrescriptions.push({
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      specialtyEn: doc.specialtyEn,
      medication: med.name,
      medicationKa: med.nameKa,
      category: med.category,
      categoryKa: med.categoryKa,
      count: randomInt(5, 120, rand),
    });
  }
});

// Generate lab/analysis orders
export const mockDoctorLabOrders: DoctorLabOrder[] = [];
activeDoctors.forEach(doc => {
  const numTests = randomInt(3, 8, rand);
  const usedIndices = new Set<number>();
  for (let j = 0; j < numTests; j++) {
    let idx: number;
    do { idx = Math.floor(rand() * labTests.length); } while (usedIndices.has(idx));
    usedIndices.add(idx);
    const test = labTests[idx];
    mockDoctorLabOrders.push({
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      specialtyEn: doc.specialtyEn,
      test: test.name,
      testKa: test.nameKa,
      category: test.category,
      categoryKa: test.categoryKa,
      count: randomInt(3, 80, rand),
    });
  }
});

// Aggregate: top medications across clinic
export const mockTopMedications = medications.map(med => {
  const total = mockDoctorPrescriptions
    .filter(p => p.medication === med.name)
    .reduce((s, p) => s + p.count, 0);
  return { name: med.name, nameKa: med.nameKa, category: med.category, categoryKa: med.categoryKa, total };
}).filter(m => m.total > 0).sort((a, b) => b.total - a.total);

// Aggregate: top lab tests across clinic
export const mockTopLabTests = labTests.map(test => {
  const total = mockDoctorLabOrders
    .filter(o => o.test === test.name)
    .reduce((s, o) => s + o.count, 0);
  return { name: test.name, nameKa: test.nameKa, category: test.category, categoryKa: test.categoryKa, total };
}).filter(t => t.total > 0).sort((a, b) => b.total - a.total);

// Aggregate: prescriptions by category
export const mockMedicationCategories = (() => {
  const map = new Map<string, { category: string; categoryKa: string; total: number }>();
  mockDoctorPrescriptions.forEach(p => {
    const existing = map.get(p.category);
    if (existing) {
      existing.total += p.count;
    } else {
      map.set(p.category, { category: p.category, categoryKa: p.categoryKa, total: p.count });
    }
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
})();

// Aggregate: lab orders by category
export const mockLabCategories = (() => {
  const map = new Map<string, { category: string; categoryKa: string; total: number }>();
  mockDoctorLabOrders.forEach(o => {
    const existing = map.get(o.category);
    if (existing) {
      existing.total += o.count;
    } else {
      map.set(o.category, { category: o.category, categoryKa: o.categoryKa, total: o.count });
    }
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
})();

// Aggregate: prescriptions per doctor (total count)
export const mockPrescriptionsPerDoctor = activeDoctors.map(doc => {
  const rxCount = mockDoctorPrescriptions.filter(p => p.doctorId === doc.id).reduce((s, p) => s + p.count, 0);
  const labCount = mockDoctorLabOrders.filter(o => o.doctorId === doc.id).reduce((s, o) => s + o.count, 0);
  const uniqueMeds = mockDoctorPrescriptions.filter(p => p.doctorId === doc.id).length;
  return {
    doctorId: doc.id,
    doctorName: doc.name,
    specialty: doc.specialty,
    specialtyEn: doc.specialtyEn,
    totalPrescriptions: rxCount,
    totalLabOrders: labCount,
    uniqueMedications: uniqueMeds,
    activePatients: doc.activePatients,
  };
}).sort((a, b) => b.totalPrescriptions - a.totalPrescriptions);

// Monthly trend (last 6 months)
const monthNames = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const monthNamesKa = ['ოქტ', 'ნოე', 'დეკ', 'იან', 'თებ', 'მარ'];
export const mockPrescriptionTrend: PrescriptionTrend[] = monthNames.map((m, i) => ({
  month: m,
  monthKa: monthNamesKa[i],
  prescriptions: randomInt(300, 600, rand),
  labOrders: randomInt(150, 400, rand),
}));

// Summary stats
export const mockPrescriptionSummary = {
  totalPrescriptions: mockDoctorPrescriptions.reduce((s, p) => s + p.count, 0),
  uniqueMedications: new Set(mockDoctorPrescriptions.map(p => p.medication)).size,
  totalLabOrders: mockDoctorLabOrders.reduce((s, o) => s + o.count, 0),
  uniqueLabTests: new Set(mockDoctorLabOrders.map(o => o.test)).size,
  prescribingDoctors: activeDoctors.length,
};

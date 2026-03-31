import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  mockTopMedications, mockTopLabTests, mockMedicationCategories, mockLabCategories,
  mockPrescriptionsPerDoctor, mockPrescriptionTrend, mockPrescriptionSummary,
  mockDoctorPrescriptions, mockDoctorLabOrders,
} from '@/dashboard/data/mockPrescriptions';
import { COLORS } from '@/dashboard/utils/colors';
import { formatNumber } from '@/dashboard/utils/formatters';
import { ChartCard } from '@/dashboard/components/ChartCard';

const tabKeys = ['prescriptions', 'lab_orders'] as const;
type Tab = typeof tabKeys[number];

const translations = {
  ka: {
    prescriptions_orders: 'დანიშნულებები და კვლევები',
    prescriptions: 'მედიკამენტები',
    lab_orders: 'კვლევები / ანალიზები',
    total_prescriptions: 'სულ დანიშნულებები',
    unique_medications: 'უნიკალური მედიკამენტები',
    total_lab_orders: 'სულ კვლევები',
    unique_lab_tests: 'უნიკალური კვლევები',
    prescribing_doctors: 'მნიშვნელი ექიმები',
    top_medications: 'ყველაზე ხშირი მედიკამენტები',
    top_lab_tests: 'ყველაზე ხშირი კვლევები',
    med_categories: 'კატეგორიებით',
    lab_categories: 'კვლევების კატეგორიები',
    by_doctor: 'ექიმების მიხედვით',
    doctor: 'ექიმი',
    specialty: 'სპეციალობა',
    total_rx: 'დანიშნულებები',
    total_labs: 'კვლევები',
    unique_meds: 'უნიკ. მედიკ.',
    patients: 'პაციენტები',
    monthly_trend: 'ყოველთვიური ტრენდი',
    medication: 'მედიკამენტი',
    test: 'კვლევა',
    count: 'რაოდენობა',
    category: 'კატეგორია',
    search_doctor: 'ექიმის ძიება...',
    details_for: 'დეტალები:',
    top_meds_for: 'ტოპ მედიკამენტები',
    top_labs_for: 'ტოპ კვლევები',
    back: 'უკან',
    last_6_months: 'ბოლო 6 თვე',
  },
  en: {
    prescriptions_orders: 'Prescriptions & Orders',
    prescriptions: 'Medications',
    lab_orders: 'Lab Tests / Analyses',
    total_prescriptions: 'Total Prescriptions',
    unique_medications: 'Unique Medications',
    total_lab_orders: 'Total Lab Orders',
    unique_lab_tests: 'Unique Tests',
    prescribing_doctors: 'Prescribing Doctors',
    top_medications: 'Most Prescribed Medications',
    top_lab_tests: 'Most Ordered Tests',
    med_categories: 'By Category',
    lab_categories: 'Test Categories',
    by_doctor: 'By Doctor',
    doctor: 'Doctor',
    specialty: 'Specialty',
    total_rx: 'Prescriptions',
    total_labs: 'Lab Orders',
    unique_meds: 'Unique Meds',
    patients: 'Patients',
    monthly_trend: 'Monthly Trend',
    medication: 'Medication',
    test: 'Test',
    count: 'Count',
    category: 'Category',
    search_doctor: 'Search doctor...',
    details_for: 'Details:',
    top_meds_for: 'Top Medications',
    top_labs_for: 'Top Lab Orders',
    back: 'Back',
    last_6_months: 'Last 6 months',
  },
};

export function PrescriptionsPage() {
  const { lang } = useOutletContext<{ lang: 'ka' | 'en' }>();
  const t = translations[lang];
  const s = mockPrescriptionSummary;

  const [activeTab, setActiveTab] = useState<Tab>('prescriptions');
  const [search, setSearch] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const filteredDoctors = useMemo(() =>
    mockPrescriptionsPerDoctor.filter(d => {
      const name = lang === 'ka' ? d.doctorName.ka : d.doctorName.en;
      return name.toLowerCase().includes(search.toLowerCase());
    }),
    [search, lang]
  );

  const selectedDoctor = selectedDoctorId
    ? mockPrescriptionsPerDoctor.find(d => d.doctorId === selectedDoctorId)
    : null;

  const doctorMeds = selectedDoctorId
    ? mockDoctorPrescriptions.filter(p => p.doctorId === selectedDoctorId).sort((a, b) => b.count - a.count)
    : [];

  const doctorLabs = selectedDoctorId
    ? mockDoctorLabOrders.filter(o => o.doctorId === selectedDoctorId).sort((a, b) => b.count - a.count)
    : [];

  const trendData = mockPrescriptionTrend.map(m => ({
    month: lang === 'ka' ? m.monthKa : m.month,
    [t.prescriptions]: m.prescriptions,
    [t.lab_orders]: m.labOrders,
  }));

  const categoryColors = [COLORS.primary, COLORS.info, COLORS.purple, COLORS.warning, COLORS.danger, COLORS.pink, COLORS.cyan, COLORS.success];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: t.total_prescriptions, value: formatNumber(s.totalPrescriptions), color: 'text-teal-600' },
          { label: t.unique_medications, value: s.uniqueMedications, color: 'text-blue-600' },
          { label: t.total_lab_orders, value: formatNumber(s.totalLabOrders), color: 'text-purple-600' },
          { label: t.unique_lab_tests, value: s.uniqueLabTests, color: 'text-amber-600' },
          { label: t.prescribing_doctors, value: s.prescribingDoctors, color: 'text-slate-700' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm p-3 md:p-5">
            <div className="text-xs md:text-sm text-slate-500">{kpi.label}</div>
            <div className={`text-xl md:text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {tabKeys.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'prescriptions' ? (
        <>
          {/* Top Medications + Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <ChartCard title={t.top_medications} className="lg:col-span-2">
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockTopMedications.slice(0, 12)} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis
                      type="category"
                      dataKey={lang === 'ka' ? 'nameKa' : 'name'}
                      width={100}
                      tick={{ fontSize: 10, fill: '#334155' }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [formatNumber(value), t.count]}
                    />
                    <Bar dataKey="total" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title={t.med_categories}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockMedicationCategories}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={75}
                      dataKey="total" paddingAngle={2}
                    >
                      {mockMedicationCategories.map((_, i) => (
                        <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {mockMedicationCategories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                      <span className="text-slate-600">{lang === 'ka' ? cat.categoryKa : cat.category}</span>
                    </div>
                    <span className="text-slate-800 font-medium">{formatNumber(cat.total)}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      ) : (
        <>
          {/* Top Lab Tests + Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <ChartCard title={t.top_lab_tests} className="lg:col-span-2">
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockTopLabTests.slice(0, 12)} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis
                      type="category"
                      dataKey={lang === 'ka' ? 'nameKa' : 'name'}
                      width={120}
                      tick={{ fontSize: 10, fill: '#334155' }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [formatNumber(value), t.count]}
                    />
                    <Bar dataKey="total" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title={t.lab_categories}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockLabCategories}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={75}
                      dataKey="total" paddingAngle={2}
                    >
                      {mockLabCategories.map((_, i) => (
                        <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {mockLabCategories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                      <span className="text-slate-600">{lang === 'ka' ? cat.categoryKa : cat.category}</span>
                    </div>
                    <span className="text-slate-800 font-medium">{formatNumber(cat.total)}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      )}

      {/* Monthly Trend */}
      <ChartCard title={t.monthly_trend} subtitle={t.last_6_months}>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey={t.prescriptions} stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey={t.lab_orders} stroke={COLORS.purple} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Doctor breakdown table */}
      <ChartCard title={t.by_doctor}>
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search_doctor}
            className="w-full sm:w-64 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {!selectedDoctorId ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs md:text-sm">
                  <th className="pb-3 font-semibold text-slate-600 pr-2">{t.doctor}</th>
                  <th className="pb-3 font-semibold text-slate-600 pr-2 hidden sm:table-cell">{t.specialty}</th>
                  <th className="pb-3 font-semibold text-slate-600 text-right pr-2">{t.total_rx}</th>
                  <th className="pb-3 font-semibold text-slate-600 text-right pr-2">{t.total_labs}</th>
                  <th className="pb-3 font-semibold text-slate-600 text-right pr-2 hidden md:table-cell">{t.unique_meds}</th>
                  <th className="pb-3 font-semibold text-slate-600 text-right">{t.patients}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map(doc => (
                  <tr
                    key={doc.doctorId}
                    onClick={() => setSelectedDoctorId(doc.doctorId)}
                    className="border-b border-slate-100 hover:bg-teal-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-medium text-slate-800 pr-2 text-xs md:text-sm">
                      {lang === 'ka' ? doc.doctorName.ka : doc.doctorName.en}
                    </td>
                    <td className="py-3 text-slate-500 pr-2 hidden sm:table-cell">
                      {lang === 'ka' ? doc.specialty : doc.specialtyEn}
                    </td>
                    <td className="py-3 text-right font-medium text-teal-700 pr-2">{formatNumber(doc.totalPrescriptions)}</td>
                    <td className="py-3 text-right font-medium text-purple-700 pr-2">{formatNumber(doc.totalLabOrders)}</td>
                    <td className="py-3 text-right text-slate-600 pr-2 hidden md:table-cell">{doc.uniqueMedications}</td>
                    <td className="py-3 text-right text-slate-600">{doc.activePatients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Doctor detail drill-down */
          <div>
            <button
              onClick={() => setSelectedDoctorId(null)}
              className="mb-4 text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
            >
              <span>&larr;</span> {t.back}
            </button>

            <div className="mb-3">
              <span className="text-lg font-bold text-slate-800">
                {t.details_for} {lang === 'ka' ? selectedDoctor!.doctorName.ka : selectedDoctor!.doctorName.en}
              </span>
              <span className="ml-2 text-sm text-slate-500">
                ({lang === 'ka' ? selectedDoctor!.specialty : selectedDoctor!.specialtyEn})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Doctor's medications */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">{t.top_meds_for}</h4>
                <div className="space-y-2">
                  {doctorMeds.map(med => {
                    const maxCount = doctorMeds[0]?.count || 1;
                    return (
                      <div key={med.medication} className="flex items-center gap-3">
                        <div className="w-32 text-xs text-slate-700 truncate" title={lang === 'ka' ? med.medicationKa : med.medication}>
                          {lang === 'ka' ? med.medicationKa : med.medication}
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((med.count / maxCount) * 100, 12)}%` }}
                          >
                            <span className="text-[10px] text-white font-medium">{med.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Doctor's lab orders */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">{t.top_labs_for}</h4>
                <div className="space-y-2">
                  {doctorLabs.map(lab => {
                    const maxCount = doctorLabs[0]?.count || 1;
                    return (
                      <div key={lab.test} className="flex items-center gap-3">
                        <div className="w-40 text-xs text-slate-700 truncate" title={lang === 'ka' ? lab.testKa : lab.test}>
                          {lang === 'ka' ? lab.testKa : lab.test}
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((lab.count / maxCount) * 100, 12)}%` }}
                          >
                            <span className="text-[10px] text-white font-medium">{lab.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

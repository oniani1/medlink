import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiUsers, FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import { mockPatientStats } from '@/dashboard/data';
import { COLORS } from '@/dashboard/utils/colors';
import { useDashboardTranslation } from '@/dashboard/utils/translations';
import { formatNumber, formatPercent } from '@/dashboard/utils/formatters';
import { ChartCard } from '@/dashboard/components/ChartCard';
import { KPICard } from '@/dashboard/components/KPICard';
import { EngagementFunnel } from '@/dashboard/components/EngagementFunnel';

export function PatientsPage() {
  const { lang } = useOutletContext<{ lang: 'ka' | 'en' }>();
  const t = useDashboardTranslation(lang);
  const ps = mockPatientStats;

  const trendNewPatients = ((ps.newThisMonth - ps.newLastMonth) / ps.newLastMonth) * 100;

  const funnelStages = [
    { label: t('new_patients'), count: ps.engagementFunnel.new, color: COLORS.info },
    { label: t('connected'), count: ps.engagementFunnel.connected, color: COLORS.cyan },
    { label: t('active_label'), count: ps.engagementFunnel.active, color: COLORS.primary },
    { label: t('dormant'), count: ps.engagementFunnel.dormant, color: COLORS.warning },
    { label: t('churned'), count: ps.engagementFunnel.churned, color: COLORS.danger },
  ];

  const anamnesisData = [
    { name: t('complete'), value: ps.anamnesisCompletion.complete, color: COLORS.success },
    { name: t('partial'), value: ps.anamnesisCompletion.partial, color: COLORS.warning },
    { name: t('not_started'), value: ps.anamnesisCompletion.notStarted, color: COLORS.danger },
  ];
  const anamnesisTotal = ps.anamnesisCompletion.complete + ps.anamnesisCompletion.partial + ps.anamnesisCompletion.notStarted;

  const genderData = [
    { name: t('male'), value: ps.demographics.genderSplit.male, color: COLORS.info },
    { name: t('female'), value: ps.demographics.genderSplit.female, color: COLORS.pink },
  ];

  const satisfactionLabels = ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'];
  const satisfactionData = ps.satisfactionDistribution.map((count, i) => ({
    label: satisfactionLabels[i],
    count,
    color: i < 2 ? COLORS.danger : i === 2 ? COLORS.warning : COLORS.success,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          icon={FiUsers}
          label={t('total_patients')}
          value={formatNumber(ps.total)}
          color={COLORS.primary}
        />
        <KPICard
          icon={FiUserPlus}
          label={t('new_patients')}
          value={formatNumber(ps.newThisMonth)}
          trend={{ value: `+${trendNewPatients.toFixed(1)}%`, positive: true }}
          color={COLORS.info}
        />
        <KPICard
          icon={FiUserCheck}
          label={t('active_label')}
          value={formatNumber(ps.activeThisWeek)}
          sparkData={ps.weeklyEngagement}
          color={COLORS.success}
        />
        <KPICard
          icon={FiUserX}
          label={t('churned')}
          value={formatNumber(ps.engagementFunnel.churned)}
          color={COLORS.danger}
        />
      </div>

      {/* Engagement Funnel */}
      <ChartCard title={t('patient_engagement')}>
        <EngagementFunnel stages={funnelStages} />
      </ChartCard>

      {/* Demographics + Anamnesis */}
      <div className="grid grid-cols-3 gap-4">
        {/* Age Groups */}
        <ChartCard title={t('age_groups')}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ps.demographics.ageGroups} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Gender + Top Conditions */}
        <ChartCard title={t('demographics')}>
          <div className="flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {genderData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-sm">
            {genderData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600">{d.name}: {formatNumber(d.value)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">{t('top_conditions')}</div>
            <div className="space-y-1.5">
              {ps.demographics.topConditions.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{lang === 'ka' ? c.nameKa : c.name}</span>
                  <span className="text-slate-500 font-medium">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Anamnesis Completion */}
        <ChartCard title={t('anamnesis_completion')}>
          <div className="flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={anamnesisData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {anamnesisData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {anamnesisData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="text-slate-700 font-medium">
                  {formatNumber(d.value)} ({formatPercent((d.value / anamnesisTotal) * 100, 0)})
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Satisfaction + New Patients Trend */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title={t('satisfaction_dist')}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={satisfactionData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {satisfactionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title={t('new_patients')} subtitle={lang === 'ka' ? 'ბოლო 4 თვე' : 'Last 4 Months'}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ps.monthlyNewPatients} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="newPatientsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.info} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.info} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={lang === 'ka' ? 'monthKa' : 'month'} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke={COLORS.info} fill="url(#newPatientsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { FiTrendingUp, FiClock } from 'react-icons/fi';

import { mockFinancial } from '@/dashboard/data';
import { formatCurrency, formatNumber } from '@/dashboard/utils/formatters';
import { COLORS } from '@/dashboard/utils/colors';
import { useDashboardTranslation } from '@/dashboard/utils/translations';
import { KPICard } from '@/dashboard/components/KPICard';
import { ChartCard } from '@/dashboard/components/ChartCard';

const breakdownColors = [
  COLORS.primary,  // anamnesis
  COLORS.info,     // no-show
  COLORS.purple,   // after-hours
  '#f59e0b',       // chronic (amber)
  COLORS.success,  // admin
];

const pieColors = [COLORS.primary, COLORS.info, COLORS.purple];

export function FinancialPage() {
  const { lang } = useOutletContext<{ lang: 'ka' | 'en' }>();
  const t = useDashboardTranslation(lang);

  const { roi, projectedVsActual, afterHoursBreakdown, doctorRevenue } = mockFinancial;

  const roiMultiplier = Math.round(roi.totalMonthlySavings / roi.subscriptionCost);

  const breakdownItems = useMemo(() => [
    { key: 'anamnesis_savings' as const, value: roi.anamnesisSavings, color: breakdownColors[0] },
    { key: 'no_show_reduction' as const, value: roi.noShowReduction, color: breakdownColors[1] },
    { key: 'after_hours_revenue' as const, value: roi.afterHoursRevenue, color: breakdownColors[2] },
    { key: 'chronic_care' as const, value: roi.chronicCareRecovery, color: breakdownColors[3] },
    { key: 'admin_savings' as const, value: roi.adminSavings, color: breakdownColors[4] },
  ], []);

  // Projected vs Actual chart data
  const projActualData = useMemo(() => {
    return projectedVsActual.map(item => ({
      month: lang === 'ka' ? item.monthKa : item.month,
      [lang === 'ka' ? 'გეგმა' : 'Projected']: item.projected,
      [lang === 'ka' ? 'რეალობა' : 'Actual']: item.actual,
    }));
  }, [lang]);

  const projectedKey = lang === 'ka' ? 'გეგმა' : 'Projected';
  const actualKey = lang === 'ka' ? 'რეალობა' : 'Actual';

  // Pie chart data for after-hours breakdown
  const pieData = useMemo(() => [
    { name: t('messages_label'), value: afterHoursBreakdown.messageEarnings },
    { name: t('calls'), value: afterHoursBreakdown.callEarnings },
    { name: t('exports'), value: afterHoursBreakdown.exportEarnings },
  ], [lang]);

  // Doctor revenue chart data (horizontal bar)
  const doctorRevenueData = useMemo(() => {
    return doctorRevenue.slice(0, 15).map(d => ({
      name: d.name.length > 18 ? d.name.slice(0, 16) + '...' : d.name,
      fullName: d.name,
      revenue: d.revenue,
    }));
  }, []);

  // Weekly trend sparkline for after-hours
  const weeklyTrendData = useMemo(() => {
    return afterHoursBreakdown.weeklyTrend.map((v, i) => ({ week: i + 1, value: v }));
  }, []);

  // KPI card sparklines from monthly ROI
  const savingsSpark = mockFinancial.monthlyROI.map(m => m.savings);
  const revenueSpark = mockFinancial.monthlyROI.map(m => m.revenue);

  return (
    <div className="space-y-6">
      {/* Row 1: ROI Summary — Full Width */}
      <div className="rounded-xl shadow-sm overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #14b8a6 100%)',
      }}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <div>
              <p className="text-teal-200 text-sm font-medium mb-1">
                {t('roi_this_month')}
              </p>
              <div className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                {formatCurrency(roi.totalMonthlySavings)}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm">
                <span className="text-teal-100">{t('subscription_cost')}: {formatCurrency(roi.subscriptionCost)}{t('per_month')}</span>
                <span className="text-white font-bold">|</span>
                <span className="text-white font-bold text-base md:text-lg">ROI: {roiMultiplier}x</span>
              </div>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3">
            {breakdownItems.map((item) => {
              const pct = (item.value / roi.totalMonthlySavings) * 100;
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-teal-100 font-medium">{t(item.key)}</span>
                    <span className="text-white font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color === COLORS.primary ? '#fff' : item.color,
                        opacity: item.color === COLORS.primary ? 0.9 : 0.85,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Projected vs Actual + After-Hours Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Projected vs Actual */}
        <ChartCard
          title={t('projected_vs_actual')}
          subtitle={lang === 'ka' ? 'ბოლო 4 თვე' : 'Last 4 months'}
        >
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projActualData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  tickFormatter={(v: number) => `₾${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey={projectedKey}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 3, fill: '#94a3b8', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey={actualKey}
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.primary, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* After-Hours Revenue */}
        <ChartCard
          title={t('after_hours_detail')}
          subtitle={`${lang === 'ka' ? 'სულ' : 'Total'}: ${formatCurrency(afterHoursBreakdown.totalEarnings)}`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            {/* Donut chart */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {pieData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pieColors[idx] }}
                    />
                    <span className="text-sm text-slate-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly trend mini chart */}
          <div className="border-t border-slate-100 pt-3 mt-2">
            <p className="text-xs text-slate-500 mb-2">
              {lang === 'ka' ? 'კვირის ტრენდი' : 'Weekly Trend'}
            </p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gradWeeklyTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.primary}
                    strokeWidth={1.5}
                    fill="url(#gradWeeklyTrend)"
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), t('revenue')]}
                    labelFormatter={(label: number) => `${t('week')} ${label}`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Revenue by Doctor (Top 15) — Full Width */}
      <ChartCard
        title={t('revenue_per_doctor')}
        subtitle={lang === 'ka' ? 'ტოპ 15 ექიმი არასამუშაო შემოსავლით' : 'Top 15 doctors by after-hours revenue'}
      >
        <div className="overflow-x-auto" style={{ height: Math.max(350, doctorRevenueData.length * 32) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={doctorRevenueData}
              layout="vertical"
              margin={{ top: 5, right: 50, bottom: 5, left: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `₾${v}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [formatCurrency(value), t('revenue')]}
                labelFormatter={(label: string) => label}
              />
              <Bar
                dataKey="revenue"
                fill={COLORS.primary}
                radius={[0, 4, 4, 0]}
                barSize={20}
                label={{
                  position: 'right',
                  fill: '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                  formatter: (v: number) => `₾${v}`,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Row 4: 4 small KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          icon={FiTrendingUp}
          label={t('total_revenue')}
          value={formatCurrency(afterHoursBreakdown.totalEarnings)}
          sparkData={revenueSpark}
          color={COLORS.primary}
        />
        <KPICard
          icon={FiTrendingUp}
          label={t('money_saved')}
          value={formatCurrency(roi.totalMonthlySavings)}
          sparkData={savingsSpark}
          color={COLORS.success}
        />
        <KPICard
          icon={FiClock}
          label={t('subscription_cost')}
          value={formatCurrency(roi.subscriptionCost)}
          color={COLORS.info}
        />
        <KPICard
          icon={FiTrendingUp}
          label={`${lang === 'ka' ? 'წმინდა' : 'Net'} ROI`}
          value={`${roiMultiplier}x`}
          trend={{ value: `+${roiMultiplier}x`, positive: true }}
          color={COLORS.purple}
        />
      </div>
    </div>
  );
}

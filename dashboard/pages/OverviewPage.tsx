import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import { FiUsers, FiUserCheck, FiMessageSquare, FiClock, FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';

import { mockDoctors, mockPatientStats, mockAnalytics, mockFinancial } from '@/dashboard/data';
import { formatCurrency, formatNumber, formatMinutes, formatTrend } from '@/dashboard/utils/formatters';
import { COLORS } from '@/dashboard/utils/colors';
import { useDashboardTranslation } from '@/dashboard/utils/translations';
import { KPICard } from '@/dashboard/components/KPICard';
import { ChartCard } from '@/dashboard/components/ChartCard';

interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info';
  text: { ka: string; en: string };
}

const alerts: AlertItem[] = [
  {
    id: 'a1',
    type: 'warning',
    text: {
      ka: '5 ექიმს საშუალო პასუხის დრო >30 წთ',
      en: '5 doctors with avg response time >30min',
    },
  },
  {
    id: 'a2',
    type: 'danger',
    text: {
      ka: '12 პაციენტს ანამნეზი არასრულია >30 დღე',
      en: '12 patients with incomplete anamnesis >30 days',
    },
  },
  {
    id: 'a3',
    type: 'warning',
    text: {
      ka: '8 კავშირის მოთხოვნა ელოდება >7 დღე',
      en: '8 connection requests pending >7 days',
    },
  },
  {
    id: 'a4',
    type: 'info',
    text: {
      ka: '23 ქრონიკული პაციენტი კონტაქტის გარეშე 60+ დღე',
      en: '23 chronic patients without contact in 60+ days',
    },
  },
  {
    id: 'a5',
    type: 'info',
    text: {
      ka: 'შაბათ-კვირა არასამუშაო საათებში: მხოლოდ 3 ექიმი',
      en: 'Weekend after-hours coverage: only 3 doctors available',
    },
  },
];

function getAlertIcon(type: AlertItem['type']) {
  switch (type) {
    case 'warning':
      return FiAlertTriangle;
    case 'danger':
      return FiAlertCircle;
    case 'info':
      return FiInfo;
  }
}

function getAlertStyles(type: AlertItem['type']) {
  switch (type) {
    case 'warning':
      return { bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' };
    case 'danger':
      return { bg: 'bg-red-50', text: 'text-red-700', iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700' };
    case 'info':
      return { bg: 'bg-blue-50', text: 'text-blue-700', iconColor: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' };
  }
}

export function OverviewPage() {
  const { lang } = useOutletContext<{ lang: 'ka' | 'en' }>();
  const t = useDashboardTranslation(lang);

  // KPI calculations
  const totalDoctors = mockDoctors.length;
  const activeDoctorsThisMonth = mockDoctors.filter(d => d.status === 'active').length;
  const activeDoctorsLastMonth = Math.max(1, activeDoctorsThisMonth - 2);
  const doctorTrend = formatTrend(activeDoctorsThisMonth, activeDoctorsLastMonth);

  const totalPatients = mockPatientStats.total;
  const patientTrend = formatTrend(mockPatientStats.newThisMonth, mockPatientStats.newLastMonth);

  const totalMessagesThisWeek = mockDoctors.reduce((sum, d) => sum + d.messagesThisWeek, 0);
  const totalMessagesLastWeek = mockDoctors.reduce((sum, d) => sum + d.messagesLastWeek, 0);
  const messageTrend = formatTrend(totalMessagesThisWeek, totalMessagesLastWeek);

  const avgResponseTime = Math.round(
    mockDoctors.reduce((sum, d) => sum + d.avgResponseTimeMin, 0) / mockDoctors.length
  );
  // Lower response time is better, so invert the positivity
  const avgResponseLast = avgResponseTime + 3;
  const responseTrend = formatTrend(avgResponseLast, avgResponseTime);

  // Sparkline data: aggregate weekly message totals across all doctors
  const weeklyMessageSpark = useMemo(() => {
    const weeks = mockDoctors[0]?.weeklyMessageHistory.length || 16;
    const totals: number[] = [];
    for (let w = 0; w < weeks; w++) {
      totals.push(mockDoctors.reduce((sum, d) => sum + (d.weeklyMessageHistory[w] || 0), 0));
    }
    return totals;
  }, []);

  // Last 28 days of daily messages for the chart
  const last28Days = useMemo(() => {
    return mockAnalytics.dailyMessages.slice(-28);
  }, []);

  // ROI breakdown items
  const roiBreakdown = useMemo(() => [
    { label: t('anamnesis_savings'), value: mockFinancial.roi.anamnesisSavings, color: COLORS.primary },
    { label: t('no_show_reduction'), value: mockFinancial.roi.noShowReduction, color: COLORS.info },
    { label: t('after_hours_revenue'), value: mockFinancial.roi.afterHoursRevenue, color: COLORS.purple },
    { label: t('chronic_care'), value: mockFinancial.roi.chronicCareRecovery, color: COLORS.warning },
    { label: t('admin_savings'), value: mockFinancial.roi.adminSavings, color: COLORS.success },
  ], [lang]);

  const roiMultiplier = Math.round(mockFinancial.roi.totalMonthlySavings / mockFinancial.roi.subscriptionCost);

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          icon={FiUsers}
          label={t('total_doctors')}
          value={String(totalDoctors)}
          trend={doctorTrend}
          sparkData={weeklyMessageSpark.slice(-8)}
          color={COLORS.primary}
        />
        <KPICard
          icon={FiUserCheck}
          label={t('total_patients')}
          value={formatNumber(totalPatients)}
          trend={patientTrend}
          sparkData={mockPatientStats.weeklyEngagement.slice(-8)}
          color={COLORS.info}
        />
        <KPICard
          icon={FiMessageSquare}
          label={t('messages_this_week')}
          value={formatNumber(totalMessagesThisWeek)}
          trend={messageTrend}
          sparkData={weeklyMessageSpark.slice(-8)}
          color={COLORS.purple}
        />
        <KPICard
          icon={FiClock}
          label={t('avg_response_time')}
          value={formatMinutes(avgResponseTime, lang)}
          trend={responseTrend}
          sparkData={mockAnalytics.responseTimeTrend.slice(-8).map(r => r.avgMinutes)}
          color={COLORS.warning}
        />
      </div>

      {/* Row 2: ROI Counter + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* ROI Card */}
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">{t('roi_this_month')}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('subscription_cost')}: {formatCurrency(mockFinancial.roi.subscriptionCost)}{t('per_month')} | ROI: {roiMultiplier}x
            </p>
          </div>
          <div className="text-3xl font-bold text-teal-600 mb-5">
            {formatCurrency(mockFinancial.roi.totalMonthlySavings)}
          </div>
          <div className="space-y-3">
            {roiBreakdown.map((item) => {
              const pct = (item.value / mockFinancial.roi.totalMonthlySavings) * 100;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">{t('alerts')}</h3>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              const styles = getAlertStyles(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${styles.bg}`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${styles.iconColor}`}>
                    <Icon className="text-base" />
                  </div>
                  <p className={`text-sm leading-snug ${styles.text}`}>
                    {alert.text[lang]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Message Trend + Response Time Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Message Trend (4 Weeks) */}
        <ChartCard
          title={lang === 'ka' ? 'შეტყობინებების ტრენდი (4 კვირა)' : 'Message Trend (4 Weeks)'}
          subtitle={lang === 'ka' ? 'გაგზავნილი + მიღებული' : 'Sent + Received'}
        >
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last28Days} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.info} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.info} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  interval={6}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  labelFormatter={(v: string) => {
                    const d = new Date(v);
                    return d.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
                      month: 'short', day: 'numeric',
                    });
                  }}
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === 'sent' ? t('sent') : t('received'),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stackId="1"
                  stroke={COLORS.info}
                  strokeWidth={2}
                  fill="url(#gradReceived)"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stackId="1"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#gradSent)"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Response Time Trend */}
        <ChartCard
          title={t('response_trend')}
          subtitle={lang === 'ka' ? 'სამიზნე: 20 წთ' : 'Target: 20 min'}
        >
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAnalytics.responseTimeTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  domain={[0, 40]}
                  unit={lang === 'ka' ? ' წთ' : ' min'}
                />
                <ReferenceLine
                  y={20}
                  stroke={COLORS.success}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: t('target'),
                    position: 'right',
                    fill: COLORS.success,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [
                    formatMinutes(value, lang),
                    t('response_time'),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="avgMinutes"
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

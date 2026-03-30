import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend,
} from 'recharts';
import { mockAnalytics } from '@/dashboard/data';
import { COLORS } from '@/dashboard/utils/colors';
import { useDashboardTranslation } from '@/dashboard/utils/translations';
import { formatNumber, formatPercent } from '@/dashboard/utils/formatters';
import { ChartCard } from '@/dashboard/components/ChartCard';
import { HeatmapChart } from '@/dashboard/components/HeatmapChart';

export function AnalyticsPage() {
  const { lang } = useOutletContext<{ lang: 'ka' | 'en' }>();
  const t = useDashboardTranslation(lang);
  const a = mockAnalytics;

  const last28Days = a.dailyMessages.slice(-28);
  const dayLabels = lang === 'ka'
    ? [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')]
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const totalMessages = a.dailyMessages.reduce((s, d) => s + d.sent + d.received, 0);
  const totalVisitReasons = a.visitReasons.reduce((s, v) => s + v.count, 0);

  const apptData = a.appointmentTrend.map(m => ({
    month: lang === 'ka' ? m.monthKa : m.month,
    [t('completed')]: m.completed,
    [t('cancelled')]: m.cancelled,
    [t('no_show')]: m.noShow,
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-slate-500">{lang === 'ka' ? 'სულ შეტყობინებები (4 თვე)' : 'Total Messages (4mo)'}</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(totalMessages)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-slate-500">{t('avg_response_time')}</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{a.responseTimeTrend[a.responseTimeTrend.length - 1].avgMinutes} {t('min')}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-slate-500">{t('appointments')}</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(a.appointmentStats.total)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-slate-500">{t('no_show')} %</div>
          <div className="text-2xl font-bold text-red-500 mt-1">
            {formatPercent((a.appointmentStats.noShow / a.appointmentStats.total) * 100)}
          </div>
        </div>
      </div>

      {/* Message Volume */}
      <ChartCard title={t('message_volume')} subtitle={lang === 'ka' ? 'ბოლო 28 დღე' : 'Last 28 days'}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last28Days} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="recvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.info} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={COLORS.info} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={v => v.slice(5)}
                interval={3}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelFormatter={v => v}
              />
              <Area type="monotone" dataKey="sent" name={t('sent')} stroke={COLORS.primary} fill="url(#sentGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="received" name={t('received')} stroke={COLORS.info} fill="url(#recvGrad)" strokeWidth={2} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Heatmap + Visit Reasons */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title={t('peak_hours')}>
          <HeatmapChart data={a.peakHours} dayLabels={dayLabels} />
        </ChartCard>

        <ChartCard title={t('visit_reasons')}>
          <div className="flex items-center gap-6">
            <div className="h-56 w-56 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={a.visitReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {a.visitReasons.map((v, i) => <Cell key={i} fill={v.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 flex-1">
              {a.visitReasons.map(v => (
                <div key={v.reason} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: v.color }} />
                    <span className="text-slate-700">{lang === 'ka' ? v.reasonKa : v.reason}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{formatPercent((v.count / totalVisitReasons) * 100, 0)}</span>
                    <span className="text-slate-800 font-medium w-12 text-right">{formatNumber(v.count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Response Time + Appointments */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title={t('response_trend')} subtitle={`${t('target')}: 20 ${t('min')}`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.responseTimeTrend} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} interval={1} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <ReferenceLine y={20} stroke={COLORS.success} strokeDasharray="6 3" label={{ value: t('target'), position: 'insideTopRight', fill: COLORS.success, fontSize: 11 }} />
                <Line type="monotone" dataKey="avgMinutes" name={t('avg_response_time')} stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title={t('appointments')} subtitle={lang === 'ka' ? 'ბოლო 4 თვე' : 'Last 4 Months'}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apptData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey={t('completed')} fill={COLORS.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey={t('cancelled')} fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                <Bar dataKey={t('no_show')} fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Appointment summary */}
          <div className="flex justify-between mt-4 pt-3 border-t border-slate-100 text-sm">
            <div className="text-slate-500">{t('completed')}: <span className="text-green-600 font-medium">{formatPercent((a.appointmentStats.completed / a.appointmentStats.total) * 100)}</span></div>
            <div className="text-slate-500">{t('no_show')}: <span className="text-red-500 font-medium">{formatPercent((a.appointmentStats.noShow / a.appointmentStats.total) * 100)}</span></div>
            <div className="text-slate-500">{t('cancelled')}: <span className="text-amber-500 font-medium">{formatPercent((a.appointmentStats.cancelled / a.appointmentStats.total) * 100)}</span></div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

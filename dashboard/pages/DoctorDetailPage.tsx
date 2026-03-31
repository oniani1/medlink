import React from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiMessageSquare, FiClock, FiStar, FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardDoctor } from '@/dashboard/types';
import { mockDoctors } from '@/dashboard/data';
import { formatCurrency, formatNumber, formatMinutes, formatTrend, responseTimeColor, efficiencyColor } from '@/dashboard/utils/formatters';
import { useDashboardTranslation } from '@/dashboard/utils/translations';
import { COLORS } from '@/dashboard/utils/colors';
import { KPICard } from '@/dashboard/components/KPICard';
import { ChartCard } from '@/dashboard/components/ChartCard';

function getInitials(name: string): string {
  return name
    .replace(/^(დრ\.|Dr\.)\s*/i, '')
    .split(' ')
    .map(w => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function CircularProgress({ value, size = 72, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = efficiencyColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
    </div>
  );
}

function ProgressBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold" style={{ color }}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status, lang }: { status: DashboardDoctor['status']; lang: 'ka' | 'en' }) {
  const config: Record<string, { bg: string; text: string; label: { ka: string; en: string } }> = {
    active: { bg: 'bg-green-50', text: 'text-green-700', label: { ka: 'აქტიური', en: 'Active' } },
    away: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: { ka: 'არ არის', en: 'Away' } },
    inactive: { bg: 'bg-slate-100', text: 'text-slate-600', label: { ka: 'არააქტიური', en: 'Inactive' } },
  };
  const c = config[status] || config.inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'active' ? 'bg-green-500' : status === 'away' ? 'bg-yellow-500' : 'bg-slate-400'}`} />
      {c.label[lang]}
    </span>
  );
}

export function DoctorDetailPage() {
  const { lang } = useOutletContext<{ lang: 'ka' | 'en' }>();
  const t = useDashboardTranslation(lang);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const doctor = mockDoctors.find(d => d.id === id);

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FiAlertCircle className="text-2xl text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">
          {lang === 'ka' ? 'ექიმი ვერ მოიძებნა' : 'Doctor not found'}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {lang === 'ka' ? 'მითითებული ID არ არსებობს' : `No doctor with ID "${id}"`}
        </p>
        <button
          onClick={() => navigate('/dashboard/doctors')}
          className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  const initials = getInitials(doctor.name[lang]);
  const trend = formatTrend(doctor.messagesThisWeek, doctor.messagesLastWeek);

  // Chart data: weekly messages (16 weeks)
  const weeklyData = doctor.weeklyMessageHistory.map((val, i) => ({
    name: `${t('week')} ${i + 1}`,
    value: val,
  }));

  // Chart data: monthly revenue (4 months)
  const monthKeys = ['sep', 'oct', 'nov', 'dec'] as const;
  const revenueData = doctor.monthlyRevenue.map((val, i) => ({
    name: t(monthKeys[i]),
    value: val,
  }));

  // Format joined date
  const joinedDate = new Date(doctor.joinedDate);
  const joinedFormatted = lang === 'ka'
    ? `${joinedDate.getDate()}.${String(joinedDate.getMonth() + 1).padStart(2, '0')}.${joinedDate.getFullYear()}`
    : joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top: Back + Doctor Header */}
      <div className="flex items-start gap-3 md:gap-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors mt-1 flex-shrink-0"
        >
          <FiArrowLeft className="text-lg text-slate-600" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Large avatar */}
            <div
              className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: COLORS.primary }}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-slate-800 truncate">{doctor.name[lang]}</h1>
              <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
                <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[11px] md:text-xs font-medium bg-teal-50 text-teal-700">
                  {lang === 'ka' ? doctor.specialty : doctor.specialtyEn}
                </span>
                <StatusBadge status={doctor.status} lang={lang} />
              </div>
            </div>

            {/* Efficiency ring — hidden on very small screens, shown inline on sm+ */}
            <div className="hidden sm:block flex-shrink-0">
              <div className="text-center">
                <CircularProgress value={doctor.efficiencyScore} size={72} />
                <div className="text-[11px] text-slate-500 mt-1 font-medium">{t('efficiency')}</div>
              </div>
            </div>
          </div>

          {/* Efficiency shown below name on small screens */}
          <div className="flex items-center gap-3 mt-3 sm:hidden">
            <CircularProgress value={doctor.efficiencyScore} size={56} />
            <div className="text-xs text-slate-500 font-medium">{t('efficiency')}: {doctor.efficiencyScore}%</div>
          </div>
        </div>
      </div>

      {/* Row 1: 4 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          icon={FiUsers}
          label={t('active_patients')}
          value={formatNumber(doctor.activePatients)}
          color={COLORS.primary}
        />
        <KPICard
          icon={FiMessageSquare}
          label={t('msgs_week')}
          value={formatNumber(doctor.messagesThisWeek)}
          trend={trend}
          sparkData={doctor.weeklyMessageHistory.slice(-8)}
          color={COLORS.info}
        />
        <KPICard
          icon={FiClock}
          label={t('response_time')}
          value={formatMinutes(doctor.avgResponseTimeMin, lang)}
          color={responseTimeColor(doctor.avgResponseTimeMin)}
        />
        <KPICard
          icon={FiStar}
          label={t('satisfaction')}
          value={doctor.satisfactionRating.toFixed(1)}
          color="#f59e0b"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Weekly Messages Bar Chart */}
        <ChartCard title={t('message_volume')}>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(13,148,136,0.05)' }}
                />
                <Bar
                  dataKey="value"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Monthly Revenue Area Chart */}
        <ChartCard title={t('monthly_revenue')}>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v: number) => `${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), t('revenue')]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={{ r: 4, fill: '#fff', stroke: COLORS.primary, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Stats + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Left: Performance Stats */}
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
          <h3 className="text-base font-bold text-slate-800 mb-5">
            {lang === 'ka' ? 'შესრულების მეტრიკები' : 'Performance Metrics'}
          </h3>
          <div className="space-y-5">
            <ProgressBar
              label={t('resolution_rate')}
              value={doctor.resolvedRate}
              color={efficiencyColor(doctor.resolvedRate)}
            />
            <ProgressBar
              label={t('anamnesis_completion')}
              value={doctor.anamnesisCompletionRate * 100}
              color={efficiencyColor(doctor.anamnesisCompletionRate * 100)}
            />

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t('pending_reqs')}</span>
                <span className="text-sm font-semibold text-slate-800">{doctor.pendingRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t('unread_24h')}</span>
                <span className={`text-sm font-semibold ${doctor.unreadOver24h > 3 ? 'text-red-600' : 'text-slate-800'}`}>
                  {doctor.unreadOver24h}
                  {doctor.unreadOver24h > 3 && (
                    <FiAlertCircle className="inline ml-1 text-xs text-red-500" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
          <h3 className="text-base font-bold text-slate-800 mb-5">
            {lang === 'ka' ? 'ინფორმაცია' : 'Information'}
          </h3>
          <div className="space-y-4">
            <InfoRow
              label={lang === 'ka' ? 'რეგისტრაციის თარიღი' : 'Joined'}
              value={joinedFormatted}
            />
            <InfoRow
              label={lang === 'ka' ? 'სულ პაციენტები' : 'Total Patients'}
              value={formatNumber(doctor.totalPatients)}
            />
            <InfoRow
              label={t('after_hours_revenue')}
              value={formatCurrency(doctor.afterHoursRevenue)}
            />
            <InfoRow
              label={lang === 'ka' ? 'განყოფილება' : 'Department'}
              value={doctor.department.charAt(0).toUpperCase() + doctor.department.slice(1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

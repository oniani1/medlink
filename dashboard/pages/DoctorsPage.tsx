import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FiSearch, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiStar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { DashboardDoctor } from '@/dashboard/types';
import { mockDoctors } from '@/dashboard/data';
import { formatMinutes, formatTrend, responseTimeColor, efficiencyColor } from '@/dashboard/utils/formatters';
import { useDashboardTranslation } from '@/dashboard/utils/translations';
import { COLORS } from '@/dashboard/utils/colors';

type SortKey = 'name' | 'specialty' | 'activePatients' | 'messagesThisWeek' | 'avgResponseTimeMin' | 'satisfactionRating' | 'efficiencyScore';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

function getInitials(name: string): string {
  return name
    .replace(/^(დრ\.|Dr\.)\s*/i, '')
    .split(' ')
    .map(w => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StatusDot({ status }: { status: DashboardDoctor['status'] }) {
  const colors: Record<string, string> = {
    active: 'bg-green-400',
    away: 'bg-yellow-400',
    inactive: 'bg-slate-300',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-300'}`} />;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <FiStar
            key={i}
            className="text-xs"
            style={{
              color: i < full ? '#f59e0b' : i === full && partial > 0 ? '#f59e0b' : '#d1d5db',
              fill: i < full ? '#f59e0b' : i === full && partial > 0 ? `url(#star-partial-${Math.round(partial * 100)})` : 'none',
            }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-500 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

export function DoctorsPage() {
  const { lang } = useOutletContext<{ lang: 'ka' | 'en' }>();
  const t = useDashboardTranslation(lang);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  // Unique specialties from data
  const specialties = useMemo(() => {
    const set = new Set<string>();
    mockDoctors.forEach(d => set.add(lang === 'ka' ? d.specialty : d.specialtyEn));
    return Array.from(set).sort();
  }, [lang]);

  // Get internal specialty key for filtering (always match against both languages)
  const filtered = useMemo(() => {
    let docs = [...mockDoctors];

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(
        d => d.name.ka.toLowerCase().includes(q) || d.name.en.toLowerCase().includes(q)
      );
    }

    if (specialtyFilter) {
      docs = docs.filter(
        d => (lang === 'ka' ? d.specialty : d.specialtyEn) === specialtyFilter
      );
    }

    if (statusFilter) {
      docs = docs.filter(d => d.status === statusFilter);
    }

    // Sort
    docs.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name[lang].localeCompare(b.name[lang], lang === 'ka' ? 'ka' : 'en');
          break;
        case 'specialty': {
          const sa = lang === 'ka' ? a.specialty : a.specialtyEn;
          const sb = lang === 'ka' ? b.specialty : b.specialtyEn;
          cmp = sa.localeCompare(sb);
          break;
        }
        case 'activePatients':
          cmp = a.activePatients - b.activePatients;
          break;
        case 'messagesThisWeek':
          cmp = a.messagesThisWeek - b.messagesThisWeek;
          break;
        case 'avgResponseTimeMin':
          cmp = a.avgResponseTimeMin - b.avgResponseTimeMin;
          break;
        case 'satisfactionRating':
          cmp = a.satisfactionRating - b.satisfactionRating;
          break;
        case 'efficiencyScore':
          cmp = a.efficiencyScore - b.efficiencyScore;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return docs;
  }, [search, specialtyFilter, statusFilter, sortKey, sortDir, lang]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  }

  function SortArrow({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-slate-300 ml-1 text-xs"><FiChevronUp /></span>;
    return (
      <span className="ml-1 text-teal-600 text-xs">
        {sortDir === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
      </span>
    );
  }

  // Reset page when filters change
  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };
  const handleSpecialtyChange = (v: string) => { setSpecialtyFilter(v); setPage(0); };
  const handleStatusChange = (v: string) => { setStatusFilter(v); setPage(0); };

  return (
    <div className="space-y-5">
      {/* Page title */}
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">{t('doctors')}</h1>

      {/* Filter Row */}
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder={t('search_doctor')}
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-slate-50 transition-colors"
            />
          </div>

          {/* Specialty dropdown */}
          <select
            value={specialtyFilter}
            onChange={e => handleSpecialtyChange(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-slate-50 appearance-none pr-8 cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="">{t('all_specialties')}</option>
            {specialties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={e => handleStatusChange(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-slate-50 appearance-none pr-8 cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="">{t('all_statuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="away">{t('away')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {([
                  { key: 'name' as SortKey, label: t('doctor_name') },
                  { key: 'specialty' as SortKey, label: t('specialty') },
                  { key: 'activePatients' as SortKey, label: t('active_patients') },
                  { key: 'messagesThisWeek' as SortKey, label: t('msgs_week') },
                  { key: 'avgResponseTimeMin' as SortKey, label: t('response_time') },
                  { key: 'satisfactionRating' as SortKey, label: t('satisfaction') },
                  { key: 'efficiencyScore' as SortKey, label: t('efficiency') },
                ]).map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-2 md:px-4 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none hover:text-teal-700 transition-colors whitespace-nowrap text-xs md:text-sm"
                  >
                    <div className="flex items-center">
                      {col.label}
                      <SortArrow col={col.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {lang === 'ka' ? 'ექიმი ვერ მოიძებნა' : 'No doctors found'}
                  </td>
                </tr>
              ) : (
                paginated.map(doc => {
                  const trend = formatTrend(doc.messagesThisWeek, doc.messagesLastWeek);
                  const initials = getInitials(doc.name[lang]);
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => navigate(`/dashboard/doctors/${doc.id}`)}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {/* Doctor */}
                      <td className="px-2 md:px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: COLORS.primary }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">{doc.name[lang]}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <StatusDot status={doc.status} />
                              <span className="text-xs text-slate-400">{t(doc.status)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {lang === 'ka' ? doc.specialty : doc.specialtyEn}
                      </td>

                      {/* Active Patients */}
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {doc.activePatients}
                      </td>

                      {/* Msgs/Week with trend */}
                      <td className="px-2 md:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 font-medium">{doc.messagesThisWeek}</span>
                          <span
                            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                              trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {trend.positive ? <FiTrendingUp className="text-[9px]" /> : <FiTrendingDown className="text-[9px]" />}
                            {trend.value}
                          </span>
                        </div>
                      </td>

                      {/* Avg Response Time */}
                      <td className="px-2 md:px-4 py-3">
                        <span className="font-medium" style={{ color: responseTimeColor(doc.avgResponseTimeMin) }}>
                          {formatMinutes(doc.avgResponseTimeMin, lang)}
                        </span>
                      </td>

                      {/* Satisfaction */}
                      <td className="px-2 md:px-4 py-3">
                        <StarRating rating={doc.satisfactionRating} />
                      </td>

                      {/* Efficiency */}
                      <td className="px-2 md:px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px] md:min-w-[120px]">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${doc.efficiencyScore}%`,
                                backgroundColor: efficiencyColor(doc.efficiencyScore),
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-semibold min-w-[32px] text-right"
                            style={{ color: efficiencyColor(doc.efficiencyScore) }}
                          >
                            {doc.efficiencyScore}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {lang === 'ka'
                ? `${filtered.length} ექიმიდან ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, filtered.length)}`
                : `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length} doctors`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="text-sm text-slate-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                    i === page
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight className="text-sm text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

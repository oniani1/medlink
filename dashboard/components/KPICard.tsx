import React from 'react';
import { IconType } from 'react-icons';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  icon: IconType;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  sparkData?: number[];
  color?: string;
}

export function KPICard({ icon: Icon, label, value, trend, sparkData, color = '#0d9488' }: KPICardProps) {
  const sparkChartData = sparkData?.map((v, i) => ({ v, i }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Icon + label row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="text-lg" style={{ color }} />
            </div>
            <span className="text-sm text-slate-500 font-medium leading-tight">{label}</span>
          </div>

          {/* Value */}
          <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>

          {/* Trend badge */}
          {trend && (
            <div className="mt-2 inline-flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trend.positive
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {trend.positive ? (
                  <FiTrendingUp className="text-[10px]" />
                ) : (
                  <FiTrendingDown className="text-[10px]" />
                )}
                {trend.value}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {sparkChartData && sparkChartData.length > 1 && (
          <div className="w-24 h-12 flex-shrink-0 ml-3 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#spark-${label.replace(/\s/g, '')})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

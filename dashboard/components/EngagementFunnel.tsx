import React from 'react';
import { FiChevronRight } from 'react-icons/fi';

interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

interface EngagementFunnelProps {
  stages: FunnelStage[];
}

export function EngagementFunnel({ stages }: EngagementFunnelProps) {
  if (stages.length === 0) return null;

  const maxCount = Math.max(...stages.map(s => s.count));

  return (
    <div className="space-y-0">
      {stages.map((stage, i) => {
        const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
        const isLast = i === stages.length - 1;

        return (
          <div key={i}>
            <div className="flex items-center gap-3">
              {/* Bar section */}
              <div className="flex-1 min-w-0">
                {/* Label row */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{stage.label}</span>
                  <span className="text-xs font-bold text-slate-700">{stage.count.toLocaleString()}</span>
                </div>

                {/* Bar */}
                <div className="relative h-8 rounded-lg bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${Math.max(widthPercent, 8)}%`,
                      backgroundColor: stage.color,
                    }}
                  >
                    {widthPercent > 25 && (
                      <span className="text-[11px] font-semibold text-white">
                        {Math.round(widthPercent)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chevron connector between stages */}
            {!isLast && (
              <div className="flex items-center justify-center py-1">
                <FiChevronRight className="text-slate-300 text-sm rotate-90" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

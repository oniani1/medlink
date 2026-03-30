import React, { useState } from 'react';
import { COLORS } from '@/dashboard/utils/colors';

interface HeatmapChartProps {
  data: number[][];
  dayLabels: string[];
  hourLabels?: string[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  day: string;
  hour: string;
  value: number;
}

const defaultHourLabels = Array.from({ length: 24 }, (_, i) => String(i));

function getHeatmapColor(value: number, min: number, max: number): string {
  const scale = COLORS.heatmap;
  if (max === min) return scale[0];
  const normalized = (value - min) / (max - min);
  const index = Math.min(Math.floor(normalized * (scale.length - 1)), scale.length - 1);
  return scale[index];
}

export function HeatmapChart({ data, dayLabels, hourLabels = defaultHourLabels }: HeatmapChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    day: '',
    hour: '',
    value: 0,
  });

  // Flatten to find min/max
  const allValues = data.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  const cellSize = 22;
  const cellGap = 2;
  const labelWidth = 36;
  const headerHeight = 28;

  const totalWidth = labelWidth + hourLabels.length * (cellSize + cellGap);
  const totalHeight = headerHeight + dayLabels.length * (cellSize + cellGap);

  const handleMouseEnter = (
    e: React.MouseEvent,
    dayIdx: number,
    hourIdx: number,
    value: number
  ) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const containerRect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
    if (!containerRect) return;

    setTooltip({
      visible: true,
      x: rect.left - containerRect.left + cellSize / 2,
      y: rect.top - containerRect.top - 8,
      day: dayLabels[dayIdx],
      hour: hourLabels[hourIdx],
      value,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="block"
        >
          {/* Hour labels (top) */}
          {hourLabels.map((label, i) => (
            <text
              key={`h-${i}`}
              x={labelWidth + i * (cellSize + cellGap) + cellSize / 2}
              y={16}
              textAnchor="middle"
              className="fill-slate-400"
              fontSize={9}
              fontFamily="Inter, sans-serif"
            >
              {/* Show every other hour to avoid crowding */}
              {i % 2 === 0 ? label : ''}
            </text>
          ))}

          {/* Rows */}
          {data.map((row, dayIdx) => (
            <g key={`row-${dayIdx}`}>
              {/* Day label */}
              <text
                x={labelWidth - 6}
                y={headerHeight + dayIdx * (cellSize + cellGap) + cellSize / 2 + 3}
                textAnchor="end"
                className="fill-slate-500"
                fontSize={10}
                fontWeight={500}
                fontFamily="Inter, sans-serif"
              >
                {dayLabels[dayIdx]}
              </text>

              {/* Cells */}
              {row.map((value, hourIdx) => (
                <rect
                  key={`cell-${dayIdx}-${hourIdx}`}
                  x={labelWidth + hourIdx * (cellSize + cellGap)}
                  y={headerHeight + dayIdx * (cellSize + cellGap)}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  fill={getHeatmapColor(value, minVal, maxVal)}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={e => handleMouseEnter(e, dayIdx, hourIdx, value)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-10 pointer-events-none bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="font-medium">{tooltip.day}</span>
          <span className="text-slate-400 mx-1">{tooltip.hour}:00</span>
          <span className="font-bold">{tooltip.value}</span>
        </div>
      )}

      {/* Color scale legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">Low</span>
        <div className="flex gap-0.5">
          {COLORS.heatmap.map((color, i) => (
            <div
              key={i}
              className="w-4 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-400">High</span>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';

interface BreakdownItem {
  label: string;
  amount: number;
  color: string;
}

interface ROICounterProps {
  value: number;
  label: string;
  breakdown: BreakdownItem[];
  subscriptionCost: number;
}

export function ROICounter({ value, label, breakdown, subscriptionCost }: ROICounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const duration = 2000; // 2 seconds
  const roi = subscriptionCost > 0 ? Math.round(value / subscriptionCost) : 0;
  const totalBreakdown = breakdown.reduce((sum, b) => sum + b.amount, 0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startAnimation();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value]);

  function startAnimation() {
    startTimeRef.current = null;

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  }

  const formatLari = (n: number) => `₾${n.toLocaleString('ka-GE')}`;

  return (
    <div
      ref={containerRef}
      className="rounded-2xl p-8 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%)' }}
    >
      {/* Subtle decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative z-10">
        {/* Label */}
        <div className="text-teal-200 text-sm font-medium mb-2">{label}</div>

        {/* Main value */}
        <div className="text-4xl font-bold tracking-tight mb-6">
          {formatLari(displayValue)}
        </div>

        {/* Stacked breakdown bars */}
        <div className="mb-4">
          {/* Combined bar */}
          <div className="flex rounded-full overflow-hidden h-3 bg-white/10 mb-3">
            {breakdown.map((item, i) => {
              const width = totalBreakdown > 0 ? (item.amount / totalBreakdown) * 100 : 0;
              return (
                <div
                  key={i}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: item.color,
                    minWidth: width > 0 ? '2px' : '0',
                  }}
                />
              );
            })}
          </div>

          {/* Breakdown labels */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-teal-100 truncate">{item.label}</span>
                </div>
                <span className="text-xs font-semibold text-white whitespace-nowrap">
                  {formatLari(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription + ROI footer */}
        <div className="pt-4 border-t border-white/15 flex items-center justify-between text-sm">
          <span className="text-teal-200">
            Subscription: <span className="font-semibold text-white">{formatLari(subscriptionCost)}/mo</span>
          </span>
          <span className="text-teal-200">
            ROI: <span className="font-bold text-white text-lg">{roi}x</span>
          </span>
        </div>
      </div>
    </div>
  );
}

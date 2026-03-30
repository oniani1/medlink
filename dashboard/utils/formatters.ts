export function formatCurrency(amount: number): string {
  return `₾${amount.toLocaleString('ka-GE')}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ka-GE');
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMinutes(min: number, lang: 'ka' | 'en' = 'ka'): string {
  if (min < 60) return `${Math.round(min)} ${lang === 'ka' ? 'წთ' : 'min'}`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}${lang === 'ka' ? 'სთ' : 'h'} ${m}${lang === 'ka' ? 'წთ' : 'm'}`;
}

export function formatTrend(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0) return { value: '+100%', positive: true };
  const change = ((current - previous) / previous) * 100;
  return {
    value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    positive: change >= 0,
  };
}

export function responseTimeColor(minutes: number): string {
  if (minutes <= 15) return '#22c55e';
  if (minutes <= 30) return '#f59e0b';
  return '#ef4444';
}

export function efficiencyColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

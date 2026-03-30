export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function randomInt(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, rand: () => number, decimals = 1): number {
  const v = rand() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

export function generateWeeklyHistory(weeks: number, baseline: number, variance: number, rand: () => number): number[] {
  const data: number[] = [];
  let current = baseline;
  for (let i = 0; i < weeks; i++) {
    const change = (rand() - 0.4) * variance;
    current = Math.max(5, Math.round(current + change));
    data.push(current);
  }
  return data;
}

export function generateMonthlyValues(months: number, baseline: number, growth: number, rand: () => number): number[] {
  const data: number[] = [];
  let current = baseline;
  for (let i = 0; i < months; i++) {
    current = Math.round(current + growth + (rand() - 0.3) * growth * 2);
    data.push(Math.max(0, current));
  }
  return data;
}

export function generateDailyMessages(days: number, rand: () => number) {
  const data: { date: string; sent: number; received: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const base = isWeekend ? 40 : 100;
    const sent = Math.round(base + (rand() - 0.3) * base * 0.6);
    const received = Math.round(base * 0.8 + (rand() - 0.3) * base * 0.5);
    data.push({
      date: d.toISOString().split('T')[0],
      sent: Math.max(10, sent),
      received: Math.max(8, received),
    });
  }
  return data;
}

export function generatePeakHours(rand: () => number): number[][] {
  const grid: number[][] = [];
  for (let day = 0; day < 7; day++) {
    const row: number[] = [];
    const isWeekend = day >= 5;
    for (let hour = 0; hour < 24; hour++) {
      let base = 0;
      if (hour >= 9 && hour <= 17) {
        base = isWeekend ? 15 : 45;
        if (hour >= 10 && hour <= 12) base *= 1.4;
        if (hour >= 14 && hour <= 16) base *= 1.2;
      } else if (hour >= 18 && hour <= 21) {
        base = isWeekend ? 8 : 20;
      } else if (hour >= 7 && hour <= 8) {
        base = isWeekend ? 5 : 15;
      } else {
        base = 2;
      }
      row.push(Math.max(0, Math.round(base + (rand() - 0.5) * base * 0.4)));
    }
    grid.push(row);
  }
  return grid;
}

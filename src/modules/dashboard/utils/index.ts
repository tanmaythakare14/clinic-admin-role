import type { RevenueDataPoint, TimePeriod, ProgramFilter } from '../@types';

const MONTHLY_BASE = [
  { label: 'Jan', total: 18400, apcm: 9200, rpm: 6800, ccm: 2400 },
  { label: 'Feb', total: 21200, apcm: 10600, rpm: 7400, ccm: 3200 },
  { label: 'Mar', total: 19800, apcm: 9900, rpm: 7100, ccm: 2800 },
  { label: 'Apr', total: 24600, apcm: 12300, rpm: 8900, ccm: 3400 },
  { label: 'May', total: 23100, apcm: 11550, rpm: 8200, ccm: 3350 },
  { label: 'Jun', total: 27300, apcm: 13650, rpm: 9800, ccm: 3850 },
  { label: 'Jul', total: 25800, apcm: 12900, rpm: 9200, ccm: 3700 },
  { label: 'Aug', total: 29400, apcm: 14700, rpm: 10500, ccm: 4200 },
  { label: 'Sep', total: 31200, apcm: 15600, rpm: 11100, ccm: 4500 },
  { label: 'Oct', total: 28900, apcm: 14450, rpm: 10300, ccm: 4150 },
  { label: 'Nov', total: 33600, apcm: 16800, rpm: 12000, ccm: 4800 },
  { label: 'Dec', total: 36100, apcm: 18050, rpm: 12900, ccm: 5150 },
];

const QUARTERLY_BASE: RevenueDataPoint[] = [
  { label: 'Q1', total: 59400, apcm: 29700, rpm: 21300, ccm: 8400 },
  { label: 'Q2', total: 75000, apcm: 37500, rpm: 26900, ccm: 10600 },
  { label: 'Q3', total: 86400, apcm: 43200, rpm: 30800, ccm: 12400 },
  { label: 'Q4', total: 98600, apcm: 49300, rpm: 35200, ccm: 14100 },
];

const YEARLY_BASE: RevenueDataPoint[] = [
  { label: '2022', total: 184000, apcm: 92000, rpm: 65800, ccm: 26200 },
  { label: '2023', total: 247000, apcm: 123500, rpm: 88200, ccm: 35300 },
  { label: '2024', total: 319400, apcm: 159700, rpm: 114000, ccm: 45700 },
  { label: '2025', total: 412600, apcm: 206300, rpm: 147500, ccm: 58800 },
];

export function generateRevenueData(period: TimePeriod, program: ProgramFilter): RevenueDataPoint[] {
  let base: RevenueDataPoint[];
  if (period === 'monthly') base = MONTHLY_BASE;
  else if (period === 'quarterly') base = QUARTERLY_BASE;
  else base = YEARLY_BASE;

  if (program === 'all') return base;

  // Filter to show only the selected program's revenue
  return base.map((d) => {
    const value = program === 'RPM' ? d.rpm : program === 'APCM' ? d.apcm : d.ccm;
    return {
      ...d,
      total: value,
      apcm: program === 'APCM' ? d.apcm : 0,
      rpm: program === 'RPM' ? d.rpm : 0,
      ccm: program === 'CCM' ? d.ccm : 0,
    };
  });
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

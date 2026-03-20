export interface Assistant {
  id: number;
  name: string;
  createdAt: string;
}

export interface DailyStat {
  id: number;
  date: string;
  assistantId: number;
  newBooks: number;
  fiction: number;
  easy: number;
  reference: number;
  filipiniana: number;
  circulation: number;
  createdAt: string;
  assistant: Assistant;
}

export interface MonthlyTotal {
  month: string;
  monthLabel: string;
  newBooks: number;
  fiction: number;
  easy: number;
  reference: number;
  filipiniana: number;
  circulation: number;
  totalBooks: number;
}

export interface DailyStatFormData {
  date: string;
  assistantId: string;
  newBooks: string;
  fiction: string;
  easy: string;
  reference: string;
  filipiniana: string;
  circulation: string;
}

export const CATEGORIES = [
  { key: 'easy',        label: 'Easy',        color: 'bg-cpuNavy text-white border border-cpuGold/30'   },
  { key: 'fiction',     label: 'Fiction',     color: 'bg-cpuNavy text-white border border-cpuGold/30' },
  { key: 'newBooks',    label: 'New Books',   color: 'bg-cpuNavy text-white border border-cpuGold/30'     },
  { key: 'reference',   label: 'Reference',   color: 'bg-cpuNavy text-white border border-cpuGold/30' },
  { key: 'filipiniana', label: 'Filipiniana', color: 'bg-cpuNavy text-white border border-cpuGold/30'       },
  { key: 'circulation', label: 'Circulation', color: 'bg-cpuNavy text-white border border-cpuGold/30' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];
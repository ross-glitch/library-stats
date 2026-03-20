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
  { key: 'easy',        label: 'Easy',        color: 'bg-white text-cpuNavy shadow-sm border border-gray-100 hover:border-green-300 transition-colors' },
  { key: 'fiction',     label: 'Fiction',     color: 'bg-white text-cpuNavy shadow-sm border border-gray-100 hover:border-purple-300 transition-colors' },
  { key: 'newBooks',    label: 'New Books',   color: 'bg-white text-cpuNavy shadow-sm border border-gray-100 hover:border-blue-300 transition-colors' },
  { key: 'reference',   label: 'Reference',   color: 'bg-white text-cpuNavy shadow-sm border border-gray-100 hover:border-yellow-300 transition-colors' },
  { key: 'filipiniana', label: 'Filipiniana', color: 'bg-white text-cpuNavy shadow-sm border border-gray-100 hover:border-red-300 transition-colors' },
  { key: 'circulation', label: 'Circulation', color: 'bg-white text-cpuNavy shadow-sm border border-gray-100 hover:border-orange-300 transition-colors' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];
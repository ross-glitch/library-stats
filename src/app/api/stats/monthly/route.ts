import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatMonthLabel } from '@/lib/utils';
import { MonthlyTotal } from '@/types';

export async function GET() {
  try {
    const allStats = await prisma.dailyStat.findMany({
      orderBy: { date: 'asc' },
    });

    const monthMap = new Map<string, MonthlyTotal>();

    for (const stat of allStats) {
      const dateStr = stat.date.toISOString().split('T')[0];
      const monthKey = dateStr.substring(0, 7);

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          monthLabel: formatMonthLabel(monthKey),
          newBooks: 0,
          fiction: 0,
          easy: 0,
          reference: 0,
          filipiniana: 0,
          circulation: 0,
          totalBooks: 0,
        });
      }

      const entry = monthMap.get(monthKey)!;
      entry.newBooks    += stat.newBooks;
      entry.fiction     += stat.fiction;
      entry.easy        += stat.easy;
      entry.reference   += stat.reference;
      entry.filipiniana += stat.filipiniana;
      entry.circulation += stat.circulation;
      entry.totalBooks  += stat.newBooks + stat.fiction + stat.easy + stat.reference + stat.filipiniana + stat.circulation;
    }

    const monthly = Array.from(monthMap.values()).sort((a, b) =>
      b.month.localeCompare(a.month)
    );

    return NextResponse.json({ data: monthly });
  } catch (error) {
    console.error('GET /api/stats/monthly error:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly totals.' }, { status: 500 });
  }
}
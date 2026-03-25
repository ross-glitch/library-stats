import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    const whereClause = month
      ? {
          date: {
            gte: new Date(`${month}-01T00:00:00.000Z`),
            lt: new Date(
              new Date(`${month}-01T00:00:00.000Z`).setMonth(
                new Date(`${month}-01T00:00:00.000Z`).getMonth() + 1
              )
            ),
          },
        }
      : {};

    const stats = await prisma.dailyStat.findMany({
      where: whereClause,
      include: { assistant: true },
      orderBy: { date: 'desc' },
    });

    const serialized = stats.map((s) => ({
      ...s,
      date: s.date.toISOString().split('T')[0],
      createdAt: s.createdAt.toISOString(),
      assistant: {
        ...s.assistant,
        createdAt: s.assistant.createdAt.toISOString(),
      },
    }));

    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, assistantId, newBooks, fiction, easy, reference, filipiniana, circulation } = body;

    if (!date || !assistantId) {
      return NextResponse.json({ error: 'Date and assistant are required.' }, { status: 400 });
    }

    const counts = {
      newBooks:    parseInt(newBooks)    || 0,
      fiction:     parseInt(fiction)     || 0,
      easy:        parseInt(easy)        || 0,
      reference:   parseInt(reference)   || 0,
      filipiniana: parseInt(filipiniana) || 0,
      circulation: parseInt(circulation) || 0,
    };

    for (const [key, val] of Object.entries(counts)) {
      if (val < 0) {
        return NextResponse.json({ error: `${key} cannot be negative.` }, { status: 400 });
      }
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    const assistant = await prisma.assistant.findUnique({ where: { id: Number(assistantId) } });
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found.' }, { status: 404 });
    }

    const stat = await prisma.dailyStat.create({
      data: { date: parsedDate, assistantId: Number(assistantId), ...counts },
      include: { assistant: true },
    });

    return NextResponse.json({
      data: {
        ...stat,
        date: stat.date.toISOString().split('T')[0],
        createdAt: stat.createdAt.toISOString(),
      },
      message: 'Entry saved successfully!',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to save entry.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, assistantId, newBooks, fiction, easy, reference, filipiniana, circulation } = body;

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required.' }, { status: 400 });
    }

    const counts = {
      newBooks:    parseInt(newBooks)    || 0,
      fiction:     parseInt(fiction)     || 0,
      easy:        parseInt(easy)        || 0,
      reference:   parseInt(reference)   || 0,
      filipiniana: parseInt(filipiniana) || 0,
      circulation: parseInt(circulation) || 0,
    };

    const updateData: Record<string, number> = { ...counts };
    if (assistantId) updateData.assistantId = Number(assistantId);

    const stat = await prisma.dailyStat.update({
      where: { id: Number(id) },
      data: updateData,
      include: { assistant: true },
    });

    return NextResponse.json({
      data: {
        ...stat,
        date: stat.date.toISOString().split('T')[0],
        createdAt: stat.createdAt.toISOString(),
      },
      message: 'Entry updated successfully!',
    });
  } catch (error) {
    console.error('PUT /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to update entry.' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assistants = await prisma.assistant.findMany({
      orderBy: { name: 'asc' },
    });
    const serialized = assistants.map((a) => ({
      id: a.id,
      name: a.name,
      createdAt: a.createdAt.toISOString(),
      // Omitting password from GET
    }));
    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error('GET /api/assistants error:', error);
    return NextResponse.json({ error: 'Failed to fetch assistants.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, password } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    if (!password || password.trim() === '') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const trimmed = name.trim();

    const existing = await prisma.assistant.findUnique({ where: { name: trimmed } });
    if (existing) {
      return NextResponse.json({ error: 'That name already exists.' }, { status: 409 });
    }

    const assistant = await prisma.assistant.create({
      data: { name: trimmed, password: password.trim() },
    });

    return NextResponse.json({
      data: { id: assistant.id, name: assistant.name, createdAt: assistant.createdAt.toISOString() },
      message: 'Profile created!',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/assistants error:', error);
    return NextResponse.json({ error: 'Failed to create profile.' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { password } = await req.json();
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'Invalid profile ID.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const assistant = await prisma.assistant.findUnique({ where: { id } });

    if (!assistant) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    if (assistant.password !== password) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('POST /api/assistants/[id] error:', error);
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { password } = await req.json();
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'Invalid profile ID.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const assistant = await prisma.assistant.findUnique({ where: { id } });

    if (!assistant) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    if (assistant.password !== password) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    // Soft delete: Update isDeleted to true so the data remains linked in the database
    await prisma.assistant.update({ 
      where: { id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ message: 'Profile deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/assistants/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete profile.' }, { status: 500 });
  }
}

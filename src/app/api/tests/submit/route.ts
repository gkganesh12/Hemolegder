import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { testingService } from '@/services/testing.service';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, 'create:test')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const test = await testingService.submitTest({
      bloodUnitId: body.bloodUnitId,
      testType: body.testType,
      result: body.result,
      testedBy: session.user.id,
      notes: body.notes,
    });

    return NextResponse.json(test);
  } catch (error: unknown) {
    console.error('Test submission error:', error);
    const message = error instanceof Error ? error.message : 'Test submission failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

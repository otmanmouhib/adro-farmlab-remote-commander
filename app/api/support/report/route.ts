import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import clientPromise, { dbName } from '@/lib/mongodb';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const body = await request.json();
  const email = String(body.email || session.user.email || '').trim().toLowerCase();
  const station = String(body.station || '').trim();
  const issue = String(body.issue || '').trim();

  if (!issue) {
    return NextResponse.json({ error: 'Issue description is required.' }, { status: 400 });
  }

  const client = await clientPromise;
  const collection = client.db(dbName).collection('reports');

  await collection.insertOne({
    userId: session.user.id ?? null,
    userEmail: email,
    station: station || 'Unspecified',
    issue,
    createdAt: new Date(),
    source: 'report',
  });

  return NextResponse.json({ ok: true });
}

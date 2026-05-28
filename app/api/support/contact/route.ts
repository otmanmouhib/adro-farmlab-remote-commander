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
  const name = String(body.name || '').trim();
  const email = String(body.email || session.user.email || '').trim().toLowerCase();
  const message = String(body.message || '').trim();

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const client = await clientPromise;
  const collection = client.db(dbName).collection('contactMessages');

  await collection.insertOne({
    userId: session.user.id ?? null,
    userEmail: email,
    name: name || session.user.name || email,
    message,
    createdAt: new Date(),
    source: 'contact',
  });

  return NextResponse.json({ ok: true });
}

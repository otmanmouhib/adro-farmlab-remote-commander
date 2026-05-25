import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise, { dbName } from '@/lib/mongodb';

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const name = String(body.name || email.split('@')[0]).trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const client = await clientPromise;
  const usersCollection = client.db(dbName).collection('users');
  const existingUser = await usersCollection.findOne({ email });

  if (existingUser) {
    return NextResponse.json({ error: 'A user with that email already exists.' }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);
  const user = {
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };
  await usersCollection.insertOne(user);

  return NextResponse.json({ ok: true });
}

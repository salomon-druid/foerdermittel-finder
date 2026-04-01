import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Simple demo auth - in production, use Supabase auth or proper auth
  if (!email || !password) {
    return NextResponse.json({ error: 'E-Mail und Passwort erforderlich' }, { status: 400 });
  }

  // Demo: accept any login with password >= 6 chars
  if (password.length < 6) {
    return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('authenticated', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  response.cookies.set('user_email', email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

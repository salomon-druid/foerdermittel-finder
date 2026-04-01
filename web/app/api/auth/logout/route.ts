import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  response.cookies.set('authenticated', '', { path: '/', maxAge: 0 });
  response.cookies.set('user_email', '', { path: '/', maxAge: 0 });
  return response;
}

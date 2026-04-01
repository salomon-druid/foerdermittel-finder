import './globals.css';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'FörderFinder — Nie wieder Fördergeld verpassen',
  description: 'Automatische Überwachung von EU- und nationalen Förderprogrammen. KI-gestütztes Matching für Ihr Unternehmen.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get('authenticated')?.value === 'true';
  const userEmail = cookieStore.get('user_email')?.value || '';

  return (
    <html lang="de">
      <body className="min-h-screen bg-[#F5F4F1]">
        <nav className="bg-[#1F2933] text-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="FörderFinder" className="w-14 h-14" />
              <span className="text-lg font-bold text-white">FörderFinder</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="text-white/80 hover:text-white">Start</Link>
              <Link href="/programme" className="text-white/80 hover:text-white">Programme</Link>
              <Link href="/dashboard" className="text-white/80 hover:text-white">Dashboard</Link>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-green-400 text-xs font-medium">✓ Angemeldet</span>
                  <span className="text-white/60 text-xs">{userEmail}</span>
                  <form action="/api/auth/logout" method="POST">
                    <button type="submit" className="text-white/80 hover:text-white text-xs underline">Abmelden</button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-[#3e7339] rounded-lg hover:bg-[#356431] transition">Login</Link>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-[#1F2933] text-white/60 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>© 2026 FörderFinder. Alle Rechte vorbehalten.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'FörderFinder — Nie wieder Fördergeld verpassen',
  description: 'Automatische Überwachung von EU- und nationalen Förderprogrammen. KI-gestütztes Matching für Ihr Unternehmen.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
              <Link href="/dashboard" className="px-4 py-2 bg-[#3e7339] rounded-lg hover:bg-[#356431] transition">Kostenlos testen</Link>
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

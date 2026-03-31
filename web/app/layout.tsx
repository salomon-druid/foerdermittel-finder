import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'FörderFinder — Nie wieder Fördergeld verpassen',
  description: 'Automatische Überwachung von EU- und nationalen Förderprogrammen. KI-gestütztes Matching für Ihr Unternehmen.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-dark tracking-tight">
                Förder<span className="text-primary">Finder</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/programme" className="text-sm font-medium text-gray-600 hover:text-dark transition-colors">
                Programme
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-dark transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-dark transition-colors">
                Anmelden
              </Link>
              <Link href="/dashboard" className="btn-primary text-sm !px-5 !py-2.5">
                Kostenlos testen
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-dark text-gray-400 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-lg">
                    Förder<span className="text-primary">Finder</span>
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  KI-gestützte Fördermittel-Überwachung für KMUs. Finden, matchen und sichern Sie Förderung automatisch.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4">Produkt</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="/#pricing" className="hover:text-white transition-colors">Preise</a></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link href="/programme" className="hover:text-white transition-colors">Programme</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4">Unternehmen</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Über uns</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4">Rechtliches</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-xs">
                © 2026 FörderFinder. Alle Rechte vorbehalten.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

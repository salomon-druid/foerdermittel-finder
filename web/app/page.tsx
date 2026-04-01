import Link from 'next/link';
import { supabase, FundingProgram } from '@/src/lib/supabase';

async function getPrograms(): Promise<FundingProgram[]> {
  const { data } = await supabase
    .from('funding_programs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

export default async function HomePage() {
  const programs = await getPrograms();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                80+ Mrd€ Förderung jährlich verfügbar
              </span>
            </div>

            <h1 className="animate-fade-up text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark tracking-tight mb-6" style={{ animationDelay: '0.2s' }}>
              Nie wieder <span className="text-primary">Fördergeld</span> verpassen
            </h1>

            <p className="animate-fade-up text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-6 leading-relaxed" style={{ animationDelay: '0.3s' }}>
              Jährlich stehen in Deutschland über 80 Milliarden Euro an Fördermitteln bereit – von Bund, Ländern und der EU. Das Problem: Das Angebot ist unübersichtlich, die Richtlinien ändern sich ständig, und passende Programme verfallen, bevor Unternehmen davon erfahren.
            </p>

            <p className="animate-fade-up text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed" style={{ animationDelay: '0.35s' }}>
              Unser Fördermittel-Finder überwacht automatisch bundesweit und europaweit alle relevanten Förderprogramme – passgenau zu Ihrem Unternehmen. Egal ob Digitalisierung im Handwerk, Innovationsförderung für IT-Dienstleister oder Investitionszuschüsse für produzierende Betriebe: Sie erhalten sofort Bescheid, wenn ein Programm zu Ihrem Profil passt.
            </p>

            <div className="animate-fade-up flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto" style={{ animationDelay: '0.4s' }}>
              <Link href="/programme" className="btn-primary whitespace-nowrap w-full sm:w-auto text-center">
                Programme entdecken
              </Link>
              <Link href="/dashboard" className="btn-secondary whitespace-nowrap w-full sm:w-auto text-center">
                Kostenlos testen
              </Link>
            </div>

            <p className="animate-fade-up text-xs text-gray-400 mt-4" style={{ animationDelay: '0.5s' }}>
              14 Tage kostenlos · Keine Kreditkarte · Sofort loslegen
            </p>

            <div className="animate-fade-up flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500" style={{ animationDelay: '0.55s' }}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Keine stundenlange Recherche
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Keine verpassten Fristen
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Kein verpasstes Fördergeld
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-gray-200/60 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span><strong className="text-dark">Bundesweit & EU</strong> überwacht</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              <span><strong className="text-dark">Rund um die Uhr</strong> neue Programme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span><strong className="text-dark">Passgenaues</strong> Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              <span><strong className="text-dark">KI-gestützte</strong> Auswertung</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              In <span className="text-primary">3 Schritten</span> zur Förderung
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Richten Sie Ihr Unternehmensprofil ein, und unsere Plattform erledigt den Rest. Sie konzentrieren sich auf Ihr Kerngeschäft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Profil erstellen',
                desc: 'Sie legen einmalig Ihre Unternehmensdaten an – Branche, Unternehmensgröße, Standort, geplante Vorhaben. Wir bauen Ihr Förder-DNA.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Automatisch matchen',
                desc: 'Unser System gleicht Ihre Informationen automatisch mit tausenden laufenden und kommenden Förderprogrammen ab. Kein Rauschen, keine Fehlalarme.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Förderung beantragen',
                desc: 'Nutzen Sie KI-Zusammenfassungen und Benachrichtigungen, um die besten Förderungen zu identifizieren und rechtzeitig zu beantragen.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200"></div>
                )}
                <div className="relative z-10 w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-gold tracking-widest uppercase mb-2 block">Schritt {item.step}</span>
                <h3 className="text-xl font-bold text-dark mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              So finden Sie Förderungen, <span className="text-primary">die wirklich passen</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Passgenaue Förderprogramme für Ihr Unternehmen – automatisch und in Echtzeit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: 'Intelligentes Matching nach Unternehmensprofil',
                desc: 'Unser System gleicht Ihre Unternehmensdaten automatisch mit tausenden laufenden und kommenden Förderprogrammen ab. Ergebnis: Sie sehen nur, was für Sie tatsächlich relevant ist. Kein Rauschen, keine Fehlalarme.',
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                ),
                title: 'Echtzeit-Benachrichtigungen bei neuen Fördermöglichkeiten',
                desc: 'Wir überwachen rund um die Uhr alle relevanten Quellen – von der KfW über Landesförderbanken bis zu EU-Strukturfonds. Sobald ein neues Programm online geht, das zu Ihrem Profil passt, erhalten Sie sofort eine Benachrichtigung.',
                color: 'bg-gold/10 text-gold',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
                title: 'Fristenverwaltung mit Erinnerungssystem',
                desc: 'Wir verfolgen alle relevanten Deadlines für Ihre gematchten Programme und erinnern Sie frühzeitig – Wochen und Tage vor dem Stichtag. So bleibt genug Zeit für die Antragsstellung, ohne dass Sie Kalender pflegen müssen.',
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: 'KI-gestützte Zusammenfassungen komplexer Förderbedingungen',
                desc: 'Unsere KI fasst die wesentlichen Fördervoraussetzungen, Förderhöhen, Antragsverfahren und Ausschlusskriterien in klaren, verständlichen Punkten zusammen. Sie wissen innerhalb von Minuten, ob sich ein Antrag lohnt.',
                color: 'bg-gold/10 text-gold',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                ),
                title: 'Nahtlose Integration in Ihre bestehenden Tools',
                desc: 'Exportieren Sie Förderdaten per API in Ihre Projektmanagement-Software, Ihr ERP-System oder CRM. CSV- und Excel-Exporte ebenfalls verfügbar – ohne doppelte Datenerfassung.',
                color: 'bg-primary/10 text-primary',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`card p-8 group hover:-translate-y-1 transition-all duration-300 animate-fade-up ${i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-dark to-dark-light text-white rounded-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Vertraut von wachstumsorientierten KMUs
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Von Handwerksbetrieben in München bis IT-Startups in Berlin — Unternehmen nutzen FörderFinder, um Fördergelder zu finden, die sie sonst verpasst hätten.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {['Handwerk', 'IT & Tech', 'Produktion', 'Forschung', 'Gesundheit'].map((branch) => (
                <span key={branch} className="text-sm font-medium tracking-wider uppercase">{branch}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Transparente Preise, <span className="text-primary">kein Kleingedrucktes</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              14 Tage kostenlos testen. Keine Kreditkarte erforderlich. Jederzeit monatlich kündbar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="card p-8 flex flex-col animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-dark">Starter</h3>
                <p className="text-sm text-gray-500 mt-1">Ideal für Einzelunternehmen und kleine Betriebe</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-dark">49€</span>
                <span className="text-gray-500 text-sm">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '3 Unternehmensprofile',
                  'Bis zu 10 Fördermatches pro Monat',
                  'E-Mail-Benachrichtigungen',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-secondary w-full text-center">
                Kostenlos testen
              </Link>
            </div>

            {/* Professional */}
            <div className="card p-8 flex flex-col relative border-primary/30 shadow-lg shadow-primary/5 animate-fade-up ring-2 ring-primary/20" style={{ animationDelay: '0.3s' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Am beliebtesten
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-dark">Professional</h3>
                <p className="text-sm text-gray-500 mt-1">Für wachsende Unternehmen mit mehreren Standorten</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-dark">99€</span>
                <span className="text-gray-500 text-sm">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Unbegrenzte Unternehmensprofile',
                  'Unbegrenzte Matches',
                  'Echtzeit-Alerts',
                  'Fristenmanagement',
                  'KI-Zusammenfassungen',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-primary w-full text-center">
                Kostenlos testen
              </Link>
            </div>

            {/* Enterprise */}
            <div className="card p-8 flex flex-col animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-dark">Enterprise</h3>
                <p className="text-sm text-gray-500 mt-1">Für Beratungsunternehmen, Kammern und Verbände</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-dark">199€</span>
                <span className="text-gray-500 text-sm">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'API-Zugang',
                  'White-Label-Option',
                  'Dedizierter Support',
                  'Individuelle SLA',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-gold w-full text-center">
                Vertrieb kontaktieren
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Alle Pakete enthalten eine <strong>14-tägige kostenlose Testphase</strong> – ohne Kreditkarte, ohne Verpflichtung. Jederzeit monatlich kündbar. Alle Preise zzgl. MwSt.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Häufig gestellte Fragen
            </h2>
            <p className="text-lg text-gray-500">
              Alles was Sie wissen müssen, bevor Sie starten.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Welche Förderquellen überwacht FörderFinder?',
                a: 'Wir überwachen bundesweit und europaweit alle relevanten Förderprogramme – von der KfW über Landesförderbanken bis zu EU-Strukturfonds. Die Liste wird laufend erweitert.'
              },
              {
                q: 'Wie funktioniert das Matching?',
                a: 'Sie legen einmalig Ihre Unternehmensdaten an – Branche, Unternehmensgröße, Standort, geplante Vorhaben. Unser System gleicht diese Informationen automatisch mit tausenden laufenden und kommenden Förderprogrammen ab.'
              },
              {
                q: 'Kann ich FörderFinder vor der Zahlung testen?',
                a: 'Ja. Jedes Paket beinhaltet einen 14-tägigen kostenlosen Test. Keine Kreditkarte erforderlich. Voller Zugriff auf alle Features.'
              },
              {
                q: 'Wie funktionieren die KI-Zusammenfassungen?',
                a: 'Unsere KI fasst die wesentlichen Fördervoraussetzungen, Förderhöhen, Antragsverfahren und Ausschlusskriterien in klaren, verständlichen Punkten zusammen. Sie wissen innerhalb von Minuten, ob sich ein Antrag für Ihr Vorhaben lohnt.'
              },
              {
                q: 'Kann ich jederzeit kündigen?',
                a: 'Ja. Keine langfristigen Verträge. Sie können jederzeit upgraden, downgraden oder kündigen. Bei Kündigung behalten Sie Zugang bis zum Ende der Abrechnungsperiode.'
              },
              {
                q: 'Lässt sich FörderFinder in unsere bestehenden Tools integrieren?',
                a: 'Ja. Exportieren Sie Förderdaten per API in Ihre Projektmanagement-Software, Ihr ERP-System oder CRM-Lösung. CSV- und Excel-Exporte sind ebenfalls verfügbar.'
              },
            ].map((item, i) => (
              <details key={i} className="card group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-dark pr-4">{item.q}</h3>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-12 md:p-16 text-center bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Verpassen Sie keine Förderung mehr
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg">
              Richten Sie Ihr Unternehmensprofil ein, und unsere Plattform erledigt den Rest. Sie konzentrieren sich auf Ihr Kerngeschäft.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-gold !text-dark !px-8 !py-4 text-base">
                Kostenlos testen – 14 Tage, keine Kreditkarte
              </Link>
              <Link href="/programme" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Programme ansehen →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

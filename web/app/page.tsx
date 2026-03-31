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
                150+ Mrd€ Förderung verfügbar
              </span>
            </div>

            <h1 className="animate-fade-up text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark tracking-tight mb-6" style={{ animationDelay: '0.2s' }}>
              Nie wieder <span className="text-primary">Fördergeld</span> verpassen
            </h1>

            <p className="animate-fade-up text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animationDelay: '0.3s' }}>
              FörderFinder überwacht automatisch EU- und nationale Förderprogramme, matched sie auf Ihr Unternehmensprofil und warnt Sie vor Deadlines.
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
              14 Tage kostenlos · Keine Kreditkarte · Jederzeit kündbar
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-gray-200/60 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span><strong className="text-dark">13+</strong> Förderprogramme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              <span><strong className="text-dark">EU & National</strong> Quellen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span><strong className="text-dark">Täglich</strong> aktualisiert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              <span><strong className="text-dark">KI-Matching</strong> für Ihr Profil</span>
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
              Von der Anmeldung bis zur ersten passenden Förderung — es dauert weniger als 5 Minuten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Profil erstellen',
                desc: 'Sagen Sie uns Branche, Größe, Region und Förderinteressen. Wir bauen Ihr Förder-DNA, damit Sie nur relevante Programme sehen.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Automatisch matchen',
                desc: 'Unser Algorithmus scannt täglich alle Förderquellen und bewertet sie gegen Ihr Profil. Passende Programme landen direkt in Ihrem Dashboard.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Förderung beantragen',
                desc: 'Nutzen Sie KI-Zusammenfassungen und Match-Scores, um die besten Förderungen zu identifizieren und rechtzeitig zu beantragen.',
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
              Alles was Sie brauchen, um <span className="text-primary">Förderung zu sichern</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Entwickelt für KMUs, die Fördermöglichkeiten nicht mehr manuell suchen wollen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
                title: 'Multi-Quellen-Monitoring',
                desc: 'EU-Förderportal, KfW, Bundesanzeiger, Landesprogramme — alle relevanten Quellen an einem Ort.',
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: 'KI-Match-Score',
                desc: 'Jedes Programm erhält einen Match-Score von 0–100%. Konzentrieren Sie sich auf die Förderungen mit der höchsten Relevanz.',
                color: 'bg-gold/10 text-gold',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Deadline-Warnungen',
                desc: 'Verpassen Sie keine Antragsfrist. Smarte Erinnerungen 14, 7 und 3 Tage vor Ablauf.',
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: 'KI-Zusammenfassungen',
                desc: 'Lange Förderbedingungen? Unsere KI extrahiert Förderhöhe, Voraussetzungen und Antragsprozess in Sekunden.',
                color: 'bg-gold/10 text-gold',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                title: 'Team-Workflows',
                desc: 'Weisen Sie Programme Teammitgliedern zu, verfolgen Sie Antragsstatus und arbeiten Sie zusammen.',
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                ),
                title: 'Export & Reports',
                desc: 'Exportieren Sie Förderdaten als CSV oder PDF. Wochenberichte für Geschäftsführung oder Berater.',
                color: 'bg-gold/10 text-gold',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="card p-8 group hover:-translate-y-1 transition-all duration-300 animate-fade-up"
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
              Einfache, transparente <span className="text-primary">Preise</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              14 Tage kostenlos testen. Keine Kreditkarte erforderlich. Upgraden, Downgraden oder jederzeit kündigen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="card p-8 flex flex-col animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-dark">Starter</h3>
                <p className="text-sm text-gray-500 mt-1">Für Solo-Gründer & Freelancer</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-dark">49€</span>
                <span className="text-gray-500 text-sm">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['EU-Förderprogramme', 'E-Mail-Benachrichtigungen', '1 Branche', 'Basis-Matching', 'Deadline-Erinnerungen'].map((item) => (
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
                <p className="text-sm text-gray-500 mt-1">Für wachsende KMUs</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-dark">99€</span>
                <span className="text-gray-500 text-sm">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Alle Quellen (EU, KfW, Bundesanzeiger)', 'KI-Matching (0–100%)', 'Unbegrenzte Branchen', 'KI-Zusammenfassungen', 'Deadline-Warnungen', 'E-Mail + Slack Alerts', 'CSV/PDF Export', 'Priority Support'].map((item) => (
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
                <p className="text-sm text-gray-500 mt-1">Für Berater & große Organisationen</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-dark">199€</span>
                <span className="text-gray-500 text-sm">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Alles in Professional', 'REST API-Zugang', 'Team-Workflows', 'Multi-Unternehmen', 'White-Label Reports', 'Dedizierter Support', 'Individuelle Integrationen'].map((item) => (
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
                a: 'Wir überwachten aktuell das EU-Förderportal, KfW-Programme, den Bundesanzeiger und ausgewählte Landesprogramme. Die Liste wird laufend erweitert.'
              },
              {
                q: 'Wie funktioniert das KI-Matching?',
                a: 'Unser Algorithmus analysiert Ihr Unternehmensprofil — Branche, Größe, Region, bisherige Förderungen — und bewertet jedes neue Programm anhand dieser Kriterien. Sie erhalten einen 0–100% Match-Score.'
              },
              {
                q: 'Kann ich FörderFinder vor der Zahlung testen?',
                a: 'Ja. Jedes Paket beinhaltet einen 14-tägigen kostenlosen Test. Keine Kreditkarte erforderlich. Voller Zugriff auf alle Features.'
              },
              {
                q: 'Wie unterscheidet sich FörderFinder von Google Alerts?',
                a: 'Google Alerts liefert unstrukturierte News. FörderFinder versteht Förderprogramme — Voraussetzungen, Fristen, Förderhöhe — und matched sie strukturiert auf Ihr Profil.'
              },
              {
                q: 'Kann ich jederzeit kündigen?',
                a: 'Ja. Keine langfristigen Verträge. Sie können jederzeit upgraden, downgraden oder kündigen. Bei Kündigung behalten Sie Zugang bis zum Ende der Abrechnungsperiode.'
              },
              {
                q: 'Ist mein Unternehmen in der Datenbank sichtbar?',
                a: 'Nein. Ihre Unternehmensdaten werden ausschließlich für das Matching verwendet und nicht an Dritte weitergegeben. DSGVO-konform.'
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
              Starten Sie noch heute und entdecken Sie Förderungen, die zu Ihrem Unternehmen passen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-gold !text-dark !px-8 !py-4 text-base">
                Kostenlosen Testzugang starten
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

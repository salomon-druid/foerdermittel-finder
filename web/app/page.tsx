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
    <div>
      {/* Hero */}
      <section className="bg-[#1F2933] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block px-3 py-1 bg-[#3e7339]/20 text-[#3e7339] text-sm rounded-full mb-4">
            13+ Förderprogramme erfasst
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Nie wieder <span className="text-[#3e7339]">Fördergeld</span> verpassen
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            FörderFinder überwacht automatisch EU- und nationale Förderprogramme, matched sie
            auf Ihr Unternehmensprofil und warnt vor Deadlines.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/programme" className="px-6 py-3 bg-[#3e7339] text-white font-semibold rounded-lg hover:bg-[#356431] transition">
              Programme entdecken
            </Link>
            <Link href="/dashboard" className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition">
              Kostenlos testen
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1F2933] mb-8 text-center">So funktioniert's</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Profil anlegen', desc: 'Branche, Größe, Region und Förderinteressen angeben' },
            { step: '2', title: 'Automatisch matchen', desc: 'KI durchsucht täglich alle Förderquellen nach passenden Programmen' },
            { step: '3', title: 'Förderung beantragen', desc: 'Relevante Programme mit Deadlines und Antragslinks direkt im Dashboard' },
          ].map((s) => (
            <div key={s.step} className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-[#3e7339] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {s.step}
              </div>
              <h3 className="font-bold text-[#1F2933] mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Programs */}
      {programs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1F2933]">Aktuelle Förderprogramme</h2>
            <Link href="/programme" className="text-[#3e7339] text-sm font-medium hover:underline">
              Alle anzeigen →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((p) => (
              <Link
                key={p.id}
                href={`/programme/${p.id}`}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-[#3e7339]/20 transition"
              >
                <span className="text-xs text-gray-400">{p.provider}</span>
                <h3 className="font-semibold text-[#1F2933] mt-1 line-clamp-2">{p.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                {p.max_funding && (
                  <p className="text-sm font-semibold text-[#3e7339] mt-2">
                    Bis zu {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.max_funding)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#1F2933] mb-8 text-center">Einfache Preise</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '49', features: ['EU-Förderprogramme', 'E-Mail-Benachrichtigungen', '1 Branche'] },
              { name: 'Professional', price: '99', features: ['Alle Quellen', 'KI-Matching', 'Unbegrenzte Branchen', 'Deadline-Warnungen'], highlight: true },
              { name: 'Enterprise', price: '199', features: ['Alles in Professional', 'API-Zugang', 'Team-Workflows', 'Dedicated Support'] },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl p-6 border ${plan.highlight ? 'border-[#3e7339] ring-2 ring-[#3e7339]/20' : 'border-gray-200'} bg-white`}>
                {plan.highlight && <span className="text-xs font-bold text-[#D4AF37] uppercase">Beliebteste Wahl</span>}
                <h3 className="text-lg font-bold text-[#1F2933] mt-2">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-[#1F2933] mt-2">
                  {plan.price}€<span className="text-sm font-normal text-gray-400">/Monat</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-[#3e7339]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full mt-6 py-2 rounded-lg font-semibold ${plan.highlight ? 'bg-[#3e7339] text-white hover:bg-[#356431]' : 'bg-gray-100 text-[#1F2933] hover:bg-gray-200'} transition`}>
                  Kostenlos testen
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

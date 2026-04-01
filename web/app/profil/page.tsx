'use client';

import { useState } from 'react';

const INDUSTRIES = ['IT', 'Bau', 'Handwerk', 'Produktion', 'Dienstleistung', 'Gesundheit', 'Energie', 'Logistik'];
const SIZES = ['Mikro (1-9)', 'Klein (10-49)', 'Mittel (50-249)', 'Groß (250+)'];
const CATEGORIES = ['Innovation', 'Digitalisierung', 'Umwelt', 'Gruendung', 'Beratung', 'Allgemein'];
const REGIONS = ['Bayern', 'NRW', 'Baden-Württemberg', 'Berlin', 'Hamburg', 'Hessen', 'Niedersachsen', 'Sachsen', 'Bundesweit'];

export default function ProfilPage() {
  const [profile, setProfile] = useState({
    company_name: '',
    industry: '',
    size: '',
    country: 'DE',
    region: '',
    categories: [] as string[],
    keywords: [] as string[],
    min_funding: 10000,
    max_funding: 500000,
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const toggleCategory = (cat: string) => {
    setProfile((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setProfile((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setProfile((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== kw),
    }));
  };

  const searchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Match error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1F2933] mb-2">Unternehmensprofil</h1>
      <p className="text-gray-500 mb-8">Geben Sie Ihr Profil ein, um passende Förderprogramme zu finden.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1F2933]">Firmenname</label>
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                placeholder="Ihre Firma GmbH"
                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7339]/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1F2933]">Branche</label>
              <select
                value={profile.industry}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">Bitte wählen</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1F2933]">Unternehmensgröße</label>
              <select
                value={profile.size}
                onChange={(e) => setProfile({ ...profile, size: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">Bitte wählen</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1F2933]">Region</label>
              <select
                value={profile.region}
                onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">Bitte wählen</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1F2933]">Förderkategorien</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      profile.categories.includes(cat)
                        ? 'bg-[#3e7339] text-white border-[#3e7339]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#3e7339]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1F2933]">Schlüsselwörter</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="z.B. KI, Cloud, Software"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <button onClick={addKeyword} className="px-4 py-2 bg-[#3e7339] text-white rounded-lg hover:bg-[#356431]">+</button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.keywords.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                    {kw}
                    <button onClick={() => removeKeyword(kw)} className="text-gray-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1F2933]">Min. Förderung (€)</label>
                <input
                  type="number"
                  value={profile.min_funding}
                  onChange={(e) => setProfile({ ...profile, min_funding: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1F2933]">Max. Förderung (€)</label>
                <input
                  type="number"
                  value={profile.max_funding}
                  onChange={(e) => setProfile({ ...profile, max_funding: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={searchMatches}
              disabled={loading}
              className="w-full py-3 bg-[#3e7339] text-white font-semibold rounded-lg hover:bg-[#356431] transition disabled:opacity-50"
            >
              {loading ? 'Suche läuft...' : 'Passende Förderungen finden'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {results && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-bold text-[#1F2933] mb-4">
                Ergebnisse für {results.profile}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#3e7339]">{results.total}</p>
                  <p className="text-xs text-gray-500">Programme gesamt</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#3e7339]">{results.high_match}</p>
                  <p className="text-xs text-gray-500">Hohe Übereinstimmung</p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.programs?.map((p: any) => (
                  <a
                    key={p.id}
                    href={`/programme/${p.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1F2933] truncate">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.provider} · {p.category}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className={`text-lg font-bold ${p.match_score >= 80 ? 'text-green-600' : p.match_score >= 60 ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {p.match_score}%
                        </p>
                        <p className="text-xs text-gray-400">{p.recommendation}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

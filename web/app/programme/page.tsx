import Link from 'next/link';
import { supabase, FundingProgram } from '@/src/lib/supabase';
import { scoreMatch, DEMO_COMPANY, ProgramLike } from '@/src/lib/matching';

async function getPrograms(): Promise<FundingProgram[]> {
  const { data } = await supabase
    .from('funding_programs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  return data || [];
}

function getDeadlineBadge(deadline: string | null): { label: string; color: string } | null {
  if (!deadline) return null;
  const dl = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return { label: 'Abgelaufen', color: 'bg-gray-200 text-gray-600' };
  if (daysLeft < 14) return { label: `${daysLeft}d`, color: 'bg-red-100 text-red-700' };
  if (daysLeft < 30) return { label: `${daysLeft}d`, color: 'bg-yellow-100 text-yellow-700' };
  return { label: `${daysLeft}d`, color: 'bg-green-100 text-green-700' };
}

function getSourceBadge(provider: string): { label: string; color: string } {
  switch (provider) {
    case 'EU': return { label: '🇪🇺 EU', color: 'bg-blue-50 text-blue-700' };
    case 'KfW': return { label: '🏦 KfW', color: 'bg-green-50 text-green-700' };
    case 'Bafa': return { label: '🏛️ BAFA', color: 'bg-purple-50 text-purple-700' };
    default: return { label: provider, color: 'bg-gray-100 text-gray-600' };
  }
}

export default async function ProgramsPage() {
  const programs = await getPrograms();

  // Score each program against the demo company
  const scoredPrograms = programs.map(p => {
    const match = scoreMatch(DEMO_COMPANY, p as unknown as ProgramLike);
    return { ...p, score: match.total_score };
  }).sort((a, b) => b.score - a.score);

  const formatCurrency = (val: number | null) => {
    if (!val) return null;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-[#1F2933]">Förderprogramme</h1>
        <a
          href="/api/export/csv"
          className="text-sm px-4 py-2 bg-[#3e7339] text-white rounded-lg hover:bg-[#356431] transition"
        >
          📥 CSV Export
        </a>
      </div>
      <p className="text-gray-500 mb-8">
        {scoredPrograms.length} aktive Programme · Sortiert nach Relevanz
        <span className="ml-2 text-xs text-gray-400">(Demo-Profil: IT-KMU, Bayern)</span>
      </p>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
        <div className="col-span-5">Programm</div>
        <div className="col-span-2">Quelle</div>
        <div className="col-span-2">Match</div>
        <div className="col-span-3">Deadline</div>
      </div>

      <div className="space-y-3">
        {scoredPrograms.map((p) => {
          const deadlineBadge = getDeadlineBadge(p.deadline);
          const sourceBadge = getSourceBadge(p.provider);
          const score = Math.round(p.score);

          // Color coding for match score
          const scoreColor = score >= 70 ? 'text-[#3e7339]' : score >= 40 ? 'text-yellow-600' : 'text-gray-400';
          const barColor = score >= 70 ? 'bg-[#3e7339]' : score >= 40 ? 'bg-yellow-500' : 'bg-gray-300';

          return (
            <Link
              key={p.id}
              href={`/programme/${p.id}`}
              className="block bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-[#3e7339]/20 transition"
            >
              {/* Mobile layout */}
              <div className="md:hidden">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${sourceBadge.color}`}>{sourceBadge.label}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{p.country}</span>
                  <span className="text-xs px-2 py-0.5 bg-[#3e7339]/10 text-[#3e7339] rounded">{p.category}</span>
                </div>
                <h2 className="font-bold text-[#1F2933]">{p.title}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${scoreColor}`}>{score}%</span>
                  </div>
                  {deadlineBadge && (
                    <span className={`text-xs px-2 py-1 rounded font-medium ${deadlineBadge.color}`}>
                      ⏰ {deadlineBadge.label}
                    </span>
                  )}
                  {p.max_funding && (
                    <span className="text-sm font-bold text-[#3e7339]">{formatCurrency(p.max_funding)}</span>
                  )}
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-[#3e7339]/10 text-[#3e7339] rounded">{p.category}</span>
                  </div>
                  <h2 className="font-bold text-[#1F2933]">{p.title}</h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{p.description}</p>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-1 rounded ${sourceBadge.color}`}>{sourceBadge.label}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
                    </div>
                    <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-between">
                  {deadlineBadge ? (
                    <span className={`text-xs px-2 py-1 rounded font-medium ${deadlineBadge.color}`}>
                      ⏰ {deadlineBadge.label}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                  {p.max_funding && (
                    <span className="text-sm font-bold text-[#3e7339]">{formatCurrency(p.max_funding)}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

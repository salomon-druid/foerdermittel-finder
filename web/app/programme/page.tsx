import Link from 'next/link';
import { supabase, FundingProgram } from '@/src/lib/supabase';

async function getPrograms(): Promise<FundingProgram[]> {
  const { data } = await supabase
    .from('funding_programs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function ProgramsPage() {
  const programs = await getPrograms();

  const formatCurrency = (val: number | null) => {
    if (!val) return null;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1F2933] mb-2">Förderprogramme</h1>
      <p className="text-gray-500 mb-8">{programs.length} aktive Programme</p>

      <div className="space-y-4">
        {programs.map((p) => (
          <Link
            key={p.id}
            href={`/programme/${p.id}`}
            className="block bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-[#3e7339]/20 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{p.provider}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{p.country}</span>
                  <span className="text-xs px-2 py-0.5 bg-[#3e7339]/10 text-[#3e7339] rounded">{p.category}</span>
                </div>
                <h2 className="font-bold text-[#1F2933] mt-2">{p.title}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
              </div>
              {p.max_funding && (
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-[#3e7339]">{formatCurrency(p.max_funding)}</p>
                  <p className="text-xs text-gray-400">max. Förderung</p>
                </div>
              )}
            </div>
            {p.deadline && (
              <p className="text-xs text-red-500 mt-2">⏰ Deadline: {p.deadline}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

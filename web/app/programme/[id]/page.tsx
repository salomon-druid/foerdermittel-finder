import { supabase, FundingProgram } from '@/src/lib/supabase';
import Link from 'next/link';

export default async function ProgramDetail({ params }: { params: { id: string } }) {
  const { data } = await supabase
    .from('funding_programs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!data) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-[#1F2933]">Programm nicht gefunden</h1>
      <Link href="/programme" className="text-[#3e7339] mt-4 inline-block">← Zurück zur Übersicht</Link>
    </div>;
  }

  const p = data as FundingProgram;
  const formatCurrency = (val: number | null) => {
    if (!val) return null;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/programme" className="text-[#3e7339] text-sm hover:underline mb-4 inline-block">← Zurück</Link>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{p.provider}</span>
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{p.country}</span>
        <span className="text-xs px-2 py-0.5 bg-[#3e7339]/10 text-[#3e7339] rounded">{p.category}</span>
      </div>

      <h1 className="text-3xl font-bold text-[#1F2933] mb-4">{p.title}</h1>
      <p className="text-lg text-gray-600 mb-8">{p.description}</p>

      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <h2 className="font-bold text-[#1F2933] mb-4">Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-400">Anbieter</dt>
            <dd className="font-medium text-[#1F2933]">{p.provider}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Land</dt>
            <dd className="font-medium text-[#1F2933]">{p.country}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Kategorie</dt>
            <dd className="font-medium text-[#1F2933]">{p.category}</dd>
          </div>
          {p.max_funding && (
            <div>
              <dt className="text-gray-400">Max. Förderung</dt>
              <dd className="font-bold text-[#3e7339]">{formatCurrency(p.max_funding)}</dd>
            </div>
          )}
          {p.deadline && (
            <div>
              <dt className="text-gray-400">Deadline</dt>
              <dd className="font-medium text-red-500">{p.deadline}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-400">Status</dt>
            <dd className={`font-medium ${p.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
              {p.status === 'active' ? 'Aktiv' : p.status}
            </dd>
          </div>
        </dl>
      </div>

      {p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-[#3e7339] text-white font-semibold rounded-lg hover:bg-[#356431] transition"
        >
          Zum Förderprogramm →
        </a>
      )}
    </div>
  );
}
